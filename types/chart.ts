/**
 * Enhanced Chart Type Definitions for Professional Data Visualization
 * This file contains all TypeScript interfaces for advanced chart types,
 * statistical overlays, interactions, and insights.
 */

import { ChartType, ChartData, IChartConfig } from '@/lib/models/Story';

// ============================================================================
// Advanced Chart Types
// ============================================================================

/**
 * Extended chart types including advanced visualizations
 */
export type AdvancedChartType =
  | 'combination'
  | 'heatmap'
  | 'boxplot'
  | 'waterfall'
  | 'funnel'
  | 'radar'
  | 'area'
  | 'candlestick';

/**
 * All available chart types (basic + advanced)
 */
export type AllChartTypes = ChartType | AdvancedChartType;

// ============================================================================
// Annotation System
// ============================================================================

/**
 * Annotation types for marking up charts
 */
export type AnnotationType = 'text' | 'line' | 'region';

/**
 * Position can be absolute coordinates or data values
 */
export interface AnnotationPosition {
  x: number | string;
  y: number | string;
}

/**
 * Styling options for annotations
 */
export interface AnnotationStyle {
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
}

/**
 * Chart annotation interface for adding context to visualizations
 */
export interface Annotation {
  type: AnnotationType;
  position: AnnotationPosition;
  content: string;
  style?: AnnotationStyle;
  id?: string;
}

/**
 * Reference line for marking thresholds or targets
 */
export interface ReferenceLine {
  axis: 'x' | 'y';
  value: number | string;
  label?: string;
  color?: string;
  strokeDasharray?: string;
}

// ============================================================================
// Statistical Overlays
// ============================================================================

/**
 * Trend line configuration with regression analysis
 */
export interface TrendLineConfig {
  enabled: boolean;
  type: 'linear' | 'polynomial' | 'exponential';
  degree?: number; // For polynomial trends
  color?: string;
  showEquation?: boolean;
  showRSquared?: boolean;
}

/**
 * Trend line data calculated from analysis
 */
export interface TrendLineData {
  slope: number;
  intercept: number;
  rSquared: number;
  equation?: string;
  confidenceInterval?: {
    lower: number[];
    upper: number[];
  };
}

/**
 * Moving average configuration
 */
export interface MovingAverageConfig {
  enabled: boolean;
  periods: number[]; // e.g., [7, 30, 90] for 7-day, 30-day, 90-day
  colors?: string[];
  lineStyles?: ('solid' | 'dashed' | 'dotted')[];
}

/**
 * Moving average data
 */
export interface MovingAverageData {
  period: number;
  values: number[];
  label?: string;
}

/**
 * Confidence interval configuration
 */
export interface ConfidenceIntervalConfig {
  enabled: boolean;
  level: number; // e.g., 0.95 for 95% confidence
  color?: string;
  opacity?: number;
}

/**
 * Outlier detection configuration
 */
export interface OutlierConfig {
  enabled: boolean;
  method: 'iqr' | 'zscore' | 'isolation_forest';
  threshold?: number;
  color?: string;
  size?: number;
}

/**
 * Outlier data from analysis
 */
export interface OutlierData {
  indices: number[];
  values: number[];
  method: string;
  zScores?: number[];
}

/**
 * Complete statistical overlay configuration
 */
export interface StatisticalOverlay {
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

// ============================================================================
// Interaction System
// ============================================================================

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  enabled: boolean;
  showPercentage?: boolean;
  showRank?: boolean;
  showComparison?: boolean;
  customContent?: boolean;
  followCursor?: boolean;
  delay?: number;
}

/**
 * Rich tooltip data with statistics
 */
export interface TooltipData {
  title: string;
  metrics: Array<{
    label: string;
    value: string | number;
    color?: string;
    unit?: string;
  }>;
  statistics?: {
    percentOfTotal?: number;
    rank?: number;
    comparisonToAverage?: number;
    trend?: 'up' | 'down' | 'stable';
  };
  customContent?: React.ReactNode;
}

/**
 * Legend configuration
 */
export interface LegendConfig {
  enabled: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  interactive?: boolean;
  collapsible?: boolean;
}

/**
 * Zoom and pan configuration
 */
export interface ZoomPanConfig {
  enabled: boolean;
  zoomOnWheel?: boolean;
  panOnDrag?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Brush selection configuration
 */
export interface BrushConfig {
  enabled: boolean;
  axis: 'x' | 'y' | 'both';
  color?: string;
}

/**
 * Complete interaction configuration
 */
export interface InteractionConfig {
  zoom?: boolean;
  pan?: boolean;
  brush?: boolean;
  crosshair?: boolean;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  zoomPan?: ZoomPanConfig;
  brushConfig?: BrushConfig;
}

// ============================================================================
// Insight System
// ============================================================================

/**
 * Types of insights that can be generated
 */
export type InsightType =
  | 'trend'
  | 'correlation'
  | 'outlier'
  | 'distribution'
  | 'seasonality'
  | 'anomaly'
  | 'inflection';

/**
 * Impact level of an insight
 */
export type InsightImpact = 'high' | 'medium' | 'low';

/**
 * Individual insight with metadata
 */
export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  significance: number; // 0-1 scale
  impact: InsightImpact;
  recommendation?: string;
  relatedChartId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Enhanced Statistics Interfaces
// ============================================================================

/**
 * Seasonal pattern data
 */
export interface SeasonalPattern {
  period: number; // e.g., 7 for weekly, 365 for yearly
  strength: number; // 0-1 scale
  pattern: number[];
  confidence?: number;
}

/**
 * Change point detection
 */
export interface ChangePoint {
  index: number;
  timestamp?: string;
  significance: number;
  direction?: 'increase' | 'decrease';
}

/**
 * Moving average data for a column
 */
export interface ColumnMovingAverages {
  column: string;
  periods: number[];
  values: { [period: number]: number[] };
}

/**
 * Advanced trend analysis
 */
export interface AdvancedTrends {
  seasonal?: SeasonalPattern[];
  changePoints?: ChangePoint[];
  movingAverages?: ColumnMovingAverages[];
  polynomialTrends?: {
    column: string;
    degree: number;
    coefficients: number[];
    rSquared: number;
  }[];
}

/**
 * Correlation matrix for heatmap visualization
 */
export interface CorrelationMatrix {
  columns: string[];
  matrix: number[][];
  pValues?: number[][];
  method?: 'pearson' | 'spearman';
}

/**
 * Individual outlier data point
 */
export interface OutlierPoint {
  index: number;
  value: number;
  zScore?: number;
  distance?: number;
}

/**
 * Outlier analysis for a column
 */
export interface OutlierAnalysis {
  column: string;
  method: 'iqr' | 'zscore' | 'isolation_forest';
  outliers: OutlierPoint[];
  threshold?: number;
  lowerBound?: number;
  upperBound?: number;
}

/**
 * Enhanced statistics interface extending the base IStatistics
 */
export interface EnhancedStatistics {
  advancedTrends?: AdvancedTrends;
  correlationMatrix?: CorrelationMatrix;
  outlierAnalysis?: OutlierAnalysis[];
  insights?: Insight[];
}

// ============================================================================
// Enhanced Chart Interface
// ============================================================================

/**
 * Enhanced chart interface with all new features
 */
export interface EnhancedChart {
  chartId: string;
  type: AllChartTypes;
  title: string;
  data: ChartData;
  config: IChartConfig;
  statistics?: StatisticalOverlay;
  interactions?: InteractionConfig;
  insights?: {
    primary: string;
    secondary?: string;
    significance: number;
  };
}

// ============================================================================
// Data Point and Range Types
// ============================================================================

/**
 * Generic data point with coordinates
 */
export interface DataPoint {
  x: number | string;
  y: number | string;
  [key: string]: unknown;
}

/**
 * Data range for selections
 */
export interface DataRange {
  xMin: number;
  xMax: number;
  yMin?: number;
  yMax?: number;
}

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

// ============================================================================
// Export Types
// ============================================================================

/**
 * Export format options
 */
export type ExportFormat = 'png' | 'svg' | 'csv' | 'json' | 'pdf';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  width?: number;
  height?: number;
  dpi?: number;
  backgroundColor?: string;
  includeWatermark?: boolean;
}
