export interface UserData {
    jid: string;
    name?: string;
    messageCount: number;
    firstSeen: number;
    lastSeen: number;
    isBlocked: boolean;
    isBanned: boolean;
    level: number;
    points: number;
    metadata?: any;
}
export interface ChatData {
    jid: string;
    messages: any[];
    lastMessage?: any;
    unreadCount: number;
    isPinned: boolean;
    isMuted: boolean;
    metadata?: any;
}
export interface GroupData {
    jid: string;
    name: string;
    description?: string;
    participants: string[];
    admins: string[];
    settings: {
        locked: boolean;
        announceOnly: boolean;
        allowMemberAdd: boolean;
    };
    metadata?: any;
}
export interface BotConfig {
    botName: string;
    prefix: string;
    ownerJid: string;
    autoRead: boolean;
    autoTyping: boolean;
    welcomeMessage: string;
    goodbyeMessage: string;
    antiLink: boolean;
    antiSpam: boolean;
    [key: string]: any;
}
export declare class SoblendStorage {
    private db;
    private dbPath;
    private encrypted;
    private password?;
    constructor(dbPath?: string, encrypted?: boolean, password?: string);
    initialize(): Promise<void>;
    private getDefaultConfig;
    saveUser(userData: UserData): Promise<void>;
    getUser(jid: string): UserData | null;
    getAllUsers(): Promise<Record<string, UserData>>;
    updateUser(jid: string, updates: Partial<UserData>): Promise<void>;
    saveChat(chatData: ChatData): Promise<void>;
    getChat(jid: string): ChatData | null;
    getAllChats(): Promise<Record<string, ChatData>>;
    saveGroup(groupData: GroupData): Promise<void>;
    getGroup(jid: string): GroupData | null;
    getAllGroups(): Promise<Record<string, GroupData>>;
    updateGroup(jid: string, updates: Partial<GroupData>): Promise<void>;
    getConfig(): BotConfig;
    updateConfig(updates: Partial<BotConfig>): Promise<void>;
    setConfigValue(key: string, value: any): Promise<void>;
    getConfigValue(key: string): any;
    addMessageToChat(jid: string, message: any): Promise<void>;
    banUser(jid: string): Promise<void>;
    unbanUser(jid: string): Promise<void>;
    blockUser(jid: string): Promise<void>;
    unblockUser(jid: string): Promise<void>;
    incrementUserLevel(jid: string, points?: number): Promise<void>;
    getTopUsers(limit?: number): Promise<UserData[]>;
    backup(backupPath: string): Promise<void>;
    clearAllData(): Promise<void>;
}
