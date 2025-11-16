/**
 * Skeleton loader for charts
 * Displays while chart is loading or being lazy-loaded
 */

import React from 'react';

export interface ChartSkeletonProps {
  /**
   * Chart type to determine skeleton shape
   */
  type?: 'line' | 'bar' | 'scatter' | 'pie' | 'area' | 'generic';

  /**
   * Height of the skeleton
   */
  height?: number | string;

  /**
   * Whether to show title skeleton
   */
  showTitle?: boolean;

  /**
   * Whether to show legend skeleton
   */
  showLegend?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

export function ChartSkeleton({
  type = 'generic',
  height = 300,
  showTitle = true,
  showLegend = true,
  className = '',
}: ChartSkeletonProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`animate-pulse ${className}`} style={{ height: heightStyle }}>
      {/* Title Skeleton */}
      {showTitle && (
        <div className="mb-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        </div>
      )}

      {/* Chart Area Skeleton */}
      <div className="relative bg-gray-800/50 rounded-lg p-4" style={{ height: '85%' }}>
        {type === 'line' && <LineChartSkeleton />}
        {type === 'bar' && <BarChartSkeleton />}
        {type === 'scatter' && <ScatterChartSkeleton />}
        {type === 'pie' && <PieChartSkeleton />}
        {type === 'area' && <AreaChartSkeleton />}
        {type === 'generic' && <GenericChartSkeleton />}
      </div>

      {/* Legend Skeleton */}
      {showLegend && (
        <div className="mt-4 flex gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-16"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      )}
    </div>
  );
}

function LineChartSkeleton() {
  return (
    <div className="w-full h-full flex items-end justify-between gap-2">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <div
            className="bg-gray-700 rounded-t"
            style={{
              height: `${Math.random() * 60 + 20}%`,
            }}
          ></div>
        </div>
      ))}
      {/* Line overlay */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <polyline
          points="0,80 10,60 20,70 30,40 40,50 50,30 60,45 70,25 80,35 90,20 100,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-700"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function BarChartSkeleton() {
  return (
    <div className="w-full h-full flex items-end justify-between gap-2">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-700 rounded-t"
          style={{
            height: `${Math.random() * 60 + 20}%`,
          }}
        ></div>
      ))}
    </div>
  );
}

function ScatterChartSkeleton() {
  return (
    <div className="w-full h-full relative">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gray-700 rounded-full"
          style={{
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 90 + 5}%`,
          }}
        ></div>
      ))}
    </div>
  );
}

function PieChartSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="20"
            className="text-gray-700"
            strokeDasharray="60 40"
            transform="rotate(-90 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="20"
            className="text-gray-600"
            strokeDasharray="40 60"
            strokeDashoffset="-60"
            transform="rotate(-90 50 50)"
          />
        </svg>
      </div>
    </div>
  );
}

function AreaChartSkeleton() {
  return (
    <div className="w-full h-full relative">
      <svg className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="skeleton-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon
          points="0,80 10,60 20,70 30,40 40,50 50,30 60,45 70,25 80,35 90,20 100,30 100,100 0,100"
          fill="url(#skeleton-gradient)"
          className="text-gray-700"
        />
        <polyline
          points="0,80 10,60 20,70 30,40 40,50 50,30 60,45 70,25 80,35 90,20 100,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-700"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function GenericChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex-1 bg-gray-700/30 rounded"></div>
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-1 h-8 bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export default ChartSkeleton;
