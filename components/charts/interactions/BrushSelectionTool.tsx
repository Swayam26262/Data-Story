'use client';

/**
 * Brush Selection Tool
 * Provides rectangular brush selection for data filtering and range selection
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import type { Point, DataRange } from '@/types';

/**
 * Brush selection state
 */
export interface BrushSelection {
  start: Point;
  end: Point;
  isActive: boolean;
}

/**
 * Brush selection tool props
 */
export interface BrushSelectionToolProps {
  children: (selection: BrushSelection | null, handlers: BrushHandlers) => React.ReactNode;
  onSelectionStart?: (start: Point) => void;
  onSelectionChange?: (selection: BrushSelection) => void;
  onSelectionEnd?: (selection: BrushSelection, dataRange?: DataRange) => void;
  enabled?: boolean;
  color?: string;
  opacity?: number;
  className?: string;
  // Optional: Convert pixel coordinates to data coordinates
  coordinateConverter?: (pixelPoint: Point) => Point;
}

/**
 * Event handlers for brush selection
 */
export interface BrushHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  clearSelection: () => void;
}

/**
 * Brush Selection Tool Component
 * Manages brush selection state and provides event handlers
 */
export function BrushSelectionTool({
  children,
  onSelectionStart,
  onSelectionChange,
  onSelectionEnd,
  enabled = true,
  color = '#2563eb',
  opacity = 0.2,
  className = '',
  coordinateConverter,
}: BrushSelectionToolProps) {
  const [selection, setSelection] = useState<BrushSelection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startPointRef = useRef<Point>({ x: 0, y: 0 });

  // Get relative coordinates within container
  const getRelativeCoordinates = useCallback((clientX: number, clientY: number): Point => {
    if (!containerRef.current) {
      return { x: clientX, y: clientY };
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // Calculate data range from pixel coordinates
  const calculateDataRange = useCallback((brushSelection: BrushSelection): DataRange | undefined => {
    if (!coordinateConverter) return undefined;

    const startData = coordinateConverter(brushSelection.start);
    const endData = coordinateConverter(brushSelection.end);

    return {
      xMin: Math.min(startData.x as number, endData.x as number),
      xMax: Math.max(startData.x as number, endData.x as number),
      yMin: Math.min(startData.y as number, endData.y as number),
      yMax: Math.max(startData.y as number, endData.y as number),
    };
  }, [coordinateConverter]);

  // Start brush selection
  const startSelection = useCallback((point: Point) => {
    if (!enabled) return;

    setIsSelecting(true);
    startPointRef.current = point;
    
    const newSelection: BrushSelection = {
      start: point,
      end: point,
      isActive: true,
    };
    
    setSelection(newSelection);
    onSelectionStart?.(point);
  }, [enabled, onSelectionStart]);

  // Update brush selection
  const updateSelection = useCallback((point: Point) => {
    if (!isSelecting || !enabled) return;

    const newSelection: BrushSelection = {
      start: startPointRef.current,
      end: point,
      isActive: true,
    };
    
    setSelection(newSelection);
    onSelectionChange?.(newSelection);
  }, [isSelecting, enabled, onSelectionChange]);

  // End brush selection
  const endSelection = useCallback(() => {
    if (!isSelecting || !selection) return;

    setIsSelecting(false);
    
    // Only emit if selection has meaningful size (> 5 pixels in any direction)
    const width = Math.abs(selection.end.x - selection.start.x);
    const height = Math.abs(selection.end.y - selection.start.y);
    
    if (width > 5 || height > 5) {
      const dataRange = calculateDataRange(selection);
      onSelectionEnd?.(selection, dataRange);
    } else {
      // Clear selection if too small
      setSelection(null);
    }
  }, [isSelecting, selection, calculateDataRange, onSelectionEnd]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelection(null);
    setIsSelecting(false);
  }, []);

  // Mouse event handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled) return;
    
    e.preventDefault();
    const point = getRelativeCoordinates(e.clientX, e.clientY);
    startSelection(point);
  }, [enabled, getRelativeCoordinates, startSelection]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !enabled) return;
    
    const point = getRelativeCoordinates(e.clientX, e.clientY);
    updateSelection(point);
  }, [isSelecting, enabled, getRelativeCoordinates, updateSelection]);

  const onMouseUp = useCallback(() => {
    endSelection();
  }, [endSelection]);

  const onMouseLeave = useCallback(() => {
    if (isSelecting) {
      endSelection();
    }
  }, [isSelecting, endSelection]);

  // Touch event handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const point = getRelativeCoordinates(touch.clientX, touch.clientY);
    startSelection(point);
  }, [enabled, getRelativeCoordinates, startSelection]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSelecting || !enabled || e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const point = getRelativeCoordinates(touch.clientX, touch.clientY);
    updateSelection(point);
  }, [isSelecting, enabled, getRelativeCoordinates, updateSelection]);

  const onTouchEnd = useCallback(() => {
    endSelection();
  }, [endSelection]);

  const handlers: BrushHandlers = {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    clearSelection,
  };

  return (
    <div
      ref={containerRef}
      className={`brush-selection-tool relative ${className}`}
      style={{ touchAction: enabled ? 'none' : 'auto' }}
    >
      {children(selection, handlers)}
      
      {/* Render brush selection rectangle */}
      {selection && selection.isActive && (
        <BrushRectangle
          start={selection.start}
          end={selection.end}
          color={color}
          opacity={opacity}
        />
      )}
    </div>
  );
}

/**
 * Brush Rectangle Component
 * Renders the visual brush selection rectangle
 */
interface BrushRectangleProps {
  start: Point;
  end: Point;
  color: string;
  opacity: number;
}

function BrushRectangle({ start, end, color, opacity }: BrushRectangleProps) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return (
    <div
      className="brush-rectangle pointer-events-none absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color,
        opacity: opacity,
        border: `2px solid ${color}`,
        borderRadius: '2px',
        zIndex: 1000,
      }}
    />
  );
}

/**
 * Hook for using brush selection in charts
 * Provides a simpler API for common use cases
 */
export function useBrushSelection(
  onRangeSelect?: (range: DataRange) => void,
  coordinateConverter?: (pixelPoint: Point) => Point
) {
  const [selection, setSelection] = useState<BrushSelection | null>(null);

  const handleSelectionEnd = useCallback(
    (brushSelection: BrushSelection, dataRange?: DataRange) => {
      if (dataRange && onRangeSelect) {
        onRangeSelect(dataRange);
      }
    },
    [onRangeSelect]
  );

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  return {
    selection,
    setSelection,
    handleSelectionEnd,
    clearSelection,
    coordinateConverter,
  };
}

export default BrushSelectionTool;
