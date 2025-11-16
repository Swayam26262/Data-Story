# Responsive Chart System

Complete responsive design system for DataStory charts, ensuring seamless functionality across all device sizes.

## Quick Start

```typescript
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';
import { ResponsiveChartWrapper } from '@/components/charts/ResponsiveChartWrapper';
import { ResponsiveTooltip, ResponsiveLegend, ResponsiveControls } from '@/components/charts/interactions';

function MyChart({ data, title }) {
  const responsive = useResponsiveChart();
  
  return (
    <ResponsiveChartWrapper title={title}>
      <ResponsiveControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />
      <ResponsiveLegend items={legendItems} interactive />
      <ResponsiveContainer minHeight={responsive.layout.minHeight}>
        {/* Your chart */}
      </ResponsiveContainer>
    </ResponsiveChartWrapper>
  );
}
```

## System Architecture

```
lib/hooks/
  └── useResponsiveChart.ts          # Core responsive hook
  
lib/utils/
  └── responsive-chart-utils.ts      # Helper utilities

components/charts/
  ├── ResponsiveChartWrapper.tsx     # Main wrapper component
  └── interactions/
      ├── ResponsiveTooltip.tsx      # Adaptive tooltips
      ├── ResponsiveLegend.tsx       # Collapsible legends
      └── ResponsiveControls.tsx     # Touch-friendly controls
```

## Breakpoints

| Device  | Width Range | Columns | Font Scale | Touch Targets |
|---------|-------------|---------|------------|---------------|
| Mobile  | < 768px     | 1       | 0.85x      | 44x44px       |
| Tablet  | 768-1024px  | 2       | 0.95x      | 44x44px       |
| Desktop | >= 1024px   | 3       | 1.0x       | Auto          |

## Features

### 1. Responsive Configuration

The `useResponsiveChart` hook provides:

```typescript
{
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  fontSize: {
    title: number;
    subtitle: number;
    axisLabel: number;
    dataLabel: number;
    tooltip: number;
    legend: number;
  };
  spacing: {
    chartPadding: { top, right, bottom, left };
    titleMargin: number;
    legendSpacing: number;
  };
  interactions: {
    touchTargetSize: number;
    tooltipSimplified: boolean;
    legendCollapsible: boolean;
    controlsStacked: boolean;
  };
  layout: {
    minHeight: number;
    legendPosition: 'bottom' | 'right' | 'top';
    axisLabelAngle: number;
    showDataLabels: boolean;
    columns: number;
  };
}
```

### 2. Touch Gestures

```typescript
import { useTouchGestures } from '@/lib/hooks/useResponsiveChart';

useTouchGestures(
  (scale) => {
    // Pinch-to-zoom: scale is relative to initial distance
    setZoomLevel(prev => prev * scale);
  },
  (deltaX, deltaY) => {
    // Swipe-to-pan: delta in pixels
    setPanOffset({ x: deltaX, y: deltaY });
  }
);
```

### 3. Responsive Tooltips

**Desktop**: Full information with statistics
```
┌─────────────────────────┐
│ January                 │
│ Sales: 4,000           │
│ % of Total: 25.5%      │
│ Rank: #3               │
│ vs. Average: +12.3%    │
└─────────────────────────┘
```

**Mobile**: Essential information only
```
┌──────────────┐
│ January      │
│ Sales: 4,000 │
│ % Total: 26% │
└──────────────┘
```

### 4. Collapsible Legends

**Desktop**: All items visible
```
[●] Series 1  [●] Series 2  [●] Series 3  [●] Series 4  [●] Series 5
```

**Mobile**: First 3 items + expand button
```
[●] Series 1  [●] Series 2  [●] Series 3  [+3 More ▼]
```

### 5. Touch-Friendly Controls

**Desktop**: Text labels, horizontal layout
```
[Zoom In] [Zoom Out] [Reset]
```

**Mobile**: Icons only, vertical stack
```
[🔍+]
[🔍-]
[↻]
```

## Utility Functions

### Margin Configuration

```typescript
import { getResponsiveMargin } from '@/lib/utils/responsive-chart-utils';

const margin = getResponsiveMargin(responsive, {
  extraBottom: 20,  // Add extra space for rotated labels
  extraLeft: 40,    // Add extra space for long axis labels
});
```

### Axis Configuration

```typescript
import { getResponsiveAxisConfig } from '@/lib/utils/responsive-chart-utils';

const xAxisConfig = getResponsiveAxisConfig(responsive, theme, 'x');
const yAxisConfig = getResponsiveAxisConfig(responsive, theme, 'y');
```

### Conditional Data Labels

```typescript
import { shouldShowDataLabels } from '@/lib/utils/responsive-chart-utils';

const showLabels = shouldShowDataLabels(responsive, dataCount);
```

### Responsive Sizing

```typescript
import { getResponsiveDotSize, getResponsiveStrokeWidth } from '@/lib/utils/responsive-chart-utils';

const dotSize = getResponsiveDotSize(responsive, isActive);
const strokeWidth = getResponsiveStrokeWidth(responsive, 2);
```

## Accessibility

All responsive components include:

- ✅ **ARIA labels** on all interactive elements
- ✅ **Keyboard navigation** with visible focus indicators
- ✅ **Touch targets** meeting WCAG 2.1 Level AAA (44x44px)
- ✅ **Screen reader support** with descriptive text
- ✅ **Color contrast** maintained across all sizes

## Testing

### Browser DevTools

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - Mobile: 375x667 (iPhone SE)
   - Tablet: 768x1024 (iPad)
   - Desktop: 1920x1080

### Real Device Testing

Test on actual devices for:
- Touch gesture accuracy
- Performance on mobile hardware
- Font readability
- Touch target accessibility

## Performance

The responsive system is optimized for:

- **Debounced resize events**: Prevents excessive re-renders
- **Memoized configuration**: Cached until screen size changes
- **Efficient re-renders**: Only affected components update
- **Minimal bundle size**: ~15KB gzipped

## Migration Guide

### Updating Existing Charts

1. **Add imports**:
```typescript
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';
import { ResponsiveChartWrapper } from '@/components/charts/ResponsiveChartWrapper';
import { getResponsiveMargin, getResponsiveAxisConfig } from '@/lib/utils/responsive-chart-utils';
```

2. **Get responsive config**:
```typescript
const responsive = useResponsiveChart();
```

3. **Wrap component**:
```typescript
return (
  <ResponsiveChartWrapper title={title}>
    {/* Chart content */}
  </ResponsiveChartWrapper>
);
```

4. **Update chart props**:
```typescript
<RechartsLineChart
  margin={getResponsiveMargin(responsive)}
>
  <XAxis {...getResponsiveAxisConfig(responsive, theme, 'x')} />
  <YAxis {...getResponsiveAxisConfig(responsive, theme, 'y')} />
</RechartsLineChart>
```

## Examples

See complete implementations in:
- `components/charts/LineChart.tsx`
- `components/charts/BarChart.tsx`
- `components/charts/ScatterPlot.tsx`
- `components/charts/PieChart.tsx`
- `components/charts/ResponsiveChartDemo.tsx`

## Troubleshooting

### Charts not resizing

Ensure the parent container has a defined width:
```css
.chart-container {
  width: 100%;
  max-width: 1200px;
}
```

### Touch gestures not working

Check that `touchAction` is set correctly:
```typescript
<div style={{ touchAction: 'none' }}>
  {/* Chart */}
</div>
```

### Tooltips cut off on mobile

Use the `ResponsiveTooltip` component which handles positioning automatically.

### Legend items too small on mobile

The `ResponsiveLegend` component automatically adjusts touch target sizes.

## Best Practices

1. **Always use ResponsiveChartWrapper** for consistent behavior
2. **Test on real devices** when possible
3. **Simplify mobile tooltips** to essential information
4. **Use touch-friendly controls** with 44x44px minimum
5. **Maintain aspect ratios** across all screen sizes
6. **Provide visual feedback** for all interactions
7. **Consider data density** - show less on mobile if needed

## Support

For issues or questions:
- See [RESPONSIVE_DESIGN.md](../RESPONSIVE_DESIGN.md) for detailed documentation
- Check [ResponsiveChartDemo.tsx](../ResponsiveChartDemo.tsx) for interactive examples
- Review existing chart implementations for patterns

## Future Enhancements

- [ ] Orientation change handling
- [ ] Progressive enhancement for older browsers
- [ ] Adaptive chart type selection
- [ ] Gesture customization options
- [ ] Performance monitoring
