/**
 * Responsive Chart Utilities
 * Helper functions for applying responsive design to charts
 */

import type { ResponsiveConfig } from '@/lib/hooks/useResponsiveChart';
import type { ThemeConfig } from '@/lib/theme/types';

/**
 * Get responsive margin configuration for Recharts
 */
export function getResponsiveMargin(
  responsive: ResponsiveConfig,
  options?: {
    extraBottom?: number;
    extraLeft?: number;
    extraRight?: number;
  }
) {
  return {
    top: responsive.spacing.chartPadding.top,
    right: responsive.spacing.chartPadding.right + (options?.extraRight || 0),
    bottom: responsive.spacing.chartPadding.bottom + (options?.extraBottom || 0),
    left: responsive.spacing.chartPadding.left + (options?.extraLeft || 0),
  };
}

/**
 * Get responsive axis configuration
 */
export function getResponsiveAxisConfig(
  responsive: ResponsiveConfig,
  theme: ThemeConfig,
  type: 'x' | 'y' = 'x'
) {
  return {
    stroke: theme.tokens.borders.axisLineColor,
    style: {
      fontSize: `${responsive.fontSize.axisLabel}px`,
      fontWeight: theme.typography.axisLabel.fontWeight,
    },
    tick: {
      fill: theme.typography.axisLabel.color,
      fontSize: responsive.fontSize.axisLabel,
    },
    ...(type === 'x' && {
      angle: responsive.layout.axisLabelAngle,
      textAnchor: 'end' as const,
      height: responsive.isMobile ? 50 : 60,
    }),
  };
}

/**
 * Get responsive legend configuration
 */
export function getResponsiveLegendConfig(responsive: ResponsiveConfig) {
  return {
    wrapperStyle: {
      paddingTop: `${responsive.spacing.legendSpacing}px`,
      fontSize: `${responsive.fontSize.legend}px`,
    },
  };
}

/**
 * Get responsive title style
 */
export function getResponsiveTitleStyle(
  responsive: ResponsiveConfig,
  theme: ThemeConfig
) {
  return {
    fontSize: `${responsive.fontSize.title}px`,
    fontWeight: theme.typography.title.fontWeight,
    color: theme.typography.title.color,
    marginBottom: `${responsive.spacing.titleMargin}px`,
  };
}

/**
 * Create responsive tooltip metrics
 */
export function createTooltipMetrics(
  payload: any[],
  dataStats: { total: number; avg: number; values: number[] } | null
) {
  if (!payload || !payload.length || !dataStats) return null;

  const value = payload[0].value;
  const percentOfTotal = (value / dataStats.total) * 100;
  const comparisonToAverage = ((value - dataStats.avg) / dataStats.avg) * 100;
  const rank = dataStats.values.filter((v: number) => v > value).length + 1;

  return {
    metrics: payload.map((p) => ({
      label: p.name || p.dataKey,
      value: typeof p.value === 'number' ? p.value.toLocaleString() : p.value,
      color: p.color || p.fill || p.stroke,
    })),
    statistics: {
      percentOfTotal,
      rank,
      comparisonToAverage,
    },
  };
}

/**
 * Check if data labels should be shown based on screen size and data count
 */
export function shouldShowDataLabels(
  responsive: ResponsiveConfig,
  dataCount: number,
  forceShow?: boolean
): boolean {
  if (forceShow !== undefined) return forceShow;
  
  // Don't show data labels on mobile
  if (responsive.isMobile) return false;
  
  // Don't show if too many data points
  if (dataCount > 20) return false;
  
  return responsive.layout.showDataLabels;
}

/**
 * Get responsive dot/point size for scatter plots and line charts
 */
export function getResponsiveDotSize(
  responsive: ResponsiveConfig,
  isActive: boolean = false
): number {
  const baseSize = responsive.isMobile ? 2 : 3;
  const activeSize = responsive.isMobile ? 5 : 6;
  return isActive ? activeSize : baseSize;
}

/**
 * Get responsive stroke width
 */
export function getResponsiveStrokeWidth(
  responsive: ResponsiveConfig,
  baseWidth: number = 2
): number {
  return responsive.isMobile ? Math.max(1, baseWidth - 0.5) : baseWidth;
}
