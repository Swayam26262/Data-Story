'use client';

/**
 * Advanced Charts Examples
 * Demonstrates usage of all advanced chart types
 */

import React from 'react';
import {
  CombinationChart,
  Heatmap,
  BoxPlot,
  WaterfallChart,
  FunnelChart,
  RadarChart,
  AreaChart,
  CandlestickChart,
} from './index';

/**
 * Example: Combination Chart
 */
export function CombinationChartExample() {
  const data = [
    { month: 'Jan', revenue: 4000, profit: 2400, expenses: 1600 },
    { month: 'Feb', revenue: 3000, profit: 1398, expenses: 1602 },
    { month: 'Mar', revenue: 2000, profit: 9800, expenses: 2000 },
    { month: 'Apr', revenue: 2780, profit: 3908, expenses: 2780 },
    { month: 'May', revenue: 1890, profit: 4800, expenses: 1890 },
    { month: 'Jun', revenue: 2390, profit: 3800, expenses: 2390 },
  ];

  return (
    <CombinationChart
      data={data}
      title="Revenue, Profit & Expenses"
      series={[
        { type: 'bar', dataKey: 'revenue', name: 'Revenue', yAxisId: 'left' },
        { type: 'bar', dataKey: 'expenses', name: 'Expenses', yAxisId: 'left' },
        { type: 'line', dataKey: 'profit', name: 'Profit', yAxisId: 'right' },
      ]}
      config={{
        xAxis: 'month',
        leftYAxisLabel: 'Amount ($)',
        rightYAxisLabel: 'Profit ($)',
      }}
    />
  );
}

/**
 * Example: Heatmap
 */
export function HeatmapExample() {
  const data = [
    [0.8, 0.3, 0.5, 0.2],
    [0.3, 0.9, 0.4, 0.6],
    [0.5, 0.4, 0.7, 0.3],
    [0.2, 0.6, 0.3, 0.8],
  ];

  return (
    <Heatmap
      data={data}
      xLabels={['Feature A', 'Feature B', 'Feature C', 'Feature D']}
      yLabels={['Product 1', 'Product 2', 'Product 3', 'Product 4']}
      title="Feature Correlation Matrix"
      config={{
        colorScale: 'diverging',
        showValues: true,
      }}
    />
  );
}

/**
 * Example: Box Plot
 */
export function BoxPlotExample() {
  const data = [
    {
      group: 'Q1',
      min: 10,
      q1: 25,
      median: 40,
      q3: 55,
      max: 70,
      mean: 42,
      outliers: [5, 75],
    },
    {
      group: 'Q2',
      min: 15,
      q1: 30,
      median: 45,
      q3: 60,
      max: 75,
      mean: 47,
      outliers: [10],
    },
    {
      group: 'Q3',
      min: 20,
      q1: 35,
      median: 50,
      q3: 65,
      max: 80,
      mean: 52,
    },
  ];

  return (
    <BoxPlot
      data={data}
      title="Quarterly Sales Distribution"
      config={{
        showOutliers: true,
        showMean: true,
        orientation: 'vertical',
      }}
    />
  );
}

/**
 * Example: Waterfall Chart
 */
export function WaterfallChartExample() {
  const data = [
    { label: 'Starting Balance', value: 10000, isTotal: true },
    { label: 'Revenue', value: 5000 },
    { label: 'Cost of Goods', value: -2000 },
    { label: 'Operating Expenses', value: -1500 },
    { label: 'Marketing', value: -800 },
    { label: 'Ending Balance', value: 10700, isTotal: true },
  ];

  return (
    <WaterfallChart
      data={data}
      title="Financial Waterfall Analysis"
      config={{
        showConnectors: true,
        showValues: true,
      }}
    />
  );
}

/**
 * Example: Funnel Chart
 */
export function FunnelChartExample() {
  const data = [
    { name: 'Website Visits', value: 10000 },
    { name: 'Product Views', value: 5000 },
    { name: 'Add to Cart', value: 2000 },
    { name: 'Checkout', value: 1000 },
    { name: 'Purchase', value: 500 },
  ];

  return (
    <FunnelChart
      data={data}
      title="Sales Funnel Conversion"
      config={{
        showPercentages: true,
        showConversionRates: true,
      }}
    />
  );
}

/**
 * Example: Radar Chart
 */
export function RadarChartExample() {
  const data = [
    { dimension: 'Speed', product1: 80, product2: 60 },
    { dimension: 'Quality', product1: 90, product2: 85 },
    { dimension: 'Price', product1: 70, product2: 90 },
    { dimension: 'Support', product1: 85, product2: 75 },
    { dimension: 'Features', product1: 75, product2: 80 },
  ];

  return (
    <RadarChart
      data={data}
      dimensions={['Speed', 'Quality', 'Price', 'Support', 'Features']}
      series={[
        { name: 'Product 1', dataKey: 'product1' },
        { name: 'Product 2', dataKey: 'product2' },
      ]}
      title="Product Comparison"
      config={{
        angleKey: 'dimension',
      }}
    />
  );
}

/**
 * Example: Area Chart
 */
export function AreaChartExample() {
  const data = [
    { month: 'Jan', mobile: 400, desktop: 2400, tablet: 800 },
    { month: 'Feb', mobile: 300, desktop: 1398, tablet: 600 },
    { month: 'Mar', mobile: 200, desktop: 9800, tablet: 1200 },
    { month: 'Apr', mobile: 278, desktop: 3908, tablet: 900 },
    { month: 'May', mobile: 189, desktop: 4800, tablet: 1100 },
  ];

  return (
    <AreaChart
      data={data}
      series={[
        { dataKey: 'mobile', name: 'Mobile' },
        { dataKey: 'desktop', name: 'Desktop' },
        { dataKey: 'tablet', name: 'Tablet' },
      ]}
      title="Traffic by Device Type"
      config={{
        xAxis: 'month',
        stackMode: 'stacked',
        useGradient: true,
      }}
    />
  );
}

/**
 * Example: Candlestick Chart
 */
export function CandlestickChartExample() {
  const data = [
    { date: '2024-01', open: 100, high: 110, low: 95, close: 105, volume: 1000000 },
    { date: '2024-02', open: 105, high: 115, low: 100, close: 108, volume: 1200000 },
    { date: '2024-03', open: 108, high: 112, low: 102, close: 103, volume: 900000 },
    { date: '2024-04', open: 103, high: 120, low: 100, close: 118, volume: 1500000 },
    { date: '2024-05', open: 118, high: 125, low: 115, close: 122, volume: 1300000 },
  ];

  return (
    <CandlestickChart
      data={data}
      title="Stock Price Movement"
      config={{
        showVolume: true,
      }}
    />
  );
}

/**
 * All Examples Component
 */
export function AllAdvancedChartsExamples() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold mb-8">Advanced Charts Examples</h1>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Combination Chart</h2>
        <CombinationChartExample />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Heatmap</h2>
        <HeatmapExample />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Box Plot</h2>
        <BoxPlotExample />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Waterfall Chart</h2>
        <WaterfallChartExample />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Funnel Chart</h2>
        <FunnelChartExample />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Radar Chart</h2>
        <RadarChartExample />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Area Chart</h2>
        <AreaChartExample />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Candlestick Chart</h2>
        <CandlestickChartExample />
      </section>
    </div>
  );
}
