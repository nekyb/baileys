
import { SoblendSocket } from '../types';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export interface StatusMessage {
  id: string;
  from: string;
  timestamp: number;
  type: 'text' | 'image' | 'video';
  content?: string;
  mediaUrl?: string;
  mediaBuffer?: Buffer;
  caption?: string;
}

export class StatusCapture {
  private socket: SoblendSocket;
  private capturedStatuses: Map<string, StatusMessage[]>;
  private onStatusCallback?: (status: StatusMessage) => void;

  constructor(socket: SoblendSocket) {
    this.socket = socket;
    this.capturedStatuses = new Map();
    this.setupStatusListener();
  }

  private setupStatusListener(): void {
    this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
      for (const msg of messages) {
        // Detectar si es un status/estado
        if (msg.key.remoteJid === 'status@broadcast') {
          await this.handleStatus(msg);
        }
      }
    });
  }

  private async handleStatus(msg: any): Promise<void> {
    try {
      const from = msg.key.participant || '';
      const statusMessage: StatusMessage = {
        id: msg.key.id || '',
        from,
        timestamp: msg.messageTimestamp ? msg.messageTimestamp * 1000 : Date.now(),
        type: 'text',
      };

      // Detectar tipo de mensaje
      if (msg.message?.imageMessage) {
        statusMessage.type = 'image';
        statusMessage.caption = msg.message.imageMessage.caption;
        try {
          const buffer = await downloadMediaMessage(msg, 'buffer', {});
          statusMessage.mediaBuffer = buffer as Buffer;
        } catch (error) {
          console.error('Error downloading status image:', error);
        }
      } else if (msg.message?.videoMessage) {
        statusMessage.type = 'video';
        statusMessage.caption = msg.message.videoMessage.caption;
        try {
          const buffer = await downloadMediaMessage(msg, 'buffer', {});
          statusMessage.mediaBuffer = buffer as Buffer;
        } catch (error) {
          console.error('Error downloading status video:', error);
        }
      } else if (msg.message?.conversation) {
        statusMessage.content = msg.message.conversation;
      } else if (msg.message?.extendedTextMessage) {
        statusMessage.content = msg.message.extendedTextMessage.text;
      }

      // Guardar status
      if (!this.capturedStatuses.has(from)) {
        this.capturedStatuses.set(from, []);
      }
      this.capturedStatuses.get(from)!.push(statusMessage);

      // Limitar a últimos 50 estados por usuario
      const userStatuses = this.capturedStatuses.get(from)!;
      if (userStatuses.length > 50) {
        this.capturedStatuses.set(from, userStatuses.slice(-50));
      }

      console.log(`📸 Status captured from ${from}: ${statusMessage.type}`);

      // Callback si está definido
      if (this.onStatusCallback) {
        this.onStatusCallback(statusMessage);
      }
    } catch (error) {
      console.error('Error handling status:', error);
    }
  }

  onStatus(callback: (status: StatusMessage) => void): void {
    this.onStatusCallback = callback;
  }

  getStatusesFrom(jid: string): StatusMessage[] {
    return this.capturedStatuses.get(jid) || [];
  }

  getAllStatuses(): Map<string, StatusMessage[]> {
    return this.capturedStatuses;
  }

  clearStatuses(jid?: string): void {
    if (jid) {
      this.capturedStatuses.delete(jid);
    } else {
      this.capturedStatuses.clear();
    }
  }

  getStats() {
    let totalStatuses = 0;
    for (const statuses of this.capturedStatuses.values()) {
      totalStatuses += statuses.length;
    }

    return {
      totalUsers: this.capturedStatuses.size,
      totalStatuses,
      byType: this.getTypeStats(),
    };
  }

  private getTypeStats() {
    const stats = { text: 0, image: 0, video: 0 };
    for (const statuses of this.capturedStatuses.values()) {
      for (const status of statuses) {
        stats[status.type]++;
      }
    }
    return stats;
  }
}
