import { useMemo } from 'react';
import { useChartConfigOptional } from '@/lib/contexts/ChartConfigContext';
import { useChartThemeOptional } from '@/lib/theme';
import type { StatisticalOverlay, InteractionConfig } from '@/types/chart';

/**
 * Hook to apply chart configuration to chart components
 * Merges user preferences with chart-specific settings
 */
export function useApplyChartConfig(
  chartId?: string,
  chartStatistics?: StatisticalOverlay,
  chartInteractions?: InteractionConfig
) {
  const configContext = useChartConfigOptional();
  const themeContext = useChartThemeOptional();

  const appliedConfig = useMemo(() => {
    if (!configContext) {
      return {
        statistics: chartStatistics,
        interactions: chartInteractions,
        annotations: [],
      };
    }

    const { config } = configContext;

    // Apply statistical overlays from user preferences
    const statistics: StatisticalOverlay = {
      ...chartStatistics,
      trendLine: config.statisticalOverlays.trendLine
        ? {
            enabled: true,
            type: 'linear',
            showRSquared: true,
          }
        : chartStatistics?.trendLine,
      movingAverage: config.statisticalOverlays.movingAverage
        ? {
            enabled: true,
            periods: [7, 30, 90],
          }
        : chartStatistics?.movingAverage,
      outliers: config.statisticalOverlays.outliers
        ? {
            enabled: true,
            method: 'iqr',
          }
        : chartStatistics?.outliers,
      confidenceInterval: config.statisticalOverlays.confidenceInterval
        ? {
            enabled: true,
            level: 0.95,
          }
        : chartStatistics?.confidenceInterval,
      annotations: [
        ...(chartStatistics?.annotations || []),
        ...(config.annotations.enabled
          ? config.annotations.items
              .filter((item) => !chartId || item.chartId === chartId)
              .map((item) => ({
                type: item.type,
                position: item.position,
                content: item.content,
                style: item.style,
              }))
          : []),
      ],
    };

    // Apply interaction settings from user preferences
    const interactions: InteractionConfig = {
      ...chartInteractions,
      zoom: config.interactions.zoom,
      pan: config.interactions.pan,
      brush: config.interactions.brush,
      crosshair: config.interactions.crosshair,
      tooltip: {
        enabled: config.interactions.tooltipEnhanced,
        showPercentage: config.interactions.tooltipEnhanced,
        showRank: config.interactions.tooltipEnhanced,
        showComparison: config.interactions.tooltipEnhanced,
        ...chartInteractions?.tooltip,
      },
      legend: {
        enabled: true,
        position: 'bottom',
        interactive: config.interactions.legendInteractive,
        ...chartInteractions?.legend,
      },
    };

    // Get annotations for this chart
    const annotations = config.annotations.enabled
      ? config.annotations.items.filter((item) => !chartId || item.chartId === chartId)
      : [];

    return {
      statistics,
      interactions,
      annotations,
    };
  }, [configContext, chartId, chartStatistics, chartInteractions]);

  // Apply theme from configuration
  const appliedTheme = useMemo(() => {
    if (!configContext || !themeContext) {
      return null;
    }

    const { config } = configContext;
    const { setTheme } = themeContext;

    // Set theme if it's different
    if (themeContext.themeName !== config.theme) {
      setTheme(config.theme);
    }

    return themeContext.theme;
  }, [configContext, themeContext]);

  return {
    statistics: appliedConfig.statistics,
    interactions: appliedConfig.interactions,
    annotations: appliedConfig.annotations,
    theme: appliedTheme,
    hasConfig: !!configContext,
  };
}
