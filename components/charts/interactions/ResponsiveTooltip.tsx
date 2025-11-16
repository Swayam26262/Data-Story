/**
 * Responsive Tooltip Component
 * Provides simplified tooltips for mobile and rich tooltips for desktop
 */

'use client';

import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';

export interface TooltipMetric {
  label: string;
  value: string | number;
  color?: string;
}

export interface ResponsiveTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  metrics?: TooltipMetric[];
  statistics?: {
    percentOfTotal?: number;
    rank?: number;
    comparisonToAverage?: number;
  };
  customContent?: React.ReactNode;
}

/**
 * Responsive Tooltip Component
 * Automatically simplifies content on mobile devices
 */
export function ResponsiveTooltip({
  active,
  payload,
  label,
  metrics,
  statistics,
  customContent,
}: ResponsiveTooltipProps) {
  const { interactions } = useResponsiveChart();

  if (!active || !payload || !payload.length) return null;

  const tooltipMetrics = metrics || payload.map((p) => ({
    label: p.name || p.dataKey,
    value: p.value,
    color: p.color || p.fill || p.stroke,
  }));

  // Simplified mobile tooltip
  if (interactions.tooltipSimplified) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[140px] max-w-[200px]">
        {label && (
          <div className="font-semibold text-gray-900 text-xs mb-1 truncate">{String(label)}</div>
        )}
        <div className="space-y-0.5">
          {tooltipMetrics.slice(0, 2).map((metric, idx) => (
            <div key={idx} className="flex justify-between text-xs gap-2">
              <span className="text-gray-600 truncate">{metric.label}:</span>
              <span className="font-medium text-gray-900 flex-shrink-0">
                {typeof metric.value === 'number'
                  ? metric.value.toLocaleString(undefined, { maximumFractionDigits: 1 })
                  : metric.value}
              </span>
            </div>
          ))}
          {statistics?.percentOfTotal !== undefined && (
            <div className="flex justify-between text-xs gap-2 pt-0.5 border-t border-gray-100">
              <span className="text-gray-600">% Total:</span>
              <span className="font-medium text-gray-900">
                {statistics.percentOfTotal.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full desktop tooltip
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px] max-w-[280px]">
      {label && (
        <div className="font-semibold text-gray-900 text-sm mb-2">{String(label)}</div>
      )}
      {customContent ? (
        customContent
      ) : (
        <div className="space-y-1">
          {tooltipMetrics.map((metric, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <span className="text-gray-600 flex items-center gap-1">
                {metric.color && (
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: metric.color }}
                  />
                )}
                {metric.label}:
              </span>
              <span className="font-medium text-gray-900">
                {typeof metric.value === 'number'
                  ? metric.value.toLocaleString()
                  : metric.value}
              </span>
            </div>
          ))}
          {statistics && (
            <>
              {statistics.percentOfTotal !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">% of Total:</span>
                  <span className="font-medium text-gray-900">
                    {statistics.percentOfTotal.toFixed(1)}%
                  </span>
                </div>
              )}
              {statistics.rank !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Rank:</span>
                  <span className="font-medium text-gray-900">#{statistics.rank}</span>
                </div>
              )}
              {statistics.comparisonToAverage !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">vs. Average:</span>
                  <span
                    className={`font-medium ${
                      statistics.comparisonToAverage > 0
                        ? 'text-green-600'
                        : statistics.comparisonToAverage < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {statistics.comparisonToAverage > 0 ? '+' : ''}
                    {statistics.comparisonToAverage.toFixed(1)}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ResponsiveTooltip;
