'use client';

/**
 * TrendLineOverlay Component
 * Renders trend lines with confidence intervals on charts
 * Supports linear and polynomial trends with R-squared annotations
 */

import React from 'react';
import type { TrendLineData, TrendLineConfig } from '@/types';
import { useChartThemeOptional } from '@/lib/contexts/ChartThemeContext';

export interface TrendLineOverlayProps {
  data: number[][];
  trendLineData: TrendLineData;
  config: TrendLineConfig;
  xScale: (value: number) => number;
  yScale: (value: number) => number;
  width: number;
  height: number;
}

/**
 * Calculate trend line points based on regression data
 */
function calculateTrendPoints(
  data: number[][],
  trendLineData: TrendLineData,
  config: TrendLineConfig
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  
  if (config.type === 'linear') {
    // Linear trend: y = mx + b
    const { slope, intercept } = trendLineData;
    const xMin = Math.min(...data.map(d => d[0]));
    const xMax = Math.max(...data.map(d => d[0]));
    
    points.push({ x: xMin, y: slope * xMin + intercept });
    points.push({ x: xMax, y: slope * xMax + intercept });
  } else if (config.type === 'polynomial' && config.degree) {
    // Polynomial trend - generate more points for smooth curve
    const xMin = Math.min(...data.map(d => d[0]));
    const xMax = Math.max(...data.map(d => d[0]));
    const step = (xMax - xMin) / 50;
    
    for (let x = xMin; x <= xMax; x += step) {
      // For polynomial, we'd need coefficients from backend
      // For now, use linear as fallback
      const y = trendLineData.slope * x + trendLineData.intercept;
      points.push({ x, y });
    }
  }
  
  return points;
}

/**
 * TrendLineOverlay Component
 */
export function TrendLineOverlay({
  data,
  trendLineData,
  config,
  xScale,
  yScale,
  width,
  height,
}: TrendLineOverlayProps) {
  const { theme, getSemanticColor } = useChartThemeOptional();
  
  if (!config.enabled || !trendLineData) {
    return null;
  }
  
  const trendPoints = calculateTrendPoints(data, trendLineData, config);
  const color = config.color || getSemanticColor('info');
  
  // Generate path for trend line
  const trendPath = trendPoints
    .map((point, i) => {
      const x = xScale(point.x);
      const y = yScale(point.y);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  
  // Generate confidence interval paths if available
  let upperPath = '';
  let lowerPath = '';
  
  if (trendLineData.confidenceInterval) {
    const { upper, lower } = trendLineData.confidenceInterval;
    
    upperPath = upper
      .map((y, i) => {
        const x = xScale(data[i]?.[0] || i);
        const yPos = yScale(y);
        return `${i === 0 ? 'M' : 'L'} ${x} ${yPos}`;
      })
      .join(' ');
    
    lowerPath = lower
      .map((y, i) => {
        const x = xScale(data[i]?.[0] || i);
        const yPos = yScale(y);
        return `${i === 0 ? 'M' : 'L'} ${x} ${yPos}`;
      })
      .join(' ');
  }
  
  // Calculate annotation position (top-right corner)
  const annotationX = width - 120;
  const annotationY = 20;
  
  return (
    <g className="trend-line-overlay">
      {/* Confidence interval shading */}
      {trendLineData.confidenceInterval && upperPath && lowerPath && (
        <path
          d={`${upperPath} ${lowerPath.split(' ').reverse().join(' ')} Z`}
          fill={color}
          opacity={0.15}
          className="confidence-interval"
        />
      )}
      
      {/* Trend line */}
      <path
        d={trendPath}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeDasharray={config.type === 'polynomial' ? '0' : '5,5'}
        className="trend-line"
      />
      
      {/* R-squared annotation */}
      {config.showRSquared && (
        <g className="r-squared-annotation">
          <rect
            x={annotationX - 5}
            y={annotationY - 15}
            width={110}
            height={config.showEquation ? 40 : 20}
            fill="white"
            opacity={0.9}
            rx={4}
            stroke={theme.tokens.borders.gridLineColor}
            strokeWidth={1}
          />
          <text
            x={annotationX}
            y={annotationY}
            fontSize={theme.typography.dataLabel.fontSize}
            fontWeight={theme.typography.dataLabel.fontWeight}
            fill={theme.typography.dataLabel.color}
          >
            R² = {trendLineData.rSquared.toFixed(3)}
          </text>
          {config.showEquation && trendLineData.equation && (
            <text
              x={annotationX}
              y={annotationY + 18}
              fontSize={theme.typography.dataLabel.fontSize - 1}
              fill={theme.typography.dataLabel.color}
            >
              {trendLineData.equation}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

export default TrendLineOverlay;
