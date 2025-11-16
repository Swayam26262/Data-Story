'use client';

import type { ChartData } from '@/lib/models/Story';
import type { StatisticalOverlay, InteractionConfig } from '@/types';
import { useState, useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Label,
  LabelList,
} from 'recharts';
import { useChartThemeOptional } from '@/lib/theme';
import { useOptionalCrossChartHighlight } from './interactions/CrossChartHighlightContext';
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';
import { ResponsiveTooltip } from './interactions/ResponsiveTooltip';
import { ResponsiveLegend } from './interactions/ResponsiveLegend';
import { ResponsiveControls } from './interactions/ResponsiveControls';
import { ResponsiveChartWrapper } from './ResponsiveChartWrapper';

interface BarChartProps {
  data: ChartData;
  title: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    legend?: boolean;
    orientation?: 'horizontal' | 'vertical';
    diverging?: boolean; // Support diverging bar chart mode
    baseline?: number; // Baseline for diverging mode
    showDataLabels?: boolean;
  };
  statistics?: StatisticalOverlay;
  interactions?: InteractionConfig;
  chartId?: string;
}

export default function BarChart({ 
  data, 
  title, 
  config,
  statistics,
  interactions,
  chartId = 'bar-chart',
}: BarChartProps) {
  const { theme, getColor, getSemanticColor } = useChartThemeOptional();
  const responsive = useResponsiveChart();
  const {
    xAxis = 'x',
    yAxis = 'y',
    colors,
    legend = true,
    orientation = 'vertical',
    diverging = false,
    baseline = 0,
    showDataLabels = false,
  } = config;
  const highlightContext = useOptionalCrossChartHighlight();

  // Use theme colors if custom colors not provided
  const chartColors = colors || [getColor(0)];

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  const isHorizontal = orientation === 'horizontal';

  // State for interactions
  const [zoomState, setZoomState] = useState({ left: 0, right: chartData.length - 1 });
  const [brushSelection, setBrushSelection] = useState<any>(null);
  const [legendState, setLegendState] = useState<Record<string, boolean>>({ [yAxis]: true });

  // Calculate statistics for tooltip
  const dataStats = useMemo(() => {
    if (chartData.length === 0) return null;
    const values = chartData.map((d: any) => Number(d[yAxis])).filter((v: number) => !isNaN(v));
    const total = values.reduce((sum: number, v: number) => sum + v, 0);
    const avg = total / values.length;
    return { total, avg, values };
  }, [chartData, yAxis]);

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

  // Filter data based on zoom
  const displayData = chartData.slice(zoomState.left, zoomState.right + 1);

  // Enhanced tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length || !dataStats) return null;

    const value = payload[0].value;
    const percentOfTotal = (Math.abs(value) / Math.abs(dataStats.total)) * 100;
    const comparisonToAverage = ((value - dataStats.avg) / Math.abs(dataStats.avg)) * 100;
    const rank = dataStats.values.filter((v: number) => Math.abs(v) > Math.abs(value)).length + 1;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px]">
        <div className="font-semibold text-gray-900 text-sm mb-2">{String(label)}</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{payload[0].name || yAxis}:</span>
            <span className="font-medium text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</span>
          </div>
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
        </div>
      </div>
    );
  };

  // Handle bar click for cross-chart highlighting
  const handleBarClick = (data: any) => {
    if (highlightContext && interactions?.tooltip?.enabled !== false) {
      highlightContext.highlightPoint(chartId, data);
    }
  };

  // Check if bar is highlighted
  const isBarHighlighted = (dataPoint: any) => {
    if (!highlightContext) return false;
    return highlightContext.isPointHighlighted(chartId, dataPoint);
  };

  // Get bar color based on diverging mode
  const getBarColor = (value: number, index: number) => {
    if (diverging) {
      return value >= baseline ? getSemanticColor('positive') : getSemanticColor('negative');
    }
    return chartColors[index % chartColors.length];
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

      {/* Zoom Controls */}
      {interactions?.zoom && (
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => {
              const range = zoomState.right - zoomState.left;
              const newRange = Math.max(5, Math.floor(range * 0.8));
              const center = Math.floor((zoomState.left + zoomState.right) / 2);
              setZoomState({
                left: Math.max(0, center - Math.floor(newRange / 2)),
                right: Math.min(chartData.length - 1, center + Math.floor(newRange / 2)),
              });
            }}
            disabled={zoomState.right - zoomState.left <= 5}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Zoom In
          </button>
          <button
            onClick={() => {
              const range = zoomState.right - zoomState.left;
              const newRange = Math.min(chartData.length, Math.floor(range * 1.2));
              const center = Math.floor((zoomState.left + zoomState.right) / 2);
              setZoomState({
                left: Math.max(0, center - Math.floor(newRange / 2)),
                right: Math.min(chartData.length - 1, center + Math.floor(newRange / 2)),
              });
            }}
            disabled={zoomState.right - zoomState.left >= chartData.length - 1}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Zoom Out
          </button>
          <button
            onClick={() => setZoomState({ left: 0, right: chartData.length - 1 })}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded"
          >
            Reset
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
            <div className="w-3 h-3 rounded" style={{ backgroundColor: chartColors[0] }} />
            <span>{yAxis}</span>
          </button>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <RechartsBarChart
          data={displayData}
          layout={isHorizontal ? 'horizontal' : 'vertical'}
          margin={{
            top: theme.tokens.spacing.chartPadding.top,
            right: theme.tokens.spacing.chartPadding.right,
            bottom: theme.tokens.spacing.chartPadding.bottom + (isHorizontal ? 0 : 40),
            left: theme.tokens.spacing.chartPadding.left + (isHorizontal ? 40 : 0),
          }}
          onClick={handleBarClick}
        >
          <CartesianGrid
            strokeDasharray={theme.tokens.borders.gridLineDash.join(' ')}
            stroke={theme.tokens.borders.gridLineColor}
            strokeWidth={theme.tokens.borders.gridLineWidth}
          />
          {isHorizontal ? (
            <>
              <XAxis
                type="number"
                stroke={theme.tokens.borders.axisLineColor}
                style={{
                  fontSize: `${theme.typography.axisLabel.fontSize}px`,
                  fontWeight: theme.typography.axisLabel.fontWeight,
                }}
                tick={{
                  fill: theme.typography.axisLabel.color,
                  fontSize: theme.typography.axisLabel.fontSize,
                }}
              />
              <YAxis
                type="category"
                dataKey={xAxis}
                stroke={theme.tokens.borders.axisLineColor}
                style={{
                  fontSize: `${theme.typography.axisLabel.fontSize}px`,
                  fontWeight: theme.typography.axisLabel.fontWeight,
                }}
                tick={{
                  fill: theme.typography.axisLabel.color,
                  fontSize: theme.typography.axisLabel.fontSize,
                }}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                type="category"
                dataKey={xAxis}
                stroke={theme.tokens.borders.axisLineColor}
                style={{
                  fontSize: `${theme.typography.axisLabel.fontSize}px`,
                  fontWeight: theme.typography.axisLabel.fontWeight,
                }}
                tick={{
                  fill: theme.typography.axisLabel.color,
                  fontSize: theme.typography.axisLabel.fontSize,
                }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                type="number"
                stroke={theme.tokens.borders.axisLineColor}
                style={{
                  fontSize: `${theme.typography.axisLabel.fontSize}px`,
                  fontWeight: theme.typography.axisLabel.fontWeight,
                }}
                tick={{
                  fill: theme.typography.axisLabel.color,
                  fontSize: theme.typography.axisLabel.fontSize,
                }}
              />
            </>
          )}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          {legend && !interactions?.legend?.interactive && (
            <Legend
              wrapperStyle={{
                paddingTop: `${theme.tokens.spacing.legendSpacing}px`,
                fontSize: `${theme.typography.legend.fontSize}px`,
              }}
            />
          )}

          {/* Baseline Reference Line for Diverging Mode */}
          {diverging && (
            <ReferenceLine
              y={isHorizontal ? undefined : baseline}
              x={isHorizontal ? baseline : undefined}
              stroke={theme.tokens.borders.axisLineColor}
              strokeWidth={2}
            >
              <Label value="Baseline" position="insideTopRight" />
            </ReferenceLine>
          )}

          {/* Reference Lines from Statistics */}
          {statistics?.referenceLines?.map((refLine, idx) => (
            <ReferenceLine
              key={`ref-${idx}`}
              y={refLine.axis === 'y' ? refLine.value : undefined}
              x={refLine.axis === 'x' ? refLine.value : undefined}
              stroke={refLine.color || theme.colors.semantic.neutral}
              strokeDasharray={refLine.strokeDasharray || '5 5'}
              label={refLine.label}
            />
          ))}

          {/* Main Bar */}
          {legendState[yAxis] !== false && (
            <Bar
              dataKey={yAxis}
              radius={[4, 4, 0, 0]}
              animationDuration={theme.tokens.animations.duration}
            >
              {displayData.map((entry: any, index: number) => {
                const value = Number(entry[yAxis]);
                const isHighlighted = isBarHighlighted(entry);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(value, index)}
                    opacity={isHighlighted ? 1 : 0.85}
                    stroke={isHighlighted ? '#fff' : 'none'}
                    strokeWidth={isHighlighted ? 2 : 0}
                    style={{
                      filter: isHighlighted ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))' : 'none',
                    }}
                  />
                );
              })}
              {showDataLabels && (
                <LabelList
                  dataKey={yAxis}
                  position={isHorizontal ? 'right' : 'top'}
                  style={{
                    fontSize: theme.typography.dataLabel.fontSize,
                    fill: theme.typography.dataLabel.color,
                  }}
                />
              )}
            </Bar>
          )}
        </RechartsBarChart>
      </ResponsiveContainer>


    </div>
  );
}
