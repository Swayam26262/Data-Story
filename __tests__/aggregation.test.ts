/**
 * Tests for data aggregation and time period comparison functionality
 */

import {
  aggregateData,
  compareTimePeriods,
  detectDateField,
  detectValueFields,
  type AggregationLevel,
  type ComparisonType,
} from '@/lib/aggregation';
import type { ChartDataPoint } from '@/lib/models/Story';

describe('Data Aggregation', () => {
  const sampleData: ChartDataPoint[] = [
    { date: '2024-01-01', value: 100, category: 'A' },
    { date: '2024-01-02', value: 150, category: 'A' },
    { date: '2024-01-03', value: 120, category: 'A' },
    { date: '2024-01-08', value: 200, category: 'B' },
    { date: '2024-01-09', value: 180, category: 'B' },
    { date: '2024-02-01', value: 220, category: 'A' },
    { date: '2024-02-15', value: 250, category: 'B' },
  ];

  describe('detectDateField', () => {
    it('should detect common date field names', () => {
      const result = detectDateField(sampleData);
      expect(result).toBe('date');
    });

    it('should return null for data without date fields', () => {
      const data = [{ value: 100, category: 'A' }];
      const result = detectDateField(data);
      expect(result).toBeNull();
    });
  });

  describe('detectValueFields', () => {
    it('should detect numeric fields', () => {
      const result = detectValueFields(sampleData, ['date']);
      expect(result).toContain('value');
      expect(result).not.toContain('date');
      expect(result).not.toContain('category');
    });
  });

  describe('aggregateData', () => {
    it('should aggregate data by week', () => {
      const result = aggregateData(sampleData, 'date', ['value'], 'weekly', 'sum');
      expect(result.length).toBeLessThan(sampleData.length);
      expect(result.every((point) => 'value' in point)).toBe(true);
    });

    it('should aggregate data by month', () => {
      const result = aggregateData(sampleData, 'date', ['value'], 'monthly', 'sum');
      expect(result.length).toBe(2); // January and February
    });

    it('should calculate average when using avg function', () => {
      const result = aggregateData(sampleData, 'date', ['value'], 'monthly', 'avg');
      expect(result.length).toBe(2);
      // January average: (100 + 150 + 120 + 200 + 180) / 5 = 150
      expect(result[0].value).toBeCloseTo(150, 0);
    });

    it('should handle empty data', () => {
      const result = aggregateData([], 'date', ['value'], 'daily', 'sum');
      expect(result).toEqual([]);
    });
  });

  describe('compareTimePeriods', () => {
    const timeSeriesData: ChartDataPoint[] = [
      { date: '2023-12-01', value: 100 },
      { date: '2023-12-15', value: 120 },
      { date: '2024-01-01', value: 150 },
      { date: '2024-01-15', value: 180 },
    ];

    it('should compare year over year', () => {
      const result = compareTimePeriods(
        timeSeriesData,
        'date',
        ['value'],
        'YoY',
        'monthly'
      );
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.percentageChange).toBeDefined();
    });

    it('should return original data when comparison is none', () => {
      const result = compareTimePeriods(
        timeSeriesData,
        'date',
        ['value'],
        'none',
        'daily'
      );
      expect(result.current).toEqual(timeSeriesData);
      expect(result.previous).toEqual([]);
      expect(result.percentageChange).toBe(0);
    });

    it('should handle empty data', () => {
      const result = compareTimePeriods([], 'date', ['value'], 'YoY', 'daily');
      expect(result.current).toEqual([]);
      expect(result.previous).toEqual([]);
      expect(result.percentageChange).toBe(0);
    });
  });
});
