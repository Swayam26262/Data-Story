'use client';

/**
 * Cross-Chart Highlighting Example
 * Demonstrates the cross-chart highlighting system with multiple synchronized charts
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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CrossChartHighlightProvider,
  useCrossChartHighlight,
} from './CrossChartHighlightContext';
import { useChartHighlight } from './useChartHighlight';
import { HighlightDot, HighlightBar, useHighlightStyles } from './HighlightEffects';

/**
 * Sample data for demonstration
 */
const sampleData = [
  { date: '2024-01', sales: 4000, revenue: 2400, profit: 1600 },
  { date: '2024-02', sales: 3000, revenue: 1398, profit: 1200 },
  { date: '2024-03', sales: 2000, revenue: 9800, profit: 800 },
  { date: '2024-04', sales: 2780, revenue: 3908, profit: 1780 },
  { date: '2024-05', sales: 1890, revenue: 4800, profit: 1390 },
  { date: '2024-06', sales: 2390, revenue: 3800, profit: 1890 },
  { date: '2024-07', sales: 3490, revenue: 4300, profit: 2190 },
];

/**
 * Line Chart with Highlighting
 */
function HighlightedLineChart() {
  const {
    isPointHighlighted,
    highlightPoint,
    clearHighlight,
    highlightConfig,
  } = useChartHighlight({
    chartId: 'line-chart',
    relationships: [
      { sourceChartId: 'line-chart', targetChartId: 'bar-chart', matchKey: 'date' },
    ],
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Sales Trend (Line Chart)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={sampleData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onMouseLeave={clearHighlight}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#2563eb"
            strokeWidth={2}
            dot={(props: any) => (
              <HighlightDot
                {...props}
                isHighlighted={isPointHighlighted(props.payload, props.index)}
                config={highlightConfig}
              />
            )}
            activeDot={{
              onClick: (e: any, payload: any) => {
                highlightPoint(payload.payload, 'sales', payload.index);
              },
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-2">
        Click on a data point to highlight it across all charts
      </p>
    </div>
  );
}

/**
 * Bar Chart with Highlighting
 */
function HighlightedBarChart() {
  const {
    isPointHighlighted,
    highlightPoint,
    clearHighlight,
    highlightConfig,
  } = useChartHighlight({
    chartId: 'bar-chart',
    relationships: [
      { sourceChartId: 'bar-chart', targetChartId: 'line-chart', matchKey: 'date' },
    ],
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Revenue Comparison (Bar Chart)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={sampleData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onMouseLeave={clearHighlight}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="revenue"
            fill="#10b981"
            shape={(props: any) => (
              <HighlightBar
                {...props}
                isHighlighted={isPointHighlighted(props.payload, props.index)}
                config={highlightConfig}
              />
            )}
            onClick={(data: any, index: number) => {
              highlightPoint(data, 'revenue', index);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-2">
        Click on a bar to highlight the corresponding point in the line chart
      </p>
    </div>
  );
}

/**
 * Control Panel for Highlighting
 */
function HighlightControlPanel() {
  const { clearAllHighlights, highlightedPoints } = useCrossChartHighlight();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Highlight Controls</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Active Highlights: {highlightedPoints.size}
          </span>
          <button
            onClick={clearAllHighlights}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
            disabled={highlightedPoints.size === 0}
          >
            Clear All Highlights
          </button>
        </div>
        
        {highlightedPoints.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Highlighted Points:
            </p>
            <ul className="text-xs text-blue-800 space-y-1">
              {Array.from(highlightedPoints.entries()).map(([chartId, state]) => (
                <li key={chartId}>
                  <span className="font-medium">{chartId}:</span>{' '}
                  {JSON.stringify(state.dataPoint)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main Example Component
 */
export function CrossChartHighlightExample() {
  // Inject highlight styles
  useHighlightStyles();

  return (
    <CrossChartHighlightProvider autoSyncByKey="date">
      <div className="space-y-6 p-6 bg-gray-50">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Cross-Chart Highlighting Demo</h2>
          <p className="text-gray-600">
            Click on any data point in either chart to see synchronized highlighting across
            both visualizations. The system automatically matches data points by date.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HighlightedLineChart />
          <HighlightedBarChart />
        </div>

        <HighlightControlPanel />

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Features Demonstrated:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                <strong>Data Point Selection:</strong> Click any point to highlight it
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                <strong>Cross-Chart Synchronization:</strong> Highlights propagate to related
                charts based on matching keys
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                <strong>Visual Effects:</strong> Glow, scale, and border effects make
                highlighted points stand out
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                <strong>State Management:</strong> Centralized highlight state across all
                charts
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                <strong>Clear Functionality:</strong> Clear individual or all highlights with
                one click
              </span>
            </li>
          </ul>
        </div>
      </div>
    </CrossChartHighlightProvider>
  );
}

export default CrossChartHighlightExample;
