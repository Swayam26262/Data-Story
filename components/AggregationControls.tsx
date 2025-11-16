'use client';

import React from 'react';
import type { AggregationLevel, ComparisonType } from '@/lib/aggregation';

export interface AggregationControlsProps {
  aggregationLevel: AggregationLevel;
  comparisonType: ComparisonType;
  onAggregationChange: (level: AggregationLevel) => void;
  onComparisonChange: (type: ComparisonType) => void;
  disabled?: boolean;
}

const aggregationLevels: { value: AggregationLevel; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const comparisonTypes: { value: ComparisonType; label: string }[] = [
  { value: 'none', label: 'No Comparison' },
  { value: 'WoW', label: 'Week over Week' },
  { value: 'MoM', label: 'Month over Month' },
  { value: 'QoQ', label: 'Quarter over Quarter' },
  { value: 'YoY', label: 'Year over Year' },
];

export default function AggregationControls({
  aggregationLevel,
  comparisonType,
  onAggregationChange,
  onComparisonChange,
  disabled = false,
}: AggregationControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[#0A0A0A] border border-white/10 rounded-lg">
      {/* Aggregation Level Selector */}
      <div className="flex-1">
        <label
          htmlFor="aggregation-level"
          className="block text-sm font-medium text-white mb-2"
        >
          Aggregation Level
        </label>
        <select
          id="aggregation-level"
          value={aggregationLevel}
          onChange={(e) => onAggregationChange(e.target.value as AggregationLevel)}
          disabled={disabled}
          className="w-full min-h-[44px] px-3 py-2 bg-[#1a1a1a] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {aggregationLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Time Period Comparison Selector */}
      <div className="flex-1">
        <label
          htmlFor="comparison-type"
          className="block text-sm font-medium text-white mb-2"
        >
          Time Period Comparison
        </label>
        <select
          id="comparison-type"
          value={comparisonType}
          onChange={(e) => onComparisonChange(e.target.value as ComparisonType)}
          disabled={disabled}
          className="w-full min-h-[44px] px-3 py-2 bg-[#1a1a1a] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {comparisonTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Comparison Indicator */}
      {comparisonType !== 'none' && (
        <div className="flex items-end">
          <div className="px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg">
            <span className="text-xs text-primary font-medium">
              Comparison Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
