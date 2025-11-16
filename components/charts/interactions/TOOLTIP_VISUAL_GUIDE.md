# Enhanced Tooltip - Visual Guide

## Tooltip Structure

```
┌─────────────────────────────────────┐
│  Title (Bold, Gray-900)             │
├─────────────────────────────────────┤
│  ■ Metric 1:              $12,000   │
│  ■ Metric 2:               1,250    │
│  ■ Metric 3:                $100    │
├─────────────────────────────────────┤
│  % of Total:               35.5%    │
│  Rank:                        #2    │
│  vs. Average:         ↑ +15.3%     │
│  Trend:               ↗ Rising      │
├─────────────────────────────────────┤
│  Custom Content Area                │
│  • Feature 1                        │
│  • Feature 2                        │
└─────────────────────────────────────┘
```

## Visual Elements

### 1. Title Section
```
┌─────────────────────────────────────┐
│  Q4 Performance                     │  ← Bold, 14px, Gray-900
├─────────────────────────────────────┤  ← Border separator
```

### 2. Metrics Section
```
│  ■ Revenue:              $250,000   │
│  ↑                        ↑      ↑  │
│  Color                  Label  Value│
│  Indicator                          │
```

Color indicators:
- Size: 12px × 12px
- Shape: Rounded square (rounded-sm)
- Position: Left-aligned with label

### 3. Statistics Section

#### Percentage of Total
```
│  % of Total:               35.5%    │
│  ↑           ↑              ↑       │
│  Label      Spacing       Value     │
```

#### Rank
```
│  Rank:                        #2    │
│  ↑                            ↑     │
│  Label                      Value   │
```

#### Comparison to Average
```
│  vs. Average:         ↑ +15.3%     │  ← Positive (Green)
│  vs. Average:         ↓ -8.2%      │  ← Negative (Red)
│  vs. Average:         — 0%         │  ← Neutral (Gray)
```

Visual indicators:
- **Positive**: Green up arrow (↑) + green text
- **Negative**: Red down arrow (↓) + red text
- **Neutral**: Gray dash (—) + gray text

#### Trend Indicator
```
│  Trend:               ↗ Rising      │  ← Green
│  Trend:               ↘ Falling     │  ← Red
│  Trend:               — Stable      │  ← Gray
```

Icons:
- **Rising**: Upward trend line (📈)
- **Falling**: Downward trend line (📉)
- **Stable**: Horizontal line (—)

### 4. Custom Content Section
```
├─────────────────────────────────────┤  ← Border separator
│  Performance Status:                │
│  ✓ Target exceeded                  │  ← Custom HTML
└─────────────────────────────────────┘
```

## Color Palette

### Background & Borders
- Background: `#ffffff` (White)
- Border: `#e5e7eb` (Gray-200)
- Border radius: `8px`
- Shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`

### Text Colors
- Title: `#111827` (Gray-900)
- Labels: `#6b7280` (Gray-600)
- Values: `#111827` (Gray-900)
- Units: `#6b7280` (Gray-500)

### Status Colors
- Positive/Up: `#10b981` (Green-500)
- Negative/Down: `#ef4444` (Red-500)
- Neutral/Stable: `#6b7280` (Gray-500)

### Metric Colors (Examples)
- Blue: `#3b82f6` (Blue-500)
- Green: `#10b981` (Green-500)
- Orange: `#f59e0b` (Orange-500)
- Red: `#ef4444` (Red-500)
- Purple: `#8b5cf6` (Purple-500)

## Spacing & Layout

### Container
```
Padding: 12px (p-3)
Min Width: 200px
Max Width: 320px
```

### Sections
```
Title:
  - Margin bottom: 8px (mb-2)
  - Padding bottom: 8px (pb-2)
  - Border bottom: 1px solid gray-100

Metrics:
  - Spacing between items: 6px (space-y-1.5)
  - Margin bottom: 8px (mb-2)

Statistics:
  - Padding top: 8px (pt-2)
  - Border top: 1px solid gray-100
  - Spacing between items: 6px (space-y-1.5)

Custom Content:
  - Padding top: 8px (pt-2)
  - Border top: 1px solid gray-100
```

### Typography
```
Title:        14px, font-semibold
Labels:       12px, regular
Values:       12px, font-medium
Units:        12px, regular
```

## Positioning Examples

### Auto Positioning (Default)

#### Normal Position (Space Available)
```
                    Cursor
                      ↓
                      •
                       ↘
                        ┌─────────────┐
                        │  Tooltip    │
                        └─────────────┘
```

#### Right Edge Overflow
```
                                  Cursor
                                    ↓
                                    •
                                   ↙
                        ┌─────────────┐
                        │  Tooltip    │
                        └─────────────┘
```

#### Bottom Edge Overflow
```
                        ┌─────────────┐
                        │  Tooltip    │
                        └─────────────┘
                                   ↗
                                  •
                                  ↑
                                Cursor
```

#### Corner Overflow
```
                        ┌─────────────┐
                        │  Tooltip    │
                        └─────────────┘
                                   ↗
                                  •
                                  ↑
                                Cursor
```

### Manual Positioning

#### Top
```
        ┌─────────────┐
        │  Tooltip    │
        └─────────────┘
               ↓
               •
             Cursor
```

#### Bottom
```
             Cursor
               •
               ↓
        ┌─────────────┐
        │  Tooltip    │
        └─────────────┘
```

#### Left
```
┌─────────────┐
│  Tooltip    │  →  •
└─────────────┘   Cursor
```

#### Right
```
      Cursor
        •  ←  ┌─────────────┐
              │  Tooltip    │
              └─────────────┘
```

## Animation States

### Fade In (300ms)
```
Opacity: 0 → 1
Transition: ease-in-out
```

### Fade Out (300ms)
```
Opacity: 1 → 0
Transition: ease-in-out
```

### Position Update
```
Transform: translate(x1, y1) → translate(x2, y2)
Smooth transition with recalculation
```

## Responsive Behavior

### Desktop (> 768px)
- Full tooltip with all sections
- Max width: 320px
- Offset: 10px from cursor

### Tablet (768px - 1024px)
- Full tooltip with all sections
- Max width: 280px
- Offset: 10px from cursor

### Mobile (< 768px)
- Simplified tooltip (essential info only)
- Max width: 240px
- Offset: 15px from cursor
- Larger touch targets

## Accessibility

### Visual Hierarchy
```
1. Title (Largest, Bold)
   ↓
2. Metrics (Medium, Color-coded)
   ↓
3. Statistics (Small, Detailed)
   ↓
4. Custom Content (Small, Contextual)
```

### Color Contrast
- All text meets WCAG AA standards
- Minimum contrast ratio: 4.5:1
- Color is not the only indicator (icons + text)

### Focus States
- Tooltip appears on hover
- Keyboard navigation supported via parent element
- Screen reader accessible via ARIA labels

## Usage Patterns

### Pattern 1: Simple Data Point
```
Title: "January"
Metrics: [Value: $4,000]
Statistics: [% of Total, Rank, vs. Average]
```

### Pattern 2: Multi-Metric Comparison
```
Title: "Q4 Performance"
Metrics: [
  Revenue: $250,000
  Units: 2,500
  Avg Price: $100
]
Statistics: [% of Total, Rank, vs. Average, Trend]
```

### Pattern 3: With Context
```
Title: "Product A"
Metrics: [Price: $99.99, Stock: 45]
Custom Content: [
  Features list
  Availability status
  Shipping info
]
```

### Pattern 4: Time Series
```
Title: "2024-06"
Metrics: [
  Value: $5,500
  7-day MA: $5,200
  YoY Change: +12.5%
]
Statistics: [Rank, vs. Average, Trend]
```

## Best Practices

### ✅ Do
- Keep title concise (< 30 characters)
- Limit metrics to 3-5 items
- Use consistent color coding
- Include units for numeric values
- Provide context with statistics
- Use custom content sparingly

### ❌ Don't
- Overload with too many metrics (> 5)
- Use very long labels (> 20 characters)
- Mix different unit types without labels
- Rely solely on color for meaning
- Include redundant information
- Make tooltip too wide (> 320px)

## Performance Tips

1. **Memoize tooltip data** to prevent recalculation
2. **Use delay** for rapid hover events
3. **Limit custom content** complexity
4. **Reuse tooltip instances** across similar elements
5. **Cleanup timeouts** on unmount
6. **Debounce position updates** for smooth movement
