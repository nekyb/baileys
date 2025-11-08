import { CacheEntry } from '../types';

export class SmartCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultExpiry: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(defaultExpiry: number = 300000) {
    this.cache = new Map();
    this.defaultExpiry = defaultExpiry;
    this.startCleanup();
  }

  set<T>(key: string, data: T, expiry?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.defaultExpiry,
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
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
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() - entry.timestamp > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
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

  private startCleanup(): void {
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
