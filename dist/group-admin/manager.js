"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupAdminManager = void 0;
class GroupAdminManager {
    socket;
    constructor(socket) {
        this.socket = socket;
    }
    async createGroup(name, participants) {
        try {
            const result = await this.socket.groupCreate(name, participants);
            return {
                success: true,
                groupId: result.id,
                data: result,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async addParticipants(groupId, participants) {
        try {
            const result = await this.socket.groupParticipantsUpdate(groupId, participants, 'add');
            return participants.map((jid) => ({
                jid,
                action: 'add',
                success: true,
            }));
        }
        catch (error) {
            return participants.map((jid) => ({
                jid,
                action: 'add',
                success: false,
                error: error.message,
            }));
        }
    }
    async removeParticipants(groupId, participants) {
        try {
            const result = await this.socket.groupParticipantsUpdate(groupId, participants, 'remove');
            return participants.map((jid) => ({
                jid,
                action: 'remove',
                success: true,
            }));
        }
        catch (error) {
            return participants.map((jid) => ({
                jid,
                action: 'remove',
                success: false,
                error: error.message,
            }));
        }
    }
    async promoteParticipants(groupId, participants) {
        try {
            const result = await this.socket.groupParticipantsUpdate(groupId, participants, 'promote');
            return participants.map((jid) => ({
                jid,
                action: 'promote',
                success: true,
            }));
        }
        catch (error) {
            return participants.map((jid) => ({
                jid,
                action: 'promote',
                success: false,
                error: error.message,
            }));
        }
    }
    async demoteParticipants(groupId, participants) {
        try {
            const result = await this.socket.groupParticipantsUpdate(groupId, participants, 'demote');
            return participants.map((jid) => ({
                jid,
                action: 'demote',
                success: true,
            }));
        }
        catch (error) {
            return participants.map((jid) => ({
                jid,
                action: 'demote',
                success: false,
                error: error.message,
            }));
        }
    }
    async updateGroupName(groupId, name) {
        try {
            await this.socket.groupUpdateSubject(groupId, name);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async updateGroupDescription(groupId, description) {
        try {
            await this.socket.groupUpdateDescription(groupId, description);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async getGroupMetadata(groupId) {
        try {
            const metadata = await this.socket.groupMetadata(groupId);
            return {
                success: true,
                data: metadata,
            };
        }
        catch (error) {
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
            return null;
        }
    }
    async revokeGroupInviteCode(groupId) {
        try {
            const newCode = await this.socket.groupRevokeInvite(groupId);
            return newCode || null;
        }
        catch (error) {
            return null;
        }
    }
    async leaveGroup(groupId) {
        try {
            await this.socket.groupLeave(groupId);
            return true;
        }
        catch (error) {
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
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async acceptGroupInvite(inviteCode) {
        try {
            const groupId = await this.socket.groupAcceptInvite(inviteCode);
            return groupId || null;
        }
        catch (error) {
            return null;
        }
    }
    async getParticipants(groupId) {
        try {
            const metadata = await this.socket.groupMetadata(groupId);
            return metadata.participants;
        }
        catch (error) {
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
            return [];
        }
    }
    async isAdmin(groupId, jid) {
        const admins = await this.getAdmins(groupId);
        return admins.includes(jid);
    }
    async isBotAdmin(groupId) {
        const metadata = await this.socket.groupMetadata(groupId);
        const botJid = this.socket.user?.id;
        if (!botJid)
            return false;
        const participants = metadata.participants;
        const botParticipant = participants.find((p) => p.id === botJid);
        return botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
    }
}
exports.GroupAdminManager = GroupAdminManager;
