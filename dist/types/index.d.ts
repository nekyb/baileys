import { WASocket } from '@whiskeysockets/baileys';
export interface SoblendConfig {
    printQRInTerminal?: boolean;
    autoReconnect?: boolean;
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
    enableCache?: boolean;
    cacheExpiry?: number;
    enableAntiSpam?: boolean;
    spamThreshold?: number;
    spamTimeWindow?: number;
    enableRateLimit?: boolean;
    rateLimitMax?: number;
    rateLimitWindow?: number;
    enableCompression?: boolean;
    compressionQuality?: number;
    enablePlugins?: boolean;
    logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
}
export interface InteractiveButton {
    buttonId: string;
    buttonText: {
        displayText: string;
    };
    type: number;
}
export interface InteractiveList {
    title: string;
    description?: string;
    buttonText: string;
    sections: Array<{
        title: string;
        rows: Array<{
            rowId: string;
            title: string;
            description?: string;
        }>;
    }>;
}
export interface InteractiveMessage {
    text?: string;
    footer?: string;
    buttons?: InteractiveButton[];
    listMessage?: InteractiveList;
    viewOnce?: boolean;
    headerType?: 1 | 2 | 3 | 4;
    image?: Buffer | string;
    video?: Buffer | string;
    document?: Buffer | string;
}
export interface SoblendSocket extends WASocket {
    sendInteractiveButtons: (jid: string, data: InteractiveMessage) => Promise<any>;
    sendInteractiveList: (jid: string, data: InteractiveMessage) => Promise<any>;
    sendPoll: (jid: string, question: string, options: string[]) => Promise<any>;
    getAdminStats: () => AdminStats;
    enableAntiSpam: (enabled: boolean) => void;
    setRateLimit: (max: number, window: number) => void;
}
export interface AdminStats {
    messageCount: number;
    blockedSpam: number;
    rateLimitHits: number;
    uptime: number;
    cacheHits: number;
    cacheMisses: number;
}
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiry: number;
}
export interface Plugin {
    name: string;
    version: string;
    init: (socket: SoblendSocket) => void | Promise<void>;
    onMessage?: (msg: any) => void | Promise<void>;
    onCommand?: (command: string, args: string[], msg: any) => void | Promise<void>;
}
export interface SpamEntry {
    count: number;
    firstSeen: number;
    lastSeen: number;
}
export interface RateLimitEntry {
    count: number;
    resetTime: number;
}
