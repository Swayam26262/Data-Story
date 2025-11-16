'use client';

/**
 * Enhanced Tooltip Manager
 * Provides rich tooltips with multiple metrics, statistics, and intelligent positioning
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { TooltipData, Point } from '@/types';

/**
 * Tooltip position relative to cursor
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/**
 * Tooltip manager props
 */
export interface TooltipManagerProps {
  children: (showTooltip: ShowTooltipFn, hideTooltip: () => void) => React.ReactNode;
  position?: TooltipPosition;
  offset?: number;
  delay?: number;
  className?: string;
}

/**
 * Function to show tooltip
 */
export type ShowTooltipFn = (data: TooltipData, point: Point) => void;

/**
 * Tooltip Manager Component
 * Manages tooltip state and positioning
 */
export function TooltipManager({
  children,
  position = 'auto',
  offset = 10,
  delay = 0,
  className = '',
}: TooltipManagerProps) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<Point>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate intelligent tooltip position to avoid viewport edges
  const calculatePosition = useCallback((point: Point, tooltipElement: HTMLElement | null): Point => {
    if (!tooltipElement) return point;

    const tooltipRect = tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = point.x + offset;
    let y = point.y + offset;

    // Auto positioning logic
    if (position === 'auto') {
      // Check if tooltip would overflow right edge
      if (x + tooltipRect.width > viewportWidth) {
        x = point.x - tooltipRect.width - offset;
      }

      // Check if tooltip would overflow bottom edge
      if (y + tooltipRect.height > viewportHeight) {
        y = point.y - tooltipRect.height - offset;
      }

      // Check if tooltip would overflow left edge
      if (x < 0) {
        x = offset;
      }

      // Check if tooltip would overflow top edge
      if (y < 0) {
        y = offset;
      }
    } else {
      // Manual positioning
      switch (position) {
        case 'top':
          x = point.x - tooltipRect.width / 2;
          y = point.y - tooltipRect.height - offset;
          break;
        case 'bottom':
          x = point.x - tooltipRect.width / 2;
          y = point.y + offset;
          break;
        case 'left':
          x = point.x - tooltipRect.width - offset;
          y = point.y - tooltipRect.height / 2;
          break;
        case 'right':
          x = point.x + offset;
          y = point.y - tooltipRect.height / 2;
          break;
      }
    }

    return { x, y };
  }, [position, offset]);

  // Show tooltip with delay
  const showTooltip = useCallback((data: TooltipData, point: Point) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setTooltipData(data);
        setTooltipPosition(point);
        setIsVisible(true);
      }, delay);
    } else {
      setTooltipData(data);
      setTooltipPosition(point);
      setIsVisible(true);
    }
  }, [delay]);

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    // Clear any pending show timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  // Update position when tooltip becomes visible or position changes
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const newPosition = calculatePosition(tooltipPosition, tooltipRef.current);
      setTooltipPosition(newPosition);
    }
  }, [isVisible, calculatePosition, tooltipPosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {children(showTooltip, hideTooltip)}
      
      {isVisible && tooltipData && (
        <RichTooltip
          ref={tooltipRef}
          data={tooltipData}
          position={tooltipPosition}
          className={className}
        />
      )}
    </>
  );
}

/**
 * Rich Tooltip Component
 * Displays detailed tooltip with metrics, statistics, and custom content
 */
interface RichTooltipProps {
  data: TooltipData;
  position: Point;
  className?: string;
}

const RichTooltip = React.forwardRef<HTMLDivElement, RichTooltipProps>(
  ({ data, position, className }, ref) => {
    const { title, metrics, statistics, customContent } = data;

    return (
      <div
        ref={ref}
        className={`fixed z-50 pointer-events-none transition-opacity duration-300 ease-in-out ${className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[320px]">
          {/* Title */}
          {title && (
            <div className="font-semibold text-gray-900 text-sm mb-2 pb-2 border-b border-gray-100">
              {title}
            </div>
          )}

          {/* Metrics */}
          {metrics && metrics.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {metric.color && (
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: metric.color }}
                      />
                    )}
                    <span className="text-gray-600">{metric.label}:</span>
                  </div>
                  <span className="font-medium text-gray-900 ml-2">
                    {typeof metric.value === 'number'
                      ? metric.value.toLocaleString()
                      : metric.value}
                    {metric.unit && <span className="text-gray-500 ml-0.5">{metric.unit}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Statistics */}
          {statistics && (
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              {/* Percentage of Total */}
              {statistics.percentOfTotal !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">% of Total:</span>
                  <span className="font-medium text-gray-900">
                    {statistics.percentOfTotal.toFixed(1)}%
                  </span>
                </div>
              )}

              {/* Rank */}
              {statistics.rank !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Rank:</span>
                  <span className="font-medium text-gray-900">
                    #{statistics.rank}
                  </span>
                </div>
              )}

              {/* Comparison to Average */}
              {statistics.comparisonToAverage !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">vs. Average:</span>
                  <div className="flex items-center gap-1">
                    {statistics.comparisonToAverage > 0 ? (
                      <>
                        <svg
                          className="w-3 h-3 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                        <span className="font-medium text-green-600">
                          +{Math.abs(statistics.comparisonToAverage).toFixed(1)}%
                        </span>
                      </>
                    ) : statistics.comparisonToAverage < 0 ? (
                      <>
                        <svg
                          className="w-3 h-3 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                        <span className="font-medium text-red-600">
                          {statistics.comparisonToAverage.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className="font-medium text-gray-600">0%</span>
                    )}
                  </div>
                </div>
              )}

              {/* Trend Indicator */}
              {statistics.trend && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Trend:</span>
                  <div className="flex items-center gap-1">
                    {statistics.trend === 'up' && (
                      <>
                        <svg
                          className="w-3 h-3 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                        <span className="font-medium text-green-600">Rising</span>
                      </>
                    )}
                    {statistics.trend === 'down' && (
                      <>
                        <svg
                          className="w-3 h-3 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                          />
                        </svg>
                        <span className="font-medium text-red-600">Falling</span>
                      </>
                    )}
                    {statistics.trend === 'stable' && (
                      <>
                        <svg
                          className="w-3 h-3 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h14"
                          />
                        </svg>
                        <span className="font-medium text-gray-600">Stable</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Content */}
          {customContent && (
            <div className="pt-2 border-t border-gray-100 text-xs">
              {customContent}
            </div>
          )}
        </div>
      </div>
    );
  }
);

RichTooltip.displayName = 'RichTooltip';

/**
 * Hook for using tooltip functionality
 */
export function useTooltip() {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<Point>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = useCallback((data: TooltipData, point: Point) => {
    setTooltipData(data);
    setTooltipPosition(point);
    setIsVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    setIsVisible(false);
  }, []);

  const updatePosition = useCallback((point: Point) => {
    setTooltipPosition(point);
  }, []);

  return {
    tooltipData,
    tooltipPosition,
    isVisible,
    showTooltip,
    hideTooltip,
    updatePosition,
  };
}
