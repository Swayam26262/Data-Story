'use client';

import type { ChartData } from '@/lib/models/Story';
import type { InteractionConfig } from '@/types';
import { useMemo } from 'react';
import { useChartThemeOptional } from '@/lib/theme';

interface BulletChartProps {
  data: ChartData;
  title: string;
  config: {
    category?: string; // Category label field
    actual?: string; // Actual value field
    target?: string; // Target value field
    ranges?: {
      poor: number;
      satisfactory: number;
      good: number;
    };
    orientation?: 'horizontal' | 'vertical';
    colors?: {
      poor?: string;
      satisfactory?: string;
      good?: string;
      actual?: string;
      target?: string;
    };
    showLabels?: boolean;
  };
  interactions?: InteractionConfig;
  chartId?: string;
}

export default function BulletChart({
  data,
  title,
  config,
  interactions,
  chartId = 'bullet-chart',
}: BulletChartProps) {
  const { theme, getSemanticColor } = useChartThemeOptional();
  const {
    category = 'category',
    actual = 'actual',
    target = 'target',
    ranges,
    orientation = 'horizontal',
    colors = {},
    showLabels = true,
  } = config;

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  const isHorizontal = orientation === 'horizontal';

  // Default colors
  const defaultColors = {
    poor: colors.poor || '#ef4444',
    satisfactory: colors.satisfactory || '#fbbf24',
    good: colors.good || '#10b981',
    actual: colors.actual || theme.colors.categorical[0],
    target: colors.target || '#1f2937',
  };

  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    
    let max = 0;
    chartData.forEach((item: any) => {
      const actualVal = Number(item[actual]) || 0;
      const targetVal = Number(item[target]) || 0;
      max = Math.max(max, actualVal, targetVal);
    });

    // If ranges provided, include them in max calculation
    if (ranges) {
      max = Math.max(max, ranges.good);
    }

    return max * 1.1; // Add 10% padding
  }, [chartData, actual, target, ranges]);

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

  const getPercentage = (value: number) => (value / maxValue) * 100;

  return (
    <div className="w-full">
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

      <div className="space-y-6">
        {chartData.map((item: any, index: number) => {
          const categoryLabel = String(item[category] || `Item ${index + 1}`);
          const actualValue = Number(item[actual]) || 0;
          const targetValue = Number(item[target]) || 0;

          const actualPercent = getPercentage(actualValue);
          const targetPercent = getPercentage(targetValue);

          // Calculate performance ranges
          const poorPercent = ranges ? getPercentage(ranges.poor) : 33.33;
          const satisfactoryPercent = ranges ? getPercentage(ranges.satisfactory) : 66.67;
          const goodPercent = ranges ? getPercentage(ranges.good) : 100;

          return (
            <div key={`bullet-${index}`} className="space-y-1">
              {/* Category Label */}
              {showLabels && (
                <div
                  className="font-medium"
                  style={{
                    fontSize: `${theme.typography.axisLabel.fontSize}px`,
                    color: theme.typography.axisLabel.color,
                  }}
                >
                  {categoryLabel}
                </div>
              )}

              {/* Bullet Chart */}
              <div className={`relative ${isHorizontal ? 'h-12' : 'w-12 h-64'}`}>
                {/* Performance Range Backgrounds */}
                <div
                  className={`absolute ${
                    isHorizontal ? 'inset-y-0 left-0' : 'inset-x-0 bottom-0'
                  }`}
                  style={{
                    [isHorizontal ? 'width' : 'height']: `${poorPercent}%`,
                    backgroundColor: defaultColors.poor,
                    opacity: 0.3,
                  }}
                />
                <div
                  className={`absolute ${
                    isHorizontal ? 'inset-y-0 left-0' : 'inset-x-0 bottom-0'
                  }`}
                  style={{
                    [isHorizontal ? 'width' : 'height']: `${satisfactoryPercent}%`,
                    backgroundColor: defaultColors.satisfactory,
                    opacity: 0.3,
                  }}
                />
                <div
                  className={`absolute ${
                    isHorizontal ? 'inset-y-0 left-0' : 'inset-x-0 bottom-0'
                  }`}
                  style={{
                    [isHorizontal ? 'width' : 'height']: `${goodPercent}%`,
                    backgroundColor: defaultColors.good,
                    opacity: 0.3,
                  }}
                />

                {/* Actual Value Bar */}
                <div
                  className={`absolute ${
                    isHorizontal
                      ? 'top-1/2 -translate-y-1/2 left-0 h-6'
                      : 'left-1/2 -translate-x-1/2 bottom-0 w-6'
                  }`}
                  style={{
                    [isHorizontal ? 'width' : 'height']: `${actualPercent}%`,
                    backgroundColor: defaultColors.actual,
                    borderRadius: '4px',
                  }}
                />

                {/* Target Marker */}
                <div
                  className={`absolute ${
                    isHorizontal
                      ? 'top-0 bottom-0 w-1'
                      : 'left-0 right-0 h-1'
                  }`}
                  style={{
                    [isHorizontal ? 'left' : 'bottom']: `${targetPercent}%`,
                    backgroundColor: defaultColors.target,
                  }}
                >
                  {/* Target marker line extension */}
                  <div
                    className={`absolute ${
                      isHorizontal
                        ? 'top-0 bottom-0 w-0.5 -left-0.5'
                        : 'left-0 right-0 h-0.5 -bottom-0.5'
                    }`}
                    style={{
                      backgroundColor: defaultColors.target,
                    }}
                  />
                </div>
              </div>

              {/* Value Labels */}
              {showLabels && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    Actual: <span className="font-semibold">{actualValue.toLocaleString()}</span>
                  </span>
                  <span>
                    Target: <span className="font-semibold">{targetValue.toLocaleString()}</span>
                  </span>
                  <span
                    className={`font-semibold ${
                      actualValue >= targetValue
                        ? 'text-green-600'
                        : actualValue >= targetValue * 0.9
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {((actualValue / targetValue) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {ranges && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: defaultColors.poor, opacity: 0.3 }}
            />
            <span>Poor (&lt; {ranges.poor})</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: defaultColors.satisfactory, opacity: 0.3 }}
            />
            <span>Satisfactory ({ranges.poor}-{ranges.satisfactory})</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: defaultColors.good, opacity: 0.3 }}
            />
            <span>Good (&gt; {ranges.satisfactory})</span>
          </div>
        </div>
      )}
    </div>
  );
}
