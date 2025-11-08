export declare class SmartCache {
    private cache;
    private defaultExpiry;
    private hits;
    private misses;
    constructor(defaultExpiry?: number);
    set<T>(key: string, data: T, expiry?: number): void;
    get<T>(key: string): T | null;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    getStats(): {
        size: number;
        hits: number;
        misses: number;
        hitRate: number;
    };
    private startCleanup;
}
