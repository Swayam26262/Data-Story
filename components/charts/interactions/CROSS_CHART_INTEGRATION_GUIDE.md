# Cross-Chart Highlighting Integration Guide

This guide provides step-by-step instructions for integrating the cross-chart highlighting system into existing chart components.

## Quick Start Checklist

- [ ] Wrap charts with `CrossChartHighlightProvider`
- [ ] Add `useChartHighlight` hook to each chart
- [ ] Replace standard dots/bars with highlight-enabled components
- [ ] Add click/hover handlers for highlighting
- [ ] Define relationships between charts
- [ ] Test highlighting across all charts

## Step-by-Step Integration

### Step 1: Wrap Your Story/Dashboard with Provider

First, wrap all your charts with the `CrossChartHighlightProvider` at the top level.

**Before:**
```tsx
function StoryViewer({ story }) {
  return (
    <div>
      <LineChart data={story.charts[0].data} />
      <BarChart data={story.charts[1].data} />
      <ScatterPlot data={story.charts[2].data} />
    </div>
  );
}
```

**After:**
```tsx
import { CrossChartHighlightProvider } from '@/components/charts/interactions/CrossChartHighlightContext';

function StoryViewer({ story }) {
  return (
    <CrossChartHighlightProvider autoSyncByKey="date">
      <div>
        <LineChart chartId="chart-0" data={story.charts[0].data} />
        <BarChart chartId="chart-1" data={story.charts[1].data} />
        <ScatterPlot chartId="chart-2" data={story.charts[2].data} />
      </div>
    </CrossChartHighlightProvider>
  );
}
```

**Key Changes:**
- Added `CrossChartHighlightProvider` wrapper
- Added unique `chartId` prop to each chart
- Set `autoSyncByKey` to automatically sync by common field

### Step 2: Add Highlighting Hook to Chart Component

Add the `useChartHighlight` hook to your chart component.

**Before:**
```tsx
function LineChart({ data }) {
  return (
    <ResponsiveContainer>
      <RechartsLineChart data={data}>
        <Line dataKey="value" stroke="#2563eb" />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
```

**After:**
```tsx
import { useChartHighlight } from '@/components/charts/interactions/useChartHighlight';

function LineChart({ chartId, data }) {
  const {
    isPointHighlighted,
    highlightPoint,
    clearHighlight,
    highlightConfig,
  } = useChartHighlight({
    chartId,
    relationships: [], // Define relationships if needed
  });

  return (
    <ResponsiveContainer>
      <RechartsLineChart data={data} onMouseLeave={clearHighlight}>
        <Line dataKey="value" stroke="#2563eb" />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
```

**Key Changes:**
- Imported `useChartHighlight` hook
- Added `chartId` prop to component
- Called hook with `chartId`
- Added `onMouseLeave` to clear highlights

### Step 3: Replace Standard Components with Highlight-Enabled Ones

Replace standard Recharts components with highlight-enabled versions.

#### For Line Charts:

**Before:**
```tsx
<Line
  dataKey="value"
  stroke="#2563eb"
  dot={{ fill: '#2563eb', r: 4 }}
/>
```

**After:**
```tsx
import { HighlightDot } from '@/components/charts/interactions/HighlightEffects';

<Line
  dataKey="value"
  stroke="#2563eb"
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
```

#### For Bar Charts:

**Before:**
```tsx
<Bar dataKey="value" fill="#10b981" />
```

**After:**
```tsx
import { HighlightBar } from '@/components/charts/interactions/HighlightEffects';

<Bar
  dataKey="value"
  shape={(props) => (
    <HighlightBar
      {...props}
      isHighlighted={isPointHighlighted(props.payload, props.index)}
      config={highlightConfig}
    />
  )}
  onClick={(data, index) => {
    highlightPoint(data, 'value', index);
  }}
/>
```

#### For Scatter Plots:

**Before:**
```tsx
<Scatter
  data={data}
  fill="#f59e0b"
/>
```

**After:**
```tsx
import { HighlightDot } from '@/components/charts/interactions/HighlightEffects';

<Scatter
  data={data}
  shape={(props) => (
    <HighlightDot
      {...props}
      isHighlighted={isPointHighlighted(props.payload, props.index)}
      config={highlightConfig}
    />
  )}
  onClick={(data) => {
    highlightPoint(data, undefined, data.index);
  }}
/>
```

### Step 4: Define Chart Relationships

Define how charts should be synchronized.

```tsx
const relationships = [
  // Bidirectional sync between line and bar chart
  { sourceChartId: 'line-chart', targetChartId: 'bar-chart', matchKey: 'date' },
  { sourceChartId: 'bar-chart', targetChartId: 'line-chart', matchKey: 'date' },
  
  // One-way sync from scatter to heatmap
  { sourceChartId: 'scatter', targetChartId: 'heatmap', matchKey: 'category' },
];

const { isPointHighlighted, highlightPoint, clearHighlight, highlightConfig } =
  useChartHighlight({
    chartId: 'line-chart',
    relationships,
  });
```

### Step 5: Add Highlight Styles

Ensure highlight styles are injected into the document.

```tsx
import { useHighlightStyles } from '@/components/charts/interactions/HighlightEffects';

function StoryViewer({ story }) {
  // Inject highlight styles
  useHighlightStyles();

  return (
    <CrossChartHighlightProvider>
      {/* Your charts */}
    </CrossChartHighlightProvider>
  );
}
```

## Complete Example: Upgrading LineChart Component

Here's a complete before/after example for a LineChart component:

### Before (No Highlighting)

```tsx
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
  data: any[];
  title: string;
}

export function LineChart({ data, title }: LineChartProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### After (With Highlighting)

```tsx
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useChartHighlight } from '@/components/charts/interactions/useChartHighlight';
import { HighlightDot } from '@/components/charts/interactions/HighlightEffects';
import type { HighlightRelationship } from '@/components/charts/interactions/CrossChartHighlightContext';

interface LineChartProps {
  chartId: string;
  data: any[];
  title: string;
  relationships?: HighlightRelationship[];
}

export function LineChart({
  chartId,
  data,
  title,
  relationships = [],
}: LineChartProps) {
  const {
    isPointHighlighted,
    highlightPoint,
    clearHighlight,
    highlightConfig,
  } = useChartHighlight({
    chartId,
    relationships,
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data} onMouseLeave={clearHighlight}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={(props: any) => (
              <HighlightDot
                {...props}
                isHighlighted={isPointHighlighted(props.payload, props.index)}
                config={highlightConfig}
              />
            )}
            activeDot={{
              onClick: (e: any, payload: any) => {
                highlightPoint(payload.payload, 'value', payload.index);
              },
            }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Key Changes:**
1. Added `chartId` and `relationships` props
2. Imported and used `useChartHighlight` hook
3. Imported `HighlightDot` component
4. Replaced standard `dot` with `HighlightDot`
5. Added `activeDot` click handler
6. Added `onMouseLeave` to clear highlights

## Integration Patterns

### Pattern 1: Simple Highlighting (No Relationships)

Use when you want highlighting within a single chart only.

```tsx
const { isPointHighlighted, highlightPoint, clearHighlight, highlightConfig } =
  useChartHighlight({
    chartId: 'my-chart',
  });
```

### Pattern 2: Bidirectional Sync

Use when two charts should highlight each other.

```tsx
// Chart 1
const { ... } = useChartHighlight({
  chartId: 'chart-1',
  relationships: [
    { sourceChartId: 'chart-1', targetChartId: 'chart-2', matchKey: 'date' },
  ],
});

// Chart 2
const { ... } = useChartHighlight({
  chartId: 'chart-2',
  relationships: [
    { sourceChartId: 'chart-2', targetChartId: 'chart-1', matchKey: 'date' },
  ],
});
```

### Pattern 3: Hub and Spoke

Use when one chart controls highlighting in multiple others.

```tsx
// Hub chart
const { ... } = useChartHighlight({
  chartId: 'hub',
  relationships: [
    { sourceChartId: 'hub', targetChartId: 'spoke-1', matchKey: 'id' },
    { sourceChartId: 'hub', targetChartId: 'spoke-2', matchKey: 'id' },
    { sourceChartId: 'hub', targetChartId: 'spoke-3', matchKey: 'id' },
  ],
});

// Spoke charts (no relationships needed if one-way)
const { ... } = useChartHighlight({ chartId: 'spoke-1' });
const { ... } = useChartHighlight({ chartId: 'spoke-2' });
const { ... } = useChartHighlight({ chartId: 'spoke-3' });
```

### Pattern 4: Auto-Sync All Charts

Use when all charts share a common key.

```tsx
// In parent component
<CrossChartHighlightProvider autoSyncByKey="timestamp">
  <Chart1 chartId="chart-1" />
  <Chart2 chartId="chart-2" />
  <Chart3 chartId="chart-3" />
</CrossChartHighlightProvider>

// In each chart (no relationships needed)
const { ... } = useChartHighlight({ chartId });
```

## Testing Your Integration

### Manual Testing Checklist

1. **Single Chart Highlighting**
   - [ ] Click a point - it should highlight
   - [ ] Click another point - previous highlight should clear
   - [ ] Hover away - highlight should clear (if using onMouseLeave)

2. **Cross-Chart Highlighting**
   - [ ] Click a point in Chart A
   - [ ] Verify corresponding point highlights in Chart B
   - [ ] Click a point in Chart B
   - [ ] Verify corresponding point highlights in Chart A

3. **Visual Effects**
   - [ ] Highlighted points have glow effect
   - [ ] Highlighted points are larger
   - [ ] Animation is smooth (300ms)
   - [ ] No visual glitches or flickering

4. **Performance**
   - [ ] Highlighting is responsive (<100ms)
   - [ ] No lag when clicking rapidly
   - [ ] Smooth on mobile devices
   - [ ] Works with large datasets (>1000 points)

5. **Edge Cases**
   - [ ] Works with empty data
   - [ ] Works with single data point
   - [ ] Works when charts have different data lengths
   - [ ] Works when match key is missing in some data

### Automated Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CrossChartHighlightProvider } from '@/components/charts/interactions/CrossChartHighlightContext';
import { LineChart } from './LineChart';

describe('Cross-Chart Highlighting', () => {
  it('highlights point on click', () => {
    const data = [
      { date: '2024-01', value: 100 },
      { date: '2024-02', value: 200 },
    ];

    render(
      <CrossChartHighlightProvider>
        <LineChart chartId="test-chart" data={data} title="Test" />
      </CrossChartHighlightProvider>
    );

    // Click on a data point
    const point = screen.getByRole('button', { name: /data point/i });
    fireEvent.click(point);

    // Verify highlight is applied
    expect(point).toHaveClass('highlighted');
  });

  it('synchronizes highlights across charts', () => {
    const data = [{ date: '2024-01', value: 100 }];

    render(
      <CrossChartHighlightProvider autoSyncByKey="date">
        <LineChart chartId="chart-1" data={data} title="Chart 1" />
        <LineChart chartId="chart-2" data={data} title="Chart 2" />
      </CrossChartHighlightProvider>
    );

    // Click point in chart 1
    const chart1Point = screen.getAllByRole('button')[0];
    fireEvent.click(chart1Point);

    // Verify point in chart 2 is also highlighted
    const chart2Point = screen.getAllByRole('button')[1];
    expect(chart2Point).toHaveClass('highlighted');
  });
});
```

## Troubleshooting Common Issues

### Issue: Highlights Not Appearing

**Symptoms:** Clicking points does nothing

**Solutions:**
1. Verify `CrossChartHighlightProvider` wraps all charts
2. Check that `chartId` is passed to component
3. Ensure `useChartHighlight` is called
4. Verify `isPointHighlighted` is used in dot/bar component

### Issue: Highlights Not Synchronizing

**Symptoms:** Clicking in one chart doesn't highlight others

**Solutions:**
1. Check that `matchKey` exists in both datasets
2. Verify relationships are defined correctly
3. Ensure `matchKey` values match exactly (type and value)
4. Check that both charts have `useChartHighlight` hook

### Issue: Performance Problems

**Symptoms:** Lag when highlighting, slow animations

**Solutions:**
1. Use index-based matching instead of value matching
2. Reduce number of relationships
3. Implement debouncing for hover interactions
4. Consider disabling for charts with >1000 points

### Issue: Visual Glitches

**Symptoms:** Flickering, incorrect positioning

**Solutions:**
1. Ensure `useHighlightStyles` is called
2. Check z-index conflicts with other elements
3. Verify animation duration is reasonable (300-500ms)
4. Test in different browsers

## Migration Checklist

Use this checklist when migrating existing charts:

- [ ] Add `CrossChartHighlightProvider` to parent component
- [ ] Add `chartId` prop to all chart components
- [ ] Import `useChartHighlight` hook
- [ ] Import highlight components (`HighlightDot`, `HighlightBar`)
- [ ] Replace standard dots/bars with highlight versions
- [ ] Add click handlers for highlighting
- [ ] Add `onMouseLeave` for clearing highlights
- [ ] Define relationships between charts
- [ ] Call `useHighlightStyles` in parent component
- [ ] Test highlighting in single chart
- [ ] Test cross-chart synchronization
- [ ] Test on mobile devices
- [ ] Update TypeScript types if needed
- [ ] Update documentation
- [ ] Add tests for highlighting functionality

## Next Steps

After integrating the highlighting system:

1. **Customize Visual Effects**: Adjust colors, sizes, and animations to match your design
2. **Add Tooltips**: Combine with enhanced tooltips for richer interactions
3. **Implement Filters**: Use highlights to filter data in other components
4. **Add Analytics**: Track which points users interact with most
5. **Enhance Accessibility**: Add keyboard navigation for highlights

## Support

For additional help:
- See `CROSS_CHART_HIGHLIGHTING_README.md` for full API documentation
- Check `CrossChartHighlightExample.tsx` for working examples
- Review type definitions in `types/chart.ts`
