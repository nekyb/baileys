"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoUpdater = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
class AutoUpdater {
    packageName = '@soblend/baileys';
    currentVersion;
    checkInterval = null;
    lastCheckTime = 0;
    constructor(currentVersion) {
        this.currentVersion = currentVersion || this.getPackageVersion();
    }
    getPackageVersion() {
        try {
            const pkg = require('../../package.json');
            return pkg.version;
        }
        catch {
            return '1.0.0';
        }
    }
    async checkForUpdates() {
        try {
            const npmResponse = await fetch(`https://registry.npmjs.org/${this.packageName}/latest`);
            if (!npmResponse.ok) {
                throw new Error('Failed to fetch NPM registry');
            }
            const npmData = await npmResponse.json();
            const latestVersion = npmData.version;
            const hasUpdate = this.compareVersions(this.currentVersion, latestVersion) < 0;
            const githubResponse = await fetch('https://api.github.com/repos/soblend/baileys/releases/latest');
            let releaseNotes = 'No release notes available';
            let publishedAt = new Date().toISOString();
            if (githubResponse.ok) {
                const githubData = await githubResponse.json();
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
        }
        catch (error) {
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
    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2)
                return 1;
            if (p1 < p2)
                return -1;
        }
        return 0;
    }
    async sendUpdateNotification(socket, jid, updateInfo) {
        if (!updateInfo.hasUpdate)
            return;
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
            body: baileys_1.proto.Message.InteractiveMessage.Body.create({
                text: message,
            }),
            footer: baileys_1.proto.Message.InteractiveMessage.Footer.create({
                text: '⚡ @soblend/baileys - Siempre actualizado',
            }),
            header: baileys_1.proto.Message.InteractiveMessage.Header.create({
                title: '🔔 Actualización Disponible',
                subtitle: '',
                hasMediaAttachment: false,
            }),
            nativeFlowMessage: baileys_1.proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: buttons,
            }),
        };
        const msg = (0, baileys_1.generateWAMessageFromContent)(jid, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                    },
                    interactiveMessage: baileys_1.proto.Message.InteractiveMessage.create(interactiveMessage),
                },
            },
        }, { userJid: jid });
        await socket.relayMessage(jid, msg.message, {
            messageId: msg.key.id,
        });
    }
    startAutoCheck(socket, ownerJid, intervalHours = 24) {
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
    stopAutoCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    async performUpdate() {
        try {
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);
            console.log('🔄 Updating @soblend/baileys...');
            const { stdout, stderr } = await execAsync(`npm install ${this.packageName}@latest --save`);
            if (stderr && !stderr.includes('npm WARN')) {
                throw new Error(stderr);
            }
            return {
                success: true,
                message: '✅ Actualización completada. Reinicia la aplicación para aplicar los cambios.',
            };
        }
        catch (error) {
            return {
                success: false,
                message: `❌ Error al actualizar: ${error.message}`,
            };
        }
    }
}
exports.AutoUpdater = AutoUpdater;
