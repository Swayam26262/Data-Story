'use client';

/**
 * Funnel Chart Component
 * Visualizes progressive reduction of data through stages
 * Shows percentages and conversion rates between stages
 */

import React, { useState } from 'react';
import { BaseChart, useBaseChartConfig, type BaseChartProps } from './BaseChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';

/**
 * Funnel stage data
 */
export interface FunnelStage {
  name: string;
  value: number;
  color?: string;
}

/**
 * Props for FunnelChart component
 */
export interface FunnelChartProps extends Omit<BaseChartProps, 'data' | 'config'> {
  data: FunnelStage[];
  config?: {
    showPercentages?: boolean;
    showConversionRates?: boolean;
    showValues?: boolean;
    colors?: string[];
    maxWidth?: number;
    stageHeight?: number;
  };
}

/**
 * Funnel Chart Component
 * Renders stage-based funnel visualization
 */
function FunnelChartInner({
  data,
  title,
  config = {},
  height = 500,
  width = '100%',
  className,
  onDataPointClick,
}: FunnelChartProps) {
  const { theme, getColor } = useBaseChartConfig();
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  
  const {
    showPercentages = true,
    showConversionRates = true,
    showValues = true,
    colors,
    maxWidth = 400,
    stageHeight = 60,
  } = config;

  if (!data || data.length === 0) {
    return (
      <BaseChart title={title} height={height} width={width} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available for this funnel chart</p>
        </div>
      </BaseChart>
    );
  }

  // Calculate percentages and conversion rates
  const processedData = React.useMemo(() => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return data.map((stage, index) => {
      const percentage = (stage.value / maxValue) * 100;
      const conversionRate = index > 0 
        ? ((stage.value / data[index - 1].value) * 100)
        : 100;
      
      return {
        ...stage,
        percentage,
        conversionRate,
        index,
      };
    });
  }, [data]);

  const chartWidth = maxWidth + 200;
  const chartHeight = data.length * (stageHeight + 20) + 100;

  // Handle click
  const handleStageClick = (stage: typeof processedData[0]) => {
    if (onDataPointClick) {
      onDataPointClick({
        x: stage.name,
        y: stage.value,
        ...stage,
      });
    }
  };

  return (
    <BaseChart title={title} height={height} width={width} className={className}>
      <div className="overflow-auto">
        <svg width={chartWidth} height={chartHeight}>
          <g transform="translate(100, 40)">
            {processedData.map((stage, index) => {
              const isHovered = hoveredStage === index;
              const stageWidth = (stage.percentage / 100) * maxWidth;
              const yPos = index * (stageHeight + 20);
              const xOffset = (maxWidth - stageWidth) / 2;
              
              const stageColor = stage.color || colors?.[index] || getColor(index);
              
              // Calculate trapezoid points for funnel shape
              const nextStage = processedData[index + 1];
              const nextWidth = nextStage ? (nextStage.percentage / 100) * maxWidth : stageWidth;
              const nextXOffset = (maxWidth - nextWidth) / 2;
              
              const points = [
                `${xOffset},${yPos}`,
                `${xOffset + stageWidth},${yPos}`,
                `${nextXOffset + nextWidth},${yPos + stageHeight}`,
                `${nextXOffset},${yPos + stageHeight}`,
              ].join(' ');

              return (
                <g key={`stage-${index}`}>
                  {/* Funnel segment */}
                  <polygon
                    points={points}
                    fill={stageColor}
                    fillOpacity={isHovered ? 0.8 : 0.9}
                    stroke={isHovered ? '#000' : '#fff'}
                    strokeWidth={isHovered ? 2 : 1}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredStage(index)}
                    onMouseLeave={() => setHoveredStage(null)}
                    onClick={() => handleStageClick(stage)}
                  />
                  
                  {/* Stage name */}
                  <text
                    x={maxWidth / 2}
                    y={yPos + stageHeight / 2 - 5}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={theme.typography.dataLabel.fontSize + 2}
                    fontWeight={600}
                  >
                    {stage.name}
                  </text>
                  
                  {/* Value and percentage */}
                  {showValues && (
                    <text
                      x={maxWidth / 2}
                      y={yPos + stageHeight / 2 + 10}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={theme.typography.dataLabel.fontSize}
                    >
                      {stage.value.toLocaleString()}
                      {showPercentages && ` (${stage.percentage.toFixed(1)}%)`}
                    </text>
                  )}
                  
                  {/* Conversion rate arrow and text */}
                  {showConversionRates && index > 0 && (
                    <g>
                      {/* Arrow */}
                      <line
                        x1={maxWidth + 30}
                        y1={yPos - 10}
                        x2={maxWidth + 30}
                        y2={yPos}
                        stroke={theme.typography.axisLabel.color}
                        strokeWidth={2}
                        markerEnd="url(#arrowhead)"
                      />
                      
                      {/* Conversion rate text */}
                      <text
                        x={maxWidth + 40}
                        y={yPos - 5}
                        fill={
                          stage.conversionRate >= 80
                            ? theme.colors.semantic.positive
                            : stage.conversionRate >= 50
                            ? theme.colors.semantic.warning
                            : theme.colors.semantic.negative
                        }
                        fontSize={theme.typography.dataLabel.fontSize}
                        fontWeight={600}
                      >
                        {stage.conversionRate.toFixed(1)}%
                      </text>
                    </g>
                  )}
                  
                  {/* Stage label on the left */}
                  <text
                    x={-20}
                    y={yPos + stageHeight / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill={theme.typography.axisLabel.color}
                    fontSize={theme.typography.axisLabel.fontSize}
                  >
                    Stage {index + 1}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 5, 0 10"
                fill={theme.typography.axisLabel.color}
              />
            </marker>
          </defs>

          {/* Summary statistics */}
          <g transform={`translate(100, ${chartHeight - 50})`}>
            <text
              x={0}
              y={0}
              fill={theme.typography.legend.color}
              fontSize={theme.typography.legend.fontSize}
              fontWeight={600}
            >
              Overall Conversion: {((processedData[processedData.length - 1].value / processedData[0].value) * 100).toFixed(1)}%
            </text>
            <text
              x={0}
              y={20}
              fill={theme.typography.legend.color}
              fontSize={theme.typography.legend.fontSize}
            >
              Drop-off: {(processedData[0].value - processedData[processedData.length - 1].value).toLocaleString()} 
              ({(((processedData[0].value - processedData[processedData.length - 1].value) / processedData[0].value) * 100).toFixed(1)}%)
            </text>
          </g>
        </svg>
      </div>
    </BaseChart>
  );
}

/**
 * FunnelChart with Error Boundary
 */
export function FunnelChart(props: FunnelChartProps) {
  return (
    <ChartErrorBoundary chartType="funnel">
      <FunnelChartInner {...props} />
    </ChartErrorBoundary>
  );
}

export default FunnelChart;
