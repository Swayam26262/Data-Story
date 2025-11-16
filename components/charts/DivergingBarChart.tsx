'use client';

import type { ChartData } from '@/lib/models/Story';
import type { InteractionConfig } from '@/types';
import { useMemo, useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from 'recharts';
import { useChartThemeOptional } from '@/lib/theme';

interface DivergingBarChartProps {
  data: ChartData;
  title: string;
  config: {
    category?: string; // Category field
    value?: string; // Value field
    baseline?: number; // Baseline value (default 0)
    colors?: {
      positive?: string;
      negative?: string;
    };
    sortBy?: 'value' | 'category' | 'none';
    sortOrder?: 'asc' | 'desc';
    showPercentageChange?: boolean;
    showDataLabels?: boolean;
    orientation?: 'horizontal' | 'vertical';
  };
  interactions?: InteractionConfig;
  chartId?: string;
}

export default function DivergingBarChart({
  data,
  title,
  config,
  interactions,
  chartId = 'diverging-bar-chart',
}: DivergingBarChartProps) {
  const { theme, getSemanticColor } = useChartThemeOptional();
  const {
    category = 'category',
    value = 'value',
    baseline = 0,
    colors = {},
    sortBy = 'none',
    sortOrder = 'desc',
    showPercentageChange = true,
    showDataLabels = true,
    orientation = 'horizontal',
  } = config;

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  const isHorizontal = orientation === 'horizontal';

  // Default colors
  const positiveColor = colors.positive || getSemanticColor('positive');
  const negativeColor = colors.negative || getSemanticColor('negative');

  // Sort data if requested
  const sortedData = useMemo(() => {
    if (chartData.length === 0) return [];

    const dataCopy = [...chartData];

    if (sortBy === 'value') {
      dataCopy.sort((a: any, b: any) => {
        const aVal = Number(a[value]) || 0;
        const bVal = Number(b[value]) || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    } else if (sortBy === 'category') {
      dataCopy.sort((a: any, b: any) => {
        const aStr = String(a[category] || '');
        const bStr = String(b[category] || '');
        return sortOrder === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return dataCopy;
  }, [chartData, sortBy, sortOrder, value, category]);

  // Calculate percentage changes
  const dataWithPercentages = useMemo(() => {
    return sortedData.map((item: any) => {
      const val = Number(item[value]) || 0;
      const percentChange = baseline !== 0 ? ((val - baseline) / Math.abs(baseline)) * 100 : 0;
      return {
        ...item,
        _percentChange: percentChange,
        _isPositive: val >= baseline,
      };
    });
  }, [sortedData, value, baseline]);

  // If no valid data, show error message
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full min-h-[250px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No data available for this chart</p>
        </div>
      </div>
    );
  }

  // Enhanced tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const val = Number(data[value]) || 0;
    const percentChange = data._percentChange;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px]">
        <div className="font-semibold text-gray-900 text-sm mb-2">
          {String(data[category])}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Value:</span>
            <span className="font-medium text-gray-900">{val.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Baseline:</span>
            <span className="font-medium text-gray-900">{baseline.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Difference:</span>
            <span
              className={`font-medium ${
                val >= baseline ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {val >= baseline ? '+' : ''}
              {(val - baseline).toLocaleString()}
            </span>
          </div>
          {showPercentageChange && baseline !== 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Change:</span>
              <span
                className={`font-medium ${
                  percentChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {percentChange >= 0 ? '+' : ''}
                {percentChange.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom label renderer for percentage changes
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value: labelValue } = props;
    const data = props.payload || props;
    const percentChange = data._percentChange;

    if (!showPercentageChange || baseline === 0) {
      return null;
    }

    const labelX = isHorizontal
      ? labelValue >= baseline
        ? x + width + 5
        : x - 5
      : x + width / 2;
    const labelY = isHorizontal ? y + height / 2 : labelValue >= baseline ? y - 5 : y + height + 15;

    return (
      <text
        x={labelX}
        y={labelY}
        fill={theme.typography.dataLabel.color}
        fontSize={theme.typography.dataLabel.fontSize}
        fontWeight={theme.typography.dataLabel.fontWeight}
        textAnchor={isHorizontal ? (labelValue >= baseline ? 'start' : 'end') : 'middle'}
        dominantBaseline={isHorizontal ? 'middle' : 'auto'}
      >
        {percentChange >= 0 ? '+' : ''}
        {percentChange.toFixed(0)}%
      </text>
    );
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

      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <RechartsBarChart
          data={dataWithPercentages}
          layout={isHorizontal ? 'horizontal' : 'vertical'}
          margin={{
            top: theme.tokens.spacing.chartPadding.top + 10,
            right: theme.tokens.spacing.chartPadding.right + 40,
            bottom: theme.tokens.spacing.chartPadding.bottom + (isHorizontal ? 0 : 40),
            left: theme.tokens.spacing.chartPadding.left + (isHorizontal ? 60 : 0),
          }}
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
                dataKey={category}
                stroke={theme.tokens.borders.axisLineColor}
                style={{
                  fontSize: `${theme.typography.axisLabel.fontSize}px`,
                  fontWeight: theme.typography.axisLabel.fontWeight,
                }}
                tick={{
                  fill: theme.typography.axisLabel.color,
                  fontSize: theme.typography.axisLabel.fontSize,
                }}
                width={120}
              />
            </>
          ) : (
            <>
              <XAxis
                type="category"
                dataKey={category}
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />

          {/* Baseline Reference Line */}
          <ReferenceLine
            y={isHorizontal ? undefined : baseline}
            x={isHorizontal ? baseline : undefined}
            stroke={theme.tokens.borders.axisLineColor}
            strokeWidth={2}
            label={{
              value: 'Baseline',
              position: isHorizontal ? 'top' : 'insideTopRight',
              fill: theme.typography.axisLabel.color,
              fontSize: theme.typography.axisLabel.fontSize,
            }}
          />

          {/* Diverging Bars */}
          <Bar
            dataKey={value}
            radius={[4, 4, 4, 4]}
            animationDuration={theme.tokens.animations.duration}
          >
            {dataWithPercentages.map((entry: any, index: number) => {
              const val = Number(entry[value]) || 0;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={val >= baseline ? positiveColor : negativeColor}
                />
              );
            })}
            {showDataLabels && showPercentageChange && (
              <LabelList content={renderCustomLabel} />
            )}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
