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
import P from 'pino';
import { SmartCache } from '../utils/cache';
import { MediaCompressor } from '../utils/compression';
import { AntiSpam } from '../admin/anti-spam';
import { RateLimiter } from '../admin/rate-limiter';
import { PluginManager } from '../plugins/plugin-manager';
import { TaskQueue, Throttler } from './task-queue';
import { SoblendConfig, SoblendSocket, InteractiveMessage, AdminStats } from '../types';

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
  private reconnectAttempts: number = 0;
  private startTime: number = Date.now();
  private messageCount: number = 0;

  constructor(config: Partial<SoblendConfig> = {}) {
    this.config = {
      printQRInTerminal: config.printQRInTerminal ?? true,
      autoReconnect: config.autoReconnect ?? true,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      reconnectDelay: config.reconnectDelay ?? 3000,
      enableCache: config.enableCache ?? true,
      cacheExpiry: config.cacheExpiry ?? 300000,
      enableAntiSpam: config.enableAntiSpam ?? true,
      spamThreshold: config.spamThreshold ?? 5,
      spamTimeWindow: config.spamTimeWindow ?? 10000,
      enableRateLimit: config.enableRateLimit ?? true,
      rateLimitMax: config.rateLimitMax ?? 30,
      rateLimitWindow: config.rateLimitWindow ?? 60000,
      enableCompression: config.enableCompression ?? true,
      compressionQuality: config.compressionQuality ?? 80,
      enablePlugins: config.enablePlugins ?? true,
      logLevel: config.logLevel ?? 'info',
    };

    this.cache = new SmartCache(this.config.cacheExpiry);
    this.compressor = new MediaCompressor(this.config.compressionQuality);
    this.antiSpam = new AntiSpam(this.config.spamThreshold, this.config.spamTimeWindow);
    this.rateLimiter = new RateLimiter(this.config.rateLimitMax, this.config.rateLimitWindow);
    this.pluginManager = new PluginManager();
    this.taskQueue = new TaskQueue(3);
    this.throttler = new Throttler(1000);
  }

  async connect(authPath: string = 'auth_info'): Promise<SoblendSocket> {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const logger = P({ level: this.config.logLevel });

    this.socket = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: this.config.printQRInTerminal,
      logger,
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

    this.socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect && this.config.autoReconnect) {
          if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
            setTimeout(() => this.connect(authPath), this.config.reconnectDelay);
          } else {
            console.error('Max reconnection attempts reached');
          }
        }
      } else if (connection === 'open') {
        console.log('✅ Connected successfully to WhatsApp!');
        this.reconnectAttempts = 0;
        if (this.config.enablePlugins) {
          await this.pluginManager.initializeAll(this.getEnhancedSocket());
        }
      }
    });

    this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        this.messageCount++;

        const sender = msg.key.remoteJid || '';

        if (this.config.enableAntiSpam && this.antiSpam.checkSpam(sender)) {
          console.log(`🚫 Spam detected from ${sender}`);
          continue;
        }

        if (this.config.enableRateLimit && !this.rateLimiter.checkLimit(sender)) {
          console.log(`⏱️ Rate limit exceeded for ${sender}`);
          continue;
        }

        if (this.config.enableCache) {
          this.cache.set(`msg:${msg.key.id}`, msg.message);
        }

        if (this.config.enablePlugins) {
          await this.pluginManager.onMessage(msg);

          const text = msg.message.conversation || 
                       msg.message.extendedTextMessage?.text || '';
          
          if (text.startsWith('!')) {
            const [command, ...args] = text.slice(1).split(' ');
            await this.pluginManager.onCommand(command, args, msg);
          }
        }
      }
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

      const buttonMessage: any = {
        text: data.text || '',
        footer: data.footer || '',
        buttons: data.buttons.map((btn) => ({
          buttonId: btn.buttonId,
          buttonText: { displayText: btn.buttonText.displayText },
          type: 1,
        })),
        headerType: data.headerType || 1,
      };

      if (data.image) {
        const imageBuffer = typeof data.image === 'string' 
          ? await this.compressor.compressImage(data.image) 
          : data.image;
        buttonMessage.image = imageBuffer;
        buttonMessage.headerType = 4;
      }

      if (data.video) {
        buttonMessage.video = data.video;
        buttonMessage.headerType = 5;
      }

      const message = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: data.text || '',
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: data.footer || '',
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                title: '',
                subtitle: '',
                hasMediaAttachment: false,
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: data.buttons.map((btn) => ({
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: btn.buttonText.displayText,
                    id: btn.buttonId,
                  }),
                })),
              }),
            }),
          },
        },
      }, { userJid: jid });

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

      const message = generateWAMessageFromContent(jid, {
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
      }, { userJid: jid });

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
}
