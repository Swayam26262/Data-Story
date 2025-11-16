# Cross-Chart Highlighting - Quick Reference

## 30-Second Setup

```tsx
// 1. Wrap with provider
<CrossChartHighlightProvider autoSyncByKey="date">
  <MyCharts />
</CrossChartHighlightProvider>

// 2. Use in chart
const { isPointHighlighted, highlightPoint, highlightConfig } = 
  useChartHighlight({ chartId: 'my-chart' });

// 3. Apply to dots/bars
<HighlightDot
  {...props}
  isHighlighted={isPointHighlighted(props.payload, props.index)}
  config={highlightConfig}
/>
```

## Essential Imports

```tsx
import {
  CrossChartHighlightProvider,
  useCrossChartHighlight,
  useChartHighlight,
  HighlightDot,
  HighlightBar,
  useHighlightStyles,
} from '@/components/charts/interactions';
```

## Core API

### Provider

```tsx
<CrossChartHighlightProvider
  autoSyncByKey="date"  // Optional: auto-sync by key
>
  {children}
</CrossChartHighlightProvider>
```

### Hook

```tsx
const {
  isPointHighlighted,     // (dataPoint, index?) => boolean
  highlightPoint,         // (dataPoint, dataKey?, index?) => void
  clearHighlight,         // () => void
  clearAllHighlights,     // () => void
  currentHighlight,       // DataPoint | undefined
  highlightConfig,        // HighlightEffectConfig
  isEnabled,             // boolean
} = useChartHighlight({
  chartId: string,
  relationships?: HighlightRelationship[],
  highlightConfig?: HighlightEffectConfig,
  onHighlight?: (dataPoint) => void,
  onClearHighlight?: () => void,
});
```

### Components

```tsx
// For line/scatter charts
<HighlightDot
  {...props}
  isHighlighted={boolean}
  config={highlightConfig}
/>

// For bar charts
<HighlightBar
  {...props}
  isHighlighted={boolean}
  config={highlightConfig}
/>
```

## Common Patterns

### Pattern 1: Simple Highlighting

```tsx
function MyChart({ chartId, data }) {
  const { isPointHighlighted, highlightPoint, clearHighlight, highlightConfig } =
    useChartHighlight({ chartId });

  return (
    <LineChart data={data} onMouseLeave={clearHighlight}>
      <Line
        dataKey="value"
        dot={(props) => (
          <HighlightDot
            {...props}
            isHighlighted={isPointHighlighted(props.payload, props.index)}
            config={highlightConfig}
          />
        )}
        activeDot={{
          onClick: (e, payload) => {
            highlightPoint(payload.payload, 'value', payload.index);
          }
        }}
      />
    </LineChart>
  );
}
```

### Pattern 2: Bidirectional Sync

```tsx
// Chart A
const { ... } = useChartHighlight({
  chartId: 'chart-a',
  relationships: [
    { sourceChartId: 'chart-a', targetChartId: 'chart-b', matchKey: 'date' }
  ]
});

// Chart B
const { ... } = useChartHighlight({
  chartId: 'chart-b',
  relationships: [
    { sourceChartId: 'chart-b', targetChartId: 'chart-a', matchKey: 'date' }
  ]
});
```

### Pattern 3: Auto-Sync All

```tsx
<CrossChartHighlightProvider autoSyncByKey="date">
  <Chart1 chartId="chart-1" />
  <Chart2 chartId="chart-2" />
  <Chart3 chartId="chart-3" />
</CrossChartHighlightProvider>
```

## Configuration

### Default Config

```tsx
{
  type: 'combined',
  color: '#2563eb',
  intensity: 0.8,
  duration: 300,
  glowSize: 8,
  borderWidth: 3,
  scaleAmount: 1.3,
}
```

### Custom Config

```tsx
const customConfig = {
  type: 'glow',
  color: '#f59e0b',
  intensity: 0.9,
  duration: 400,
  glowSize: 12,
};

const { highlightConfig } = useChartHighlight({
  chartId: 'my-chart',
  highlightConfig: customConfig,
});
```

## Effect Types

| Type | Description | Use Case |
|------|-------------|----------|
| `glow` | Drop shadow | Subtle emphasis |
| `border` | Outline | Clear boundaries |
| `scale` | Size increase | Draw attention |
| `pulse` | Animated pulse | Dynamic feedback |
| `combined` | Glow + scale | **Recommended** |

## Relationships

```tsx
interface HighlightRelationship {
  sourceChartId: string;    // Chart that triggers highlight
  targetChartId: string;    // Chart that receives highlight
  matchKey: string;         // Key to match (e.g., 'date')
}
```

## Event Handlers

### Line Chart

```tsx
<Line
  dot={(props) => <HighlightDot {...props} isHighlighted={...} />}
  activeDot={{
    onClick: (e, payload) => highlightPoint(payload.payload, 'value', payload.index)
  }}
/>
```

### Bar Chart

```tsx
<Bar
  shape={(props) => <HighlightBar {...props} isHighlighted={...} />}
  onClick={(data, index) => highlightPoint(data, 'value', index)}
/>
```

### Scatter Plot

```tsx
<Scatter
  shape={(props) => <HighlightDot {...props} isHighlighted={...} />}
  onClick={(data) => highlightPoint(data, undefined, data.index)}
/>
```

## Clear Highlights

```tsx
// Clear this chart only
clearHighlight();

// Clear all charts
clearAllHighlights();

// Clear on mouse leave
<LineChart onMouseLeave={clearHighlight}>
```

## Programmatic Control

```tsx
const { highlightPoint, clearAllHighlights } = useCrossChartHighlight();

// Highlight specific point
highlightPoint('chart-1', { date: '2024-01', value: 100 }, 'value', 0);

// Clear all
clearAllHighlights();
```

## Batch Operations

```tsx
import { useBatchHighlight } from '@/components/charts/interactions';

const { highlightMultiple } = useBatchHighlight();

highlightMultiple([
  { chartId: 'chart-1', dataPoint: { date: '2024-01' }, index: 0 },
  { chartId: 'chart-2', dataPoint: { date: '2024-01' }, index: 0 },
  { chartId: 'chart-3', dataPoint: { date: '2024-01' }, index: 0 },
]);
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Highlights not appearing | Check provider wraps charts |
| Not synchronizing | Verify matchKey exists in data |
| Performance issues | Use index matching, reduce relationships |
| Visual glitches | Call `useHighlightStyles()` |

## Performance Tips

1. **Use index matching** when possible
2. **Limit relationships** to necessary connections
3. **Debounce hover** interactions
4. **Memoize callbacks** with `useCallback`
5. **Disable for large datasets** (>5000 points)

## Accessibility

```tsx
// Add ARIA labels
<HighlightDot
  {...props}
  aria-label={`Data point: ${props.payload.value}`}
  role="button"
  tabIndex={0}
/>

// Keyboard support
onKeyPress={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    highlightPoint(dataPoint);
  }
}}
```

## TypeScript Types

```tsx
import type {
  HighlightState,
  HighlightRelationship,
  HighlightEffectConfig,
  HighlightEffectType,
} from '@/components/charts/interactions';
```

## Testing

```tsx
import { render, fireEvent } from '@testing-library/react';
import { CrossChartHighlightProvider } from '@/components/charts/interactions';

test('highlights point on click', () => {
  render(
    <CrossChartHighlightProvider>
      <MyChart chartId="test" data={data} />
    </CrossChartHighlightProvider>
  );
  
  const point = screen.getByRole('button');
  fireEvent.click(point);
  
  expect(point).toHaveClass('highlighted');
});
```

## Common Mistakes

❌ **Don't**: Forget to wrap with provider
```tsx
<MyChart chartId="chart-1" />  // Won't work!
```

✅ **Do**: Wrap with provider
```tsx
<CrossChartHighlightProvider>
  <MyChart chartId="chart-1" />
</CrossChartHighlightProvider>
```

---

❌ **Don't**: Use same chartId for multiple charts
```tsx
<Chart1 chartId="chart" />
<Chart2 chartId="chart" />  // Conflict!
```

✅ **Do**: Use unique chartIds
```tsx
<Chart1 chartId="chart-1" />
<Chart2 chartId="chart-2" />
```

---

❌ **Don't**: Forget to clear highlights
```tsx
<LineChart data={data}>  // Highlights persist!
```

✅ **Do**: Clear on mouse leave
```tsx
<LineChart data={data} onMouseLeave={clearHighlight}>
```

## Quick Checklist

- [ ] Wrap charts with `CrossChartHighlightProvider`
- [ ] Add unique `chartId` to each chart
- [ ] Call `useChartHighlight` hook
- [ ] Replace dots/bars with highlight components
- [ ] Add click handlers
- [ ] Add `onMouseLeave` to clear
- [ ] Define relationships if needed
- [ ] Call `useHighlightStyles()` once
- [ ] Test highlighting
- [ ] Test synchronization

## Resources

- **Full Docs**: `CROSS_CHART_HIGHLIGHTING_README.md`
- **Integration**: `CROSS_CHART_INTEGRATION_GUIDE.md`
- **Examples**: `CrossChartHighlightExample.tsx`
- **Visual Guide**: `CROSS_CHART_VISUAL_GUIDE.md`
- **Types**: `types/chart.ts`

## Support

Questions? Check the full documentation or example files listed above.
