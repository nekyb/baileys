export declare class RateLimiter {
    private limitMap;
    private maxRequests;
    private windowMs;
    private hits;
    constructor(maxRequests?: number, windowMs?: number);
    checkLimit(userId: string): boolean;
    resetUser(userId: string): void;
    getHits(): number;
    setLimits(maxRequests: number, windowMs: number): void;
}
