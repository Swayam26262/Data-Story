# Enhanced Tooltip Integration Guide

## Quick Start

### 1. Import the TooltipManager

```tsx
import { TooltipManager } from '@/components/charts/interactions/TooltipManager';
import type { TooltipData, Point } from '@/types';
```

### 2. Wrap Your Chart Component

```tsx
function MyChart() {
  return (
    <TooltipManager>
      {(showTooltip, hideTooltip) => (
        <YourChartComponent
          onMouseEnter={(e) => {
            // Show tooltip logic
          }}
          onMouseLeave={hideTooltip}
        />
      )}
    </TooltipManager>
  );
}
```

### 3. Create Tooltip Data

```tsx
const tooltipData: TooltipData = {
  title: 'Data Point',
  metrics: [
    { label: 'Value', value: 100, color: '#3b82f6', unit: '$' }
  ],
  statistics: {
    percentOfTotal: 25.5,
    rank: 2,
    comparisonToAverage: 15.3,
    trend: 'up'
  }
};
```

## Integration Patterns

### Pattern 1: Recharts Integration

```tsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import { TooltipManager } from '@/components/charts/interactions';
import { createTimeSeriesTooltip } from '@/components/charts/interactions/tooltipUtils';

function MyLineChart({ data }) {
  const allValues = data.map(d => d.value);

  return (
    <TooltipManager>
      {(showTooltip, hideTooltip) => (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            onMouseMove={(state) => {
              if (state.isTooltipActive && state.activePayload) {
                const payload = state.activePayload[0].payload;
                
                const tooltipData = createTimeSeriesTooltip(
                  {
                    timestamp: payload.date,
                    value: payload.value,
                    label: 'Revenue',
                    color: '#3b82f6',
                    unit: '$'
                  },
                  allValues,
                  {
                    showMovingAverage: true,
                    movingAveragePeriod: 7
                  }
                );

                showTooltip(tooltipData, {
                  x: state.chartX + 50,
                  y: state.chartY + 50
                });
              }
            }}
            onMouseLeave={hideTooltip}
          >
            <XAxis dataKey="date" />
            <YAxis />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </TooltipManager>
  );
}
```

### Pattern 2: Custom Chart Integration

```tsx
import { TooltipManager } from '@/components/charts/interactions';
import { createCategoricalTooltip } from '@/components/charts/interactions/tooltipUtils';

function CustomBarChart({ data }) {
  const allValues = data.map(d => d.value);

  return (
    <TooltipManager>
      {(showTooltip, hideTooltip) => (
        <div className="flex gap-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-500 hover:bg-blue-600 cursor-pointer"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const tooltipData = createCategoricalTooltip(
                  {
                    category: item.name,
                    value: item.value,
                    color: '#3b82f6',
                    unit: '$'
                  },
                  allValues
                );
                showTooltip(tooltipData, {
                  x: rect.left + rect.width / 2,
                  y: rect.top
                });
              }}
              onMouseLeave={hideTooltip}
            />
          ))}
        </div>
      )}
    </TooltipManager>
  );
}
```

### Pattern 3: D3.js Integration

```tsx
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { TooltipManager } from '@/components/charts/interactions';
import { createTooltipData } from '@/components/charts/interactions/tooltipUtils';

function D3Chart({ data }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const allValues = data.map(d => d.value);

  return (
    <TooltipManager>
      {(showTooltip, hideTooltip) => {
        useEffect(() => {
          if (!svgRef.current) return;

          const svg = d3.select(svgRef.current);
          
          svg.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', (d, i) => i * 50)
            .attr('cy', d => 200 - d.value)
            .attr('r', 5)
            .on('mouseenter', function(event, d) {
              const tooltipData = createTooltipData({
                title: d.name,
                value: d.value,
                label: 'Value',
                color: '#3b82f6',
                dataset: allValues,
                includeStatistics: true
              });
              
              showTooltip(tooltipData, {
                x: event.pageX,
                y: event.pageY
              });
            })
            .on('mouseleave', hideTooltip);
        }, [data]);

        return <svg ref={svgRef} width={600} height={400} />;
      }}
    </TooltipManager>
  );
}
```

## Utility Functions

### Auto-Calculate Statistics

```tsx
import { createTooltipData } from '@/components/charts/interactions/tooltipUtils';

const tooltipData = createTooltipData({
  title: 'Q4 Sales',
  value: 250000,
  label: 'Revenue',
  color: '#10b981',
  unit: '$',
  dataset: allQuarterlyValues,
  includeStatistics: true,
  additionalMetrics: [
    { label: 'Units', value: 2500 },
    { label: 'Avg Price', value: 100, unit: '$' }
  ]
});
```

### Time Series Tooltip

```tsx
import { createTimeSeriesTooltip } from '@/components/charts/interactions/tooltipUtils';

const tooltipData = createTimeSeriesTooltip(
  {
    timestamp: '2024-06-15',
    value: 5500,
    label: 'Daily Revenue',
    color: '#3b82f6',
    unit: '$'
  },
  allDailyValues,
  {
    showMovingAverage: true,
    movingAveragePeriod: 7,
    showYoYChange: true,
    previousYearValue: 4800
  }
);
```

### Categorical Tooltip

```tsx
import { createCategoricalTooltip } from '@/components/charts/interactions/tooltipUtils';

const tooltipData = createCategoricalTooltip(
  {
    category: 'Product A',
    value: 12000,
    color: '#3b82f6',
    unit: '$'
  },
  allProductValues
);
```

### Multi-Metric Tooltip

```tsx
import { createMultiMetricTooltip } from '@/components/charts/interactions/tooltipUtils';

const tooltipData = createMultiMetricTooltip({
  title: 'Q4 Performance',
  metrics: [
    {
      label: 'Revenue',
      value: 250000,
      color: '#10b981',
      unit: '$',
      dataset: revenueValues
    },
    {
      label: 'Profit',
      value: 75000,
      color: '#3b82f6',
      unit: '$'
    },
    {
      label: 'Margin',
      value: 30,
      color: '#f59e0b',
      unit: '%'
    }
  ]
});
```

## Advanced Features

### Custom Content

```tsx
const tooltipData: TooltipData = {
  title: 'Product Details',
  metrics: [
    { label: 'Price', value: 99.99, unit: '$' },
    { label: 'Stock', value: 45 }
  ],
  customContent: (
    <div className="space-y-2">
      <div>
        <p className="font-medium text-gray-700">Features:</p>
        <ul className="list-disc list-inside text-gray-600 text-xs">
          <li>Premium Quality</li>
          <li>2-Year Warranty</li>
          <li>Free Shipping</li>
        </ul>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
          In Stock
        </span>
      </div>
    </div>
  )
};
```

### Delayed Tooltip

```tsx
<TooltipManager delay={500}>
  {(showTooltip, hideTooltip) => (
    // Your chart component
  )}
</TooltipManager>
```

### Manual Positioning

```tsx
<TooltipManager position="top" offset={15}>
  {(showTooltip, hideTooltip) => (
    // Your chart component
  )}
</TooltipManager>
```

### Using the Hook API

```tsx
import { useTooltip } from '@/components/charts/interactions';

function MyComponent() {
  const { showTooltip, hideTooltip, updatePosition } = useTooltip();

  const handleMouseMove = (e: MouseEvent) => {
    updatePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      onMouseEnter={(e) => {
        showTooltip(tooltipData, { x: e.clientX, y: e.clientY });
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={hideTooltip}
    >
      Content
    </div>
  );
}
```

## Common Patterns

### Pattern: Hover on Chart Elements

```tsx
<TooltipManager>
  {(showTooltip, hideTooltip) => (
    <div>
      {data.map((item, index) => (
        <ChartElement
          key={index}
          data={item}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            showTooltip(createTooltipData(...), {
              x: rect.left + rect.width / 2,
              y: rect.top
            });
          }}
          onMouseLeave={hideTooltip}
        />
      ))}
    </div>
  )}
</TooltipManager>
```

### Pattern: Click to Show Tooltip

```tsx
<TooltipManager>
  {(showTooltip, hideTooltip) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div
        onClick={(e) => {
          if (isOpen) {
            hideTooltip();
            setIsOpen(false);
          } else {
            showTooltip(tooltipData, {
              x: e.clientX,
              y: e.clientY
            });
            setIsOpen(true);
          }
        }}
      >
        Click me
      </div>
    );
  }}
</TooltipManager>
```

### Pattern: Tooltip with Loading State

```tsx
<TooltipManager>
  {(showTooltip, hideTooltip) => (
    <div
      onMouseEnter={async (e) => {
        // Show loading tooltip
        showTooltip({
          title: 'Loading...',
          metrics: []
        }, { x: e.clientX, y: e.clientY });

        // Fetch data
        const data = await fetchTooltipData();

        // Update with real data
        showTooltip(data, { x: e.clientX, y: e.clientY });
      }}
      onMouseLeave={hideTooltip}
    >
      Hover me
    </div>
  )}
</TooltipManager>
```

## Styling Customization

### Custom Tooltip Styles

```tsx
<TooltipManager className="custom-tooltip">
  {(showTooltip, hideTooltip) => (
    // Your content
  )}
</TooltipManager>
```

```css
/* In your CSS file */
.custom-tooltip {
  /* Override default styles */
}

.custom-tooltip > div {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}
```

## Performance Optimization

### Memoize Tooltip Data

```tsx
const tooltipData = useMemo(() => 
  createTooltipData({
    title: item.name,
    value: item.value,
    dataset: allValues,
    includeStatistics: true
  }),
  [item.name, item.value, allValues]
);
```

### Debounce Rapid Updates

```tsx
import { debounce } from 'lodash';

const debouncedShowTooltip = useMemo(
  () => debounce(showTooltip, 100),
  [showTooltip]
);
```

### Conditional Statistics

```tsx
const tooltipData = createTooltipData({
  title: item.name,
  value: item.value,
  dataset: allValues,
  includeStatistics: allValues.length > 1, // Only if multiple values
});
```

## Troubleshooting

### Tooltip Not Showing
- Check that `showTooltip` is called with valid data
- Verify the position coordinates are within viewport
- Ensure z-index is high enough (default: 50)

### Tooltip Position Wrong
- Use `position="auto"` for automatic positioning
- Adjust `offset` prop if tooltip is too close/far
- Check that coordinates are relative to viewport

### Tooltip Flickering
- Add `delay` prop to prevent rapid show/hide
- Use `pointer-events-none` on tooltip (already default)
- Debounce mouse move events

### Statistics Not Calculating
- Ensure `dataset` is provided and not empty
- Check that values are numbers, not strings
- Verify `includeStatistics` is true

## Best Practices

1. **Always provide a title** for context
2. **Limit metrics to 3-5** for readability
3. **Use consistent colors** across similar charts
4. **Include units** for all numeric values
5. **Provide dataset** for automatic statistics
6. **Use utility functions** for common patterns
7. **Memoize tooltip data** for performance
8. **Test on mobile** for touch interactions
9. **Ensure accessibility** with proper labels
10. **Keep custom content simple** to avoid clutter

## Examples

See the following files for complete examples:
- `TooltipExamples.tsx` - Basic tooltip examples
- `ChartWithTooltipExample.tsx` - Chart integration examples
- `TOOLTIP_README.md` - Complete documentation
- `TOOLTIP_VISUAL_GUIDE.md` - Visual design guide
