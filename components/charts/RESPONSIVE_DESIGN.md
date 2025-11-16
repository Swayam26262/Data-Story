# Responsive Design Implementation Guide

This document describes the responsive design system implemented for all chart components in DataStory.

## Overview

The responsive design system ensures that all charts work seamlessly across desktop, tablet, and mobile devices with appropriate adjustments for:
- Font sizes and spacing
- Touch target sizes (minimum 44x44 pixels)
- Tooltip simplification on mobile
- Collapsible legends for small screens
- Touch gesture support (pinch-to-zoom, swipe-to-pan)
- Vertical stacking of controls on mobile
- Aspect ratio maintenance

## Breakpoints

```typescript
const BREAKPOINTS = {
  mobile: 768px,   // < 768px
  tablet: 1024px,  // 768px - 1024px
  desktop: 1280px, // >= 1024px
};
```

## Core Components

### 1. useResponsiveChart Hook

Located in `lib/hooks/useResponsiveChart.ts`

Provides responsive configuration based on screen size:

```typescript
const responsive = useResponsiveChart();

// Access responsive properties
responsive.isMobile      // boolean
responsive.isTablet      // boolean
responsive.isDesktop     // boolean
responsive.fontSize      // { title, subtitle, axisLabel, dataLabel, tooltip, legend }
responsive.spacing       // { chartPadding, titleMargin, legendSpacing }
responsive.interactions  // { touchTargetSize, tooltipSimplified, legendCollapsible, controlsStacked }
responsive.layout        // { minHeight, legendPosition, axisLabelAngle, showDataLabels, columns }
```

### 2. ResponsiveChartWrapper

Located in `components/charts/ResponsiveChartWrapper.tsx`

Wraps chart components with responsive behavior and touch gesture support:

```typescript
<ResponsiveChartWrapper
  title="My Chart"
  onPinchZoom={(scale) => handleZoom(scale)}
  onSwipePan={(deltaX, deltaY) => handlePan(deltaX, deltaY)}
  enableTouchGestures={true}
>
  {/* Chart content */}
</ResponsiveChartWrapper>
```

### 3. ResponsiveTooltip

Located in `components/charts/interactions/ResponsiveTooltip.tsx`

Automatically simplifies tooltips on mobile devices:

```typescript
<ResponsiveTooltip
  active={active}
  payload={payload}
  label={label}
  metrics={[
    { label: 'Sales', value: 1000, color: '#3b82f6' }
  ]}
  statistics={{
    percentOfTotal: 25.5,
    rank: 3,
    comparisonToAverage: 12.3
  }}
/>
```

**Mobile**: Shows only essential metrics (max 2) and percentage
**Desktop**: Shows all metrics, rank, and comparison to average

### 4. ResponsiveLegend

Located in `components/charts/interactions/ResponsiveLegend.tsx`

Provides collapsible legends for mobile:

```typescript
<ResponsiveLegend
  items={[
    { name: 'Series 1', color: '#3b82f6', visible: true },
    { name: 'Series 2', color: '#10b981', visible: true }
  ]}
  onToggle={(name) => handleToggle(name)}
  interactive={true}
/>
```

**Mobile**: Collapses to show first 3 items with "Show More" button
**Desktop**: Shows all items in full

### 5. ResponsiveControls

Located in `components/charts/interactions/ResponsiveControls.tsx`

Provides touch-friendly controls:

```typescript
<ResponsiveControls
  onZoomIn={handleZoomIn}
  onZoomOut={handleZoomOut}
  onReset={handleReset}
  zoomDisabled={{ in: false, out: false }}
/>
```

**Mobile**: Shows icon-only buttons, stacks vertically
**Desktop**: Shows text labels, arranges horizontally

## Responsive Utilities

Located in `lib/utils/responsive-chart-utils.ts`

Helper functions for common responsive patterns:

```typescript
import {
  getResponsiveMargin,
  getResponsiveAxisConfig,
  getResponsiveLegendConfig,
  getResponsiveTitleStyle,
  createTooltipMetrics,
  shouldShowDataLabels,
  getResponsiveDotSize,
  getResponsiveStrokeWidth,
} from '@/lib/utils/responsive-chart-utils';

// Use in chart components
const margin = getResponsiveMargin(responsive, { extraBottom: 20 });
const axisConfig = getResponsiveAxisConfig(responsive, theme, 'x');
const showLabels = shouldShowDataLabels(responsive, dataCount);
```

## Touch Gesture Support

The `useTouchGestures` hook provides pinch-to-zoom and swipe-to-pan:

```typescript
import { useTouchGestures } from '@/lib/hooks/useResponsiveChart';

useTouchGestures(
  (scale) => {
    // Handle pinch zoom
    setZoomLevel(prev => prev * scale);
  },
  (deltaX, deltaY) => {
    // Handle swipe pan
    setPanOffset({ x: deltaX, y: deltaY });
  }
);
```

## Updating Existing Charts

To make an existing chart responsive:

### 1. Add imports

```typescript
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';
import { ResponsiveTooltip } from './interactions/ResponsiveTooltip';
import { ResponsiveLegend } from './interactions/ResponsiveLegend';
import { ResponsiveControls } from './interactions/ResponsiveControls';
import { ResponsiveChartWrapper } from './ResponsiveChartWrapper';
import {
  getResponsiveMargin,
  getResponsiveAxisConfig,
  createTooltipMetrics,
} from '@/lib/utils/responsive-chart-utils';
```

### 2. Get responsive config

```typescript
const responsive = useResponsiveChart();
```

### 3. Wrap component

```typescript
return (
  <ResponsiveChartWrapper title={title}>
    {/* Controls */}
    <ResponsiveControls ... />
    
    {/* Legend */}
    <ResponsiveLegend ... />
    
    {/* Chart */}
    <ResponsiveContainer minHeight={responsive.layout.minHeight}>
      {/* ... */}
    </ResponsiveContainer>
  </ResponsiveChartWrapper>
);
```

### 4. Update chart configuration

```typescript
<RechartsLineChart
  margin={getResponsiveMargin(responsive)}
>
  <XAxis {...getResponsiveAxisConfig(responsive, theme, 'x')} />
  <YAxis {...getResponsiveAxisConfig(responsive, theme, 'y')} />
  <Tooltip content={<ResponsiveTooltip ... />} />
  <Legend {...getResponsiveLegendConfig(responsive)} />
</RechartsLineChart>
```

## Accessibility Features

All responsive components include accessibility features:

- **ARIA labels**: All interactive elements have proper labels
- **Keyboard navigation**: Full keyboard support with visible focus indicators
- **Touch targets**: Minimum 44x44 pixels (WCAG 2.1 Level AAA)
- **Screen reader support**: Descriptive text for all visual elements
- **Focus management**: Clear focus indicators and logical tab order

## Testing Responsive Behavior

### Manual Testing

1. **Desktop** (>= 1024px): Full features, horizontal layouts
2. **Tablet** (768px - 1024px): Adjusted spacing, 2-column grids
3. **Mobile** (< 768px): Simplified tooltips, vertical stacking, collapsible legends

### Browser DevTools

Use responsive design mode to test different screen sizes:
- Chrome: Ctrl+Shift+M (Windows) / Cmd+Shift+M (Mac)
- Firefox: Ctrl+Shift+M (Windows) / Cmd+Shift+M (Mac)

### Touch Gesture Testing

Test on actual touch devices or use browser touch emulation:
- Pinch-to-zoom: Two-finger pinch gesture
- Swipe-to-pan: Single-finger swipe gesture

## Performance Considerations

- **Debouncing**: Resize events are debounced to prevent excessive re-renders
- **Memoization**: Responsive config is memoized to avoid recalculation
- **Lazy loading**: Charts load as they enter viewport
- **Data sampling**: Large datasets are sampled on mobile for better performance

## Best Practices

1. **Always use ResponsiveChartWrapper** for consistent behavior
2. **Test on real devices** when possible, not just emulators
3. **Simplify mobile tooltips** to essential information only
4. **Use touch-friendly controls** with minimum 44x44px targets
5. **Maintain aspect ratios** across all screen sizes
6. **Provide visual feedback** for all interactions
7. **Consider data density** - show less on mobile if needed

## Examples

See the following components for complete implementations:
- `components/charts/LineChart.tsx`
- `components/charts/BarChart.tsx`
- `components/charts/ScatterPlot.tsx`
- `components/charts/PieChart.tsx`

## Future Enhancements

- [ ] Orientation change handling (portrait/landscape)
- [ ] Progressive enhancement for older browsers
- [ ] Adaptive chart type selection based on screen size
- [ ] Gesture customization options
- [ ] Performance monitoring for mobile devices
