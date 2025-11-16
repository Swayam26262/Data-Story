# Performance Optimization Integration Guide

This guide shows how to integrate performance optimizations into existing components.

## Integrating with StoryViewer

### Step 1: Add Lazy Loading to Charts

```typescript
// Before
<div className="bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-6">
  {renderChart(chart)}
</div>

// After
import { LazyChart } from '@/components/charts/LazyChart';

<LazyChart
  chartType={chart.type}
  data={chart.data}
  enableSampling={true}
  enableLazyLoading={true}
  height={400}
  chartId={chart.chartId}
>
  <div className="bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-6">
    {renderChart(chart)}
  </div>
</LazyChart>
```

### Step 2: Add Virtualization for Many Charts

```typescript
// Before
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {charts.map((chart) => (
    <div key={chart.chartId}>
      {renderChart(chart)}
    </div>
  ))}
</div>

// After
import { VirtualizedChartGrid } from '@/components/charts/VirtualizedChartList';

{charts.length > 6 ? (
  <VirtualizedChartGrid
    charts={charts.map((chart) => (
      <div key={chart.chartId}>
        {renderChart(chart)}
      </div>
    ))}
    columns={2}
    itemHeight={450}
    gap={32}
    overscan={1}
  />
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {charts.map((chart) => (
      <div key={chart.chartId}>
        {renderChart(chart)}
      </div>
    ))}
  </div>
)}
```

### Step 3: Optimize Chart Rendering with Memoization

```typescript
// Before
const renderChart = (chart: Chart) => {
  switch (chart.type) {
    case 'line':
      return <LineChart data={chart.data} title={chart.title} config={chart.config} />;
    // ...
  }
};

// After
import { memo, useMemo } from 'react';
import { adaptiveSample } from '@/lib/utils/performance';

const OptimizedChartRenderer = memo(function OptimizedChartRenderer({ chart }: { chart: Chart }) {
  // Sample data if needed
  const processedData = useMemo(() => {
    return adaptiveSample(chart.data, chart.type);
  }, [chart.data, chart.type]);

  // Memoize chart component
  const chartComponent = useMemo(() => {
    switch (chart.type) {
      case 'line':
        return <LineChart data={processedData} title={chart.title} config={chart.config} />;
      case 'bar':
        return <BarChart data={processedData} title={chart.title} config={chart.config} />;
      // ...
    }
  }, [chart.type, processedData, chart.title, chart.config]);

  return chartComponent;
});

const renderChart = (chart: Chart) => {
  return <OptimizedChartRenderer chart={chart} />;
};
```

### Step 4: Add Debouncing to Aggregation Controls

```typescript
// Before
<AggregationControls
  aggregationLevel={aggregationLevel}
  comparisonType={comparisonType}
  onAggregationChange={setAggregationLevel}
  onComparisonChange={setComparisonType}
/>

// After
import { debounce } from '@/lib/utils/performance';

const debouncedAggregationChange = useMemo(
  () => debounce(setAggregationLevel, 300),
  []
);

const debouncedComparisonChange = useMemo(
  () => debounce(setComparisonType, 300),
  []
);

<AggregationControls
  aggregationLevel={aggregationLevel}
  comparisonType={comparisonType}
  onAggregationChange={debouncedAggregationChange}
  onComparisonChange={debouncedComparisonChange}
/>
```

### Step 5: Add Performance Monitoring

```typescript
import { performanceMonitor } from '@/lib/utils/performance';

export default function StoryViewer({ narratives, charts, userTier, storyTitle, storyId }: StoryViewerProps) {
  // Monitor story render performance
  useEffect(() => {
    const stopMonitoring = performanceMonitor.start(`story-${storyId}-render`);
    return stopMonitoring;
  }, [storyId]);

  // Log performance report on unmount
  useEffect(() => {
    return () => {
      const report = performanceMonitor.getReport();
      console.log('Performance Report:', report);
    };
  }, []);

  // ... rest of component
}
```

## Complete Optimized StoryViewer Example

```typescript
'use client';

import { useEffect, useRef, useState, memo, useMemo } from 'react';
import { LazyChart } from '@/components/charts/LazyChart';
import { VirtualizedChartGrid } from '@/components/charts/VirtualizedChartList';
import { adaptiveSample, debounce, performanceMonitor } from '@/lib/utils/performance';
import { LineChart, BarChart, ScatterPlot, PieChart } from './charts';
import AggregatedChart from './charts/AggregatedChart';
import AggregationControls from './AggregationControls';
import type { AggregationLevel, ComparisonType } from '@/lib/aggregation';

// Memoized chart renderer
const OptimizedChartRenderer = memo(function OptimizedChartRenderer({ 
  chart,
  aggregationLevel,
  comparisonType,
}: { 
  chart: Chart;
  aggregationLevel: AggregationLevel;
  comparisonType: ComparisonType;
}) {
  // Sample data
  const processedData = useMemo(() => {
    return adaptiveSample(chart.data, chart.type);
  }, [chart.data, chart.type]);

  // Render chart with aggregation if applicable
  const chartComponent = useMemo(() => {
    if (chart.type === 'line' || chart.type === 'bar') {
      return (
        <AggregatedChart
          chartId={chart.chartId}
          type={chart.type}
          title={chart.title}
          data={processedData}
          config={chart.config}
        />
      );
    }

    switch (chart.type) {
      case 'scatter':
        return <ScatterPlot data={processedData} title={chart.title} config={chart.config} />;
      case 'pie':
        return <PieChart data={processedData} title={chart.title} config={chart.config} />;
      default:
        return null;
    }
  }, [chart, processedData]);

  return (
    <LazyChart
      chartType={chart.type}
      data={processedData}
      enableSampling={false} // Already sampled
      enableLazyLoading={true}
      height={400}
      chartId={chart.chartId}
    >
      {chartComponent}
    </LazyChart>
  );
});

export default function StoryViewer({
  narratives,
  charts,
  userTier,
  storyTitle,
  storyId,
}: StoryViewerProps) {
  const [aggregationLevel, setAggregationLevel] = useState<AggregationLevel>('daily');
  const [comparisonType, setComparisonType] = useState<ComparisonType>('none');

  // Performance monitoring
  useEffect(() => {
    const stopMonitoring = performanceMonitor.start(`story-${storyId}-render`);
    return stopMonitoring;
  }, [storyId]);

  // Debounced handlers
  const debouncedAggregationChange = useMemo(
    () => debounce(setAggregationLevel, 300),
    []
  );

  const debouncedComparisonChange = useMemo(
    () => debounce(setComparisonType, 300),
    []
  );

  // Memoize chart components
  const chartComponents = useMemo(
    () =>
      charts.map((chart) => (
        <div
          key={chart.chartId}
          className="bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-6"
        >
          <OptimizedChartRenderer
            chart={chart}
            aggregationLevel={aggregationLevel}
            comparisonType={comparisonType}
          />
        </div>
      )),
    [charts, aggregationLevel, comparisonType]
  );

  return (
    <div className="relative min-h-screen bg-background-dark">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">{storyTitle || 'Data Story'}</h1>
        </div>
      </div>

      {/* Aggregation Controls */}
      <div className="bg-background-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AggregationControls
            aggregationLevel={aggregationLevel}
            comparisonType={comparisonType}
            onAggregationChange={debouncedAggregationChange}
            onComparisonChange={debouncedComparisonChange}
          />
        </div>
      </div>

      {/* Charts - Use virtualization for many charts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {charts.length > 6 ? (
          <VirtualizedChartGrid
            charts={chartComponents}
            columns={2}
            itemHeight={450}
            gap={32}
            overscan={1}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {chartComponents}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Performance Checklist

When integrating optimizations, ensure:

- [ ] Lazy loading enabled for below-the-fold charts
- [ ] Data sampling applied to large datasets (>5000 points)
- [ ] Memoization used for expensive calculations
- [ ] Debouncing applied to interaction handlers (200-300ms)
- [ ] React.memo used for chart components
- [ ] Virtualization enabled for lists with >6 charts
- [ ] Skeleton loaders shown during loading
- [ ] Performance monitoring added for key operations

## Measuring Impact

Use the performance monitor to measure improvements:

```typescript
// Before optimization
const report1 = performanceMonitor.getReport();

// Apply optimizations

// After optimization
const report2 = performanceMonitor.getReport();

// Compare
console.log('Improvement:', {
  before: report1['chart-render']?.avg,
  after: report2['chart-render']?.avg,
  improvement: ((report1['chart-render']?.avg - report2['chart-render']?.avg) / report1['chart-render']?.avg * 100).toFixed(1) + '%'
});
```

## Common Pitfalls

1. **Over-sampling**: Don't sample data that's already small
2. **Over-debouncing**: Don't debounce click events (only hover/zoom)
3. **Over-memoization**: Don't memoize simple calculations
4. **Premature optimization**: Profile first, optimize second

## Next Steps

1. Apply optimizations to StoryViewer
2. Test with real user data
3. Monitor performance in production
4. Iterate based on metrics
