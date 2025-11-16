'use client';

import React from 'react';
import type { ComparisonType } from '@/lib/aggregation';

export interface ComparisonOverlayProps {
  percentageChange: number;
  comparisonType: ComparisonType;
  currentTotal?: number;
  previousTotal?: number;
}

export default function ComparisonOverlay({
  percentageChange,
  comparisonType,
  currentTotal,
  previousTotal,
}: ComparisonOverlayProps) {
  if (comparisonType === 'none') return null;

  const isPositive = percentageChange > 0;
  const isNegative = percentageChange < 0;
  const isNeutral = percentageChange === 0;

  const getComparisonLabel = () => {
    switch (comparisonType) {
      case 'WoW':
        return 'vs. Last Week';
      case 'MoM':
        return 'vs. Last Month';
      case 'QoQ':
        return 'vs. Last Quarter';
      case 'YoY':
        return 'vs. Last Year';
      default:
        return '';
    }
  };

  const getColorClasses = () => {
    if (isPositive) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (isNegative) return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  };

  const getArrowIcon = () => {
    if (isPositive) {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      );
    }
    if (isNegative) {
      return (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14"
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-[#0A0A0A] border border-white/10 rounded-lg">
      {/* Percentage Change Badge */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getColorClasses()}`}
      >
        {getArrowIcon()}
        <span className="font-bold text-lg">
          {Math.abs(percentageChange).toFixed(1)}%
        </span>
      </div>

      {/* Comparison Label */}
      <div className="flex flex-col">
        <span className="text-sm text-gray-400">{getComparisonLabel()}</span>
        {currentTotal !== undefined && previousTotal !== undefined && (
          <span className="text-xs text-gray-500">
            Current: {currentTotal.toLocaleString()} | Previous:{' '}
            {previousTotal.toLocaleString()}
          </span>
        )}
      </div>

      {/* Trend Description */}
      <div className="flex-1 text-sm text-gray-300">
        {isPositive && (
          <span>
            <span className="font-semibold text-green-400">Increase</span> compared
            to previous period
          </span>
        )}
        {isNegative && (
          <span>
            <span className="font-semibold text-red-400">Decrease</span> compared to
            previous period
          </span>
        )}
        {isNeutral && (
          <span>
            <span className="font-semibold text-gray-400">No change</span> compared
            to previous period
          </span>
        )}
      </div>
    </div>
  );
}
