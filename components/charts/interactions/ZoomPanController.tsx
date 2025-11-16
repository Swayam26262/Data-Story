'use client';

/**
 * Zoom and Pan Controller
 * Provides zoom and pan functionality for charts with smooth 60 FPS interactions
 * Supports mouse wheel, pinch gestures, drag, and touch swipe
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import type { Point } from '@/types';

/**
 * Zoom and pan state
 */
export interface ZoomPanState {
  zoomLevel: number;
  panOffset: Point;
  isDragging: boolean;
}

/**
 * Zoom and pan controller props
 */
export interface ZoomPanControllerProps {
  children: (state: ZoomPanState, handlers: ZoomPanHandlers) => React.ReactNode;
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  onZoomChange?: (zoomLevel: number) => void;
  onPanChange?: (offset: Point) => void;
  className?: string;
}

/**
 * Event handlers for zoom and pan
 */
export interface ZoomPanHandlers {
  onWheel: (e: React.WheelEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToData: () => void;
}

/**
 * Zoom and Pan Controller Component
 * Manages zoom and pan state and provides event handlers
 */
export function ZoomPanController({
  children,
  minZoom = 0.5,
  maxZoom = 10,
  zoomSpeed = 0.1,
  enableZoom = true,
  enablePan = true,
  onZoomChange,
  onPanChange,
  className = '',
}: ZoomPanControllerProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });
  const lastPanRef = useRef<Point>({ x: 0, y: 0 });
  const touchStartDistanceRef = useRef<number>(0);
  const lastZoomRef = useRef<number>(1);
  const rafRef = useRef<number | null>(null);

  // Clamp zoom level within bounds
  const clampZoom = useCallback((zoom: number): number => {
    return Math.max(minZoom, Math.min(maxZoom, zoom));
  }, [minZoom, maxZoom]);

  // Handle zoom with smooth animation
  const handleZoom = useCallback((delta: number, center?: Point) => {
    if (!enableZoom) return;

    const newZoom = clampZoom(zoomLevel + delta);
    
    if (newZoom !== zoomLevel) {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth 60 FPS
      rafRef.current = requestAnimationFrame(() => {
        setZoomLevel(newZoom);
        onZoomChange?.(newZoom);
        
        // Adjust pan to zoom towards center point
        if (center && enablePan) {
          const zoomRatio = newZoom / zoomLevel;
          const newPanX = center.x - (center.x - panOffset.x) * zoomRatio;
          const newPanY = center.y - (center.y - panOffset.y) * zoomRatio;
          setPanOffset({ x: newPanX, y: newPanY });
          onPanChange?.({ x: newPanX, y: newPanY });
        }
      });
    }
  }, [zoomLevel, panOffset, enableZoom, enablePan, clampZoom, onZoomChange, onPanChange]);

  // Handle pan with smooth animation
  const handlePan = useCallback((offset: Point) => {
    if (!enablePan) return;

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame for smooth 60 FPS
    rafRef.current = requestAnimationFrame(() => {
      setPanOffset(offset);
      onPanChange?.(offset);
    });
  }, [enablePan, onPanChange]);

  // Mouse wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!enableZoom) return;
    
    e.preventDefault();
    const delta = -e.deltaY * zoomSpeed * 0.01;
    const rect = e.currentTarget.getBoundingClientRect();
    const center = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    handleZoom(delta, center);
  }, [enableZoom, zoomSpeed, handleZoom]);

  // Mouse drag pan - start
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enablePan) return;
    
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastPanRef.current = panOffset;
  }, [enablePan, panOffset]);

  // Mouse drag pan - move
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !enablePan) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    handlePan({
      x: lastPanRef.current.x + deltaX,
      y: lastPanRef.current.y + deltaY,
    });
  }, [isDragging, enablePan, handlePan]);

  // Mouse drag pan - end
  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch pinch zoom - start
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && enableZoom) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      touchStartDistanceRef.current = distance;
      lastZoomRef.current = zoomLevel;
    } else if (e.touches.length === 1 && enablePan) {
      // Single touch pan
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      lastPanRef.current = panOffset;
    }
  }, [enableZoom, enablePan, zoomLevel, panOffset]);

  // Touch pinch zoom - move
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && enableZoom) {
      // Pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = distance / touchStartDistanceRef.current;
      const newZoom = clampZoom(lastZoomRef.current * scale);
      
      if (newZoom !== zoomLevel) {
        setZoomLevel(newZoom);
        onZoomChange?.(newZoom);
      }
    } else if (e.touches.length === 1 && isDragging && enablePan) {
      // Single touch pan
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      
      handlePan({
        x: lastPanRef.current.x + deltaX,
        y: lastPanRef.current.y + deltaY,
      });
    }
  }, [enableZoom, enablePan, isDragging, zoomLevel, clampZoom, onZoomChange, handlePan]);

  // Touch end
  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchStartDistanceRef.current = 0;
  }, []);

  // Reset view to default
  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    onZoomChange?.(1);
    onPanChange?.({ x: 0, y: 0 });
  }, [onZoomChange, onPanChange]);

  // Zoom in by fixed amount
  const zoomIn = useCallback(() => {
    handleZoom(zoomSpeed * 2);
  }, [handleZoom, zoomSpeed]);

  // Zoom out by fixed amount
  const zoomOut = useCallback(() => {
    handleZoom(-zoomSpeed * 2);
  }, [handleZoom, zoomSpeed]);

  // Fit to data (reset to default view)
  const fitToData = useCallback(() => {
    resetView();
  }, [resetView]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const state: ZoomPanState = {
    zoomLevel,
    panOffset,
    isDragging,
  };

  const handlers: ZoomPanHandlers = {
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    resetView,
    zoomIn,
    zoomOut,
    fitToData,
  };

  return (
    <div className={`zoom-pan-controller ${className}`}>
      {children(state, handlers)}
    </div>
  );
}

/**
 * Zoom Controls UI Component
 * Provides buttons for zoom in, zoom out, and reset
 */
export interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToData: () => void;
  zoomLevel: number;
  className?: string;
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToData,
  zoomLevel,
  className = '',
}: ZoomControlsProps) {
  return (
    <div className={`zoom-controls flex gap-2 ${className}`}>
      <button
        onClick={onZoomIn}
        className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 3V13M3 8H13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      
      <button
        onClick={onZoomOut}
        className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 8H13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      
      <button
        onClick={onReset}
        className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        title="Reset View"
        aria-label="Reset View"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C9.36 3 10.59 3.54 11.5 4.4M11.5 4.4V2M11.5 4.4H9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      <button
        onClick={onFitToData}
        className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        title="Fit to Data"
        aria-label="Fit to Data"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 6V2H6M14 6V2H10M2 10V14H6M14 10V14H10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      <span className="px-3 py-1.5 text-sm text-gray-600 flex items-center">
        {Math.round(zoomLevel * 100)}%
      </span>
    </div>
  );
}

export default ZoomPanController;
