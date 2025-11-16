/**
 * Virtualized list for rendering many charts efficiently
 * Only renders charts that are visible in the viewport
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChartSkeleton } from './ChartSkeleton';

export interface VirtualizedChartListProps {
  /**
   * Array of chart components to render
   */
  charts: React.ReactNode[];

  /**
   * Height of each chart item
   */
  itemHeight: number;

  /**
   * Gap between chart items
   */
  gap?: number;

  /**
   * Number of items to render outside viewport (buffer)
   */
  overscan?: number;

  /**
   * Container height (if not provided, uses viewport height)
   */
  containerHeight?: number;

  /**
   * Custom className for container
   */
  className?: string;

  /**
   * Custom className for each item
   */
  itemClassName?: string;
}

export function VirtualizedChartList({
  charts,
  itemHeight,
  gap = 16,
  overscan = 2,
  containerHeight,
  className = '',
  itemClassName = '',
}: VirtualizedChartListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(
    containerHeight || (typeof window !== 'undefined' ? window.innerHeight : 800)
  );

  // Calculate visible range
  const totalHeight = charts.length * (itemHeight + gap) - gap;
  const startIndex = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
  const endIndex = Math.min(
    charts.length - 1,
    Math.ceil((scrollTop + viewportHeight) / (itemHeight + gap)) + overscan
  );

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Update viewport height on resize
  useEffect(() => {
    if (containerHeight) return;

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerHeight]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Render visible items
  const visibleCharts = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const offsetTop = i * (itemHeight + gap);
    visibleCharts.push(
      <div
        key={i}
        className={itemClassName}
        style={{
          position: 'absolute',
          top: offsetTop,
          left: 0,
          right: 0,
          height: itemHeight,
        }}
      >
        {charts[i]}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{
        height: containerHeight || '100vh',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {visibleCharts}
      </div>
    </div>
  );
}

/**
 * Grid layout for virtualized charts
 */
export interface VirtualizedChartGridProps {
  /**
   * Array of chart components to render
   */
  charts: React.ReactNode[];

  /**
   * Number of columns
   */
  columns: number;

  /**
   * Height of each chart item
   */
  itemHeight: number;

  /**
   * Gap between items
   */
  gap?: number;

  /**
   * Number of rows to render outside viewport (buffer)
   */
  overscan?: number;

  /**
   * Container height (if not provided, uses viewport height)
   */
  containerHeight?: number;

  /**
   * Custom className for container
   */
  className?: string;

  /**
   * Custom className for each item
   */
  itemClassName?: string;
}

export function VirtualizedChartGrid({
  charts,
  columns,
  itemHeight,
  gap = 16,
  overscan = 1,
  containerHeight,
  className = '',
  itemClassName = '',
}: VirtualizedChartGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(
    containerHeight || (typeof window !== 'undefined' ? window.innerHeight : 800)
  );

  // Calculate grid dimensions
  const totalRows = Math.ceil(charts.length / columns);
  const totalHeight = totalRows * (itemHeight + gap) - gap;

  // Calculate visible range
  const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
  const endRow = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + viewportHeight) / (itemHeight + gap)) + overscan
  );

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Update viewport height on resize
  useEffect(() => {
    if (containerHeight) return;

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerHeight]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Render visible items
  const visibleCharts = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index >= charts.length) break;

      const offsetTop = row * (itemHeight + gap);
      const offsetLeft = col * (100 / columns);

      visibleCharts.push(
        <div
          key={index}
          className={itemClassName}
          style={{
            position: 'absolute',
            top: offsetTop,
            left: `${offsetLeft}%`,
            width: `calc(${100 / columns}% - ${gap * (columns - 1) / columns}px)`,
            height: itemHeight,
          }}
        >
          {charts[index]}
        </div>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{
        height: containerHeight || '100vh',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {visibleCharts}
      </div>
    </div>
  );
}

export default VirtualizedChartList;
