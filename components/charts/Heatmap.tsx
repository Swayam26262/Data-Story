'use client';

/**
 * Heatmap Component
 * Color-coded matrix visualization with interactive cells
 * Supports correlation matrices and sequential/diverging color scales
 */

import React, { useState } from 'react';
import { BaseChart, useBaseChartConfig, type BaseChartProps } from './BaseChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import { interpolateColor } from '@/lib/theme/utils';

/**
 * Color scale type for heatmap
 */
export type ColorScaleType = 'sequential' | 'diverging';

/**
 * Heatmap cell data
 */
export interface HeatmapCell {
  x: string | number;
  y: string | number;
  value: number;
  label?: string;
}

/**
 * Props for Heatmap component
 */
export interface HeatmapProps extends Omit<BaseChartProps, 'data' | 'config'> {
  data: HeatmapCell[] | number[][];
  xLabels: string[];
  yLabels: string[];
  config?: {
    colorScale?: ColorScaleType;
    minValue?: number;
    maxValue?: number;
    showValues?: boolean;
    cellSize?: number;
    cellPadding?: number;
    customColors?: string[];
  };
}

/**
 * Heatmap Component
 * Renders a color-coded matrix visualization
 */
function HeatmapInner({
  data,
  xLabels,
  yLabels,
  title,
  config = {},
  height = 400,
  width = '100%',
  className,
  onDataPointClick,
}: HeatmapProps) {
  const { theme, getColor } = useBaseChartConfig();
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  
  const {
    colorScale = 'sequential',
    minValue,
    maxValue,
    showValues = true,
    cellSize = 40,
    cellPadding = 2,
    customColors,
  } = config;

  // Convert data to normalized format
  const normalizedData: HeatmapCell[] = React.useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      // Check if it's already in HeatmapCell format
      if (typeof data[0] === 'object' && 'value' in data[0]) {
        return data as HeatmapCell[];
      }
      
      // Convert from 2D array format
      if (Array.isArray(data[0])) {
        const cells: HeatmapCell[] = [];
        (data as number[][]).forEach((row, yIndex) => {
          row.forEach((value, xIndex) => {
            cells.push({
              x: xLabels[xIndex] || xIndex,
              y: yLabels[yIndex] || yIndex,
              value,
            });
          });
        });
        return cells;
      }
    }
    return [];
  }, [data, xLabels, yLabels]);

  // Calculate min and max values
  const { min, max } = React.useMemo(() => {
    if (normalizedData.length === 0) {
      return { min: 0, max: 1 };
    }
    
    const values = normalizedData.map(cell => cell.value);
    return {
      min: minValue ?? Math.min(...values),
      max: maxValue ?? Math.max(...values),
    };
  }, [normalizedData, minValue, maxValue]);

  // Get color for a value
  const getColorForValue = (value: number): string => {
    if (customColors && customColors.length >= 2) {
      const normalized = (value - min) / (max - min);
      if (colorScale === 'diverging') {
        // For diverging, use middle color at 0.5
        if (normalized < 0.5) {
          return interpolateColor(
            customColors[0],
            customColors[Math.floor(customColors.length / 2)],
            normalized * 2
          );
        } else {
          return interpolateColor(
            customColors[Math.floor(customColors.length / 2)],
            customColors[customColors.length - 1],
            (normalized - 0.5) * 2
          );
        }
      } else {
        // Sequential: interpolate from first to last
        const index = Math.floor(normalized * (customColors.length - 1));
        const nextIndex = Math.min(index + 1, customColors.length - 1);
        const localNorm = (normalized * (customColors.length - 1)) - index;
        return interpolateColor(customColors[index], customColors[nextIndex], localNorm);
      }
    }
    
    // Use theme colors
    const colors = colorScale === 'diverging' 
      ? theme.colors.diverging 
      : theme.colors.sequential;
    
    const normalized = (value - min) / (max - min);
    const index = Math.floor(normalized * (colors.length - 1));
    const nextIndex = Math.min(index + 1, colors.length - 1);
    const localNorm = (normalized * (colors.length - 1)) - index;
    
    return interpolateColor(colors[index], colors[nextIndex], localNorm);
  };

  // Get text color based on background brightness
  const getTextColor = (bgColor: string): string => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return theme.typography.dataLabel.color;
    
    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Handle cell click
  const handleCellClick = (cell: HeatmapCell) => {
    if (onDataPointClick) {
      onDataPointClick({
        x: cell.x,
        y: cell.y,
        value: cell.value,
      });
    }
  };

  if (normalizedData.length === 0) {
    return (
      <BaseChart title={title} height={height} width={width} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available for this heatmap</p>
        </div>
      </BaseChart>
    );
  }

  const chartWidth = xLabels.length * cellSize;
  const chartHeight = yLabels.length * cellSize;

  return (
    <BaseChart title={title} height={height} width={width} className={className}>
      <div className="overflow-auto" style={{ maxHeight: height }}>
        <svg
          width={chartWidth + 100}
          height={chartHeight + 60}
          style={{ minWidth: '100%' }}
        >
          {/* Y-axis labels */}
          <g transform="translate(80, 30)">
            {yLabels.map((label, index) => (
              <text
                key={`y-${index}`}
                x={-10}
                y={index * cellSize + cellSize / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fill={theme.typography.axisLabel.color}
                fontSize={theme.typography.axisLabel.fontSize}
              >
                {label}
              </text>
            ))}
          </g>

          {/* X-axis labels */}
          <g transform="translate(80, 30)">
            {xLabels.map((label, index) => (
              <text
                key={`x-${index}`}
                x={index * cellSize + cellSize / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                fill={theme.typography.axisLabel.color}
                fontSize={theme.typography.axisLabel.fontSize}
              >
                {label}
              </text>
            ))}
          </g>

          {/* Heatmap cells */}
          <g transform="translate(80, 30)">
            {normalizedData.map((cell, index) => {
              const xIndex = xLabels.indexOf(String(cell.x));
              const yIndex = yLabels.indexOf(String(cell.y));
              
              if (xIndex === -1 || yIndex === -1) return null;
              
              const cellColor = getColorForValue(cell.value);
              const isHovered = hoveredCell?.x === xIndex && hoveredCell?.y === yIndex;
              
              return (
                <g key={`cell-${index}`}>
                  <rect
                    x={xIndex * cellSize + cellPadding}
                    y={yIndex * cellSize + cellPadding}
                    width={cellSize - cellPadding * 2}
                    height={cellSize - cellPadding * 2}
                    fill={cellColor}
                    stroke={isHovered ? theme.colors.semantic.info : 'none'}
                    strokeWidth={isHovered ? 2 : 0}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isHovered ? 0.8 : 1,
                    }}
                    onMouseEnter={() => setHoveredCell({ x: xIndex, y: yIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => handleCellClick(cell)}
                  />
                  
                  {showValues && (
                    <text
                      x={xIndex * cellSize + cellSize / 2}
                      y={yIndex * cellSize + cellSize / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={getTextColor(cellColor)}
                      fontSize={theme.typography.dataLabel.fontSize}
                      fontWeight={theme.typography.dataLabel.fontWeight}
                      pointerEvents="none"
                    >
                      {cell.value.toFixed(2)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Color scale legend */}
          <g transform={`translate(${chartWidth + 90}, 30)`}>
            <text
              x={0}
              y={-10}
              fontSize={theme.typography.legend.fontSize}
              fill={theme.typography.legend.color}
            >
              Scale
            </text>
            {Array.from({ length: 10 }).map((_, i) => {
              const value = min + (max - min) * (i / 9);
              const color = getColorForValue(value);
              
              return (
                <g key={`legend-${i}`}>
                  <rect
                    x={0}
                    y={i * 20}
                    width={20}
                    height={20}
                    fill={color}
                  />
                  <text
                    x={25}
                    y={i * 20 + 10}
                    dominantBaseline="middle"
                    fontSize={theme.typography.legend.fontSize - 1}
                    fill={theme.typography.legend.color}
                  >
                    {value.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </BaseChart>
  );
}

/**
 * Helper function to convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Heatmap with Error Boundary
 */
export function Heatmap(props: HeatmapProps) {
  return (
    <ChartErrorBoundary chartType="heatmap">
      <HeatmapInner {...props} />
    </ChartErrorBoundary>
  );
}

export default Heatmap;
