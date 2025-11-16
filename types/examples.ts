/**
 * Example usage of enhanced chart types
 * This file demonstrates how to use the new type system
 */

import type {
  IChart,
  AdvancedChartType,
  StatisticalOverlay,
  InteractionConfig,
  Annotation,
  Insight,
  IStatistics,
  CorrelationMatrix,
  OutlierAnalysis,
  AdvancedTrends,
} from '@/types';

// ============================================================================
// Example 1: Creating a Combination Chart with Statistical Overlays
// ============================================================================

export const exampleCombinationChart: IChart = {
  chartId: 'combo-1',
  type: 'combination',
  title: 'Sales and Revenue Trends',
  data: [
    { date: '2024-01', sales: 1000, revenue: 50000 },
    { date: '2024-02', sales: 1200, revenue: 60000 },
    { date: '2024-03', sales: 1500, revenue: 75000 },
  ],
  config: {
    xAxis: 'date',
    yAxis: 'sales',
    colors: ['#2563eb', '#10b981'],
    legend: true,
  },
  statistics: {
    trendLine: {
      enabled: true,
      type: 'linear',
      showRSquared: true,
      color: '#ef4444',
    },
    trendLineData: {
      slope: 250,
      intercept: 750,
      rSquared: 0.95,
      equation: 'y = 250x + 750',
      confidenceInterval: {
        lower: [900, 1100, 1300],
        upper: [1100, 1300, 1700],
      },
    },
    movingAverage: {
      enabled: true,
      periods: [7, 30],
      colors: ['#f59e0b', '#8b5cf6'],
      lineStyles: ['dashed', 'dotted'],
    },
    annotations: [
      {
        type: 'text',
        position: { x: '2024-02', y: 1200 },
        content: 'Product Launch',
        style: {
          color: '#ef4444',
          fontSize: 12,
          fontWeight: 600,
        },
      },
    ],
    referenceLines: [
      {
        axis: 'y',
        value: 1000,
        label: 'Target',
        color: '#10b981',
        strokeDasharray: '5,5',
      },
    ],
  },
  interactions: {
    zoom: true,
    pan: true,
    brush: true,
    crosshair: true,
    tooltip: {
      enabled: true,
      showPercentage: true,
      showRank: true,
      showComparison: true,
      followCursor: true,
    },
    legend: {
      enabled: true,
      position: 'bottom',
      interactive: true,
      collapsible: false,
    },
  },
  insights: {
    primary: 'Sales increased 50% over the quarter with strong momentum',
    secondary: 'Revenue growth outpacing sales growth indicates higher average order value',
    significance: 0.92,
  },
};

// ============================================================================
// Example 2: Heatmap with Correlation Matrix
// ============================================================================

export const exampleHeatmap: IChart = {
  chartId: 'heatmap-1',
  type: 'heatmap',
  title: 'Feature Correlation Matrix',
  data: [
    { x: 'Sales', y: 'Revenue', value: 0.95 },
    { x: 'Sales', y: 'Marketing', value: 0.78 },
    { x: 'Revenue', y: 'Marketing', value: 0.82 },
  ],
  config: {
    colors: ['#3b82f6', '#ef4444'],
  },
  statistics: {
    annotations: [
      {
        type: 'text',
        position: { x: 'Sales', y: 'Revenue' },
        content: 'Strong correlation',
        style: {
          fontSize: 10,
          color: '#ffffff',
        },
      },
    ],
  },
  interactions: {
    tooltip: {
      enabled: true,
      customContent: true,
    },
  },
};

// ============================================================================
// Example 3: Box Plot with Outlier Detection
// ============================================================================

export const exampleBoxPlot: IChart = {
  chartId: 'boxplot-1',
  type: 'boxplot',
  title: 'Sales Distribution by Region',
  data: [
    { region: 'North', q1: 800, median: 1000, q3: 1200, min: 600, max: 1400 },
    { region: 'South', q1: 900, median: 1100, q3: 1300, min: 700, max: 1500 },
  ],
  config: {
    xAxis: 'region',
    colors: ['#2563eb'],
  },
  statistics: {
    outliers: {
      enabled: true,
      method: 'iqr',
      color: '#ef4444',
      size: 6,
    },
    outlierData: {
      indices: [5, 12, 23],
      values: [2000, 1950, 2100],
      method: 'iqr',
      zScores: [3.2, 3.0, 3.5],
    },
  },
  insights: {
    primary: 'North region shows more consistent performance with fewer outliers',
    significance: 0.78,
  },
};

// ============================================================================
// Example 4: Enhanced Statistics with All Features
// ============================================================================

export const exampleEnhancedStatistics: IStatistics = {
  // Base statistics (existing)
  trends: [
    {
      column: 'sales',
      direction: 'increasing',
      slope: 250,
      rSquared: 0.95,
    },
  ],
  correlations: [
    {
      column1: 'sales',
      column2: 'revenue',
      coefficient: 0.95,
      significance: 'strong',
    },
  ],
  distributions: [
    {
      column: 'sales',
      mean: 1200,
      median: 1150,
      stdDev: 200,
      outliers: 3,
    },
  ],

  // Enhanced statistics (new)
  advancedTrends: {
    seasonal: [
      {
        period: 7,
        strength: 0.85,
        pattern: [1.0, 1.1, 1.2, 1.3, 1.2, 0.9, 0.8],
        confidence: 0.95,
      },
    ],
    changePoints: [
      {
        index: 45,
        timestamp: '2024-02-15',
        significance: 0.92,
        direction: 'increase',
      },
    ],
    movingAverages: [
      {
        column: 'sales',
        periods: [7, 30, 90],
        values: {
          7: [1000, 1050, 1100, 1150],
          30: [950, 1000, 1050, 1100],
          90: [900, 950, 1000, 1050],
        },
      },
    ],
  },

  correlationMatrix: {
    columns: ['sales', 'revenue', 'marketing', 'customers'],
    matrix: [
      [1.0, 0.95, 0.78, 0.82],
      [0.95, 1.0, 0.81, 0.85],
      [0.78, 0.81, 1.0, 0.72],
      [0.82, 0.85, 0.72, 1.0],
    ],
    pValues: [
      [0, 0.001, 0.01, 0.005],
      [0.001, 0, 0.008, 0.003],
      [0.01, 0.008, 0, 0.02],
      [0.005, 0.003, 0.02, 0],
    ],
    method: 'pearson',
  },

  outlierAnalysis: [
    {
      column: 'sales',
      method: 'iqr',
      outliers: [
        { index: 5, value: 2000, zScore: 3.2 },
        { index: 12, value: 1950, zScore: 3.0 },
      ],
      threshold: 1.5,
      lowerBound: 400,
      upperBound: 1800,
    },
    {
      column: 'revenue',
      method: 'zscore',
      outliers: [
        { index: 8, value: 95000, zScore: 3.5 },
      ],
      threshold: 3.0,
    },
  ],

  insights: [
    {
      type: 'trend',
      title: 'Strong Upward Sales Trend',
      description:
        'Sales have increased consistently over the past 6 months with a 95% R-squared value, indicating a very strong linear trend.',
      significance: 0.95,
      impact: 'high',
      recommendation:
        'Continue current strategy and consider scaling operations to meet growing demand.',
      relatedChartId: 'combo-1',
      metadata: {
        slope: 250,
        projectedNextMonth: 1750,
      },
    },
    {
      type: 'correlation',
      title: 'Marketing Spend Drives Sales',
      description:
        'Strong positive correlation (r=0.87) between marketing spend and sales, with statistical significance (p<0.01).',
      significance: 0.87,
      impact: 'high',
      recommendation:
        'Increase marketing budget by 20% to drive proportional sales growth.',
      metadata: {
        coefficient: 0.87,
        pValue: 0.008,
      },
    },
    {
      type: 'outlier',
      title: 'Unusual Sales Spike Detected',
      description:
        'Three data points exceed 3 standard deviations from the mean, occurring during promotional periods.',
      significance: 0.78,
      impact: 'medium',
      recommendation:
        'Investigate promotional strategies that led to these spikes for potential replication.',
      relatedChartId: 'boxplot-1',
      metadata: {
        outlierCount: 3,
        maxDeviation: 3.5,
      },
    },
    {
      type: 'seasonality',
      title: 'Weekly Seasonal Pattern',
      description:
        'Clear 7-day seasonal pattern with 85% strength, showing peaks mid-week and dips on weekends.',
      significance: 0.85,
      impact: 'medium',
      recommendation:
        'Adjust staffing and inventory levels to match weekly demand patterns.',
      metadata: {
        period: 7,
        peakDay: 'Wednesday',
        lowDay: 'Sunday',
      },
    },
  ],
};

// ============================================================================
// Example 5: Annotation Examples
// ============================================================================

export const exampleAnnotations: Annotation[] = [
  // Text annotation
  {
    type: 'text',
    position: { x: '2024-01-15', y: 1000 },
    content: 'Product Launch',
    style: {
      color: '#ef4444',
      fontSize: 12,
      fontWeight: 600,
      backgroundColor: '#fef2f2',
      borderColor: '#ef4444',
      borderWidth: 1,
    },
    id: 'annotation-1',
  },

  // Line annotation (vertical)
  {
    type: 'line',
    position: { x: '2024-02-01', y: 0 },
    content: 'Quarter Start',
    style: {
      color: '#3b82f6',
      borderWidth: 2,
    },
    id: 'annotation-2',
  },

  // Region annotation (shaded area)
  {
    type: 'region',
    position: { x: '2024-01-01', y: 0 },
    content: 'Holiday Season',
    style: {
      backgroundColor: '#fef3c7',
      opacity: 0.3,
    },
    id: 'annotation-3',
  },
];

// ============================================================================
// Example 6: Interaction Configuration
// ============================================================================

export const exampleInteractionConfig: InteractionConfig = {
  zoom: true,
  pan: true,
  brush: true,
  crosshair: true,
  tooltip: {
    enabled: true,
    showPercentage: true,
    showRank: true,
    showComparison: true,
    customContent: false,
    followCursor: true,
    delay: 100,
  },
  legend: {
    enabled: true,
    position: 'bottom',
    interactive: true,
    collapsible: true,
  },
  zoomPan: {
    enabled: true,
    zoomOnWheel: true,
    panOnDrag: true,
    minZoom: 0.5,
    maxZoom: 10,
  },
  brushConfig: {
    enabled: true,
    axis: 'x',
    color: '#3b82f6',
  },
};

// ============================================================================
// Type Guards and Validation Helpers
// ============================================================================

/**
 * Check if a chart type is an advanced chart type
 */
export function isAdvancedChartType(type: string): type is AdvancedChartType {
  return [
    'combination',
    'heatmap',
    'boxplot',
    'waterfall',
    'funnel',
    'radar',
    'area',
    'candlestick',
  ].includes(type);
}

/**
 * Check if a chart has statistical overlays
 */
export function hasStatisticalOverlays(chart: IChart): boolean {
  return !!(
    chart.statistics &&
    (chart.statistics.trendLine ||
      chart.statistics.movingAverage ||
      chart.statistics.outliers ||
      chart.statistics.annotations)
  );
}

/**
 * Check if a chart has interactions enabled
 */
export function hasInteractions(chart: IChart): boolean {
  return !!(
    chart.interactions &&
    (chart.interactions.zoom ||
      chart.interactions.pan ||
      chart.interactions.brush)
  );
}

/**
 * Get insight count by type
 */
export function getInsightCountByType(
  statistics: IStatistics
): Record<string, number> {
  if (!statistics.insights) return {};

  return statistics.insights.reduce(
    (acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Get high-impact insights
 */
export function getHighImpactInsights(statistics: IStatistics): Insight[] {
  if (!statistics.insights) return [];
  return statistics.insights.filter((insight) => insight.impact === 'high');
}

/**
 * Sort insights by significance
 */
export function sortInsightsBySignificance(insights: Insight[]): Insight[] {
  return [...insights].sort((a, b) => b.significance - a.significance);
}
