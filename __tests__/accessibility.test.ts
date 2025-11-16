/**
 * Accessibility tests for chart components
 */

import {
  generateChartDescription,
  generateChartSummary,
  generateDataPointLabel,
  meetsContrastRequirement,
  getContrastRatio,
  ChartKeyboardNavigator,
  announceToScreenReader,
} from '@/lib/utils/accessibility';

describe('Accessibility Utilities', () => {
  describe('generateChartDescription', () => {
    it('should generate description for line chart', () => {
      const data = [
        { x: '2024-01', y: 100 },
        { x: '2024-02', y: 150 },
      ];
      const config = { xAxis: 'x', yAxis: 'y' };
      const description = generateChartDescription('line', data, config);
      
      expect(description).toContain('Line chart');
      expect(description).toContain('2 data points');
      expect(description).toContain('x');
      expect(description).toContain('y');
    });

    it('should generate description for pie chart', () => {
      const data = [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
      ];
      const config = { nameKey: 'name', valueKey: 'value' };
      const description = generateChartDescription('pie', data, config);
      
      expect(description).toContain('Pie chart');
      expect(description).toContain('2 segments');
    });

    it('should handle empty data', () => {
      const description = generateChartDescription('line', [], {});
      expect(description).toContain('Empty');
      expect(description).toContain('no data');
    });
  });

  describe('generateChartSummary', () => {
    it('should generate summary with statistics', () => {
      const data = [
        { x: '2024-01', y: 100 },
        { x: '2024-02', y: 150 },
        { x: '2024-03', y: 200 },
      ];
      const config = { xAxis: 'x', yAxis: 'y' };
      const summary = generateChartSummary('line', data, config);
      
      expect(summary).toContain('range');
      expect(summary).toContain('Average');
      expect(summary).toContain('100');
      expect(summary).toContain('200');
    });

    it('should include trend information when available', () => {
      const data = [{ x: 1, y: 100 }, { x: 2, y: 200 }];
      const config = { xAxis: 'x', yAxis: 'y' };
      const statistics = {
        trendLineData: { slope: 100, intercept: 0 },
      };
      const summary = generateChartSummary('line', data, config, statistics);
      
      expect(summary).toContain('trend');
      expect(summary).toContain('increasing');
    });

    it('should generate pie chart summary', () => {
      const data = [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
        { name: 'C', value: 50 },
      ];
      const config = { nameKey: 'name', valueKey: 'value' };
      const summary = generateChartSummary('pie', data, config);
      
      expect(summary).toContain('Total value');
      expect(summary).toContain('Top 3 segments');
      expect(summary).toContain('350');
    });
  });

  describe('generateDataPointLabel', () => {
    it('should generate label for line chart point', () => {
      const dataPoint = { x: '2024-01', y: 100 };
      const config = { xAxis: 'x', yAxis: 'y' };
      const label = generateDataPointLabel(dataPoint, 0, config, 'line');
      
      expect(label).toContain('Point 1');
      expect(label).toContain('2024-01');
      expect(label).toContain('100');
    });

    it('should generate label for pie chart slice', () => {
      const dataPoint = { name: 'Category A', value: 100 };
      const config = { nameKey: 'name', valueKey: 'value' };
      const label = generateDataPointLabel(dataPoint, 0, config, 'pie');
      
      expect(label).toContain('Category A');
      expect(label).toContain('100');
    });
  });

  describe('Color Contrast', () => {
    it('should validate high contrast colors', () => {
      const result = meetsContrastRequirement('#000000', '#FFFFFF');
      expect(result).toBe(true);
    });

    it('should reject low contrast colors', () => {
      const result = meetsContrastRequirement('#888888', '#999999');
      expect(result).toBe(false);
    });

    it('should calculate contrast ratio correctly', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeGreaterThan(20); // Black on white is 21:1
    });

    it('should handle hex colors with #', () => {
      const ratio = getContrastRatio('#2563eb', '#ffffff');
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('should handle hex colors without #', () => {
      const ratio = getContrastRatio('2563eb', 'ffffff');
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('should validate AAA level contrast', () => {
      const result = meetsContrastRequirement('#000000', '#FFFFFF', 'AAA');
      expect(result).toBe(true);
    });
  });

  describe('ChartKeyboardNavigator', () => {
    let navigator: ChartKeyboardNavigator;
    let navigateCalls: number[] = [];
    let selectCalls: number[] = [];

    beforeEach(() => {
      navigateCalls = [];
      selectCalls = [];
      navigator = new ChartKeyboardNavigator(
        10,
        (index) => navigateCalls.push(index),
        (index) => selectCalls.push(index)
      );
    });

    it('should navigate to next item with ArrowRight', () => {
      const event = {
        key: 'ArrowRight',
        preventDefault: jest.fn(),
      } as any;
      
      navigator.handleKeyDown(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(navigateCalls).toEqual([1]);
    });

    it('should navigate to previous item with ArrowLeft', () => {
      navigator.setCurrentIndex(5);
      
      const event = {
        key: 'ArrowLeft',
        preventDefault: jest.fn(),
      } as any;
      
      navigator.handleKeyDown(event);
      
      expect(navigateCalls).toEqual([4]);
    });

    it('should navigate to first item with Home', () => {
      navigator.setCurrentIndex(5);
      
      const event = {
        key: 'Home',
        preventDefault: jest.fn(),
      } as any;
      
      navigator.handleKeyDown(event);
      
      expect(navigateCalls).toEqual([0]);
    });

    it('should navigate to last item with End', () => {
      const event = {
        key: 'End',
        preventDefault: jest.fn(),
      } as any;
      
      navigator.handleKeyDown(event);
      
      expect(navigateCalls).toEqual([9]);
    });

    it('should select item with Enter', () => {
      navigator.setCurrentIndex(3);
      
      const event = {
        key: 'Enter',
        preventDefault: jest.fn(),
      } as any;
      
      navigator.handleKeyDown(event);
      
      expect(selectCalls).toEqual([3]);
    });

    it('should select item with Space', () => {
      navigator.setCurrentIndex(3);
      
      const event = {
        key: ' ',
        preventDefault: jest.fn(),
      } as any;
      
      navigator.handleKeyDown(event);
      
      expect(selectCalls).toEqual([3]);
    });

    it('should not navigate beyond bounds', () => {
      navigator.setCurrentIndex(9);
      
      const event = {
        key: 'ArrowRight',
        preventDefault: jest.fn(),
      } as any;
      
      navigator.handleKeyDown(event);
      
      expect(navigateCalls).toEqual([9]);
    });

    it('should not navigate below zero', () => {
      navigator.setCurrentIndex(0);
      
      const event = {
        key: 'ArrowLeft',
        preventDefault: jest.fn(),
      } as any;
      
      navigator.handleKeyDown(event);
      
      expect(navigateCalls).toEqual([0]);
    });
  });

  describe('announceToScreenReader', () => {
    it('should be a function', () => {
      expect(typeof announceToScreenReader).toBe('function');
    });
  });
});

describe('Accessibility Integration', () => {
  it('should provide complete accessibility features', () => {
    // This test verifies that all accessibility utilities are exported
    expect(generateChartDescription).toBeDefined();
    expect(generateChartSummary).toBeDefined();
    expect(generateDataPointLabel).toBeDefined();
    expect(meetsContrastRequirement).toBeDefined();
    expect(getContrastRatio).toBeDefined();
    expect(ChartKeyboardNavigator).toBeDefined();
    expect(announceToScreenReader).toBeDefined();
  });
});
