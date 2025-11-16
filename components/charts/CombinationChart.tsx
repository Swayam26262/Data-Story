'use client';

/**
 * Combination Chart Component
 * Supports multiple series with different chart types (line, bar, area) on the same axes
 * Includes dual Y-axis support for different scales
 */

import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BaseChart, useBaseChartConfig, type BaseChartProps } from './BaseChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';

/**
 * Series configuration for combination chart
 */
export interface CombinationSeries {
  type: 'line' | 'bar' | 'area';
  dataKey: string;
  name?: string;
  yAxisId: 'left' | 'right';
  color?: string;
  strokeWidth?: number;
  fillOpacity?: number;
}

/**
 * Props for CombinationChart component
 */
export interface CombinationChartProps extends Omit<BaseChartProps, 'config'> {
  series: CombinationSeries[];
  config?: {
    xAxis?: string;
    leftYAxisLabel?: string;
    rightYAxisLabel?: string;
    legend?: boolean;
    showGrid?: boolean;
  };
}

/**
 * Combination Chart Component
 * Renders multiple data series with different visualization types
 */
function CombinationChartInner({
  data,
  title,
  series,
  config = {},
  height = 400,
  width = '100%',
  className,
  onDataPointClick,
}: CombinationChartProps) {
  const { theme, getColor, gridStyle, axisStyle, animationDuration } = useBaseChartConfig();
  
  const {
    xAxis = 'x',
    leftYAxisLabel,
    rightYAxisLabel,
    legend = true,
    showGrid = true,
  } = config;

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <BaseChart title={title} height={height} width={width} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available for this chart</p>
        </div>
      </BaseChart>
    );
  }

  // Check if we need right Y-axis
  const hasRightAxis = series.some(s => s.yAxisId === 'right');

  // Handle data point click
  const handleClick = (data: any) => {
    if (onDataPointClick && data) {
      onDataPointClick({
        x: data[xAxis],
        y: data.value,
        ...data,
      });
    }
  };

  return (
    <BaseChart title={title} height={height} width={width} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: theme.tokens.spacing.chartPadding.top,
            right: hasRightAxis ? theme.tokens.spacing.chartPadding.right + 20 : theme.tokens.spacing.chartPadding.right,
            bottom: theme.tokens.spacing.chartPadding.bottom,
            left: theme.tokens.spacing.chartPadding.left,
          }}
          onClick={handleClick}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray={gridStyle.strokeDasharray}
              stroke={gridStyle.stroke}
              strokeWidth={gridStyle.strokeWidth}
            />
          )}
          
          <XAxis
            dataKey={xAxis}
            stroke={axisStyle.stroke}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: theme.typography.axisLabel.fontSize,
            }}
          />
          
          <YAxis
            yAxisId="left"
            stroke={axisStyle.stroke}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: theme.typography.axisLabel.fontSize,
            }}
            label={
              leftYAxisLabel
                ? {
                    value: leftYAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    style: {
                      fill: theme.typography.axisLabel.color,
                      fontSize: theme.typography.axisLabel.fontSize,
                    },
                  }
                : undefined
            }
          />
          
          {hasRightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={axisStyle.stroke}
              tick={{
                fill: theme.typography.axisLabel.color,
                fontSize: theme.typography.axisLabel.fontSize,
              }}
              label={
                rightYAxisLabel
                  ? {
                      value: rightYAxisLabel,
                      angle: 90,
                      position: 'insideRight',
                      style: {
                        fill: theme.typography.axisLabel.color,
                        fontSize: theme.typography.axisLabel.fontSize,
                      },
                    }
                  : undefined
              }
            />
          )}
          
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
            />
          )}
          
          {series.map((s, index) => {
            const color = s.color || getColor(index);
            const name = s.name || s.dataKey;
            
            switch (s.type) {
              case 'bar':
                return (
                  <Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    name={name}
                    fill={color}
                    yAxisId={s.yAxisId}
                    animationDuration={animationDuration}
                  />
                );
              
              case 'area':
                return (
                  <Area
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={name}
                    fill={color}
                    stroke={color}
                    fillOpacity={s.fillOpacity ?? 0.3}
                    strokeWidth={s.strokeWidth ?? 2}
                    yAxisId={s.yAxisId}
                    animationDuration={animationDuration}
                  />
                );
              
              case 'line':
              default:
                return (
                  <Line
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={name}
                    stroke={color}
                    strokeWidth={s.strokeWidth ?? 2}
                    dot={{ fill: color, r: 3 }}
                    activeDot={{ r: 5 }}
                    yAxisId={s.yAxisId}
                    animationDuration={animationDuration}
                  />
                );
            }
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </BaseChart>
  );
}

/**
 * Combination Chart with Error Boundary
 */
export function CombinationChart(props: CombinationChartProps) {
  return (
    <ChartErrorBoundary chartType="combination">
      <CombinationChartInner {...props} />
    </ChartErrorBoundary>
  );
}

export default CombinationChart;
