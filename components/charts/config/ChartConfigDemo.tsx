'use client';

import React, { useState } from 'react';
import { ChartConfigProvider, ChartConfigButton, useChartConfig } from './index';
import LineChart from '../LineChart';
import BarChart from '../BarChart';
import { useApplyChartConfig } from '@/lib/hooks/useApplyChartConfig';

// Sample data
const sampleData = [
  { month: 'Jan', sales: 4000, expenses: 2400, profit: 1600 },
  { month: 'Feb', sales: 3000, expenses: 1398, profit: 1602 },
  { month: 'Mar', sales: 2000, expenses: 9800, profit: -7800 },
  { month: 'Apr', sales: 2780, expenses: 3908, profit: -1128 },
  { month: 'May', sales: 1890, expenses: 4800, profit: -2910 },
  { month: 'Jun', sales: 2390, expenses: 3800, profit: -1410 },
  { month: 'Jul', sales: 3490, expenses: 4300, profit: -810 },
  { month: 'Aug', sales: 4200, expenses: 2100, profit: 2100 },
  { month: 'Sep', sales: 5100, expenses: 2800, profit: 2300 },
  { month: 'Oct', sales: 6200, expenses: 3200, profit: 3000 },
  { month: 'Nov', sales: 7100, expenses: 3500, profit: 3600 },
  { month: 'Dec', sales: 8000, expenses: 4000, profit: 4000 },
];

/**
 * Configured Chart Component
 * Demonstrates how to apply configuration to charts
 */
function ConfiguredChart({ chartId, type }: { chartId: string; type: 'line' | 'bar' }) {
  const { statistics, interactions } = useApplyChartConfig(chartId);

  const chartConfig = {
    xAxis: 'month',
    yAxis: 'sales',
    colors: ['#2563eb'],
    legend: true,
  };

  if (type === 'line') {
    return (
      <LineChart
        data={sampleData}
        title="Monthly Sales"
        config={chartConfig}
        statistics={statistics}
        interactions={interactions}
        chartId={chartId}
      />
    );
  }

  return (
    <BarChart
      data={sampleData}
      title="Monthly Sales"
      config={chartConfig}
      statistics={statistics}
      interactions={interactions}
      chartId={chartId}
    />
  );
}

/**
 * Configuration Status Display
 */
function ConfigStatus() {
  const { config } = useChartConfig();

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-white">Current Configuration</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Theme:</span>
          <span className="text-white font-medium">{config.theme}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Palette:</span>
          <span className="text-white font-medium">{config.colorPalette}</span>
        </div>
        
        <div className="border-t border-white/10 pt-2 mt-2">
          <p className="text-gray-400 mb-1">Statistical Overlays:</p>
          <div className="space-y-1 pl-2">
            {Object.entries(config.statisticalOverlays).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-600'}`} />
                <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-2 mt-2">
          <p className="text-gray-400 mb-1">Interactions:</p>
          <div className="space-y-1 pl-2">
            {Object.entries(config.interactions).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-600'}`} />
                <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Annotations:</span>
            <span className="text-white font-medium">
              {config.annotations.enabled ? `${config.annotations.items.length} active` : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Chart Configuration Demo
 * Demonstrates the chart configuration system
 */
export default function ChartConfigDemo() {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  return (
    <ChartConfigProvider>
      <div className="min-h-screen bg-background-dark p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Chart Configuration Demo
              </h1>
              <p className="text-gray-400">
                Customize chart appearance, statistical overlays, and interactions
              </p>
            </div>
            <ChartConfigButton variant="button" />
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-blue-400 mb-2">
              How to Use
            </h2>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Click the "Settings" button to open the configuration panel</li>
              <li>Try different themes and color palettes</li>
              <li>Enable statistical overlays like trend lines and moving averages</li>
              <li>Toggle interaction features like zoom and enhanced tooltips</li>
              <li>Add custom annotations to mark important data points</li>
              <li>Your preferences are automatically saved</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Display */}
            <div className="lg:col-span-2 space-y-4">
              {/* Chart Type Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    chartType === 'line'
                      ? 'bg-primary text-background-dark'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Line Chart
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    chartType === 'bar'
                      ? 'bg-primary text-background-dark'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Bar Chart
                </button>
              </div>

              {/* Chart */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 min-h-[400px]">
                <ConfiguredChart chartId="demo-chart" type={chartType} />
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    🎨 Theme Options
                  </h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Default (Modern)</li>
                    <li>• Colorblind Safe</li>
                    <li>• High Contrast</li>
                    <li>• Dark Mode</li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    📊 Statistical Overlays
                  </h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Trend Lines with R²</li>
                    <li>• Moving Averages</li>
                    <li>• Outlier Detection</li>
                    <li>• Confidence Intervals</li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    🖱️ Interactions
                  </h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Zoom & Pan Controls</li>
                    <li>• Brush Selection</li>
                    <li>• Enhanced Tooltips</li>
                    <li>• Interactive Legend</li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    📝 Annotations
                  </h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Text Labels</li>
                    <li>• Reference Lines</li>
                    <li>• Highlighted Regions</li>
                    <li>• Custom Styling</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Configuration Status */}
            <div className="space-y-4">
              <ConfigStatus />
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                  💾 Persistence
                </h3>
                <p className="text-xs text-gray-400">
                  Your configuration is automatically saved to:
                </p>
                <ul className="text-xs text-gray-400 space-y-1 mt-2 list-disc list-inside">
                  <li>Browser localStorage (instant)</li>
                  <li>Server database (when authenticated)</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                  🔧 Integration
                </h3>
                <p className="text-xs text-gray-400 mb-2">
                  Use in your components:
                </p>
                <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
                  <code className="text-gray-300">
{`import { useApplyChartConfig } from '@/lib/hooks/useApplyChartConfig';

const { statistics, interactions } = 
  useApplyChartConfig(chartId);`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChartConfigProvider>
  );
}
