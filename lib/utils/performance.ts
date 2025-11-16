/**
 * Performance optimization utilities for chart rendering
 * Implements data sampling, memoization, debouncing, and other optimizations
 */

import type { ChartDataPoint } from '@/lib/models/Story';

/**
 * Data sampling for large datasets
 * Reduces dataset size while maintaining visual representation
 */
export function sampleData(
  data: ChartDataPoint[],
  maxPoints: number = 5000
): ChartDataPoint[] {
  if (data.length <= maxPoints) {
    return data;
  }

  // Use systematic sampling to maintain distribution
  const step = data.length / maxPoints;
  const sampled: ChartDataPoint[] = [];

  for (let i = 0; i < maxPoints; i++) {
    const index = Math.floor(i * step);
    sampled.push(data[index]);
  }

  // Always include the last point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }

  return sampled;
}

/**
 * Adaptive sampling based on chart type and data characteristics
 */
export function adaptiveSample(
  data: ChartDataPoint[],
  chartType: 'line' | 'bar' | 'scatter' | 'area',
  maxPoints?: number
): ChartDataPoint[] {
  // Different thresholds for different chart types
  const thresholds = {
    line: maxPoints || 5000,
    bar: maxPoints || 3000,
    scatter: maxPoints || 2000,
    area: maxPoints || 5000,
  };

  const threshold = thresholds[chartType];
  
  if (data.length <= threshold) {
    return data;
  }

  // For scatter plots with many points, use more aggressive sampling
  if (chartType === 'scatter' && data.length > 2000) {
    return sampleData(data, Math.min(2000, threshold));
  }

  return sampleData(data, threshold);
}

/**
 * Debounce function for interaction handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 200
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for high-frequency events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 150
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoization cache for statistical calculations
 */
class StatisticsCache {
  private cache: Map<string, any> = new Map();
  private maxSize: number = 100;

  private generateKey(data: ChartDataPoint[], operation: string): string {
    // Create a hash-like key from data length and first/last values
    const firstPoint = JSON.stringify(data[0]);
    const lastPoint = JSON.stringify(data[data.length - 1]);
    return `${operation}-${data.length}-${firstPoint}-${lastPoint}`;
  }

  get<T>(data: ChartDataPoint[], operation: string): T | undefined {
    const key = this.generateKey(data, operation);
    return this.cache.get(key);
  }

  set<T>(data: ChartDataPoint[], operation: string, value: T): void {
    const key = this.generateKey(data, operation);
    
    // Implement LRU-like behavior
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const statisticsCache = new StatisticsCache();

/**
 * Memoized statistical calculations
 */
export function memoizedCalculation<T>(
  data: ChartDataPoint[],
  operation: string,
  calculator: () => T
): T {
  const cached = statisticsCache.get<T>(data, operation);
  if (cached !== undefined) {
    return cached;
  }

  const result = calculator();
  statisticsCache.set(data, operation, result);
  return result;
}

/**
 * Check if canvas rendering should be used
 */
export function shouldUseCanvas(dataLength: number, chartType: string): boolean {
  // Use canvas for dense scatter plots
  if (chartType === 'scatter' && dataLength > 2000) {
    return true;
  }

  // Use canvas for very large line charts
  if (chartType === 'line' && dataLength > 10000) {
    return true;
  }

  return false;
}

/**
 * Calculate optimal bin size for histograms
 */
export function calculateOptimalBins(dataLength: number): number {
  // Sturges' formula
  return Math.ceil(Math.log2(dataLength) + 1);
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map();

  start(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }

      const measurements = this.measurements.get(label)!;
      measurements.push(duration);

      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }

  getAverage(label: string): number | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sum = measurements.reduce((acc, val) => acc + val, 0);
    return sum / measurements.length;
  }

  get(label: string): number[] | undefined {
    return this.measurements.get(label);
  }

  getReport(): Record<string, { avg: number; count: number }> {
    const report: Record<string, { avg: number; count: number }> = {};

    this.measurements.forEach((measurements, label) => {
      if (measurements.length > 0) {
        const avg = measurements.reduce((acc, val) => acc + val, 0) / measurements.length;
        report[label] = { avg, count: measurements.length };
      }
    });

    return report;
  }

  clear(): void {
    this.measurements.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Request idle callback wrapper for non-critical operations
 */
export function scheduleIdleTask(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, 1);
  }
}

/**
 * Batch updates to reduce re-renders
 */
export function batchUpdates<T>(
  updates: T[],
  batchSize: number = 10,
  onBatch: (batch: T[]) => void
): void {
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    scheduleIdleTask(() => onBatch(batch));
  }
}
