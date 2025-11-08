"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartCache = void 0;
class SmartCache {
    cache;
    defaultExpiry;
    hits = 0;
    misses = 0;
    constructor(defaultExpiry = 300000) {
        this.cache = new Map();
        this.defaultExpiry = defaultExpiry;
        this.startCleanup();
    }
    set(key, data, expiry) {
        const entry = {
            data,
            timestamp: Date.now(),
            expiry: expiry || this.defaultExpiry,
        };
        this.cache.set(key, entry);
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.misses++;
            return null;
        }
        if (Date.now() - entry.timestamp > entry.expiry) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
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
            hits: this.hits,
            misses: this.misses,
            hitRate: this.hits / (this.hits + this.misses) || 0,
        };
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
