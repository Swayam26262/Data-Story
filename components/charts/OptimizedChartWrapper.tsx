/**
 * Optimized chart wrapper with React.memo and useMemo
 * Prevents unnecessary re-renders and optimizes performance
 */

import React, { memo, useMemo, useCallback } from 'react';
import type { ChartDataPoint } from '@/lib/models/Story';
import { debounce, memoizedCalculation } from '@/lib/utils/performance';

export interface OptimizedChartWrapperProps {
  /**
   * Chart component to render
   */
  children: React.ReactNode;

  /**
   * Chart data
   */
  data: ChartDataPoint[];

  /**
   * Chart configuration
   */
  config: Record<string, any>;

  /**
   * Chart ID for memoization
   */
  chartId: string;

  /**
   * Whether to enable memoization
   */
  enableMemoization?: boolean;

  /**
   * Debounce delay for interactions (ms)
   */
  debounceDelay?: number;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Interaction handlers
   */
  onDataPointClick?: (point: ChartDataPoint) => void;
  onZoom?: (range: { start: number; end: number }) => void;
  onBrushSelect?: (selection: any) => void;
}

/**
 * Memoized chart statistics calculator
 */
function useChartStatistics(
  data: ChartDataPoint[],
  valueKey: string,
  enableMemoization: boolean
) {
  return useMemo(() => {
    if (!enableMemoization) {
      return calculateStatistics(data, valueKey);
    }

    return memoizedCalculation(data, `statistics-${valueKey}`, () =>
      calculateStatistics(data, valueKey)
    );
  }, [data, valueKey, enableMemoization]);
}

function calculateStatistics(data: ChartDataPoint[], valueKey: string) {
  const values = data
    .map((d) => Number(d[valueKey]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = sortedValues[Math.floor(sortedValues.length / 2)];
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];

  // Calculate standard deviation
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((acc, v) => acc + v, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    count: values.length,
    sum,
    mean,
    median,
    min,
    max,
    stdDev,
    variance,
  };
}

/**
 * Optimized chart wrapper component
 */
export const OptimizedChartWrapper = memo(
  function OptimizedChartWrapper({
    children,
    data,
    config,
    chartId,
    enableMemoization = true,
    debounceDelay = 200,
    className = '',
    onDataPointClick,
    onZoom,
    onBrushSelect,
  }: OptimizedChartWrapperProps) {
    // Memoize data processing
    const processedData = useMemo(() => {
      // Add any data preprocessing here
      return data;
    }, [data]);

    // Memoize config
    const memoizedConfig = useMemo(() => config, [config]);

    // Create debounced handlers
    const debouncedDataPointClick = useMemo(
      () =>
        onDataPointClick
          ? debounce(onDataPointClick, debounceDelay)
          : undefined,
      [onDataPointClick, debounceDelay]
    );

    const debouncedZoom = useMemo(
      () => (onZoom ? debounce(onZoom, debounceDelay) : undefined),
      [onZoom, debounceDelay]
    );

    const debouncedBrushSelect = useMemo(
      () =>
        onBrushSelect ? debounce(onBrushSelect, debounceDelay) : undefined,
      [onBrushSelect, debounceDelay]
    );

    // Clone children with optimized props
    const optimizedChildren = useMemo(() => {
      if (!React.isValidElement(children)) {
        return children;
      }

      return React.cloneElement(children as React.ReactElement<any>, {
        data: processedData,
        config: memoizedConfig,
        chartId,
        onDataPointClick: debouncedDataPointClick,
        onZoom: debouncedZoom,
        onBrushSelect: debouncedBrushSelect,
      });
    }, [
      children,
      processedData,
      memoizedConfig,
      chartId,
      debouncedDataPointClick,
      debouncedZoom,
      debouncedBrushSelect,
    ]);

    return <div className={className}>{optimizedChildren}</div>;
  },
  // Custom comparison function for memo
  (prevProps, nextProps) => {
    // Only re-render if data, config, or handlers change
    return (
      prevProps.data === nextProps.data &&
      prevProps.config === nextProps.config &&
      prevProps.chartId === nextProps.chartId &&
      prevProps.onDataPointClick === nextProps.onDataPointClick &&
      prevProps.onZoom === nextProps.onZoom &&
      prevProps.onBrushSelect === nextProps.onBrushSelect
    );
  }
);

/**
 * Hook for optimized chart interactions
 */
export function useOptimizedChartInteractions(debounceDelay: number = 200) {
  const [hoveredPoint, setHoveredPoint] = React.useState<ChartDataPoint | null>(
    null
  );
  const [selectedPoint, setSelectedPoint] = React.useState<ChartDataPoint | null>(
    null
  );
  const [zoomRange, setZoomRange] = React.useState<{
    start: number;
    end: number;
  } | null>(null);

  // Debounced hover handler
  const handleHover = useMemo(
    () =>
      debounce((point: ChartDataPoint | null) => {
        setHoveredPoint(point);
      }, debounceDelay),
    [debounceDelay]
  );

  // Immediate click handler (no debounce for clicks)
  const handleClick = useCallback((point: ChartDataPoint) => {
    setSelectedPoint(point);
  }, []);

  // Debounced zoom handler
  const handleZoom = useMemo(
    () =>
      debounce((range: { start: number; end: number }) => {
        setZoomRange(range);
      }, debounceDelay),
    [debounceDelay]
  );

  const resetZoom = useCallback(() => {
    setZoomRange(null);
  }, []);

  return {
    hoveredPoint,
    selectedPoint,
    zoomRange,
    handleHover,
    handleClick,
    handleZoom,
    resetZoom,
  };
}

export default OptimizedChartWrapper;
