'use client';

/**
 * Radar Chart Component
 * Multi-dimensional comparison with spider/radar visualization
 * Supports multiple series overlay and customizable axis ranges
 */

import React, { useState } from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BaseChart, useBaseChartConfig, type BaseChartProps } from './BaseChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';

/**
 * Radar series configuration
 */
export interface RadarSeries {
  name: string;
  dataKey: string;
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
}

/**
 * Props for RadarChart component
 */
export interface RadarChartProps extends Omit<BaseChartProps, 'config'> {
  dimensions: string[];
  series: RadarSeries[];
  config?: {
    angleKey?: string;
    minValue?: number;
    maxValue?: number;
    showGrid?: boolean;
    showLegend?: boolean;
    gridLevels?: number;
  };
}

/**
 * Radar Chart Component
 * Renders multi-dimensional comparison visualization
 */
function RadarChartInner({
  data,
  dimensions,
  series,
  title,
  config = {},
  height = 400,
  width = '100%',
  className,
  onDataPointClick,
}: RadarChartProps) {
  const { theme, getColor, animationDuration } = useBaseChartConfig();
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  
  const {
    angleKey = 'dimension',
    minValue = 0,
    maxValue,
    showGrid = true,
    showLegend = true,
    gridLevels = 5,
  } = config;

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <BaseChart title={title} height={height} width={width} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available for this radar chart</p>
        </div>
      </BaseChart>
    );
  }

  // Calculate max value if not provided
  const calculatedMaxValue = React.useMemo(() => {
    if (maxValue !== undefined) return maxValue;
    
    const allValues: number[] = [];
    chartData.forEach(point => {
      series.forEach(s => {
        const value = point[s.dataKey];
        if (typeof value === 'number') {
          allValues.push(value);
        }
      });
    });
    
    return allValues.length > 0 ? Math.max(...allValues) * 1.1 : 100;
  }, [chartData, series, maxValue]);

  // Handle legend click to toggle series
  const handleLegendClick = (dataKey: string) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  // Handle data point click
  const handleClick = (data: any) => {
    if (onDataPointClick && data) {
      onDataPointClick({
        x: data[angleKey],
        y: data.value,
        ...data,
      });
    }
  };

  return (
    <BaseChart title={title} height={height} width={width} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          data={chartData}
          onClick={handleClick}
        >
          {showGrid && (
            <PolarGrid
              stroke={theme.tokens.borders.gridLineColor}
              strokeWidth={theme.tokens.borders.gridLineWidth}
            />
          )}
          
          <PolarAngleAxis
            dataKey={angleKey}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: theme.typography.axisLabel.fontSize,
            }}
          />
          
          <PolarRadiusAxis
            angle={90}
            domain={[minValue, calculatedMaxValue]}
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
          
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: `${theme.tokens.spacing.legendSpacing}px`,
                fontSize: `${theme.typography.legend.fontSize}px`,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                if (e.dataKey) {
                  handleLegendClick(String(e.dataKey));
                }
              }}
            />
          )}
          
          {series.map((s, index) => {
            if (hiddenSeries.has(s.dataKey)) return null;
            
            const color = s.color || getColor(index);
            
            return (
              <Radar
                key={s.dataKey}
                name={s.name}
                dataKey={s.dataKey}
                stroke={color}
                fill={color}
                fillOpacity={s.fillOpacity ?? 0.3}
                strokeWidth={s.strokeWidth ?? 2}
                animationDuration={animationDuration}
              />
            );
          })}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
}

/**
 * RadarChart with Error Boundary
 */
export function RadarChart(props: RadarChartProps) {
  return (
    <ChartErrorBoundary chartType="radar">
      <RadarChartInner {...props} />
    </ChartErrorBoundary>
  );
}

export default RadarChart;
