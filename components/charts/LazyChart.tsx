/**
 * Lazy loading wrapper for charts with performance optimizations
 * Implements viewport-based loading, data sampling, and memoization
 */

import React, { memo, useMemo } from 'react';
import { useLazyChart } from '@/lib/hooks/useLazyChart';
import { ChartSkeleton } from './ChartSkeleton';
import { adaptiveSample, performanceMonitor } from '@/lib/utils/performance';
import type { ChartDataPoint } from '@/lib/models/Story';

export interface LazyChartProps {
  /**
   * Chart component to render
   */
  children: React.ReactNode;

  /**
   * Chart type for skeleton and sampling
   */
  chartType: 'line' | 'bar' | 'scatter' | 'pie' | 'area';

  /**
   * Chart data for sampling
   */
  data?: ChartDataPoint[];

  /**
   * Whether to enable data sampling
   */
  enableSampling?: boolean;

  /**
   * Maximum data points before sampling
   */
  maxDataPoints?: number;

  /**
   * Whether to enable lazy loading
   */
  enableLazyLoading?: boolean;

  /**
   * Height for skeleton loader
   */
  height?: number | string;

  /**
   * Chart ID for performance monitoring
   */
  chartId?: string;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Callback when chart becomes visible
   */
  onVisible?: () => void;
}

/**
 * Lazy chart wrapper with performance optimizations
 */
export const LazyChart = memo(function LazyChart({
  children,
  chartType,
  data,
  enableSampling = true,
  maxDataPoints,
  enableLazyLoading = true,
  height = 300,
  chartId,
  className = '',
  onVisible,
}: LazyChartProps) {
  const { ref, shouldRender, isInView } = useLazyChart({
    rootMargin: '200px',
    threshold: 0.1,
  });

  // Monitor performance
  React.useEffect(() => {
    if (isInView && chartId) {
      const stopMonitoring = performanceMonitor.start(`chart-render-${chartId}`);
      return stopMonitoring;
    }
  }, [isInView, chartId]);

  // Call onVisible callback
  React.useEffect(() => {
    if (isInView && onVisible) {
      onVisible();
    }
  }, [isInView, onVisible]);

  // Sample data if needed
  const processedData = useMemo(() => {
    if (!data || !enableSampling) {
      return data;
    }

    // Only sample for chart types that support it
    if (chartType === 'pie') {
      return data;
    }

    return adaptiveSample(data, chartType, maxDataPoints);
  }, [data, enableSampling, chartType, maxDataPoints]);

  // Clone children with processed data
  const chartWithProcessedData = useMemo(() => {
    if (!processedData || !React.isValidElement(children)) {
      return children;
    }

    return React.cloneElement(children as React.ReactElement<any>, {
      data: processedData,
    });
  }, [children, processedData]);

  // If lazy loading is disabled, render immediately
  if (!enableLazyLoading) {
    return (
      <div ref={ref} className={className}>
        {chartWithProcessedData}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {shouldRender ? (
        chartWithProcessedData
      ) : (
        <ChartSkeleton
          type={chartType}
          height={height}
          showTitle={true}
          showLegend={true}
        />
      )}
    </div>
  );
});

export default LazyChart;
