'use client';

import React from 'react';
import type { ChartData } from '@/lib/models/Story';
import type { ComparisonResult } from '@/lib/aggregation';
import { LineChart, BarChart, ScatterPlot, PieChart } from './';
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

interface AggregatedChartProps {
  chartId: string;
  type: 'line' | 'bar' | 'scatter' | 'pie';
  title: string;
  data: ChartData;
  config: {
    xAxis?: string;
    yAxis?: string;
    nameKey?: string;
    valueKey?: string;
    colors?: string[];
    legend?: boolean;
    orientation?: 'horizontal' | 'vertical';
    trendLine?: boolean;
  };
  comparisonResult?: ComparisonResult | null;
  showComparison?: boolean;
}

export default function AggregatedChart({
  chartId,
  type,
  title,
  data,
  config,
  comparisonResult,
  showComparison = false,
}: AggregatedChartProps) {
  // For charts that don't support comparison overlay (pie, scatter), just render normally
  if (type === 'pie' || type === 'scatter' || !showComparison || !comparisonResult) {
    switch (type) {
      case 'line':
        return <LineChart data={data} title={title} config={config} />;
      case 'bar':
        return <BarChart data={data} title={title} config={config} />;
      case 'scatter':
        return <ScatterPlot data={data} title={title} config={config} />;
      case 'pie':
        return <PieChart data={data} title={title} config={config} />;
      default:
        return null;
    }
  }

  // For line and bar charts, render with comparison overlay
  const { xAxis = 'x', yAxis = 'y', colors = ['#3b82f6'], legend = true } = config;

  // Combine current and previous data for overlay
  const currentData = comparisonResult.current;
  const previousData = comparisonResult.previous;

  // Create a merged dataset with both current and previous values
  const mergedData = currentData.map((currentPoint) => {
    const dateKey = currentPoint[xAxis];
    const previousPoint = previousData.find((p) => p[xAxis] === dateKey);

    return {
      ...currentPoint,
      [`${yAxis}_current`]: currentPoint[yAxis],
      [`${yAxis}_previous`]: previousPoint ? previousPoint[yAxis] : null,
    };
  });

  if (mergedData.length === 0) {
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
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <RechartsLineChart
          data={mergedData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey={xAxis}
            stroke="#A0A0A0"
            style={{ fontSize: '11px' }}
            tick={{ fontSize: 11, fill: '#A0A0A0' }}
          />
          <YAxis
            stroke="#A0A0A0"
            style={{ fontSize: '11px' }}
            tick={{ fontSize: 11, fill: '#A0A0A0' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#D4D4D4',
            }}
            labelStyle={{ color: '#ffffff', fontWeight: 600 }}
          />
          {legend && (
            <Legend
              wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
              formatter={(value) => {
                if (value === `${yAxis}_current`) return 'Current Period';
                if (value === `${yAxis}_previous`) return 'Previous Period';
                return value;
              }}
            />
          )}
          {/* Current period line */}
          <Line
            type="monotone"
            dataKey={`${yAxis}_current`}
            stroke={colors[0]}
            strokeWidth={2}
            dot={{ fill: colors[0], r: 3 }}
            activeDot={{ r: 5 }}
            name="Current Period"
          />
          {/* Previous period line (dashed) */}
          <Line
            type="monotone"
            dataKey={`${yAxis}_previous`}
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#9ca3af', r: 3 }}
            activeDot={{ r: 5 }}
            name="Previous Period"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
