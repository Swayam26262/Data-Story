# Legend Controller Visual Guide

## Interactive Features Overview

This visual guide demonstrates the interactive features of the Legend Controller.

## 1. Click to Toggle Visibility

```
┌─────────────────────────────────────────────────────────┐
│                     Chart Area                          │
│                                                         │
│  [Line 1: Sales - Visible]                             │
│  [Line 2: Revenue - Hidden]                            │
│  [Line 3: Profit - Visible]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘

Legend:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ● Sales  │  │ ⊘ Revenue│  │ ● Profit │
│ (100%)   │  │ (40%)    │  │ (100%)   │
└──────────┘  └──────────┘  └──────────┘
   Visible      Hidden        Visible
```

**Interaction**: Click any legend item to toggle its visibility.

## 2. Hover Effects

```
Before Hover:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ● Sales  │  │ ● Revenue│  │ ● Profit │
└──────────┘  └──────────┘  └──────────┘

During Hover (on Revenue):
┌──────────┐  ┌────────────┐  ┌──────────┐
│ ● Sales  │  │ ● Revenue  │  │ ● Profit │
│          │  │ [Highlight]│  │          │
│          │  │ Scale: 105%│  │          │
└──────────┘  └────────────┘  └──────────┘
                  ↑
              Background: gray-100
              Chart line: Thicker
```

**Interaction**: Hover over legend items to highlight the corresponding series.

## 3. Show Only Mode (Ctrl/Cmd + Click)

```
Before Ctrl+Click:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ● Sales  │  │ ● Revenue│  │ ● Profit │
└──────────┘  └──────────┘  └──────────┘
   Visible      Visible       Visible

After Ctrl+Click on Revenue:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ⊘ Sales  │  │ ● Revenue│  │ ⊘ Profit │
└──────────┘  └──────────┘  └──────────┘
   Hidden       Visible       Hidden
```

**Interaction**: Ctrl/Cmd + Click to show only one series and hide all others.

## 4. Mobile Collapsible Legend

```
Desktop View (> 768px):
┌─────────────────────────────────────────────────────────┐
│                     Chart Area                          │
└─────────────────────────────────────────────────────────┘

Legend (Always Visible):
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ● Sales  │  │ ● Revenue│  │ ● Profit │
└──────────┘  └──────────┘  └──────────┘


Mobile View (< 768px) - Expanded:
┌───────────────────────────────────┐
│         Chart Area                │
└───────────────────────────────────┘

Legend:
┌─────────────────────────────────┐
│ [▲ Collapse]                    │
│                                 │
│ ┌──────────┐  ┌──────────┐    │
│ │ ● Sales  │  │ ● Revenue│    │
│ └──────────┘  └──────────┘    │
│ ┌──────────┐                  │
│ │ ● Profit │                  │
│ └──────────┘                  │
└─────────────────────────────────┘


Mobile View (< 768px) - Collapsed:
┌───────────────────────────────────┐
│         Chart Area                │
└───────────────────────────────────┘

Legend:
┌─────────────────────────────────┐
│ [▼ Expand]                      │
└─────────────────────────────────┘
```

**Interaction**: Tap the toggle button to expand/collapse the legend on mobile.

## 5. Synchronized Legends Across Charts

```
Chart 1 (Line Chart):
┌─────────────────────────────────────────────────────────┐
│                   Line Chart                            │
│  [Sales: Visible] [Revenue: Hidden] [Profit: Visible]  │
└─────────────────────────────────────────────────────────┘
Legend: ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ ● Sales  │  │ ⊘ Revenue│  │ ● Profit │
        └──────────┘  └──────────┘  └──────────┘

                          ↕ Synchronized

Chart 2 (Bar Chart):
┌─────────────────────────────────────────────────────────┐
│                   Bar Chart                             │
│  [Sales: Visible] [Revenue: Hidden] [Profit: Visible]  │
└─────────────────────────────────────────────────────────┘
Legend: ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ ● Sales  │  │ ⊘ Revenue│  │ ● Profit │
        └──────────┘  └──────────┘  └──────────┘
```

**Interaction**: Toggle visibility in one chart, and it updates across all charts with the same `syncKey`.

## Visual States

### Legend Item States

```
1. Visible (Default):
   ┌──────────────┐
   │ ● Sales      │  ← Color indicator (solid)
   │ Opacity: 100%│  ← Full opacity
   └──────────────┘

2. Hidden:
   ┌──────────────┐
   │ ● Sales   ⊘  │  ← Eye-slash icon
   │ Opacity: 40% │  ← Reduced opacity
   └──────────────┘

3. Hovered:
   ┌──────────────┐
   │ ● Sales      │  ← Background: gray-100
   │ Scale: 105%  │  ← Slightly larger
   └──────────────┘

4. Focused (Keyboard):
   ┌──────────────┐
   │ ● Sales      │  ← Focus ring (blue)
   │ Ring: 2px    │
   └──────────────┘
```

## Control Buttons

```
┌─────────────────────────────────────────────────────────┐
│                     Chart Area                          │
└─────────────────────────────────────────────────────────┘

Legend:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ● Sales  │  │ ● Revenue│  │ ● Profit │
└──────────┘  └──────────┘  └──────────┘

Controls:
┌────────────┐  ┌────────────┐
│ Show All   │  │ Hide All   │
└────────────┘  └────────────┘
```

## Keyboard Navigation

```
Tab Navigation:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ ● Sales  │→ │ ● Revenue│→ │ ● Profit │
│ [Focus]  │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘

Actions:
- Tab: Move to next item
- Shift+Tab: Move to previous item
- Enter/Space: Toggle visibility
- Ctrl/Cmd+Enter: Show only this item
```

## Responsive Behavior

```
Desktop (> 1024px):
┌─────────────────────────────────────────────────────────┐
│                     Chart Area                          │
│                   (Full Width)                          │
└─────────────────────────────────────────────────────────┘
Legend (Horizontal):
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ ● Sales  │ │ ● Revenue│ │ ● Profit │ │ ● Margin │
└──────────┘ └──────────┘ └──────────┘ └──────────┘


Tablet (768px - 1024px):
┌─────────────────────────────────────────────────────────┐
│                     Chart Area                          │
│                  (Adjusted Width)                       │
└─────────────────────────────────────────────────────────┘
Legend (Horizontal, Wrapped):
┌──────────┐ ┌──────────┐
│ ● Sales  │ │ ● Revenue│
└──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│ ● Profit │ │ ● Margin │
└──────────┘ └──────────┘


Mobile (< 768px):
┌───────────────────────────────────┐
│         Chart Area                │
│       (Full Width)                │
└───────────────────────────────────┘
Legend (Collapsible):
┌─────────────────────────────────┐
│ [▼ Expand Legend]               │
└─────────────────────────────────┘
```

## Color Indicators

```
Standard Colors:
● Blue (#2563eb)    - Primary series
● Green (#10b981)   - Secondary series
● Orange (#f59e0b)  - Tertiary series
● Red (#ef4444)     - Quaternary series
● Purple (#8b5cf6)  - Additional series
● Pink (#ec4899)    - Additional series

Colorblind-Safe Palette:
● Blue (#0173b2)
● Orange (#de8f05)
● Green (#029e73)
● Pink (#cc78bc)
● Brown (#ca9161)
● Gray (#949494)
```

## Tooltip Hints

```
┌──────────────────────────────────────────────────────┐
│ ● Sales                                              │
│                                                      │
│ Tooltip:                                            │
│ "Click to toggle Sales.                             │
│  Ctrl/Cmd+Click to show only this series."          │
└──────────────────────────────────────────────────────┘
```

## Animation Timing

```
State Transitions:
- Visibility toggle: 200ms ease-in-out
- Hover effects: 200ms ease-in-out
- Collapse/expand: 300ms ease-in-out
- Color changes: 200ms ease-in-out
- Scale transforms: 200ms ease-in-out
```

## Touch Targets (Mobile)

```
Minimum Touch Target Size: 44x44 pixels

┌────────────────────────────────────┐
│                                    │
│  ● Sales                           │  ← 44px height
│                                    │
└────────────────────────────────────┘
         ↑
      44px width minimum
```

## Accessibility Features

```
ARIA Labels:
- aria-label="Sales: visible"
- aria-pressed="true"
- aria-expanded="false"

Screen Reader Announcements:
- "Sales series hidden"
- "Revenue series visible"
- "Showing only Profit series"
- "Legend collapsed"
- "Legend expanded"

Keyboard Focus:
┌──────────────────────────────────┐
│ ● Sales                          │
│ [Focus Ring: 2px blue]           │
└──────────────────────────────────┘
```

## Integration Example

```
Component Structure:

<LegendController>
  ├── State Management
  │   ├── Visibility Map
  │   ├── Hover State
  │   └── Collapsed State
  │
  ├── Synchronization
  │   ├── Global State
  │   └── localStorage
  │
  └── Render
      ├── Chart Component
      │   └── Filtered Series
      │
      └── InteractiveLegend
          ├── Toggle Button (Mobile)
          └── Legend Items
              ├── Color Indicator
              ├── Label
              └── Visibility Icon
```

## Best Practices

1. **Always provide clear labels**: Use descriptive names
2. **Use distinct colors**: Ensure colors are distinguishable
3. **Enable collapsible on mobile**: Better UX on small screens
4. **Sync related charts**: Use same syncKey for related metrics
5. **Test keyboard navigation**: Ensure full accessibility
6. **Provide hover feedback**: Highlight series on hover
7. **Show control buttons**: "Show All" and "Hide All" for convenience

## Common Patterns

### Pattern 1: Basic Legend
```tsx
<LegendController items={items} onVisibilityChange={handler}>
  {(state, handlers) => (
    <>
      <Chart hiddenSeries={hiddenSeries} />
      <InteractiveLegend state={state} handlers={handlers} />
    </>
  )}
</LegendController>
```

### Pattern 2: With Hover Highlighting
```tsx
<LegendController
  items={items}
  onVisibilityChange={handleVisibility}
  onHoverChange={handleHover}
>
  {(state, handlers) => (
    <>
      <Chart hiddenSeries={hiddenSeries} hoveredSeries={hoveredSeries} />
      <InteractiveLegend state={state} handlers={handlers} />
    </>
  )}
</LegendController>
```

### Pattern 3: Synchronized Across Charts
```tsx
<LegendController items={items} syncKey="dashboard">
  {(state, handlers) => (
    <>
      <Chart1 hiddenSeries={hiddenSeries} />
      <Chart2 hiddenSeries={hiddenSeries} />
      <InteractiveLegend state={state} handlers={handlers} />
    </>
  )}
</LegendController>
```

## Troubleshooting Visual Issues

### Issue: Legend items too small on mobile
**Solution**: Ensure minimum 44x44px touch targets

### Issue: Colors not distinguishable
**Solution**: Use colorblind-safe palette

### Issue: Legend overlaps chart
**Solution**: Add proper spacing with margin/padding

### Issue: Hover effects not visible
**Solution**: Increase contrast or add border

### Issue: Collapse button not showing
**Solution**: Check viewport width (< 768px) and `collapsible` prop

## Performance Considerations

- Smooth 60 FPS animations
- Efficient state updates with Map
- Debounced synchronization
- Minimal re-renders with React.memo
- Optimized event handlers with useCallback

## Browser Support

✅ Chrome/Edge: Full support
✅ Firefox: Full support  
✅ Safari: Full support
✅ Mobile browsers: Full support with touch gestures

---

For complete API documentation, see [LEGEND_README.md](./LEGEND_README.md)
For integration examples, see [LEGEND_INTEGRATION_GUIDE.md](./LEGEND_INTEGRATION_GUIDE.md)
For working code examples, see [LegendExamples.tsx](./LegendExamples.tsx)
