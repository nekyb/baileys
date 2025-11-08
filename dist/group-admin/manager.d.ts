import { SoblendSocket } from '../types';
export interface GroupSettings {
    announceOnly?: boolean;
    locked?: boolean;
    allowMemberAdd?: boolean;
    restrictMessages?: boolean;
}
export interface ParticipantAction {
    jid: string;
    action: 'add' | 'remove' | 'promote' | 'demote' | 'mute' | 'unmute';
    success: boolean;
    error?: string;
}
export interface GroupPermissions {
    sendMessages: boolean;
    sendMedia: boolean;
    changeGroupInfo: boolean;
    addMembers: boolean;
}
export interface GroupRule {
    id: string;
    type: 'anti-link' | 'anti-spam' | 'anti-bad-words' | 'custom';
    enabled: boolean;
    action: 'warn' | 'mute' | 'kick';
    message?: string;
    patterns?: RegExp[];
}
export interface WelcomeMessage {
    enabled: boolean;
    text: string;
    media?: Buffer | string;
    buttons?: boolean;
}
export interface GroupEventListener {
    onMemberJoin?: (groupId: string, members: string[]) => void | Promise<void>;
    onMemberLeave?: (groupId: string, members: string[]) => void | Promise<void>;
    onMemberPromote?: (groupId: string, members: string[]) => void | Promise<void>;
    onMemberDemote?: (groupId: string, members: string[]) => void | Promise<void>;
    onGroupNameChange?: (groupId: string, oldName: string, newName: string) => void | Promise<void>;
    onGroupDescriptionChange?: (groupId: string, newDescription: string) => void | Promise<void>;
    onGroupPhotoChange?: (groupId: string) => void | Promise<void>;
    onGroupSettingsChange?: (groupId: string, settings: GroupSettings) => void | Promise<void>;
}
export interface MutedUser {
    jid: string;
    until?: number;
    reason?: string;
}
export declare class AdvancedGroupAdminManager {
    private socket;
    private groupCache;
    private mutedUsers;
    private groupRules;
    private welcomeMessages;
    private goodbyeMessages;
    private eventListeners;
    private messageHistory;
    private cacheExpiry;
    constructor(socket: SoblendSocket);
    createGroup(name: string, participants: string[]): Promise<any>;
    addParticipants(groupId: string, participants: string[], sendWelcome?: boolean): Promise<ParticipantAction[]>;
    removeParticipants(groupId: string, participants: string[], reason?: string): Promise<ParticipantAction[]>;
    promoteParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]>;
    demoteParticipants(groupId: string, participants: string[]): Promise<ParticipantAction[]>;
    muteUser(groupId: string, jid: string, duration?: number, reason?: string): void;
    unmuteUser(groupId: string, jid: string): void;
    isUserMuted(groupId: string, jid: string): boolean;
    getMutedUsers(groupId: string): MutedUser[];
    addRule(groupId: string, rule: GroupRule): void;
    removeRule(groupId: string, ruleId: string): void;
    toggleRule(groupId: string, ruleId: string, enabled: boolean): void;
    checkRules(groupId: string, userId: string, message: string): Promise<boolean>;
    private enforceRule;
    private checkSpam;
    setWelcomeMessage(groupId: string, config: WelcomeMessage): void;
    setGoodbyeMessage(groupId: string, config: WelcomeMessage): void;
    private sendWelcomeMessages;
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
    sendAdminPanel(groupId: string, userId: string): Promise<void>;
    private setupEventListeners;
    registerEventListener(groupId: string, listeners: GroupEventListener): void;
    unregisterEventListener(groupId: string): void;
    private startCacheCleanup;
    clearCache(groupId?: string): void;
    getStats(): any;
}
export { AdvancedGroupAdminManager as GroupAdminManager };
