import { SoblendSocket } from '../types';

export interface GroupSettings {
  announceOnly?: boolean;
  locked?: boolean;
  allowMemberAdd?: boolean;
}

export interface ParticipantAction {
  jid: string;
  action: 'add' | 'remove' | 'promote' | 'demote';
  success: boolean;
  error?: string;
}

export class GroupAdminManager {
  private socket: SoblendSocket;

  constructor(socket: SoblendSocket) {
    this.socket = socket;
  }

  async createGroup(name: string, participants: string[]): Promise<any> {
    try {
      const result = await this.socket.groupCreate(name, participants);
      return {
        success: true,
        groupId: result.id,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async addParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]> {
    try {
      const result = await this.socket.groupParticipantsUpdate(groupId, participants, 'add');
      return participants.map((jid) => ({
        jid,
        action: 'add',
        success: true,
      }));
    } catch (error: any) {
      return participants.map((jid) => ({
        jid,
        action: 'add',
        success: false,
        error: error.message,
      }));
    }
  }

  async removeParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]> {
    try {
      const result = await this.socket.groupParticipantsUpdate(groupId, participants, 'remove');
      return participants.map((jid) => ({
        jid,
        action: 'remove',
        success: true,
      }));
    } catch (error: any) {
      return participants.map((jid) => ({
        jid,
        action: 'remove',
        success: false,
        error: error.message,
      }));
    }
  }

  async promoteParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]> {
    try {
      const result = await this.socket.groupParticipantsUpdate(groupId, participants, 'promote');
      return participants.map((jid) => ({
        jid,
        action: 'promote',
        success: true,
      }));
    } catch (error: any) {
      return participants.map((jid) => ({
        jid,
        action: 'promote',
        success: false,
        error: error.message,
      }));
    }
  }

  async demoteParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]> {
    try {
      const result = await this.socket.groupParticipantsUpdate(groupId, participants, 'demote');
      return participants.map((jid) => ({
        jid,
        action: 'demote',
        success: true,
      }));
    } catch (error: any) {
      return participants.map((jid) => ({
        jid,
        action: 'demote',
        success: false,
        error: error.message,
      }));
    }
  }

  async updateGroupName(groupId: string, name: string): Promise<boolean> {
    try {
      await this.socket.groupUpdateSubject(groupId, name);
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateGroupDescription(groupId: string, description: string): Promise<boolean> {
    try {
      await this.socket.groupUpdateDescription(groupId, description);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getGroupMetadata(groupId: string): Promise<any> {
    try {
      const metadata = await this.socket.groupMetadata(groupId);
      return {
        success: true,
        data: metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getGroupInviteCode(groupId: string): Promise<string | null> {
    try {
      const code = await this.socket.groupInviteCode(groupId);
      return code || null;
    } catch (error) {
      return null;
    }
  }

  async revokeGroupInviteCode(groupId: string): Promise<string | null> {
    try {
      const newCode = await this.socket.groupRevokeInvite(groupId);
      return newCode || null;
    } catch (error) {
      return null;
    }
  }

  async leaveGroup(groupId: string): Promise<boolean> {
    try {
      await this.socket.groupLeave(groupId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateGroupSettings(groupId: string, settings: GroupSettings): Promise<boolean> {
    try {
      if (settings.announceOnly !== undefined) {
        await this.socket.groupSettingUpdate(groupId, settings.announceOnly ? 'announcement' : 'not_announcement');
      }
      if (settings.locked !== undefined) {
        await this.socket.groupSettingUpdate(groupId, settings.locked ? 'locked' : 'unlocked');
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async acceptGroupInvite(inviteCode: string): Promise<string | null> {
    try {
      const groupId = await this.socket.groupAcceptInvite(inviteCode);
      return groupId || null;
    } catch (error) {
      return null;
    }
  }

  async getParticipants(groupId: string): Promise<any[]> {
    try {
      const metadata = await this.socket.groupMetadata(groupId);
      return metadata.participants;
    } catch (error) {
      return [];
    }
  }

  async getAdmins(groupId: string): Promise<string[]> {
    try {
      const participants = await this.getParticipants(groupId);
      return participants
        .filter((p: any) => p.admin === 'admin' || p.admin === 'superadmin')
        .map((p: any) => p.id);
    } catch (error) {
      return [];
    }
  }

  async isAdmin(groupId: string, jid: string): Promise<boolean> {
    const admins = await this.getAdmins(groupId);
    return admins.includes(jid);
  }

  async isBotAdmin(groupId: string): Promise<boolean> {
    const metadata = await this.socket.groupMetadata(groupId);
    const botJid = this.socket.user?.id;
    if (!botJid) return false;
    
    const participants = metadata.participants;
    const botParticipant = participants.find((p: any) => p.id === botJid);
    return botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
  }
}
