# Chart Components

Professional-grade chart components with advanced features, statistical overlays, and performance optimizations.

## Overview

This directory contains all chart components for the DataStory application, including:

- **Basic Charts**: Line, Bar, Scatter, Pie
- **Advanced Charts**: Combination, Heatmap, BoxPlot, Waterfall, Funnel, Radar, Area, Candlestick
- **Comparative Charts**: SmallMultiples, BulletChart, DivergingBarChart, SparklineChart, KPICard
- **Statistical Overlays**: TrendLine, MovingAverage, Outliers, Annotations
- **Performance Components**: LazyChart, ChartSkeleton, OptimizedChartWrapper, VirtualizedChartList
- **Infrastructure**: BaseChart, ErrorBoundary, DataValidator, PerformanceMonitor

## Quick Start

### Basic Usage

```typescript
import { LineChart } from '@/components/charts';

<LineChart
  data={data}
  title="Sales Over Time"
  config={{
    xAxis: 'date',
    yAxis: 'sales',
    colors: ['#2563eb'],
  }}
/>
```

### With Performance Optimizations

```typescript
import { LazyChart, LineChart } from '@/components/charts';

<LazyChart
  chartType="line"
  data={largeDataset}
  enableSampling={true}
  enableLazyLoading={true}
  height={400}
>
  <LineChart
    data={largeDataset}
    title="Sales Over Time"
    config={{ xAxis: 'date', yAxis: 'sales' }}
  />
</LazyChart>
```

### With Statistical Overlays

```typescript
import { LineChart } from '@/components/charts';

<LineChart
  data={data}
  title="Sales Trend"
  config={{ xAxis: 'date', yAxis: 'sales' }}
  statistics={{
    trendLineData: {
      slope: 1.5,
      intercept: 100,
      rSquared: 0.85,
    },
    movingAverages: [
      { period: 7, values: [...] },
      { period: 30, values: [...] },
    ],
  }}
  interactions={{
    zoom: true,
    pan: true,
    tooltip: { enabled: true },
  }}
/>
```

## Chart Types

### Basic Charts

#### LineChart
Time-series and continuous data visualization.

**Features**:
- Smooth line interpolation
- Multiple series support
- Trend lines and moving averages
- Zoom and pan interactions
- Responsive design

#### BarChart
Categorical data comparison.

**Features**:
- Horizontal and vertical orientations
- Grouped and stacked modes
- Data labels
- Reference lines
- Responsive design

#### ScatterPlot
Correlation and distribution analysis.

**Features**:
- Bubble chart mode (size encoding)
- Trend lines with R² values
- Outlier highlighting
- Correlation display
- Zoom and pan

#### PieChart
Part-to-whole relationships.

**Features**:
- Donut mode
- Percentage labels
- Interactive legend
- Custom angles
- Responsive design

### Advanced Charts

#### CombinationChart
Multiple chart types on same axes.

**Features**:
- Line, bar, and area combinations
- Dual Y-axes
- Synchronized interactions
- Professional styling

#### Heatmap
Matrix visualization with color encoding.

**Features**:
- Sequential and diverging color scales
- Correlation matrix mode
- Interactive cells
- Axis labels

#### BoxPlot
Statistical distribution visualization.

**Features**:
- Quartiles and median
- Outlier detection
- Grouped comparisons
- Horizontal/vertical orientations

#### WaterfallChart
Cumulative effect visualization.

**Features**:
- Positive/negative coloring
- Connector lines
- Start/end totals
- Value labels

#### FunnelChart
Stage-based data visualization.

**Features**:
- Percentage calculations
- Conversion rates
- Custom colors per stage
- Interactive selection

#### RadarChart
Multi-dimensional comparison.

**Features**:
- Multiple series overlay
- Customizable axis ranges
- Grid circles
- Interactive legend

#### AreaChart
Filled line chart visualization.

**Features**:
- Stacked, percentage, and overlapping modes
- Gradient fills
- Smooth curves
- Statistical overlays

#### CandlestickChart
Financial time-series data.

**Features**:
- OHLC rendering
- Positive/negative coloring
- Volume bars
- Technical indicators

### Comparative Charts

#### SmallMultiples
Trellis/faceted charts.

**Features**:
- Any chart type as child
- Synchronized axes
- Grid layout
- Faceting by category

#### BulletChart
Target comparison visualization.

**Features**:
- Actual vs target
- Performance ranges
- Horizontal/vertical
- Value labels

#### DivergingBarChart
Baseline comparison.

**Features**:
- Positive/negative from baseline
- Color coding
- Sorting options
- Percentage labels

#### SparklineChart
Compact inline trends.

**Features**:
- Line and bar modes
- Min/max/last indicators
- Trend direction
- Table embedding

#### KPICard
Key performance indicator display.

**Features**:
- Large value display
- Trend indicator
- Color-coded status
- Mini sparkline

## Performance Optimizations

### Data Sampling

Automatically reduces dataset size for large datasets:

```typescript
import { adaptiveSample } from '@/lib/utils/performance';

const sampledData = adaptiveSample(data, 'scatter', 2000);
```

**Thresholds**:
- Line: 5,000 points
- Bar: 3,000 points
- Scatter: 2,000 points
- Area: 5,000 points

### Lazy Loading

Load charts only when visible:

```typescript
import { useLazyChart } from '@/lib/hooks/useLazyChart';

const { ref, shouldRender } = useLazyChart();

<div ref={ref}>
  {shouldRender ? <Chart /> : <ChartSkeleton />}
</div>
```

### Memoization

Cache expensive calculations:

```typescript
import { memoizedCalculation } from '@/lib/utils/performance';

const stats = memoizedCalculation(data, 'statistics', () => {
  return calculateStatistics(data);
});
```

### Debouncing

Reduce interaction handler frequency:

```typescript
import { debounce } from '@/lib/utils/performance';

const handleHover = debounce((point) => {
  updateTooltip(point);
}, 200);
```

### Virtualization

Render only visible charts:

```typescript
import { VirtualizedChartList } from '@/components/charts';

<VirtualizedChartList
  charts={manyCharts}
  itemHeight={400}
  gap={16}
  overscan={2}
/>
```

## Statistical Overlays

### Trend Lines

```typescript
statistics={{
  trendLineData: {
    slope: 1.5,
    intercept: 100,
    rSquared: 0.85,
    confidenceInterval: {
      upper: [...],
      lower: [...],
    },
  },
}}
```

### Moving Averages

```typescript
statistics={{
  movingAverages: [
    { period: 7, values: [...] },
    { period: 30, values: [...] },
    { period: 90, values: [...] },
  ],
}}
```

### Outliers

```typescript
statistics={{
  outlierData: {
    indices: [5, 12, 45],
    values: [1000, 2000, 3000],
    method: 'iqr',
  },
}}
```

### Annotations

```typescript
statistics={{
  annotations: [
    {
      type: 'text',
      position: { x: '2024-01-15', y: 1000 },
      content: 'Product Launch',
    },
  ],
  referenceLines: [
    {
      value: 500,
      label: 'Target',
      color: '#10b981',
    },
  ],
}}
```

## Interactions

### Zoom and Pan

```typescript
interactions={{
  zoom: true,
  pan: true,
}}
```

### Brush Selection

```typescript
interactions={{
  brush: true,
}}
```

### Enhanced Tooltips

```typescript
interactions={{
  tooltip: {
    enabled: true,
    showPercentage: true,
    showRank: true,
    showComparison: true,
  },
}}
```

### Interactive Legend

```typescript
interactions={{
  legend: {
    interactive: true,
    collapsible: true,
  },
}}
```

### Cross-Chart Highlighting

```typescript
import { CrossChartHighlightProvider } from '@/components/charts/interactions';

<CrossChartHighlightProvider>
  <Chart1 chartId="chart-1" />
  <Chart2 chartId="chart-2" />
</CrossChartHighlightProvider>
```

## Responsive Design

All charts are responsive by default:

- Mobile-optimized layouts (< 768px)
- Touch gesture support (pinch-to-zoom, swipe-to-pan)
- Adaptive font sizes and spacing
- Collapsible legends on small screens
- Minimum 44x44px touch targets

## Theming

Charts use the professional theme system:

```typescript
import { ChartThemeProvider } from '@/lib/theme';

<ChartThemeProvider theme="default">
  <Chart />
</ChartThemeProvider>
```

**Available themes**:
- `default` - Professional blue palette
- `colorblindSafe` - Accessible color palette
- `dark` - Dark mode optimized
- `light` - Light mode optimized

## Error Handling

All charts include error boundaries:

```typescript
import { ChartErrorBoundary } from '@/components/charts';

<ChartErrorBoundary fallback={<ErrorMessage />}>
  <Chart data={data} />
</ChartErrorBoundary>
```

## Testing

Charts include comprehensive test coverage:

```typescript
import { render, screen } from '@testing-library/react';
import { LineChart } from '@/components/charts';

test('renders line chart', () => {
  render(<LineChart data={mockData} title="Test" config={{}} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

## Documentation

- [Performance Guide](../../lib/utils/PERFORMANCE_GUIDE.md)
- [Performance Integration](./PERFORMANCE_INTEGRATION.md)
- [Responsive Design](./RESPONSIVE_DESIGN.md)
- [Statistical Overlays](./overlays/README.md)
- [Interactions](./interactions/README.md)

## Examples

See `PerformanceOptimizedStory.tsx` for a complete example demonstrating all features.

## Contributing

When adding new chart types:

1. Extend `BaseChart` for common functionality
2. Add TypeScript interfaces for props
3. Include error handling
4. Add responsive design support
5. Document usage and examples
6. Add tests
7. Update this README

## Performance Targets

- Initial render: < 500ms
- Interaction latency: < 100ms
- Frame rate: 60 FPS
- Memory: < 100MB per story
- Large datasets: Smooth up to 100K points (with sampling)
