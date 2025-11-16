# Cross-Chart Highlighting - Visual Guide

This guide provides visual examples and diagrams to help understand the cross-chart highlighting system.

## Visual Effect Examples

### 1. Glow Effect

```
Normal Point:        Highlighted Point:
    ●                    ◉ ← glowing aura
                         (8px drop shadow)
```

**CSS Applied:**
```css
filter: drop-shadow(0 0 8px #2563eb);
```

### 2. Border Effect

```
Normal Point:        Highlighted Point:
    ●                    ⊙ ← border outline
                         (3px solid border)
```

**CSS Applied:**
```css
outline: 3px solid #2563eb;
outline-offset: 2px;
```

### 3. Scale Effect

```
Normal Point:        Highlighted Point:
    ●                    ⬤ ← 30% larger
                         (scale 1.3x)
```

**CSS Applied:**
```css
transform: scale(1.3);
```

### 4. Combined Effect (Recommended)

```
Normal Point:        Highlighted Point:
    ●                    ◉⬤ ← glow + scale
                         (both effects)
```

**CSS Applied:**
```css
filter: drop-shadow(0 0 8px #2563eb);
transform: scale(1.3);
```

## Interaction Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Click Point  │
                    │   in Chart A  │
                    └───────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  highlightPoint()     │
                │  called with:         │
                │  - chartId: "chart-a" │
                │  - dataPoint: {...}   │
                │  - index: 3           │
                └───────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  CrossChartHighlightContext           │
        │  - Updates highlight state            │
        │  - Finds related charts               │
        │  - Propagates to Chart B, C           │
        └───────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │  Chart A  │   │  Chart B  │   │  Chart C  │
    │ (source)  │   │ (related) │   │ (related) │
    └───────────┘   └───────────┘   └───────────┘
            │               │               │
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ Highlight │   │ Highlight │   │ Highlight │
    │  Point 3  │   │  Point 3  │   │  Point 3  │
    └───────────┘   └───────────┘   └───────────┘
            │               │               │
            └───────────────┴───────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Visual Effects       │
                │  - Glow applied       │
                │  - Scale applied      │
                │  - Animation (300ms)  │
                └───────────────────────┘
```

## Chart Relationship Patterns

### Pattern 1: Bidirectional Sync

```
┌─────────────┐ ◄──────────► ┌─────────────┐
│   Chart A   │   matchKey   │   Chart B   │
│  (Line)     │   = "date"   │   (Bar)     │
└─────────────┘              └─────────────┘

Click in A → Highlights in B
Click in B → Highlights in A
```

### Pattern 2: Hub and Spoke

```
                ┌─────────────┐
                │   Chart A   │
                │   (Hub)     │
                └─────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Chart B    │ │  Chart C    │ │  Chart D    │
│  (Spoke)    │ │  (Spoke)    │ │  (Spoke)    │
└─────────────┘ └─────────────┘ └─────────────┘

Click in A → Highlights in B, C, D
Click in B → Only highlights B (no propagation)
```

### Pattern 3: Chain

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Chart A   │ ──► │   Chart B   │ ──► │   Chart C   │
└─────────────┘     └─────────────┘     └─────────────┘

Click in A → Highlights in B → Highlights in C
```

### Pattern 4: Auto-Sync (All Charts)

```
        ┌─────────────────────────────┐
        │  CrossChartHighlightProvider │
        │  autoSyncByKey="date"        │
        └─────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Chart A    │ │  Chart B    │ │  Chart C    │
│  has "date" │ │  has "date" │ │  has "date" │
└─────────────┘ └─────────────┘ └─────────────┘

Click any chart → All charts with matching "date" highlight
```

## Component Hierarchy

```
┌────────────────────────────────────────────────────────┐
│  CrossChartHighlightProvider                           │
│  ┌──────────────────────────────────────────────────┐ │
│  │  StoryViewer                                     │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │  Chart 1 (Line)                            │ │ │
│  │  │  ┌──────────────────────────────────────┐ │ │ │
│  │  │  │  useChartHighlight()                 │ │ │ │
│  │  │  │  ┌────────────────────────────────┐ │ │ │ │
│  │  │  │  │  <Line>                        │ │ │ │ │
│  │  │  │  │    <HighlightDot />            │ │ │ │ │
│  │  │  │  └────────────────────────────────┘ │ │ │ │
│  │  │  └──────────────────────────────────────┘ │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │  Chart 2 (Bar)                             │ │ │
│  │  │  ┌──────────────────────────────────────┐ │ │ │
│  │  │  │  useChartHighlight()                 │ │ │ │
│  │  │  │  ┌────────────────────────────────┐ │ │ │ │
│  │  │  │  │  <Bar>                         │ │ │ │ │
│  │  │  │  │    <HighlightBar />            │ │ │ │ │
│  │  │  │  └────────────────────────────────┘ │ │ │ │
│  │  │  └──────────────────────────────────────┘ │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  CrossChartHighlightContext State                       │
│                                                          │
│  highlightedPoints: Map {                               │
│    "chart-a" => {                                       │
│      chartId: "chart-a",                                │
│      dataPoint: { date: "2024-01", value: 100 },       │
│      index: 3,                                          │
│      timestamp: 1700000000000                           │
│    },                                                   │
│    "chart-b" => {                                       │
│      chartId: "chart-b",                                │
│      dataPoint: { date: "2024-01" },                   │
│      timestamp: 1700000000000                           │
│    }                                                    │
│  }                                                      │
│                                                          │
│  relationships: [                                       │
│    {                                                    │
│      sourceChartId: "chart-a",                         │
│      targetChartId: "chart-b",                         │
│      matchKey: "date"                                  │
│    }                                                    │
│  ]                                                      │
└─────────────────────────────────────────────────────────┘
```

## Timeline of Highlight Event

```
Time    Event                           State
────────────────────────────────────────────────────────────
0ms     User clicks point              No highlights
        
10ms    onClick handler fires          Processing...
        
20ms    highlightPoint() called        Updating state
        
30ms    Context state updated          Highlight set
        
40ms    Related charts notified        Propagating...
        
50ms    Visual effects applied         Animating...
        
350ms   Animation complete             Fully highlighted
        
        User moves mouse away          
        
360ms   onMouseLeave fires             Clearing...
        
370ms   clearHighlight() called        Updating state
        
380ms   Visual effects removed         Animating out...
        
680ms   Animation complete             No highlights
```

## Visual States

### State 1: No Highlights

```
Chart A:  ● ● ● ● ●    Chart B:  ▬ ▬ ▬ ▬ ▬
          (all normal)           (all normal)
```

### State 2: Single Chart Highlight

```
Chart A:  ● ● ◉ ● ●    Chart B:  ▬ ▬ ▬ ▬ ▬
          (point 3)              (no change)
```

### State 3: Cross-Chart Highlight

```
Chart A:  ● ● ◉ ● ●    Chart B:  ▬ ▬ ▬▬ ▬ ▬
          (point 3)              (bar 3)
          
Both highlighted because they share the same date value
```

### State 4: Multiple Highlights

```
Chart A:  ● ◉ ● ◉ ●    Chart B:  ▬ ▬▬ ▬ ▬▬ ▬
          (2 & 4)                (2 & 4)
          
Multiple points can be highlighted simultaneously
```

## Color Coding

### Default Colors

```
Primary Highlight:   #2563eb (Blue)
Secondary Highlight: #10b981 (Green)
Warning Highlight:   #f59e0b (Orange)
Error Highlight:     #ef4444 (Red)
```

### Color Usage

```
┌─────────────────────────────────────────────┐
│  Data Point States                          │
├─────────────────────────────────────────────┤
│  ● Normal      (default color)              │
│  ◉ Highlighted (blue glow + scale)          │
│  ○ Hovered     (subtle highlight)           │
│  ◎ Selected    (strong highlight)           │
│  ⊗ Disabled    (gray, no interaction)       │
└─────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (>1024px)

```
┌─────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Chart A    │  │   Chart B    │            │
│  │              │  │              │            │
│  │   ● ● ◉ ●   │  │   ▬ ▬ ▬▬ ▬   │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  Side-by-side layout                           │
│  Full highlight effects                        │
└─────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌─────────────────────────────────┐
│  ┌──────────────┐               │
│  │   Chart A    │               │
│  │   ● ● ◉ ●   │               │
│  └──────────────┘               │
│  ┌──────────────┐               │
│  │   Chart B    │               │
│  │   ▬ ▬ ▬▬ ▬   │               │
│  └──────────────┘               │
│                                 │
│  Stacked layout                │
│  Full highlight effects        │
└─────────────────────────────────┘
```

### Mobile (<768px)

```
┌─────────────────┐
│  ┌───────────┐  │
│  │  Chart A  │  │
│  │  ● ● ◉ ● │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │  Chart B  │  │
│  │  ▬ ▬ ▬▬ ▬ │  │
│  └───────────┘  │
│                 │
│  Stacked        │
│  Simplified     │
│  effects        │
└─────────────────┘
```

## Animation Sequence

### Highlight Animation (300ms)

```
Frame 0ms:    ●  (normal)
Frame 50ms:   ◉  (starting to glow)
Frame 100ms:  ◉  (growing)
Frame 150ms:  ◉  (more glow)
Frame 200ms:  ◉  (almost there)
Frame 250ms:  ◉  (nearly complete)
Frame 300ms:  ◉  (fully highlighted)
```

### Clear Animation (300ms)

```
Frame 0ms:    ◉  (fully highlighted)
Frame 50ms:   ◉  (starting to fade)
Frame 100ms:  ◉  (shrinking)
Frame 150ms:  ◉  (less glow)
Frame 200ms:  ◉  (almost gone)
Frame 250ms:  ◉  (nearly normal)
Frame 300ms:  ●  (back to normal)
```

## Touch Interaction

### Mobile Touch Flow

```
┌─────────────────────────────────────────┐
│  1. User taps point                     │
│     ↓                                   │
│  2. Touch event captured                │
│     ↓                                   │
│  3. Highlight applied                   │
│     ↓                                   │
│  4. Visual feedback (haptic optional)   │
│     ↓                                   │
│  5. Related charts update               │
│     ↓                                   │
│  6. User taps elsewhere or swipes       │
│     ↓                                   │
│  7. Highlight clears                    │
└─────────────────────────────────────────┘
```

## Accessibility Visual Indicators

### Focus States

```
Normal:      ●
Focused:     ⊙  (outline ring)
Highlighted: ◉  (glow + scale)
Both:        ⊙◉ (outline + glow + scale)
```

### Screen Reader Announcements

```
"Data point selected: January 2024, value 100"
"Related points highlighted in 2 other charts"
"Press Escape to clear highlights"
```

## Performance Visualization

### Render Timeline

```
User Click
    │
    ├─ 0-10ms:   Event handling
    ├─ 10-20ms:  State update
    ├─ 20-30ms:  Context propagation
    ├─ 30-50ms:  Component re-renders
    ├─ 50-350ms: CSS animations
    └─ 350ms:    Complete
    
Total: <350ms (feels instant to user)
```

### Memory Usage

```
Base:           1KB per chart
With highlight: +0.5KB per highlight
Relationships:  +0.1KB per relationship

Example (5 charts, 3 highlights, 10 relationships):
5KB + 1.5KB + 1KB = 7.5KB total
```

## Conclusion

This visual guide demonstrates the cross-chart highlighting system's behavior, states, and interactions. The system provides clear visual feedback while maintaining performance and accessibility.

For implementation details, see:
- `CROSS_CHART_HIGHLIGHTING_README.md` - Complete API documentation
- `CROSS_CHART_INTEGRATION_GUIDE.md` - Integration instructions
- `CrossChartHighlightExample.tsx` - Working code examples
