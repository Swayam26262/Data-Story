/**
 * Chart Components
 * Base infrastructure and utilities for chart rendering
 */

export { BaseChart, useBaseChartConfig } from './BaseChart';
export type { BaseChartProps } from './BaseChart';

export { ChartErrorBoundary, withChartErrorBoundary } from './ChartErrorBoundary';

export { ChartDataValidator } from './ChartDataValidator';
export type { ValidationResult, SanitizationOptions } from './ChartDataValidator';

export {
  ChartPerformanceMonitor,
  useChartPerformance,
  withPerformanceMonitoring,
} from './ChartPerformanceMonitor';
export type { PerformanceMetrics, PerformanceThresholds } from './ChartPerformanceMonitor';

export { default as ThemedLineChart } from './ThemedLineChart';

// Basic Chart Types
export { default as LineChart } from './LineChart';
export { default as BarChart } from './BarChart';
export { default as ScatterPlot } from './ScatterPlot';
export { default as PieChart } from './PieChart';
export { default as AggregatedChart } from './AggregatedChart';

// Advanced Chart Types
export { CombinationChart } from './CombinationChart';
export type { CombinationChartProps, CombinationSeries } from './CombinationChart';

export { Heatmap } from './Heatmap';
export type { HeatmapProps, HeatmapCell, ColorScaleType } from './Heatmap';

export { BoxPlot } from './BoxPlot';
export type { BoxPlotProps, BoxPlotData } from './BoxPlot';

export { WaterfallChart } from './WaterfallChart';
export type { WaterfallChartProps, WaterfallDataPoint } from './WaterfallChart';

export { FunnelChart } from './FunnelChart';
export type { FunnelChartProps, FunnelStage } from './FunnelChart';

export { RadarChart } from './RadarChart';
export type { RadarChartProps, RadarSeries } from './RadarChart';

export { AreaChart } from './AreaChart';
export type { AreaChartProps, AreaSeries, StackMode } from './AreaChart';

export { CandlestickChart } from './CandlestickChart';
export type { CandlestickChartProps, CandlestickDataPoint } from './CandlestickChart';

// Statistical Overlay Components
export {
  TrendLineOverlay,
  MovingAverageOverlay,
  MovingAverageLegend,
  OutlierHighlight,
  OutlierSummary,
  AnnotationLayer,
  SignificanceMarker,
} from './overlays';
export type {
  TrendLineOverlayProps,
  MovingAverageOverlayProps,
  MovingAverageLegendProps,
  OutlierHighlightProps,
  OutlierSummaryProps,
  AnnotationLayerProps,
  SignificanceMarkerProps,
} from './overlays';

// Performance Optimization Components
export { ChartSkeleton } from './ChartSkeleton';
export type { ChartSkeletonProps } from './ChartSkeleton';

export { LazyChart } from './LazyChart';
export type { LazyChartProps } from './LazyChart';

export { OptimizedChartWrapper, useOptimizedChartInteractions } from './OptimizedChartWrapper';
export type { OptimizedChartWrapperProps } from './OptimizedChartWrapper';

export { VirtualizedChartList, VirtualizedChartGrid } from './VirtualizedChartList';
export type {
  VirtualizedChartListProps,
  VirtualizedChartGridProps,
} from './VirtualizedChartList';

// Accessibility Components
export { AccessibleChart } from './AccessibleChart';
export { default as AccessibilityDemo } from './AccessibilityDemo';

// Configuration Components
export {
  ChartConfigPanel,
  ChartConfigButton,
  ChartConfigProvider,
  useChartConfig,
  useChartConfigOptional,
} from './config';
export type { ChartConfiguration } from './config';
