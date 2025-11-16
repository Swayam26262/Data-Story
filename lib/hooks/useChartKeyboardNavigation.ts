/**
 * Hook for keyboard navigation in charts
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChartKeyboardNavigator, announceToScreenReader } from '@/lib/utils/accessibility';

interface UseChartKeyboardNavigationOptions {
  dataLength: number;
  chartId: string;
  onDataPointFocus?: (index: number) => void;
  onDataPointSelect?: (index: number) => void;
  enabled?: boolean;
}

export function useChartKeyboardNavigation({
  dataLength,
  chartId,
  onDataPointFocus,
  onDataPointSelect,
  enabled = true,
}: UseChartKeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const navigatorRef = useRef<ChartKeyboardNavigator | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize navigator
  useEffect(() => {
    if (!enabled || dataLength === 0) return;

    navigatorRef.current = new ChartKeyboardNavigator(
      dataLength,
      (index) => {
        setFocusedIndex(index);
        setIsKeyboardMode(true);
        onDataPointFocus?.(index);
        
        // Announce to screen reader
        announceToScreenReader(`Navigated to data point ${index + 1} of ${dataLength}`);
      },
      (index) => {
        onDataPointSelect?.(index);
        announceToScreenReader(`Selected data point ${index + 1}`);
      }
    );
  }, [dataLength, enabled, onDataPointFocus, onDataPointSelect]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enabled || !navigatorRef.current) return;
    
    // Activate keyboard mode on first keyboard interaction
    if (!isKeyboardMode) {
      setIsKeyboardMode(true);
      setFocusedIndex(0);
      navigatorRef.current.setCurrentIndex(0);
    }
    
    navigatorRef.current.handleKeyDown(event);
  }, [enabled, isKeyboardMode]);

  // Handle focus
  const handleFocus = useCallback(() => {
    if (!enabled) return;
    
    // If no item is focused, focus the first one
    if (focusedIndex === null && dataLength > 0) {
      setFocusedIndex(0);
      navigatorRef.current?.setCurrentIndex(0);
    }
  }, [enabled, focusedIndex, dataLength]);

  // Handle blur
  const handleBlur = useCallback((event: React.FocusEvent) => {
    if (!enabled) return;
    
    // Only clear focus if focus is leaving the chart container
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget as Node)) {
      setFocusedIndex(null);
      setIsKeyboardMode(false);
    }
  }, [enabled]);

  // Handle mouse interaction (disable keyboard mode)
  const handleMouseEnter = useCallback(() => {
    if (!enabled) return;
    setIsKeyboardMode(false);
  }, [enabled]);

  // Check if a specific index is focused
  const isIndexFocused = useCallback((index: number): boolean => {
    return isKeyboardMode && focusedIndex === index;
  }, [isKeyboardMode, focusedIndex]);

  // Programmatically set focus
  const setFocus = useCallback((index: number) => {
    if (!enabled || index < 0 || index >= dataLength) return;
    
    setFocusedIndex(index);
    setIsKeyboardMode(true);
    navigatorRef.current?.setCurrentIndex(index);
    
    // Focus the container
    containerRef.current?.focus();
  }, [enabled, dataLength]);

  return {
    focusedIndex,
    isKeyboardMode,
    isIndexFocused,
    setFocus,
    containerRef,
    containerProps: {
      ref: containerRef,
      tabIndex: enabled ? 0 : undefined,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onMouseEnter: handleMouseEnter,
      role: 'application',
      'aria-label': `Interactive chart ${chartId}. Use arrow keys to navigate, Enter or Space to select.`,
    },
  };
}
