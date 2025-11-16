'use client';

/**
 * Waterfall Chart Component
 * Shows cumulative effects of sequential positive and negative values
 * Includes connector lines and start/end total markers
 */

import React, { useState } from 'react';
import { BaseChart, useBaseChartConfig, type BaseChartProps } from './BaseChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';

/**
 * Waterfall data point
 */
export interface WaterfallDataPoint {
  label: string;
  value: number;
  isTotal?: boolean; // Mark as start or end total
}

/**
 * Props for WaterfallChart component
 */
export interface WaterfallChartProps extends Omit<BaseChartProps, 'data' | 'config'> {
  data: WaterfallDataPoint[];
  config?: {
    showConnectors?: boolean;
    showValues?: boolean;
    positiveColor?: string;
    negativeColor?: string;
    totalColor?: string;
    barWidth?: number;
  };
}

/**
 * Waterfall Chart Component
 * Renders cumulative value changes
 */
function WaterfallChartInner({
  data,
  title,
  config = {},
  height = 400,
  width = '100%',
  className,
  onDataPointClick,
}: WaterfallChartProps) {
  const { theme, getSemanticColor } = useBaseChartConfig();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  const {
    showConnectors = true,
    showValues = true,
    positiveColor = getSemanticColor('positive'),
    negativeColor = getSemanticColor('negative'),
    totalColor = getSemanticColor('info'),
    barWidth = 60,
  } = config;

  if (!data || data.length === 0) {
    return (
      <BaseChart title={title} height={height} width={width} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available for this waterfall chart</p>
        </div>
      </BaseChart>
    );
  }

  // Calculate cumulative values and positions
  const processedData = React.useMemo(() => {
    let cumulative = 0;
    return data.map((point, index) => {
      const start = cumulative;
      const value = point.value;
      const end = point.isTotal ? value : cumulative + value;
      
      if (!point.isTotal) {
        cumulative += value;
      }
      
      return {
        ...point,
        start,
        end,
        displayValue: point.isTotal ? value : value,
        isPositive: value >= 0,
        index,
      };
    });
  }, [data]);

  // Calculate scale
  const allValues = processedData.flatMap(d => [d.start, d.end]);
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;
  const padding = valueRange * 0.1;

  const chartWidth = data.length * (barWidth + 40) + 120;
  const chartHeight = 400;
  const plotWidth = chartWidth - 120;
  const plotHeight = chartHeight - 100;

  // Scale function
  const scale = (value: number) => {
    const normalized = (value - (minValue - padding)) / (valueRange + padding * 2);
    return plotHeight * (1 - normalized);
  };

  const zeroLine = scale(0);

  // Handle click
  const handleBarClick = (point: typeof processedData[0]) => {
    if (onDataPointClick) {
      onDataPointClick({
        x: point.label,
        y: point.displayValue,
        ...point,
      });
    }
  };

  return (
    <BaseChart title={title} height={height} width={width} className={className}>
      <div className="overflow-auto">
        <svg width={chartWidth} height={chartHeight}>
          <g transform="translate(80, 30)">
            {/* Y-axis */}
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
                    x2={plotWidth}
                    y2={y}
                    stroke={theme.tokens.borders.gridLineColor}
                    strokeWidth={theme.tokens.borders.gridLineWidth}
                    strokeDasharray={theme.tokens.borders.gridLineDash.join(' ')}
                  />
                  <text
                    x={-10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill={theme.typography.axisLabel.color}
                    fontSize={theme.typography.axisLabel.fontSize}
                  >
                    {value.toFixed(0)}
                  </text>
                </g>
              );
            })}
            
            {/* Zero line (emphasized) */}
            <line
              x1={0}
              y1={zeroLine}
              x2={plotWidth}
              y2={zeroLine}
              stroke={theme.tokens.borders.axisLineColor}
              strokeWidth={2}
            />
            
            {/* X-axis */}
            <line
              x1={0}
              y1={plotHeight}
              x2={plotWidth}
              y2={plotHeight}
              stroke={theme.tokens.borders.axisLineColor}
              strokeWidth={theme.tokens.borders.axisLineWidth}
            />

            {/* Bars and connectors */}
            {processedData.map((point, index) => {
              const isHovered = hoveredBar === index;
              const centerX = (index + 0.5) * (plotWidth / data.length);
              const barTop = Math.min(scale(point.start), scale(point.end));
              const barBottom = Math.max(scale(point.start), scale(point.end));
              const barHeight = barBottom - barTop;
              
              let barColor = totalColor;
              if (!point.isTotal) {
                barColor = point.isPositive ? positiveColor : negativeColor;
              }

              return (
                <g key={`bar-${index}`}>
                  {/* Connector line to previous bar */}
                  {showConnectors && index > 0 && (
                    <line
                      x1={(index - 0.5) * (plotWidth / data.length) + barWidth / 2}
                      y1={scale(processedData[index - 1].end)}
                      x2={centerX - barWidth / 2}
                      y2={scale(point.start)}
                      stroke={theme.tokens.borders.gridLineColor}
                      strokeWidth={1}
                      strokeDasharray="4 2"
                    />
                  )}
                  
                  {/* Bar */}
                  <rect
                    x={centerX - barWidth / 2}
                    y={barTop}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    fill={barColor}
                    fillOpacity={isHovered ? 0.8 : 1}
                    stroke={isHovered ? '#000' : 'none'}
                    strokeWidth={isHovered ? 2 : 0}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    onClick={() => handleBarClick(point)}
                  />
                  
                  {/* Value label */}
                  {showValues && (
                    <text
                      x={centerX}
                      y={barTop - 5}
                      textAnchor="middle"
                      fill={theme.typography.dataLabel.color}
                      fontSize={theme.typography.dataLabel.fontSize}
                      fontWeight={theme.typography.dataLabel.fontWeight}
                    >
                      {point.displayValue >= 0 ? '+' : ''}{point.displayValue.toFixed(0)}
                    </text>
                  )}
                  
                  {/* Category label */}
                  <text
                    x={centerX}
                    y={plotHeight + 15}
                    textAnchor="middle"
                    fill={theme.typography.axisLabel.color}
                    fontSize={theme.typography.axisLabel.fontSize}
                    style={{
                      maxWidth: barWidth + 20,
                    }}
                  >
                    {point.label.length > 10 ? point.label.substring(0, 10) + '...' : point.label}
                  </text>
                  
                  {/* Total marker */}
                  {point.isTotal && (
                    <text
                      x={centerX}
                      y={barBottom + 15}
                      textAnchor="middle"
                      fill={totalColor}
                      fontSize={theme.typography.dataLabel.fontSize}
                      fontWeight={600}
                    >
                      Total: {point.end.toFixed(0)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Legend */}
          <g transform={`translate(${chartWidth - 100}, 40)`}>
            <rect x={0} y={0} width={15} height={15} fill={positiveColor} />
            <text
              x={20}
              y={12}
              fontSize={theme.typography.legend.fontSize}
              fill={theme.typography.legend.color}
            >
              Increase
            </text>
            
            <rect x={0} y={25} width={15} height={15} fill={negativeColor} />
            <text
              x={20}
              y={37}
              fontSize={theme.typography.legend.fontSize}
              fill={theme.typography.legend.color}
            >
              Decrease
            </text>
            
            <rect x={0} y={50} width={15} height={15} fill={totalColor} />
            <text
              x={20}
              y={62}
              fontSize={theme.typography.legend.fontSize}
              fill={theme.typography.legend.color}
            >
              Total
            </text>
          </g>
        </svg>
      </div>
    </BaseChart>
  );
}

/**
 * WaterfallChart with Error Boundary
 */
export function WaterfallChart(props: WaterfallChartProps) {
  return (
    <ChartErrorBoundary chartType="waterfall">
      <WaterfallChartInner {...props} />
    </ChartErrorBoundary>
  );
}

export default WaterfallChart;
