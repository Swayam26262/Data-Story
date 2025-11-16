# Statistical Overlay System - Visual Guide

## Component Overview

This guide provides a visual description of each overlay component and how they enhance charts.

---

## 1. TrendLineOverlay

### Visual Description
```
Chart with Trend Line
┌─────────────────────────────────────────────────┐
│                              R² = 0.920         │
│                              y = 2.5x + 8       │
│  30 ┤                    ●                      │
│     │                 ●                         │
│  25 ┤              ●  ╱                         │
│     │           ●  ╱                            │
│  20 ┤        ●  ╱                               │
│     │     ●  ╱  ← Confidence Interval (shaded) │
│  15 ┤  ●  ╱                                     │
│     │  ╱  ← Trend Line (dashed)                │
│  10 ┤╱                                          │
│     └───────────────────────────────────────────│
│      1   2   3   4   5   6   7   8             │
└─────────────────────────────────────────────────┘
```

**Key Visual Elements:**
- Dashed line showing trend
- Light shaded area for confidence interval
- Annotation box with R² and equation
- Positioned in top-right corner

---

## 2. MovingAverageOverlay

### Visual Description
```
Chart with Moving Averages
┌─────────────────────────────────────────────────┐
│ 140 ┤                                           │
│     │    ●  ●     ●                             │
│ 120 ┤  ●      ●       ●   ●                     │
│     │    ╲  ╱  ╲  ╱  ╲  ╱                       │
│ 100 ┤     ╲╱    ╲╱    ╲╱  ← 7-day MA (dashed)  │
│     │      ─────────────  ← 30-day MA (dotted) │
│  80 ┤                                           │
│     └───────────────────────────────────────────│
│      10  20  30  40  50  60  70  80  90        │
└─────────────────────────────────────────────────┘

Legend: ─ ─ ─ 7-day MA    · · · 30-day MA
```

**Key Visual Elements:**
- Multiple lines with distinct styles
- Dashed line for 7-day average
- Dotted line for 30-day average
- Legend showing each moving average
- Smooth lines following data trend

---

## 3. OutlierHighlight

### Visual Description
```
Chart with Outlier Detection
┌─────────────────────────────────────────────────┐
│                                                 │
│  60 ┤              ⊙ ← Outlier (glowing)       │
│     │                 ┌─────────────────┐      │
│     │                 │ Outlier Detected│      │
│  50 ┤                 │ Value: 55.00    │      │
│     │                 │ Z-score: 3.80   │      │
│  40 ┤         ⊙       │ Method: ZSCORE  │      │
│     │                 └─────────────────┘      │
│  30 ┤                                           │
│     │                                           │
│  20 ┤  ●   ●   ●       ●   ●   ●               │
│     │                                           │
│  10 ┤                                           │
│     └───────────────────────────────────────────│
│      1   2   3   4   5   6   7   8             │
└─────────────────────────────────────────────────┘

Summary: ⊙ 2 outliers detected (ZSCORE)
```

**Key Visual Elements:**
- Outliers marked with special symbol (⊙)
- Glow effect around outlier points
- Tooltip on hover with details
- Summary badge showing count
- Color-coded (warning color)

---

## 4. AnnotationLayer

### Visual Description
```
Chart with Annotations
┌─────────────────────────────────────────────────┐
│     │  ┌──────────┐                             │
│ 100 ┤  │Peak Season│                            │
│     │  └──────────┘                             │
│     │  ░░░░░░░░░░░░░ ← Shaded Region           │
│  80 ┤  ░░░░░░░░░░░░░                            │
│     │  ░░●──●──●░░░░                            │
│  60 ┤──░░░░░░░░░░░░░────────── Target          │
│     │  ░░░░░░░░░░░░░  ↑ Reference Line         │
│  40 ┤  ░░░░░░░░░░░░░                            │
│     │  ░░░░░░░░░░░░░                            │
│  20 ┤  ░░░░░░░░░░░░░                            │
│     └───────────────────────────────────────────│
│      1   2   3   4   5   6   7   8   9   10    │
└─────────────────────────────────────────────────┘
```

**Key Visual Elements:**
- Text annotations with background boxes
- Horizontal reference line with label
- Shaded region highlighting period
- Dashed line style for reference
- Multiple annotation types combined

---

## 5. SignificanceMarker

### Visual Description
```
Significance Markers
┌─────────────────────────────────────────────────┐
│     │        **                                  │
│  80 ┤        ⊙  ← Significant finding           │
│     │                                            │
│  60 ┤    *                                       │
│     │    ⊙                                       │
│  40 ┤                                            │
│     │                                            │
│  20 ┤                                            │
│     └───────────────────────────────────────────│
│      1   2   3   4   5   6   7   8             │
└─────────────────────────────────────────────────┘

Legend:
*** = p < 0.01 (highly significant)
**  = p < 0.05 (significant)
*   = p < 0.10 (marginally significant)
```

**Key Visual Elements:**
- Colored dot at significant point
- Star notation above point
- Color indicates significance level
- Green for high significance
- Yellow for moderate significance

---

## Combined Overlays Example

### Visual Description
```
Professional Chart with All Overlays
┌─────────────────────────────────────────────────┐
│                              R² = 0.850         │
│ 100 ┤                  ⊙                        │
│     │                 ╱                         │
│  90 ┤              ⊙ ╱                          │
│     │             ╱                             │
│  80 ┤──────────────────────────── Threshold    │
│     │        ●  ╱  ─ ─ ─ ─ ─ (7-day MA)        │
│  70 ┤     ●  ╱  ─────────── (30-day MA)        │
│     │    ●╱                                     │
│  60 ┤  ●╱                                       │
│     │ ╱                                         │
│  50 ┤╱                                          │
│     └───────────────────────────────────────────│
│      5   10  15  20  25  30                    │
└─────────────────────────────────────────────────┘

Features shown:
✓ Trend line with confidence interval
✓ Two moving averages (different styles)
✓ Outlier highlighting (2 points)
✓ Reference line (threshold)
✓ R-squared annotation
```

---

## Color Coding

### Default Colors
- **Trend Line:** Info blue (#3b82f6)
- **Confidence Interval:** Light blue (15% opacity)
- **Moving Averages:** 
  - 7-day: Orange (#f59e0b)
  - 30-day: Purple (#8b5cf6)
  - 90-day: Pink (#ec4899)
- **Outliers:** Warning yellow (#f59e0b)
- **Reference Lines:** Gray (#9ca3af)
- **Annotations:** Customizable per annotation

### Significance Colors
- **High (p < 0.01):** Green (#10b981)
- **Medium (p < 0.05):** Yellow (#f59e0b)
- **Low (p < 0.10):** Gray (#9ca3af)

---

## Interaction States

### Hover States
```
Normal State:          Hover State:
    ●                     ⊙ ← Enlarged
                      ┌─────────┐
                      │ Details │
                      └─────────┘
```

### Toggle States (Moving Averages)
```
All Visible:          7-day Hidden:
─ ─ ─ 7-day MA       ─ ─ ─ 7-day MA (grayed)
· · · 30-day MA      · · · 30-day MA
```

---

## Responsive Behavior

### Desktop (>768px)
- Full annotations visible
- Detailed tooltips
- All overlays rendered
- Legend horizontal

### Mobile (<768px)
- Simplified annotations
- Compact tooltips
- Essential overlays only
- Legend vertical/collapsible

---

## Accessibility Features

### Visual Indicators
- High contrast colors
- Multiple visual cues (color + shape + pattern)
- Clear labels and legends
- Readable font sizes

### Interactive Elements
- Keyboard navigable
- Focus indicators
- ARIA labels
- Screen reader descriptions

---

## Usage Patterns

### Pattern 1: Time Series Analysis
```
LineChart + TrendLineOverlay + MovingAverageOverlay
→ Shows trend direction and smoothed patterns
```

### Pattern 2: Outlier Detection
```
ScatterPlot + OutlierHighlight + AnnotationLayer
→ Identifies and explains anomalies
```

### Pattern 3: Performance Tracking
```
LineChart + ReferenceLines + Annotations
→ Compares against targets and highlights events
```

### Pattern 4: Statistical Significance
```
Any Chart + SignificanceMarker + TrendLineOverlay
→ Shows statistically significant findings
```

---

## Best Practices

### Do's ✓
- Use trend lines for time series data
- Show confidence intervals for uncertainty
- Highlight outliers in scatter plots
- Add reference lines for targets/thresholds
- Use annotations sparingly for key insights
- Combine overlays that complement each other

### Don'ts ✗
- Don't overcrowd with too many overlays
- Don't use conflicting colors
- Don't hide important data behind overlays
- Don't use annotations for every data point
- Don't mix too many moving average periods
- Don't use trend lines on non-linear data

---

## Performance Tips

### Optimization
- Limit moving averages to 2-3 periods
- Sample large datasets before rendering
- Use memoization for calculations
- Lazy load overlays as needed
- Debounce hover interactions

### Data Limits
- Trend lines: Works well up to 10,000 points
- Moving averages: Efficient up to 5,000 points
- Outliers: Best with <100 outliers
- Annotations: Limit to 10-20 per chart

---

This visual guide helps understand how each overlay component enhances data visualization and provides professional-grade analytical features.
