# Enhanced Tooltip Manager

A professional tooltip system with rich content display, intelligent positioning, and smooth animations.

## Features

✅ **Rich Content Display**
- Multiple metrics with color indicators
- Statistical information (percentage, rank, comparison)
- Custom HTML content support
- Trend indicators with visual icons

✅ **Intelligent Positioning**
- Automatic viewport edge detection
- Smart positioning to avoid overflow
- Manual positioning options (top, bottom, left, right, auto)
- Configurable offset from cursor

✅ **Smooth Animations**
- Fade-in/fade-out transitions (300ms)
- Configurable delay before showing
- Smooth position updates

✅ **Accessibility**
- Semantic HTML structure
- Clear visual hierarchy
- Color-coded indicators
- Readable typography

## Usage

### Basic Usage

```tsx
import { TooltipManager } from '@/components/charts/interactions/TooltipManager';

function MyChart() {
  return (
    <TooltipManager>
      {(showTooltip, hideTooltip) => (
        <div
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            showTooltip(
              {
                title: 'Data Point',
                metrics: [
                  { label: 'Value', value: 100, color: '#3b82f6' }
                ],
              },
              { x: rect.left, y: rect.top }
            );
          }}
          onMouseLeave={hideTooltip}
        >
          Hover me
        </div>
      )}
    </TooltipManager>
  );
}
```

### With Statistics

```tsx
showTooltip(
  {
    title: 'Q4 Sales',
    metrics: [
      { label: 'Revenue', value: 250000, color: '#10b981', unit: '$' }
    ],
    statistics: {
      percentOfTotal: 35.5,
      rank: 2,
      comparisonToAverage: 15.3,
      trend: 'up'
    }
  },
  { x: mouseX, y: mouseY }
);
```

### With Custom Content

```tsx
showTooltip(
  {
    title: 'Product Details',
    metrics: [
      { label: 'Price', value: 99.99, unit: '$' }
    ],
    customContent: (
      <div>
        <p>Additional information</p>
        <ul>
          <li>Feature 1</li>
          <li>Feature 2</li>
        </ul>
      </div>
    )
  },
  { x: mouseX, y: mouseY }
);
```

### With Delay

```tsx
<TooltipManager delay={500}>
  {(showTooltip, hideTooltip) => (
    // Your content
  )}
</TooltipManager>
```

## API Reference

### TooltipManager Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `(showTooltip, hideTooltip) => ReactNode` | Required | Render function with tooltip controls |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'auto'` | `'auto'` | Tooltip positioning strategy |
| `offset` | `number` | `10` | Distance from cursor in pixels |
| `delay` | `number` | `0` | Delay before showing tooltip (ms) |
| `className` | `string` | `''` | Additional CSS classes |

### TooltipData Interface

```typescript
interface TooltipData {
  title: string;
  metrics: Array<{
    label: string;
    value: string | number;
    color?: string;
    unit?: string;
  }>;
  statistics?: {
    percentOfTotal?: number;
    rank?: number;
    comparisonToAverage?: number;
    trend?: 'up' | 'down' | 'stable';
  };
  customContent?: React.ReactNode;
}
```

### Point Interface

```typescript
interface Point {
  x: number;
  y: number;
}
```

## Tooltip Content Sections

### 1. Title
- Displayed at the top with bold font
- Separated by a border from content below

### 2. Metrics
- List of key-value pairs
- Optional color indicator (3x3px square)
- Optional unit suffix
- Automatic number formatting with locale

### 3. Statistics (Optional)
- **Percentage of Total**: Shows contribution to total
- **Rank**: Position in dataset
- **Comparison to Average**: Shows deviation with visual indicator
  - Green up arrow for positive
  - Red down arrow for negative
  - Gray for neutral
- **Trend**: Shows direction with icon
  - Rising (green)
  - Falling (red)
  - Stable (gray)

### 4. Custom Content (Optional)
- Supports any React component
- Separated by border from statistics
- Useful for additional context, mini charts, or formatted text

## Positioning Logic

### Auto Mode (Default)
The tooltip automatically positions itself to stay within the viewport:

1. **Default**: Right and below cursor (x + offset, y + offset)
2. **Right overflow**: Left of cursor
3. **Bottom overflow**: Above cursor
4. **Left overflow**: At left edge with padding
5. **Top overflow**: At top edge with padding

### Manual Modes
- **top**: Centered above cursor
- **bottom**: Centered below cursor
- **left**: Centered to left of cursor
- **right**: Centered to right of cursor

## Styling

The tooltip uses Tailwind CSS classes and can be customized:

```tsx
<TooltipManager className="custom-tooltip">
  {/* ... */}
</TooltipManager>
```

Default styles:
- Background: White
- Border: Gray-200
- Shadow: Large shadow
- Border radius: 8px
- Padding: 12px
- Min width: 200px
- Max width: 320px

## Performance Considerations

1. **Debouncing**: Use the `delay` prop to prevent rapid tooltip updates
2. **Memoization**: Tooltip data is memoized to prevent unnecessary re-renders
3. **Cleanup**: Timeouts are automatically cleaned up on unmount
4. **Pointer Events**: Tooltip has `pointer-events-none` to prevent interference

## Integration with Charts

### Recharts Integration

```tsx
import { TooltipManager } from '@/components/charts/interactions/TooltipManager';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

function MyLineChart({ data }) {
  return (
    <TooltipManager>
      {(showTooltip, hideTooltip) => (
        <LineChart
          data={data}
          onMouseMove={(state) => {
            if (state.activePayload) {
              const payload = state.activePayload[0].payload;
              showTooltip(
                {
                  title: payload.name,
                  metrics: [
                    { label: 'Value', value: payload.value }
                  ]
                },
                { x: state.chartX, y: state.chartY }
              );
            }
          }}
          onMouseLeave={hideTooltip}
        >
          <Line dataKey="value" />
        </LineChart>
      )}
    </TooltipManager>
  );
}
```

## Examples

See `TooltipExamples.tsx` for comprehensive examples including:
- Basic tooltips with multiple metrics
- Statistics tooltips with trends
- Custom content tooltips
- Interactive chart tooltips
- Delayed tooltips

## Requirements Satisfied

This implementation satisfies the following requirements:

- ✅ **Requirement 3.1**: Rich tooltip with multiple metrics display
- ✅ **Requirement 5.1**: Tooltip with percentage of total, rank, and comparison to average
- ✅ **Requirement 5.7**: Support for HTML content in tooltips
- Intelligent positioning to avoid viewport edges
- Smooth fade-in/fade-out animations (300ms)
- Visual indicators for trends and comparisons

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch events

## Accessibility

- Semantic HTML structure
- Clear visual hierarchy
- Color contrast meets WCAG AA standards
- Readable font sizes (12px minimum)
- Visual indicators supplemented with text
