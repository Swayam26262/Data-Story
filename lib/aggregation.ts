/**
 * Data Aggregation Utilities
 * Provides functions for aggregating time-series data at different levels
 * and comparing across time periods
 */

import { ChartDataPoint } from '@/lib/models/Story';

/**
 * Aggregation levels supported
 */
export type AggregationLevel = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Time period comparison types
 */
export type ComparisonType = 'YoY' | 'MoM' | 'QoQ' | 'WoW' | 'none';

/**
 * Aggregation function types
 */
export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count';

/**
 * Comparison result with current and previous period data
 */
export interface ComparisonResult {
  current: ChartDataPoint[];
  previous: ChartDataPoint[];
  percentageChange: number;
}

/**
 * Parse date string to Date object
 */
function parseDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  return new Date(dateStr);
}

/**
 * Get the start of week (Monday)
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the start of month
 */
function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the start of quarter
 */
function getStartOfQuarter(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

/**
 * Get the start of year
 */
function getStartOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Format date based on aggregation level
 */
function formatDateKey(date: Date, level: AggregationLevel): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (level) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      const weekStart = getStartOfWeek(date);
      return `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getDate() + 6) / 7)).padStart(2, '0')}`;
    case 'monthly':
      return `${year}-${month}`;
    case 'quarterly':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    case 'yearly':
      return `${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Get period key based on aggregation level
 */
function getPeriodKey(date: Date, level: AggregationLevel): string {
  switch (level) {
    case 'daily':
      return formatDateKey(date, 'daily');
    case 'weekly':
      return formatDateKey(getStartOfWeek(date), 'weekly');
    case 'monthly':
      return formatDateKey(getStartOfMonth(date), 'monthly');
    case 'quarterly':
      return formatDateKey(getStartOfQuarter(date), 'quarterly');
    case 'yearly':
      return formatDateKey(getStartOfYear(date), 'yearly');
    default:
      return formatDateKey(date, 'daily');
  }
}

/**
 * Apply aggregation function to array of values
 */
function applyAggregation(values: number[], func: AggregationFunction): number {
  if (values.length === 0) return 0;

  switch (func) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'avg':
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'count':
      return values.length;
    default:
      return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

/**
 * Aggregate time-series data to specified level
 */
export function aggregateData(
  data: ChartDataPoint[],
  dateField: string,
  valueFields: string[],
  level: AggregationLevel,
  aggregationFunc: AggregationFunction = 'sum'
): ChartDataPoint[] {
  if (!data || data.length === 0) return [];

  // Group data by period
  const grouped = new Map<string, ChartDataPoint[]>();

  data.forEach((point) => {
    const dateValue = point[dateField];
    if (!dateValue) return;

    const date = parseDate(dateValue as string | Date);
    const periodKey = getPeriodKey(date, level);

    if (!grouped.has(periodKey)) {
      grouped.set(periodKey, []);
    }
    grouped.get(periodKey)!.push(point);
  });

  // Aggregate values for each period
  const aggregated: ChartDataPoint[] = [];

  grouped.forEach((points, periodKey) => {
    const aggregatedPoint: ChartDataPoint = {
      [dateField]: periodKey,
    };

    // Aggregate each value field
    valueFields.forEach((field) => {
      const values = points
        .map((p) => p[field])
        .filter((v) => typeof v === 'number') as number[];

      if (values.length > 0) {
        aggregatedPoint[field] = applyAggregation(values, aggregationFunc);
      }
    });

    // Copy non-numeric fields from first point
    Object.keys(points[0]).forEach((key) => {
      if (key !== dateField && !valueFields.includes(key)) {
        aggregatedPoint[key] = points[0][key];
      }
    });

    aggregated.push(aggregatedPoint);
  });

  // Sort by date
  return aggregated.sort((a, b) => {
    const dateA = a[dateField] as string;
    const dateB = b[dateField] as string;
    return dateA.localeCompare(dateB);
  });
}

/**
 * Get previous period date based on comparison type
 */
function getPreviousPeriodDate(date: Date, comparisonType: ComparisonType): Date {
  const d = new Date(date);

  switch (comparisonType) {
    case 'YoY':
      d.setFullYear(d.getFullYear() - 1);
      break;
    case 'MoM':
      d.setMonth(d.getMonth() - 1);
      break;
    case 'QoQ':
      d.setMonth(d.getMonth() - 3);
      break;
    case 'WoW':
      d.setDate(d.getDate() - 7);
      break;
    default:
      return d;
  }

  return d;
}

/**
 * Compare current period with previous period
 */
export function compareTimePeriods(
  data: ChartDataPoint[],
  dateField: string,
  valueFields: string[],
  comparisonType: ComparisonType,
  aggregationLevel: AggregationLevel = 'daily'
): ComparisonResult {
  if (!data || data.length === 0 || comparisonType === 'none') {
    return {
      current: data,
      previous: [],
      percentageChange: 0,
    };
  }

  // First aggregate data to the specified level
  const aggregated = aggregateData(data, dateField, valueFields, aggregationLevel);

  // Find the date range
  const dates = aggregated
    .map((p) => parseDate(p[dateField] as string))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return {
      current: aggregated,
      previous: [],
      percentageChange: 0,
    };
  }

  const latestDate = dates[dates.length - 1];
  const earliestDate = dates[0];

  // Calculate the comparison period
  const comparisonStartDate = getPreviousPeriodDate(earliestDate, comparisonType);
  const comparisonEndDate = getPreviousPeriodDate(latestDate, comparisonType);

  // Split data into current and previous periods
  const current: ChartDataPoint[] = [];
  const previous: ChartDataPoint[] = [];

  aggregated.forEach((point) => {
    const date = parseDate(point[dateField] as string);
    const time = date.getTime();

    if (time >= earliestDate.getTime() && time <= latestDate.getTime()) {
      current.push(point);
    }

    if (time >= comparisonStartDate.getTime() && time <= comparisonEndDate.getTime()) {
      // Shift the date to align with current period for comparison
      const shiftedPoint = { ...point };
      const shiftedDate = new Date(date);

      switch (comparisonType) {
        case 'YoY':
          shiftedDate.setFullYear(shiftedDate.getFullYear() + 1);
          break;
        case 'MoM':
          shiftedDate.setMonth(shiftedDate.getMonth() + 1);
          break;
        case 'QoQ':
          shiftedDate.setMonth(shiftedDate.getMonth() + 3);
          break;
        case 'WoW':
          shiftedDate.setDate(shiftedDate.getDate() + 7);
          break;
      }

      shiftedPoint[dateField] = formatDateKey(shiftedDate, aggregationLevel);
      previous.push(shiftedPoint);
    }
  });

  // Calculate percentage change
  const currentTotal = current.reduce((sum, point) => {
    const value = valueFields.reduce((fieldSum, field) => {
      return fieldSum + (typeof point[field] === 'number' ? (point[field] as number) : 0);
    }, 0);
    return sum + value;
  }, 0);

  const previousTotal = previous.reduce((sum, point) => {
    const value = valueFields.reduce((fieldSum, field) => {
      return fieldSum + (typeof point[field] === 'number' ? (point[field] as number) : 0);
    }, 0);
    return sum + value;
  }, 0);

  const percentageChange =
    previousTotal !== 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  return {
    current,
    previous,
    percentageChange,
  };
}

/**
 * Detect date field in data
 */
export function detectDateField(data: ChartDataPoint[]): string | null {
  if (!data || data.length === 0) return null;

  const firstPoint = data[0];
  const dateFields = ['date', 'time', 'timestamp', 'datetime', 'period'];

  // Check common date field names
  for (const field of dateFields) {
    if (field in firstPoint) {
      return field;
    }
  }

  // Check for fields that look like dates
  for (const key of Object.keys(firstPoint)) {
    const value = firstPoint[key];
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return key;
      }
    }
  }

  return null;
}

/**
 * Detect numeric value fields in data
 */
export function detectValueFields(data: ChartDataPoint[], excludeFields: string[] = []): string[] {
  if (!data || data.length === 0) return [];

  const firstPoint = data[0];
  const valueFields: string[] = [];

  Object.keys(firstPoint).forEach((key) => {
    if (excludeFields.includes(key)) return;

    const value = firstPoint[key];
    if (typeof value === 'number') {
      valueFields.push(key);
    }
  });

  return valueFields;
}