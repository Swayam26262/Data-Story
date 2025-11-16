'use client';

import type { ChartData } from '@/lib/models/Story';
import type { StatisticalOverlay, InteractionConfig } from '@/types';
import { useState, useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  Label,
} from 'recharts';
import { useChartThemeOptional } from '@/lib/theme';
import { useOptionalCrossChartHighlight } from './interactions/CrossChartHighlightContext';
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';
import { ResponsiveTooltip } from './interactions/ResponsiveTooltip';
import { ResponsiveLegend } from './interactions/ResponsiveLegend';
import { ResponsiveControls } from './interactions/ResponsiveControls';
import { ResponsiveChartWrapper } from './ResponsiveChartWrapper';
import { AccessibleChart } from './AccessibleChart';
import { useChartKeyboardNavigation } from '@/lib/hooks/useChartKeyboardNavigation';
import { getFocusRingStyle, generateDataPointLabel } from '@/lib/utils/accessibility';

interface LineChartProps {
  data: ChartData;
  title: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    legend?: boolean;
  };
  statistics?: StatisticalOverlay;
  interactions?: InteractionConfig;
  chartId?: string;
}

export default function LineChart({ 
  data, 
  title, 
  config,
  statistics,
  interactions,
  chartId = 'line-chart',
}: LineChartProps) {
  const { theme, getColor } = useChartThemeOptional();
  const responsive = useResponsiveChart();
  const { xAxis = 'x', yAxis = 'y', colors, legend = true } = config;
  const highlightContext = useOptionalCrossChartHighlight();

  // Use theme colors if custom colors not provided
  const chartColors = colors || [getColor(0)];

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  // State for interactions
  const [zoomState, setZoomState] = useState({ left: 0, right: chartData.length - 1 });
  const [brushSelection, setBrushSelection] = useState<any>(null);
  const [legendState, setLegendState] = useState<Record<string, boolean>>({ [yAxis]: true });

  // Keyboard navigation
  const {
    focusedIndex,
    isKeyboardMode,
    isIndexFocused,
    containerProps,
  } = useChartKeyboardNavigation({
    dataLength: chartData.length,
    chartId,
    onDataPointFocus: (index) => {
      // Optionally scroll to focused point
    },
    onDataPointSelect: (index) => {
      handleDataPointClick(chartData[index]);
    },
    enabled: interactions?.tooltip?.enabled !== false,
  });

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

  // Enhanced tooltip content using responsive component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length || !dataStats) return null;

    const value = payload[0].value;
    const percentOfTotal = (value / dataStats.total) * 100;
    const comparisonToAverage = ((value - dataStats.avg) / dataStats.avg) * 100;
    const rank = dataStats.values.filter((v: number) => v > value).length + 1;

    return (
      <ResponsiveTooltip
        active={active}
        payload={payload}
        label={label}
        metrics={[
          {
            label: payload[0].name || yAxis,
            value: typeof value === 'number' ? value.toLocaleString() : value,
            color: payload[0].color || payload[0].stroke,
          },
        ]}
        statistics={{
          percentOfTotal,
          rank,
          comparisonToAverage,
        }}
      />
    );
  };

  // Handle data point click for cross-chart highlighting
  const handleDataPointClick = (data: any) => {
    if (highlightContext && interactions?.tooltip?.enabled !== false) {
      highlightContext.highlightPoint(chartId, data);
    }
  };

  // Check if point is highlighted
  const isPointHighlighted = (dataPoint: any) => {
    if (!highlightContext) return false;
    return highlightContext.isPointHighlighted(chartId, dataPoint);
  };

  // Check if point is focused (keyboard navigation)
  const isPointFocused = (index: number) => {
    return isIndexFocused(index);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    const range = zoomState.right - zoomState.left;
    const newRange = Math.max(10, Math.floor(range * 0.8));
    const center = Math.floor((zoomState.left + zoomState.right) / 2);
    setZoomState({
      left: Math.max(0, center - Math.floor(newRange / 2)),
      right: Math.min(chartData.length - 1, center + Math.floor(newRange / 2)),
    });
  };

  const handleZoomOut = () => {
    const range = zoomState.right - zoomState.left;
    const newRange = Math.min(chartData.length, Math.floor(range * 1.2));
    const center = Math.floor((zoomState.left + zoomState.right) / 2);
    setZoomState({
      left: Math.max(0, center - Math.floor(newRange / 2)),
      right: Math.min(chartData.length - 1, center + Math.floor(newRange / 2)),
    });
  };

  const handleReset = () => {
    setZoomState({ left: 0, right: chartData.length - 1 });
  };

  // Legend items for responsive legend
  const legendItems = [
    {
      name: yAxis,
      color: chartColors[0],
      visible: legendState[yAxis] !== false,
    },
  ];

  return (
    <AccessibleChart
      chartId={chartId}
      chartType="line"
      title={title}
      data={data}
      config={config}
      statistics={statistics}
    >
      <ResponsiveChartWrapper title={title} className="h-full">
        {/* Zoom Controls */}
        {interactions?.zoom && (
          <ResponsiveControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            zoomDisabled={{
              in: zoomState.right - zoomState.left <= 10,
              out: zoomState.right - zoomState.left >= chartData.length - 1,
            }}
            className="mb-2"
          />
        )}

        {/* Interactive Legend */}
        {legend && interactions?.legend?.interactive && (
          <ResponsiveLegend
            items={legendItems}
            onToggle={(name) => setLegendState((prev) => ({ ...prev, [name]: !prev[name] }))}
            interactive
            className="mb-2"
          />
        )}

        <div {...containerProps}>
          <ResponsiveContainer width="100%" height="100%" minHeight={responsive.layout.minHeight}>
        <RechartsLineChart
          data={displayData}
          margin={{
            top: responsive.spacing.chartPadding.top,
            right: responsive.spacing.chartPadding.right,
            bottom: responsive.spacing.chartPadding.bottom,
            left: responsive.spacing.chartPadding.left,
          }}
          onClick={handleDataPointClick}
        >
          <CartesianGrid
            strokeDasharray={theme.tokens.borders.gridLineDash.join(' ')}
            stroke={theme.tokens.borders.gridLineColor}
            strokeWidth={theme.tokens.borders.gridLineWidth}
          />
          <XAxis
            dataKey={xAxis}
            stroke={theme.tokens.borders.axisLineColor}
            style={{
              fontSize: `${responsive.fontSize.axisLabel}px`,
              fontWeight: theme.typography.axisLabel.fontWeight,
            }}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: responsive.fontSize.axisLabel,
            }}
            angle={responsive.layout.axisLabelAngle}
            textAnchor="end"
            height={responsive.isMobile ? 50 : 60}
          />
          <YAxis
            stroke={theme.tokens.borders.axisLineColor}
            style={{
              fontSize: `${responsive.fontSize.axisLabel}px`,
              fontWeight: theme.typography.axisLabel.fontWeight,
            }}
            tick={{
              fill: theme.typography.axisLabel.color,
              fontSize: responsive.fontSize.axisLabel,
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: '3 3' }}
          />
          {legend && !interactions?.legend?.interactive && (
            <Legend
              wrapperStyle={{
                paddingTop: `${responsive.spacing.legendSpacing}px`,
                fontSize: `${responsive.fontSize.legend}px`,
              }}
              iconType="line"
            />
          )}

          {/* Reference Lines */}
          {statistics?.referenceLines?.map((refLine, idx) => (
            <ReferenceArea
              key={`ref-${idx}`}
              y1={refLine.value}
              y2={refLine.value}
              stroke={refLine.color || theme.colors.semantic.neutral}
              strokeDasharray={refLine.strokeDasharray || '5 5'}
            >
              {refLine.label && <Label value={refLine.label} position="insideTopRight" />}
            </ReferenceArea>
          ))}

          {/* Main Line */}
          {legendState[yAxis] !== false && (
            <Line
              type="monotone"
              dataKey={yAxis}
              stroke={chartColors[0]}
              strokeWidth={2}
              dot={(props: any) => {
                const isHighlighted = isPointHighlighted(props.payload);
                const isFocused = isPointFocused(props.index);
                const pointLabel = generateDataPointLabel(props.payload, props.index, config, 'line');
                
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={isHighlighted || isFocused ? 6 : 3}
                    fill={chartColors[0]}
                    stroke={isHighlighted || isFocused ? '#fff' : chartColors[0]}
                    strokeWidth={isHighlighted || isFocused ? 2 : 0}
                    style={{
                      filter: isHighlighted || isFocused ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))' : 'none',
                      ...getFocusRingStyle(isFocused),
                    }}
                    role="img"
                    aria-label={pointLabel}
                  />
                );
              }}
              activeDot={{ r: 5 }}
              animationDuration={theme.tokens.animations.duration}
            />
          )}

          {/* Brush Selection */}
          {interactions?.brush && brushSelection && (
            <ReferenceArea
              x1={brushSelection.x1}
              x2={brushSelection.x2}
              strokeOpacity={0.3}
              fill={theme.colors.categorical[0]}
              fillOpacity={0.1}
            />
          )}
        </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </ResponsiveChartWrapper>
    </AccessibleChart>
  );
}
