/**
 * Example component demonstrating all performance optimizations
 * This shows how to use lazy loading, sampling, memoization, and virtualization together
 */

import React, { memo, useMemo } from 'react';
import { LazyChart } from './LazyChart';
import { VirtualizedChartList } from './VirtualizedChartList';
import { OptimizedChartWrapper } from './OptimizedChartWrapper';
import { LineChart, BarChart, ScatterPlot } from './index';
import { adaptiveSample, debounce } from '@/lib/utils/performance';
import type { ChartDataPoint } from '@/lib/models/Story';

interface Chart {
  chartId: string;
  type: 'line' | 'bar' | 'scatter';
  title: string;
  data: ChartDataPoint[];
  config: any;
}

interface PerformanceOptimizedStoryProps {
  charts: Chart[];
  enableVirtualization?: boolean;
  enableLazyLoading?: boolean;
  enableSampling?: boolean;
}

/**
 * Individual chart component with all optimizations
 */
const OptimizedChart = memo(function OptimizedChart({
  chart,
  enableLazyLoading = true,
  enableSampling = true,
}: {
  chart: Chart;
  enableLazyLoading?: boolean;
  enableSampling?: boolean;
}) {
  // Sample data if needed
  const processedData = useMemo(() => {
    if (!enableSampling) return chart.data;
    return adaptiveSample(chart.data, chart.type);
  }, [chart.data, chart.type, enableSampling]);

  // Debounced interaction handlers
  const handleDataPointClick = useMemo(
    () =>
      debounce((point: ChartDataPoint) => {
        console.log('Data point clicked:', point);
      }, 200),
    []
  );

  const handleZoom = useMemo(
    () =>
      debounce((range: { start: number; end: number }) => {
        console.log('Zoom changed:', range);
      }, 300),
    []
  );

  // Render appropriate chart type
  const renderChart = () => {
    const chartProps = {
      data: processedData,
      title: chart.title,
      config: chart.config,
      chartId: chart.chartId,
    };

    switch (chart.type) {
      case 'line':
        return <LineChart {...chartProps} />;
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'scatter':
        return <ScatterPlot {...chartProps} />;
      default:
        return null;
    }
  };

  // Wrap with optimized wrapper
  const optimizedChart = (
    <OptimizedChartWrapper
      data={processedData}
      config={chart.config}
      chartId={chart.chartId}
      enableMemoization={true}
      debounceDelay={200}
      onDataPointClick={handleDataPointClick}
      onZoom={handleZoom}
    >
      {renderChart()}
    </OptimizedChartWrapper>
  );

  // Wrap with lazy loading if enabled
  if (enableLazyLoading) {
    return (
      <LazyChart
        chartType={chart.type}
        data={processedData}
        enableSampling={false} // Already sampled above
        enableLazyLoading={true}
        height={400}
        chartId={chart.chartId}
      >
        {optimizedChart}
      </LazyChart>
    );
  }

  return optimizedChart;
});

/**
 * Story viewer with performance optimizations
 */
export const PerformanceOptimizedStory = memo(
  function PerformanceOptimizedStory({
    charts,
    enableVirtualization = true,
    enableLazyLoading = true,
    enableSampling = true,
  }: PerformanceOptimizedStoryProps) {
    // Memoize chart components
    const chartComponents = useMemo(
      () =>
        charts.map((chart) => (
          <div
            key={chart.chartId}
            className="bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-6"
          >
            <OptimizedChart
              chart={chart}
              enableLazyLoading={enableLazyLoading}
              enableSampling={enableSampling}
            />
          </div>
        )),
      [charts, enableLazyLoading, enableSampling]
    );

    // Use virtualization for many charts
    if (enableVirtualization && charts.length > 5) {
      return (
        <VirtualizedChartList
          charts={chartComponents}
          itemHeight={450}
          gap={24}
          overscan={2}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        />
      );
    }

    // Regular rendering for few charts
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {chartComponents}
      </div>
    );
  }
);

/**
 * Example usage with performance monitoring
 */
export function PerformanceOptimizedStoryExample() {
  // Generate sample data
  const charts: Chart[] = useMemo(
    () => [
      {
        chartId: 'chart-1',
        type: 'line',
        title: 'Sales Over Time',
        data: Array.from({ length: 10000 }, (_, i) => ({
          date: new Date(2024, 0, i).toISOString(),
          value: Math.random() * 1000,
        })),
        config: { xAxis: 'date', yAxis: 'value' },
      },
      {
        chartId: 'chart-2',
        type: 'bar',
        title: 'Revenue by Category',
        data: Array.from({ length: 5000 }, (_, i) => ({
          category: `Category ${i % 10}`,
          revenue: Math.random() * 5000,
        })),
        config: { xAxis: 'category', yAxis: 'revenue' },
      },
      {
        chartId: 'chart-3',
        type: 'scatter',
        title: 'Price vs Quantity',
        data: Array.from({ length: 3000 }, (_, i) => ({
          price: Math.random() * 100,
          quantity: Math.random() * 1000,
        })),
        config: { xAxis: 'price', yAxis: 'quantity' },
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Performance Optimized Story
        </h1>
        <div className="text-gray-400 space-y-2">
          <p>✅ Lazy loading enabled - Charts load as you scroll</p>
          <p>✅ Data sampling enabled - Large datasets automatically sampled</p>
          <p>✅ Memoization enabled - Calculations cached</p>
          <p>✅ Debouncing enabled - Interactions optimized (200ms)</p>
          <p>✅ Virtualization enabled - Only visible charts rendered</p>
        </div>
      </div>

      <PerformanceOptimizedStory
        charts={charts}
        enableVirtualization={true}
        enableLazyLoading={true}
        enableSampling={true}
      />
    </div>
  );
}

export default PerformanceOptimizedStory;
