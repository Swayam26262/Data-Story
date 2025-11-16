'use client';

/**
 * Candlestick Chart Component
 * Financial time-series visualization with OHLC (Open, High, Low, Close) data
 * Includes color coding for positive/negative changes and optional volume bars
 */

import React, { useState } from 'react';
import { BaseChart, useBaseChartConfig, type BaseChartProps } from './BaseChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';

/**
 * Candlestick data point
 */
export interface CandlestickDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Props for CandlestickChart component
 */
export interface CandlestickChartProps extends Omit<BaseChartProps, 'data' | 'config'> {
  data: CandlestickDataPoint[];
  config?: {
    showVolume?: boolean;
    positiveColor?: string;
    negativeColor?: string;
    wickColor?: string;
    candleWidth?: number;
    volumeHeightRatio?: number;
  };
}

/**
 * Candlestick Chart Component
 * Renders OHLC financial data visualization
 */
function CandlestickChartInner({
  data,
  title,
  config = {},
  height = 500,
  width = '100%',
  className,
  onDataPointClick,
}: CandlestickChartProps) {
  const { theme, getSemanticColor } = useBaseChartConfig();
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null);
  
  const {
    showVolume = true,
    positiveColor = getSemanticColor('positive'),
    negativeColor = getSemanticColor('negative'),
    wickColor = theme.typography.axisLabel.color,
    candleWidth = 8,
    volumeHeightRatio = 0.25,
  } = config;

  if (!data || data.length === 0) {
    return (
      <BaseChart title={title} height={height} width={width} className={className}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">No data available for this candlestick chart</p>
        </div>
      </BaseChart>
    );
  }

  // Calculate price scale
  const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const pricePadding = priceRange * 0.1;

  // Calculate volume scale if needed
  const maxVolume = showVolume && data.some(d => d.volume)
    ? Math.max(...data.map(d => d.volume || 0))
    : 0;

  const chartWidth = Math.max(data.length * (candleWidth + 4) + 120, 600);
  const chartHeight = typeof height === 'number' ? height : 500;
  const volumeHeight = showVolume ? chartHeight * volumeHeightRatio : 0;
  const priceHeight = chartHeight - volumeHeight - 100;
  const plotWidth = chartWidth - 120;

  // Scale functions
  const scalePrice = (price: number) => {
    const normalized = (price - (minPrice - pricePadding)) / (priceRange + pricePadding * 2);
    return priceHeight * (1 - normalized);
  };

  const scaleVolume = (volume: number) => {
    if (maxVolume === 0) return 0;
    return (volume / maxVolume) * volumeHeight;
  };

  // Handle click
  const handleCandleClick = (candle: CandlestickDataPoint, index: number) => {
    if (onDataPointClick) {
      onDataPointClick({
        x: candle.date,
        y: candle.close,
        ...candle,
      });
    }
  };

  return (
    <BaseChart title={title} height={height} width={width} className={className}>
      <div className="overflow-auto">
        <svg width={chartWidth} height={chartHeight}>
          <g transform="translate(80, 30)">
            {/* Price Y-axis */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={priceHeight}
              stroke={theme.tokens.borders.axisLineColor}
              strokeWidth={theme.tokens.borders.axisLineWidth}
            />
            
            {/* Price Y-axis ticks and labels */}
            {Array.from({ length: 6 }).map((_, i) => {
              const price = minPrice - pricePadding + (priceRange + pricePadding * 2) * (i / 5);
              const y = scalePrice(price);
              return (
                <g key={`price-tick-${i}`}>
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
                    ${price.toFixed(2)}
                  </text>
                </g>
              );
            })}
            
            {/* X-axis */}
            <line
              x1={0}
              y1={priceHeight}
              x2={plotWidth}
              y2={priceHeight}
              stroke={theme.tokens.borders.axisLineColor}
              strokeWidth={theme.tokens.borders.axisLineWidth}
            />

            {/* Candlesticks */}
            {data.map((candle, index) => {
              const isHovered = hoveredCandle === index;
              const isPositive = candle.close >= candle.open;
              const color = isPositive ? positiveColor : negativeColor;
              
              const x = (index + 0.5) * (plotWidth / data.length);
              const highY = scalePrice(candle.high);
              const lowY = scalePrice(candle.low);
              const openY = scalePrice(candle.open);
              const closeY = scalePrice(candle.close);
              
              const bodyTop = Math.min(openY, closeY);
              const bodyBottom = Math.max(openY, closeY);
              const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

              return (
                <g
                  key={`candle-${index}`}
                  onMouseEnter={() => setHoveredCandle(index)}
                  onMouseLeave={() => setHoveredCandle(null)}
                  onClick={() => handleCandleClick(candle, index)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* High-Low wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={wickColor}
                    strokeWidth={1}
                  />
                  
                  {/* Open-Close body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={isPositive ? color : color}
                    fillOpacity={isPositive ? 0.8 : 1}
                    stroke={color}
                    strokeWidth={isHovered ? 2 : 1}
                  />
                  
                  {/* Date label (show every nth label to avoid crowding) */}
                  {index % Math.max(1, Math.floor(data.length / 10)) === 0 && (
                    <text
                      x={x}
                      y={priceHeight + 15}
                      textAnchor="middle"
                      fill={theme.typography.axisLabel.color}
                      fontSize={theme.typography.axisLabel.fontSize - 1}
                    >
                      {candle.date.length > 10 ? candle.date.substring(5, 10) : candle.date}
                    </text>
                  )}
                  
                  {/* Hover tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={x + candleWidth / 2 + 5}
                        y={bodyTop - 60}
                        width={120}
                        height={70}
                        fill="#ffffff"
                        stroke="#e5e7eb"
                        strokeWidth={1}
                        rx={4}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      />
                      <text
                        x={x + candleWidth / 2 + 10}
                        y={bodyTop - 45}
                        fill={theme.typography.tooltip.color}
                        fontSize={theme.typography.tooltip.fontSize - 1}
                        fontWeight={600}
                      >
                        {candle.date}
                      </text>
                      <text
                        x={x + candleWidth / 2 + 10}
                        y={bodyTop - 30}
                        fill={theme.typography.tooltip.color}
                        fontSize={theme.typography.tooltip.fontSize - 2}
                      >
                        O: ${candle.open.toFixed(2)}
                      </text>
                      <text
                        x={x + candleWidth / 2 + 10}
                        y={bodyTop - 18}
                        fill={theme.typography.tooltip.color}
                        fontSize={theme.typography.tooltip.fontSize - 2}
                      >
                        H: ${candle.high.toFixed(2)}
                      </text>
                      <text
                        x={x + candleWidth / 2 + 10}
                        y={bodyTop - 6}
                        fill={theme.typography.tooltip.color}
                        fontSize={theme.typography.tooltip.fontSize - 2}
                      >
                        L: ${candle.low.toFixed(2)}
                      </text>
                      <text
                        x={x + candleWidth / 2 + 10}
                        y={bodyTop + 6}
                        fill={theme.typography.tooltip.color}
                        fontSize={theme.typography.tooltip.fontSize - 2}
                      >
                        C: ${candle.close.toFixed(2)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Volume bars */}
            {showVolume && (
              <g transform={`translate(0, ${priceHeight + 20})`}>
                {/* Volume Y-axis label */}
                <text
                  x={-10}
                  y={volumeHeight / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill={theme.typography.axisLabel.color}
                  fontSize={theme.typography.axisLabel.fontSize - 1}
                >
                  Volume
                </text>
                
                {/* Volume bars */}
                {data.map((candle, index) => {
                  if (!candle.volume) return null;
                  
                  const isPositive = candle.close >= candle.open;
                  const color = isPositive ? positiveColor : negativeColor;
                  const x = (index + 0.5) * (plotWidth / data.length);
                  const barHeight = scaleVolume(candle.volume);
                  
                  return (
                    <rect
                      key={`volume-${index}`}
                      x={x - candleWidth / 2}
                      y={volumeHeight - barHeight}
                      width={candleWidth}
                      height={barHeight}
                      fill={color}
                      fillOpacity={0.5}
                    />
                  );
                })}
                
                {/* Volume baseline */}
                <line
                  x1={0}
                  y1={volumeHeight}
                  x2={plotWidth}
                  y2={volumeHeight}
                  stroke={theme.tokens.borders.axisLineColor}
                  strokeWidth={theme.tokens.borders.axisLineWidth}
                />
              </g>
            )}
          </g>

          {/* Legend */}
          <g transform={`translate(${chartWidth - 150}, 40)`}>
            <rect x={0} y={0} width={15} height={15} fill={positiveColor} fillOpacity={0.8} />
            <text
              x={20}
              y={12}
              fontSize={theme.typography.legend.fontSize}
              fill={theme.typography.legend.color}
            >
              Bullish
            </text>
            
            <rect x={0} y={25} width={15} height={15} fill={negativeColor} />
            <text
              x={20}
              y={37}
              fontSize={theme.typography.legend.fontSize}
              fill={theme.typography.legend.color}
            >
              Bearish
            </text>
          </g>
        </svg>
      </div>
    </BaseChart>
  );
}

/**
 * CandlestickChart with Error Boundary
 */
export function CandlestickChart(props: CandlestickChartProps) {
  return (
    <ChartErrorBoundary chartType="candlestick">
      <CandlestickChartInner {...props} />
    </ChartErrorBoundary>
  );
}

export default CandlestickChart;
