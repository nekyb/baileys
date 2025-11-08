"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoblendStorage = void 0;
const bsonlite_1 = __importDefault(require("@imjxsx/bsonlite"));
class SoblendStorage {
    db;
    dbPath;
    encrypted;
    password;
    constructor(dbPath = './soblend_data', encrypted = true, password) {
        this.dbPath = dbPath;
        this.encrypted = encrypted;
        this.password = password || 'Soblend@Baileys2025!';
        this.db = new bsonlite_1.default(this.dbPath, undefined, this.encrypted, this.password);
    }
    async initialize() {
        await this.db.load();
        if (!this.db.has('users')) {
            this.db.set('users', {});
        }
        if (!this.db.has('chats')) {
            this.db.set('chats', {});
        }
        if (!this.db.has('groups')) {
            this.db.set('groups', {});
        }
        if (!this.db.has('config')) {
            this.db.set('config', this.getDefaultConfig());
        }
        await this.db.save();
    }
    getDefaultConfig() {
        return {
            botName: 'Soblend Bot',
            prefix: '!',
            ownerJid: '',
            autoRead: false,
            autoTyping: true,
            welcomeMessage: '¡Bienvenido {user} al grupo {group}!',
            goodbyeMessage: 'Adiós {user}, te extrañaremos.',
            antiLink: false,
            antiSpam: true,
        };
    }
    async saveUser(userData) {
        this.db.set(`users.${userData.jid}`, userData);
        await this.db.save();
    }
    getUser(jid) {
        return this.db.get(`users.${jid}`) || null;
    }
    async getAllUsers() {
        return this.db.get('users') || {};
    }
    async updateUser(jid, updates) {
        const user = this.getUser(jid);
        if (user) {
            this.db.set(`users.${jid}`, { ...user, ...updates });
            await this.db.save();
        }
    }
    async saveChat(chatData) {
        this.db.set(`chats.${chatData.jid}`, chatData);
        await this.db.save();
    }
    getChat(jid) {
        return this.db.get(`chats.${jid}`) || null;
    }
    async getAllChats() {
        return this.db.get('chats') || {};
    }
    async saveGroup(groupData) {
        this.db.set(`groups.${groupData.jid}`, groupData);
        await this.db.save();
    }
    getGroup(jid) {
        return this.db.get(`groups.${jid}`) || null;
    }
    async getAllGroups() {
        return this.db.get('groups') || {};
    }
    async updateGroup(jid, updates) {
        const group = this.getGroup(jid);
        if (group) {
            this.db.set(`groups.${jid}`, { ...group, ...updates });
            await this.db.save();
        }
    }
    getConfig() {
        return this.db.get('config') || this.getDefaultConfig();
    }
    async updateConfig(updates) {
        const config = this.getConfig();
        this.db.set('config', { ...config, ...updates });
        await this.db.save();
    }
    async setConfigValue(key, value) {
        this.db.set(`config.${key}`, value);
        await this.db.save();
    }
    getConfigValue(key) {
        return this.db.get(`config.${key}`);
    }
    async addMessageToChat(jid, message) {
        const chat = this.getChat(jid) || {
            jid,
            messages: [],
            unreadCount: 0,
            isPinned: false,
            isMuted: false,
        };
        chat.messages.push(message);
        chat.lastMessage = message;
        if (chat.messages.length > 100) {
            chat.messages = chat.messages.slice(-100);
        }
        await this.saveChat(chat);
    }
    async banUser(jid) {
        await this.updateUser(jid, { isBanned: true });
    }
    async unbanUser(jid) {
        await this.updateUser(jid, { isBanned: false });
    }
    async blockUser(jid) {
        await this.updateUser(jid, { isBlocked: true });
    }
    async unblockUser(jid) {
        await this.updateUser(jid, { isBlocked: false });
    }
    async incrementUserLevel(jid, points = 10) {
        const user = this.getUser(jid);
        if (user) {
            const newPoints = (user.points || 0) + points;
            const newLevel = Math.floor(newPoints / 100);
            await this.updateUser(jid, { points: newPoints, level: newLevel });
        }
    }
    async getTopUsers(limit = 10) {
        const users = await this.getAllUsers();
        return Object.values(users)
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    }
    async backup(backupPath) {
        const allData = {
            users: await this.getAllUsers(),
            chats: await this.getAllChats(),
            groups: await this.getAllGroups(),
            config: this.getConfig(),
        };
        const backupDb = new bsonlite_1.default(backupPath, undefined, true, this.password);
        await backupDb.load();
        backupDb.set('backup', allData);
        backupDb.set('timestamp', Date.now());
        await backupDb.save();
    }
    async clearAllData() {
        this.db.set('users', {});
        this.db.set('chats', {});
        this.db.set('groups', {});
        await this.db.save();
    }
}
exports.SoblendStorage = SoblendStorage;
