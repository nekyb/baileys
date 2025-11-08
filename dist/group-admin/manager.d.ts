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
export declare class GroupAdminManager {
    private socket;
    constructor(socket: SoblendSocket);
    createGroup(name: string, participants: string[]): Promise<any>;
    addParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]>;
    removeParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]>;
    promoteParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]>;
    demoteParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]>;
    updateGroupName(groupId: string, name: string): Promise<boolean>;
    updateGroupDescription(groupId: string, description: string): Promise<boolean>;
    getGroupMetadata(groupId: string): Promise<any>;
    getGroupInviteCode(groupId: string): Promise<string | null>;
    revokeGroupInviteCode(groupId: string): Promise<string | null>;
    leaveGroup(groupId: string): Promise<boolean>;
    updateGroupSettings(groupId: string, settings: GroupSettings): Promise<boolean>;
    acceptGroupInvite(inviteCode: string): Promise<string | null>;
    getParticipants(groupId: string): Promise<any[]>;
    getAdmins(groupId: string): Promise<string[]>;
    isAdmin(groupId: string, jid: string): Promise<boolean>;
    isBotAdmin(groupId: string): Promise<boolean>;
}
