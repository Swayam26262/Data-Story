/**
 * Accessibility utilities for chart components
 * Provides ARIA labels, keyboard navigation, and screen reader support
 */

import type { ChartData, ChartDataPoint } from '@/lib/models/Story';

/**
 * Generate accessible description for a chart
 */
export function generateChartDescription(
  chartType: string,
  data: ChartData,
  config: any
): string {
  const dataArray = Array.isArray(data) ? data : [];
  const dataCount = dataArray.length;

  if (dataCount === 0) {
    return `Empty ${chartType} chart with no data points.`;
  }

  const { xAxis = 'x', yAxis = 'y', nameKey = 'name', valueKey = 'value' } = config;

  switch (chartType.toLowerCase()) {
    case 'line':
    case 'linechart':
      return `Line chart showing ${dataCount} data points. X-axis represents ${xAxis}, Y-axis represents ${yAxis}.`;
    
    case 'bar':
    case 'barchart':
      return `Bar chart with ${dataCount} bars. X-axis represents ${xAxis}, Y-axis represents ${yAxis}.`;
    
    case 'scatter':
    case 'scatterplot':
      return `Scatter plot with ${dataCount} points. X-axis represents ${xAxis}, Y-axis represents ${yAxis}.`;
    
    case 'pie':
    case 'piechart':
      return `Pie chart with ${dataCount} segments representing ${nameKey} by ${valueKey}.`;
    
    case 'area':
    case 'areachart':
      return `Area chart showing ${dataCount} data points. X-axis represents ${xAxis}, Y-axis represents ${yAxis}.`;
    
    case 'heatmap':
      return `Heatmap visualization with ${dataCount} cells showing data intensity.`;
    
    case 'boxplot':
      return `Box plot showing statistical distribution with ${dataCount} groups.`;
    
    default:
      return `${chartType} chart with ${dataCount} data points.`;
  }
}

/**
 * Generate text summary of chart data for screen readers
 */
export function generateChartSummary(
  chartType: string,
  data: ChartData,
  config: any,
  statistics?: any
): string {
  const dataArray = Array.isArray(data) ? data : [];
  
  if (dataArray.length === 0) {
    return 'No data available.';
  }

  const { xAxis = 'x', yAxis = 'y', nameKey = 'name', valueKey = 'value' } = config;
  
  let summary = '';

  // Calculate basic statistics
  if (chartType === 'pie' || chartType === 'piechart') {
    const total = dataArray.reduce((sum, item) => {
      const value = Number(item[valueKey as keyof ChartDataPoint]);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    
    const topItems = [...dataArray]
      .sort((a, b) => Number(b[valueKey as keyof ChartDataPoint]) - Number(a[valueKey as keyof ChartDataPoint]))
      .slice(0, 3);
    
    summary = `Total value: ${total.toLocaleString()}. `;
    summary += `Top 3 segments: `;
    summary += topItems.map((item, idx) => {
      const value = Number(item[valueKey as keyof ChartDataPoint]);
      const percent = ((value / total) * 100).toFixed(1);
      return `${idx + 1}. ${item[nameKey as keyof ChartDataPoint]}: ${value.toLocaleString()} (${percent}%)`;
    }).join(', ');
  } else {
    const values = dataArray
      .map((d: any) => Number(d[yAxis]))
      .filter((v: number) => Number.isFinite(v));
    
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      
      summary = `Data range: ${min.toLocaleString()} to ${max.toLocaleString()}. `;
      summary += `Average: ${avg.toLocaleString()}. `;
      
      // Add trend information if available
      if (statistics?.trendLineData) {
        const trend = statistics.trendLineData.slope > 0 ? 'increasing' : 'decreasing';
        summary += `Overall trend is ${trend}. `;
      }
      
      // Add correlation information if available
      if (statistics?.correlationData) {
        const corr = statistics.correlationData.coefficient;
        const strength = Math.abs(corr) > 0.7 ? 'strong' : Math.abs(corr) > 0.4 ? 'moderate' : 'weak';
        const direction = corr > 0 ? 'positive' : 'negative';
        summary += `${strength} ${direction} correlation detected. `;
      }
    }
  }

  return summary;
}

/**
 * Generate ARIA label for a data point
 */
export function generateDataPointLabel(
  dataPoint: any,
  index: number,
  config: any,
  chartType: string
): string {
  const { xAxis = 'x', yAxis = 'y', nameKey = 'name', valueKey = 'value' } = config;

  if (chartType === 'pie' || chartType === 'piechart') {
    const name = dataPoint[nameKey];
    const value = dataPoint[valueKey];
    return `${name}: ${value}`;
  }

  const xValue = dataPoint[xAxis];
  const yValue = dataPoint[yAxis];
  
  return `Point ${index + 1}: ${xAxis} ${xValue}, ${yAxis} ${yValue}`;
}

/**
 * Check if color contrast meets WCAG AA standards
 * Returns true if contrast ratio is at least 4.5:1 for normal text
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Keyboard navigation handler for charts
 */
export class ChartKeyboardNavigator {
  private currentIndex: number = 0;
  private dataLength: number = 0;
  private onNavigate: (index: number) => void;
  private onSelect: (index: number) => void;

  constructor(
    dataLength: number,
    onNavigate: (index: number) => void,
    onSelect: (index: number) => void
  ) {
    this.dataLength = dataLength;
    this.onNavigate = onNavigate;
    this.onSelect = onSelect;
  }

  handleKeyDown(event: React.KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.navigateNext();
        break;
      
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.navigatePrevious();
        break;
      
      case 'Home':
        event.preventDefault();
        this.navigateFirst();
        break;
      
      case 'End':
        event.preventDefault();
        this.navigateLast();
        break;
      
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.select();
        break;
    }
  }

  private navigateNext(): void {
    this.currentIndex = Math.min(this.currentIndex + 1, this.dataLength - 1);
    this.onNavigate(this.currentIndex);
  }

  private navigatePrevious(): void {
    this.currentIndex = Math.max(this.currentIndex - 1, 0);
    this.onNavigate(this.currentIndex);
  }

  private navigateFirst(): void {
    this.currentIndex = 0;
    this.onNavigate(this.currentIndex);
  }

  private navigateLast(): void {
    this.currentIndex = this.dataLength - 1;
    this.onNavigate(this.currentIndex);
  }

  private select(): void {
    this.onSelect(this.currentIndex);
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  setCurrentIndex(index: number): void {
    this.currentIndex = Math.max(0, Math.min(index, this.dataLength - 1));
  }
}

/**
 * Generate skip link for chart navigation
 */
export function generateSkipLinkId(chartId: string): string {
  return `skip-to-${chartId}`;
}

/**
 * Focus management utilities
 */
export const focusStyles = {
  outline: '2px solid #2563eb',
  outlineOffset: '2px',
  borderRadius: '4px',
} as const;

export function getFocusRingStyle(isFocused: boolean): React.CSSProperties {
  return isFocused ? focusStyles : {};
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Screen reader only CSS class
 */
export const srOnlyClass = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';
