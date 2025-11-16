# Enhanced Chart Type System

This directory contains TypeScript type definitions for the professional data visualization system.

## Overview

The enhanced type system supports:
- **Advanced Chart Types**: 8 new chart types (combination, heatmap, boxplot, waterfall, funnel, radar, area, candlestick)
- **Statistical Overlays**: Trend lines, moving averages, confidence intervals, outlier detection
- **Interactive Controls**: Zoom, pan, brush selection, rich tooltips
- **Intelligent Insights**: AI-generated insights with significance ranking
- **Annotations**: Text, lines, and regions for marking up charts

## File Structure

```
types/
├── chart.ts       # All chart-related type definitions
├── index.ts       # Central export file
└── README.md      # This file
```

## Key Interfaces

### Chart Types

```typescript
// Basic chart types (existing)
type ChartType = 'line' | 'bar' | 'scatter' | 'pie';

// Advanced chart types (new)
type AdvancedChartType = 
  | 'combination'
  | 'heatmap'
  | 'boxplot'
  | 'waterfall'
  | 'funnel'
  | 'radar'
  | 'area'
  | 'candlestick';

// All chart types combined
type AllChartTypes = ChartType | AdvancedChartType;
```

### Enhanced Chart Interface

The `IChart` interface has been extended with new optional fields:

```typescript
interface IChart {
  chartId: string;
  type: ChartType | AdvancedChartType;
  title: string;
  data: ChartData;
  config: IChartConfig;
  
  // New fields
  statistics?: StatisticalOverlay;
  interactions?: InteractionConfig;
  insights?: {
    primary: string;
    secondary?: string;
    significance: number;
  };
}
```

### Statistical Overlays

```typescript
interface StatisticalOverlay {
  trendLine?: TrendLineConfig;
  trendLineData?: TrendLineData;
  movingAverage?: MovingAverageConfig;
  movingAverageData?: MovingAverageData[];
  confidenceInterval?: ConfidenceIntervalConfig;
  outliers?: OutlierConfig;
  outlierData?: OutlierData;
  annotations?: Annotation[];
  referenceLines?: ReferenceLine[];
}
```

### Interaction Configuration

```typescript
interface InteractionConfig {
  zoom?: boolean;
  pan?: boolean;
  brush?: boolean;
  crosshair?: boolean;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  zoomPan?: ZoomPanConfig;
  brushConfig?: BrushConfig;
}
```

### Enhanced Statistics

The `IStatistics` interface now extends `EnhancedStatistics`:

```typescript
interface IStatistics extends EnhancedStatistics {
  trends: ITrend[];
  correlations: ICorrelation[];
  distributions: IDistribution[];
  
  // From EnhancedStatistics
  advancedTrends?: AdvancedTrends;
  correlationMatrix?: CorrelationMatrix;
  outlierAnalysis?: OutlierAnalysis[];
  insights?: Insight[];
}
```

### Annotations

```typescript
interface Annotation {
  type: 'text' | 'line' | 'region';
  position: AnnotationPosition;
  content: string;
  style?: AnnotationStyle;
  id?: string;
}
```

### Insights

```typescript
interface Insight {
  type: InsightType;
  title: string;
  description: string;
  significance: number; // 0-1 scale
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
  relatedChartId?: string;
  metadata?: Record<string, unknown>;
}
```

## Usage Examples

### Importing Types

```typescript
// Import specific types
import { AdvancedChartType, StatisticalOverlay, InteractionConfig } from '@/types/chart';

// Import all types
import * from '@/types';
```

### Creating an Enhanced Chart

```typescript
import { IChart, StatisticalOverlay } from '@/types';

const chart: IChart = {
  chartId: 'chart-1',
  type: 'combination',
  title: 'Sales and Revenue Trends',
  data: [...],
  config: {
    xAxis: 'date',
    yAxis: 'value',
  },
  statistics: {
    trendLine: {
      enabled: true,
      type: 'linear',
      showRSquared: true,
    },
    movingAverage: {
      enabled: true,
      periods: [7, 30],
    },
  },
  interactions: {
    zoom: true,
    pan: true,
    tooltip: {
      enabled: true,
      showPercentage: true,
      showRank: true,
    },
  },
  insights: {
    primary: 'Sales increased 45% over the last quarter',
    significance: 0.92,
  },
};
```

### Working with Insights

```typescript
import { Insight, InsightType } from '@/types/chart';

const insights: Insight[] = [
  {
    type: 'trend',
    title: 'Strong Upward Trend',
    description: 'Revenue has increased consistently over the past 6 months',
    significance: 0.95,
    impact: 'high',
    recommendation: 'Continue current strategy and consider scaling operations',
    relatedChartId: 'chart-1',
  },
  {
    type: 'correlation',
    title: 'Marketing Spend Correlation',
    description: 'Strong positive correlation (r=0.87) between marketing spend and sales',
    significance: 0.87,
    impact: 'high',
    recommendation: 'Increase marketing budget to drive more sales',
  },
];
```

### Adding Annotations

```typescript
import { Annotation } from '@/types/chart';

const annotations: Annotation[] = [
  {
    type: 'text',
    position: { x: '2024-01-15', y: 1000 },
    content: 'Product Launch',
    style: {
      color: '#ef4444',
      fontSize: 12,
      fontWeight: 600,
    },
  },
  {
    type: 'line',
    position: { x: 0, y: 500 },
    content: 'Target',
    style: {
      color: '#10b981',
      borderWidth: 2,
    },
  },
];
```

## MongoDB Schema Updates

The Story model schema has been updated to support all new fields:

### Charts Array
- Added new chart types to enum
- Added `statistics` field (Mixed type)
- Added `interactions` field (Mixed type)
- Added `insights` object with primary, secondary, and significance

### Statistics Object
- Added `advancedTrends` field (Mixed type)
- Added `correlationMatrix` field (Mixed type)
- Added `outlierAnalysis` field (Mixed type)
- Added `insights` array (Mixed type)

All new fields are optional to maintain backward compatibility with existing data.

## Backward Compatibility

All new fields are optional, ensuring that:
- Existing stories continue to work without modification
- New features can be adopted incrementally
- The system gracefully handles missing data

## Type Safety

The type system provides:
- **Compile-time validation**: Catch errors before runtime
- **IntelliSense support**: Better developer experience with autocomplete
- **Documentation**: Types serve as inline documentation
- **Refactoring safety**: Changes propagate through the codebase

## Next Steps

1. Implement chart components using these types
2. Update Python backend to generate enhanced statistics
3. Create UI components for interactions and insights
4. Add validation utilities for runtime type checking
