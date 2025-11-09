export interface SessionBackupOptions {
    enableAutoBackup?: boolean;
    backupInterval?: number;
    maxBackups?: number;
    encryptionKey?: string;
    backupPath?: string;
}
export declare class SessionManager {
    private options;
    private backupTimer;
    private algorithm;
    constructor(options?: SessionBackupOptions);
    private encrypt;
    private decrypt;
    createBackup(authPath: string): Promise<void>;
    restoreBackup(backupFile: string, authPath: string): Promise<void>;
    listBackups(): Promise<string[]>;
    private cleanOldBackups;
    private startAutoBackup;
    stopAutoBackup(): void;
    getLatestBackup(): Promise<string | null>;
}
