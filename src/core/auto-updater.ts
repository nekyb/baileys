
import { SoblendSocket } from '../types';
import { proto, generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes: string;
  publishedAt: string;
  downloadUrl: string;
}

export class AutoUpdater {
  private packageName: string = '@soblend/baileys';
  private currentVersion: string;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastCheckTime: number = 0;

  constructor(currentVersion?: string) {
    this.currentVersion = currentVersion || this.getPackageVersion();
  }

  private getPackageVersion(): string {
    try {
      const pkg = require('../../package.json');
      return pkg.version;
    } catch {
      return '1.0.0';
    }
  }

  async checkForUpdates(): Promise<UpdateInfo> {
    try {
      const npmResponse = await fetch(
        `https://registry.npmjs.org/${this.packageName}/latest`
      );
      
      if (!npmResponse.ok) {
        throw new Error('Failed to fetch NPM registry');
      }

      const npmData = await npmResponse.json() as any;
      const latestVersion = npmData.version;
      const hasUpdate = this.compareVersions(this.currentVersion, latestVersion) < 0;

      const githubResponse = await fetch(
        'https://api.github.com/repos/soblend/baileys/releases/latest'
      );

      let releaseNotes = 'No release notes available';
      let publishedAt = new Date().toISOString();

      if (githubResponse.ok) {
        const githubData = await githubResponse.json() as any;
        releaseNotes = githubData.body || releaseNotes;
        publishedAt = githubData.published_at;
      }

      this.lastCheckTime = Date.now();

      return {
        currentVersion: this.currentVersion,
        latestVersion,
        hasUpdate,
        releaseNotes,
        publishedAt,
        downloadUrl: `https://www.npmjs.com/package/${this.packageName}`,
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return {
        currentVersion: this.currentVersion,
        latestVersion: this.currentVersion,
        hasUpdate: false,
        releaseNotes: 'Error checking for updates',
        publishedAt: new Date().toISOString(),
        downloadUrl: '',
      };
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }

  async sendUpdateNotification(
    socket: SoblendSocket,
    jid: string,
    updateInfo: UpdateInfo
  ): Promise<void> {
    if (!updateInfo.hasUpdate) return;

    const message = `🚀 *Nueva actualización disponible*\n\n` +
      `📦 Versión actual: *${updateInfo.currentVersion}*\n` +
      `✨ Nueva versión: *${updateInfo.latestVersion}*\n\n` +
      `📝 *Cambios:*\n${updateInfo.releaseNotes.substring(0, 500)}...\n\n` +
      `🔗 Más información: ${updateInfo.downloadUrl}`;

    const buttons = [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '✅ Actualizar ahora',
          id: 'update_now',
        }),
      },
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '📋 Ver cambios completos',
          id: 'view_changelog',
        }),
      },
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '⏭️ Recordar más tarde',
          id: 'remind_later',
        }),
      },
    ];

    const interactiveMessage = {
      body: proto.Message.InteractiveMessage.Body.create({
        text: message,
      }),
      footer: proto.Message.InteractiveMessage.Footer.create({
        text: '⚡ @soblend/baileys - Siempre actualizado',
      }),
      header: proto.Message.InteractiveMessage.Header.create({
        title: '🔔 Actualización Disponible',
        subtitle: '',
        hasMediaAttachment: false,
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: buttons,
      }),
    };

    const msg = generateWAMessageFromContent(
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

    await socket.relayMessage(jid, msg.message!, {
      messageId: msg.key.id!,
    });
  }

  startAutoCheck(
    socket: SoblendSocket,
    ownerJid: string,
    intervalHours: number = 24
  ): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    const intervalMs = intervalHours * 60 * 60 * 1000;

    this.checkInterval = setInterval(async () => {
      const updateInfo = await this.checkForUpdates();
      if (updateInfo.hasUpdate) {
        await this.sendUpdateNotification(socket, ownerJid, updateInfo);
      }
    }, intervalMs);

    setTimeout(async () => {
      const updateInfo = await this.checkForUpdates();
      if (updateInfo.hasUpdate) {
        await this.sendUpdateNotification(socket, ownerJid, updateInfo);
      }
    }, 5000);
  }

  stopAutoCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async performUpdate(): Promise<{ success: boolean; message: string }> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      console.log('🔄 Updating @soblend/baileys...');
      
      const { stdout, stderr } = await execAsync(
        `npm install ${this.packageName}@latest --save`
      );

      if (stderr && !stderr.includes('npm WARN')) {
        throw new Error(stderr);
      }

      return {
        success: true,
        message: '✅ Actualización completada. Reinicia la aplicación para aplicar los cambios.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Error al actualizar: ${error.message}`,
      };
    }
  }
}
