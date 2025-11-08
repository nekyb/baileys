"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartCache = void 0;
class SmartCache {
    cache;
    accessOrder = [];
    maxSize;
    defaultExpiry;
    hits = 0;
    misses = 0;
    evictions = 0;
    constructor(defaultExpiry = 300000, maxSize = 2000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.defaultExpiry = defaultExpiry;
        this.startCleanup();
    }
    evictLRU() {
        if (this.cache.size >= this.maxSize && this.accessOrder.length > 0) {
            const keyToEvict = this.accessOrder.shift();
            if (keyToEvict) {
                this.cache.delete(keyToEvict);
                this.evictions++;
            }
        }
    }
    updateAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
        this.accessOrder.push(key);
    }
    set(key, data, expiry) {
        this.evictLRU();
        const entry = {
            data,
            timestamp: Date.now(),
            expiry: expiry || this.defaultExpiry,
        };
        this.cache.set(key, entry);
        this.updateAccessOrder(key);
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.misses++;
            return null;
        }
        if (Date.now() - entry.timestamp > entry.expiry) {
            this.cache.delete(key);
            const index = this.accessOrder.indexOf(key);
            if (index > -1) {
                this.accessOrder.splice(index, 1);
            }
            this.misses++;
            return null;
        }
        this.updateAccessOrder(key);
        this.hits++;
        return entry.data;
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (Date.now() - entry.timestamp > entry.expiry) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            evictions: this.evictions,
            hitRate: this.hits / (this.hits + this.misses) || 0,
        };
    }
    setMaxSize(size) {
        this.maxSize = size;
        while (this.cache.size > this.maxSize) {
            this.evictLRU();
        }
    }
    startCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.cache.entries()) {
                if (now - entry.timestamp > entry.expiry) {
                    this.cache.delete(key);
                }
            }
        }, 60000);
    }
}
exports.SmartCache = SmartCache;
