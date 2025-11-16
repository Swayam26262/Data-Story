'use client';

import type { ChartData, ChartDataPoint } from '@/lib/models/Story';
import type { StatisticalOverlay, InteractionConfig } from '@/types';
import { useState, useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import { useChartThemeOptional } from '@/lib/theme';
import { useOptionalCrossChartHighlight } from './interactions/CrossChartHighlightContext';
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';
import { ResponsiveTooltip } from './interactions/ResponsiveTooltip';
import { ResponsiveLegend } from './interactions/ResponsiveLegend';
import { ResponsiveChartWrapper } from './ResponsiveChartWrapper';

interface PieChartProps {
  data: ChartData;
  title: string;
  config: {
    nameKey?: keyof ChartDataPoint;
    valueKey?: keyof ChartDataPoint;
    colors?: string[];
    legend?: boolean;
    donutMode?: boolean;
    innerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    showDataLabels?: boolean;
    showLeaderLines?: boolean;
  };
  statistics?: StatisticalOverlay;
  interactions?: InteractionConfig;
  chartId?: string;
}

export default function PieChart({ 
  data, 
  title, 
  config,
  statistics,
  interactions,
  chartId = 'pie-chart',
}: PieChartProps) {
  const { theme } = useChartThemeOptional();
  const responsive = useResponsiveChart();
  const {
    nameKey = 'name',
    valueKey = 'value',
    colors,
    legend = true,
    donutMode = false,
    innerRadius = 0,
    startAngle = 0,
    endAngle = 360,
    showDataLabels = true,
    showLeaderLines = true,
  } = config;
  const highlightContext = useOptionalCrossChartHighlight();

  // Use theme colors if custom colors not provided
  const chartColors = colors || theme.colors.categorical;

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  // State for interactions
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [legendState, setLegendState] = useState<Record<string, boolean>>(
    Object.fromEntries(chartData.map((item: any) => [item[nameKey], true]))
  );

  // Calculate statistics
  const dataStats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const values = chartData.map((d: any) => Number(d[valueKey])).filter((v: number) => !isNaN(v));
    const total = values.reduce((sum: number, v: number) => sum + v, 0);
    const sortedValues = [...values].sort((a, b) => b - a);
    
    return { 
      total, 
      values,
      sortedValues,
    };
  }, [chartData, valueKey]);

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

  // Filter data based on legend state
  const displayData = chartData.filter((item: any) => legendState[item[nameKey]] !== false);

  // Calculate total for percentages
  const total = displayData.reduce((sum, item) => {
    const value = Number(item[valueKey as keyof ChartDataPoint]);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  // Enhanced label renderer with leader lines
  const renderLabel = (entry: any) => {
    if (!showDataLabels) return null;
    
    const value = Number(entry[valueKey as keyof typeof entry]);
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    
    // Only show label if percentage is significant (> 2%)
    if (parseFloat(percentage) < 2) return null;
    
    return `${percentage}%`;
  };

  // Custom active shape for hover effect
  const renderActiveShape = (props: any) => {
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))',
          }}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 14}
          fill={fill}
        />
      </g>
    );
  };

  // Enhanced tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length || !dataStats) return null;

    const entry = payload[0];
    const value = entry.value;
    const name = entry.name;
    const percentOfTotal = (value / dataStats.total) * 100;
    const rank = dataStats.sortedValues.indexOf(value) + 1;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px]">
        <div className="font-semibold text-gray-900 text-sm mb-2">{String(name)}</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Value:</span>
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
        </div>
      </div>
    );
  };

  // Handle slice click for cross-chart highlighting
  const handleSliceClick = (data: any, index: number) => {
    if (highlightContext && interactions?.tooltip?.enabled !== false) {
      highlightContext.highlightPoint(chartId, data);
      setActiveIndex(index);
    }
  };

  // Check if slice is highlighted
  const isSliceHighlighted = (dataPoint: any) => {
    if (!highlightContext) return false;
    return highlightContext.isPointHighlighted(chartId, dataPoint);
  };

  // Calculate radius based on mode
  const calculatedInnerRadius = donutMode ? (innerRadius || 60) : 0;
  const outerRadiusValue = 100;

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

      {/* Interactive Legend */}
      {legend && interactions?.legend?.interactive && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {chartData.map((item: any, index: number) => (
            <button
              key={item[nameKey]}
              onClick={() => setLegendState((prev) => ({ ...prev, [item[nameKey]]: !prev[item[nameKey]] }))}
              className="flex items-center gap-2 px-2 py-1 text-xs border rounded"
              style={{ opacity: legendState[item[nameKey]] === false ? 0.5 : 1 }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
              <span>{item[nameKey]}</span>
            </button>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <RechartsPieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            labelLine={showLeaderLines}
            label={renderLabel}
            outerRadius={outerRadiusValue}
            innerRadius={calculatedInnerRadius}
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={nameKey}
            startAngle={startAngle}
            endAngle={endAngle}

            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={handleSliceClick}
            animationDuration={theme.tokens.animations.duration}
            animationBegin={0}
          >
            {displayData.map((entry: any, index: number) => {
              const isHighlighted = isSliceHighlighted(entry);
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  opacity={isHighlighted ? 1 : 0.85}
                  stroke={isHighlighted ? '#fff' : 'none'}
                  strokeWidth={isHighlighted ? 3 : 0}
                  style={{
                    filter: isHighlighted ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {legend && !interactions?.legend?.interactive && (
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                paddingTop: `${theme.tokens.spacing.legendSpacing}px`,
                fontSize: `${theme.typography.legend.fontSize}px`,
              }}
              iconType="circle"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* Center label for donut mode */}
      {donutMode && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div
            style={{
              fontSize: `${theme.typography.title.fontSize + 4}px`,
              fontWeight: theme.typography.title.fontWeight,
              color: theme.typography.title.color,
            }}
          >
            {total.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: `${theme.typography.subtitle.fontSize}px`,
              color: theme.typography.subtitle.color,
            }}
          >
            Total
          </div>
        </div>
      )}
    </div>
  );
}
