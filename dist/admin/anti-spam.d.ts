export declare class AntiSpam {
    private spamMap;
    private threshold;
    private timeWindow;
    private blockedCount;
    constructor(threshold?: number, timeWindow?: number);
    checkSpam(userId: string): boolean;
    resetUser(userId: string): void;
    getBlockedCount(): number;
    private startCleanup;
}
