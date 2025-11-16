# Insight Display Components

Professional insight display system for DataStory with filtering, sorting, and interactive features.

## Components

### InsightCard
Individual insight card with expandable details, impact indicators, and chart navigation.

### InsightPanel
Complete insights panel with sorting, filtering, export, and collapsible interface.

## Quick Start

```typescript
import { InsightPanel } from '@/components/insights';

function MyStoryViewer({ story }) {
  return (
    <div>
      {/* Your story content */}
      
      {/* Insights Panel */}
      {story.statistics.insights && story.statistics.insights.length > 0 && (
        <InsightPanel
          insights={story.statistics.insights}
          onChartClick={(chartId) => {
            const element = document.querySelector(`[data-chart-id="${chartId}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />
      )}
    </div>
  );
}
```

## Props

### InsightCard

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `insight` | `Insight` | Yes | Insight data object |
| `onChartClick` | `(chartId: string) => void` | No | Handler for chart navigation |

### InsightPanel

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `insights` | `Insight[]` | Yes | Array of insight objects |
| `onChartClick` | `(chartId: string) => void` | No | Handler for chart navigation |
| `onExport` | `() => void` | No | Custom export handler |
| `className` | `string` | No | Additional CSS classes |

## Insight Data Structure

```typescript
interface Insight {
  type: 'trend' | 'correlation' | 'outlier' | 'distribution' | 'seasonality' | 'anomaly' | 'inflection';
  title: string;
  description: string;
  significance: number; // 0-1 scale
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
  relatedChartId?: string;
  metadata?: Record<string, unknown>;
}
```

## Features

### Sorting
- By significance (default)
- By impact level
- By insight type

### Filtering
- Filter by insight type
- Show all or specific types
- Count display for each filter

### Export
- Export as JSON
- Custom export handler support
- Automatic filename with date

### Navigation
- Jump to related charts
- Smooth scroll behavior
- Custom navigation handler support

### Visual Design
- Color-coded impact levels
- Type-specific icons
- Significance scoring
- Expandable details
- Responsive layout

## Examples

### Basic Usage

```typescript
<InsightPanel
  insights={[
    {
      type: 'trend',
      title: 'Strong Upward Trend',
      description: 'Sales increased 45% this quarter',
      significance: 0.92,
      impact: 'high',
      recommendation: 'Increase inventory',
      relatedChartId: 'chart-1'
    }
  ]}
/>
```

### With Custom Handlers

```typescript
<InsightPanel
  insights={insights}
  onChartClick={(chartId) => {
    router.push(`/story/${storyId}#${chartId}`);
  }}
  onExport={() => {
    // Custom export logic
    exportToCSV(insights);
  }}
  className="my-4"
/>
```

### Individual Card

```typescript
<InsightCard
  insight={insight}
  onChartClick={(chartId) => {
    console.log('Navigate to:', chartId);
  }}
/>
```

## Styling

Components use the DataStory design system:
- Dark theme (`bg-[#0A0A0A]`)
- Subtle borders (`border-white/10`)
- Color-coded impact levels
- Smooth transitions
- Responsive design

## Impact Colors

- **High:** Red (`bg-red-500/10`, `border-red-500/50`)
- **Medium:** Yellow (`bg-yellow-500/10`, `border-yellow-500/50`)
- **Low:** Blue (`bg-blue-500/10`, `border-blue-500/50`)

## Insight Type Icons

Each type has a unique icon:
- **Trend:** Upward line chart
- **Correlation:** Connected scatter
- **Outlier:** Warning triangle
- **Distribution:** Bar chart
- **Seasonality:** Circular arrows
- **Anomaly:** Lightning bolt
- **Inflection:** Bidirectional arrows
