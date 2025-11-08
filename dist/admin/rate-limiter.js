"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    limitMap;
    maxRequests;
    windowMs;
    hits = 0;
    constructor(maxRequests = 30, windowMs = 60000) {
        this.limitMap = new Map();
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    checkLimit(userId) {
        const now = Date.now();
        const entry = this.limitMap.get(userId);
        if (!entry || now > entry.resetTime) {
            this.limitMap.set(userId, {
                count: 1,
                resetTime: now + this.windowMs,
            });
            return true;
        }
        if (entry.count >= this.maxRequests) {
            this.hits++;
            return false;
        }
        entry.count++;
        return true;
    }
    resetUser(userId) {
        this.limitMap.delete(userId);
    }
    getHits() {
        return this.hits;
    }
    setLimits(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
}
exports.RateLimiter = RateLimiter;
