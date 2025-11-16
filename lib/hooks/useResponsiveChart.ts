/**
 * Responsive Chart Hook
 * Provides responsive configuration and utilities for chart components
 */

import { useState, useEffect, useMemo } from 'react';

export interface ResponsiveConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  fontSize: {
    title: number;
    subtitle: number;
    axisLabel: number;
    dataLabel: number;
    tooltip: number;
    legend: number;
  };
  spacing: {
    chartPadding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    titleMargin: number;
    legendSpacing: number;
  };
  interactions: {
    touchTargetSize: number;
    tooltipSimplified: boolean;
    legendCollapsible: boolean;
    controlsStacked: boolean;
  };
  layout: {
    minHeight: number;
    legendPosition: 'bottom' | 'right' | 'top';
    axisLabelAngle: number;
    showDataLabels: boolean;
    columns: number; // For grid layouts
  };
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};

const TOUCH_TARGET_MIN = 44; // WCAG minimum touch target size

/**
 * Hook to get responsive chart configuration based on screen size
 */
export function useResponsiveChart(): ResponsiveConfig {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const config = useMemo<ResponsiveConfig>(() => {
    const isMobile = screenWidth < BREAKPOINTS.mobile;
    const isTablet = screenWidth >= BREAKPOINTS.mobile && screenWidth < BREAKPOINTS.tablet;
    const isDesktop = screenWidth >= BREAKPOINTS.tablet;

    // Base font sizes (desktop)
    const baseFontSizes = {
      title: 18,
      subtitle: 14,
      axisLabel: 12,
      dataLabel: 11,
      tooltip: 12,
      legend: 12,
    };

    // Adjust font sizes for mobile
    const fontSize = isMobile
      ? {
          title: 16,
          subtitle: 13,
          axisLabel: 10,
          dataLabel: 9,
          tooltip: 11,
          legend: 11,
        }
      : isTablet
      ? {
          title: 17,
          subtitle: 13,
          axisLabel: 11,
          dataLabel: 10,
          tooltip: 11,
          legend: 11,
        }
      : baseFontSizes;

    // Adjust spacing for mobile
    const spacing = isMobile
      ? {
          chartPadding: {
            top: 10,
            right: 10,
            bottom: 40,
            left: 35,
          },
          titleMargin: 8,
          legendSpacing: 8,
        }
      : isTablet
      ? {
          chartPadding: {
            top: 15,
            right: 15,
            bottom: 50,
            left: 45,
          },
          titleMargin: 10,
          legendSpacing: 10,
        }
      : {
          chartPadding: {
            top: 20,
            right: 20,
            bottom: 60,
            left: 60,
          },
          titleMargin: 12,
          legendSpacing: 12,
        };

    // Interaction settings
    const interactions = {
      touchTargetSize: TOUCH_TARGET_MIN,
      tooltipSimplified: isMobile,
      legendCollapsible: isMobile,
      controlsStacked: isMobile,
    };

    // Layout settings
    const layout = {
      minHeight: isMobile ? 250 : isTablet ? 300 : 350,
      legendPosition: (isMobile ? 'bottom' : 'right') as 'bottom' | 'right' | 'top',
      axisLabelAngle: isMobile ? -45 : -30,
      showDataLabels: !isMobile,
      columns: isMobile ? 1 : isTablet ? 2 : 3,
    };

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      fontSize,
      spacing,
      interactions,
      layout,
    };
  }, [screenWidth]);

  return config;
}

/**
 * Hook for touch gesture support
 */
export function useTouchGestures(
  onPinchZoom?: (scale: number) => void,
  onSwipePan?: (deltaX: number, deltaY: number) => void
) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance: number } | null>(
    null
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch for pan
        setTouchStart({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          distance: 0,
        });
      } else if (e.touches.length === 2) {
        // Two touches for pinch zoom
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        setTouchStart({
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          distance,
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart) return;

      if (e.touches.length === 1 && onSwipePan) {
        // Pan gesture
        const deltaX = e.touches[0].clientX - touchStart.x;
        const deltaY = e.touches[0].clientY - touchStart.y;
        onSwipePan(deltaX, deltaY);
      } else if (e.touches.length === 2 && onPinchZoom && touchStart.distance > 0) {
        // Pinch zoom gesture
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = distance / touchStart.distance;
        onPinchZoom(scale);
      }
    };

    const handleTouchEnd = () => {
      setTouchStart(null);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, onPinchZoom, onSwipePan]);
}

/**
 * Utility to calculate responsive chart dimensions
 */
export function getResponsiveChartDimensions(
  containerWidth: number,
  aspectRatio: number = 16 / 9
): { width: number; height: number } {
  const isMobile = containerWidth < BREAKPOINTS.mobile;
  const isTablet = containerWidth >= BREAKPOINTS.mobile && containerWidth < BREAKPOINTS.tablet;

  // Adjust aspect ratio for mobile (more square)
  const adjustedRatio = isMobile ? 4 / 3 : isTablet ? 3 / 2 : aspectRatio;

  const height = containerWidth / adjustedRatio;
  const minHeight = isMobile ? 250 : isTablet ? 300 : 350;
  const maxHeight = isMobile ? 400 : isTablet ? 500 : 600;

  return {
    width: containerWidth,
    height: Math.max(minHeight, Math.min(height, maxHeight)),
  };
}
