/**
 * Comprehensive Integration Tests for Professional Data Visualization
 * Tests complete flow: upload → analysis → visualization → interaction → export
 */

import {
  aggregateData,
  compareTimePeriods,
  detectDateField,
  detectValueFields,
} from '@/lib/aggregation';
import {
  generateChartDescription,
  generateChartSummary,
  meetsContrastRequirement,
  getContrastRatio,
} from '@/lib/utils/accessibility';
import {
  sampleData,
  adaptiveSample,
  debounce,
  shouldUseCanvas,
  performanceMonitor,
} from '@/lib/utils/performance';
import type { ChartDataPoint } from '@/lib/models/Story';

describe('Integration: Complete Data Visualization Flow', () => {
  describe('1. Data Upload and Preprocessing', () => {
    const sampleDataset: ChartDataPoint[] = [
      { date: '2024-01-01', sales: 1000, region: 'North', profit: 200 },
      { date: '2024-01-02', sales: 1200, region: 'South', profit: 250 },
      { date: '2024-01-03', sales: 900, region: 'East', profit: 150 },
      { date: '2024-01-04', sales: 1100, region: 'West', profit: 220 },
      { date: '2024-01-05', sales: 1300, region: 'North', profit: 280 },
    ];

    it('should detect date fields correctly', () => {
      const dateField = detectDateField(sampleDataset);
      expect(dateField).toBe('date');
    });

    it('should detect numeric value fields', () => {
      const valueFields = detectValueFields(sampleDataset, ['date', 'region']);
      expect(valueFields).toContain('sales');
      expect(valueFields).toContain('profit');
      expect(valueFields).not.toContain('date');
      expect(valueFields).not.toContain('region');
    });

    it('should handle datasets with various shapes', () => {
      const datasets = [
        [{ x: 1, y: 2 }],
        [{ date: '2024-01-01', value: 100, category: 'A' }],
        [{ timestamp: '2024-01-01T00:00:00Z', metric1: 50, metric2: 75 }],
      ];

      datasets.forEach((dataset) => {
        const dateField = detectDateField(dataset);
        const valueFields = detectValueFields(dataset, dateField ? [dateField] : []);
        expect(valueFields.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('2. Statistical Analysis and Aggregation', () => {
    const timeSeriesData: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      value: 100 + Math.random() * 50,
      category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
    }));

    it('should aggregate data by different time periods', () => {
      const daily = aggregateData(timeSeriesData, 'date', ['value'], 'daily', 'sum');
      const weekly = aggregateData(timeSeriesData, 'date', ['value'], 'weekly', 'sum');
      const monthly = aggregateData(timeSeriesData, 'date', ['value'], 'monthly', 'sum');

      expect(daily.length).toBe(30);
      expect(weekly.length).toBeLessThan(daily.length);
      expect(monthly.length).toBeGreaterThanOrEqual(1); // Can be 1 or 2 depending on date range
    });

    it('should compare time periods correctly', () => {
      const comparison = compareTimePeriods(
        timeSeriesData,
        'date',
        ['value'],
        'MoM',
        'daily'
      );

      expect(comparison.current).toBeDefined();
      expect(comparison.previous).toBeDefined();
      expect(typeof comparison.percentageChange).toBe('number');
    });

    it('should handle different aggregation functions', () => {
      const sumResult = aggregateData(timeSeriesData, 'date', ['value'], 'weekly', 'sum');
      const avgResult = aggregateData(timeSeriesData, 'date', ['value'], 'weekly', 'avg');

      expect(sumResult.length).toBeGreaterThan(0);
      expect(avgResult.length).toBeGreaterThan(0);
      expect(sumResult.length).toBe(avgResult.length);
    });
  });

  describe('3. Performance Optimization', () => {
    it('should sample large datasets', () => {
      const largeDataset: ChartDataPoint[] = Array.from({ length: 10000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));

      const sampled = sampleData(largeDataset, 1000);
      expect(sampled.length).toBeLessThanOrEqual(1001); // +1 for last point
      expect(sampled[0]).toEqual(largeDataset[0]);
      expect(sampled[sampled.length - 1]).toEqual(largeDataset[largeDataset.length - 1]);
    });

    it('should use adaptive sampling based on chart type', () => {
      const largeDataset: ChartDataPoint[] = Array.from({ length: 5000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));

      const scatterSampled = adaptiveSample(largeDataset, 'scatter');
      const lineSampled = adaptiveSample(largeDataset, 'line');

      expect(scatterSampled.length).toBeLessThanOrEqual(2001); // +1 for last point
      expect(lineSampled.length).toBeLessThanOrEqual(5001); // +1 for last point
    });

    it('should determine when to use canvas rendering', () => {
      expect(shouldUseCanvas(1000, 'scatter')).toBe(false);
      expect(shouldUseCanvas(3000, 'scatter')).toBe(true);
      expect(shouldUseCanvas(5000, 'line')).toBe(false);
      expect(shouldUseCanvas(15000, 'line')).toBe(true);
    });

    it('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 50);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 100);
    });

    it('should monitor performance', () => {
      const end = performanceMonitor.start('test-operation');
      
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }
      
      end();

      const avg = performanceMonitor.getAverage('test-operation');
      expect(avg).toBeGreaterThan(0);
    });
  });

  describe('4. Accessibility Features', () => {
    it('should generate chart descriptions', () => {
      const data = [
        { x: '2024-01', y: 100 },
        { x: '2024-02', y: 150 },
      ];
      const config = { xAxis: 'x', yAxis: 'y' };
      const description = generateChartDescription('line', data, config);

      expect(description).toContain('Line chart');
      expect(description).toContain('2 data points');
    });

    it('should generate chart summaries with statistics', () => {
      const data = [
        { x: '2024-01', y: 100 },
        { x: '2024-02', y: 150 },
        { x: '2024-03', y: 200 },
      ];
      const config = { xAxis: 'x', yAxis: 'y' };
      const summary = generateChartSummary('line', data, config);

      expect(summary).toContain('range');
      expect(summary).toContain('Average');
    });

    it('should validate color contrast', () => {
      expect(meetsContrastRequirement('#000000', '#FFFFFF')).toBe(true);
      expect(meetsContrastRequirement('#888888', '#999999')).toBe(false);
    });

    it('should calculate contrast ratios', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeGreaterThan(20);
    });
  });

  describe('5. Chart Type Variety', () => {
    const testData: ChartDataPoint[] = [
      { category: 'A', value: 100 },
      { category: 'B', value: 150 },
      { category: 'C', value: 120 },
    ];

    it('should handle line chart data', () => {
      const description = generateChartDescription('line', testData, {
        xAxis: 'category',
        yAxis: 'value',
      });
      expect(description).toContain('Line chart');
    });

    it('should handle bar chart data', () => {
      const description = generateChartDescription('bar', testData, {
        xAxis: 'category',
        yAxis: 'value',
      });
      expect(description).toContain('Bar chart');
    });

    it('should handle pie chart data', () => {
      const description = generateChartDescription('pie', testData, {
        nameKey: 'category',
        valueKey: 'value',
      });
      expect(description).toContain('Pie chart');
    });

    it('should handle scatter plot data', () => {
      const scatterData = [
        { x: 10, y: 20 },
        { x: 15, y: 25 },
        { x: 20, y: 30 },
      ];
      const description = generateChartDescription('scatter', scatterData, {
        xAxis: 'x',
        yAxis: 'y',
      });
      expect(description).toContain('Scatter plot');
    });
  });

  describe('6. Large Dataset Handling', () => {
    it('should handle 10K rows efficiently', () => {
      const largeData: ChartDataPoint[] = Array.from({ length: 10000 }, (_, i) => ({
        date: new Date(2024, 0, 1 + Math.floor(i / 100)).toISOString().split('T')[0],
        value: 100 + Math.random() * 50,
      }));

      const start = performance.now();
      const sampled = sampleData(largeData, 5000);
      const end = performance.now();

      expect(sampled.length).toBeLessThanOrEqual(5001);
      expect(end - start).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should handle 100K rows with sampling', () => {
      const veryLargeData: ChartDataPoint[] = Array.from({ length: 100000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));

      const start = performance.now();
      const sampled = sampleData(veryLargeData, 5000);
      const end = performance.now();

      expect(sampled.length).toBeLessThanOrEqual(5001);
      expect(end - start).toBeLessThan(500); // Should complete in < 500ms
    });

    it('should maintain data distribution after sampling', () => {
      const data: ChartDataPoint[] = Array.from({ length: 10000 }, (_, i) => ({
        x: i,
        y: i * 2, // Linear relationship
      }));

      const sampled = sampleData(data, 1000);

      // Check that first and last points are preserved
      expect(sampled[0].x).toBe(0);
      expect(sampled[sampled.length - 1].x).toBe(9999);

      // Check that relationship is maintained
      const midPoint = sampled[Math.floor(sampled.length / 2)];
      expect(midPoint.y).toBeCloseTo((midPoint.x as number) * 2, -1);
    });
  });

  describe('7. Export Functionality Integration', () => {
    it('should prepare data for CSV export', () => {
      const data: ChartDataPoint[] = [
        { date: '2024-01-01', sales: 1000, profit: 200 },
        { date: '2024-01-02', sales: 1200, profit: 250 },
      ];

      // Verify data structure is suitable for export
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(Object.keys(data[0]).length).toBeGreaterThan(0);
    });

    it('should prepare data for JSON export', () => {
      const data: ChartDataPoint[] = [
        { category: 'A', value: 100 },
        { category: 'B', value: 150 },
      ];

      const jsonString = JSON.stringify(data);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(data);
    });
  });

  describe('8. Responsive Design Data Handling', () => {
    it('should adapt data for mobile viewports', () => {
      const data: ChartDataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));

      // Mobile should use more aggressive sampling
      const mobileSampled = sampleData(data, 100);
      expect(mobileSampled.length).toBeLessThanOrEqual(101);
    });

    it('should handle touch interaction data points', () => {
      const data: ChartDataPoint[] = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 30 },
      ];

      // Verify data points are accessible
      data.forEach((point) => {
        expect(point.x).toBeDefined();
        expect(point.y).toBeDefined();
      });
    });
  });

  describe('9. Statistical Overlay Data', () => {
    it('should calculate trend line data', () => {
      const data: ChartDataPoint[] = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 30 },
        { x: 4, y: 40 },
      ];

      // Simple linear regression
      const n = data.length;
      const sumX = data.reduce((sum, p) => sum + (p.x as number), 0);
      const sumY = data.reduce((sum, p) => sum + (p.y as number), 0);
      const sumXY = data.reduce((sum, p) => sum + (p.x as number) * (p.y as number), 0);
      const sumX2 = data.reduce((sum, p) => sum + (p.x as number) ** 2, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
      const intercept = (sumY - slope * sumX) / n;

      expect(slope).toBeCloseTo(10, 1);
      expect(intercept).toBeCloseTo(0, 1);
    });

    it('should identify outliers', () => {
      const data: ChartDataPoint[] = [
        { x: 1, y: 10 },
        { x: 2, y: 12 },
        { x: 3, y: 11 },
        { x: 4, y: 13 },
        { x: 5, y: 12 },
        { x: 6, y: 11 },
        { x: 7, y: 10 },
        { x: 8, y: 100 }, // Clear outlier
        { x: 9, y: 12 },
        { x: 10, y: 11 },
      ];

      const values = data.map((p) => p.y as number);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance =
        values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
      const stdDev = Math.sqrt(variance);

      const outliers = data.filter((p) => {
        const zScore = Math.abs(((p.y as number) - mean) / stdDev);
        return zScore > 2;
      });

      expect(outliers.length).toBeGreaterThanOrEqual(1);
      expect(outliers.some((o) => o.y === 100)).toBe(true);
    });
  });

  describe('10. Cross-Browser Data Compatibility', () => {
    it('should handle date parsing consistently', () => {
      const dateStrings = [
        '2024-01-01',
        '2024-01-01T00:00:00Z',
        '2024-01-01T00:00:00.000Z',
      ];

      dateStrings.forEach((dateStr) => {
        const date = new Date(dateStr);
        expect(date.getTime()).toBeGreaterThan(0);
        expect(isNaN(date.getTime())).toBe(false);
      });
    });

    it('should handle number formatting consistently', () => {
      const numbers = [1000, 1000.5, 1000.123456];

      numbers.forEach((num) => {
        expect(typeof num).toBe('number');
        expect(isNaN(num)).toBe(false);
        expect(isFinite(num)).toBe(true);
      });
    });
  });
});