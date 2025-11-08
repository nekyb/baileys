import { SpamEntry } from '../types';

export class AntiSpam {
  private spamMap: Map<string, SpamEntry>;
  private threshold: number;
  private timeWindow: number;
  private blockedCount: number = 0;

  constructor(threshold: number = 5, timeWindow: number = 10000) {
    this.spamMap = new Map();
    this.threshold = threshold;
    this.timeWindow = timeWindow;
    this.startCleanup();
  }

  checkSpam(userId: string): boolean {
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

  resetUser(userId: string): void {
    this.spamMap.delete(userId);
  }

  getBlockedCount(): number {
    return this.blockedCount;
  }

  private startCleanup(): void {
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
