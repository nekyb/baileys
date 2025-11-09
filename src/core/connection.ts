import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  WASocket,
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { Logger } from '@imjxsx/logger';
import { SmartCache } from '../utils/cache';
import { MediaCompressor } from '../utils/compression';
import { AntiSpam } from '../admin/anti-spam';
import { RateLimiter } from '../admin/rate-limiter';
import { PluginManager } from '../plugins/plugin-manager';
import { TaskQueue, Throttler } from './task-queue';
import { SoblendConfig, SoblendSocket, InteractiveMessage, AdminStats } from '../types';
import { PairingCodeManager, PairingCodeOptions } from './pairing-code';
import { SessionManager, SessionBackupOptions } from './session-manager';

export class SoblendBaileys {
  private config: Required<SoblendConfig>;
  private socket: WASocket | null = null;
  private cache: SmartCache;
  private compressor: MediaCompressor;
  private antiSpam: AntiSpam;
  private rateLimiter: RateLimiter;
  private pluginManager: PluginManager;
  private taskQueue: TaskQueue;
  private throttler: Throttler;
  private pairingCodeManager: PairingCodeManager;
  private sessionManager: SessionManager;
  private reconnectAttempts: number = 0;
  private startTime: number = Date.now();
  private messageCount: number = 0;
  private messageBuffer: Map<string, any> = new Map();
  private connectionQuality: number = 100;
  private lastPingTime: number = Date.now();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private memoryMonitorInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<SoblendConfig> = {}) {
    this.config = {
      printQRInTerminal: config.printQRInTerminal ?? true,
      autoReconnect: config.autoReconnect ?? true,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 20,
      reconnectDelay: config.reconnectDelay ?? 1500,
      enableCache: config.enableCache ?? true,
      cacheExpiry: config.cacheExpiry ?? 600000,
      enableAntiSpam: config.enableAntiSpam ?? true,
      spamThreshold: config.spamThreshold ?? 5,
      spamTimeWindow: config.spamTimeWindow ?? 10000,
      enableRateLimit: config.enableRateLimit ?? true,
      rateLimitMax: config.rateLimitMax ?? 50,
      rateLimitWindow: config.rateLimitWindow ?? 60000,
      enableCompression: config.enableCompression ?? true,
      compressionQuality: config.compressionQuality ?? 85,
      enablePlugins: config.enablePlugins ?? true,
      logLevel: config.logLevel ?? 'error',
    };

    this.cache = new SmartCache(this.config.cacheExpiry);
    this.compressor = new MediaCompressor(this.config.compressionQuality);
    this.antiSpam = new AntiSpam(this.config.spamThreshold, this.config.spamTimeWindow);
    this.rateLimiter = new RateLimiter(this.config.rateLimitMax, this.config.rateLimitWindow);
    this.pluginManager = new PluginManager();
    this.taskQueue = new TaskQueue(5);
    this.throttler = new Throttler(500);
    this.pairingCodeManager = new PairingCodeManager();
    
    const sessionBackupOptions: SessionBackupOptions = {
      enableAutoBackup: config.enableSessionBackup ?? true,
      backupInterval: config.sessionBackupInterval ?? 30,
      encryptionKey: config.sessionEncryptionKey,
    };
    this.sessionManager = new SessionManager(sessionBackupOptions);
    
    this.startMemoryMonitor();
  }

  private startMemoryMonitor(): void {
    this.memoryMonitorInterval = setInterval(() => {
      if (this.messageBuffer.size > 1000) {
        const keysToDelete = Array.from(this.messageBuffer.keys()).slice(0, 500);
        keysToDelete.forEach(key => this.messageBuffer.delete(key));
      }
      
      if (global.gc && Math.random() < 0.1) {
        global.gc();
      }
    }, 30000);
  }

  private async optimizedReconnect(authPath: string, reason?: string): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Backoff exponencial más agresivo para reconexión rápida
    let backoffDelay: number;
    
    if (reason === 'connection_lost' || reason === 'timeout') {
      // Reconexión inmediata para pérdida de conexión
      backoffDelay = Math.min(500, this.config.reconnectDelay);
    } else if (reason === 'restart_required') {
      // Delay mínimo para restart requerido
      backoffDelay = Math.min(1000, this.config.reconnectDelay);
    } else {
      // Backoff exponencial para otros casos
      backoffDelay = Math.min(
        this.config.reconnectDelay * Math.pow(1.5, this.reconnectAttempts),
        15000
      );
    }

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect(authPath);
      } catch (error) {
        console.error('Reconnection failed:', error);
        
        // Reintentar con delay incrementado si falla
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          await this.optimizedReconnect(authPath, 'retry');
        }
      }
    }, backoffDelay);
  }

  private startKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }

    this.keepAliveInterval = setInterval(async () => {
      if (this.socket) {
        try {
          const start = Date.now();
          await this.socket.query({ tag: 'iq', attrs: { type: 'get', xmlns: 'w:p' } });
          const latency = Date.now() - start;
          
          this.connectionQuality = Math.max(0, Math.min(100, 100 - latency / 10));
          this.lastPingTime = Date.now();
        } catch (error) {
          this.connectionQuality = Math.max(0, this.connectionQuality - 10);
        }
      }
    }, 25000);
  }

  async connect(authPath: string = 'auth_info'): Promise<SoblendSocket> {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const logger = new Logger({
      name: "WaSocket",
      colorize: true,
      level: "TRACE",
    });

    this.socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger as any),
      },
      printQRInTerminal: this.config.printQRInTerminal,
      logger: logger as any,
      browser: Browsers.ubuntu('Soblend Baileys'),
      getMessage: async (key) => {
        if (this.config.enableCache) {
          const cached = this.cache.get(`msg:${key.id}`);
          if (cached) return cached;
        }
        return { conversation: '' };
      },
    });

    this.socket.ev.on('creds.update', saveCreds);

    // Configurar el manager de códigos de emparejamiento
    this.pairingCodeManager.setSocket(this.socket);

    this.socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr, isNewLogin } = update;

      if (qr && this.config.printQRInTerminal) {
        console.log('📱 Scan QR code to connect');
      }

      if (connection === 'close') {
        if (this.keepAliveInterval) {
          clearInterval(this.keepAliveInterval);
          this.keepAliveInterval = null;
        }

        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const errorMessage = lastDisconnect?.error?.message || '';
        
        // Determinar el tipo de error y la estrategia de reconexión
        let reconnectReason = 'unknown';
        let shouldReconnect = true;

        switch (statusCode) {
          case DisconnectReason.loggedOut:
            shouldReconnect = false;
            console.log('🔌 Logged out - stopping reconnection');
            break;
            
          case DisconnectReason.connectionLost:
            reconnectReason = 'connection_lost';
            console.log('📡 Connection lost - reconnecting instantly...');
            break;
            
          case DisconnectReason.connectionClosed:
            reconnectReason = 'connection_closed';
            console.log('🔄 Connection closed - reconnecting...');
            break;
            
          case DisconnectReason.timedOut:
            reconnectReason = 'timeout';
            console.log('⏱️  Connection timed out - reconnecting instantly...');
            break;
            
          case DisconnectReason.restartRequired:
            reconnectReason = 'restart_required';
            console.log('🔁 Restart required - reconnecting...');
            break;
            
          case DisconnectReason.badSession:
            console.log('⚠️  Bad session - attempting recovery...');
            reconnectReason = 'bad_session';
            break;
            
          case DisconnectReason.connectionReplaced:
            shouldReconnect = false;
            console.log('🔄 Connection replaced by another device');
            break;
            
          default:
            console.log(`⚠️  Unknown disconnect (${statusCode}): ${errorMessage}`);
        }

        if (shouldReconnect && this.config.autoReconnect) {
          if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`⚡ Reconnecting... Attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
            await this.optimizedReconnect(authPath, reconnectReason);
          } else {
            console.error('❌ Max reconnection attempts reached');
          }
        }
      } else if (connection === 'connecting') {
        console.log('🔄 Connecting to WhatsApp...');
      } else if (connection === 'open') {
        console.log('✅ Connected successfully to WhatsApp!');
        
        if (isNewLogin) {
          console.log('🆕 New login detected - session saved');
        }
        
        this.reconnectAttempts = 0;
        this.connectionQuality = 100;
        this.startKeepAlive();
        
        if (this.config.enablePlugins) {
          await this.pluginManager.initializeAll(this.getEnhancedSocket());
        }
      }
    });

    this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
      const processingPromises = messages.map(async (msg) => {
        if (!msg.message || msg.key.fromMe) return;

        const msgId = msg.key.id || '';
        if (this.messageBuffer.has(msgId)) return;

        this.messageBuffer.set(msgId, true);
        this.messageCount++;

        const sender = msg.key.remoteJid || '';

        if (this.config.enableAntiSpam && this.antiSpam.checkSpam(sender)) {
          return;
        }

        if (this.config.enableRateLimit && !this.rateLimiter.checkLimit(sender)) {
          return;
        }

        if (this.config.enableCache) {
          await this.taskQueue.add(
            () => Promise.resolve(this.cache.set(`msg:${msgId}`, msg.message)),
            { priority: 0 }
          );
        }

        if (this.config.enablePlugins) {
          await this.taskQueue.add(
            async () => {
              await this.pluginManager.onMessage(msg);

              const text = msg.message?.conversation || 
                           msg.message?.extendedTextMessage?.text || '';
              
              if (text.startsWith('!')) {
                const [command, ...args] = text.slice(1).split(' ');
                await this.pluginManager.onCommand(command, args, msg);
              }
            },
            { priority: 1 }
          );
        }
      });

      await Promise.allSettled(processingPromises);
    });

    return this.getEnhancedSocket();
  }

  private getEnhancedSocket(): SoblendSocket {
    if (!this.socket) {
      throw new Error('Socket not initialized. Call connect() first.');
    }

    const enhancedSocket = this.socket as SoblendSocket;

    enhancedSocket.sendInteractiveButtons = async (jid: string, data: InteractiveMessage) => {
      if (!data.buttons || data.buttons.length === 0) {
        throw new Error('Buttons are required for interactive button messages');
      }

      const buttons = data.buttons.map((btn) => ({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: btn.buttonText.displayText,
          id: btn.buttonId,
        }),
      }));

      let imageBuffer: Buffer | undefined;
      if (data.image) {
        imageBuffer = typeof data.image === 'string' 
          ? await this.compressor.compressImage(data.image) 
          : data.image;
      }

      const interactiveMessage: any = {
        body: proto.Message.InteractiveMessage.Body.create({
          text: data.text || '',
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: data.footer || '',
        }),
        header: proto.Message.InteractiveMessage.Header.create({
          title: data.title || '',
          subtitle: '',
          hasMediaAttachment: !!imageBuffer,
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: buttons,
        }),
      };

      if (imageBuffer) {
        const mediaData = await prepareWAMessageMedia(
          { image: imageBuffer },
          { upload: this.socket!.waUploadToServer }
        );
        interactiveMessage.header = proto.Message.InteractiveMessage.Header.create({
          title: data.title || '',
          hasMediaAttachment: true,
          imageMessage: mediaData.imageMessage,
        });
      }

      const message = generateWAMessageFromContent(
        jid,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: proto.Message.InteractiveMessage.create(interactiveMessage),
            },
          },
        },
        { userJid: jid }
      );

      return await this.socket!.relayMessage(jid, message.message!, {
        messageId: message.key.id!,
      });
    };

    enhancedSocket.sendInteractiveList = async (jid: string, data: InteractiveMessage) => {
      if (!data.listMessage) {
        throw new Error('List message data is required');
      }

      const list = data.listMessage;
      const sections = list.sections.map((section) => ({
        title: section.title,
        rows: section.rows.map((row) => ({
          header: row.title,
          title: row.title,
          description: row.description || '',
          id: row.rowId,
        })),
      }));

      const message = generateWAMessageFromContent(
        jid,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({
                  text: data.text || list.description || '',
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: data.footer || '',
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                  title: list.title,
                  subtitle: '',
                  hasMediaAttachment: false,
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: [
                    {
                      name: 'single_select',
                      buttonParamsJson: JSON.stringify({
                        title: list.buttonText,
                        sections: sections,
                      }),
                    },
                  ],
                }),
              }),
            },
          },
        },
        { userJid: jid }
      );

      return await this.socket!.relayMessage(jid, message.message!, {
        messageId: message.key.id!,
      });
    };

    enhancedSocket.sendPoll = async (jid: string, question: string, options: string[]) => {
      if (options.length < 2 || options.length > 12) {
        throw new Error('Poll must have between 2 and 12 options');
      }

      return await this.socket!.sendMessage(jid, {
        poll: {
          name: question,
          values: options,
          selectableCount: 1,
        },
      });
    };

    enhancedSocket.getAdminStats = (): AdminStats => {
      const cacheStats = this.cache.getStats();
      return {
        messageCount: this.messageCount,
        blockedSpam: this.antiSpam.getBlockedCount(),
        rateLimitHits: this.rateLimiter.getHits(),
        uptime: Date.now() - this.startTime,
        cacheHits: cacheStats.hits,
        cacheMisses: cacheStats.misses,
      };
    };

    enhancedSocket.enableAntiSpam = (enabled: boolean) => {
      this.config.enableAntiSpam = enabled;
    };

    enhancedSocket.setRateLimit = (max: number, window: number) => {
      this.rateLimiter.setLimits(max, window);
    };

    return enhancedSocket;
  }

  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  getCache(): SmartCache {
    return this.cache;
  }

  getCompressor(): MediaCompressor {
    return this.compressor;
  }

  getTaskQueue(): TaskQueue {
    return this.taskQueue;
  }

  getThrottler(): Throttler {
    return this.throttler;
  }

  getConnectionQuality(): number {
    return this.connectionQuality;
  }

  getLastPingTime(): number {
    return this.lastPingTime;
  }

  /**
   * Solicita un código de emparejamiento de 8 dígitos
   * @param options Opciones para generar el código
   * @returns El código de emparejamiento formateado
   */
  async requestPairingCode(options: PairingCodeOptions): Promise<string> {
    return await this.pairingCodeManager.requestPairingCode(options);
  }

  /**
   * Obtiene el gestor de códigos de emparejamiento
   */
  getPairingCodeManager(): PairingCodeManager {
    return this.pairingCodeManager;
  }

  async cleanup(): Promise<void> {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
    }
    
    this.messageBuffer.clear();
    this.cache.clear();
    
    if (this.socket) {
      this.socket.end(undefined);
    }
  }
}
