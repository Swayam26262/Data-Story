# Performance Optimization Guide

This guide covers all performance optimizations implemented for chart rendering in DataStory.

## Overview

The performance optimization system includes:

1. **Data Sampling** - Reduces dataset size for large datasets
2. **Lazy Loading** - Loads charts only when visible in viewport
3. **Memoization** - Caches expensive calculations
4. **Debouncing** - Reduces frequency of interaction handlers
5. **React Optimization** - Uses React.memo and useMemo
6. **Virtualization** - Renders only visible charts in lists
7. **Canvas Rendering** - Uses canvas for dense scatter plots
8. **Skeleton Loaders** - Shows loading states

## Data Sampling

### Adaptive Sampling

Automatically samples data based on chart type and data size:

```typescript
import { adaptiveSample } from '@/lib/utils/performance';

// Automatically samples if data exceeds thresholds
const sampledData = adaptiveSample(data, 'scatter', 2000);
```

**Thresholds by Chart Type**:
- Line charts: 5,000 points
- Bar charts: 3,000 points
- Scatter plots: 2,000 points
- Area charts: 5,000 points

### Manual Sampling

```typescript
import { sampleData } from '@/lib/utils/performance';

// Sample to specific number of points
const sampledData = sampleData(data, 1000);
```

## Lazy Loading

### Using useLazyChart Hook

```typescript
import { useLazyChart } from '@/lib/hooks/useLazyChart';
import { ChartSkeleton } from '@/components/charts/ChartSkeleton';

function MyChart() {
  const { ref, shouldRender, isInView } = useLazyChart({
    rootMargin: '200px',  // Load 200px before entering viewport
    threshold: 0.1,       // Trigger when 10% visible
  });

  return (
    <div ref={ref}>
      {shouldRender ? (
        <LineChart data={data} />
      ) : (
        <ChartSkeleton type="line" height={300} />
      )}
    </div>
  );
}
```

### Using LazyChart Component

```typescript
import { LazyChart } from '@/components/charts/LazyChart';
import { LineChart } from '@/components/charts';

function MyChart() {
  return (
    <LazyChart
      chartType="line"
      data={data}
      enableSampling={true}
      enableLazyLoading={true}
      height={300}
    >
      <LineChart data={data} title="My Chart" config={config} />
    </LazyChart>
  );
}
```

## Memoization

### Statistical Calculations

```typescript
import { memoizedCalculation } from '@/lib/utils/performance';

const statistics = memoizedCalculation(
  data,
  'mean-calculation',
  () => {
    // Expensive calculation
    return calculateMean(data);
  }
);
```

### React Memoization

```typescript
import { memo, useMemo } from 'react';

const MyChart = memo(function MyChart({ data, config }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return processData(data);
  }, [data]);

  const statistics = useMemo(() => {
    return calculateStatistics(processedData);
  }, [processedData]);

  return <Chart data={processedData} stats={statistics} />;
});
```

## Debouncing and Throttling

### Debouncing Interactions

```typescript
import { debounce } from '@/lib/utils/performance';

// Debounce hover events (200ms default)
const handleHover = debounce((point) => {
  updateTooltip(point);
}, 200);

// Debounce zoom events
const handleZoom = debounce((range) => {
  updateZoomRange(range);
}, 300);
```

### Throttling High-Frequency Events

```typescript
import { throttle } from '@/lib/utils/performance';

// Throttle scroll events (150ms default)
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 150);
```

## Optimized Chart Wrapper

Use the OptimizedChartWrapper for automatic optimization:

```typescript
import { OptimizedChartWrapper } from '@/components/charts/OptimizedChartWrapper';

function MyChart() {
  return (
    <OptimizedChartWrapper
      data={data}
      config={config}
      chartId="my-chart"
      enableMemoization={true}
      debounceDelay={200}
      onDataPointClick={handleClick}
      onZoom={handleZoom}
    >
      <LineChart />
    </OptimizedChartWrapper>
  );
}
```

## Virtualization

### Virtualized List

For rendering many charts in a list:

```typescript
import { VirtualizedChartList } from '@/components/charts/VirtualizedChartList';

function ChartList({ charts }) {
  return (
    <VirtualizedChartList
      charts={charts.map(chart => <Chart key={chart.id} {...chart} />)}
      itemHeight={400}
      gap={16}
      overscan={2}
    />
  );
}
```

### Virtualized Grid

For rendering charts in a grid layout:

```typescript
import { VirtualizedChartGrid } from '@/components/charts/VirtualizedChartList';

function ChartGrid({ charts }) {
  return (
    <VirtualizedChartGrid
      charts={charts.map(chart => <Chart key={chart.id} {...chart} />)}
      columns={2}
      itemHeight={400}
      gap={16}
      overscan={1}
    />
  );
}
```

## Canvas Rendering

For dense scatter plots (>2000 points), consider using canvas rendering:

```typescript
import { shouldUseCanvas } from '@/lib/utils/performance';

function ScatterPlot({ data }) {
  const useCanvas = shouldUseCanvas(data.length, 'scatter');

  if (useCanvas) {
    return <CanvasScatterPlot data={data} />;
  }

  return <SVGScatterPlot data={data} />;
}
```

## Skeleton Loaders

Show loading states while charts load:

```typescript
import { ChartSkeleton } from '@/components/charts/ChartSkeleton';

function MyChart({ isLoading }) {
  if (isLoading) {
    return (
      <ChartSkeleton
        type="line"
        height={300}
        showTitle={true}
        showLegend={true}
      />
    );
  }

  return <LineChart />;
}
```

## Performance Monitoring

Track chart rendering performance:

```typescript
import { performanceMonitor } from '@/lib/utils/performance';

function MyChart() {
  useEffect(() => {
    const stopMonitoring = performanceMonitor.start('chart-render');
    
    return () => {
      stopMonitoring();
      
      // Get average render time
      const avg = performanceMonitor.getAverage('chart-render');
      console.log(`Average render time: ${avg}ms`);
    };
  }, []);

  return <Chart />;
}

// Get full performance report
const report = performanceMonitor.getReport();
console.log(report);
```

## Best Practices

### 1. Always Use Lazy Loading for Below-the-Fold Charts

```typescript
// ✅ Good - Lazy load charts not immediately visible
<LazyChart chartType="line" enableLazyLoading={true}>
  <LineChart data={data} />
</LazyChart>

// ❌ Bad - Render all charts immediately
<LineChart data={data} />
```

### 2. Sample Large Datasets

```typescript
// ✅ Good - Sample large datasets
const displayData = adaptiveSample(data, 'scatter');

// ❌ Bad - Render all 10,000 points
<ScatterPlot data={largeDataset} />
```

### 3. Memoize Expensive Calculations

```typescript
// ✅ Good - Memoize calculations
const statistics = useMemo(() => calculateStats(data), [data]);

// ❌ Bad - Recalculate on every render
const statistics = calculateStats(data);
```

### 4. Debounce Interaction Handlers

```typescript
// ✅ Good - Debounce hover events
const handleHover = useMemo(
  () => debounce(updateTooltip, 200),
  []
);

// ❌ Bad - Update on every mouse move
const handleHover = (point) => updateTooltip(point);
```

### 5. Use React.memo for Chart Components

```typescript
// ✅ Good - Prevent unnecessary re-renders
const LineChart = memo(function LineChart({ data, config }) {
  return <Chart />;
});

// ❌ Bad - Re-render on every parent update
function LineChart({ data, config }) {
  return <Chart />;
}
```

### 6. Virtualize Long Lists

```typescript
// ✅ Good - Virtualize list of charts
<VirtualizedChartList charts={manyCharts} itemHeight={400} />

// ❌ Bad - Render all charts at once
{manyCharts.map(chart => <Chart key={chart.id} {...chart} />)}
```

## Performance Targets

- **Initial Render**: < 500ms for typical datasets
- **Interaction Latency**: < 100ms for hover, < 50ms for click
- **Frame Rate**: 60 FPS during pan/zoom
- **Memory Usage**: < 100MB for typical story with 5-10 charts
- **Large Dataset Handling**: Smooth rendering up to 100K points (with sampling)

## Troubleshooting

### Slow Chart Rendering

1. Check data size - sample if > 5000 points
2. Enable lazy loading for below-the-fold charts
3. Use React.memo to prevent unnecessary re-renders
4. Check for expensive calculations in render

### Laggy Interactions

1. Add debouncing to hover handlers (200ms)
2. Add throttling to scroll handlers (150ms)
3. Use requestAnimationFrame for animations
4. Reduce number of DOM elements

### High Memory Usage

1. Enable virtualization for chart lists
2. Unload charts when they leave viewport
3. Clear statistics cache periodically
4. Sample large datasets more aggressively

## Related Documentation

- [Lazy Loading Hook](../hooks/README.md#useLazyChart)
- [Chart Components](../../components/charts/README.md)
- [Responsive Design](../../components/charts/RESPONSIVE_DESIGN.md)
