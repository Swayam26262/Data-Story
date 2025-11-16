# Legend Controller

The Legend Controller provides interactive legend functionality for charts with series visibility toggling, hover effects, "show only" mode, mobile collapsible support, and cross-chart synchronization.

## Features

- ✅ **Click to Toggle**: Click legend items to show/hide series
- ✅ **Show Only Mode**: Ctrl/Cmd+Click to show only one series
- ✅ **Hover Effects**: Highlight series when hovering over legend items
- ✅ **Mobile Collapsible**: Collapse legend on mobile devices to save space
- ✅ **Cross-Chart Sync**: Synchronize legend state across multiple charts
- ✅ **Accessibility**: Full keyboard navigation and ARIA labels
- ✅ **Visual Feedback**: Smooth transitions and clear visual states

## Requirements Addressed

- **Requirement 3.2**: Interactive legend with click to toggle series visibility
- **Requirement 9.7**: Collapsible legend for mobile devices

## Installation

The Legend Controller is part of the chart interactions system. No additional installation required.

## Basic Usage

```tsx
import { LegendController, InteractiveLegend } from '@/components/charts/interactions/LegendController';

function MyChart() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const legendItems = [
    { dataKey: 'sales', name: 'Sales', color: '#2563eb' },
    { dataKey: 'revenue', name: 'Revenue', color: '#10b981' },
    { dataKey: 'profit', name: 'Profit', color: '#f59e0b' },
  ];

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  return (
    <LegendController
      items={legendItems}
      onVisibilityChange={handleVisibilityChange}
    >
      {(state, handlers) => (
        <div>
          {/* Your chart component */}
          <LineChart data={data}>
            {!hiddenSeries.has('sales') && <Line dataKey="sales" />}
            {!hiddenSeries.has('revenue') && <Line dataKey="revenue" />}
            {!hiddenSeries.has('profit') && <Line dataKey="profit" />}
          </LineChart>

          {/* Interactive legend */}
          <InteractiveLegend
            state={state}
            handlers={handlers}
            position="bottom"
          />
        </div>
      )}
    </LegendController>
  );
}
```

## API Reference

### LegendController

Main controller component that manages legend state.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `LegendItem[]` | Required | Array of legend items with dataKey, name, and color |
| `onVisibilityChange` | `(dataKey: string, visible: boolean) => void` | - | Callback when series visibility changes |
| `onShowOnly` | `(dataKey: string) => void` | - | Callback when "show only" is triggered |
| `onHoverChange` | `(dataKey: string \| null) => void` | - | Callback when hover state changes |
| `collapsible` | `boolean` | `false` | Enable collapsible legend for mobile |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state |
| `syncKey` | `string` | - | Key for synchronizing across charts |
| `className` | `string` | `''` | Additional CSS classes |

#### LegendItem Interface

```typescript
interface LegendItem {
  dataKey: string;  // Unique identifier for the series
  name: string;     // Display name
  color: string;    // Color for the series
}
```

#### Children Function

The controller uses a render prop pattern:

```typescript
children: (state: LegendState, handlers: LegendHandlers) => React.ReactNode
```

**LegendState:**
```typescript
interface LegendState {
  items: Map<string, LegendItemState>;
  collapsed: boolean;
}

interface LegendItemState {
  dataKey: string;
  name: string;
  color: string;
  visible: boolean;
  hovered: boolean;
}
```

**LegendHandlers:**
```typescript
interface LegendHandlers {
  toggleVisibility: (dataKey: string, modifierKey?: boolean) => void;
  showOnly: (dataKey: string) => void;
  showAll: () => void;
  hideAll: () => void;
  setHovered: (dataKey: string | null) => void;
  toggleCollapsed: () => void;
}
```

### InteractiveLegend

Pre-built legend component with all interactive features.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `LegendState` | Required | State from LegendController |
| `handlers` | `LegendHandlers` | Required | Handlers from LegendController |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Legend position |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout orientation |
| `collapsible` | `boolean` | `false` | Show collapse toggle |
| `className` | `string` | `''` | Additional CSS classes |

### useLegend Hook

Simplified hook for basic legend functionality.

```typescript
const {
  visibilityMap,
  toggleVisibility,
  isVisible,
  showOnly,
} = useLegend(items, onVisibilityChange);
```

## Usage Examples

### 1. Basic Interactive Legend

```tsx
<LegendController
  items={legendItems}
  onVisibilityChange={handleVisibilityChange}
>
  {(state, handlers) => (
    <div>
      <MyChart hiddenSeries={hiddenSeries} />
      <InteractiveLegend state={state} handlers={handlers} />
    </div>
  )}
</LegendController>
```

### 2. Collapsible Legend for Mobile

```tsx
<LegendController
  items={legendItems}
  onVisibilityChange={handleVisibilityChange}
  collapsible={true}
  defaultCollapsed={false}
>
  {(state, handlers) => (
    <div>
      <MyChart hiddenSeries={hiddenSeries} />
      <InteractiveLegend
        state={state}
        handlers={handlers}
        collapsible={true}
      />
    </div>
  )}
</LegendController>
```

### 3. Synchronized Legends Across Charts

```tsx
// Chart 1
<LegendController
  items={legendItems}
  onVisibilityChange={handleVisibilityChange}
  syncKey="my-dashboard"
>
  {(state, handlers) => (
    <div>
      <LineChart hiddenSeries={hiddenSeries} />
      <InteractiveLegend state={state} handlers={handlers} />
    </div>
  )}
</LegendController>

// Chart 2 (same syncKey)
<LegendController
  items={legendItems}
  onVisibilityChange={handleVisibilityChange}
  syncKey="my-dashboard"
>
  {(state, handlers) => (
    <div>
      <BarChart hiddenSeries={hiddenSeries} />
      <InteractiveLegend state={state} handlers={handlers} />
    </div>
  )}
</LegendController>
```

### 4. Hover Effects

```tsx
const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

<LegendController
  items={legendItems}
  onVisibilityChange={handleVisibilityChange}
  onHoverChange={setHoveredSeries}
>
  {(state, handlers) => (
    <div>
      <LineChart
        hiddenSeries={hiddenSeries}
        hoveredSeries={hoveredSeries}
      />
      <InteractiveLegend state={state} handlers={handlers} />
    </div>
  )}
</LegendController>
```

### 5. Custom Legend UI

```tsx
<LegendController items={legendItems} onVisibilityChange={handleVisibilityChange}>
  {(state, handlers) => (
    <div>
      <MyChart hiddenSeries={hiddenSeries} />
      
      {/* Custom legend UI */}
      <div className="flex gap-4">
        {Array.from(state.items.values()).map((item) => (
          <button
            key={item.dataKey}
            onClick={() => handlers.toggleVisibility(item.dataKey)}
            className={item.visible ? 'opacity-100' : 'opacity-50'}
          >
            <span style={{ color: item.color }}>●</span> {item.name}
          </button>
        ))}
      </div>
      
      {/* Control buttons */}
      <div className="flex gap-2 mt-2">
        <button onClick={handlers.showAll}>Show All</button>
        <button onClick={handlers.hideAll}>Hide All</button>
      </div>
    </div>
  )}
</LegendController>
```

### 6. Using the Hook

```tsx
function SimpleChart() {
  const { visibilityMap, toggleVisibility, isVisible, showOnly } = useLegend(
    legendItems,
    (dataKey, visible) => console.log(`${dataKey} is now ${visible}`)
  );

  return (
    <div>
      <LineChart>
        {isVisible('sales') && <Line dataKey="sales" />}
        {isVisible('revenue') && <Line dataKey="revenue" />}
      </LineChart>
      
      <div>
        {legendItems.map((item) => (
          <button
            key={item.dataKey}
            onClick={() => toggleVisibility(item.dataKey)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## User Interactions

### Click Behavior

- **Single Click**: Toggle visibility of the clicked series
- **Ctrl/Cmd + Click**: Show only the clicked series (hide all others)

### Keyboard Navigation

- **Tab**: Navigate between legend items
- **Enter/Space**: Toggle visibility of focused item
- **Ctrl/Cmd + Enter**: Show only focused item

### Mobile Behavior

- **Collapsible**: On mobile, legend can be collapsed to save space
- **Touch Targets**: Minimum 44x44px touch targets for accessibility
- **Responsive Layout**: Automatically adjusts layout for small screens

## Synchronization

The legend controller supports synchronization across multiple charts:

1. **Same Page**: Use the same `syncKey` for charts on the same page
2. **Cross-Tab**: Synchronization persists across browser tabs using localStorage
3. **Real-time**: Changes propagate immediately to all synchronized legends

```tsx
// All charts with syncKey="dashboard" will share legend state
<LegendController syncKey="dashboard" items={items}>
  {/* ... */}
</LegendController>
```

## Styling

The legend controller uses Tailwind CSS classes. You can customize the appearance:

```tsx
<InteractiveLegend
  state={state}
  handlers={handlers}
  className="bg-gray-50 p-4 rounded-lg"
/>
```

### CSS Classes

- `.legend-controller`: Main container
- `.legend-items`: Items container
- `.legend-item`: Individual legend item
- `.legend-color`: Color indicator
- `.legend-label`: Text label
- `.legend-toggle`: Collapse toggle button

## Accessibility

The legend controller is fully accessible:

- **ARIA Labels**: All interactive elements have proper labels
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Announces visibility state changes
- **Focus Indicators**: Clear visual focus indicators
- **Touch Targets**: Minimum 44x44px for mobile

## Performance

- **Optimized Rendering**: Uses React.memo and useCallback for performance
- **Efficient State**: Map-based state for O(1) lookups
- **Debounced Sync**: Synchronization is debounced to prevent excessive updates

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support with touch gestures

## Best Practices

1. **Provide Clear Labels**: Use descriptive names for legend items
2. **Use Distinct Colors**: Ensure colors are distinguishable
3. **Handle Empty State**: Show message when all series are hidden
4. **Sync Wisely**: Only sync related charts to avoid confusion
5. **Mobile First**: Test collapsible behavior on mobile devices
6. **Accessibility**: Always provide keyboard navigation

## Troubleshooting

### Legend not updating chart

Make sure you're properly handling the visibility state:

```tsx
const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

const handleVisibilityChange = (dataKey: string, visible: boolean) => {
  setHiddenSeries((prev) => {
    const updated = new Set(prev);
    if (visible) {
      updated.delete(dataKey);
    } else {
      updated.add(dataKey);
    }
    return updated;
  });
};
```

### Synchronization not working

1. Check that all charts use the same `syncKey`
2. Ensure localStorage is available
3. Check browser console for errors

### Mobile collapse not showing

The collapse toggle only shows on mobile (< 768px). Use the `md:hidden` class to test.

## Related Components

- [TooltipManager](./TOOLTIP_README.md) - Enhanced tooltips
- [ZoomPanController](./ZoomPanController.tsx) - Zoom and pan functionality
- [BrushSelectionTool](./BrushSelectionTool.tsx) - Brush selection

## Examples

See [LegendExamples.tsx](./LegendExamples.tsx) for complete working examples.
