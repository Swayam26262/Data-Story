'use client';

/**
 * Chart Performance Monitor
 * Tracks and reports chart rendering performance metrics
 */

import { useEffect, useRef, useState } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  dataPoints: number;
  timestamp: number;
  chartType?: string;
  chartId?: string;
}

export interface PerformanceThresholds {
  renderTimeWarning: number; // ms
  renderTimeError: number; // ms
  dataPointsWarning: number;
  dataPointsError: number;
}

interface ChartPerformanceMonitorProps {
  children: React.ReactNode;
  chartType?: string;
  chartId?: string;
  dataPointCount?: number;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  thresholds?: Partial<PerformanceThresholds>;
  enableLogging?: boolean;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  renderTimeWarning: 100, // 100ms
  renderTimeError: 500, // 500ms
  dataPointsWarning: 1000,
  dataPointsError: 5000,
};

/**
 * Chart Performance Monitor Component
 * Wraps charts to track rendering performance
 */
export function ChartPerformanceMonitor({
  children,
  chartType,
  chartId,
  dataPointCount = 0,
  onMetrics,
  thresholds = {},
  enableLogging = process.env.NODE_ENV === 'development',
}: ChartPerformanceMonitorProps) {
  const startTimeRef = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const mergedThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // Start timing on mount
  useEffect(() => {
    startTimeRef.current = performance.now();
  }, []);

  // Measure render time after first paint
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;

    const newMetrics: PerformanceMetrics = {
      renderTime,
      dataPoints: dataPointCount,
      timestamp: Date.now(),
      chartType,
      chartId,
    };

    setMetrics(newMetrics);

    // Call metrics callback
    if (onMetrics) {
      onMetrics(newMetrics);
    }

    // Log performance warnings
    if (enableLogging) {
      logPerformanceMetrics(newMetrics, mergedThresholds);
    }

    // Send to performance monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      reportToMonitoringService(newMetrics);
    }
  }, [dataPointCount, chartType, chartId, onMetrics, enableLogging, mergedThresholds]);

  return <>{children}</>;
}

/**
 * Log performance metrics to console
 */
function logPerformanceMetrics(
  metrics: PerformanceMetrics,
  thresholds: PerformanceThresholds
): void {
  const { renderTime, dataPoints, chartType, chartId } = metrics;

  const chartLabel = chartId
    ? `${chartType || 'Chart'} (${chartId})`
    : chartType || 'Chart';

  // Check render time thresholds
  if (renderTime > thresholds.renderTimeError) {
    console.error(
      `⚠️ ${chartLabel} render time exceeded error threshold: ${renderTime.toFixed(2)}ms (threshold: ${thresholds.renderTimeError}ms)`
    );
  } else if (renderTime > thresholds.renderTimeWarning) {
    console.warn(
      `⚠️ ${chartLabel} render time exceeded warning threshold: ${renderTime.toFixed(2)}ms (threshold: ${thresholds.renderTimeWarning}ms)`
    );
  } else {
    console.log(
      `✓ ${chartLabel} rendered in ${renderTime.toFixed(2)}ms with ${dataPoints} data points`
    );
  }

  // Check data point thresholds
  if (dataPoints > thresholds.dataPointsError) {
    console.error(
      `⚠️ ${chartLabel} data point count exceeded error threshold: ${dataPoints} (threshold: ${thresholds.dataPointsError})`
    );
  } else if (dataPoints > thresholds.dataPointsWarning) {
    console.warn(
      `⚠️ ${chartLabel} data point count exceeded warning threshold: ${dataPoints} (threshold: ${thresholds.dataPointsWarning})`
    );
  }
}

/**
 * Report metrics to monitoring service
 */
function reportToMonitoringService(metrics: PerformanceMetrics): void {
  // Placeholder for monitoring service integration
  // In production, send to your monitoring service (e.g., DataDog, New Relic)
  
  // Example: Send to custom analytics endpoint
  if (typeof window !== 'undefined' && 'sendBeacon' in window.navigator) {
    const data = JSON.stringify({
      type: 'chart_performance',
      ...metrics,
    });
    
    // Uncomment and configure your endpoint
    // window.navigator.sendBeacon('/api/analytics/performance', data);
  }
}

/**
 * Hook to track chart performance manually
 */
export function useChartPerformance(chartType?: string, chartId?: string) {
  const startTimeRef = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  const startTracking = () => {
    startTimeRef.current = performance.now();
  };

  const endTracking = (dataPointCount: number = 0) => {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;

    const newMetrics: PerformanceMetrics = {
      renderTime,
      dataPoints: dataPointCount,
      timestamp: Date.now(),
      chartType,
      chartId,
    };

    setMetrics(newMetrics);
    return newMetrics;
  };

  return {
    startTracking,
    endTracking,
    metrics,
  };
}

/**
 * HOC to wrap a chart component with performance monitoring
 */
export function withPerformanceMonitoring<P extends { data?: unknown[] }>(
  ChartComponent: React.ComponentType<P>,
  chartType?: string
): React.FC<P> {
  return function ChartWithPerformanceMonitoring(props: P) {
    const dataPointCount = Array.isArray(props.data) ? props.data.length : 0;

    return (
      <ChartPerformanceMonitor
        chartType={chartType}
        dataPointCount={dataPointCount}
      >
        <ChartComponent {...props} />
      </ChartPerformanceMonitor>
    );
  };
}

export default ChartPerformanceMonitor;
