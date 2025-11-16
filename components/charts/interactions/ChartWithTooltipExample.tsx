'use client';

/**
 * Chart Integration Example with Enhanced Tooltips
 * Demonstrates how to integrate TooltipManager with actual chart components
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TooltipManager } from './TooltipManager';
import {
  createCategoricalTooltip,
  createTimeSeriesTooltip,
} from './tooltipUtils';

/**
 * Sample data for demonstrations
 */
const timeSeriesData = [
  { date: '2024-01', value: 4000 },
  { date: '2024-02', value: 3000 },
  { date: '2024-03', value: 5000 },
  { date: '2024-04', value: 4500 },
  { date: '2024-05', value: 6000 },
  { date: '2024-06', value: 5500 },
  { date: '2024-07', value: 7000 },
  { date: '2024-08', value: 6500 },
];

const categoricalData = [
  { category: 'Product A', value: 12000, color: '#3b82f6' },
  { category: 'Product B', value: 8500, color: '#10b981' },
  { category: 'Product C', value: 15000, color: '#f59e0b' },
  { category: 'Product D', value: 6000, color: '#ef4444' },
  { category: 'Product E', value: 10500, color: '#8b5cf6' },
];

/**
 * Line Chart with Enhanced Tooltips
 */
export function LineChartWithTooltip() {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const allValues = timeSeriesData.map((d) => d.value);

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">
        Line Chart with Enhanced Tooltips
      </h3>
      <TooltipManager>
        {(showTooltip, hideTooltip) => (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={timeSeriesData}
              onMouseMove={(state: any) => {
                if (state.isTooltipActive && state.activePayload) {
                  const payload = state.activePayload[0].payload;
                  const index = timeSeriesData.findIndex(
                    (d) => d.date === payload.date
                  );
                  setActiveIndex(index);

                  const tooltipData = createTimeSeriesTooltip(
                    {
                      timestamp: payload.date,
                      value: payload.value,
                      label: 'Revenue',
                      color: '#3b82f6',
                      unit: '$',
                    },
                    allValues,
                    {
                      showMovingAverage: true,
                      movingAveragePeriod: 3,
                    }
                  );

                  showTooltip(tooltipData, {
                    x: state.chartX + 50,
                    y: state.chartY + 50,
                  });
                }
              }}
              onMouseLeave={() => {
                setActiveIndex(null);
                hideTooltip();
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </TooltipManager>
    </div>
  );
}

/**
 * Bar Chart with Enhanced Tooltips
 */
export function BarChartWithTooltip() {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const allValues = categoricalData.map((d) => d.value);

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">
        Bar Chart with Enhanced Tooltips
      </h3>
      <TooltipManager>
        {(showTooltip, hideTooltip) => (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categoricalData}
              onMouseMove={(state: any) => {
                if (state.isTooltipActive && state.activePayload) {
                  const payload = state.activePayload[0].payload;
                  const index = categoricalData.findIndex(
                    (d) => d.category === payload.category
                  );
                  setActiveIndex(index);

                  const tooltipData = createCategoricalTooltip(
                    {
                      category: payload.category,
                      value: payload.value,
                      color: payload.color,
                      unit: '$',
                    },
                    allValues
                  );

                  showTooltip(tooltipData, {
                    x: state.chartX + 50,
                    y: state.chartY + 50,
                  });
                }
              }}
              onMouseLeave={() => {
                setActiveIndex(null);
                hideTooltip();
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="category"
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Bar dataKey="value">
                {categoricalData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === index ? 1 : 0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </TooltipManager>
    </div>
  );
}

/**
 * Custom Interactive Chart with Tooltips
 */
export function CustomInteractiveChart() {
  const data = [
    { label: 'Q1', value: 45000, target: 50000, color: '#ef4444' },
    { label: 'Q2', value: 52000, target: 50000, color: '#10b981' },
    { label: 'Q3', value: 48000, target: 50000, color: '#f59e0b' },
    { label: 'Q4', value: 61000, target: 50000, color: '#10b981' },
  ];

  const allValues = data.map((d) => d.value);
  const total = allValues.reduce((sum, val) => sum + val, 0);

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">
        Quarterly Performance with Targets
      </h3>
      <TooltipManager>
        {(showTooltip, hideTooltip) => (
          <div className="space-y-4">
            {data.map((item, index) => {
              const percentOfTotal = (item.value / total) * 100;
              const vsTarget = ((item.value - item.target) / item.target) * 100;
              const rank = [...allValues]
                .sort((a, b) => b - a)
                .indexOf(item.value) + 1;

              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {item.label}
                    </span>
                    <span className="text-gray-600">
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative">
                    {/* Target line */}
                    <div
                      className="absolute h-full border-l-2 border-dashed border-gray-400"
                      style={{
                        left: `${(item.target / 70000) * 100}%`,
                      }}
                    />
                    {/* Progress bar */}
                    <div
                      className="h-8 rounded cursor-pointer transition-all hover:opacity-90"
                      style={{
                        width: `${(item.value / 70000) * 100}%`,
                        backgroundColor: item.color,
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        showTooltip(
                          {
                            title: `${item.label} Performance`,
                            metrics: [
                              {
                                label: 'Actual',
                                value: item.value,
                                color: item.color,
                                unit: '$',
                              },
                              {
                                label: 'Target',
                                value: item.target,
                                color: '#6b7280',
                                unit: '$',
                              },
                              {
                                label: 'vs Target',
                                value: `${vsTarget > 0 ? '+' : ''}${vsTarget.toFixed(1)}%`,
                                color: vsTarget > 0 ? '#10b981' : '#ef4444',
                              },
                            ],
                            statistics: {
                              percentOfTotal,
                              rank,
                              comparisonToAverage:
                                ((item.value - total / data.length) /
                                  (total / data.length)) *
                                100,
                              trend:
                                vsTarget > 5
                                  ? 'up'
                                  : vsTarget < -5
                                  ? 'down'
                                  : 'stable',
                            },
                            customContent: (
                              <div className="text-xs">
                                <p className="font-medium text-gray-700 mb-1">
                                  Performance Status:
                                </p>
                                <p
                                  className={
                                    vsTarget > 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }
                                >
                                  {vsTarget > 0
                                    ? '✓ Target exceeded'
                                    : '✗ Below target'}
                                </p>
                              </div>
                            ),
                          },
                          { x: rect.left + rect.width / 2, y: rect.top }
                        );
                      }}
                      onMouseLeave={hideTooltip}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TooltipManager>
    </div>
  );
}

/**
 * All Chart Examples Combined
 */
export function ChartWithTooltipExamples() {
  return (
    <div className="space-y-6 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Chart Integration with Enhanced Tooltips
        </h2>
        <p className="text-gray-600">
          Real-world examples of charts using the enhanced tooltip system
        </p>
      </div>

      <LineChartWithTooltip />
      <BarChartWithTooltip />
      <CustomInteractiveChart />
    </div>
  );
}

export default ChartWithTooltipExamples;
