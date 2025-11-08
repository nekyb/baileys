"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletedMessageCapture = void 0;
const logger_1 = require("../utils/logger");
class DeletedMessageCapture {
    socket;
    messageCache = new Map();
    deletedMessages = [];
    constructor(socket) {
        this.socket = socket;
        this.setupListeners();
    }
    setupListeners() {
        this.socket.ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (msg.key.id) {
                    this.messageCache.set(msg.key.id, msg);
                }
            });
        });
        this.socket.ev.on('messages.delete', (deleteInfo) => {
            if ('keys' in deleteInfo) {
                deleteInfo.keys.forEach((key) => {
                    if (key.id && this.messageCache.has(key.id)) {
                        const deletedMsg = this.messageCache.get(key.id);
                        this.deletedMessages.push(deletedMsg);
                        logger_1.logger.warning(`🗑️ Mensaje eliminado capturado de ${deletedMsg.key.remoteJid}`);
                    }
                });
            }
            else if ('all' in deleteInfo && deleteInfo.all) {
                logger_1.logger.warning(`🗑️ Todos los mensajes eliminados en ${deleteInfo.jid}`);
            }
        });
    }
    getDeletedMessages() {
        return this.deletedMessages;
    }
    async notifyDeletedMessage(jid, originalMsg) {
        const text = originalMsg.message?.conversation ||
            originalMsg.message?.extendedTextMessage?.text ||
            '[Media]';
        const timestamp = typeof originalMsg.messageTimestamp === 'number'
            ? originalMsg.messageTimestamp
            : originalMsg.messageTimestamp?.toNumber?.() || Date.now() / 1000;
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
    clearCache() {
        this.messageCache.clear();
    }
    clearDeletedMessages() {
        this.deletedMessages = [];
    }
}
exports.DeletedMessageCapture = DeletedMessageCapture;
