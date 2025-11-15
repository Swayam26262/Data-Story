'use client';

import type { ChartData, ChartDataPoint } from '@/lib/models/Story';
import React from 'react';
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
} from 'recharts';

interface ScatterPlotProps {
  data: ChartData;
  title: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    legend?: boolean;
    trendLine?: boolean;
  };
}

export default function ScatterPlot({ data, title, config }: ScatterPlotProps) {
  const {
    xAxis = 'x',
    yAxis = 'y',
    colors = ['#3b82f6'],
    legend = true,
    trendLine = false,
  } = config;

  // Calculate trend line if needed
  const calculateTrendLine = () => {
    if (!trendLine || data.length < 2) return null;

    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    data.forEach((point: ChartDataPoint) => {
      const x = Number(point[xAxis]);
      const y = Number(point[yAxis]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((point) => ({
      [xAxis]: point[xAxis],
      trend: slope * point[xAxis] + intercept,
    }));
  };

  const trendLineData = calculateTrendLine();

  return (
    <div className="w-full h-full min-h-[250px] sm:min-h-[300px]">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <RechartsScatterChart
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey={xAxis}
            name={xAxis}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey={yAxis}
            name={yAxis}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
          />
          {legend && <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />}
          <Scatter
            name={yAxis}
            data={data}
            fill={colors[0]}
            shape="circle"
          />
          {trendLine && trendLineData && (
            <Line
              type="monotone"
              dataKey="trend"
              data={trendLineData}
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              name="Trend"
            />
          )}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
