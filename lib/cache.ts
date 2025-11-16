/**
 * Simple in-memory cache for expensive statistical calculations
 * For production with multiple instances, consider using Redis
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store = new Map<string, CacheEntry<any>>();
  private defaultTTL = 60 * 60 * 1000; // 1 hour

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get or compute value
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await computeFn();
    this.set(key, value, ttlMs);
    return value;
  }
}

// Singleton instance
export const cache = new Cache();

// Cleanup expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cache.cleanup(), 10 * 60 * 1000);
}

/**
 * Generate cache key for story statistics
 */
export function getStoryStatsCacheKey(storyId: string): string {
  return `story:stats:${storyId}`;
}

/**
 * Generate cache key for chart data
 */
export function getChartCacheKey(storyId: string, chartId: string): string {
  return `chart:${storyId}:${chartId}`;
}

/**
 * Generate cache key for export
 */
export function getExportCacheKey(
  storyId: string,
  chartId: string,
  format: string
): string {
  return `export:${storyId}:${chartId}:${format}`;
}
