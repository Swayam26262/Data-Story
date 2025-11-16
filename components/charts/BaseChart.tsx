'use client';

/**
 * Base Chart Component
 * Provides common props interface and wrapper for all chart types
 */

import React from 'react';
import type {
  ChartData,
  IChartConfig,
  StatisticalOverlay,
  InteractionConfig,
  DataPoint,
  DataRange,
} from '@/types';
import type { ThemeConfig } from '@/lib/theme/types';
import { useChartThemeOptional } from '@/lib/contexts/ChartThemeContext';

/**
 * Base props interface for all chart components
 */
export interface BaseChartProps {
  data: ChartData;
  title: string;
  config: IChartConfig;
  statistics?: StatisticalOverlay;
  interactions?: InteractionConfig;
  theme?: ThemeConfig;
  onDataPointClick?: (point: DataPoint) => void;
  onRangeSelect?: (range: DataRange) => void;
  className?: string;
  height?: number | string;
  width?: number | string;
}

/**
 * Base Chart Component
 * Provides common functionality and structure for all chart types
 */
export function BaseChart({
  children,
  title,
  className = '',
  height = 300,
  width = '100%',
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
  height?: number | string;
  width?: number | string;
}) {
  const { theme } = useChartThemeOptional();

  return (
    <div
      className={`base-chart ${className}`}
      style={{
        width,
        minHeight: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {title && (
        <h3
          style={{
            fontSize: `${theme.typography.title.fontSize}px`,
            fontWeight: theme.typography.title.fontWeight,
            color: theme.typography.title.color,
            marginBottom: `${theme.tokens.spacing.titleMargin}px`,
            lineHeight: theme.typography.title.lineHeight,
          }}
        >
          {title}
        </h3>
      )}
      <div className="chart-content" style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Hook to get base chart configuration
 */
export function useBaseChartConfig() {
  const { theme, getColor, getSemanticColor } = useChartThemeOptional();

  return {
    theme,
    getColor,
    getSemanticColor,
    margin: theme.tokens.spacing.chartPadding,
    gridStyle: {
      strokeDasharray: theme.tokens.borders.gridLineDash.join(' '),
      stroke: theme.tokens.borders.gridLineColor,
      strokeWidth: theme.tokens.borders.gridLineWidth,
    },
    axisStyle: {
      stroke: theme.tokens.borders.axisLineColor,
      strokeWidth: theme.tokens.borders.axisLineWidth,
    },
    animationDuration: theme.tokens.animations.duration,
  };
}

export default BaseChart;
