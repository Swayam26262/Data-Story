'use client';

import type { ChartData } from '@/lib/models/Story';
import type { InteractionConfig } from '@/types';
import { useMemo } from 'react';
import { useChartThemeOptional } from '@/lib/theme';
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';

interface SmallMultiplesProps {
  data: ChartData;
  title: string;
  config: {
    facetBy: string; // Categorical variable to facet by
    columns?: number; // Number of columns in grid layout
    chartType: 'line' | 'bar' | 'area' | 'scatter';
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    syncAxes?: boolean; // Synchronize axes across all charts
    showIndividualTitles?: boolean;
  };
  interactions?: InteractionConfig;
  chartId?: string;
  ChartComponent: React.ComponentType<any>; // The chart component to render for each facet
}

export default function SmallMultiples({
  data,
  title,
  config,
  interactions,
  chartId = 'small-multiples',
  ChartComponent,
}: SmallMultiplesProps) {
  const { theme } = useChartThemeOptional();
  const responsive = useResponsiveChart();
  const {
    facetBy,
    columns = 2,
    xAxis = 'x',
    yAxis = 'y',
    colors,
    syncAxes = true,
    showIndividualTitles = true,
  } = config;

  // Defensive check: ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  // Group data by facet variable
  const facetedData = useMemo(() => {
    if (chartData.length === 0) return [];

    const groups = new Map<string, any[]>();
    
    chartData.forEach((item: any) => {
      const facetValue = String(item[facetBy] || 'Unknown');
      if (!groups.has(facetValue)) {
        groups.set(facetValue, []);
      }
      groups.get(facetValue)!.push(item);
    });

    return Array.from(groups.entries()).map(([facetValue, items]) => ({
      facetValue,
      data: items,
    }));
  }, [chartData, facetBy]);

  // Calculate synchronized axis ranges if enabled
  const axisRanges = useMemo(() => {
    if (!syncAxes || facetedData.length === 0) return null;

    let minY = Infinity;
    let maxY = -Infinity;

    facetedData.forEach(({ data: items }) => {
      items.forEach((item: any) => {
        const value = Number(item[yAxis]);
        if (!isNaN(value)) {
          minY = Math.min(minY, value);
          maxY = Math.max(maxY, value);
        }
      });
    });

    return { minY, maxY };
  }, [facetedData, yAxis, syncAxes]);

  // If no valid data, show error message
  if (chartData.length === 0 || facetedData.length === 0) {
    return (
      <div className="w-full h-full min-h-[250px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No data available for this chart</p>
        </div>
      </div>
    );
  }

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

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(columns, responsive.layout.columns)}, minmax(0, 1fr))`,
        }}
      >
        {facetedData.map(({ facetValue, data: facetData }, index) => (
          <div
            key={`facet-${index}-${facetValue}`}
            className="border border-gray-200 rounded-lg p-3 bg-white"
          >
            {showIndividualTitles && (
              <h4
                className="text-center mb-2"
                style={{
                  fontSize: `${theme.typography.subtitle?.fontSize || 14}px`,
                  fontWeight: theme.typography.subtitle?.fontWeight || 600,
                  color: theme.typography.subtitle?.color || theme.typography.title.color,
                }}
              >
                {facetValue}
              </h4>
            )}
            <div className="h-[200px]">
              <ChartComponent
                data={facetData}
                title=""
                config={{
                  xAxis,
                  yAxis,
                  colors,
                  legend: false,
                  ...(axisRanges && {
                    yAxisDomain: [axisRanges.minY, axisRanges.maxY],
                  }),
                }}
                interactions={{
                  ...interactions,
                  zoom: false, // Disable zoom in small multiples
                  pan: false, // Disable pan in small multiples
                }}
                chartId={`${chartId}-${facetValue}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend for facet variable */}
      <div className="mt-4 text-center">
        <span
          className="text-xs text-gray-600"
          style={{
            fontSize: `${theme.typography.axisLabel.fontSize}px`,
          }}
        >
          Faceted by: <span className="font-semibold">{facetBy}</span>
        </span>
      </div>
    </div>
  );
}
