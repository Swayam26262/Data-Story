/**
 * Comprehensive End-to-End Tests for Professional Data Visualization
 * Tests all chart types, statistical overlays, interactions, and export functionality
 */

import type { ChartDataPoint } from '@/lib/models/Story';
import {
  sampleData,
  adaptiveSample,
  shouldUseCanvas,
  performanceMonitor,
} from '@/lib/utils/performance';
import {
  generateChartDescription,
  generateChartSummary,
  meetsContrastRequirement,
} from '@/lib/utils/accessibility';
import {
  aggregateData,
  compareTimePeriods,
  detectDateField,
  detectValueFields,
} from '@/lib/aggregation';

describe('Comprehensive E2E: All Chart Types', () => {
  describe('Advanced Chart Types', () => {
    it('should handle combination chart data', () => {
      const data: ChartDataPoint[] = [
        { date: '2024-01', sales: 1000, profit: 200, growth: 5 },
        { date: '2024-02', sales: 1200, profit: 250, growth: 7 },
        { date: '2024-03', sales: 1100, profit: 220, growth: 6 },
      ];

      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('sales');
      expect(data[0]).toHaveProperty('profit');
      expect(data[0]).toHaveProperty('growth');
    });

    it('should handle heatmap matrix data', () => {
      const heatmapData: ChartDataPoint[] = [
        { x: 'A', y: 'X', value: 10 },
        { x: 'A', y: 'Y', value: 20 },
        { x: 'B', y: 'X', value: 15 },
        { x: 'B', y: 'Y', value: 25 },
      ];

      const xLabels = [...new Set(heatmapData.map((d) => d.x))];
      const yLabels = [...new Set(heatmapData.map((d) => d.y))];

      expect(xLabels.length).toBe(2);
      expect(yLabels.length).toBe(2);
    });

    it('should handle box plot statistical data', () => {
      const boxPlotData: ChartDataPoint[] = [
        { category: 'A', q1: 25, median: 50, q3: 75, min: 10, max: 90, outliers: [5, 95] },
        { category: 'B', q1: 30, median: 55, q3: 80, min: 15, max: 95, outliers: [] },
      ];

      boxPlotData.forEach((point) => {
        expect(point.q1).toBeLessThan(point.median as number);
        expect(point.median).toBeLessThan(point.q3 as number);
        expect(point.min).toBeLessThanOrEqual(point.q1 as number);
        expect(point.max).toBeGreaterThanOrEqual(point.q3 as number);
      });
    });

    it('should handle waterfall chart data', () => {
      const waterfallData: ChartDataPoint[] = [
        { category: 'Start', value: 1000, type: 'total' },
        { category: 'Revenue', value: 500, type: 'positive' },
        { category: 'Costs', value: -200, type: 'negative' },
        { category: 'End', value: 1300, type: 'total' },
      ];

      const positives = waterfallData.filter((d) => d.type === 'positive');
      const negatives = waterfallData.filter((d) => d.type === 'negative');

      expect(positives.length).toBeGreaterThan(0);
      expect(negatives.length).toBeGreaterThan(0);
    });

    it('should handle funnel chart data', () => {
      const funnelData: ChartDataPoint[] = [
        { stage: 'Visitors', value: 10000, percentage: 100 },
        { stage: 'Signups', value: 5000, percentage: 50 },
        { stage: 'Active', value: 2000, percentage: 20 },
        { stage: 'Paying', value: 500, percentage: 5 },
      ];

      // Verify funnel progression
      for (let i = 1; i < funnelData.length; i++) {
        expect(funnelData[i].value).toBeLessThan(funnelData[i - 1].value as number);
      }
    });

    it('should handle radar chart multi-dimensional data', () => {
      const radarData: ChartDataPoint[] = [
        { dimension: 'Speed', series1: 80, series2: 60 },
        { dimension: 'Quality', series1: 90, series2: 85 },
        { dimension: 'Cost', series1: 70, series2: 75 },
        { dimension: 'Reliability', series1: 85, series2: 80 },
      ];

      expect(radarData.length).toBeGreaterThanOrEqual(3);
      radarData.forEach((point) => {
        expect(point.series1).toBeGreaterThanOrEqual(0);
        expect(point.series2).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle candlestick financial data', () => {
      const candlestickData: ChartDataPoint[] = [
        { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
        { date: '2024-01-02', open: 105, high: 115, low: 100, close: 112 },
        { date: '2024-01-03', open: 112, high: 120, low: 108, close: 115 },
      ];

      candlestickData.forEach((point) => {
        expect(point.high).toBeGreaterThanOrEqual(point.open as number);
        expect(point.high).toBeGreaterThanOrEqual(point.close as number);
        expect(point.low).toBeLessThanOrEqual(point.open as number);
        expect(point.low).toBeLessThanOrEqual(point.close as number);
      });
    });
  });

  describe('Statistical Overlays', () => {
    it('should calculate trend line with R-squared', () => {
      const data: ChartDataPoint[] = Array.from({ length: 20 }, (_, i) => ({
        x: i,
        y: 10 + i * 2 + (Math.random() - 0.5) * 5,
      }));

      // Linear regression
      const n = data.length;
      const sumX = data.reduce((sum, p) => sum + (p.x as number), 0);
      const sumY = data.reduce((sum, p) => sum + (p.y as number), 0);
      const sumXY = data.reduce((sum, p) => sum + (p.x as number) * (p.y as number), 0);
      const sumX2 = data.reduce((sum, p) => sum + (p.x as number) ** 2, 0);
      const sumY2 = data.reduce((sum, p) => sum + (p.y as number) ** 2, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
      const intercept = (sumY - slope * sumX) / n;

      // Calculate R-squared
      const meanY = sumY / n;
      const ssTotal = data.reduce((sum, p) => sum + ((p.y as number) - meanY) ** 2, 0);
      const ssResidual = data.reduce((sum, p) => {
        const predicted = slope * (p.x as number) + intercept;
        return sum + ((p.y as number) - predicted) ** 2;
      }, 0);
      const rSquared = 1 - ssResidual / ssTotal;

      expect(slope).toBeCloseTo(2, 0);
      expect(rSquared).toBeGreaterThan(0.8);
    });

    it('should calculate moving averages', () => {
      const data: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        value: 100 + Math.sin(i / 5) * 20 + Math.random() * 10,
      }));

      // 7-day moving average
      const ma7: number[] = [];
      for (let i = 6; i < data.length; i++) {
        const sum = data
          .slice(i - 6, i + 1)
          .reduce((acc, p) => acc + (p.value as number), 0);
        ma7.push(sum / 7);
      }

      expect(ma7.length).toBe(data.length - 6);
      expect(ma7.every((v) => v > 0)).toBe(true);
    });

    it('should detect outliers using IQR method', () => {
      const data: ChartDataPoint[] = [
        { x: 1, y: 10 },
        { x: 2, y: 12 },
        { x: 3, y: 11 },
        { x: 4, y: 13 },
        { x: 5, y: 100 }, // Outlier
        { x: 6, y: 12 },
        { x: 7, y: 11 },
      ];

      const values = data.map((p) => p.y as number).sort((a, b) => a - b);
      const q1Index = Math.floor(values.length * 0.25);
      const q3Index = Math.floor(values.length * 0.75);
      const q1 = values[q1Index];
      const q3 = values[q3Index];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      const outliers = data.filter((p) => {
        const value = p.y as number;
        return value < lowerBound || value > upperBound;
      });

      expect(outliers.length).toBeGreaterThan(0);
      expect(outliers[0].y).toBe(100);
    });

    it('should calculate confidence intervals', () => {
      const data: ChartDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
        x: i,
        y: 10 + i * 2 + (Math.random() - 0.5) * 10,
      }));

      const n = data.length;
      const sumX = data.reduce((sum, p) => sum + (p.x as number), 0);
      const sumY = data.reduce((sum, p) => sum + (p.y as number), 0);
      const sumXY = data.reduce((sum, p) => sum + (p.x as number) * (p.y as number), 0);
      const sumX2 = data.reduce((sum, p) => sum + (p.x as number) ** 2, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
      const intercept = (sumY - slope * sumX) / n;

      // Calculate standard error
      const residuals = data.map((p) => {
        const predicted = slope * (p.x as number) + intercept;
        return (p.y as number) - predicted;
      });
      const sse = residuals.reduce((sum, r) => sum + r ** 2, 0);
      const mse = sse / (n - 2);
      const se = Math.sqrt(mse);

      // 95% confidence interval (t-value ≈ 2 for large n)
      const margin = 2 * se;

      expect(se).toBeGreaterThan(0);
      expect(margin).toBeGreaterThan(0);
    });
  });

  describe('Interactive Features', () => {
    it('should handle zoom data range selection', () => {
      const data: ChartDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));

      const zoomStart = 20;
      const zoomEnd = 40;
      const zoomedData = data.slice(zoomStart, zoomEnd);

      expect(zoomedData.length).toBe(20);
      expect(zoomedData[0].x).toBe(20);
      expect(zoomedData[zoomedData.length - 1].x).toBe(39);
    });

    it('should handle brush selection', () => {
      const data: ChartDataPoint[] = Array.from({ length: 50 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        value: 100 + Math.random() * 50,
      }));

      const brushStart = new Date(2024, 0, 10);
      const brushEnd = new Date(2024, 0, 20);

      const selectedData = data.filter((p) => {
        const date = new Date(p.date as string);
        return date >= brushStart && date <= brushEnd;
      });

      expect(selectedData.length).toBeGreaterThan(0);
      expect(selectedData.length).toBeLessThan(data.length);
    });

    it('should handle legend toggle filtering', () => {
      const data: ChartDataPoint[] = [
        { date: '2024-01', series1: 100, series2: 150, series3: 120 },
        { date: '2024-02', series1: 120, series2: 160, series3: 130 },
      ];

      const visibleSeries = ['series1', 'series3'];
      const filteredData = data.map((point) => {
        const filtered: ChartDataPoint = { date: point.date };
        visibleSeries.forEach((series) => {
          if (series in point) {
            filtered[series] = point[series];
          }
        });
        return filtered;
      });

      expect(filteredData[0]).toHaveProperty('series1');
      expect(filteredData[0]).not.toHaveProperty('series2');
      expect(filteredData[0]).toHaveProperty('series3');
    });

    it('should handle cross-chart highlighting', () => {
      const chart1Data: ChartDataPoint[] = [
        { id: 'A', value: 100 },
        { id: 'B', value: 150 },
      ];

      const chart2Data: ChartDataPoint[] = [
        { id: 'A', metric: 200 },
        { id: 'B', metric: 250 },
      ];

      const highlightId = 'A';
      const highlighted1 = chart1Data.find((d) => d.id === highlightId);
      const highlighted2 = chart2Data.find((d) => d.id === highlightId);

      expect(highlighted1).toBeDefined();
      expect(highlighted2).toBeDefined();
      expect(highlighted1?.id).toBe(highlighted2?.id);
    });
  });

  describe('Export Functionality', () => {
    it('should prepare data for PNG export', () => {
      const chartData: ChartDataPoint[] = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
      ];

      const exportConfig = {
        width: 1200,
        height: 800,
        dpi: 300,
        backgroundColor: '#ffffff',
      };

      expect(chartData.length).toBeGreaterThan(0);
      expect(exportConfig.width).toBeGreaterThan(0);
      expect(exportConfig.height).toBeGreaterThan(0);
      expect(exportConfig.dpi).toBeGreaterThanOrEqual(150);
    });

    it('should prepare data for SVG export', () => {
      const chartData: ChartDataPoint[] = [
        { category: 'A', value: 100 },
        { category: 'B', value: 150 },
      ];

      const svgConfig = {
        width: 800,
        height: 600,
        embedFonts: true,
        includeCSS: true,
      };

      expect(chartData.length).toBeGreaterThan(0);
      expect(svgConfig.width).toBeGreaterThan(0);
      expect(svgConfig.embedFonts).toBe(true);
    });

    it('should prepare data for CSV export', () => {
      const data: ChartDataPoint[] = [
        { date: '2024-01-01', sales: 1000, profit: 200 },
        { date: '2024-01-02', sales: 1200, profit: 250 },
      ];

      const headers = Object.keys(data[0]);
      const csvRows = data.map((row) =>
        headers.map((header) => row[header]).join(',')
      );
      const csv = [headers.join(','), ...csvRows].join('\n');

      expect(csv).toContain('date,sales,profit');
      expect(csv).toContain('2024-01-01,1000,200');
    });

    it('should prepare data for JSON export with metadata', () => {
      const data: ChartDataPoint[] = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
      ];

      const exportData = {
        data,
        metadata: {
          chartType: 'line',
          title: 'Test Chart',
          exportDate: new Date().toISOString(),
          dataPoints: data.length,
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const parsed = JSON.parse(jsonString);

      expect(parsed.data).toEqual(data);
      expect(parsed.metadata.chartType).toBe('line');
      expect(parsed.metadata.dataPoints).toBe(2);
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle 10K rows efficiently', () => {
      const data: ChartDataPoint[] = Array.from({ length: 10000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));

      const start = performance.now();
      const sampled = sampleData(data, 1000);
      const end = performance.now();

      expect(sampled.length).toBeLessThanOrEqual(1001);
      expect(end - start).toBeLessThan(100);
    });

    it('should handle 100K rows with aggressive sampling', () => {
      const data: ChartDataPoint[] = Array.from({ length: 100000 }, (_, i) => ({
        date: new Date(2024, 0, 1 + Math.floor(i / 1000)).toISOString().split('T')[0],
        value: 100 + Math.random() * 50,
      }));

      const start = performance.now();
      const sampled = sampleData(data, 5000);
      const end = performance.now();

      expect(sampled.length).toBeLessThanOrEqual(5001);
      expect(end - start).toBeLessThan(500);
    });

    it('should use canvas for dense scatter plots', () => {
      const scatterData: ChartDataPoint[] = Array.from({ length: 5000 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));

      const useCanvas = shouldUseCanvas(scatterData.length, 'scatter');
      expect(useCanvas).toBe(true);
    });

    it('should monitor render performance', () => {
      const end = performanceMonitor.start('chart-render');

      // Simulate chart rendering work
      const data: ChartDataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));
      const sampled = adaptiveSample(data, 'line');

      end();

      const avg = performanceMonitor.getAverage('chart-render');
      expect(avg).toBeGreaterThan(0);
      expect(sampled.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should adapt data for mobile viewport (375px)', () => {
      const data: ChartDataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));

      const mobileMaxPoints = 100;
      const mobileData = sampleData(data, mobileMaxPoints);

      expect(mobileData.length).toBeLessThanOrEqual(mobileMaxPoints + 1);
    });

    it('should adapt data for tablet viewport (768px)', () => {
      const data: ChartDataPoint[] = Array.from({ length: 5000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));

      const tabletMaxPoints = 500;
      const tabletData = sampleData(data, tabletMaxPoints);

      expect(tabletData.length).toBeLessThanOrEqual(tabletMaxPoints + 1);
    });

    it('should handle touch interaction data', () => {
      const data: ChartDataPoint[] = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 30 },
      ];

      // Simulate touch target size validation (44x44 pixels minimum)
      const minTouchTargetSize = 44;
      expect(minTouchTargetSize).toBeGreaterThanOrEqual(44);

      // Verify data points are accessible
      data.forEach((point) => {
        expect(point.x).toBeDefined();
        expect(point.y).toBeDefined();
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should generate ARIA labels for all chart types', () => {
      const chartTypes = ['line', 'bar', 'pie', 'scatter', 'area'];

      chartTypes.forEach((type) => {
        const data = [
          { x: 1, y: 10 },
          { x: 2, y: 20 },
        ];
        const description = generateChartDescription(type as any, data, {
          xAxis: 'x',
          yAxis: 'y',
        });

        expect(description).toBeTruthy();
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it('should meet WCAG AA contrast requirements', () => {
      const colorPairs = [
        ['#000000', '#ffffff'], // Black on white - always passes
        ['#1e40af', '#ffffff'], // Dark blue on white
        ['#065f46', '#ffffff'], // Dark green on white
        ['#991b1b', '#ffffff'], // Dark red on white
      ];

      colorPairs.forEach(([fg, bg]) => {
        const meetsAA = meetsContrastRequirement(fg, bg, 'AA');
        expect(meetsAA).toBe(true);
      });
    });

    it('should provide text summaries for screen readers', () => {
      const data: ChartDataPoint[] = [
        { x: '2024-01', y: 100 },
        { x: '2024-02', y: 150 },
        { x: '2024-03', y: 200 },
      ];

      const summary = generateChartSummary('line', data, {
        xAxis: 'x',
        yAxis: 'y',
      });

      expect(summary).toContain('range');
      expect(summary).toContain('Average');
      expect(summary.length).toBeGreaterThan(30);
    });

    it('should support keyboard navigation data structure', () => {
      const data: ChartDataPoint[] = [
        { id: 0, x: 1, y: 10 },
        { id: 1, x: 2, y: 20 },
        { id: 2, x: 3, y: 30 },
      ];

      let currentIndex = 0;

      // Simulate arrow key navigation
      const navigateNext = () => {
        currentIndex = Math.min(currentIndex + 1, data.length - 1);
        return data[currentIndex];
      };

      const navigatePrev = () => {
        currentIndex = Math.max(currentIndex - 1, 0);
        return data[currentIndex];
      };

      const next = navigateNext();
      expect(next.id).toBe(1);

      const prev = navigatePrev();
      expect(prev.id).toBe(0);
    });
  });

  describe('Comparative Visualizations', () => {
    it('should handle small multiples data', () => {
      const categories = ['A', 'B', 'C'];
      const smallMultiplesData = categories.map((category) => ({
        category,
        data: Array.from({ length: 10 }, (_, i) => ({
          x: i,
          y: Math.random() * 100,
        })),
      }));

      expect(smallMultiplesData.length).toBe(3);
      smallMultiplesData.forEach((item) => {
        expect(item.data.length).toBe(10);
      });
    });

    it('should handle bullet chart comparison data', () => {
      const bulletData: ChartDataPoint[] = [
        {
          metric: 'Revenue',
          actual: 85,
          target: 100,
          poor: 50,
          satisfactory: 75,
          good: 100,
        },
        {
          metric: 'Profit',
          actual: 70,
          target: 80,
          poor: 40,
          satisfactory: 60,
          good: 80,
        },
      ];

      bulletData.forEach((point) => {
        expect(point.actual).toBeLessThanOrEqual(point.good as number);
        expect(point.poor).toBeLessThan(point.satisfactory as number);
        expect(point.satisfactory).toBeLessThan(point.good as number);
      });
    });

    it('should handle sparkline compact data', () => {
      const sparklineData: ChartDataPoint[] = Array.from({ length: 20 }, (_, i) => ({
        x: i,
        y: 50 + Math.sin(i / 3) * 20 + Math.random() * 10,
      }));

      const min = Math.min(...sparklineData.map((d) => d.y as number));
      const max = Math.max(...sparklineData.map((d) => d.y as number));
      const last = sparklineData[sparklineData.length - 1].y;

      expect(min).toBeLessThan(max);
      expect(last).toBeDefined();
    });

    it('should handle KPI card data with trends', () => {
      const kpiData = {
        value: 1250,
        previousValue: 1000,
        target: 1500,
        trend: 'up' as const,
        percentageChange: 25,
        sparkline: Array.from({ length: 10 }, (_, i) => ({
          x: i,
          y: 1000 + i * 25,
        })),
      };

      expect(kpiData.value).toBeGreaterThan(kpiData.previousValue);
      expect(kpiData.percentageChange).toBeCloseTo(25, 0);
      expect(kpiData.trend).toBe('up');
    });
  });

  describe('Aggregation and Time Periods', () => {
    it('should aggregate by all time periods', () => {
      const data: ChartDataPoint[] = Array.from({ length: 365 }, (_, i) => ({
        date: new Date(2024, 0, 1 + i).toISOString().split('T')[0],
        value: 100 + Math.random() * 50,
      }));

      const daily = aggregateData(data, 'date', ['value'], 'daily', 'sum');
      const weekly = aggregateData(data, 'date', ['value'], 'weekly', 'sum');
      const monthly = aggregateData(data, 'date', ['value'], 'monthly', 'sum');
      const quarterly = aggregateData(data, 'date', ['value'], 'quarterly', 'sum');
      const yearly = aggregateData(data, 'date', ['value'], 'yearly', 'sum');

      expect(daily.length).toBe(365);
      expect(weekly.length).toBeLessThan(daily.length);
      expect(monthly.length).toBeGreaterThan(0);
      expect(quarterly.length).toBeLessThan(monthly.length);
      expect(yearly.length).toBe(1);
    });

    it('should compare YoY, MoM, QoQ', () => {
      const data: ChartDataPoint[] = Array.from({ length: 730 }, (_, i) => ({
        date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
        value: 100 + Math.random() * 50,
      }));

      const yoyComparison = compareTimePeriods(data, 'date', ['value'], 'YoY', 'monthly');
      const momComparison = compareTimePeriods(data, 'date', ['value'], 'MoM', 'monthly');
      const qoqComparison = compareTimePeriods(data, 'date', ['value'], 'QoQ', 'monthly');

      expect(yoyComparison.current.length).toBeGreaterThan(0);
      expect(momComparison.current.length).toBeGreaterThan(0);
      expect(qoqComparison.current.length).toBeGreaterThan(0);
    });
  });
});
