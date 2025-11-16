# StoryViewer Component - Usage Guide

## Overview
The updated StoryViewer component is a comprehensive data story presentation system with advanced features including insight panels, keyboard navigation, cross-chart highlighting, and support for all chart types.

## Basic Usage

```typescript
import StoryViewer from '@/components/StoryViewer';
import type { Insight } from '@/types/chart';

function StoryPage({ story }) {
  return (
    <StoryViewer
      storyId={story._id}
      storyTitle={story.title}
      narratives={story.narratives}
      charts={story.charts}
      insights={story.statistics?.insights || []}
      userTier={user.tier}
    />
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `storyId` | `string` | Unique identifier for the story |
| `narratives` | `Narratives` | Story narratives (summary, keyFindings, recommendations) |
| `charts` | `Chart[]` | Array of chart objects to display |
| `userTier` | `'free' \| 'professional' \| 'business' \| 'enterprise'` | User's subscription tier |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `storyTitle` | `string` | `'Data Story'` | Title displayed in header |
| `insights` | `Insight[]` | `[]` | AI-generated insights to display |

## Chart Object Structure

```typescript
interface Chart {
  chartId: string;
  type: AllChartTypes; // 'line' | 'bar' | 'scatter' | 'pie' | 'combination' | 'heatmap' | etc.
  title: string;
  data: ChartData;
  config: {
    xAxis?: string;
    yAxis?: string;
    nameKey?: string;
    valueKey?: string;
    colors?: string[];
    legend?: boolean;
    orientation?: 'horizontal' | 'vertical';
    trendLine?: boolean;
  };
  statistics?: StatisticalOverlay;
  interactions?: InteractionConfig;
  insights?: {
    primary: string;
    secondary?: string;
    significance: number;
  };
}
```

## Insight Object Structure

```typescript
interface Insight {
  type: 'trend' | 'correlation' | 'outlier' | 'distribution' | 'seasonality' | 'anomaly' | 'inflection';
  title: string;
  description: string;
  significance: number; // 0-1 scale
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
  relatedChartId?: string;
}
```

## Features

### 1. Insight Panel
- Automatically displays when `insights` prop contains data
- Toggle visibility with button in header or 'i' keyboard shortcut
- Click on insights to jump to related charts
- Sort by significance, impact, or type
- Filter by insight type
- Export insights as JSON

### 2. Keyboard Navigation
- **↑/↓ Arrow Keys**: Navigate between charts sequentially
- **I Key**: Toggle insights panel visibility
- **H Key**: Jump to top of page
- Keyboard shortcuts hint panel in bottom-right corner

### 3. Chart Types Supported

#### Currently Rendered
- Line Chart
- Bar Chart
- Scatter Plot
- Pie Chart

#### Ready for Backend Data (Placeholders)
- Combination Chart
- Heatmap
- Box Plot
- Waterfall Chart
- Funnel Chart
- Radar Chart
- Area Chart
- Candlestick Chart

### 4. Aggregation Controls
- Automatically shown for time-series data
- Levels: Daily, Weekly, Monthly, Quarterly, Yearly
- Comparison types: None, YoY, MoM, QoQ
- Applies to line and bar charts

### 5. Performance Optimizations
- Lazy loading for charts (viewport-based)
- Data sampling for large datasets (>1000 points)
- Skeleton loaders during loading
- Memoized calculations
- Cross-chart highlight synchronization

### 6. Responsive Design
- Mobile-optimized layout (< 768px)
- Tablet layout (768px - 1024px)
- Desktop layout (> 1024px)
- Dynamic column count for chart grids
- Touch-friendly controls (44x44px minimum)

### 7. Accessibility
- Full keyboard navigation support
- ARIA labels on all interactive elements
- Screen reader announcements
- Focus indicators
- Semantic HTML structure

## Advanced Usage

### With Custom Insights

```typescript
const customInsights: Insight[] = [
  {
    type: 'trend',
    title: 'Strong Upward Trend',
    description: 'Sales have increased by 45% over the past quarter',
    significance: 0.95,
    impact: 'high',
    recommendation: 'Consider increasing inventory to meet demand',
    relatedChartId: 'chart-1'
  },
  {
    type: 'correlation',
    title: 'Marketing Spend Correlation',
    description: 'Strong positive correlation (r=0.82) between marketing spend and revenue',
    significance: 0.82,
    impact: 'high',
    relatedChartId: 'chart-2'
  }
];

<StoryViewer
  {...props}
  insights={customInsights}
/>
```

### With Advanced Chart Types (Future)

When backend provides proper data structures:

```typescript
const advancedChart: Chart = {
  chartId: 'heatmap-1',
  type: 'heatmap',
  title: 'Correlation Matrix',
  data: correlationMatrixData, // Properly formatted for heatmap
  config: {
    colorScale: 'diverging',
    minValue: -1,
    maxValue: 1,
  }
};
```

### Programmatic Chart Navigation

```typescript
// Jump to specific chart
const chartElement = document.querySelector('[data-chart-id="chart-1"]');
if (chartElement) {
  chartElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
```

## Styling Customization

The component uses Tailwind CSS classes. Key customization points:

```typescript
// Header background
className="bg-[#0A0A0A]"

// Chart card background
className="bg-[#0A0A0A] border border-secondary/50"

// Primary color (buttons, highlights)
className="bg-primary"

// Text colors
className="text-white"
className="text-gray-400"
```

## Event Handling

### PDF Export
```typescript
// Triggered by export button
// Automatically handled by usePDFExport hook
// Shows loading state during export
```

### Chart Jump from Insights
```typescript
// Automatically handled
// Scrolls to chart and highlights it for 2 seconds
// Visual feedback with ring animation
```

### Aggregation Changes
```typescript
// Automatically updates all time-series charts
// Maintains state across component
```

## Performance Considerations

### Large Datasets
- Charts with >1000 points are automatically sampled
- Lazy loading reduces initial render time
- Virtualization for chart lists

### Many Charts
- Only visible charts are fully rendered
- Skeleton loaders for off-screen charts
- Intersection observer for viewport detection

### Mobile Devices
- Simplified tooltips
- Reduced animations
- Optimized touch targets
- Collapsible legends

## Troubleshooting

### Charts Not Rendering
- Check that `data` array is not empty
- Verify `type` matches supported chart types
- Check browser console for errors

### Insights Not Showing
- Ensure `insights` prop is provided
- Check that insights array is not empty
- Verify `relatedChartId` matches actual chart IDs

### Keyboard Navigation Not Working
- Check that component is mounted
- Ensure no other keyboard event handlers are blocking
- Verify focus is not trapped in another element

### Performance Issues
- Reduce number of charts per page
- Enable data sampling for large datasets
- Check for memory leaks in chart components

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch gestures

## Future Enhancements

1. **Chart Comparison Mode**: Side-by-side comparison
2. **Annotation Tools**: User-added annotations
3. **Custom Themes**: User-selectable color schemes
4. **Chart Bookmarks**: Save favorite charts
5. **Collaborative Features**: Share insights with team

## Related Components

- `InsightPanel` - Displays and manages insights
- `AggregationControls` - Time-series aggregation controls
- `LazyChart` - Performance-optimized chart wrapper
- `CrossChartHighlightProvider` - Synchronized highlighting

## API Integration

### Fetching Story Data

```typescript
async function getStory(storyId: string) {
  const response = await fetch(`/api/stories/${storyId}`);
  const story = await response.json();
  
  return {
    ...story,
    insights: story.statistics?.insights || []
  };
}
```

### Updating Insights

```typescript
async function regenerateInsights(storyId: string) {
  const response = await fetch(`/api/stories/${storyId}/insights`, {
    method: 'POST'
  });
  const { insights } = await response.json();
  return insights;
}
```

## Testing

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import StoryViewer from '@/components/StoryViewer';

test('renders story title', () => {
  render(<StoryViewer {...mockProps} storyTitle="Test Story" />);
  expect(screen.getByText('Test Story')).toBeInTheDocument();
});

test('shows insights panel when insights provided', () => {
  render(<StoryViewer {...mockProps} insights={mockInsights} />);
  expect(screen.getByText('Key Insights')).toBeInTheDocument();
});
```

### Integration Tests
```typescript
test('keyboard navigation works', async () => {
  render(<StoryViewer {...mockProps} />);
  
  // Press down arrow
  fireEvent.keyDown(window, { key: 'ArrowDown' });
  
  // Check that first chart is focused
  expect(screen.getByLabelText(/Chart:/)).toHaveFocus();
});
```

## Support

For issues or questions:
1. Check this usage guide
2. Review implementation summary document
3. Check component source code comments
4. Consult design document for architecture details
