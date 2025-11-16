# Statistical Overlay Components

Professional statistical overlays for data visualization charts. These components add advanced analytical features like trend lines, moving averages, outlier detection, and annotations to enhance chart insights.

## Components

### 1. TrendLineOverlay

Renders trend lines with confidence intervals on charts. Supports linear and polynomial regression.

**Features:**
- Linear and polynomial trend lines
- R-squared value display
- 95% confidence interval shading
- Toggleable via configuration
- Equation display

**Usage:**
```tsx
import { TrendLineOverlay } from '@/components/charts/overlays';

<TrendLineOverlay
  data={dataPoints}
  trendLineData={{
    slope: 2.5,
    intercept: 10,
    rSquared: 0.92,
    confidenceInterval: { upper: [...], lower: [...] }
  }}
  config={{
    enabled: true,
    type: 'linear',
    showRSquared: true,
    showEquation: true
  }}
  xScale={xScale}
  yScale={yScale}
  width={600}
  height={400}
/>
```

**Props:**
- `data`: Array of [x, y] data points
- `trendLineData`: Regression analysis results from backend
- `config`: Configuration for trend line display
- `xScale`, `yScale`: Scale functions for coordinate transformation
- `width`, `height`: Chart dimensions

---

### 2. MovingAverageOverlay

Renders moving average lines on time-series charts with multiple periods.

**Features:**
- Multiple moving averages (7, 30, 90 day periods)
- Distinct line styles (solid, dashed, dotted)
- Customizable colors
- Legend component included
- Handles missing data gracefully

**Usage:**
```tsx
import { MovingAverageOverlay, MovingAverageLegend } from '@/components/charts/overlays';

<MovingAverageOverlay
  data={[
    { period: 7, values: [...], label: '7-day MA' },
    { period: 30, values: [...], label: '30-day MA' }
  ]}
  config={{
    enabled: true,
    periods: [7, 30],
    lineStyles: ['dashed', 'dotted']
  }}
  xScale={xScale}
  yScale={yScale}
  xData={xAxisData}
/>

<MovingAverageLegend
  data={movingAverageData}
  config={config}
  onToggle={(period) => console.log('Toggle MA:', period)}
/>
```

**Props:**
- `data`: Array of moving average data for each period
- `config`: Configuration including periods and styles
- `xScale`, `yScale`: Scale functions
- `xData`: X-axis data points for alignment

---

### 3. OutlierHighlight

Highlights outlier data points with distinct styling and interactive tooltips.

**Features:**
- Multiple detection methods (IQR, Z-score, Isolation Forest)
- Interactive hover tooltips
- Glow effect for visibility
- Summary component showing outlier count
- Z-score display

**Usage:**
```tsx
import { OutlierHighlight, OutlierSummary } from '@/components/charts/overlays';

<OutlierSummary
  outlierData={outlierData}
  config={{ enabled: true, method: 'zscore' }}
/>

<OutlierHighlight
  data={dataPoints}
  outlierData={{
    indices: [3, 7, 15],
    values: [45, 55, 48],
    method: 'zscore',
    zScores: [3.2, 3.8, 3.1]
  }}
  config={{
    enabled: true,
    method: 'zscore',
    color: '#f59e0b',
    size: 8
  }}
  xScale={xScale}
  yScale={yScale}
/>
```

**Props:**
- `data`: Full dataset with x, y coordinates
- `outlierData`: Outlier detection results from backend
- `config`: Display configuration
- `xScale`, `yScale`: Scale functions

---

### 4. AnnotationLayer

Comprehensive annotation system for adding context to charts.

**Features:**
- Text annotations at specific coordinates
- Reference lines (horizontal/vertical) with labels
- Shaded regions for highlighting periods
- Significance markers for statistical findings
- Custom styling support

**Usage:**
```tsx
import { AnnotationLayer, SignificanceMarker } from '@/components/charts/overlays';

<AnnotationLayer
  annotations={[
    {
      type: 'text',
      position: { x: 5, y: 100 },
      content: 'Peak Performance',
      style: { color: '#10b981', fontWeight: 600 }
    },
    {
      type: 'region',
      position: { x: 3, y: 0 },
      content: '7',
      style: { backgroundColor: '#10b981', opacity: 0.1 }
    }
  ]}
  referenceLines={[
    {
      axis: 'y',
      value: 80,
      label: 'Target',
      color: '#ef4444',
      strokeDasharray: '5,5'
    }
  ]}
  xScale={xScale}
  yScale={yScale}
  width={600}
  height={400}
/>

<SignificanceMarker
  x={10}
  y={75}
  significance={0.95}
  label="**"
  xScale={xScale}
  yScale={yScale}
/>
```

**Annotation Types:**
- `text`: Text label at coordinates
- `line`: Arrow or connector line
- `region`: Shaded rectangular area

**Props:**
- `annotations`: Array of annotation objects
- `referenceLines`: Array of reference line objects
- `xScale`, `yScale`: Scale functions
- `width`, `height`: Chart dimensions

---

## Integration with Charts

These overlays are designed to work with any chart component that uses Recharts or similar libraries. They render as SVG `<g>` elements that can be added to the chart's SVG structure.

### Example: LineChart with Overlays

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  TrendLineOverlay,
  MovingAverageOverlay,
  OutlierHighlight,
  AnnotationLayer
} from '@/components/charts/overlays';

function EnhancedLineChart({ data, statistics }) {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="x" />
      <YAxis />
      <Line type="monotone" dataKey="y" stroke="#2563eb" />
      
      {/* Add statistical overlays */}
      {statistics.trendLine && (
        <TrendLineOverlay
          data={data}
          trendLineData={statistics.trendLine}
          config={{ enabled: true, type: 'linear', showRSquared: true }}
          xScale={xScale}
          yScale={yScale}
          width={600}
          height={400}
        />
      )}
      
      {statistics.movingAverages && (
        <MovingAverageOverlay
          data={statistics.movingAverages}
          config={{ enabled: true, periods: [7, 30] }}
          xScale={xScale}
          yScale={yScale}
          xData={data.map(d => d.x)}
        />
      )}
      
      {statistics.outliers && (
        <OutlierHighlight
          data={data}
          outlierData={statistics.outliers}
          config={{ enabled: true, method: 'zscore' }}
          xScale={xScale}
          yScale={yScale}
        />
      )}
      
      {statistics.annotations && (
        <AnnotationLayer
          annotations={statistics.annotations}
          referenceLines={statistics.referenceLines}
          xScale={xScale}
          yScale={yScale}
          width={600}
          height={400}
        />
      )}
    </LineChart>
  );
}
```

## Scale Functions

All overlay components require `xScale` and `yScale` functions to transform data coordinates to pixel coordinates. These are typically provided by the charting library:

```tsx
// Example scale functions
const xScale = (value: number) => {
  const domain = [minX, maxX];
  const range = [0, chartWidth];
  return ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
};

const yScale = (value: number) => {
  const domain = [minY, maxY];
  const range = [chartHeight, 0]; // Inverted for SVG coordinates
  return ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
};
```

## Theming

All overlay components use the `ChartThemeContext` for consistent styling. Wrap your charts in `ChartThemeProvider`:

```tsx
import { ChartThemeProvider } from '@/lib/contexts/ChartThemeContext';

<ChartThemeProvider theme="default">
  <YourChartWithOverlays />
</ChartThemeProvider>
```

## Data Requirements

### Backend Integration

These overlays expect statistical data from the Python analytics engine:

```python
# Python backend should return:
{
  "trendLine": {
    "slope": 2.5,
    "intercept": 10,
    "rSquared": 0.92,
    "confidenceInterval": {
      "upper": [...],
      "lower": [...]
    }
  },
  "movingAverages": [
    {
      "period": 7,
      "values": [...],
      "label": "7-day MA"
    }
  ],
  "outliers": {
    "indices": [3, 7],
    "values": [45, 55],
    "method": "zscore",
    "zScores": [3.2, 3.8]
  },
  "annotations": [...],
  "referenceLines": [...]
}
```

## Performance Considerations

- Overlays use SVG rendering for crisp visuals at any scale
- Hover interactions are optimized with React state
- Large datasets (>1000 points) may benefit from data sampling
- Confidence intervals can be computationally expensive - calculate on backend

## Accessibility

- All overlays include proper ARIA labels
- Interactive elements have keyboard support
- Color choices meet WCAG AA contrast requirements
- Text annotations are screen-reader friendly

## Browser Support

- Modern browsers with SVG support
- IE11+ (with polyfills)
- Mobile browsers with touch support

## Examples

See `OverlayExamples.tsx` for comprehensive usage examples of all overlay components.
