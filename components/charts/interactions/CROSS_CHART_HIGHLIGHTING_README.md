# Cross-Chart Highlighting System

A comprehensive system for synchronizing highlights across multiple charts in a data story, enabling users to explore relationships and patterns across different visualizations.

## Overview

The cross-chart highlighting system provides:

- **Data Point Selection**: Click or hover on any data point to highlight it
- **Cross-Chart Synchronization**: Automatically highlight related points in other charts
- **Visual Effects**: Glow, border, scale, and pulse effects for highlighted elements
- **Relationship Management**: Define how charts are connected and synchronized
- **State Management**: Centralized highlight state across all charts
- **Performance**: Optimized for smooth 60 FPS interactions

## Architecture

### Components

1. **CrossChartHighlightContext**: Context provider for managing highlight state
2. **HighlightEffects**: Visual effect components and utilities
3. **useChartHighlight**: Hook for integrating highlighting into charts
4. **HighlightDot/HighlightBar**: Custom Recharts components with highlight support

### Data Flow

```
User clicks point → Chart calls highlightPoint() → Context updates state →
Related charts receive update → Visual effects applied → Tooltips updated
```

## Installation

The cross-chart highlighting system is already integrated into the project. No additional installation required.

## Basic Usage

### 1. Wrap Your Charts with Provider

```tsx
import { CrossChartHighlightProvider } from '@/components/charts/interactions/CrossChartHighlightContext';

function StoryViewer() {
  return (
    <CrossChartHighlightProvider autoSyncByKey="date">
      <Chart1 />
      <Chart2 />
      <Chart3 />
    </CrossChartHighlightProvider>
  );
}
```

### 2. Use the Hook in Your Chart

```tsx
import { useChartHighlight } from '@/components/charts/interactions/useChartHighlight';
import { HighlightDot } from '@/components/charts/interactions/HighlightEffects';

function MyLineChart({ chartId, data }) {
  const {
    isPointHighlighted,
    highlightPoint,
    clearHighlight,
    highlightConfig,
  } = useChartHighlight({
    chartId,
    relationships: [
      { sourceChartId: chartId, targetChartId: 'other-chart', matchKey: 'date' }
    ]
  });

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

## API Reference

### CrossChartHighlightProvider

Provider component that manages highlight state across all charts.

**Props:**

- `children`: React nodes to wrap
- `autoSyncByKey?`: Automatically sync charts by this key (e.g., 'date')

**Example:**

```tsx
<CrossChartHighlightProvider autoSyncByKey="date">
  {children}
</CrossChartHighlightProvider>
```

### useCrossChartHighlight

Hook to access the highlight context directly.

**Returns:**

```typescript
{
  highlightedPoints: Map<string, HighlightState>;
  highlightPoint: (chartId, dataPoint, dataKey?, index?) => void;
  clearChartHighlight: (chartId) => void;
  clearAllHighlights: () => void;
  isPointHighlighted: (chartId, dataPoint) => boolean;
  getChartHighlight: (chartId) => HighlightState | undefined;
  registerRelationship: (relationship) => void;
  unregisterRelationship: (sourceChartId, targetChartId) => void;
  getChartRelationships: (chartId) => HighlightRelationship[];
}
```

### useChartHighlight

Simplified hook for integrating highlighting into chart components.

**Options:**

```typescript
{
  chartId: string;                    // Unique identifier for the chart
  enabled?: boolean;                  // Enable/disable highlighting (default: true)
  highlightConfig?: HighlightEffectConfig;  // Visual effect configuration
  relationships?: HighlightRelationship[];  // Chart relationships
  onHighlight?: (dataPoint) => void;  // Callback when point is highlighted
  onClearHighlight?: () => void;      // Callback when highlight is cleared
}
```

**Returns:**

```typescript
{
  isPointHighlighted: (dataPoint, index?) => boolean;
  highlightPoint: (dataPoint, dataKey?, index?) => void;
  clearHighlight: () => void;
  clearAllHighlights: () => void;
  currentHighlight: DataPoint | undefined;
  highlightConfig: HighlightEffectConfig;
  isEnabled: boolean;
}
```

### HighlightEffectConfig

Configuration for visual highlight effects.

```typescript
{
  type: 'glow' | 'border' | 'scale' | 'pulse' | 'combined';
  color?: string;           // Highlight color (default: '#2563eb')
  intensity?: number;       // Effect intensity 0-1 (default: 0.8)
  duration?: number;        // Animation duration in ms (default: 300)
  glowSize?: number;        // Glow effect size in pixels (default: 8)
  borderWidth?: number;     // Border width in pixels (default: 3)
  scaleAmount?: number;     // Scale multiplier (default: 1.3)
}
```

### HighlightRelationship

Defines how charts are connected for synchronized highlighting.

```typescript
{
  sourceChartId: string;    // ID of the source chart
  targetChartId: string;    // ID of the target chart
  matchKey: string;         // Key to match between charts (e.g., 'date', 'category')
}
```

## Visual Effects

### Available Effect Types

1. **Glow**: Drop shadow effect around the element
2. **Border**: Outline around the element
3. **Scale**: Increases element size
4. **Pulse**: Animated pulsing effect
5. **Combined**: Glow + scale (recommended)

### Custom Effects

```tsx
const customConfig: HighlightEffectConfig = {
  type: 'combined',
  color: '#f59e0b',
  intensity: 0.9,
  duration: 400,
  glowSize: 12,
  scaleAmount: 1.5,
};

const { highlightConfig } = useChartHighlight({
  chartId: 'my-chart',
  highlightConfig: customConfig,
});
```

## Chart Relationships

### Defining Relationships

Relationships define how highlights propagate between charts.

```tsx
const relationships = [
  // Bidirectional: line chart ↔ bar chart
  { sourceChartId: 'line-chart', targetChartId: 'bar-chart', matchKey: 'date' },
  { sourceChartId: 'bar-chart', targetChartId: 'line-chart', matchKey: 'date' },
  
  // One-way: scatter plot → heatmap
  { sourceChartId: 'scatter', targetChartId: 'heatmap', matchKey: 'category' },
];
```

### Auto-Sync by Key

Automatically sync all charts that share a common key:

```tsx
<CrossChartHighlightProvider autoSyncByKey="date">
  {/* All charts with 'date' field will be synchronized */}
</CrossChartHighlightProvider>
```

## Custom Components

### HighlightDot

Custom dot component for line and scatter charts.

```tsx
<Line
  dataKey="value"
  dot={(props) => (
    <HighlightDot
      {...props}
      isHighlighted={isPointHighlighted(props.payload, props.index)}
      config={highlightConfig}
    />
  )}
/>
```

### HighlightBar

Custom bar component for bar charts.

```tsx
<Bar
  dataKey="value"
  shape={(props) => (
    <HighlightBar
      {...props}
      isHighlighted={isPointHighlighted(props.payload, props.index)}
      config={highlightConfig}
    />
  )}
/>
```

## Advanced Usage

### Programmatic Highlighting

```tsx
function MyComponent() {
  const { highlightPoint, clearAllHighlights } = useCrossChartHighlight();

  const highlightSpecificPoint = () => {
    highlightPoint('chart-1', { date: '2024-01', value: 100 }, 'value', 0);
  };

  return (
    <button onClick={highlightSpecificPoint}>
      Highlight January Data
    </button>
  );
}
```

### Batch Highlighting

```tsx
import { useBatchHighlight } from '@/components/charts/interactions/useChartHighlight';

function MyComponent() {
  const { highlightMultiple } = useBatchHighlight();

  const highlightRelatedPoints = () => {
    highlightMultiple([
      { chartId: 'chart-1', dataPoint: { date: '2024-01' }, index: 0 },
      { chartId: 'chart-2', dataPoint: { date: '2024-01' }, index: 0 },
      { chartId: 'chart-3', dataPoint: { date: '2024-01' }, index: 0 },
    ]);
  };

  return <button onClick={highlightRelatedPoints}>Highlight All</button>;
}
```

### Custom Highlight Logic

```tsx
const { isPointHighlighted, highlightPoint } = useChartHighlight({
  chartId: 'my-chart',
  onHighlight: (dataPoint) => {
    console.log('Point highlighted:', dataPoint);
    // Custom logic here
  },
  onClearHighlight: () => {
    console.log('Highlight cleared');
    // Custom logic here
  },
});
```

## Integration with Existing Charts

### Line Chart

```tsx
import { useChartHighlight } from '@/components/charts/interactions/useChartHighlight';
import { HighlightDot } from '@/components/charts/interactions/HighlightEffects';

function EnhancedLineChart({ chartId, data }) {
  const { isPointHighlighted, highlightPoint, clearHighlight, highlightConfig } =
    useChartHighlight({ chartId });

  return (
    <ResponsiveContainer>
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
            onClick: (e, payload) => highlightPoint(payload.payload, 'value', payload.index)
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Bar Chart

```tsx
import { useChartHighlight } from '@/components/charts/interactions/useChartHighlight';
import { HighlightBar } from '@/components/charts/interactions/HighlightEffects';

function EnhancedBarChart({ chartId, data }) {
  const { isPointHighlighted, highlightPoint, clearHighlight, highlightConfig } =
    useChartHighlight({ chartId });

  return (
    <ResponsiveContainer>
      <BarChart data={data} onMouseLeave={clearHighlight}>
        <Bar
          dataKey="value"
          shape={(props) => (
            <HighlightBar
              {...props}
              isHighlighted={isPointHighlighted(props.payload, props.index)}
              config={highlightConfig}
            />
          )}
          onClick={(data, index) => highlightPoint(data, 'value', index)}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## Performance Considerations

### Optimization Tips

1. **Use Index Matching**: When possible, use index-based matching for better performance
2. **Limit Relationships**: Only define necessary relationships between charts
3. **Debounce Hover**: For hover-based highlighting, consider debouncing
4. **Memoize Callbacks**: Use `useCallback` for highlight handlers

### Example with Debouncing

```tsx
import { useMemo } from 'react';
import { debounce } from 'lodash';

function MyChart({ chartId, data }) {
  const { highlightPoint } = useChartHighlight({ chartId });

  const debouncedHighlight = useMemo(
    () => debounce(highlightPoint, 150),
    [highlightPoint]
  );

  return (
    <LineChart
      data={data}
      onMouseMove={(e) => {
        if (e.activePayload?.[0]) {
          debouncedHighlight(e.activePayload[0].payload, 'value');
        }
      }}
    >
      {/* ... */}
    </LineChart>
  );
}
```

## Troubleshooting

### Highlights Not Appearing

1. Ensure `CrossChartHighlightProvider` wraps all charts
2. Check that `chartId` is unique for each chart
3. Verify relationships are correctly defined
4. Check that `isPointHighlighted` is called with correct parameters

### Highlights Not Synchronizing

1. Verify `matchKey` exists in both charts' data
2. Check that relationships are bidirectional if needed
3. Ensure data values match exactly (type and value)

### Performance Issues

1. Reduce number of relationships
2. Use index-based matching instead of value matching
3. Implement debouncing for hover interactions
4. Consider disabling highlighting for charts with >1000 points

## Examples

See `CrossChartHighlightExample.tsx` for a complete working example with:
- Line chart with highlighting
- Bar chart with highlighting
- Synchronized highlighting between charts
- Control panel for managing highlights

## Requirements Satisfied

This implementation satisfies **Requirement 3.5**:

> WHEN a user selects a data point, THE Chart_Engine SHALL highlight related data points across all charts in the story

Features implemented:
- ✅ Data point selection event system
- ✅ Highlight state management across all charts
- ✅ Visual highlight effects (glow, border, size increase)
- ✅ Highlight synchronization based on data relationships
- ✅ Clear highlights functionality

## Future Enhancements

Potential improvements for future versions:

1. **Hover-based highlighting**: Highlight on hover instead of click
2. **Multi-select**: Highlight multiple points simultaneously
3. **Highlight persistence**: Save highlight state across sessions
4. **Animation sequences**: Animate highlights in sequence
5. **Custom matchers**: More flexible matching logic beyond simple key equality
6. **Highlight groups**: Group related highlights together
7. **Keyboard navigation**: Navigate highlights with keyboard
8. **Accessibility**: Enhanced screen reader support for highlights

## Support

For issues or questions about the cross-chart highlighting system, please refer to:
- This documentation
- Example implementation in `CrossChartHighlightExample.tsx`
- Type definitions in `types/chart.ts`
