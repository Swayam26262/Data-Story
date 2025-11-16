'use client';

import type { ChartData } from '@/lib/models/Story';
import { useMemo } from 'react';
import { useChartThemeOptional } from '@/lib/theme';

interface SparklineChartProps {
  data: ChartData;
  config: {
    valueField?: string;
    type?: 'line' | 'bar';
    color?: string;
    showIndicators?: boolean; // Show min/max/last indicators
    showTrendArrow?: boolean; // Show up/down trend arrow
    width?: number;
    height?: number;
    strokeWidth?: number;
  };
  chartId?: string;
}

export default function SparklineChart({
  data,
  config,
  chartId = 'sparkline',
}: SparklineChartProps) {
  const { theme, getColor } = useChartThemeOptional();
  const {
    valueField = 'value',
    type = 'line',
    color,
    showIndicators = true,
    showTrendArrow = true,
    width = 100,
    height = 30,
    strokeWidth = 1.5,
  } = config;

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  const sparklineColor = color || getColor(0);

  // Extract values and calculate statistics
  const { values, min, max, last, first, trend } = useMemo(() => {
    if (chartData.length === 0) {
      return { values: [], min: 0, max: 0, last: 0, first: 0, trend: 'stable' as const };
    }

    const vals = chartData.map((item: any) => Number(item[valueField]) || 0);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const lastVal = vals[vals.length - 1];
    const firstVal = vals[0];

    // Determine trend
    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (lastVal > firstVal * 1.05) {
      trendDirection = 'up';
    } else if (lastVal < firstVal * 0.95) {
      trendDirection = 'down';
    }

    return {
      values: vals,
      min: minVal,
      max: maxVal,
      last: lastVal,
      first: firstVal,
      trend: trendDirection,
    };
  }, [chartData, valueField]);

  // If no valid data, return empty
  if (values.length === 0) {
    return (
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className="flex items-center justify-center text-gray-400 text-xs"
      >
        No data
      </div>
    );
  }

  // Normalize values to fit in the sparkline height
  const normalizeValue = (value: number) => {
    if (max === min) return height / 2;
    return height - ((value - min) / (max - min)) * height;
  };

  // Generate SVG path for line sparkline
  const generateLinePath = () => {
    if (values.length === 0) return '';

    const step = width / (values.length - 1 || 1);
    const points = values.map((value, index) => {
      const x = index * step;
      const y = normalizeValue(value);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    });

    return points.join(' ');
  };

  // Generate bars for bar sparkline
  const generateBars = () => {
    if (values.length === 0) return [];

    const barWidth = width / values.length;
    const gap = barWidth * 0.1;

    return values.map((value, index) => {
      const x = index * barWidth + gap / 2;
      const barHeight = ((value - min) / (max - min || 1)) * height;
      const y = height - barHeight;

      return (
        <rect
          key={`bar-${index}`}
          x={x}
          y={y}
          width={barWidth - gap}
          height={barHeight}
          fill={sparklineColor}
          opacity={0.8}
        />
      );
    });
  };

  // Find positions for min/max indicators
  const minIndex = values.indexOf(min);
  const maxIndex = values.indexOf(max);
  const lastIndex = values.length - 1;

  const getIndicatorPosition = (index: number) => {
    const step = width / (values.length - 1 || 1);
    return {
      x: index * step,
      y: normalizeValue(values[index]),
    };
  };

  return (
    <div className="inline-flex items-center gap-2">
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        style={{ display: 'block' }}
      >
        {type === 'line' ? (
          <>
            {/* Line path */}
            <path
              d={generateLinePath()}
              fill="none"
              stroke={sparklineColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Indicators */}
            {showIndicators && (
              <>
                {/* Min indicator */}
                <circle
                  cx={getIndicatorPosition(minIndex).x}
                  cy={getIndicatorPosition(minIndex).y}
                  r={2}
                  fill={theme.colors.semantic.negative}
                />
                {/* Max indicator */}
                <circle
                  cx={getIndicatorPosition(maxIndex).x}
                  cy={getIndicatorPosition(maxIndex).y}
                  r={2}
                  fill={theme.colors.semantic.positive}
                />
                {/* Last value indicator */}
                <circle
                  cx={getIndicatorPosition(lastIndex).x}
                  cy={getIndicatorPosition(lastIndex).y}
                  r={2.5}
                  fill={sparklineColor}
                  stroke="white"
                  strokeWidth={1}
                />
              </>
            )}
          </>
        ) : (
          generateBars()
        )}
      </svg>

      {/* Trend arrow */}
      {showTrendArrow && (
        <span
          className="text-xs font-semibold"
          style={{
            color:
              trend === 'up'
                ? theme.colors.semantic.positive
                : trend === 'down'
                ? theme.colors.semantic.negative
                : theme.colors.semantic.neutral,
          }}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      )}

      {/* Last value */}
      {showIndicators && (
        <span
          className="text-xs font-medium"
          style={{ color: theme.typography.dataLabel.color }}
        >
          {last.toLocaleString()}
        </span>
      )}
    </div>
  );
}
