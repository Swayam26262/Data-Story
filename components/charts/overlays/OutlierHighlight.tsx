'use client';

/**
 * OutlierHighlight Component
 * Highlights outlier data points with distinct styling and annotations
 * Supports multiple outlier detection methods (IQR, Z-score, Isolation Forest)
 */

import React, { useState } from 'react';
import type { OutlierData, OutlierConfig } from '@/types';
import { useChartThemeOptional } from '@/lib/contexts/ChartThemeContext';

export interface OutlierHighlightProps {
  data: Array<{ x: number | string; y: number; [key: string]: unknown }>;
  outlierData: OutlierData;
  config: OutlierConfig;
  xScale: (value: number | string) => number;
  yScale: (value: number) => number;
}

/**
 * OutlierHighlight Component
 */
export function OutlierHighlight({
  data,
  outlierData,
  config,
  xScale,
  yScale,
}: OutlierHighlightProps) {
  const { theme, getSemanticColor } = useChartThemeOptional();
  const [hoveredOutlier, setHoveredOutlier] = useState<number | null>(null);
  
  if (!config.enabled || !outlierData || outlierData.indices.length === 0) {
    return null;
  }
  
  const color = config.color || getSemanticColor('warning');
  const size = config.size || 8;
  
  return (
    <g className="outlier-highlight">
      {outlierData.indices.map((index, i) => {
        const point = data[index];
        if (!point) return null;
        
        const x = xScale(point.x);
        const y = yScale(point.y);
        const value = outlierData.values[i];
        const zScore = outlierData.zScores?.[i];
        
        const isHovered = hoveredOutlier === index;
        
        return (
          <g
            key={`outlier-${index}`}
            className="outlier-point"
            onMouseEnter={() => setHoveredOutlier(index)}
            onMouseLeave={() => setHoveredOutlier(null)}
          >
            {/* Outer glow ring */}
            <circle
              cx={x}
              cy={y}
              r={size + 4}
              fill={color}
              opacity={0.2}
              className="outlier-glow"
            />
            
            {/* Main outlier marker */}
            <circle
              cx={x}
              cy={y}
              r={size}
              fill={color}
              stroke="white"
              strokeWidth={2}
              opacity={0.9}
              className="outlier-marker"
            />
            
            {/* Inner dot */}
            <circle
              cx={x}
              cy={y}
              r={size / 2}
              fill="white"
              opacity={0.8}
            />
            
            {/* Annotation on hover */}
            {isHovered && (
              <g className="outlier-annotation">
                <OutlierTooltip
                  x={x}
                  y={y}
                  value={value}
                  zScore={zScore}
                  method={outlierData.method}
                  theme={theme}
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * OutlierTooltip Component
 * Shows detailed information about an outlier
 */
interface OutlierTooltipProps {
  x: number;
  y: number;
  value: number;
  zScore?: number;
  method: string;
  theme: any;
}

function OutlierTooltip({ x, y, value, zScore, method, theme }: OutlierTooltipProps) {
  const tooltipWidth = 140;
  const tooltipHeight = zScore !== undefined ? 70 : 50;
  
  // Position tooltip above the point, or below if near top
  const tooltipX = x - tooltipWidth / 2;
  const tooltipY = y > 100 ? y - tooltipHeight - 15 : y + 15;
  
  return (
    <g className="outlier-tooltip">
      {/* Tooltip background */}
      <rect
        x={tooltipX}
        y={tooltipY}
        width={tooltipWidth}
        height={tooltipHeight}
        fill="white"
        stroke={theme.tokens.borders.gridLineColor}
        strokeWidth={1}
        rx={4}
        opacity={0.95}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
      />
      
      {/* Tooltip content */}
      <text
        x={tooltipX + 10}
        y={tooltipY + 18}
        fontSize={theme.typography.tooltip.fontSize}
        fontWeight={600}
        fill={theme.typography.tooltip.color}
      >
        Outlier Detected
      </text>
      
      <text
        x={tooltipX + 10}
        y={tooltipY + 35}
        fontSize={theme.typography.tooltip.fontSize - 1}
        fill={theme.typography.tooltip.color}
      >
        Value: {typeof value === 'number' ? value.toFixed(2) : value}
      </text>
      
      {zScore !== undefined && (
        <text
          x={tooltipX + 10}
          y={tooltipY + 50}
          fontSize={theme.typography.tooltip.fontSize - 1}
          fill={theme.typography.tooltip.color}
        >
          Z-score: {zScore.toFixed(2)}
        </text>
      )}
      
      <text
        x={tooltipX + 10}
        y={tooltipY + (zScore !== undefined ? 65 : 50)}
        fontSize={theme.typography.tooltip.fontSize - 2}
        fill={theme.tokens.borders.gridLineColor}
      >
        Method: {method.toUpperCase()}
      </text>
    </g>
  );
}

/**
 * OutlierSummary Component
 * Shows a summary of all outliers detected
 */
export interface OutlierSummaryProps {
  outlierData: OutlierData;
  config: OutlierConfig;
}

export function OutlierSummary({ outlierData, config }: OutlierSummaryProps) {
  const { theme, getSemanticColor } = useChartThemeOptional();
  
  if (!config.enabled || !outlierData || outlierData.indices.length === 0) {
    return null;
  }
  
  const color = config.color || getSemanticColor('warning');
  
  return (
    <div
      className="outlier-summary"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: `${color}15`,
        borderRadius: '4px',
        border: `1px solid ${color}40`,
        fontSize: theme.typography.dataLabel.fontSize,
        color: theme.typography.dataLabel.color,
      }}
    >
      <svg width="16" height="16">
        <circle cx="8" cy="8" r="6" fill={color} opacity={0.3} />
        <circle cx="8" cy="8" r="4" fill={color} />
        <circle cx="8" cy="8" r="2" fill="white" />
      </svg>
      <span>
        <strong>{outlierData.indices.length}</strong> outlier
        {outlierData.indices.length !== 1 ? 's' : ''} detected
      </span>
      <span style={{ color: theme.tokens.borders.gridLineColor, fontSize: '0.9em' }}>
        ({outlierData.method.toUpperCase()})
      </span>
    </div>
  );
}

export default OutlierHighlight;
