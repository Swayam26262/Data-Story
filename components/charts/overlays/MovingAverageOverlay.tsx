'use client';

/**
 * MovingAverageOverlay Component
 * Renders moving average lines on time-series charts
 * Supports multiple periods (7, 30, 90 days) with distinct line styles
 */

import React from 'react';
import type { MovingAverageData, MovingAverageConfig } from '@/types';
import { useChartThemeOptional } from '@/lib/contexts/ChartThemeContext';

export interface MovingAverageOverlayProps {
  data: MovingAverageData[];
  config: MovingAverageConfig;
  xScale: (value: number | string) => number;
  yScale: (value: number) => number;
  xData: (number | string)[];
}

/**
 * Get line style pattern for different moving averages
 */
function getLineStyle(index: number, configStyles?: ('solid' | 'dashed' | 'dotted')[]): string {
  if (configStyles && configStyles[index]) {
    const style = configStyles[index];
    if (style === 'dashed') return '8,4';
    if (style === 'dotted') return '2,2';
    return '0';
  }
  
  // Default patterns
  const patterns = ['0', '8,4', '2,2', '12,4,2,4'];
  return patterns[index % patterns.length];
}

/**
 * MovingAverageOverlay Component
 */
export function MovingAverageOverlay({
  data,
  config,
  xScale,
  yScale,
  xData,
}: MovingAverageOverlayProps) {
  const { theme, getColor } = useChartThemeOptional();
  
  if (!config.enabled || !data || data.length === 0) {
    return null;
  }
  
  // Default colors for moving averages
  const defaultColors = [
    theme.colors.categorical[2], // Orange
    theme.colors.categorical[4], // Purple
    theme.colors.categorical[5], // Pink
  ];
  
  return (
    <g className="moving-average-overlay">
      {data.map((ma, index) => {
        const color = config.colors?.[index] || defaultColors[index] || getColor(index + 3);
        const strokeDasharray = getLineStyle(index, config.lineStyles);
        
        // Generate path for moving average line
        const path = ma.values
          .map((value, i) => {
            if (value === null || value === undefined || isNaN(value)) {
              return null;
            }
            const x = xScale(xData[i]);
            const y = yScale(value);
            return { x, y, valid: true };
          })
          .filter(p => p !== null && !isNaN(p.x) && !isNaN(p.y))
          .map((point, i) => {
            return `${i === 0 ? 'M' : 'L'} ${point!.x} ${point!.y}`;
          })
          .join(' ');
        
        if (!path) return null;
        
        return (
          <g key={`ma-${ma.period}`} className={`moving-average-${ma.period}`}>
            <path
              d={path}
              stroke={color}
              strokeWidth={2}
              fill="none"
              strokeDasharray={strokeDasharray}
              opacity={0.8}
              className="moving-average-line"
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * MovingAverageLegend Component
 * Renders legend entries for moving averages
 */
export interface MovingAverageLegendProps {
  data: MovingAverageData[];
  config: MovingAverageConfig;
  onToggle?: (period: number) => void;
}

export function MovingAverageLegend({
  data,
  config,
  onToggle,
}: MovingAverageLegendProps) {
  const { theme, getColor } = useChartThemeOptional();
  
  if (!config.enabled || !data || data.length === 0) {
    return null;
  }
  
  const defaultColors = [
    theme.colors.categorical[2],
    theme.colors.categorical[4],
    theme.colors.categorical[5],
  ];
  
  return (
    <div className="moving-average-legend" style={{ 
      display: 'flex', 
      gap: '16px', 
      flexWrap: 'wrap',
      marginTop: '8px',
      fontSize: theme.typography.legend.fontSize,
    }}>
      {data.map((ma, index) => {
        const color = config.colors?.[index] || defaultColors[index] || getColor(index + 3);
        const strokeDasharray = getLineStyle(index, config.lineStyles);
        
        return (
          <div
            key={`ma-legend-${ma.period}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: onToggle ? 'pointer' : 'default',
            }}
            onClick={() => onToggle?.(ma.period)}
          >
            <svg width="24" height="12">
              <line
                x1="0"
                y1="6"
                x2="24"
                y2="6"
                stroke={color}
                strokeWidth={2}
                strokeDasharray={strokeDasharray}
              />
            </svg>
            <span style={{ color: theme.typography.legend.color }}>
              {ma.label || `${ma.period}-day MA`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default MovingAverageOverlay;
