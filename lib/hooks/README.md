# React Hooks

This directory contains custom React hooks used throughout the DataStory application.

## Available Hooks

### `useResponsiveChart`

Provides responsive configuration for chart components based on screen size.

**Location**: `lib/hooks/useResponsiveChart.ts`

**Usage**:
```typescript
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';

function MyComponent() {
  const responsive = useResponsiveChart();
  
  // Access responsive properties
  console.log(responsive.isMobile);      // boolean
  console.log(responsive.fontSize);      // { title, subtitle, axisLabel, ... }
  console.log(responsive.spacing);       // { chartPadding, titleMargin, ... }
  console.log(responsive.interactions);  // { touchTargetSize, tooltipSimplified, ... }
  console.log(responsive.layout);        // { minHeight, legendPosition, ... }
}
```

**Returns**: `ResponsiveConfig` object with:
- `isMobile`, `isTablet`, `isDesktop`: Device type booleans
- `screenWidth`: Current screen width in pixels
- `fontSize`: Responsive font sizes for all text elements
- `spacing`: Responsive spacing and padding values
- `interactions`: Touch interaction settings
- `layout`: Layout configuration (heights, positions, angles)

### `useTouchGestures`

Handles touch gestures for pinch-to-zoom and swipe-to-pan.

**Location**: `lib/hooks/useResponsiveChart.ts`

**Usage**:
```typescript
import { useTouchGestures } from '@/lib/hooks/useResponsiveChart';

function MyComponent() {
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
}
```

**Parameters**:
- `onPinchZoom?: (scale: number) => void`: Callback for pinch zoom gestures
- `onSwipePan?: (deltaX: number, deltaY: number) => void`: Callback for swipe pan gestures

### `useAggregation`

Manages data aggregation state and transformations.

**Location**: `lib/hooks/useAggregation.ts`

**Usage**:
```typescript
import { useAggregation } from '@/lib/hooks/useAggregation';

function MyComponent({ data }) {
  const {
    aggregatedData,
    aggregationLevel,
    setAggregationLevel,
    availableLevels,
  } = useAggregation(data, 'date');
}
```

### `useChartExport`

Handles chart export functionality (PNG, SVG, CSV, JSON).

**Location**: `lib/hooks/useChartExport.ts`

**Usage**:
```typescript
import { useChartExport } from '@/lib/hooks/useChartExport';

function MyComponent() {
  const { exportChart, isExporting } = useChartExport();
  
  const handleExport = async () => {
    await exportChart({
      chartId: 'my-chart',
      format: 'png',
      options: { width: 1200, height: 600, dpi: 300 }
    });
  };
}
```

### `useLazyChart`

Implements lazy loading for charts based on viewport visibility.

**Location**: `lib/hooks/useLazyChart.ts`

**Usage**:
```typescript
import { useLazyChart } from '@/lib/hooks/useLazyChart';

function MyComponent() {
  const { ref, shouldRender, isInView } = useLazyChart({
    rootMargin: '200px',
    threshold: 0.1,
  });
  
  return (
    <div ref={ref}>
      {shouldRender ? <Chart /> : <ChartSkeleton />}
    </div>
  );
}
```

**Parameters**:
- `rootMargin?: string`: Margin around viewport for early loading (default: '200px')
- `threshold?: number`: Percentage of visibility to trigger loading (default: 0.1)
- `unloadOnExit?: boolean`: Whether to unload when leaving viewport (default: false)

**Returns**:
- `ref`: Ref to attach to chart container
- `shouldRender`: Whether chart should be rendered
- `isInView`: Whether chart is currently in viewport

## Creating New Hooks

When creating new hooks:

1. **File naming**: Use camelCase with `use` prefix (e.g., `useMyHook.ts`)
2. **Type safety**: Always provide TypeScript types for parameters and return values
3. **Documentation**: Include JSDoc comments explaining purpose and usage
4. **Dependencies**: List all dependencies in the dependency array
5. **Cleanup**: Return cleanup functions for effects when needed
6. **Testing**: Consider adding unit tests for complex hooks

## Best Practices

- Keep hooks focused on a single responsibility
- Use memoization (`useMemo`, `useCallback`) to optimize performance
- Provide sensible defaults for optional parameters
- Handle edge cases and error states
- Document any side effects
- Consider server-side rendering compatibility

## Related Documentation

- [Responsive Design Guide](../../components/charts/RESPONSIVE_DESIGN.md)
- [Chart Export Guide](../export/README.md)
- [Aggregation Guide](../../docs/aggregation-and-comparison.md)


### `useChartKeyboardNavigation`

Provides comprehensive keyboard navigation for chart components with focus management and screen reader announcements.

**Location**: `lib/hooks/useChartKeyboardNavigation.ts`

**Usage**:
```typescript
import { useChartKeyboardNavigation } from '@/lib/hooks/useChartKeyboardNavigation';

function MyChart({ data, chartId }) {
  const {
    focusedIndex,
    isKeyboardMode,
    isIndexFocused,
    setFocus,
    containerRef,
    containerProps,
  } = useChartKeyboardNavigation({
    dataLength: data.length,
    chartId: 'my-chart',
    onDataPointFocus: (index) => {
      console.log('Focused data point:', index);
    },
    onDataPointSelect: (index) => {
      console.log('Selected data point:', index);
    },
    enabled: true,
  });

  return (
    <div {...containerProps}>
      {data.map((point, index) => (
        <DataPoint
          key={index}
          data={point}
          isFocused={isIndexFocused(index)}
        />
      ))}
    </div>
  );
}
```

**Parameters**:
- `dataLength: number`: Number of data points in the chart
- `chartId: string`: Unique identifier for the chart
- `onDataPointFocus?: (index: number) => void`: Callback when a data point receives focus
- `onDataPointSelect?: (index: number) => void`: Callback when a data point is selected (Enter/Space)
- `enabled?: boolean`: Whether keyboard navigation is enabled (default: true)

**Returns**:
- `focusedIndex: number | null`: Index of currently focused data point
- `isKeyboardMode: boolean`: Whether user is navigating with keyboard
- `isIndexFocused: (index: number) => boolean`: Check if specific index is focused
- `setFocus: (index: number) => void`: Programmatically set focus to an index
- `containerRef: RefObject<HTMLDivElement>`: Ref for the chart container
- `containerProps: object`: Props to spread on chart container (includes event handlers, ARIA attributes)

**Keyboard Controls**:
- `Arrow Right/Down`: Navigate to next data point
- `Arrow Left/Up`: Navigate to previous data point
- `Home`: Jump to first data point
- `End`: Jump to last data point
- `Enter/Space`: Select current data point

**Accessibility Features**:
- Automatic ARIA labels for screen readers
- Focus management with visible indicators
- Screen reader announcements for navigation
- Keyboard trap prevention
- Mouse/keyboard mode detection
