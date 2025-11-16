# Accessibility Quick Start Guide

Quick reference for making charts accessible in DataStory.

## 5-Minute Setup

### 1. Wrap Your Chart

```typescript
import { AccessibleChart } from '@/components/charts/AccessibleChart';

<AccessibleChart
  chartId="my-chart"
  chartType="line"
  title="Chart Title"
  data={data}
  config={config}
>
  <YourChart {...props} />
</AccessibleChart>
```

**That's it!** This adds:
- ✓ ARIA labels
- ✓ Screen reader descriptions
- ✓ Data tables
- ✓ Skip links

### 2. Add Keyboard Navigation (Optional)

```typescript
import { useChartKeyboardNavigation } from '@/lib/hooks/useChartKeyboardNavigation';

const { containerProps, isIndexFocused } = useChartKeyboardNavigation({
  dataLength: data.length,
  chartId: 'my-chart',
});

<div {...containerProps}>
  {/* Your chart */}
</div>
```

**Adds**:
- ✓ Arrow key navigation
- ✓ Focus management
- ✓ Screen reader announcements

## Common Patterns

### Pattern 1: Basic Accessible Chart

```typescript
<AccessibleChart chartId="sales" chartType="line" title="Sales" data={data} config={config}>
  <LineChart data={data} title="Sales" config={config} />
</AccessibleChart>
```

### Pattern 2: Interactive Chart with Keyboard

```typescript
function MyChart({ data }) {
  const { containerProps, focusedIndex, isIndexFocused } = useChartKeyboardNavigation({
    dataLength: data.length,
    chartId: 'my-chart',
  });

  return (
    <AccessibleChart chartId="my-chart" chartType="bar" title="Data" data={data} config={{}}>
      <div {...containerProps}>
        <BarChart data={data} focusedIndex={focusedIndex} />
      </div>
    </AccessibleChart>
  );
}
```

### Pattern 3: Custom Focus Indicators

```typescript
import { getFocusRingStyle } from '@/lib/utils/accessibility';

<DataPoint
  style={getFocusRingStyle(isFocused)}
  aria-label={`Point ${index + 1}: ${value}`}
/>
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Focus chart |
| ← → ↑ ↓ | Navigate data points |
| Home | First point |
| End | Last point |
| Enter/Space | Select point |

## Validation Checklist

Quick checks before shipping:

```typescript
import { meetsContrastRequirement } from '@/lib/utils/accessibility';

// Check text contrast
const textOK = meetsContrastRequirement('#333', '#fff'); // Should be true

// Check chart colors
theme.colors.categorical.forEach(color => {
  const ok = meetsContrastRequirement(color, '#fff');
  console.log(`${color}: ${ok ? '✓' : '✗'}`);
});
```

## Testing

### Quick Test (30 seconds)
1. Tab to chart - Does it focus?
2. Press arrow keys - Does focus move?
3. Check focus ring - Is it visible?

### Screen Reader Test (2 minutes)
1. Enable screen reader (Cmd+F5 on Mac)
2. Navigate to chart
3. Listen to description
4. Navigate data points

### Contrast Test (1 minute)
```typescript
import { getContrastRatio } from '@/lib/utils/accessibility';

const ratio = getContrastRatio('#2563eb', '#ffffff');
console.log(`Contrast: ${ratio.toFixed(2)}:1`); // Should be > 4.5
```

## Common Issues

### Issue: Focus not visible
```typescript
// ✗ Bad
<div style={{ outline: 'none' }}>

// ✓ Good
import { getFocusRingStyle } from '@/lib/utils/accessibility';
<div style={getFocusRingStyle(isFocused)}>
```

### Issue: Screen reader not announcing
```typescript
// ✗ Bad
<div>Chart</div>

// ✓ Good
<div role="img" aria-label="Line chart showing sales data">
  Chart
</div>
```

### Issue: Keyboard navigation not working
```typescript
// ✗ Bad
<div>Chart</div>

// ✓ Good
<div tabIndex={0} onKeyDown={handleKeyDown}>
  Chart
</div>
```

## Pro Tips

1. **Always use AccessibleChart wrapper** - It handles 90% of accessibility
2. **Test with keyboard only** - Unplug your mouse
3. **Use theme colors** - They're pre-validated for contrast
4. **Add ARIA labels to interactive elements** - Screen readers need them
5. **Announce dynamic changes** - Use `announceToScreenReader()`

## Need More Help?

- Full docs: `components/charts/ACCESSIBILITY.md`
- API reference: `lib/utils/ACCESSIBILITY_UTILS.md`
- Examples: `components/charts/AccessibilityDemo.tsx`
- Tests: `__tests__/accessibility.test.ts`

## Quick Reference

```typescript
// Import everything you need
import {
  AccessibleChart,
  useChartKeyboardNavigation,
  generateChartDescription,
  meetsContrastRequirement,
  getFocusRingStyle,
  announceToScreenReader,
} from '@/components/charts';
```

## Minimum Requirements (WCAG AA)

- ✓ Text contrast: 4.5:1
- ✓ UI contrast: 3:1
- ✓ Keyboard accessible
- ✓ Focus visible
- ✓ ARIA labels
- ✓ Screen reader support

**All our components meet these by default!**
