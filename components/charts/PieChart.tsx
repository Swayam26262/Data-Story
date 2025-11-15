'use client';

import type { ChartData, ChartDataPoint } from '@/lib/models/Story';
import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartProps {
  data: ChartData;
  title: string;
  config: {
    nameKey?: keyof ChartDataPoint;
    valueKey?: keyof ChartDataPoint;
    colors?: string[];
    legend?: boolean;
  };
}

const DEFAULT_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
];

export default function PieChart({ data, title, config }: PieChartProps) {
  const {
    nameKey = 'name',
    valueKey = 'value',
    colors = DEFAULT_COLORS,
    legend = true,
  } = config;

  const renderLabel = (entry: ChartDataPoint & Record<string, number>) => {
    const total = data.reduce((sum, item) => {
      const value = Number(item[valueKey as keyof ChartDataPoint]);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

    const value = Number(entry[valueKey]);
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    return `${percentage}%`;
  };

  return (
    <div className="w-full h-full min-h-[250px] sm:min-h-[300px]">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
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
          {legend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
