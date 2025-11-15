/**
 * Performance Monitoring Utilities
 * Provides tools for measuring and optimizing application performance
 */

import { logger } from './logger';

/**
 * Performance timer for measuring operation duration
 */
export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number>;

  constructor(private operationName: string) {
    this.startTime = Date.now();
    this.marks = new Map();
  }

  /**
   * Mark a checkpoint in the operation
   */
  mark(label: string): void {
    this.marks.set(label, Date.now() - this.startTime);
  }

  /**
   * Get duration of a specific mark
   */
  getDuration(label: string): number | undefined {
    return this.marks.get(label);
  }

  /**
   * Get total elapsed time
   */
  getElapsed(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Complete the timer and log results
   */
  end(): number {
    const elapsed = this.getElapsed();
    
    const marks: Record<string, number> = {};
    this.marks.forEach((duration, label) => {
      marks[label] = duration;
    });

    logger.info('Performance measurement', {
      operation: this.operationName,
      totalDuration: elapsed,
      marks,
    });

    return elapsed;
  }
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const timer = new PerformanceTimer(operationName);
  
  try {
    const result = await fn();
    const duration = timer.end();
    return { result, duration };
  } catch (error) {
    timer.end();
    throw error;
  }
}

/**
 * Measure sync function execution time
 */
export function measureSync<T>(
  operationName: string,
  fn: () => T
): { result: T; duration: number } {
  const timer = new PerformanceTimer(operationName);
  
  try {
    const result = fn();
    const duration = timer.end();
    return { result, duration };
  } catch (error) {
    timer.end();
    throw error;
  }
}

/**
 * Cache wrapper with TTL
 */
export class CacheManager<T> {
  private cache: Map<string, { value: T; expiresAt: number }>;
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or compute value
   */
  async getOrCompute(
    key: string,
    computeFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await computeFn();
    this.set(key, value);
    return value;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delayMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Batch operations to reduce overhead
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private processFn: (items: T[]) => Promise<void>,
    private batchSize: number = 10,
    private maxWaitMs: number = 1000
  ) {}

  /**
   * Add item to batch queue
   */
  add(item: T): void {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.maxWaitMs);
    }
  }

  /**
   * Process all queued items immediately
   */
  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const items = [...this.queue];
    this.queue = [];

    try {
      await this.processFn(items);
    } catch (error) {
      logger.error('Batch processing error', { error, itemCount: items.length });
    }
  }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
} {
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    rss: Math.round(usage.rss / 1024 / 1024), // MB
  };
}

/**
 * Log memory usage
 */
export function logMemoryUsage(label: string = 'Memory Usage'): void {
  const usage = getMemoryUsage();
  logger.info(label, usage);
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        logger.warn(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`, {
          error: lastError.message,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  /**
   * Try to consume a token
   */
  tryConsume(): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current token count
   */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }
}
