/**
 * Responsive Chart Demo Component
 * Demonstrates responsive design features across different screen sizes
 */

'use client';

import { useState } from 'react';
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';
import LineChart from './LineChart';
import BarChart from './BarChart';
import ScatterPlot from './ScatterPlot';
import PieChart from './PieChart';

// Sample data
const sampleLineData = [
  { month: 'Jan', sales: 4000, expenses: 2400 },
  { month: 'Feb', sales: 3000, expenses: 1398 },
  { month: 'Mar', sales: 2000, expenses: 9800 },
  { month: 'Apr', sales: 2780, expenses: 3908 },
  { month: 'May', sales: 1890, expenses: 4800 },
  { month: 'Jun', sales: 2390, expenses: 3800 },
];

const sampleBarData = [
  { category: 'Product A', value: 4000 },
  { category: 'Product B', value: 3000 },
  { category: 'Product C', value: 2000 },
  { category: 'Product D', value: 2780 },
  { category: 'Product E', value: 1890 },
];

const sampleScatterData = [
  { x: 100, y: 200 },
  { x: 120, y: 100 },
  { x: 170, y: 300 },
  { x: 140, y: 250 },
  { x: 150, y: 400 },
  { x: 110, y: 280 },
];

const samplePieData = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

export function ResponsiveChartDemo() {
  const responsive = useResponsiveChart();
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'scatter' | 'pie'>('line');

  return (
    <div className="p-4 space-y-6">
      {/* Responsive Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Responsive Design Demo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700">Device:</span>
            <span className="ml-2 text-blue-900">
              {responsive.isMobile ? 'Mobile' : responsive.isTablet ? 'Tablet' : 'Desktop'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Screen Width:</span>
            <span className="ml-2 text-blue-900">{responsive.screenWidth}px</span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Touch Targets:</span>
            <span className="ml-2 text-blue-900">{responsive.interactions.touchTargetSize}px</span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Tooltip:</span>
            <span className="ml-2 text-blue-900">
              {responsive.interactions.tooltipSimplified ? 'Simplified' : 'Full'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex gap-2 flex-wrap">
        {(['line', 'bar', 'scatter', 'pie'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedChart(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedChart === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            style={{
              minWidth: responsive.interactions.touchTargetSize,
              minHeight: responsive.interactions.touchTargetSize,
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
          </button>
        ))}
      </div>

      {/* Chart Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {selectedChart === 'line' && (
          <LineChart
            data={sampleLineData}
            title="Monthly Sales & Expenses"
            config={{
              xAxis: 'month',
              yAxis: 'sales',
              legend: true,
            }}
            interactions={{
              zoom: true,
              pan: true,
              tooltip: { enabled: true },
              legend: { enabled: true, interactive: true, position: 'bottom' },
            }}
          />
        )}

        {selectedChart === 'bar' && (
          <BarChart
            data={sampleBarData}
            title="Product Performance"
            config={{
              xAxis: 'category',
              yAxis: 'value',
              legend: true,
              showDataLabels: true,
            }}
            interactions={{
              zoom: true,
              tooltip: { enabled: true },
              legend: { enabled: true, interactive: true, position: 'bottom' },
            }}
          />
        )}

        {selectedChart === 'scatter' && (
          <ScatterPlot
            data={sampleScatterData}
            title="Correlation Analysis"
            config={{
              xAxis: 'x',
              yAxis: 'y',
              legend: true,
              trendLine: true,
            }}
            interactions={{
              zoom: true,
              tooltip: { enabled: true },
            }}
          />
        )}

        {selectedChart === 'pie' && (
          <PieChart
            data={samplePieData}
            title="Market Share Distribution"
            config={{
              nameKey: 'name',
              valueKey: 'value',
              legend: true,
              donutMode: false,
            }}
            interactions={{
              tooltip: { enabled: true },
              legend: { enabled: true, interactive: true, position: 'bottom' },
            }}
          />
        )}
      </div>

      {/* Feature Checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          Responsive Features Active
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={responsive.isMobile ? 'text-green-600' : 'text-gray-400'}>
              {responsive.isMobile ? '✓' : '○'}
            </span>
            <span>Simplified tooltips (mobile)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={responsive.interactions.legendCollapsible ? 'text-green-600' : 'text-gray-400'}>
              {responsive.interactions.legendCollapsible ? '✓' : '○'}
            </span>
            <span>Collapsible legends</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={responsive.interactions.controlsStacked ? 'text-green-600' : 'text-gray-400'}>
              {responsive.interactions.controlsStacked ? '✓' : '○'}
            </span>
            <span>Stacked controls (mobile)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Touch-friendly targets (44x44px)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Responsive font sizes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Adaptive spacing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={responsive.isMobile ? 'text-green-600' : 'text-gray-400'}>
              {responsive.isMobile ? '✓' : '○'}
            </span>
            <span>Touch gesture support</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Maintained aspect ratios</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Testing Instructions
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Resize your browser window to see responsive changes</li>
          <li>Try different chart types to see consistent behavior</li>
          <li>On mobile: Use pinch-to-zoom and swipe-to-pan gestures</li>
          <li>Click zoom controls to test touch-friendly buttons</li>
          <li>Hover over data points to see responsive tooltips</li>
          <li>Toggle legend items to test interactive features</li>
        </ul>
      </div>
    </div>
  );
}

export default ResponsiveChartDemo;
