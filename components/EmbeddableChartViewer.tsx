'use client';

import { useEffect, useState } from 'react';
import { LineChart, BarChart, ScatterPlot, PieChart } from './charts';
import type { ChartData } from '@/lib/models/Story';

interface EmbeddableChartViewerProps {
  chartId: string;
  storyId: string;
  theme?: 'light' | 'dark';
  interactive?: boolean;
  showTitle?: boolean;
  showLegend?: boolean;
}

interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'pie';
  title: string;
  data: ChartData;
  config: {
    xAxis?: string;
    yAxis?: string;
    nameKey?: string;
    valueKey?: string;
    colors?: string[];
    legend?: boolean;
    orientation?: 'horizontal' | 'vertical';
  };
}

export default function EmbeddableChartViewer({
  chartId,
  storyId,
  theme = 'light',
  interactive = true,
  showTitle = true,
  showLegend = true,
}: EmbeddableChartViewerProps) {
  const [chartData, setChartData] = useState<ChartConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(
          `/api/stories/${storyId}/charts/${chartId}`
        );

        if (!response.ok) {
          throw new Error('Failed to load chart data');
        }

        const data = await response.json();
        setChartData(data);
      } catch (err) {
        console.error('Error loading chart:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chart');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [chartId, storyId]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-full ${
          theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-black'
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div
        className={`flex items-center justify-center h-full ${
          theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-black'
        }`}
      >
        <div className="text-center p-8">
          <svg
            className="h-16 w-16 mx-auto mb-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-lg font-semibold mb-2">Failed to load chart</p>
          <p className="text-sm opacity-70">{error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const chartConfig = {
    ...chartData.config,
    legend: showLegend && chartData.config.legend,
  };

  const renderChart = () => {
    switch (chartData.type) {
      case 'line':
        return (
          <LineChart
            data={chartData.data}
            title={showTitle ? chartData.title : ''}
            config={chartConfig}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={chartData.data}
            title={showTitle ? chartData.title : ''}
            config={chartConfig}
          />
        );
      case 'scatter':
        return (
          <ScatterPlot
            data={chartData.data}
            title={showTitle ? chartData.title : ''}
            config={chartConfig}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={chartData.data}
            title={showTitle ? chartData.title : ''}
            config={chartConfig}
          />
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div
      className={`h-full w-full ${
        theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-white'
      } ${interactive ? '' : 'pointer-events-none'}`}
    >
      <div className="p-4 h-full">{renderChart()}</div>
      
      {/* Powered by badge */}
      <div className="text-center py-2 text-xs opacity-50">
        <a
          href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-100 transition-opacity"
        >
          Powered by DataStory
        </a>
      </div>
    </div>
  );
}
