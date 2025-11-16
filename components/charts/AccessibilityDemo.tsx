/**
 * Accessibility Demo Component
 * Demonstrates all accessibility features in action
 */

'use client';

import { useState } from 'react';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import { meetsContrastRequirement, getContrastRatio } from '@/lib/utils/accessibility';

const sampleLineData = [
  { month: 'Jan', sales: 4000, target: 3500 },
  { month: 'Feb', sales: 3000, target: 3500 },
  { month: 'Mar', sales: 5000, target: 3500 },
  { month: 'Apr', sales: 4500, target: 3500 },
  { month: 'May', sales: 6000, target: 3500 },
  { month: 'Jun', sales: 5500, target: 3500 },
];

const sampleBarData = [
  { category: 'Product A', value: 4000 },
  { category: 'Product B', value: 3000 },
  { category: 'Product C', value: 5000 },
  { category: 'Product D', value: 2000 },
];

const samplePieData = [
  { name: 'Desktop', value: 400 },
  { name: 'Mobile', value: 300 },
  { name: 'Tablet', value: 200 },
  { name: 'Other', value: 100 },
];

export default function AccessibilityDemo() {
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Chart Accessibility Demo</h1>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-between w-full text-left font-semibold text-blue-900"
            aria-expanded={showInstructions}
          >
            <span>Accessibility Features & Testing Instructions</span>
            <span>{showInstructions ? '−' : '+'}</span>
          </button>
          
          {showInstructions && (
            <div className="mt-4 space-y-4 text-sm text-blue-900">
              <div>
                <h3 className="font-semibold mb-2">Keyboard Navigation</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><kbd className="px-2 py-1 bg-white rounded border">Tab</kbd> - Focus chart</li>
                  <li><kbd className="px-2 py-1 bg-white rounded border">Arrow Keys</kbd> - Navigate data points</li>
                  <li><kbd className="px-2 py-1 bg-white rounded border">Home</kbd> / <kbd className="px-2 py-1 bg-white rounded border">End</kbd> - First/Last point</li>
                  <li><kbd className="px-2 py-1 bg-white rounded border">Enter</kbd> / <kbd className="px-2 py-1 bg-white rounded border">Space</kbd> - Select point</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Screen Reader Testing</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Windows:</strong> NVDA (free) or JAWS</li>
                  <li><strong>macOS:</strong> VoiceOver (Cmd + F5)</li>
                  <li><strong>Mobile:</strong> TalkBack (Android) or VoiceOver (iOS)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Features Implemented</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>ARIA labels and roles on all chart elements</li>
                  <li>Full keyboard navigation support</li>
                  <li>Visible focus indicators (blue outline)</li>
                  <li>WCAG AA color contrast (4.5:1 minimum)</li>
                  <li>Screen reader announcements for interactions</li>
                  <li>Hidden data tables for screen readers</li>
                  <li>Skip links for navigation</li>
                  <li>Text summaries of chart data</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Color Contrast Validation</h3>
                <ColorContrastChecker />
              </div>
            </div>
          )}
        </div>

        {/* Demo Charts */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Line Chart with Keyboard Navigation</h2>
            <p className="text-gray-600 mb-4">
              Tab to focus the chart, then use arrow keys to navigate between data points.
              Press Enter to select a point.
            </p>
            <div className="h-96 border rounded-lg p-4 bg-white">
              <LineChart
                data={sampleLineData}
                title="Monthly Sales Trend"
                config={{
                  xAxis: 'month',
                  yAxis: 'sales',
                  legend: true,
                }}
                interactions={{
                  zoom: true,
                  pan: true,
                  brush: false,
                  crosshair: true,
                  tooltip: { enabled: true },
                  legend: { interactive: true },
                }}
                chartId="demo-line-chart"
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Bar Chart with Focus Indicators</h2>
            <p className="text-gray-600 mb-4">
              Notice the blue focus ring when navigating with keyboard.
            </p>
            <div className="h-96 border rounded-lg p-4 bg-white">
              <BarChart
                data={sampleBarData}
                title="Product Sales Comparison"
                config={{
                  xAxis: 'category',
                  yAxis: 'value',
                  legend: true,
                }}
                interactions={{
                  zoom: false,
                  pan: false,
                  brush: false,
                  crosshair: true,
                  tooltip: { enabled: true },
                  legend: { interactive: false },
                }}
                chartId="demo-bar-chart"
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Pie Chart with Screen Reader Support</h2>
            <p className="text-gray-600 mb-4">
              Use a screen reader to hear the chart description and data summary.
            </p>
            <div className="h-96 border rounded-lg p-4 bg-white">
              <PieChart
                data={samplePieData}
                title="Traffic by Device Type"
                config={{
                  nameKey: 'name',
                  valueKey: 'value',
                  legend: true,
                }}
                interactions={{
                  tooltip: { enabled: true },
                  legend: { interactive: true },
                }}
                chartId="demo-pie-chart"
              />
            </div>
          </section>
        </div>

        {/* Testing Checklist */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Accessibility Testing Checklist</h2>
          <AccessibilityChecklist />
        </div>
      </div>
    </div>
  );
}

function ColorContrastChecker() {
  const [foreground, setForeground] = useState('#2563eb');
  const [background, setBackground] = useState('#ffffff');

  const ratio = getContrastRatio(foreground, background);
  const meetsAA = meetsContrastRequirement(foreground, background, 'AA');
  const meetsAAA = meetsContrastRequirement(foreground, background, 'AAA');

  return (
    <div className="mt-2 p-3 bg-white rounded border">
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-xs font-medium mb-1">Foreground</label>
          <input
            type="color"
            value={foreground}
            onChange={(e) => setForeground(e.target.value)}
            className="w-full h-8 rounded border"
          />
          <input
            type="text"
            value={foreground}
            onChange={(e) => setForeground(e.target.value)}
            className="w-full mt-1 px-2 py-1 text-xs border rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Background</label>
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="w-full h-8 rounded border"
          />
          <input
            type="text"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="w-full mt-1 px-2 py-1 text-xs border rounded"
          />
        </div>
      </div>
      
      <div
        className="p-3 rounded mb-3"
        style={{ backgroundColor: background, color: foreground }}
      >
        Sample Text
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Contrast Ratio:</span>
          <span className="font-semibold">{ratio.toFixed(2)}:1</span>
        </div>
        <div className="flex justify-between">
          <span>WCAG AA (4.5:1):</span>
          <span className={meetsAA ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {meetsAA ? '✓ Pass' : '✗ Fail'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>WCAG AAA (7:1):</span>
          <span className={meetsAAA ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {meetsAAA ? '✓ Pass' : '✗ Fail'}
          </span>
        </div>
      </div>
    </div>
  );
}

function AccessibilityChecklist() {
  const items = [
    'All charts have descriptive titles',
    'ARIA labels are present and accurate',
    'Keyboard navigation works (Tab, Arrow keys, Enter)',
    'Focus indicators are visible (blue outline)',
    'Screen readers announce chart information',
    'Data tables available for screen readers',
    'Color contrast meets WCAG AA (4.5:1)',
    'Skip links are functional',
    'Charts work at 200% zoom',
    'No keyboard traps',
    'Touch targets are 44x44px minimum',
    'Interactive elements are keyboard accessible',
  ];

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className="text-green-600 mr-2">✓</span>
          <span className="text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}
