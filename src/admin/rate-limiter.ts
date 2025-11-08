import { RateLimitEntry } from '../types';

export class RateLimiter {
  private limitMap: Map<string, RateLimitEntry>;
  private maxRequests: number;
  private windowMs: number;
  private hits: number = 0;

  constructor(maxRequests: number = 30, windowMs: number = 60000) {
    this.limitMap = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkLimit(userId: string): boolean {
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

  resetUser(userId: string): void {
    this.limitMap.delete(userId);
  }

  getHits(): number {
    return this.hits;
  }

  setLimits(maxRequests: number, windowMs: number): void {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
}
