"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCapture = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
class StatusCapture {
    socket;
    capturedStatuses;
    onStatusCallback;
    constructor(socket) {
        this.socket = socket;
        this.capturedStatuses = new Map();
        this.setupStatusListener();
    }
    setupStatusListener() {
        this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
            for (const msg of messages) {
                if (msg.key.remoteJid === 'status@broadcast') {
                    await this.handleStatus(msg);
                }
            }
        });
    }
    async handleStatus(msg) {
        try {
            const from = msg.key.participant || '';
            const statusMessage = {
                id: msg.key.id || '',
                from,
                timestamp: msg.messageTimestamp ? msg.messageTimestamp * 1000 : Date.now(),
                type: 'text',
            };
            if (msg.message?.imageMessage) {
                statusMessage.type = 'image';
                statusMessage.caption = msg.message.imageMessage.caption;
                try {
                    const buffer = await (0, baileys_1.downloadMediaMessage)(msg, 'buffer', {});
                    statusMessage.mediaBuffer = buffer;
                }
                catch (error) {
                    console.error('Error downloading status image:', error);
                }
            }
            else if (msg.message?.videoMessage) {
                statusMessage.type = 'video';
                statusMessage.caption = msg.message.videoMessage.caption;
                try {
                    const buffer = await (0, baileys_1.downloadMediaMessage)(msg, 'buffer', {});
                    statusMessage.mediaBuffer = buffer;
                }
                catch (error) {
                    console.error('Error downloading status video:', error);
                }
            }
            else if (msg.message?.conversation) {
                statusMessage.content = msg.message.conversation;
            }
            else if (msg.message?.extendedTextMessage) {
                statusMessage.content = msg.message.extendedTextMessage.text;
            }
            if (!this.capturedStatuses.has(from)) {
                this.capturedStatuses.set(from, []);
            }
            this.capturedStatuses.get(from).push(statusMessage);
            const userStatuses = this.capturedStatuses.get(from);
            if (userStatuses.length > 50) {
                this.capturedStatuses.set(from, userStatuses.slice(-50));
            }
            console.log(`📸 Status captured from ${from}: ${statusMessage.type}`);
            if (this.onStatusCallback) {
                this.onStatusCallback(statusMessage);
            }
        }
        catch (error) {
            console.error('Error handling status:', error);
        }
    }
    onStatus(callback) {
        this.onStatusCallback = callback;
    }
    getStatusesFrom(jid) {
        return this.capturedStatuses.get(jid) || [];
    }
    getAllStatuses() {
        return this.capturedStatuses;
    }
    clearStatuses(jid) {
        if (jid) {
            this.capturedStatuses.delete(jid);
        }
        else {
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
    getTypeStats() {
        const stats = { text: 0, image: 0, video: 0 };
        for (const statuses of this.capturedStatuses.values()) {
            for (const status of statuses) {
                stats[status.type]++;
            }
        }
        return stats;
    }
}
exports.StatusCapture = StatusCapture;
