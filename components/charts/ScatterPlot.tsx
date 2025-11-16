'use client';

import type { ChartData, ChartDataPoint } from '@/lib/models/Story';
import type { StatisticalOverlay, InteractionConfig } from '@/types';
import { useState, useMemo } from 'react';
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ZAxis,
  Cell,
} from 'recharts';
import { useChartThemeOptional } from '@/lib/theme';
import { useOptionalCrossChartHighlight } from './interactions/CrossChartHighlightContext';
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';
import { ResponsiveTooltip } from './interactions/ResponsiveTooltip';
import { ResponsiveLegend } from './interactions/ResponsiveLegend';
import { ResponsiveControls } from './interactions/ResponsiveControls';
import { ResponsiveChartWrapper } from './ResponsiveChartWrapper';
import { getResponsiveMargin, getResponsiveAxisConfig, getResponsiveDotSize } from '@/lib/utils/responsive-chart-utils';

interface ScatterPlotProps {
  data: ChartData;
  title: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    sizeKey?: string; // For bubble chart mode
    colors?: string[];
    legend?: boolean;
    trendLine?: boolean;
    bubbleMode?: boolean;
  };
  statistics?: StatisticalOverlay;
  interactions?: InteractionConfig;
  chartId?: string;
}

export default function ScatterPlot({ 
  data, 
  title, 
  config,
  statistics,
  interactions,
  chartId = 'scatter-plot',
}: ScatterPlotProps) {
  const { theme, getColor, getSemanticColor } = useChartThemeOptional();
  const responsive = useResponsiveChart();
  const {
    xAxis = 'x',
    yAxis = 'y',
    sizeKey,
    colors,
    legend = true,
    trendLine = false,
    bubbleMode = false,
  } = config;
  const highlightContext = useOptionalCrossChartHighlight();

  // Use theme colors if custom colors not provided
  const chartColors = colors || [getColor(0)];

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  // State for interactions
  const [zoomDomain, setZoomDomain] = useState<any>(null);
  const [brushSelection, setBrushSelection] = useState<any>(null);
  const [legendState, setLegendState] = useState<Record<string, boolean>>({ [yAxis]: true });

  // Calculate trend line and statistics
  const { trendLineData, correlation, dataStats } = useMemo(() => {
    if (chartData.length < 2) return { trendLineData: null, correlation: null, dataStats: null };

    let count = 0;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    const validPoints: Array<{ x: number; y: number }> = [];

    chartData.forEach((point: ChartDataPoint) => {
      const x = Number(point[xAxis]);
      const y = Number(point[yAxis]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }
      validPoints.push({ x, y });
      count += 1;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    });

    if (count < 2) return { trendLineData: null, correlation: null, dataStats: null };

    // Calculate trend line
    const slope = (count * sumXY - sumX * sumY) / (count * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / count;

    // Calculate R-squared
    const yMean = sumY / count;
    let ssTotal = 0;
    let ssResidual = 0;
    validPoints.forEach(({ x, y }) => {
      const yPred = slope * x + intercept;
      ssTotal += Math.pow(y - yMean, 2);
      ssResidual += Math.pow(y - yPred, 2);
    });
    const rSquared = 1 - (ssResidual / ssTotal);

    // Calculate correlation coefficient
    const correlationCoef = (count * sumXY - sumX * sumY) / 
      Math.sqrt((count * sumX2 - sumX * sumX) * (count * sumY2 - sumY * sumY));

    const trendData: { [key: string]: number }[] = [];
    const xMin = Math.min(...validPoints.map(p => p.x));
    const xMax = Math.max(...validPoints.map(p => p.x));

    trendData.push({ [xAxis]: xMin, trend: slope * xMin + intercept });
    trendData.push({ [xAxis]: xMax, trend: slope * xMax + intercept });

    // Calculate statistics for tooltip
    const yValues = validPoints.map(p => p.y);
    const total = yValues.reduce((sum, v) => sum + v, 0);
    const avg = total / yValues.length;

    return {
      trendLineData: trendLine ? trendData : null,
      correlation: { coefficient: correlationCoef, rSquared, slope, intercept },
      dataStats: { total, avg, values: yValues },
    };
  }, [chartData, xAxis, yAxis, trendLine]);

  // If no valid data, show error message
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No data available for this chart</p>
        </div>
      </div>
    );
  }

  // Enhanced tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length || !dataStats) return null;

    const point = payload[0].payload;
    const xValue = point[xAxis];
    const yValue = point[yAxis];
    const sizeValue = sizeKey ? point[sizeKey] : undefined;

    const percentOfTotal = (yValue / dataStats.total) * 100;
    const comparisonToAverage = ((yValue - dataStats.avg) / dataStats.avg) * 100;
    const rank = dataStats.values.filter((v: number) => v > yValue).length + 1;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px]">
        <div className="font-semibold text-gray-900 text-sm mb-2">Point ({xValue}, {yValue})</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{xAxis}:</span>
            <span className="font-medium text-gray-900">{typeof xValue === 'number' ? xValue.toLocaleString() : xValue}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{yAxis}:</span>
            <span className="font-medium text-gray-900">{typeof yValue === 'number' ? yValue.toLocaleString() : yValue}</span>
          </div>
          {sizeValue !== undefined && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">{sizeKey}:</span>
              <span className="font-medium text-gray-900">{typeof sizeValue === 'number' ? sizeValue.toLocaleString() : sizeValue}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">% of Total:</span>
            <span className="font-medium text-gray-900">{percentOfTotal.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Rank:</span>
            <span className="font-medium text-gray-900">#{rank}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">vs. Average:</span>
            <span className={`font-medium ${comparisonToAverage > 0 ? 'text-green-600' : comparisonToAverage < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {comparisonToAverage > 0 ? '+' : ''}{comparisonToAverage.toFixed(1)}%
            </span>
          </div>
          {correlation && (
            <div className="text-xs text-gray-600 mt-1 pt-1 border-t">
              Correlation: {correlation.coefficient.toFixed(3)} (R² = {correlation.rSquared.toFixed(3)})
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle point click for cross-chart highlighting
  const handlePointClick = (data: any) => {
    if (highlightContext && interactions?.tooltip?.enabled !== false) {
      highlightContext.highlightPoint(chartId, data);
    }
  };

  // Check if point is highlighted
  const isPointHighlighted = (dataPoint: any) => {
    if (!highlightContext) return false;
    return highlightContext.isPointHighlighted(chartId, dataPoint);
  };

  // Check if point is an outlier
  const isOutlier = (dataPoint: any) => {
    if (!statistics?.outlierData) return false;
    const index = chartData.indexOf(dataPoint);
    return statistics.outlierData.indices.includes(index);
  };

  return (
    <div className="w-full h-full min-h-[250px] sm:min-h-[300px]">
      <h3
        style={{
          fontSize: `${theme.typography.title.fontSize}px`,
          fontWeight: theme.typography.title.fontWeight,
          color: theme.typography.title.color,
          marginBottom: `${theme.tokens.spacing.titleMargin}px`,
        }}
      >
        {title}
      </h3>

      {/* Correlation Info */}
      {correlation && (
        <div className="text-xs text-gray-600 mb-2">
          Correlation: {correlation.coefficient.toFixed(3)} | R² = {correlation.rSquared.toFixed(3)}
        </div>
      )}

      {/* Zoom Controls */}
      {interactions?.zoom && (
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setZoomDomain(null)}
            disabled={zoomDomain === null}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Reset Zoom
          </button>
        </div>
      )}

      {/* Interactive Legend */}
      {legend && interactions?.legend?.interactive && (
        <div className="flex gap-2 mb-2 flex-wrap">
          <button
            onClick={() => setLegendState((prev) => ({ ...prev, [yAxis]: !prev[yAxis] }))}
            className="flex items-center gap-2 px-2 py-1 text-xs border rounded"
            style={{ opacity: legendState[yAxis] === false ? 0.5 : 1 }}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[0] }} />
            <span>{yAxis}</span>
          </button>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <RechartsScatterChart
          margin={{
            top: theme.tokens.spacing.chartPadding.top,
            right: theme.tokens.spacing.chartPadding.right,
            bottom: theme.tokens.spacing.chartPadding.bottom,
            left: theme.tokens.spacing.chartPadding.left,
          }}
          onClick={handlePointClick}
        >
          <CartesianGrid
            strokeDasharray={theme.tokens.borders.gridLineDash.join(' ')}
            stroke={theme.tokens.borders.gridLineColor}
            strokeWidth={theme.tokens.borders.gridLineWidth}
          />
          <XAxis
            type="number"
            dataKey={xAxis}
            name={xAxis}
            stroke={theme.tokens.borders.axisLineColor}
            style={{
              fontSize: `${theme.typography.axisLabel.fontSize}px`,
              fontWeight: theme.typography.axisLabel.fontWeight,
            }}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: theme.typography.axisLabel.fontSize,
            }}
            domain={zoomDomain?.x || ['auto', 'auto']}
          />
          <YAxis
            type="number"
            dataKey={yAxis}
            name={yAxis}
            stroke={theme.tokens.borders.axisLineColor}
            style={{
              fontSize: `${theme.typography.axisLabel.fontSize}px`,
              fontWeight: theme.typography.axisLabel.fontWeight,
            }}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: theme.typography.axisLabel.fontSize,
            }}
            domain={zoomDomain?.y || ['auto', 'auto']}
          />
          {bubbleMode && sizeKey && (
            <ZAxis type="number" dataKey={sizeKey} range={[50, 400]} />
          )}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: '3 3' }}
          />
          {legend && !interactions?.legend?.interactive && (
            <Legend
              wrapperStyle={{
                paddingTop: `${theme.tokens.spacing.legendSpacing}px`,
                fontSize: `${theme.typography.legend.fontSize}px`,
              }}
            />
          )}

          {/* Main Scatter */}
          {legendState[yAxis] !== false && (
            <Scatter
              name={yAxis}
              data={chartData}
              shape="circle"
              animationDuration={theme.tokens.animations.duration}
            >
              {chartData.map((entry: any, index: number) => {
                const isHighlighted = isPointHighlighted(entry);
                const isOutlierPoint = isOutlier(entry);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isOutlierPoint ? getSemanticColor('warning') : chartColors[0]}
                    opacity={isHighlighted ? 1 : 0.7}
                    stroke={isHighlighted ? '#fff' : isOutlierPoint ? getSemanticColor('negative') : 'none'}
                    strokeWidth={isHighlighted ? 3 : isOutlierPoint ? 2 : 0}
                    style={{
                      filter: isHighlighted ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))' : 'none',
                    }}
                  />
                );
              })}
            </Scatter>
          )}

          {/* Trend Line */}
          {trendLineData && (
            <Line
              type="monotone"
              dataKey="trend"
              data={trendLineData}
              stroke={getSemanticColor('info')}
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              name={`Trend (R²=${correlation?.rSquared.toFixed(3)})`}
              animationDuration={0}
            />
          )}

          {/* Confidence Interval */}
          {statistics?.trendLineData?.confidenceInterval && (
            <>
              <Line
                type="monotone"
                dataKey="upper"
                data={statistics.trendLineData.confidenceInterval.upper.map((y, i) => ({
                  [xAxis]: chartData[i]?.[xAxis],
                  upper: y,
                }))}
                stroke={getSemanticColor('info')}
                strokeWidth={1}
                dot={false}
                strokeDasharray="2 2"
                strokeOpacity={0.5}
                animationDuration={0}
              />
              <Line
                type="monotone"
                dataKey="lower"
                data={statistics.trendLineData.confidenceInterval.lower.map((y, i) => ({
                  [xAxis]: chartData[i]?.[xAxis],
                  lower: y,
                }))}
                stroke={getSemanticColor('info')}
                strokeWidth={1}
                dot={false}
                strokeDasharray="2 2"
                strokeOpacity={0.5}
                animationDuration={0}
              />
            </>
          )}
        </RechartsScatterChart>
      </ResponsiveContainer>


    </div>
  );
}
