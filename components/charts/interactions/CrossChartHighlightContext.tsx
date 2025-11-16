'use client';

/**
 * Cross-Chart Highlighting Context
 * Manages highlight state across all charts in a story
 * Provides event system for data point selection and synchronization
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { DataPoint } from '@/types';

/**
 * Highlight state for a data point
 */
export interface HighlightState {
  chartId: string;
  dataPoint: DataPoint;
  dataKey?: string;
  index?: number;
  timestamp?: number;
}

/**
 * Highlight relationship defines how charts are connected
 */
export interface HighlightRelationship {
  sourceChartId: string;
  targetChartId: string;
  matchKey: string; // The key to match between charts (e.g., 'date', 'category')
}

/**
 * Context value interface
 */
interface CrossChartHighlightContextValue {
  // Current highlight state
  highlightedPoints: Map<string, HighlightState>;
  
  // Highlight a data point
  highlightPoint: (chartId: string, dataPoint: DataPoint, dataKey?: string, index?: number) => void;
  
  // Clear highlight for a specific chart
  clearChartHighlight: (chartId: string) => void;
  
  // Clear all highlights
  clearAllHighlights: () => void;
  
  // Check if a point is highlighted
  isPointHighlighted: (chartId: string, dataPoint: DataPoint) => boolean;
  
  // Get highlight state for a chart
  getChartHighlight: (chartId: string) => HighlightState | undefined;
  
  // Register relationships between charts
  registerRelationship: (relationship: HighlightRelationship) => void;
  
  // Unregister relationship
  unregisterRelationship: (sourceChartId: string, targetChartId: string) => void;
  
  // Get all relationships for a chart
  getChartRelationships: (chartId: string) => HighlightRelationship[];
}

/**
 * Create context with undefined default
 */
const CrossChartHighlightContext = createContext<CrossChartHighlightContextValue | undefined>(
  undefined
);

/**
 * Provider props
 */
export interface CrossChartHighlightProviderProps {
  children: React.ReactNode;
  autoSyncByKey?: string; // Automatically sync charts by this key (e.g., 'date')
}

/**
 * Cross-Chart Highlight Provider
 * Wraps chart components to enable cross-chart highlighting
 */
export function CrossChartHighlightProvider({
  children,
  autoSyncByKey,
}: CrossChartHighlightProviderProps) {
  const [highlightedPoints, setHighlightedPoints] = useState<Map<string, HighlightState>>(
    new Map()
  );
  const [relationships, setRelationships] = useState<HighlightRelationship[]>([]);

  /**
   * Highlight a data point and propagate to related charts
   */
  const highlightPoint = useCallback(
    (chartId: string, dataPoint: DataPoint, dataKey?: string, index?: number) => {
      const timestamp = Date.now();
      
      setHighlightedPoints((prev) => {
        const newMap = new Map(prev);
        
        // Set highlight for source chart
        newMap.set(chartId, {
          chartId,
          dataPoint,
          dataKey,
          index,
          timestamp,
        });

        // Find related charts and highlight matching points
        const relatedCharts = relationships.filter(
          (r) => r.sourceChartId === chartId || r.targetChartId === chartId
        );

        relatedCharts.forEach((relationship) => {
          const targetChartId =
            relationship.sourceChartId === chartId
              ? relationship.targetChartId
              : relationship.sourceChartId;
          
          const matchKey = relationship.matchKey;
          const matchValue = dataPoint[matchKey];

          // Create a synthetic highlight for the related chart
          if (matchValue !== undefined) {
            newMap.set(targetChartId, {
              chartId: targetChartId,
              dataPoint: { [matchKey]: matchValue } as DataPoint,
              dataKey: matchKey,
              timestamp,
            });
          }
        });

        // Auto-sync by key if enabled
        if (autoSyncByKey && dataPoint[autoSyncByKey] !== undefined) {
          // This would highlight all charts with matching key value
          // Implementation depends on having access to all chart IDs
        }

        return newMap;
      });
    },
    [relationships, autoSyncByKey]
  );

  /**
   * Clear highlight for a specific chart
   */
  const clearChartHighlight = useCallback((chartId: string) => {
    setHighlightedPoints((prev) => {
      const newMap = new Map(prev);
      newMap.delete(chartId);
      return newMap;
    });
  }, []);

  /**
   * Clear all highlights
   */
  const clearAllHighlights = useCallback(() => {
    setHighlightedPoints(new Map());
  }, []);

  /**
   * Check if a point is highlighted
   */
  const isPointHighlighted = useCallback(
    (chartId: string, dataPoint: DataPoint): boolean => {
      const highlight = highlightedPoints.get(chartId);
      if (!highlight) return false;

      // Check if the data point matches
      // Compare by index if available, otherwise by data values
      if (highlight.index !== undefined && dataPoint.index !== undefined) {
        return highlight.index === dataPoint.index;
      }

      // Compare by key values
      const keys = Object.keys(highlight.dataPoint);
      return keys.every(
        (key) => highlight.dataPoint[key] === dataPoint[key]
      );
    },
    [highlightedPoints]
  );

  /**
   * Get highlight state for a chart
   */
  const getChartHighlight = useCallback(
    (chartId: string): HighlightState | undefined => {
      return highlightedPoints.get(chartId);
    },
    [highlightedPoints]
  );

  /**
   * Register a relationship between charts
   */
  const registerRelationship = useCallback((relationship: HighlightRelationship) => {
    setRelationships((prev) => {
      // Check if relationship already exists
      const exists = prev.some(
        (r) =>
          r.sourceChartId === relationship.sourceChartId &&
          r.targetChartId === relationship.targetChartId &&
          r.matchKey === relationship.matchKey
      );

      if (exists) return prev;
      return [...prev, relationship];
    });
  }, []);

  /**
   * Unregister a relationship
   */
  const unregisterRelationship = useCallback(
    (sourceChartId: string, targetChartId: string) => {
      setRelationships((prev) =>
        prev.filter(
          (r) =>
            !(
              r.sourceChartId === sourceChartId &&
              r.targetChartId === targetChartId
            )
        )
      );
    },
    []
  );

  /**
   * Get all relationships for a chart
   */
  const getChartRelationships = useCallback(
    (chartId: string): HighlightRelationship[] => {
      return relationships.filter(
        (r) => r.sourceChartId === chartId || r.targetChartId === chartId
      );
    },
    [relationships]
  );

  const value = useMemo(
    () => ({
      highlightedPoints,
      highlightPoint,
      clearChartHighlight,
      clearAllHighlights,
      isPointHighlighted,
      getChartHighlight,
      registerRelationship,
      unregisterRelationship,
      getChartRelationships,
    }),
    [
      highlightedPoints,
      highlightPoint,
      clearChartHighlight,
      clearAllHighlights,
      isPointHighlighted,
      getChartHighlight,
      registerRelationship,
      unregisterRelationship,
      getChartRelationships,
    ]
  );

  return (
    <CrossChartHighlightContext.Provider value={value}>
      {children}
    </CrossChartHighlightContext.Provider>
  );
}

/**
 * Hook to use cross-chart highlighting
 */
export function useCrossChartHighlight() {
  const context = useContext(CrossChartHighlightContext);
  
  if (context === undefined) {
    throw new Error(
      'useCrossChartHighlight must be used within a CrossChartHighlightProvider'
    );
  }
  
  return context;
}

/**
 * Optional hook that returns undefined if not within provider
 * Useful for components that can work with or without highlighting
 */
export function useOptionalCrossChartHighlight() {
  return useContext(CrossChartHighlightContext);
}

export default CrossChartHighlightContext;
