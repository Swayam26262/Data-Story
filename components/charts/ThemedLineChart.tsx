'use client';

/**
 * Themed Line Chart Component
 * Example of using the professional theme system with Recharts
 */

import type { ChartData } from '@/lib/models/Story';
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useChartThemeOptional } from '@/lib/theme';

interface ThemedLineChartProps {
  data: ChartData;
  title: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    legend?: boolean;
  };
}

/**
 * Line Chart with Professional Theme Applied
 * This component demonstrates how to integrate the theme system
 */
export default function ThemedLineChart({ data, title, config }: ThemedLineChartProps) {
  const { theme, getColor } = useChartThemeOptional();
  const { xAxis = 'x', yAxis = 'y', colors, legend = true } = config;

  // Use theme colors if custom colors not provided
  const chartColors = colors || [getColor(0)];

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  // If no valid data, show error message
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No data available for this chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[250px] sm:min-h-[300px]">
      <h3
        style={{
          fontSize: `${theme.typography.title.fontSize}px`,
          fontWeight: theme.typography.title.fontWeight,
          color: theme.typography.title.color,
          marginBottom: `${theme.tokens.spacing.titleMargin}px`,
        }}
      >
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <RechartsLineChart
          data={chartData}
          margin={{
            top: theme.tokens.spacing.chartPadding.top,
            right: theme.tokens.spacing.chartPadding.right,
            bottom: theme.tokens.spacing.chartPadding.bottom,
            left: theme.tokens.spacing.chartPadding.left,
          }}
        >
          <CartesianGrid
            strokeDasharray={theme.tokens.borders.gridLineDash.join(' ')}
            stroke={theme.tokens.borders.gridLineColor}
            strokeWidth={theme.tokens.borders.gridLineWidth}
          />
          <XAxis
            dataKey={xAxis}
            stroke={theme.tokens.borders.axisLineColor}
            style={{
              fontSize: `${theme.typography.axisLabel.fontSize}px`,
              fontWeight: theme.typography.axisLabel.fontWeight,
            }}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: theme.typography.axisLabel.fontSize,
            }}
          />
          <YAxis
            stroke={theme.tokens.borders.axisLineColor}
            style={{
              fontSize: `${theme.typography.axisLabel.fontSize}px`,
              fontWeight: theme.typography.axisLabel.fontWeight,
            }}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: theme.typography.axisLabel.fontSize,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: `${theme.typography.tooltip.fontSize}px`,
              boxShadow: theme.tokens.shadows.tooltip,
            }}
            labelStyle={{
              color: theme.typography.tooltip.color,
              fontWeight: 600,
            }}
          />
          {legend && (
            <Legend
              wrapperStyle={{
                paddingTop: `${theme.tokens.spacing.legendSpacing}px`,
                fontSize: `${theme.typography.legend.fontSize}px`,
              }}
              iconType="line"
            />
          )}
          <Line
            type="monotone"
            dataKey={yAxis}
            stroke={chartColors[0]}
            strokeWidth={2}
            dot={{ fill: chartColors[0], r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={theme.tokens.animations.duration}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
