'use client';

import type { ChartData } from '@/lib/models/Story';
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
  data: ChartData;
  title: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
    legend?: boolean;
  };
}

export default function LineChart({ data, title, config }: LineChartProps) {
  const { xAxis = 'x', yAxis = 'y', colors = ['#3b82f6'], legend = true } = config;

  return (
    <div className="w-full h-full min-h-[250px] sm:min-h-[300px]">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xAxis}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
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
          <Line
            type="monotone"
            dataKey={yAxis}
            stroke={colors[0]}
            strokeWidth={2}
            dot={{ fill: colors[0], r: 3 }}
            activeDot={{ r: 5 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
