"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupAdminManager = exports.AdvancedGroupAdminManager = void 0;
const logger_1 = require("../utils/logger");
class AdvancedGroupAdminManager {
    socket;
    groupCache = new Map();
    mutedUsers = new Map();
    groupRules = new Map();
    welcomeMessages = new Map();
    goodbyeMessages = new Map();
    eventListeners = new Map();
    messageHistory = new Map();
    cacheExpiry = 300000;
    constructor(socket) {
        this.socket = socket;
        this.setupEventListeners();
        this.startCacheCleanup();
    }
    async createGroup(name, participants) {
        try {
            logger_1.logger.info(`Creating group "${name}" with ${participants.length} participants`);
            const result = await this.socket.groupCreate(name, participants);
            this.groupCache.delete(result.id);
            return {
                success: true,
                groupId: result.id,
                data: result,
            };
        }
        catch (error) {
            logger_1.logger.error(`Failed to create group: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async addParticipants(groupId, participants, sendWelcome = true) {
        try {
            logger_1.logger.info(`Adding ${participants.length} participants to ${groupId}`);
            const batchSize = 10;
            const results = [];
            for (let i = 0; i < participants.length; i += batchSize) {
                const batch = participants.slice(i, i + batchSize);
                try {
                    await this.socket.groupParticipantsUpdate(groupId, batch, 'add');
                    batch.forEach(jid => {
                        results.push({ jid, action: 'add', success: true });
                    });
                    if (sendWelcome && this.welcomeMessages.has(groupId)) {
                        await this.sendWelcomeMessages(groupId, batch);
                    }
                    if (i + batchSize < participants.length) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Batch add failed: ${error.message}`);
                    batch.forEach(jid => {
                        results.push({ jid, action: 'add', success: false, error: error.message });
                    });
                }
            }
            this.groupCache.delete(groupId);
            return results;
        }
        catch (error) {
            logger_1.logger.error(`Failed to add participants: ${error.message}`);
            return participants.map(jid => ({
                jid,
                action: 'add',
                success: false,
                error: error.message,
            }));
        }
    }
    async removeParticipants(groupId, participants, reason) {
        try {
            logger_1.logger.info(`Removing ${participants.length} participants from ${groupId}`);
            const batchSize = 10;
            const results = [];
            for (let i = 0; i < participants.length; i += batchSize) {
                const batch = participants.slice(i, i + batchSize);
                try {
                    await this.socket.groupParticipantsUpdate(groupId, batch, 'remove');
                    batch.forEach(jid => {
                        results.push({ jid, action: 'remove', success: true });
                    });
                    if (i + batchSize < participants.length) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Batch remove failed: ${error.message}`);
                    batch.forEach(jid => {
                        results.push({ jid, action: 'remove', success: false, error: error.message });
                    });
                }
            }
            this.groupCache.delete(groupId);
            return results;
        }
        catch (error) {
            logger_1.logger.error(`Failed to remove participants: ${error.message}`);
            return participants.map(jid => ({
                jid,
                action: 'remove',
                success: false,
                error: error.message,
            }));
        }
    }
    async promoteParticipants(groupId, participants) {
        try {
            logger_1.logger.info(`Promoting ${participants.length} participants in ${groupId}`);
            await this.socket.groupParticipantsUpdate(groupId, participants, 'promote');
            this.groupCache.delete(groupId);
            return participants.map(jid => ({
                jid,
                action: 'promote',
                success: true,
            }));
        }
        catch (error) {
            logger_1.logger.error(`Failed to promote participants: ${error.message}`);
            return participants.map(jid => ({
                jid,
                action: 'promote',
                success: false,
                error: error.message,
            }));
        }
    }
    async demoteParticipants(groupId, participants) {
        try {
            logger_1.logger.info(`Demoting ${participants.length} participants in ${groupId}`);
            await this.socket.groupParticipantsUpdate(groupId, participants, 'demote');
            this.groupCache.delete(groupId);
            return participants.map(jid => ({
                jid,
                action: 'demote',
                success: true,
            }));
        }
        catch (error) {
            logger_1.logger.error(`Failed to demote participants: ${error.message}`);
            return participants.map(jid => ({
                jid,
                action: 'demote',
                success: false,
                error: error.message,
            }));
        }
    }
    muteUser(groupId, jid, duration, reason) {
        const muted = this.mutedUsers.get(groupId) || [];
        const filtered = muted.filter(m => m.jid !== jid);
        const muteEntry = {
            jid,
            until: duration ? Date.now() + duration : undefined,
            reason,
        };
        filtered.push(muteEntry);
        this.mutedUsers.set(groupId, filtered);
        logger_1.logger.info(`Muted user ${jid} in ${groupId}${duration ? ` for ${duration}ms` : ' permanently'}`);
    }
    unmuteUser(groupId, jid) {
        const muted = this.mutedUsers.get(groupId) || [];
        const filtered = muted.filter(m => m.jid !== jid);
        this.mutedUsers.set(groupId, filtered);
        logger_1.logger.info(`Unmuted user ${jid} in ${groupId}`);
    }
    isUserMuted(groupId, jid) {
        const muted = this.mutedUsers.get(groupId) || [];
        const muteEntry = muted.find(m => m.jid === jid);
        if (!muteEntry)
            return false;
        if (!muteEntry.until)
            return true;
        if (muteEntry.until < Date.now()) {
            this.unmuteUser(groupId, jid);
            return false;
        }
        return true;
    }
    getMutedUsers(groupId) {
        return this.mutedUsers.get(groupId) || [];
    }
    addRule(groupId, rule) {
        const rules = this.groupRules.get(groupId) || [];
        rules.push(rule);
        this.groupRules.set(groupId, rules);
        logger_1.logger.info(`Added rule "${rule.id}" to group ${groupId}`);
    }
    removeRule(groupId, ruleId) {
        const rules = this.groupRules.get(groupId) || [];
        const filtered = rules.filter(r => r.id !== ruleId);
        this.groupRules.set(groupId, filtered);
        logger_1.logger.info(`Removed rule "${ruleId}" from group ${groupId}`);
    }
    toggleRule(groupId, ruleId, enabled) {
        const rules = this.groupRules.get(groupId) || [];
        const rule = rules.find(r => r.id === ruleId);
        if (rule) {
            rule.enabled = enabled;
            logger_1.logger.info(`${enabled ? 'Enabled' : 'Disabled'} rule "${ruleId}" in group ${groupId}`);
        }
    }
    async checkRules(groupId, userId, message) {
        const rules = this.groupRules.get(groupId) || [];
        for (const rule of rules) {
            if (!rule.enabled)
                continue;
            let violated = false;
            switch (rule.type) {
                case 'anti-link':
                    violated = /https?:\/\/|www\./i.test(message);
                    break;
                case 'anti-spam':
                    violated = this.checkSpam(groupId, userId);
                    break;
                case 'anti-bad-words':
                    if (rule.patterns) {
                        violated = rule.patterns.some(pattern => pattern.test(message));
                    }
                    break;
                case 'custom':
                    if (rule.patterns) {
                        violated = rule.patterns.some(pattern => pattern.test(message));
                    }
                    break;
            }
            if (violated) {
                await this.enforceRule(groupId, userId, rule);
                return false;
            }
        }
        return true;
    }
    async enforceRule(groupId, userId, rule) {
        logger_1.logger.info(`Rule "${rule.id}" violated by ${userId} in ${groupId}`);
        switch (rule.action) {
            case 'warn':
                if (rule.message) {
                    await this.socket.sendMessage(groupId, {
                        text: `⚠️ @${userId.split('@')[0]}\n${rule.message}`,
                        mentions: [userId]
                    });
                }
                break;
            case 'mute':
                this.muteUser(groupId, userId, 3600000, `Violated rule: ${rule.id}`);
                await this.socket.sendMessage(groupId, {
                    text: `🔇 Usuario silenciado por violar reglas del grupo.`,
                    mentions: [userId]
                });
                break;
            case 'kick':
                await this.removeParticipants(groupId, [userId], `Violated rule: ${rule.id}`);
                break;
        }
    }
    checkSpam(groupId, userId) {
        const history = this.messageHistory.get(groupId) || new Map();
        const userMessages = history.get(userId) || [];
        const now = Date.now();
        const recentMessages = userMessages.filter((t) => now - t < 10000);
        if (recentMessages.length >= 5) {
            return true;
        }
        recentMessages.push(now);
        history.set(userId, recentMessages);
        this.messageHistory.set(groupId, history);
        return false;
    }
    setWelcomeMessage(groupId, config) {
        this.welcomeMessages.set(groupId, config);
        logger_1.logger.info(`Welcome message configured for ${groupId}`);
    }
    setGoodbyeMessage(groupId, config) {
        this.goodbyeMessages.set(groupId, config);
        logger_1.logger.info(`Goodbye message configured for ${groupId}`);
    }
    async sendWelcomeMessages(groupId, members) {
        const config = this.welcomeMessages.get(groupId);
        if (!config || !config.enabled)
            return;
        try {
            const metadata = await this.getGroupMetadata(groupId);
            for (const member of members) {
                const text = config.text
                    .replace('{user}', `@${member.split('@')[0]}`)
                    .replace('{group}', metadata.data?.subject || 'el grupo');
                if (config.buttons) {
                    await this.socket.sendInteractiveButtons(groupId, {
                        text,
                        footer: '¡Bienvenido al grupo!',
                        buttons: [
                            {
                                buttonId: 'rules',
                                buttonText: { displayText: '📋 Ver Reglas' },
                                type: 1
                            },
                            {
                                buttonId: 'help',
                                buttonText: { displayText: '❓ Ayuda' },
                                type: 1
                            }
                        ]
                    });
                }
                else {
                    await this.socket.sendMessage(groupId, {
                        text,
                        mentions: [member]
                    });
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to send welcome messages: ${error.message}`);
        }
    }
    async updateGroupName(groupId, name) {
        try {
            await this.socket.groupUpdateSubject(groupId, name);
            this.groupCache.delete(groupId);
            logger_1.logger.info(`Updated group name: ${groupId} -> ${name}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Failed to update group name: ${error}`);
            return false;
        }
    }
    async updateGroupDescription(groupId, description) {
        try {
            await this.socket.groupUpdateDescription(groupId, description);
            this.groupCache.delete(groupId);
            logger_1.logger.info(`Updated group description: ${groupId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Failed to update group description: ${error}`);
            return false;
        }
    }
    async getGroupMetadata(groupId) {
        try {
            const cached = this.groupCache.get(groupId);
            if (cached && cached.timestamp > Date.now() - this.cacheExpiry) {
                return { success: true, data: cached.data };
            }
            const metadata = await this.socket.groupMetadata(groupId);
            this.groupCache.set(groupId, {
                data: metadata,
                timestamp: Date.now()
            });
            return {
                success: true,
                data: metadata,
            };
        }
        catch (error) {
            logger_1.logger.error(`Failed to get group metadata: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getGroupInviteCode(groupId) {
        try {
            const code = await this.socket.groupInviteCode(groupId);
            return code || null;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get invite code: ${error}`);
            return null;
        }
    }
    async revokeGroupInviteCode(groupId) {
        try {
            const newCode = await this.socket.groupRevokeInvite(groupId);
            logger_1.logger.info(`Revoked invite code for ${groupId}`);
            return newCode || null;
        }
        catch (error) {
            logger_1.logger.error(`Failed to revoke invite code: ${error}`);
            return null;
        }
    }
    async leaveGroup(groupId) {
        try {
            await this.socket.groupLeave(groupId);
            this.groupCache.delete(groupId);
            logger_1.logger.info(`Left group: ${groupId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Failed to leave group: ${error}`);
            return false;
        }
    }
    async updateGroupSettings(groupId, settings) {
        try {
            if (settings.announceOnly !== undefined) {
                await this.socket.groupSettingUpdate(groupId, settings.announceOnly ? 'announcement' : 'not_announcement');
            }
            if (settings.locked !== undefined) {
                await this.socket.groupSettingUpdate(groupId, settings.locked ? 'locked' : 'unlocked');
            }
            this.groupCache.delete(groupId);
            logger_1.logger.info(`Updated group settings: ${groupId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Failed to update group settings: ${error}`);
            return false;
        }
    }
    async acceptGroupInvite(inviteCode) {
        try {
            const groupId = await this.socket.groupAcceptInvite(inviteCode);
            logger_1.logger.info(`Accepted group invite: ${groupId}`);
            return groupId || null;
        }
        catch (error) {
            logger_1.logger.error(`Failed to accept group invite: ${error}`);
            return null;
        }
    }
    async getParticipants(groupId) {
        try {
            const metadata = await this.getGroupMetadata(groupId);
            return metadata.data?.participants || [];
        }
        catch (error) {
            logger_1.logger.error(`Failed to get participants: ${error}`);
            return [];
        }
    }
    async getAdmins(groupId) {
        try {
            const participants = await this.getParticipants(groupId);
            return participants
                .filter((p) => p.admin === 'admin' || p.admin === 'superadmin')
                .map((p) => p.id);
        }
        catch (error) {
            logger_1.logger.error(`Failed to get admins: ${error}`);
            return [];
        }
    }
    async isAdmin(groupId, jid) {
        const admins = await this.getAdmins(groupId);
        return admins.includes(jid);
    }
    async isBotAdmin(groupId) {
        try {
            const metadata = await this.getGroupMetadata(groupId);
            const botJid = this.socket.user?.id;
            if (!botJid)
                return false;
            const participants = metadata.data?.participants || [];
            const botParticipant = participants.find((p) => p.id === botJid);
            return botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
        }
        catch (error) {
            logger_1.logger.error(`Failed to check bot admin status: ${error}`);
            return false;
        }
    }
    async sendAdminPanel(groupId, userId) {
        const isAdmin = await this.isAdmin(groupId, userId);
        if (!isAdmin) {
            await this.socket.sendMessage(groupId, {
                text: '❌ Solo los administradores pueden usar este panel.',
            });
            return;
        }
        try {
            await this.socket.sendInteractiveList(groupId, {
                text: '🛡️ *Panel de Administración Avanzado*',
                footer: 'Selecciona una opción para gestionar el grupo',
                listMessage: {
                    title: 'Opciones Administrativas',
                    buttonText: '📋 Ver Opciones',
                    sections: [
                        {
                            title: '👥 Gestión de Miembros',
                            rows: [
                                {
                                    rowId: 'admin_list_members',
                                    title: '📋 Lista de Miembros',
                                    description: 'Ver todos los miembros del grupo'
                                },
                                {
                                    rowId: 'admin_list_admins',
                                    title: '👑 Lista de Admins',
                                    description: 'Ver todos los administradores'
                                },
                                {
                                    rowId: 'admin_muted_users',
                                    title: '🔇 Usuarios Silenciados',
                                    description: 'Ver usuarios silenciados'
                                }
                            ]
                        },
                        {
                            title: '⚙️ Configuración',
                            rows: [
                                {
                                    rowId: 'admin_settings',
                                    title: '🔧 Ajustes del Grupo',
                                    description: 'Configurar grupo'
                                },
                                {
                                    rowId: 'admin_rules',
                                    title: '📜 Gestión de Reglas',
                                    description: 'Ver y editar reglas'
                                },
                                {
                                    rowId: 'admin_welcome',
                                    title: '👋 Mensaje de Bienvenida',
                                    description: 'Configurar bienvenida'
                                }
                            ]
                        },
                        {
                            title: '🔒 Seguridad',
                            rows: [
                                {
                                    rowId: 'admin_antilink',
                                    title: '🔗 Anti-Link',
                                    description: 'Activar/desactivar filtro de enlaces'
                                },
                                {
                                    rowId: 'admin_antispam',
                                    title: '🚫 Anti-Spam',
                                    description: 'Activar/desactivar anti-spam'
                                },
                                {
                                    rowId: 'admin_revoke_invite',
                                    title: '🔄 Revocar Enlace',
                                    description: 'Generar nuevo enlace de invitación'
                                }
                            ]
                        }
                    ]
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`Failed to send admin panel: ${error.message}`);
        }
    }
    setupEventListeners() {
        this.socket.ev.on('group-participants.update', async (update) => {
            const { id, participants, action } = update;
            const listeners = this.eventListeners.get(id);
            switch (action) {
                case 'add':
                    if (listeners?.onMemberJoin) {
                        await listeners.onMemberJoin(id, participants);
                    }
                    await this.sendWelcomeMessages(id, participants);
                    break;
                case 'remove':
                    if (listeners?.onMemberLeave) {
                        await listeners.onMemberLeave(id, participants);
                    }
                    const goodbye = this.goodbyeMessages.get(id);
                    if (goodbye && goodbye.enabled) {
                        for (const member of participants) {
                            const text = goodbye.text.replace('{user}', `@${member.split('@')[0]}`);
                            await this.socket.sendMessage(id, {
                                text,
                                mentions: [member]
                            });
                        }
                    }
                    break;
                case 'promote':
                    if (listeners?.onMemberPromote) {
                        await listeners.onMemberPromote(id, participants);
                    }
                    break;
                case 'demote':
                    if (listeners?.onMemberDemote) {
                        await listeners.onMemberDemote(id, participants);
                    }
                    break;
            }
            this.groupCache.delete(id);
        });
        this.socket.ev.on('groups.update', async (updates) => {
            for (const update of updates) {
                const listeners = this.eventListeners.get(update.id);
                if (update.subject && listeners?.onGroupNameChange) {
                    await listeners.onGroupNameChange(update.id, '', update.subject);
                }
                if (update.desc && listeners?.onGroupDescriptionChange) {
                    await listeners.onGroupDescriptionChange(update.id, update.desc);
                }
                if (update.announce !== undefined && listeners?.onGroupSettingsChange) {
                    await listeners.onGroupSettingsChange(update.id, {
                        announceOnly: update.announce
                    });
                }
                this.groupCache.delete(update.id);
            }
        });
    }
    registerEventListener(groupId, listeners) {
        this.eventListeners.set(groupId, listeners);
        logger_1.logger.info(`Event listeners registered for group ${groupId}`);
    }
    unregisterEventListener(groupId) {
        this.eventListeners.delete(groupId);
        logger_1.logger.info(`Event listeners unregistered for group ${groupId}`);
    }
    startCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.groupCache.entries()) {
                if (now - value.timestamp > this.cacheExpiry) {
                    this.groupCache.delete(key);
                }
            }
            for (const [groupId, muted] of this.mutedUsers.entries()) {
                const filtered = muted.filter(m => !m.until || m.until > now);
                if (filtered.length !== muted.length) {
                    this.mutedUsers.set(groupId, filtered);
                }
            }
            for (const [groupId, history] of this.messageHistory.entries()) {
                for (const [userId, timestamps] of history.entries()) {
                    const recent = timestamps.filter(t => now - t < 60000);
                    if (recent.length === 0) {
                        history.delete(userId);
                    }
                    else {
                        history.set(userId, recent);
                    }
                }
            }
            logger_1.logger.debug('Cache cleanup completed');
        }, 60000);
    }
    clearCache(groupId) {
        if (groupId) {
            this.groupCache.delete(groupId);
            logger_1.logger.info(`Cache cleared for group ${groupId}`);
        }
        else {
            this.groupCache.clear();
            logger_1.logger.info('All cache cleared');
        }
    }
    getStats() {
        return {
            cachedGroups: this.groupCache.size,
            mutedUsers: Array.from(this.mutedUsers.values()).reduce((acc, val) => acc + val.length, 0),
            activeRules: Array.from(this.groupRules.values()).reduce((acc, val) => acc + val.length, 0),
            eventListeners: this.eventListeners.size,
        };
    }
}
exports.AdvancedGroupAdminManager = AdvancedGroupAdminManager;
exports.GroupAdminManager = AdvancedGroupAdminManager;
