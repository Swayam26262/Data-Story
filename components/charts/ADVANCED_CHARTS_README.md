# Advanced Chart Components

This directory contains professional-grade advanced chart components for data visualization.

## Implemented Chart Types

### 1. CombinationChart
**File:** `CombinationChart.tsx`

Supports multiple series with different chart types (line, bar, area) on the same axes with dual Y-axis support.

**Features:**
- Multiple series with different visualization types
- Dual Y-axis for different scales
- Synchronized interactions across all series
- Professional styling and theme integration

**Usage:**
```tsx
<CombinationChart
  data={data}
  title="Revenue & Profit Analysis"
  series={[
    { type: 'bar', dataKey: 'revenue', yAxisId: 'left' },
    { type: 'line', dataKey: 'profit', yAxisId: 'right' },
  ]}
/>
```

### 2. Heatmap
**File:** `Heatmap.tsx`

Color-coded matrix visualization with interactive cells, perfect for correlation matrices.

**Features:**
- Sequential and diverging color scales
- Interactive cell hover and selection
- Correlation matrix visualization mode
- Axis labels and grid lines
- Custom color scales

**Usage:**
```tsx
<Heatmap
  data={matrixData}
  xLabels={['A', 'B', 'C']}
  yLabels={['X', 'Y', 'Z']}
  title="Correlation Matrix"
  config={{ colorScale: 'diverging' }}
/>
```

### 3. BoxPlot
**File:** `BoxPlot.tsx`

Statistical distribution visualization showing quartiles, median, whiskers, and outliers.

**Features:**
- Quartiles (Q1, Q2, Q3) and median display
- Outlier rendering as individual points
- Grouped comparisons (side-by-side)
- Horizontal and vertical orientations
- Statistical annotations (mean, median values)

**Usage:**
```tsx
<BoxPlot
  data={distributionData}
  title="Sales Distribution"
  config={{
    orientation: 'vertical',
    showOutliers: true,
    showMean: true,
  }}
/>
```

### 4. WaterfallChart
**File:** `WaterfallChart.tsx`

Shows cumulative effects of sequential positive and negative values.

**Features:**
- Positive/negative value coloring
- Connector lines between bars
- Start and end total markers
- Value labels on each bar
- Financial analysis visualization

**Usage:**
```tsx
<WaterfallChart
  data={financialData}
  title="Financial Waterfall"
  config={{
    showConnectors: true,
    showValues: true,
  }}
/>
```

### 5. FunnelChart
**File:** `FunnelChart.tsx`

Visualizes progressive reduction of data through stages with conversion rates.

**Features:**
- Percentage calculations and display
- Conversion rate annotations between stages
- Custom colors per stage
- Interactive stage selection
- Overall conversion summary

**Usage:**
```tsx
<FunnelChart
  data={conversionData}
  title="Sales Funnel"
  config={{
    showPercentages: true,
    showConversionRates: true,
  }}
/>
```

### 6. RadarChart
**File:** `RadarChart.tsx`

Multi-dimensional comparison with spider/radar visualization.

**Features:**
- Multiple series overlay
- Customizable axis ranges and labels
- Grid circles and radial axes
- Interactive legend for series toggling
- Multi-dimensional analysis

**Usage:**
```tsx
<RadarChart
  data={comparisonData}
  dimensions={['Speed', 'Quality', 'Price']}
  series={[
    { name: 'Product A', dataKey: 'productA' },
    { name: 'Product B', dataKey: 'productB' },
  ]}
  title="Product Comparison"
/>
```

### 7. AreaChart
**File:** `AreaChart.tsx`

Area chart with fill under line, supporting multiple stacking modes.

**Features:**
- Stacked, percentage, and overlapping modes
- Gradient fills for visual appeal
- Smooth curve interpolation
- Multiple series support
- Professional theme integration

**Usage:**
```tsx
<AreaChart
  data={timeSeriesData}
  series={[
    { dataKey: 'mobile', name: 'Mobile' },
    { dataKey: 'desktop', name: 'Desktop' },
  ]}
  title="Traffic by Device"
  config={{
    stackMode: 'stacked',
    useGradient: true,
  }}
/>
```

### 8. CandlestickChart
**File:** `CandlestickChart.tsx`

Financial time-series visualization with OHLC (Open, High, Low, Close) data.

**Features:**
- OHLC rendering with wicks and bodies
- Color coding for bullish/bearish movements
- Volume bars as secondary chart
- Interactive hover tooltips
- Financial data analysis

**Usage:**
```tsx
<CandlestickChart
  data={stockData}
  title="Stock Price Movement"
  config={{
    showVolume: true,
  }}
/>
```

## Common Features

All advanced chart components include:

- **Error Boundaries**: Graceful error handling with fallback UI
- **Professional Theme**: Consistent styling using the theme system
- **Responsive Design**: Adapts to different screen sizes
- **Interactive Features**: Hover effects, click handlers, tooltips
- **TypeScript Support**: Full type definitions for all props
- **Accessibility**: ARIA labels and keyboard navigation support

## Theme Integration

All charts use the professional theme system from `lib/theme`:

- Color palettes (categorical, sequential, diverging)
- Typography configuration
- Spacing and layout tokens
- Animation settings
- Shadow and border styles

## Examples

See `AdvancedChartsExamples.tsx` for complete working examples of all chart types.

## Requirements Fulfilled

This implementation fulfills **Requirement 1** from the design specification:

- ✅ 1.1: Combination charts with multiple series types
- ✅ 1.2: Heatmaps with color gradients
- ✅ 1.3: Box plots with statistical distributions
- ✅ 1.4: Waterfall charts with cumulative effects
- ✅ 1.5: Funnel charts for stage-based data
- ✅ 1.6: Radar charts for multi-dimensional comparison
- ✅ 1.7: Area charts with stacking options
- ✅ 1.8: Candlestick charts for financial data

## Next Steps

To integrate these charts into the DataStory application:

1. Update the Python visualization selector to choose appropriate chart types
2. Extend the Story model to support new chart types
3. Add chart configuration UI for customization
4. Implement statistical overlays (Task 6)
5. Add interactive controls (Task 7)
6. Enhance existing chart components (Task 9)

## File Structure

```
components/charts/
├── BaseChart.tsx                    # Base component with common functionality
├── ChartErrorBoundary.tsx          # Error handling wrapper
├── ChartDataValidator.tsx          # Data validation utilities
├── ChartPerformanceMonitor.tsx     # Performance tracking
├── CombinationChart.tsx            # ✨ New: Combination chart
├── Heatmap.tsx                     # ✨ New: Heatmap
├── BoxPlot.tsx                     # ✨ New: Box plot
├── WaterfallChart.tsx              # ✨ New: Waterfall chart
├── FunnelChart.tsx                 # ✨ New: Funnel chart
├── RadarChart.tsx                  # ✨ New: Radar chart
├── AreaChart.tsx                   # ✨ New: Area chart
├── CandlestickChart.tsx            # ✨ New: Candlestick chart
├── AdvancedChartsExamples.tsx      # Usage examples
├── index.ts                        # Exports all components
└── ADVANCED_CHARTS_README.md       # This file
```
