"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiSpam = void 0;
class AntiSpam {
    spamMap;
    threshold;
    timeWindow;
    blockedCount = 0;
    constructor(threshold = 5, timeWindow = 10000) {
        this.spamMap = new Map();
        this.threshold = threshold;
        this.timeWindow = timeWindow;
        this.startCleanup();
    }
    checkSpam(userId) {
        const now = Date.now();
        const entry = this.spamMap.get(userId);
        if (!entry) {
            this.spamMap.set(userId, {
                count: 1,
                firstSeen: now,
                lastSeen: now,
            });
            return false;
        }
        if (now - entry.firstSeen > this.timeWindow) {
            this.spamMap.set(userId, {
                count: 1,
                firstSeen: now,
                lastSeen: now,
            });
            return false;
        }
        entry.count++;
        entry.lastSeen = now;
        if (entry.count > this.threshold) {
            this.blockedCount++;
            return true;
        }
        return false;
    }
    resetUser(userId) {
        this.spamMap.delete(userId);
    }
    getBlockedCount() {
        return this.blockedCount;
    }
    startCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [userId, entry] of this.spamMap.entries()) {
                if (now - entry.lastSeen > this.timeWindow * 2) {
                    this.spamMap.delete(userId);
                }
            }
        }, 30000);
    }
}
exports.AntiSpam = AntiSpam;
