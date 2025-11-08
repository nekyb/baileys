export declare class SmartCache {
    private cache;
    private accessOrder;
    private maxSize;
    private defaultExpiry;
    private hits;
    private misses;
    private evictions;
    constructor(defaultExpiry?: number, maxSize?: number);
    private evictLRU;
    private updateAccessOrder;
    set<T>(key: string, data: T, expiry?: number): void;
    get<T>(key: string): T | null;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    getStats(): {
        size: number;
        maxSize: number;
        hits: number;
        misses: number;
        evictions: number;
        hitRate: number;
    };
    setMaxSize(size: number): void;
    private startCleanup;
}
