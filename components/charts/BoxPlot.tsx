'use client';

/**
 * Box Plot Component
 * Shows statistical distributions with quartiles, median, whiskers, and outliers
 * Supports grouped comparisons and both horizontal/vertical orientations
 */

import React, { useState } from 'react';
import { BaseChart, useBaseChartConfig, type BaseChartProps } from './BaseChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';

/**
 * Box plot data for a single group
 */
export interface BoxPlotData {
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean?: number;
  outliers?: number[];
}

/**
 * Props for BoxPlot component
 */
export interface BoxPlotProps extends Omit<BaseChartProps, 'data' | 'config'> {
  data: BoxPlotData[];
  config?: {
    orientation?: 'horizontal' | 'vertical';
    showOutliers?: boolean;
    showMean?: boolean;
    showMedianValue?: boolean;
    boxWidth?: number;
    colors?: string[];
  };
}

/**
 * Box Plot Component
 * Renders statistical distribution visualization
 */
function BoxPlotInner({
  data,
  title,
  config = {},
  height = 400,
  width = '100%',
  className,
  onDataPointClick,
}: BoxPlotProps) {
  const { theme, getColor } = useBaseChartConfig();
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);
  
  const {
    orientation = 'vertical',
    showOutliers = true,
    showMean = true,
    showMedianValue = false,
    boxWidth = 60,
    colors,
  } = config;

  if (!data || data.length === 0) {
    return (
      <BaseChart title={title} height={height} width={width} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available for this box plot</p>
        </div>
      </BaseChart>
    );
  }

  // Calculate scale
  const allValues = data.flatMap(d => [
    d.min,
    d.q1,
    d.median,
    d.q3,
    d.max,
    ...(d.outliers || []),
  ]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;
  const padding = valueRange * 0.1;

  const isVertical = orientation === 'vertical';
  const chartWidth = isVertical ? data.length * (boxWidth + 40) + 100 : 600;
  const chartHeight = isVertical ? 400 : data.length * (boxWidth + 40) + 100;
  const plotWidth = chartWidth - 120;
  const plotHeight = chartHeight - 100;

  // Scale function
  const scale = (value: number) => {
    const normalized = (value - (minValue - padding)) / (valueRange + padding * 2);
    return isVertical ? plotHeight * (1 - normalized) : plotWidth * normalized;
  };

  // Handle click
  const handleBoxClick = (boxData: BoxPlotData) => {
    if (onDataPointClick) {
      onDataPointClick({
        x: boxData.group,
        y: boxData.median,
        ...boxData,
      });
    }
  };

  return (
    <BaseChart title={title} height={height} width={width} className={className}>
      <div className="overflow-auto">
        <svg width={chartWidth} height={chartHeight}>
          {/* Axes */}
          <g transform="translate(80, 30)">
            {/* Value axis */}
            {isVertical ? (
              <>
                {/* Y-axis line */}
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={plotHeight}
                  stroke={theme.tokens.borders.axisLineColor}
                  strokeWidth={theme.tokens.borders.axisLineWidth}
                />
                {/* Y-axis ticks and labels */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const value = minValue - padding + (valueRange + padding * 2) * (i / 5);
                  const y = scale(value);
                  return (
                    <g key={`y-tick-${i}`}>
                      <line
                        x1={-5}
                        y1={y}
                        x2={0}
                        y2={y}
                        stroke={theme.tokens.borders.axisLineColor}
                        strokeWidth={theme.tokens.borders.axisLineWidth}
                      />
                      <text
                        x={-10}
                        y={y}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fill={theme.typography.axisLabel.color}
                        fontSize={theme.typography.axisLabel.fontSize}
                      >
                        {value.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
                {/* X-axis line */}
                <line
                  x1={0}
                  y1={plotHeight}
                  x2={plotWidth}
                  y2={plotHeight}
                  stroke={theme.tokens.borders.axisLineColor}
                  strokeWidth={theme.tokens.borders.axisLineWidth}
                />
              </>
            ) : (
              <>
                {/* X-axis line */}
                <line
                  x1={0}
                  y1={plotHeight}
                  x2={plotWidth}
                  y2={plotHeight}
                  stroke={theme.tokens.borders.axisLineColor}
                  strokeWidth={theme.tokens.borders.axisLineWidth}
                />
                {/* X-axis ticks and labels */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const value = minValue - padding + (valueRange + padding * 2) * (i / 5);
                  const x = scale(value);
                  return (
                    <g key={`x-tick-${i}`}>
                      <line
                        x1={x}
                        y1={plotHeight}
                        x2={x}
                        y2={plotHeight + 5}
                        stroke={theme.tokens.borders.axisLineColor}
                        strokeWidth={theme.tokens.borders.axisLineWidth}
                      />
                      <text
                        x={x}
                        y={plotHeight + 20}
                        textAnchor="middle"
                        fill={theme.typography.axisLabel.color}
                        fontSize={theme.typography.axisLabel.fontSize}
                      >
                        {value.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
                {/* Y-axis line */}
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={plotHeight}
                  stroke={theme.tokens.borders.axisLineColor}
                  strokeWidth={theme.tokens.borders.axisLineWidth}
                />
              </>
            )}

            {/* Box plots */}
            {data.map((boxData, index) => {
              const color = colors?.[index] || getColor(index);
              const isHovered = hoveredBox === index;
              
              const centerPos = isVertical
                ? (index + 0.5) * (plotWidth / data.length)
                : (index + 0.5) * (plotHeight / data.length);
              
              const minPos = scale(boxData.min);
              const q1Pos = scale(boxData.q1);
              const medianPos = scale(boxData.median);
              const q3Pos = scale(boxData.q3);
              const maxPos = scale(boxData.max);
              const meanPos = boxData.mean ? scale(boxData.mean) : null;

              return (
                <g
                  key={`box-${index}`}
                  onMouseEnter={() => setHoveredBox(index)}
                  onMouseLeave={() => setHoveredBox(null)}
                  onClick={() => handleBoxClick(boxData)}
                  style={{ cursor: 'pointer' }}
                >
                  {isVertical ? (
                    <>
                      {/* Whisker lines */}
                      <line
                        x1={centerPos}
                        y1={minPos}
                        x2={centerPos}
                        y2={q1Pos}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                      <line
                        x1={centerPos}
                        y1={q3Pos}
                        x2={centerPos}
                        y2={maxPos}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                      
                      {/* Min/Max caps */}
                      <line
                        x1={centerPos - boxWidth / 4}
                        y1={minPos}
                        x2={centerPos + boxWidth / 4}
                        y2={minPos}
                        stroke={color}
                        strokeWidth={2}
                      />
                      <line
                        x1={centerPos - boxWidth / 4}
                        y1={maxPos}
                        x2={centerPos + boxWidth / 4}
                        y2={maxPos}
                        stroke={color}
                        strokeWidth={2}
                      />
                      
                      {/* Box (IQR) */}
                      <rect
                        x={centerPos - boxWidth / 2}
                        y={q3Pos}
                        width={boxWidth}
                        height={q1Pos - q3Pos}
                        fill={color}
                        fillOpacity={isHovered ? 0.7 : 0.5}
                        stroke={color}
                        strokeWidth={2}
                      />
                      
                      {/* Median line */}
                      <line
                        x1={centerPos - boxWidth / 2}
                        y1={medianPos}
                        x2={centerPos + boxWidth / 2}
                        y2={medianPos}
                        stroke="#000"
                        strokeWidth={3}
                      />
                      
                      {/* Mean marker */}
                      {showMean && meanPos !== null && (
                        <circle
                          cx={centerPos}
                          cy={meanPos}
                          r={4}
                          fill="#fff"
                          stroke={color}
                          strokeWidth={2}
                        />
                      )}
                      
                      {/* Outliers */}
                      {showOutliers && boxData.outliers?.map((outlier, i) => (
                        <circle
                          key={`outlier-${i}`}
                          cx={centerPos}
                          cy={scale(outlier)}
                          r={3}
                          fill={color}
                          opacity={0.6}
                        />
                      ))}
                      
                      {/* Group label */}
                      <text
                        x={centerPos}
                        y={plotHeight + 20}
                        textAnchor="middle"
                        fill={theme.typography.axisLabel.color}
                        fontSize={theme.typography.axisLabel.fontSize}
                      >
                        {boxData.group}
                      </text>
                      
                      {/* Median value */}
                      {showMedianValue && (
                        <text
                          x={centerPos + boxWidth / 2 + 5}
                          y={medianPos}
                          dominantBaseline="middle"
                          fill={theme.typography.dataLabel.color}
                          fontSize={theme.typography.dataLabel.fontSize}
                        >
                          {boxData.median.toFixed(2)}
                        </text>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Horizontal orientation - similar logic but swapped x/y */}
                      <line
                        x1={minPos}
                        y1={centerPos}
                        x2={q1Pos}
                        y2={centerPos}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                      <line
                        x1={q3Pos}
                        y1={centerPos}
                        x2={maxPos}
                        y2={centerPos}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                      
                      <line
                        x1={minPos}
                        y1={centerPos - boxWidth / 4}
                        x2={minPos}
                        y2={centerPos + boxWidth / 4}
                        stroke={color}
                        strokeWidth={2}
                      />
                      <line
                        x1={maxPos}
                        y1={centerPos - boxWidth / 4}
                        x2={maxPos}
                        y2={centerPos + boxWidth / 4}
                        stroke={color}
                        strokeWidth={2}
                      />
                      
                      <rect
                        x={q1Pos}
                        y={centerPos - boxWidth / 2}
                        width={q3Pos - q1Pos}
                        height={boxWidth}
                        fill={color}
                        fillOpacity={isHovered ? 0.7 : 0.5}
                        stroke={color}
                        strokeWidth={2}
                      />
                      
                      <line
                        x1={medianPos}
                        y1={centerPos - boxWidth / 2}
                        x2={medianPos}
                        y2={centerPos + boxWidth / 2}
                        stroke="#000"
                        strokeWidth={3}
                      />
                      
                      {showMean && meanPos !== null && (
                        <circle
                          cx={meanPos}
                          cy={centerPos}
                          r={4}
                          fill="#fff"
                          stroke={color}
                          strokeWidth={2}
                        />
                      )}
                      
                      {showOutliers && boxData.outliers?.map((outlier, i) => (
                        <circle
                          key={`outlier-${i}`}
                          cx={scale(outlier)}
                          cy={centerPos}
                          r={3}
                          fill={color}
                          opacity={0.6}
                        />
                      ))}
                      
                      <text
                        x={-10}
                        y={centerPos}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fill={theme.typography.axisLabel.color}
                        fontSize={theme.typography.axisLabel.fontSize}
                      >
                        {boxData.group}
                      </text>
                      
                      {showMedianValue && (
                        <text
                          x={medianPos}
                          y={centerPos - boxWidth / 2 - 5}
                          textAnchor="middle"
                          fill={theme.typography.dataLabel.color}
                          fontSize={theme.typography.dataLabel.fontSize}
                        >
                          {boxData.median.toFixed(2)}
                        </text>
                      )}
                    </>
                  )}
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
 * BoxPlot with Error Boundary
 */
export function BoxPlot(props: BoxPlotProps) {
  return (
    <ChartErrorBoundary chartType="boxplot">
      <BoxPlotInner {...props} />
    </ChartErrorBoundary>
  );
}

export default BoxPlot;
