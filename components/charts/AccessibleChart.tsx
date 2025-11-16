/**
 * Accessible Chart Wrapper Component
 * Provides comprehensive accessibility features for all chart types
 */

'use client';

import { ReactNode } from 'react';
import {
  generateChartDescription,
  generateChartSummary,
  generateSkipLinkId,
  srOnlyClass,
} from '@/lib/utils/accessibility';
import type { ChartData } from '@/lib/models/Story';

interface AccessibleChartProps {
  children: ReactNode;
  chartId: string;
  chartType: string;
  title: string;
  data: ChartData;
  config: any;
  statistics?: any;
  className?: string;
}

export function AccessibleChart({
  children,
  chartId,
  chartType,
  title,
  data,
  config,
  statistics,
  className = '',
}: AccessibleChartProps) {
  const description = generateChartDescription(chartType, data, config);
  const summary = generateChartSummary(chartType, data, config, statistics);
  const skipLinkId = generateSkipLinkId(chartId);

  return (
    <div className={`accessible-chart-container ${className}`}>
      {/* Skip Link */}
      <a
        href={`#${skipLinkId}`}
        className={`${srOnlyClass} focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-2 focus:bg-blue-600 focus:text-white focus:rounded`}
      >
        Skip to chart content
      </a>

      {/* Chart Container with ARIA attributes */}
      <div
        id={chartId}
        role="img"
        aria-label={`${title}. ${description}`}
        className="relative"
      >
        {/* Screen Reader Only Description */}
        <div className={srOnlyClass}>
          <h3>{title}</h3>
          <p>{description}</p>
          <p>{summary}</p>
        </div>

        {/* Visual Chart */}
        <div aria-hidden="true">
          {children}
        </div>

        {/* Data Table for Screen Readers */}
        <DataTable
          data={data}
          config={config}
          chartType={chartType}
          chartId={chartId}
        />
      </div>

      {/* Skip Link Target */}
      <div id={skipLinkId} tabIndex={-1} className={srOnlyClass}>
        End of {title}
      </div>
    </div>
  );
}

/**
 * Data Table for Screen Readers
 * Provides tabular representation of chart data
 */
function DataTable({
  data,
  config,
  chartType,
  chartId,
}: {
  data: ChartData;
  config: any;
  chartType: string;
  chartId: string;
}) {
  const dataArray = Array.isArray(data) ? data : [];
  
  if (dataArray.length === 0) {
    return null;
  }

  const { xAxis = 'x', yAxis = 'y', nameKey = 'name', valueKey = 'value' } = config;

  // Determine columns based on chart type
  const isPieChart = chartType === 'pie' || chartType === 'piechart';
  const columns = isPieChart
    ? [nameKey, valueKey]
    : [xAxis, yAxis];

  return (
    <div className={srOnlyClass}>
      <h4>Data Table for {chartId}</h4>
      <table>
        <caption>Tabular representation of chart data</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col">
                {String(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataArray.slice(0, 100).map((row: any, index: number) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col}>{String(row[col] ?? '')}</td>
              ))}
            </tr>
          ))}
          {dataArray.length > 100 && (
            <tr>
              <td colSpan={columns.length}>
                ... and {dataArray.length - 100} more rows
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
