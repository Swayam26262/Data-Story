'use client';

/**
 * Legend Controller Examples
 * Demonstrates various use cases for the interactive legend system
 */

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LegendController, InteractiveLegend } from './LegendController';

// Sample data for demonstrations
const sampleData = [
  { month: 'Jan', sales: 4000, revenue: 2400, profit: 1600 },
  { month: 'Feb', sales: 3000, revenue: 1398, profit: 1200 },
  { month: 'Mar', sales: 2000, revenue: 9800, profit: 800 },
  { month: 'Apr', sales: 2780, revenue: 3908, profit: 1780 },
  { month: 'May', sales: 1890, revenue: 4800, profit: 1390 },
  { month: 'Jun', sales: 2390, revenue: 3800, profit: 1890 },
];

const legendItems = [
  { dataKey: 'sales', name: 'Sales', color: '#2563eb' },
  { dataKey: 'revenue', name: 'Revenue', color: '#10b981' },
  { dataKey: 'profit', name: 'Profit', color: '#f59e0b' },
];

/**
 * Example 1: Basic Interactive Legend
 */
export function BasicLegendExample() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Interactive Legend</h3>
      <p className="text-sm text-gray-600">
        Click legend items to toggle series visibility. Ctrl/Cmd+Click to show only one series.
      </p>

      <LegendController
        items={legendItems}
        onVisibilityChange={handleVisibilityChange}
      >
        {(state, handlers) => (
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-80 w-full border border-gray-200 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  
                  {!hiddenSeries.has('sales') && (
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  )}
                  {!hiddenSeries.has('revenue') && (
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  )}
                  {!hiddenSeries.has('profit') && (
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Interactive Legend */}
            <InteractiveLegend
              state={state}
              handlers={handlers}
              position="bottom"
              orientation="horizontal"
            />

            {/* Control buttons */}
            <div className="flex gap-2">
              <button
                onClick={handlers.showAll}
                className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Show All
              </button>
              <button
                onClick={handlers.hideAll}
                className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Hide All
              </button>
            </div>
          </div>
        )}
      </LegendController>
    </div>
  );
}

/**
 * Example 2: Collapsible Legend for Mobile
 */
export function CollapsibleLegendExample() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Collapsible Legend (Mobile)</h3>
      <p className="text-sm text-gray-600">
        On mobile devices, the legend can be collapsed to save space. Try resizing your browser.
      </p>

      <LegendController
        items={legendItems}
        onVisibilityChange={handleVisibilityChange}
        collapsible={true}
        defaultCollapsed={false}
      >
        {(state, handlers) => (
          <div className="space-y-4">
            <div className="h-80 w-full border border-gray-200 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  
                  {!hiddenSeries.has('sales') && (
                    <Bar dataKey="sales" fill="#2563eb" />
                  )}
                  {!hiddenSeries.has('revenue') && (
                    <Bar dataKey="revenue" fill="#10b981" />
                  )}
                  {!hiddenSeries.has('profit') && (
                    <Bar dataKey="profit" fill="#f59e0b" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <InteractiveLegend
              state={state}
              handlers={handlers}
              position="bottom"
              orientation="horizontal"
              collapsible={true}
            />
          </div>
        )}
      </LegendController>
    </div>
  );
}

/**
 * Example 3: Synchronized Legends Across Multiple Charts
 */
export function SynchronizedLegendsExample() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Synchronized Legends</h3>
      <p className="text-sm text-gray-600">
        Toggle visibility in one chart's legend, and it updates across all charts with the same sync key.
      </p>

      <LegendController
        items={legendItems}
        onVisibilityChange={handleVisibilityChange}
        syncKey="demo-sync"
      >
        {(state, handlers) => (
          <div className="space-y-6">
            {/* First Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Line Chart</h4>
              <div className="h-64 w-full border border-gray-200 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    
                    {!hiddenSeries.has('sales') && (
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#2563eb"
                        strokeWidth={2}
                      />
                    )}
                    {!hiddenSeries.has('revenue') && (
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    )}
                    {!hiddenSeries.has('profit') && (
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Second Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Bar Chart</h4>
              <div className="h-64 w-full border border-gray-200 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    
                    {!hiddenSeries.has('sales') && (
                      <Bar dataKey="sales" fill="#2563eb" />
                    )}
                    {!hiddenSeries.has('revenue') && (
                      <Bar dataKey="revenue" fill="#10b981" />
                    )}
                    {!hiddenSeries.has('profit') && (
                      <Bar dataKey="profit" fill="#f59e0b" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Shared Legend */}
            <InteractiveLegend
              state={state}
              handlers={handlers}
              position="bottom"
              orientation="horizontal"
            />
          </div>
        )}
      </LegendController>
    </div>
  );
}

/**
 * Example 4: Hover Effects
 */
export function HoverEffectsExample() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  const handleHoverChange = (dataKey: string | null) => {
    setHoveredSeries(dataKey);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Legend with Hover Effects</h3>
      <p className="text-sm text-gray-600">
        Hover over legend items to highlight the corresponding series in the chart.
      </p>

      <LegendController
        items={legendItems}
        onVisibilityChange={handleVisibilityChange}
        onHoverChange={handleHoverChange}
      >
        {(state, handlers) => (
          <div className="space-y-4">
            <div className="h-80 w-full border border-gray-200 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  
                  {!hiddenSeries.has('sales') && (
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#2563eb"
                      strokeWidth={hoveredSeries === 'sales' ? 4 : 2}
                      strokeOpacity={
                        hoveredSeries === null || hoveredSeries === 'sales' ? 1 : 0.3
                      }
                      dot={{ r: hoveredSeries === 'sales' ? 5 : 4 }}
                    />
                  )}
                  {!hiddenSeries.has('revenue') && (
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={hoveredSeries === 'revenue' ? 4 : 2}
                      strokeOpacity={
                        hoveredSeries === null || hoveredSeries === 'revenue' ? 1 : 0.3
                      }
                      dot={{ r: hoveredSeries === 'revenue' ? 5 : 4 }}
                    />
                  )}
                  {!hiddenSeries.has('profit') && (
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#f59e0b"
                      strokeWidth={hoveredSeries === 'profit' ? 4 : 2}
                      strokeOpacity={
                        hoveredSeries === null || hoveredSeries === 'profit' ? 1 : 0.3
                      }
                      dot={{ r: hoveredSeries === 'profit' ? 5 : 4 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <InteractiveLegend
              state={state}
              handlers={handlers}
              position="bottom"
              orientation="horizontal"
            />

            {hoveredSeries && (
              <div className="text-sm text-gray-600">
                Currently hovering: <span className="font-medium">{hoveredSeries}</span>
              </div>
            )}
          </div>
        )}
      </LegendController>
    </div>
  );
}

/**
 * All Examples Component
 */
export function LegendExamples() {
  return (
    <div className="space-y-12 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Legend Controller Examples</h1>
        <p className="text-gray-600">
          Interactive examples demonstrating the legend controller functionality
        </p>
      </div>

      <BasicLegendExample />
      <hr className="border-gray-200" />
      
      <CollapsibleLegendExample />
      <hr className="border-gray-200" />
      
      <SynchronizedLegendsExample />
      <hr className="border-gray-200" />
      
      <HoverEffectsExample />
    </div>
  );
}

export default LegendExamples;
