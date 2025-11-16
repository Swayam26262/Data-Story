/**
 * Tooltip Utility Functions
 * Helper functions for calculating tooltip statistics and formatting data
 */

import type { TooltipData } from '@/types';

/**
 * Calculate percentage of total for a value
 */
export function calculatePercentOfTotal(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calculate rank of a value in a dataset
 * Returns 1-based rank (1 = highest value)
 */
export function calculateRank(value: number, dataset: number[]): number {
  const sorted = [...dataset].sort((a, b) => b - a);
  return sorted.indexOf(value) + 1;
}

/**
 * Calculate comparison to average as percentage
 */
export function calculateComparisonToAverage(
  value: number,
  average: number
): number {
  if (average === 0) return 0;
  return ((value - average) / average) * 100;
}

/**
 * Calculate average of a dataset
 */
export function calculateAverage(dataset: number[]): number {
  if (dataset.length === 0) return 0;
  return dataset.reduce((sum, val) => sum + val, 0) / dataset.length;
}

/**
 * Determine trend based on comparison value
 */
export function determineTrend(
  comparisonToAverage: number,
  threshold: number = 5
): 'up' | 'down' | 'stable' {
  if (comparisonToAverage > threshold) return 'up';
  if (comparisonToAverage < -threshold) return 'down';
  return 'stable';
}

/**
 * Create tooltip data with automatic statistics calculation
 */
export interface CreateTooltipDataOptions {
  title: string;
  value: number;
  label?: string;
  color?: string;
  unit?: string;
  dataset?: number[];
  includeStatistics?: boolean;
  additionalMetrics?: Array<{
    label: string;
    value: string | number;
    color?: string;
    unit?: string;
  }>;
  customContent?: React.ReactNode;
}

export function createTooltipData(
  options: CreateTooltipDataOptions
): TooltipData {
  const {
    title,
    value,
    label = 'Value',
    color,
    unit,
    dataset = [],
    includeStatistics = true,
    additionalMetrics = [],
    customContent,
  } = options;

  const metrics = [
    { label, value, color, unit },
    ...additionalMetrics,
  ];

  let statistics;
  if (includeStatistics && dataset.length > 0) {
    const total = dataset.reduce((sum, val) => sum + val, 0);
    const average = calculateAverage(dataset);
    const percentOfTotal = calculatePercentOfTotal(value, total);
    const rank = calculateRank(value, dataset);
    const comparisonToAverage = calculateComparisonToAverage(value, average);
    const trend = determineTrend(comparisonToAverage);

    statistics = {
      percentOfTotal,
      rank,
      comparisonToAverage,
      trend,
    };
  }

  return {
    title,
    metrics,
    statistics,
    customContent,
  };
}

/**
 * Format number with locale and optional decimal places
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency value
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return value.toLocaleString(locale, {
    style: 'currency',
    currency,
  });
}

/**
 * Format percentage value
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Create tooltip data for time series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: string | Date;
  value: number;
  label?: string;
  color?: string;
  unit?: string;
}

export function createTimeSeriesTooltip(
  dataPoint: TimeSeriesDataPoint,
  allValues: number[],
  options?: {
    showMovingAverage?: boolean;
    movingAveragePeriod?: number;
    showYoYChange?: boolean;
    previousYearValue?: number;
  }
): TooltipData {
  const { timestamp, value, label = 'Value', color, unit } = dataPoint;
  const {
    showMovingAverage = false,
    movingAveragePeriod = 7,
    showYoYChange = false,
    previousYearValue,
  } = options || {};

  const metrics: TooltipData['metrics'] = [
    { label, value, color, unit },
  ];

  // Add moving average if requested
  if (showMovingAverage && allValues.length >= movingAveragePeriod) {
    const recentValues = allValues.slice(-movingAveragePeriod);
    const movingAvg = calculateAverage(recentValues);
    metrics.push({
      label: `${movingAveragePeriod}-day MA`,
      value: movingAvg,
      color: '#6b7280',
      unit,
    });
  }

  // Add YoY change if requested
  if (showYoYChange && previousYearValue !== undefined) {
    const yoyChange = ((value - previousYearValue) / previousYearValue) * 100;
    metrics.push({
      label: 'YoY Change',
      value: `${yoyChange > 0 ? '+' : ''}${yoyChange.toFixed(1)}%`,
      color: yoyChange > 0 ? '#10b981' : '#ef4444',
    });
  }

  const average = calculateAverage(allValues);
  const comparisonToAverage = calculateComparisonToAverage(value, average);

  return {
    title: typeof timestamp === 'string' ? timestamp : timestamp.toLocaleDateString(),
    metrics,
    statistics: {
      rank: calculateRank(value, allValues),
      comparisonToAverage,
      trend: determineTrend(comparisonToAverage),
    },
  };
}

/**
 * Create tooltip data for categorical data
 */
export interface CategoricalDataPoint {
  category: string;
  value: number;
  color?: string;
  unit?: string;
}

export function createCategoricalTooltip(
  dataPoint: CategoricalDataPoint,
  allValues: number[]
): TooltipData {
  const { category, value, color, unit } = dataPoint;
  const total = allValues.reduce((sum, val) => sum + val, 0);
  const average = calculateAverage(allValues);

  return {
    title: category,
    metrics: [
      { label: 'Value', value, color, unit },
    ],
    statistics: {
      percentOfTotal: calculatePercentOfTotal(value, total),
      rank: calculateRank(value, allValues),
      comparisonToAverage: calculateComparisonToAverage(value, average),
      trend: determineTrend(calculateComparisonToAverage(value, average)),
    },
  };
}

/**
 * Create tooltip data for multi-metric comparison
 */
export interface MultiMetricDataPoint {
  title: string;
  metrics: Array<{
    label: string;
    value: number;
    color?: string;
    unit?: string;
    dataset?: number[];
  }>;
}

export function createMultiMetricTooltip(
  dataPoint: MultiMetricDataPoint
): TooltipData {
  const { title, metrics } = dataPoint;

  // Calculate statistics for the first metric if dataset is provided
  let statistics;
  if (metrics.length > 0 && metrics[0].dataset) {
    const { value, dataset } = metrics[0];
    const average = calculateAverage(dataset);
    const total = dataset.reduce((sum, val) => sum + val, 0);

    statistics = {
      percentOfTotal: calculatePercentOfTotal(value, total),
      rank: calculateRank(value, dataset),
      comparisonToAverage: calculateComparisonToAverage(value, average),
      trend: determineTrend(calculateComparisonToAverage(value, average)),
    };
  }

  return {
    title,
    metrics: metrics.map(({ label, value, color, unit }) => ({
      label,
      value,
      color,
      unit,
    })),
    statistics,
  };
}

/**
 * Create enhanced tooltip - simple wrapper for direct TooltipData creation
 * This is a convenience function for creating tooltips with pre-calculated statistics
 */
export function createEnhancedTooltip(data: TooltipData): React.ReactElement {
  // Return a simple div that will be rendered by the TooltipManager
  return React.createElement('div', {
    className: 'bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[320px]',
  }, [
    // Title
    data.title && React.createElement('div', {
      key: 'title',
      className: 'font-semibold text-gray-900 text-sm mb-2 pb-2 border-b border-gray-100',
    }, data.title),
    
    // Metrics
    data.metrics && data.metrics.length > 0 && React.createElement('div', {
      key: 'metrics',
      className: 'space-y-1.5 mb-2',
    }, data.metrics.map((metric, index) => 
      React.createElement('div', {
        key: `metric-${index}`,
        className: 'flex items-center justify-between text-xs',
      }, [
        React.createElement('div', {
          key: 'label',
          className: 'flex items-center gap-2',
        }, [
          metric.color && React.createElement('div', {
            key: 'color',
            className: 'w-3 h-3 rounded-sm flex-shrink-0',
            style: { backgroundColor: metric.color },
          }),
          React.createElement('span', {
            key: 'text',
            className: 'text-gray-600',
          }, `${metric.label}:`),
        ]),
        React.createElement('span', {
          key: 'value',
          className: 'font-medium text-gray-900 ml-2',
        }, [
          typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value,
          metric.unit && React.createElement('span', {
            key: 'unit',
            className: 'text-gray-500 ml-0.5',
          }, metric.unit),
        ]),
      ])
    )),
    
    // Statistics
    data.statistics && React.createElement('div', {
      key: 'statistics',
      className: 'pt-2 border-t border-gray-100 space-y-1.5',
    }, [
      data.statistics.percentOfTotal !== undefined && React.createElement('div', {
        key: 'percent',
        className: 'flex items-center justify-between text-xs',
      }, [
        React.createElement('span', { key: 'label', className: 'text-gray-600' }, '% of Total:'),
        React.createElement('span', { key: 'value', className: 'font-medium text-gray-900' }, 
          `${data.statistics.percentOfTotal.toFixed(1)}%`
        ),
      ]),
      data.statistics.rank !== undefined && React.createElement('div', {
        key: 'rank',
        className: 'flex items-center justify-between text-xs',
      }, [
        React.createElement('span', { key: 'label', className: 'text-gray-600' }, 'Rank:'),
        React.createElement('span', { key: 'value', className: 'font-medium text-gray-900' }, 
          `#${data.statistics.rank}`
        ),
      ]),
      data.statistics.comparisonToAverage !== undefined && React.createElement('div', {
        key: 'comparison',
        className: 'flex items-center justify-between text-xs',
      }, [
        React.createElement('span', { key: 'label', className: 'text-gray-600' }, 'vs. Average:'),
        React.createElement('span', { 
          key: 'value', 
          className: `font-medium ${data.statistics.comparisonToAverage > 0 ? 'text-green-600' : data.statistics.comparisonToAverage < 0 ? 'text-red-600' : 'text-gray-600'}`,
        }, 
          `${data.statistics.comparisonToAverage > 0 ? '+' : ''}${data.statistics.comparisonToAverage.toFixed(1)}%`
        ),
      ]),
    ]),
    
    // Custom content
    data.customContent && React.createElement('div', {
      key: 'custom',
      className: 'pt-2 border-t border-gray-100 text-xs',
    }, data.customContent),
  ]);
}

// Import React for createElement
import React from 'react';
