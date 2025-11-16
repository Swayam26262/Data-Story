'use client';

/**
 * Tooltip Manager Examples
 * Demonstrates the enhanced tooltip functionality with various use cases
 */

import React, { useState } from 'react';
import { TooltipManager } from './TooltipManager';
import type { TooltipData, Point } from '@/types';

/**
 * Example 1: Basic Tooltip with Multiple Metrics
 */
export function BasicTooltipExample() {
  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Basic Tooltip Example</h3>
      <TooltipManager>
        {(showTooltip, hideTooltip) => (
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                showTooltip(
                  {
                    title: 'Sales Data',
                    metrics: [
                      { label: 'Revenue', value: 125000, color: '#3b82f6', unit: '$' },
                      { label: 'Units Sold', value: 1250, color: '#10b981' },
                      { label: 'Avg Price', value: 100, color: '#f59e0b', unit: '$' },
                    ],
                  },
                  { x: rect.left + rect.width / 2, y: rect.top }
                );
              }}
              onMouseLeave={hideTooltip}
            >
              Hover for Sales Data
            </button>
          </div>
        )}
      </TooltipManager>
    </div>
  );
}

/**
 * Example 2: Tooltip with Statistics
 */
export function StatisticsTooltipExample() {
  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Statistics Tooltip Example</h3>
      <TooltipManager>
        {(showTooltip, hideTooltip) => (
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                showTooltip(
                  {
                    title: 'Q4 Performance',
                    metrics: [
                      { label: 'Revenue', value: 250000, color: '#10b981', unit: '$' },
                    ],
                    statistics: {
                      percentOfTotal: 35.5,
                      rank: 2,
                      comparisonToAverage: 15.3,
                      trend: 'up',
                    },
                  },
                  { x: rect.left + rect.width / 2, y: rect.top }
                );
              }}
              onMouseLeave={hideTooltip}
            >
              Hover for Q4 Stats
            </button>

            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                showTooltip(
                  {
                    title: 'Q1 Performance',
                    metrics: [
                      { label: 'Revenue', value: 180000, color: '#ef4444', unit: '$' },
                    ],
                    statistics: {
                      percentOfTotal: 25.7,
                      rank: 4,
                      comparisonToAverage: -8.2,
                      trend: 'down',
                    },
                  },
                  { x: rect.left + rect.width / 2, y: rect.top }
                );
              }}
              onMouseLeave={hideTooltip}
            >
              Hover for Q1 Stats
            </button>
          </div>
        )}
      </TooltipManager>
    </div>
  );
}

/**
 * Example 3: Tooltip with Custom Content
 */
export function CustomContentTooltipExample() {
  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Custom Content Tooltip Example</h3>
      <TooltipManager>
        {(showTooltip, hideTooltip) => (
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                showTooltip(
                  {
                    title: 'Product Details',
                    metrics: [
                      { label: 'Price', value: 99.99, color: '#8b5cf6', unit: '$' },
                      { label: 'Stock', value: 45, color: '#10b981' },
                    ],
                    customContent: (
                      <div className="space-y-1">
                        <p className="text-gray-700 font-medium">Features:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                          <li>Premium Quality</li>
                          <li>2-Year Warranty</li>
                          <li>Free Shipping</li>
                        </ul>
                      </div>
                    ),
                  },
                  { x: rect.left + rect.width / 2, y: rect.top }
                );
              }}
              onMouseLeave={hideTooltip}
            >
              Hover for Product Info
            </button>
          </div>
        )}
      </TooltipManager>
    </div>
  );
}

/**
 * Example 4: Interactive Chart with Tooltips
 */
export function InteractiveChartExample() {
  const chartData = [
    { month: 'Jan', value: 4000, average: 3500 },
    { month: 'Feb', value: 3000, average: 3500 },
    { month: 'Mar', value: 5000, average: 3500 },
    { month: 'Apr', value: 4500, average: 3500 },
    { month: 'May', value: 6000, average: 3500 },
    { month: 'Jun', value: 5500, average: 3500 },
  ];

  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Interactive Chart Example</h3>
      <TooltipManager>
        {(showTooltip, hideTooltip) => (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-end gap-2 h-48">
              {chartData.map((item, index) => {
                const height = (item.value / 6000) * 100;
                const comparisonToAvg =
                  ((item.value - item.average) / item.average) * 100;
                const percentOfTotal = (item.value / totalValue) * 100;

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 cursor-pointer transition-colors rounded-t"
                      style={{ height: `${height}%` }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        showTooltip(
                          {
                            title: item.month,
                            metrics: [
                              {
                                label: 'Value',
                                value: item.value,
                                color: '#3b82f6',
                                unit: '$',
                              },
                              {
                                label: 'Average',
                                value: item.average,
                                color: '#6b7280',
                                unit: '$',
                              },
                            ],
                            statistics: {
                              percentOfTotal,
                              rank: index + 1,
                              comparisonToAverage: comparisonToAvg,
                              trend:
                                comparisonToAvg > 5
                                  ? 'up'
                                  : comparisonToAvg < -5
                                  ? 'down'
                                  : 'stable',
                            },
                          },
                          { x: rect.left + rect.width / 2, y: rect.top }
                        );
                      }}
                      onMouseLeave={hideTooltip}
                    />
                    <span className="text-xs text-gray-600">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </TooltipManager>
    </div>
  );
}

/**
 * Example 5: Delayed Tooltip
 */
export function DelayedTooltipExample() {
  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Delayed Tooltip Example</h3>
      <TooltipManager delay={500}>
        {(showTooltip, hideTooltip) => (
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                showTooltip(
                  {
                    title: 'Delayed Tooltip',
                    metrics: [
                      {
                        label: 'Info',
                        value: 'This tooltip appears after 500ms',
                      },
                    ],
                  },
                  { x: rect.left + rect.width / 2, y: rect.top }
                );
              }}
              onMouseLeave={hideTooltip}
            >
              Hover (500ms delay)
            </button>
          </div>
        )}
      </TooltipManager>
    </div>
  );
}

/**
 * All Examples Combined
 */
export function TooltipExamples() {
  return (
    <div className="space-y-6 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Enhanced Tooltip Manager Examples</h2>
        <p className="text-gray-600">
          Demonstrating rich tooltips with multiple metrics, statistics, and custom content
        </p>
      </div>

      <BasicTooltipExample />
      <StatisticsTooltipExample />
      <CustomContentTooltipExample />
      <InteractiveChartExample />
      <DelayedTooltipExample />
    </div>
  );
}

export default TooltipExamples;
