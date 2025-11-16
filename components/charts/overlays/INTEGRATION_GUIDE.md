# Statistical Overlay System - Integration Guide

## Quick Start

This guide shows how to integrate statistical overlays into your existing charts.

## Step 1: Import Components

```tsx
import {
  TrendLineOverlay,
  MovingAverageOverlay,
  MovingAverageLegend,
  OutlierHighlight,
  OutlierSummary,
  AnnotationLayer,
  SignificanceMarker,
} from '@/components/charts/overlays';
```

## Step 2: Prepare Statistical Data

Your backend should return statistical analysis results:

```typescript
interface ChartWithStatistics {
  data: ChartData;
  statistics: {
    trendLine?: TrendLineData;
    movingAverages?: MovingAverageData[];
    outliers?: OutlierData;
    annotations?: Annotation[];
    referenceLines?: ReferenceLine[];
  };
}
```

## Step 3: Create Scale Functions

Overlays need scale functions to transform data coordinates to pixels:

```tsx
import { scaleLinear, scaleTime } from 'd3-scale';

// For numeric X axis
const xScale = scaleLinear()
  .domain([minX, maxX])
  .range([0, chartWidth]);

// For time-based X axis
const xScale = scaleTime()
  .domain([startDate, endDate])
  .range([0, chartWidth]);

// Y axis (inverted for SVG coordinates)
const yScale = scaleLinear()
  .domain([minY, maxY])
  .range([chartHeight, 0]);
```

## Step 4: Add Overlays to Chart

### Example with Recharts

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

function EnhancedLineChart({ data, statistics }) {
  const chartWidth = 600;
  const chartHeight = 400;
  
  // Create scale functions
  const xScale = (value: number) => {
    const domain = [0, data.length - 1];
    return (value / (domain[1] - domain[0])) * chartWidth;
  };
  
  const yScale = (value: number) => {
    const domain = [0, Math.max(...data.map(d => d.value))];
    return chartHeight - (value / domain[1]) * chartHeight;
  };
  
  return (
    <div>
      {/* Summary components above chart */}
      {statistics.outliers && (
        <OutlierSummary
          outlierData={statistics.outliers}
          config={{ enabled: true, method: 'zscore' }}
        />
      )}
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Line type="monotone" dataKey="value" stroke="#2563eb" />
          
          {/* Add statistical overlays */}
          {statistics.trendLine && (
            <TrendLineOverlay
              data={data.map(d => [d.x, d.value])}
              trendLineData={statistics.trendLine}
              config={{
                enabled: true,
                type: 'linear',
                showRSquared: true,
                showEquation: true,
              }}
              xScale={xScale}
              yScale={yScale}
              width={chartWidth}
              height={chartHeight}
            />
          )}
          
          {statistics.movingAverages && (
            <MovingAverageOverlay
              data={statistics.movingAverages}
              config={{
                enabled: true,
                periods: [7, 30],
                lineStyles: ['dashed', 'dotted'],
              }}
              xScale={xScale}
              yScale={yScale}
              xData={data.map(d => d.x)}
            />
          )}
          
          {statistics.outliers && (
            <OutlierHighlight
              data={data}
              outlierData={statistics.outliers}
              config={{
                enabled: true,
                method: 'zscore',
              }}
              xScale={xScale}
              yScale={yScale}
            />
          )}
          
          {(statistics.annotations || statistics.referenceLines) && (
            <AnnotationLayer
              annotations={statistics.annotations}
              referenceLines={statistics.referenceLines}
              xScale={xScale}
              yScale={yScale}
              width={chartWidth}
              height={chartHeight}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend below chart */}
      {statistics.movingAverages && (
        <MovingAverageLegend
          data={statistics.movingAverages}
          config={{
            enabled: true,
            periods: [7, 30],
            lineStyles: ['dashed', 'dotted'],
          }}
        />
      )}
    </div>
  );
}
```

## Step 5: Backend Integration

### Python Backend Example

```python
from services.statistical_analyzer import StatisticalAnalyzer

def analyze_data(df):
    analyzer = StatisticalAnalyzer()
    
    # Calculate trend line
    trend_line = analyzer.calculate_trend_line(
        df['x'].values,
        df['y'].values,
        confidence_level=0.95
    )
    
    # Calculate moving averages
    moving_averages = []
    for period in [7, 30, 90]:
        ma_values = df['y'].rolling(window=period).mean().tolist()
        moving_averages.append({
            'period': period,
            'values': ma_values,
            'label': f'{period}-day MA'
        })
    
    # Detect outliers
    outliers = analyzer.detect_outliers(
        df['y'].values,
        method='zscore',
        threshold=2.0
    )
    
    return {
        'trendLine': {
            'slope': trend_line['slope'],
            'intercept': trend_line['intercept'],
            'rSquared': trend_line['r_squared'],
            'equation': f"y = {trend_line['slope']:.2f}x + {trend_line['intercept']:.2f}",
            'confidenceInterval': {
                'upper': trend_line['ci_upper'].tolist(),
                'lower': trend_line['ci_lower'].tolist()
            }
        },
        'movingAverages': moving_averages,
        'outliers': {
            'indices': outliers['indices'].tolist(),
            'values': outliers['values'].tolist(),
            'method': 'zscore',
            'zScores': outliers['z_scores'].tolist()
        }
    }
```

## Common Integration Patterns

### Pattern 1: Conditional Rendering

Only show overlays when data is available:

```tsx
{statistics?.trendLine && (
  <TrendLineOverlay {...props} />
)}
```

### Pattern 2: User-Controlled Overlays

Let users toggle overlays:

```tsx
const [showTrendLine, setShowTrendLine] = useState(true);
const [showMovingAverage, setShowMovingAverage] = useState(true);

// In render:
{showTrendLine && statistics.trendLine && (
  <TrendLineOverlay {...props} />
)}

{showMovingAverage && statistics.movingAverages && (
  <MovingAverageOverlay {...props} />
)}

// Controls:
<button onClick={() => setShowTrendLine(!showTrendLine)}>
  Toggle Trend Line
</button>
```

### Pattern 3: Dynamic Configuration

Allow users to configure overlay settings:

```tsx
const [trendConfig, setTrendConfig] = useState({
  enabled: true,
  type: 'linear',
  showRSquared: true,
  showEquation: false,
});

<TrendLineOverlay
  config={trendConfig}
  {...otherProps}
/>

// Configuration UI:
<select onChange={(e) => setTrendConfig({
  ...trendConfig,
  type: e.target.value
})}>
  <option value="linear">Linear</option>
  <option value="polynomial">Polynomial</option>
</select>
```

### Pattern 4: Multiple Chart Types

Use overlays with different chart types:

```tsx
// Scatter Plot with Trend Line and Outliers
<ScatterChart>
  <Scatter data={data} />
  <TrendLineOverlay {...props} />
  <OutlierHighlight {...props} />
</ScatterChart>

// Line Chart with Moving Averages
<LineChart>
  <Line data={data} />
  <MovingAverageOverlay {...props} />
</LineChart>

// Any Chart with Annotations
<AnyChart>
  <AnnotationLayer {...props} />
</AnyChart>
```

## Handling Edge Cases

### Missing Data

```tsx
// Filter out null/undefined values
const cleanData = data.filter(d => d.value !== null && !isNaN(d.value));

// Pass to overlay
<TrendLineOverlay
  data={cleanData.map(d => [d.x, d.value])}
  {...props}
/>
```

### Dynamic Chart Sizes

```tsx
import { useRef, useEffect, useState } from 'react';

function ResponsiveChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setDimensions({
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  return (
    <div ref={chartRef}>
      <Chart>
        <TrendLineOverlay
          width={dimensions.width}
          height={dimensions.height}
          {...props}
        />
      </Chart>
    </div>
  );
}
```

### Performance Optimization

```tsx
import { useMemo } from 'react';

function OptimizedChart({ data, statistics }) {
  // Memoize scale functions
  const xScale = useMemo(() => {
    return (value: number) => {
      // Scale calculation
    };
  }, [data]);
  
  const yScale = useMemo(() => {
    return (value: number) => {
      // Scale calculation
    };
  }, [data]);
  
  // Memoize overlay data
  const trendData = useMemo(() => {
    return data.map(d => [d.x, d.value]);
  }, [data]);
  
  return (
    <Chart>
      <TrendLineOverlay
        data={trendData}
        xScale={xScale}
        yScale={yScale}
        {...props}
      />
    </Chart>
  );
}
```

## Styling and Theming

### Using Theme Provider

```tsx
import { ChartThemeProvider } from '@/lib/contexts/ChartThemeContext';

<ChartThemeProvider theme="default">
  <ChartWithOverlays />
</ChartThemeProvider>
```

### Custom Colors

```tsx
<TrendLineOverlay
  config={{
    enabled: true,
    type: 'linear',
    color: '#10b981', // Custom green
  }}
  {...props}
/>

<OutlierHighlight
  config={{
    enabled: true,
    method: 'zscore',
    color: '#ef4444', // Custom red
    size: 10,
  }}
  {...props}
/>
```

### Custom Annotations

```tsx
const customAnnotations: Annotation[] = [
  {
    type: 'text',
    position: { x: 5, y: 100 },
    content: 'Important Event',
    style: {
      color: '#10b981',
      fontSize: 14,
      fontWeight: 600,
      backgroundColor: 'white',
      borderColor: '#10b981',
      borderWidth: 2,
    },
  },
  {
    type: 'region',
    position: { x: 3, y: 0 },
    content: '7',
    style: {
      backgroundColor: '#3b82f6',
      opacity: 0.15,
    },
  },
];

<AnnotationLayer
  annotations={customAnnotations}
  {...props}
/>
```

## Testing

### Unit Test Example

```tsx
import { render } from '@testing-library/react';
import { TrendLineOverlay } from '@/components/charts/overlays';

describe('TrendLineOverlay', () => {
  it('renders trend line with R-squared', () => {
    const { container } = render(
      <svg>
        <TrendLineOverlay
          data={[[1, 10], [2, 20], [3, 30]]}
          trendLineData={{
            slope: 10,
            intercept: 0,
            rSquared: 0.95,
          }}
          config={{
            enabled: true,
            type: 'linear',
            showRSquared: true,
          }}
          xScale={(x) => x * 100}
          yScale={(y) => 300 - y * 10}
          width={300}
          height={300}
        />
      </svg>
    );
    
    expect(container.querySelector('.trend-line')).toBeInTheDocument();
    expect(container.textContent).toContain('R² = 0.950');
  });
});
```

## Troubleshooting

### Issue: Overlays not visible

**Solution:** Check that:
1. Scale functions are correct
2. Data is in the right format
3. Config has `enabled: true`
4. Chart dimensions are set

### Issue: Incorrect positioning

**Solution:** Verify:
1. Scale functions match chart's coordinate system
2. SVG coordinate system (Y is inverted)
3. Chart margins are accounted for

### Issue: Performance problems

**Solution:**
1. Memoize scale functions
2. Sample large datasets
3. Limit number of overlays
4. Use React.memo for overlay components

## Next Steps

1. Review the [README.md](./README.md) for detailed API documentation
2. Check [OverlayExamples.tsx](./OverlayExamples.tsx) for working examples
3. See [VISUAL_GUIDE.md](./VISUAL_GUIDE.md) for visual descriptions
4. Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details

## Support

For issues or questions:
1. Check the documentation files in this directory
2. Review the type definitions in `types/chart.ts`
3. Look at example implementations in `OverlayExamples.tsx`
