# Data Aggregation and Time Period Comparison

This document describes the aggregation and time period comparison features implemented for professional data visualization.

## Overview

The aggregation system allows users to view time-series data at different granularities (daily, weekly, monthly, quarterly, yearly) and compare current periods with previous periods (Week-over-Week, Month-over-Month, Quarter-over-Quarter, Year-over-Year).

## Features

### 1. Aggregation Levels

Users can aggregate time-series data at the following levels:

- **Daily**: No aggregation, shows raw daily data
- **Weekly**: Aggregates data by week (Monday to Sunday)
- **Monthly**: Aggregates data by calendar month
- **Quarterly**: Aggregates data by quarter (Q1-Q4)
- **Yearly**: Aggregates data by calendar year

### 2. Aggregation Functions

The system supports multiple aggregation functions:

- **Sum**: Total of all values in the period
- **Average**: Mean of all values in the period
- **Min**: Minimum value in the period
- **Max**: Maximum value in the period
- **Count**: Number of data points in the period

### 3. Time Period Comparisons

Users can compare current data with previous periods:

- **WoW (Week over Week)**: Compare with data from 7 days ago
- **MoM (Month over Month)**: Compare with data from 1 month ago
- **QoQ (Quarter over Quarter)**: Compare with data from 3 months ago
- **YoY (Year over Year)**: Compare with data from 1 year ago

### 4. Comparison Visualization

When comparison is enabled:
- Current period data is shown as a solid line
- Previous period data is shown as a dashed line
- Percentage change is displayed with color coding:
  - Green: Positive change (increase)
  - Red: Negative change (decrease)
  - Gray: No change

## Components

### AggregationControls

A control panel component that allows users to select aggregation level and comparison type.

```tsx
import AggregationControls from '@/components/AggregationControls';

<AggregationControls
  aggregationLevel={aggregationLevel}
  comparisonType={comparisonType}
  onAggregationChange={setAggregationLevel}
  onComparisonChange={setComparisonType}
  disabled={false}
/>
```

### ComparisonOverlay

A visual component that displays comparison metrics and percentage change.

```tsx
import ComparisonOverlay from '@/components/ComparisonOverlay';

<ComparisonOverlay
  percentageChange={15.5}
  comparisonType="YoY"
  currentTotal={1000}
  previousTotal={865}
/>
```

### AggregatedChart

A chart wrapper that supports aggregation and comparison overlays.

```tsx
import { AggregatedChart } from '@/components/charts';

<AggregatedChart
  chartId="chart-1"
  type="line"
  title="Revenue Over Time"
  data={chartData}
  config={chartConfig}
  comparisonResult={comparisonResult}
  showComparison={true}
/>
```

## Hooks

### useAggregation

A React hook that manages aggregation state and data transformation.

```tsx
import { useAggregation } from '@/lib/hooks/useAggregation';

const {
  aggregationLevel,
  comparisonType,
  aggregatedData,
  comparisonResult,
  setAggregationLevel,
  setComparisonType,
  isAggregated,
  hasComparison,
} = useAggregation(chartData, {
  initialAggregationLevel: 'daily',
  initialComparisonType: 'none',
  dateField: 'date',
  valueFields: ['value'],
});
```

## Utility Functions

### aggregateData

Aggregates time-series data to a specified level.

```typescript
import { aggregateData } from '@/lib/aggregation';

const aggregated = aggregateData(
  data,
  'date',           // Date field name
  ['value'],        // Value fields to aggregate
  'monthly',        // Aggregation level
  'sum'            // Aggregation function
);
```

### compareTimePeriods

Compares current period with previous period.

```typescript
import { compareTimePeriods } from '@/lib/aggregation';

const comparison = compareTimePeriods(
  data,
  'date',
  ['value'],
  'YoY',           // Comparison type
  'monthly'        // Aggregation level
);

console.log(comparison.percentageChange); // e.g., 15.5
```

### detectDateField

Automatically detects the date field in a dataset.

```typescript
import { detectDateField } from '@/lib/aggregation';

const dateField = detectDateField(data);
// Returns: 'date', 'timestamp', 'datetime', etc.
```

### detectValueFields

Automatically detects numeric value fields in a dataset.

```typescript
import { detectValueFields } from '@/lib/aggregation';

const valueFields = detectValueFields(data, ['date']);
// Returns: ['value', 'amount', 'count', etc.]
```

## Integration with StoryViewer

The StoryViewer component automatically integrates aggregation controls when time-series data is detected:

1. Detects if any chart contains time-series data
2. Shows aggregation controls at the top of the story
3. Applies aggregation and comparison to all compatible charts
4. Updates charts dynamically when controls change

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 3.8**: Interactive controls for switching between aggregation levels
- **Requirement 6.4**: Time period comparison with overlay visualization

## Technical Details

### Date Handling

- Dates are parsed using JavaScript's `Date` object
- Week starts on Monday (ISO 8601 standard)
- Quarters are: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)

### Performance

- Aggregation is memoized to prevent unnecessary recalculations
- Large datasets are handled efficiently with O(n) complexity
- Comparison calculations are cached

### Accessibility

- All controls have proper ARIA labels
- Minimum touch target size of 44x44 pixels
- Keyboard navigation support
- Color-blind safe color schemes

## Testing

Tests are located in `__tests__/aggregation.test.ts` and cover:

- Date field detection
- Value field detection
- Data aggregation at all levels
- Time period comparisons
- Edge cases (empty data, missing fields)

Run tests with:
```bash
npm test -- aggregation.test.ts
```

## Future Enhancements

Potential improvements for future iterations:

1. Custom date ranges for comparison
2. Multiple comparison overlays on the same chart
3. Aggregation presets (e.g., "Last 7 days", "This month")
4. Export aggregated data
5. Comparison annotations on charts
6. Rolling averages and moving windows
7. Seasonal adjustment options
8. Custom aggregation functions
