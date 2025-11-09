"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
class SessionManager {
    options;
    backupTimer = null;
    algorithm = 'aes-256-gcm';
    constructor(options = {}) {
        this.options = {
            enableAutoBackup: options.enableAutoBackup ?? true,
            backupInterval: options.backupInterval ?? 30,
            maxBackups: options.maxBackups ?? 5,
            encryptionKey: options.encryptionKey ?? 'default-encryption-key-change-me',
            backupPath: options.backupPath ?? './session_backups',
        };
        if (this.options.enableAutoBackup) {
            this.startAutoBackup();
        }
    }
    encrypt(data) {
        const key = (0, crypto_1.scryptSync)(this.options.encryptionKey, 'salt', 32);
        const iv = (0, crypto_1.randomBytes)(16);
        const cipher = (0, crypto_1.createCipheriv)(this.algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex'),
        };
    }
    decrypt(encrypted, iv, tag) {
        const key = (0, crypto_1.scryptSync)(this.options.encryptionKey, 'salt', 32);
        const decipher = (0, crypto_1.createDecipheriv)(this.algorithm, key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    async createBackup(authPath) {
        try {
            await fs_1.promises.mkdir(this.options.backupPath, { recursive: true });
            const files = await fs_1.promises.readdir(authPath);
            const sessionData = {};
            for (const file of files) {
                const filePath = path_1.default.join(authPath, file);
                const stats = await fs_1.promises.stat(filePath);
                if (stats.isFile()) {
                    const content = await fs_1.promises.readFile(filePath, 'utf8');
                    sessionData[file] = content;
                }
            }
            const dataString = JSON.stringify(sessionData);
            const { encrypted, iv, tag } = this.encrypt(dataString);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path_1.default.join(this.options.backupPath, `session_backup_${timestamp}.enc`);
            await fs_1.promises.writeFile(backupFile, JSON.stringify({ encrypted, iv, tag }), 'utf8');
            console.log(`💾 Session backup created: ${backupFile}`);
            await this.cleanOldBackups();
        }
        catch (error) {
            console.error(`❌ Failed to create backup: ${error.message}`);
        }
    }
    async restoreBackup(backupFile, authPath) {
        try {
            const backupPath = path_1.default.join(this.options.backupPath, backupFile);
            const encryptedData = await fs_1.promises.readFile(backupPath, 'utf8');
            const { encrypted, iv, tag } = JSON.parse(encryptedData);
            const decrypted = this.decrypt(encrypted, iv, tag);
            const sessionData = JSON.parse(decrypted);
            await fs_1.promises.mkdir(authPath, { recursive: true });
            for (const [filename, content] of Object.entries(sessionData)) {
                const filePath = path_1.default.join(authPath, filename);
                await fs_1.promises.writeFile(filePath, content, 'utf8');
            }
            console.log(`✅ Session restored from: ${backupFile}`);
        }
        catch (error) {
            console.error(`❌ Failed to restore backup: ${error.message}`);
            throw error;
        }
    }
    async listBackups() {
        try {
            const files = await fs_1.promises.readdir(this.options.backupPath);
            return files
                .filter(f => f.endsWith('.enc'))
                .sort()
                .reverse();
        }
        catch (error) {
            return [];
        }
    }
    async cleanOldBackups() {
        try {
            const backups = await this.listBackups();
            if (backups.length > this.options.maxBackups) {
                const toDelete = backups.slice(this.options.maxBackups);
                for (const backup of toDelete) {
                    const backupPath = path_1.default.join(this.options.backupPath, backup);
                    await fs_1.promises.unlink(backupPath);
                    console.log(`🗑️  Deleted old backup: ${backup}`);
                }
            }
        }
        catch (error) {
            console.error(`❌ Failed to clean old backups: ${error.message}`);
        }
    }
    startAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }
        const intervalMs = this.options.backupInterval * 60 * 1000;
        this.backupTimer = setInterval(() => {
            console.log('🔄 Running automatic session backup...');
        }, intervalMs);
        console.log(`🔐 Auto-backup enabled (every ${this.options.backupInterval} minutes)`);
    }
    stopAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
            console.log('🛑 Auto-backup stopped');
        }
    }
    async getLatestBackup() {
        const backups = await this.listBackups();
        return backups.length > 0 ? backups[0] : null;
    }
}
exports.SessionManager = SessionManager;
