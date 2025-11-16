'use client';

import type { ChartData } from '@/lib/models/Story';
import { useMemo } from 'react';
import { useChartThemeOptional } from '@/lib/theme';
import SparklineChart from './SparklineChart';

interface KPICardProps {
  title: string;
  data: ChartData;
  config: {
    valueField?: string;
    targetField?: string;
    previousField?: string;
    trendData?: ChartData; // Optional separate data for sparkline
    unit?: string;
    prefix?: string; // e.g., "$", "€"
    suffix?: string; // e.g., "%", "K", "M"
    showSparkline?: boolean;
    showTrend?: boolean;
    showTarget?: boolean;
    thresholds?: {
      good: number;
      warning: number;
    };
  };
  chartId?: string;
}

export default function KPICard({
  title,
  data,
  config,
  chartId = 'kpi-card',
}: KPICardProps) {
  const { theme, getSemanticColor } = useChartThemeOptional();
  const {
    valueField = 'value',
    targetField = 'target',
    previousField = 'previous',
    trendData,
    unit = '',
    prefix = '',
    suffix = '',
    showSparkline = true,
    showTrend = true,
    showTarget = true,
    thresholds,
  } = config;

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  // Extract current value, target, and previous value
  const { currentValue, targetValue, previousValue, percentChange, status } = useMemo(() => {
    if (chartData.length === 0) {
      return {
        currentValue: 0,
        targetValue: 0,
        previousValue: 0,
        percentChange: 0,
        status: 'neutral' as const,
      };
    }

    // Get the most recent data point (last item)
    const latestData = chartData[chartData.length - 1];
    const current = Number(latestData[valueField]) || 0;
    const target = Number(latestData[targetField]) || 0;
    const previous = Number(latestData[previousField]) || 0;

    // Calculate percentage change
    let change = 0;
    if (previous !== 0) {
      change = ((current - previous) / Math.abs(previous)) * 100;
    } else if (current !== 0) {
      change = 100;
    }

    // Determine status based on thresholds or target
    let statusValue: 'good' | 'warning' | 'poor' | 'neutral' = 'neutral';
    
    if (thresholds) {
      if (current >= thresholds.good) {
        statusValue = 'good';
      } else if (current >= thresholds.warning) {
        statusValue = 'warning';
      } else {
        statusValue = 'poor';
      }
    } else if (target > 0) {
      const percentOfTarget = (current / target) * 100;
      if (percentOfTarget >= 100) {
        statusValue = 'good';
      } else if (percentOfTarget >= 90) {
        statusValue = 'warning';
      } else {
        statusValue = 'poor';
      }
    } else if (change > 5) {
      statusValue = 'good';
    } else if (change < -5) {
      statusValue = 'poor';
    }

    return {
      currentValue: current,
      targetValue: target,
      previousValue: previous,
      percentChange: change,
      status: statusValue,
    };
  }, [chartData, valueField, targetField, previousField, thresholds]);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return getSemanticColor('positive');
      case 'warning':
        return getSemanticColor('warning');
      case 'poor':
        return getSemanticColor('negative');
      default:
        return getSemanticColor('neutral');
    }
  };

  // Format value with prefix/suffix
  const formatValue = (value: number) => {
    return `${prefix}${value.toLocaleString()}${suffix}`;
  };

  // If no valid data, show placeholder
  if (chartData.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="text-center text-gray-500">
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
      style={{
        borderColor: getStatusColor(),
        borderWidth: '2px',
      }}
    >
      {/* Title */}
      <div
        className="text-sm font-medium mb-2"
        style={{
          color: theme.typography.axisLabel.color,
        }}
      >
        {title}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline justify-between mb-2">
        <div
          className="text-3xl font-bold"
          style={{
            color: theme.typography.title.color,
          }}
        >
          {formatValue(currentValue)}
        </div>

        {/* Status Indicator */}
        <div
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: getStatusColor(),
          }}
        />
      </div>

      {/* Trend Indicator */}
      {showTrend && previousValue !== 0 && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-sm font-semibold flex items-center"
            style={{
              color: percentChange >= 0 ? getSemanticColor('positive') : getSemanticColor('negative'),
            }}
          >
            {percentChange >= 0 ? '↑' : '↓'}
            {Math.abs(percentChange).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">vs. previous</span>
        </div>
      )}

      {/* Target Comparison */}
      {showTarget && targetValue > 0 && (
        <div className="text-xs text-gray-600 mb-2">
          Target: {formatValue(targetValue)}
          <span
            className="ml-2 font-semibold"
            style={{
              color: currentValue >= targetValue ? getSemanticColor('positive') : getSemanticColor('warning'),
            }}
          >
            ({((currentValue / targetValue) * 100).toFixed(0)}%)
          </span>
        </div>
      )}

      {/* Sparkline */}
      {showSparkline && (trendData || chartData.length > 1) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <SparklineChart
            data={trendData || chartData}
            config={{
              valueField,
              type: 'line',
              color: getStatusColor(),
              showIndicators: false,
              showTrendArrow: false,
              width: 200,
              height: 30,
            }}
            chartId={`${chartId}-sparkline`}
          />
        </div>
      )}

      {/* Status Label */}
      <div className="mt-2 text-xs font-medium text-center">
        <span
          className="px-2 py-1 rounded"
          style={{
            backgroundColor: `${getStatusColor()}20`,
            color: getStatusColor(),
          }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
}
