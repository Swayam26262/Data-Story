# Chart Accessibility Guide

This document describes the accessibility features implemented in the DataStory chart components and provides testing guidelines.

## Overview

All chart components in DataStory follow WCAG 2.1 Level AA standards and include comprehensive accessibility features for users with disabilities.

## Accessibility Features

### 1. ARIA Labels and Roles

All charts include:
- **role="img"** on chart containers to identify them as images
- **aria-label** with descriptive chart information
- **aria-describedby** linking to detailed descriptions
- **aria-live** regions for dynamic updates
- **aria-hidden="true"** on decorative elements

### 2. Keyboard Navigation

Full keyboard support for all interactive features:

| Key | Action |
|-----|--------|
| Tab | Focus chart container |
| Arrow Keys | Navigate between data points |
| Home | Jump to first data point |
| End | Jump to last data point |
| Enter/Space | Select/activate data point |
| Escape | Clear selection |

### 3. Focus Indicators

- Visible focus rings (2px solid blue, #2563eb)
- 2px offset for clarity
- High contrast (4.5:1 minimum)
- Persistent during keyboard navigation

### 4. Screen Reader Support

#### Text Alternatives
- Chart descriptions generated automatically
- Data summaries with key statistics
- Data point labels with context
- Trend and pattern announcements

#### Data Tables
- Hidden data tables for screen readers
- Proper table structure with headers
- Caption describing the data
- Limited to 100 rows for performance

#### Live Regions
- Announce navigation changes
- Announce data point selection
- Announce zoom/pan operations
- Polite announcements (non-intrusive)

### 5. Color Contrast

All visual elements meet WCAG AA standards:
- Text: 4.5:1 contrast ratio minimum
- Large text: 3:1 contrast ratio minimum
- UI components: 3:1 contrast ratio minimum
- Colorblind-safe palettes available

### 6. Skip Links

- Skip to chart content
- Skip to next chart
- Skip to chart controls
- Visible on keyboard focus

### 7. Alternative Text

- Chart titles as headings
- Descriptive alt text for all visual elements
- Context for statistical overlays
- Explanation of trends and patterns

## Implementation

### Using AccessibleChart Wrapper

Wrap any chart component with `AccessibleChart` for automatic accessibility features:

```tsx
import { AccessibleChart } from '@/components/charts/AccessibleChart';
import LineChart from '@/components/charts/LineChart';

<AccessibleChart
  chartId="sales-trend"
  chartType="line"
  title="Monthly Sales Trend"
  data={chartData}
  config={chartConfig}
  statistics={statistics}
>
  <LineChart
    data={chartData}
    title="Monthly Sales Trend"
    config={chartConfig}
    statistics={statistics}
  />
</AccessibleChart>
```

### Using Keyboard Navigation Hook

Add keyboard navigation to custom charts:

```tsx
import { useChartKeyboardNavigation } from '@/lib/hooks/useChartKeyboardNavigation';

function MyChart({ data, chartId }) {
  const {
    focusedIndex,
    isKeyboardMode,
    isIndexFocused,
    containerProps,
  } = useChartKeyboardNavigation({
    dataLength: data.length,
    chartId,
    onDataPointFocus: (index) => {
      // Handle focus
    },
    onDataPointSelect: (index) => {
      // Handle selection
    },
  });

  return (
    <div {...containerProps}>
      {/* Chart content */}
    </div>
  );
}
```

### Generating Descriptions

Use utility functions for consistent descriptions:

```tsx
import {
  generateChartDescription,
  generateChartSummary,
  generateDataPointLabel,
} from '@/lib/utils/accessibility';

const description = generateChartDescription('line', data, config);
const summary = generateChartSummary('line', data, config, statistics);
const pointLabel = generateDataPointLabel(dataPoint, index, config, 'line');
```

## Testing Guidelines

### Automated Testing

Run accessibility tests with:
```bash
npm run test:a11y
```

Tools used:
- axe-core for automated checks
- jest-axe for unit tests
- Lighthouse for audits

### Manual Testing

#### Keyboard Navigation
1. Tab to chart container
2. Use arrow keys to navigate data points
3. Press Enter to select
4. Verify focus indicators are visible
5. Test all interactive controls

#### Screen Reader Testing

**NVDA (Windows)**
1. Start NVDA (Ctrl + Alt + N)
2. Navigate to chart with Tab
3. Listen to chart description
4. Use arrow keys to explore data
5. Verify data table is accessible

**JAWS (Windows)**
1. Start JAWS
2. Navigate to chart
3. Press Insert + F7 for elements list
4. Verify chart appears in images list
5. Test table navigation mode

**VoiceOver (macOS)**
1. Enable VoiceOver (Cmd + F5)
2. Navigate to chart (VO + Right Arrow)
3. Listen to chart description
4. Use VO + Shift + Down to interact
5. Test data table with VO + U

#### Color Contrast
1. Use browser DevTools
2. Inspect text elements
3. Verify contrast ratios
4. Test with colorblind simulators
5. Check in high contrast mode

#### Zoom and Magnification
1. Zoom to 200% (Ctrl/Cmd + +)
2. Verify all content is visible
3. Check text doesn't overlap
4. Test at 400% zoom
5. Verify no horizontal scrolling

### Testing Checklist

- [ ] All charts have descriptive titles
- [ ] ARIA labels are present and accurate
- [ ] Keyboard navigation works for all features
- [ ] Focus indicators are visible
- [ ] Screen readers announce chart information
- [ ] Data tables are available for screen readers
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Skip links are functional
- [ ] Charts work at 200% zoom
- [ ] No keyboard traps
- [ ] Interactive elements have 44x44px touch targets
- [ ] Error messages are accessible
- [ ] Loading states are announced
- [ ] Dynamic updates are announced

## Common Issues and Solutions

### Issue: Focus not visible
**Solution**: Ensure focus styles are not overridden by CSS. Use `getFocusRingStyle()` utility.

### Issue: Screen reader not announcing changes
**Solution**: Use `announceToScreenReader()` function for dynamic updates.

### Issue: Keyboard navigation not working
**Solution**: Verify `tabIndex={0}` is set on chart container and event handlers are attached.

### Issue: Poor color contrast
**Solution**: Use `meetsContrastRequirement()` to validate colors. Use theme colors which are pre-validated.

### Issue: Data table too large
**Solution**: Data tables are automatically limited to 100 rows. For larger datasets, provide a download link.

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Support

For accessibility questions or issues:
1. Check this documentation
2. Review the implementation examples
3. Test with actual assistive technologies
4. File an issue with detailed reproduction steps
