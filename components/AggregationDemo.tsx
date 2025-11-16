'use client';

import React, { useState } from 'react';
import { useAggregation } from '@/lib/hooks/useAggregation';
import AggregationControls from './AggregationControls';
import ComparisonOverlay from './ComparisonOverlay';
import type { ChartDataPoint } from '@/lib/models/Story';
import type { AggregationLevel, ComparisonType } from '@/lib/aggregation';

/**
 * Demo component showcasing aggregation and comparison features
 * This can be used for testing and demonstration purposes
 */
export default function AggregationDemo() {
  const [aggregationLevel, setAggregationLevel] = useState<AggregationLevel>('daily');
  const [comparisonType, setComparisonType] = useState<ComparisonType>('none');

  // Sample time-series data
  const sampleData: ChartDataPoint[] = [
    { date: '2024-01-01', value: 100, category: 'Sales' },
    { date: '2024-01-02', value: 120, category: 'Sales' },
    { date: '2024-01-03', value: 110, category: 'Sales' },
    { date: '2024-01-04', value: 130, category: 'Sales' },
    { date: '2024-01-05', value: 125, category: 'Sales' },
    { date: '2024-01-08', value: 140, category: 'Sales' },
    { date: '2024-01-09', value: 135, category: 'Sales' },
    { date: '2024-01-10', value: 150, category: 'Sales' },
    { date: '2024-01-11', value: 145, category: 'Sales' },
    { date: '2024-01-12', value: 160, category: 'Sales' },
    { date: '2024-01-15', value: 155, category: 'Sales' },
    { date: '2024-01-16', value: 170, category: 'Sales' },
    { date: '2024-01-17', value: 165, category: 'Sales' },
    { date: '2024-01-18', value: 180, category: 'Sales' },
    { date: '2024-01-19', value: 175, category: 'Sales' },
    { date: '2024-02-01', value: 190, category: 'Sales' },
    { date: '2024-02-02', value: 185, category: 'Sales' },
    { date: '2024-02-05', value: 200, category: 'Sales' },
    { date: '2024-02-06', value: 195, category: 'Sales' },
    { date: '2024-02-07', value: 210, category: 'Sales' },
  ];

  const {
    aggregatedData,
    comparisonResult,
    isAggregated,
    hasComparison,
  } = useAggregation(sampleData, {
    initialAggregationLevel: aggregationLevel,
    initialComparisonType: comparisonType,
    dateField: 'date',
    valueFields: ['value'],
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Aggregation & Comparison Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Test the data aggregation and time period comparison features
        </p>

        {/* Controls */}
        <AggregationControls
          aggregationLevel={aggregationLevel}
          comparisonType={comparisonType}
          onAggregationChange={setAggregationLevel}
          onComparisonChange={setComparisonType}
        />

        {/* Comparison Overlay */}
        {hasComparison && comparisonResult && (
          <div className="mt-4">
            <ComparisonOverlay
              percentageChange={comparisonResult.percentageChange}
              comparisonType={comparisonType}
            />
          </div>
        )}

        {/* Data Display */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Data */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Original Data
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Total Points: {sampleData.length}</p>
              <p>
                Date Range: {String(sampleData[0].date)} to{' '}
                {String(sampleData[sampleData.length - 1].date)}
              </p>
            </div>
          </div>

          {/* Aggregated Data */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Aggregated Data
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Total Points: {aggregatedData.length}</p>
              <p>Aggregation Level: {aggregationLevel}</p>
              <p>Is Aggregated: {isAggregated ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {hasComparison ? 'Current Period Data' : 'Aggregated Data'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  {hasComparison && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Period
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(hasComparison && comparisonResult
                  ? comparisonResult.current
                  : aggregatedData
                )
                  .slice(0, 10)
                  .map((point, index) => {
                    const previousPoint = hasComparison && comparisonResult
                      ? comparisonResult.previous.find(
                          (p) => p.date === point.date
                        )
                      : null;

                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {String(point.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof point.value === 'number'
                            ? point.value.toFixed(2)
                            : String(point.value)}
                        </td>
                        {hasComparison && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {previousPoint && typeof previousPoint.value === 'number'
                              ? previousPoint.value.toFixed(2)
                              : '-'}
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {aggregatedData.length > 10 && (
            <p className="mt-2 text-sm text-gray-500">
              Showing 10 of {aggregatedData.length} data points
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
