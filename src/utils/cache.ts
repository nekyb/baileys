import { CacheEntry } from '../types';

export class SmartCache {
  private cache: Map<string, CacheEntry<any>>;
  private accessOrder: string[] = [];
  private maxSize: number;
  private defaultExpiry: number;
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;

  constructor(defaultExpiry: number = 300000, maxSize: number = 2000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultExpiry = defaultExpiry;
    this.startCleanup();
  }

  private evictLRU(): void {
    if (this.cache.size >= this.maxSize && this.accessOrder.length > 0) {
      const keyToEvict = this.accessOrder.shift();
      if (keyToEvict) {
        this.cache.delete(keyToEvict);
        this.evictions++;
      }
    }
  }

  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  set<T>(key: string, data: T, expiry?: number): void {
    this.evictLRU();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.defaultExpiry,
    };
    
    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }

  get<T>(key: string): T | null {
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
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: this.hits / (this.hits + this.misses) || 0,
    };
  }

  setMaxSize(size: number): void {
    this.maxSize = size;
    while (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
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
