'use client';

import { useState, useMemo, useCallback } from 'react';
import type { ChartDataPoint } from '@/lib/models/Story';
import type { AggregationLevel, ComparisonType, ComparisonResult } from '@/lib/aggregation';
import {
  aggregateData,
  compareTimePeriods,
  detectDateField,
  detectValueFields,
} from '@/lib/aggregation';

export interface UseAggregationOptions {
  initialAggregationLevel?: AggregationLevel;
  initialComparisonType?: ComparisonType;
  dateField?: string;
  valueFields?: string[];
}

export interface UseAggregationReturn {
  aggregationLevel: AggregationLevel;
  comparisonType: ComparisonType;
  aggregatedData: ChartDataPoint[];
  comparisonResult: ComparisonResult | null;
  setAggregationLevel: (level: AggregationLevel) => void;
  setComparisonType: (type: ComparisonType) => void;
  isAggregated: boolean;
  hasComparison: boolean;
}

/**
 * Hook for managing data aggregation and time period comparisons
 */
export function useAggregation(
  data: ChartDataPoint[],
  options: UseAggregationOptions = {}
): UseAggregationReturn {
  const {
    initialAggregationLevel = 'daily',
    initialComparisonType = 'none',
    dateField: providedDateField,
    valueFields: providedValueFields,
  } = options;

  const [aggregationLevel, setAggregationLevel] =
    useState<AggregationLevel>(initialAggregationLevel);
  const [comparisonType, setComparisonType] = useState<ComparisonType>(initialComparisonType);

  // Detect date and value fields if not provided
  const dateField = useMemo(() => {
    return providedDateField || detectDateField(data) || 'date';
  }, [data, providedDateField]);

  const valueFields = useMemo(() => {
    return providedValueFields || detectValueFields(data, [dateField]);
  }, [data, providedValueFields, dateField]);

  // Aggregate data based on current level
  const aggregatedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // If daily and no comparison, return original data
    if (aggregationLevel === 'daily' && comparisonType === 'none') {
      return data;
    }

    return aggregateData(data, dateField, valueFields, aggregationLevel);
  }, [data, dateField, valueFields, aggregationLevel, comparisonType]);

  // Calculate comparison if enabled
  const comparisonResult = useMemo(() => {
    if (comparisonType === 'none' || !data || data.length === 0) {
      return null;
    }

    return compareTimePeriods(data, dateField, valueFields, comparisonType, aggregationLevel);
  }, [data, dateField, valueFields, comparisonType, aggregationLevel]);

  const isAggregated = aggregationLevel !== 'daily';
  const hasComparison = comparisonType !== 'none';

  const handleSetAggregationLevel = useCallback((level: AggregationLevel) => {
    setAggregationLevel(level);
  }, []);

  const handleSetComparisonType = useCallback((type: ComparisonType) => {
    setComparisonType(type);
  }, []);

  return {
    aggregationLevel,
    comparisonType,
    aggregatedData,
    comparisonResult,
    setAggregationLevel: handleSetAggregationLevel,
    setComparisonType: handleSetComparisonType,
    isAggregated,
    hasComparison,
  };
}
