import { WASocket, proto } from '@whiskeysockets/baileys';
export declare class DeletedMessageCapture {
    private socket;
    private messageCache;
    private deletedMessages;
    constructor(socket: WASocket);
    private setupListeners;
    getDeletedMessages(): proto.IWebMessageInfo[];
    notifyDeletedMessage(jid: string, originalMsg: proto.IWebMessageInfo): Promise<void>;
    getStats(): {
        totalDeleted: number;
        cacheSize: number;
    };
    clearCache(): void;
    clearDeletedMessages(): void;
}
