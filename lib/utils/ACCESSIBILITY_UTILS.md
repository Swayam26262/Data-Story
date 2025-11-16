# Accessibility Utilities

Comprehensive accessibility utilities for chart components following WCAG 2.1 Level AA standards.

## Overview

The accessibility utilities provide functions and classes to make charts fully accessible to users with disabilities, including:
- Screen reader support
- Keyboard navigation
- Color contrast validation
- ARIA labels and descriptions
- Focus management

## Utility Functions

### `generateChartDescription(chartType, data, config)`

Generates an accessible description for a chart that screen readers can announce.

**Parameters**:
- `chartType: string` - Type of chart (line, bar, pie, scatter, etc.)
- `data: ChartData` - Chart data array
- `config: any` - Chart configuration object

**Returns**: `string` - Descriptive text for screen readers

**Example**:
```typescript
import { generateChartDescription } from '@/lib/utils/accessibility';

const description = generateChartDescription('line', chartData, {
  xAxis: 'month',
  yAxis: 'sales'
});
// Returns: "Line chart showing 12 data points. X-axis represents month, Y-axis represents sales."
```

### `generateChartSummary(chartType, data, config, statistics?)`

Generates a text summary of chart data including key statistics and insights.

**Parameters**:
- `chartType: string` - Type of chart
- `data: ChartData` - Chart data array
- `config: any` - Chart configuration
- `statistics?: any` - Optional statistical analysis results

**Returns**: `string` - Summary text with statistics

**Example**:
```typescript
const summary = generateChartSummary('line', chartData, config, statistics);
// Returns: "Data range: 1,000 to 10,000. Average: 5,500. Overall trend is increasing."
```

### `generateDataPointLabel(dataPoint, index, config, chartType)`

Generates an ARIA label for a specific data point.

**Parameters**:
- `dataPoint: any` - The data point object
- `index: number` - Index of the data point
- `config: any` - Chart configuration
- `chartType: string` - Type of chart

**Returns**: `string` - ARIA label for the data point

**Example**:
```typescript
const label = generateDataPointLabel(
  { month: 'Jan', sales: 5000 },
  0,
  { xAxis: 'month', yAxis: 'sales' },
  'line'
);
// Returns: "Point 1: month Jan, sales 5000"
```

### `meetsContrastRequirement(foreground, background, level?)`

Checks if two colors meet WCAG contrast requirements.

**Parameters**:
- `foreground: string` - Foreground color (hex)
- `background: string` - Background color (hex)
- `level?: 'AA' | 'AAA'` - WCAG level (default: 'AA')

**Returns**: `boolean` - True if contrast requirement is met

**Example**:
```typescript
const isAccessible = meetsContrastRequirement('#2563eb', '#ffffff');
// Returns: true (contrast ratio > 4.5:1)

const isHighContrast = meetsContrastRequirement('#000000', '#ffffff', 'AAA');
// Returns: true (contrast ratio > 7:1)
```

### `getContrastRatio(color1, color2)`

Calculates the contrast ratio between two colors.

**Parameters**:
- `color1: string` - First color (hex)
- `color2: string` - Second color (hex)

**Returns**: `number` - Contrast ratio (1-21)

**Example**:
```typescript
const ratio = getContrastRatio('#2563eb', '#ffffff');
// Returns: 8.59 (approximately)
```

### `announceToScreenReader(message)`

Announces a message to screen readers using an ARIA live region.

**Parameters**:
- `message: string` - Message to announce

**Returns**: `void`

**Example**:
```typescript
announceToScreenReader('Navigated to data point 5 of 12');
// Screen reader will announce the message
```

### `generateSkipLinkId(chartId)`

Generates a unique ID for skip links.

**Parameters**:
- `chartId: string` - Chart identifier

**Returns**: `string` - Skip link ID

**Example**:
```typescript
const skipId = generateSkipLinkId('sales-chart');
// Returns: "skip-to-sales-chart"
```

### `getFocusRingStyle(isFocused)`

Returns CSS styles for focus indicators.

**Parameters**:
- `isFocused: boolean` - Whether element is focused

**Returns**: `React.CSSProperties` - Focus ring styles

**Example**:
```typescript
<div style={getFocusRingStyle(isFocused)}>
  Chart Element
</div>
```

## Classes

### `ChartKeyboardNavigator`

Handles keyboard navigation for chart data points.

**Constructor**:
```typescript
new ChartKeyboardNavigator(
  dataLength: number,
  onNavigate: (index: number) => void,
  onSelect: (index: number) => void
)
```

**Methods**:
- `handleKeyDown(event: React.KeyboardEvent): void` - Process keyboard events
- `getCurrentIndex(): number` - Get current focused index
- `setCurrentIndex(index: number): void` - Set focused index

**Example**:
```typescript
const navigator = new ChartKeyboardNavigator(
  data.length,
  (index) => setFocusedIndex(index),
  (index) => handleSelect(index)
);

// In component
<div onKeyDown={(e) => navigator.handleKeyDown(e)}>
  {/* Chart content */}
</div>
```

**Supported Keys**:
- `ArrowRight`, `ArrowDown` - Next item
- `ArrowLeft`, `ArrowUp` - Previous item
- `Home` - First item
- `End` - Last item
- `Enter`, `Space` - Select item

## Constants

### `focusStyles`

Default focus indicator styles.

```typescript
const focusStyles = {
  outline: '2px solid #2563eb',
  outlineOffset: '2px',
  borderRadius: '4px',
}
```

### `srOnlyClass`

Tailwind CSS classes for screen reader only content.

```typescript
const srOnlyClass = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
```

## Usage Examples

### Complete Accessible Chart

```typescript
import {
  generateChartDescription,
  generateChartSummary,
  ChartKeyboardNavigator,
  getFocusRingStyle,
  srOnlyClass,
} from '@/lib/utils/accessibility';

function AccessibleLineChart({ data, config }) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const navigatorRef = useRef<ChartKeyboardNavigator>();

  useEffect(() => {
    navigatorRef.current = new ChartKeyboardNavigator(
      data.length,
      setFocusedIndex,
      (index) => console.log('Selected:', index)
    );
  }, [data.length]);

  const description = generateChartDescription('line', data, config);
  const summary = generateChartSummary('line', data, config);

  return (
    <div
      role="img"
      aria-label={description}
      tabIndex={0}
      onKeyDown={(e) => navigatorRef.current?.handleKeyDown(e)}
    >
      {/* Screen reader only description */}
      <div className={srOnlyClass}>
        <p>{description}</p>
        <p>{summary}</p>
      </div>

      {/* Visual chart */}
      <div aria-hidden="true">
        {data.map((point, index) => (
          <DataPoint
            key={index}
            data={point}
            style={getFocusRingStyle(focusedIndex === index)}
          />
        ))}
      </div>
    </div>
  );
}
```

### Color Contrast Validation

```typescript
import { meetsContrastRequirement, getContrastRatio } from '@/lib/utils/accessibility';

function validateThemeColors(theme) {
  const results = [];
  
  // Check text on background
  const textContrast = meetsContrastRequirement(
    theme.colors.text,
    theme.colors.background
  );
  results.push({
    name: 'Text on Background',
    passes: textContrast,
    ratio: getContrastRatio(theme.colors.text, theme.colors.background)
  });

  // Check all chart colors
  theme.colors.categorical.forEach((color, index) => {
    const passes = meetsContrastRequirement(color, theme.colors.background);
    results.push({
      name: `Chart Color ${index + 1}`,
      passes,
      ratio: getContrastRatio(color, theme.colors.background)
    });
  });

  return results;
}
```

### Screen Reader Announcements

```typescript
import { announceToScreenReader } from '@/lib/utils/accessibility';

function InteractiveChart() {
  const handleZoom = (level) => {
    setZoomLevel(level);
    announceToScreenReader(`Zoomed to ${level}%`);
  };

  const handleDataPointSelect = (point) => {
    setSelectedPoint(point);
    announceToScreenReader(
      `Selected ${point.label}: ${point.value}`
    );
  };

  return (
    <Chart
      onZoom={handleZoom}
      onSelect={handleDataPointSelect}
    />
  );
}
```

## Testing

### Unit Tests

```typescript
import {
  generateChartDescription,
  meetsContrastRequirement,
  ChartKeyboardNavigator,
} from '@/lib/utils/accessibility';

describe('Accessibility Utils', () => {
  test('generates chart description', () => {
    const desc = generateChartDescription('line', data, config);
    expect(desc).toContain('Line chart');
  });

  test('validates color contrast', () => {
    expect(meetsContrastRequirement('#000', '#fff')).toBe(true);
    expect(meetsContrastRequirement('#888', '#999')).toBe(false);
  });

  test('keyboard navigation', () => {
    const onNavigate = jest.fn();
    const navigator = new ChartKeyboardNavigator(10, onNavigate, jest.fn());
    
    navigator.handleKeyDown({ key: 'ArrowRight', preventDefault: jest.fn() });
    expect(onNavigate).toHaveBeenCalledWith(1);
  });
});
```

### Manual Testing

1. **Screen Reader Testing**:
   - Enable screen reader (NVDA, JAWS, VoiceOver)
   - Navigate to chart
   - Verify description is announced
   - Test data table navigation

2. **Keyboard Navigation**:
   - Tab to chart
   - Use arrow keys to navigate
   - Verify focus indicators are visible
   - Test all keyboard shortcuts

3. **Color Contrast**:
   - Use browser DevTools
   - Check contrast ratios
   - Test with colorblind simulators

## WCAG 2.1 Compliance

These utilities help achieve:

- **1.1.1 Non-text Content (A)**: Text alternatives for charts
- **1.3.1 Info and Relationships (A)**: Proper ARIA roles and labels
- **1.4.3 Contrast (AA)**: Color contrast validation
- **2.1.1 Keyboard (A)**: Full keyboard accessibility
- **2.4.3 Focus Order (A)**: Logical focus management
- **2.4.7 Focus Visible (AA)**: Visible focus indicators
- **4.1.2 Name, Role, Value (A)**: Proper ARIA attributes

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Screen Reader Testing Guide](https://webaim.org/articles/screenreader_testing/)
