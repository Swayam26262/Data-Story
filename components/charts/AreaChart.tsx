'use client';

/**
 * Area Chart Component
 * Area chart with fill under line
 * Supports stacked, percentage, and overlapping modes with gradient fills
 */

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
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
 * Area series configuration
 */
export interface AreaSeries {
  dataKey: string;
  name?: string;
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
}

/**
 * Stacking mode for area chart
 */
export type StackMode = 'none' | 'stacked' | 'percentage' | 'expand';

/**
 * Props for AreaChart component
 */
export interface AreaChartProps extends Omit<BaseChartProps, 'config'> {
  series: AreaSeries[];
  config?: {
    xAxis?: string;
    yAxis?: string;
    stackMode?: StackMode;
    curveType?: 'monotone' | 'linear' | 'natural' | 'step';
    showGrid?: boolean;
    showLegend?: boolean;
    useGradient?: boolean;
  };
}

/**
 * Area Chart Component
 * Renders area visualization with various stacking modes
 */
function AreaChartInner({
  data,
  series,
  title,
  config = {},
  height = 400,
  width = '100%',
  className,
  onDataPointClick,
}: AreaChartProps) {
  const { theme, getColor, gridStyle, axisStyle, animationDuration } = useBaseChartConfig();
  
  const {
    xAxis = 'x',
    stackMode = 'none',
    curveType = 'monotone',
    showGrid = true,
    showLegend = true,
    useGradient = true,
  } = config;

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <BaseChart title={title} height={height} width={width} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available for this area chart</p>
        </div>
      </BaseChart>
    );
  }

  // Determine if we should stack
  const stackId = stackMode !== 'none' ? 'stack' : undefined;
  
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
        <RechartsAreaChart
          data={chartData}
          margin={{
            top: theme.tokens.spacing.chartPadding.top,
            right: theme.tokens.spacing.chartPadding.right,
            bottom: theme.tokens.spacing.chartPadding.bottom,
            left: theme.tokens.spacing.chartPadding.left,
          }}
          onClick={handleClick}
          stackOffset={stackMode === 'percentage' || stackMode === 'expand' ? 'expand' : undefined}
        >
          {/* Gradient definitions */}
          {useGradient && (
            <defs>
              {series.map((s, index) => {
                const color = s.color || getColor(index);
                return (
                  <linearGradient
                    key={`gradient-${s.dataKey}`}
                    id={`gradient-${s.dataKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                );
              })}
            </defs>
          )}
          
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
            stroke={axisStyle.stroke}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: theme.typography.axisLabel.fontSize,
            }}
            tickFormatter={
              stackMode === 'percentage' || stackMode === 'expand'
                ? (value) => `${(value * 100).toFixed(0)}%`
                : undefined
            }
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
            formatter={
              stackMode === 'percentage' || stackMode === 'expand'
                ? (value: any) => {
                    if (typeof value === 'number') {
                      return `${(value * 100).toFixed(1)}%`;
                    }
                    return value;
                  }
                : undefined
            }
          />
          
          {showLegend && (
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
            const fillColor = useGradient ? `url(#gradient-${s.dataKey})` : color;
            
            return (
              <Area
                key={s.dataKey}
                type={curveType}
                dataKey={s.dataKey}
                name={name}
                stroke={color}
                fill={fillColor}
                fillOpacity={useGradient ? 1 : (s.fillOpacity ?? 0.3)}
                strokeWidth={s.strokeWidth ?? 2}
                stackId={stackId}
                animationDuration={animationDuration}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </BaseChart>
  );
}

/**
 * AreaChart with Error Boundary
 */
export function AreaChart(props: AreaChartProps) {
  return (
    <ChartErrorBoundary chartType="area">
      <AreaChartInner {...props} />
    </ChartErrorBoundary>
  );
}

export default AreaChart;
