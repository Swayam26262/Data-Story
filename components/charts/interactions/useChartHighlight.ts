/**
 * useChartHighlight Hook
 * Simplifies integration of cross-chart highlighting into chart components
 */

import { useCallback, useEffect, useMemo } from 'react';
import {
  useOptionalCrossChartHighlight,
  type HighlightRelationship,
} from './CrossChartHighlightContext';
import type { DataPoint } from '@/types';
import type { HighlightEffectConfig } from './HighlightEffects';
import { DEFAULT_HIGHLIGHT_CONFIG } from './HighlightEffects';

/**
 * Options for useChartHighlight hook
 */
export interface UseChartHighlightOptions {
  chartId: string;
  enabled?: boolean;
  highlightConfig?: HighlightEffectConfig;
  relationships?: HighlightRelationship[];
  onHighlight?: (dataPoint: DataPoint) => void;
  onClearHighlight?: () => void;
}

/**
 * Return type for useChartHighlight hook
 */
export interface UseChartHighlightReturn {
  // Check if a point is highlighted
  isPointHighlighted: (dataPoint: DataPoint, index?: number) => boolean;
  
  // Highlight a point
  highlightPoint: (dataPoint: DataPoint, dataKey?: string, index?: number) => void;
  
  // Clear highlight for this chart
  clearHighlight: () => void;
  
  // Clear all highlights
  clearAllHighlights: () => void;
  
  // Get current highlight state
  currentHighlight: DataPoint | undefined;
  
  // Highlight configuration
  highlightConfig: HighlightEffectConfig;
  
  // Whether highlighting is enabled
  isEnabled: boolean;
}

/**
 * Hook for integrating cross-chart highlighting into chart components
 * 
 * @example
 * ```tsx
 * function MyChart({ chartId, data }) {
 *   const {
 *     isPointHighlighted,
 *     highlightPoint,
 *     clearHighlight,
 *     highlightConfig,
 *   } = useChartHighlight({
 *     chartId,
 *     relationships: [
 *       { sourceChartId: chartId, targetChartId: 'other-chart', matchKey: 'date' }
 *     ]
 *   });
 *   
 *   return (
 *     <LineChart data={data}>
 *       <Line
 *         dataKey="value"
 *         dot={(props) => (
 *           <HighlightDot
 *             {...props}
 *             isHighlighted={isPointHighlighted(props.payload, props.index)}
 *             config={highlightConfig}
 *           />
 *         )}
 *         onClick={(data) => highlightPoint(data, 'value', data.index)}
 *       />
 *     </LineChart>
 *   );
 * }
 * ```
 */
export function useChartHighlight({
  chartId,
  enabled = true,
  highlightConfig = DEFAULT_HIGHLIGHT_CONFIG,
  relationships = [],
  onHighlight,
  onClearHighlight,
}: UseChartHighlightOptions): UseChartHighlightReturn {
  const context = useOptionalCrossChartHighlight();

  // If no context, return disabled state
  const isEnabled = enabled && context !== undefined;

  // Register relationships on mount
  useEffect(() => {
    if (!isEnabled || !context) return;

    relationships.forEach((relationship) => {
      context.registerRelationship(relationship);
    });

    return () => {
      relationships.forEach((relationship) => {
        context.unregisterRelationship(
          relationship.sourceChartId,
          relationship.targetChartId
        );
      });
    };
  }, [isEnabled, context, relationships]);

  /**
   * Check if a point is highlighted
   */
  const isPointHighlighted = useCallback(
    (dataPoint: DataPoint, index?: number): boolean => {
      if (!isEnabled || !context) return false;

      const highlight = context.getChartHighlight(chartId);
      if (!highlight) return false;

      // Check by index if available
      if (index !== undefined && highlight.index !== undefined) {
        return highlight.index === index;
      }

      // Check by data point values
      const highlightKeys = Object.keys(highlight.dataPoint);
      return highlightKeys.every(
        (key) => highlight.dataPoint[key] === dataPoint[key]
      );
    },
    [isEnabled, context, chartId]
  );

  /**
   * Highlight a point
   */
  const highlightPoint = useCallback(
    (dataPoint: DataPoint, dataKey?: string, index?: number) => {
      if (!isEnabled || !context) return;

      context.highlightPoint(chartId, dataPoint, dataKey, index);
      onHighlight?.(dataPoint);
    },
    [isEnabled, context, chartId, onHighlight]
  );

  /**
   * Clear highlight for this chart
   */
  const clearHighlight = useCallback(() => {
    if (!isEnabled || !context) return;

    context.clearChartHighlight(chartId);
    onClearHighlight?.();
  }, [isEnabled, context, chartId, onClearHighlight]);

  /**
   * Clear all highlights
   */
  const clearAllHighlights = useCallback(() => {
    if (!isEnabled || !context) return;

    context.clearAllHighlights();
    onClearHighlight?.();
  }, [isEnabled, context, onClearHighlight]);

  /**
   * Get current highlight state
   */
  const currentHighlight = useMemo(() => {
    if (!isEnabled || !context) return undefined;

    const highlight = context.getChartHighlight(chartId);
    return highlight?.dataPoint;
  }, [isEnabled, context, chartId]);

  return {
    isPointHighlighted,
    highlightPoint,
    clearHighlight,
    clearAllHighlights,
    currentHighlight,
    highlightConfig,
    isEnabled,
  };
}

/**
 * Hook for creating highlight relationships between charts
 * Useful for setting up relationships in a parent component
 */
export function useChartRelationships(relationships: HighlightRelationship[]) {
  const context = useOptionalCrossChartHighlight();

  useEffect(() => {
    if (!context) return;

    relationships.forEach((relationship) => {
      context.registerRelationship(relationship);
    });

    return () => {
      relationships.forEach((relationship) => {
        context.unregisterRelationship(
          relationship.sourceChartId,
          relationship.targetChartId
        );
      });
    };
  }, [context, relationships]);
}

/**
 * Hook for batch highlighting multiple points
 * Useful for highlighting related data across multiple charts
 */
export function useBatchHighlight() {
  const context = useOptionalCrossChartHighlight();

  const highlightMultiple = useCallback(
    (highlights: Array<{ chartId: string; dataPoint: DataPoint; dataKey?: string; index?: number }>) => {
      if (!context) return;

      highlights.forEach(({ chartId, dataPoint, dataKey, index }) => {
        context.highlightPoint(chartId, dataPoint, dataKey, index);
      });
    },
    [context]
  );

  return { highlightMultiple };
}

export default useChartHighlight;
