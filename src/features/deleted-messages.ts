
import { WASocket, proto, WAMessageKey } from '@whiskeysockets/baileys';
import { logger } from '../utils/logger';

export class DeletedMessageCapture {
  private messageCache: Map<string, proto.IWebMessageInfo> = new Map();
  private deletedMessages: proto.IWebMessageInfo[] = [];

  constructor(private socket: WASocket) {
    this.setupListeners();
  }

  private setupListeners(): void {
    this.socket.ev.on('messages.upsert', ({ messages }) => {
      messages.forEach(msg => {
        if (msg.key.id) {
          this.messageCache.set(msg.key.id, msg);
        }
      });
    });

    this.socket.ev.on('messages.delete', (deleteInfo) => {
      // El evento puede tener dos formas: { keys: WAMessageKey[] } o { jid: string; all: true }
      if ('keys' in deleteInfo) {
        deleteInfo.keys.forEach((key: WAMessageKey) => {
          if (key.id && this.messageCache.has(key.id)) {
            const deletedMsg = this.messageCache.get(key.id)!;
            this.deletedMessages.push(deletedMsg);
            logger.warning(`🗑️ Mensaje eliminado capturado de ${deletedMsg.key.remoteJid}`);
          }
        });
      } else if ('all' in deleteInfo && deleteInfo.all) {
        // Se eliminaron todos los mensajes del chat
        logger.warning(`🗑️ Todos los mensajes eliminados en ${deleteInfo.jid}`);
      }
    });
  }

  getDeletedMessages(): proto.IWebMessageInfo[] {
    return this.deletedMessages;
  }

  async notifyDeletedMessage(jid: string, originalMsg: proto.IWebMessageInfo): Promise<void> {
    const text = originalMsg.message?.conversation || 
                 originalMsg.message?.extendedTextMessage?.text || 
                 '[Media]';
    
    // Convertir messageTimestamp a número
    const timestamp = typeof originalMsg.messageTimestamp === 'number' 
      ? originalMsg.messageTimestamp 
      : (originalMsg.messageTimestamp as any)?.toNumber?.() || Date.now() / 1000;
    
    await this.socket.sendMessage(jid, {
      text: `🔴 *MENSAJE ELIMINADO DETECTADO*\n\n` +
            `👤 Remitente: ${originalMsg.pushName || 'Desconocido'}\n` +
            `📝 Contenido: ${text}\n` +
            `⏰ Hora: ${new Date(timestamp * 1000).toLocaleString()}`,
    });
  }

  getStats() {
    return {
      totalDeleted: this.deletedMessages.length,
      cacheSize: this.messageCache.size,
    };
  }

  clearCache(): void {
    this.messageCache.clear();
  }

  clearDeletedMessages(): void {
    this.deletedMessages = [];
  }
}
