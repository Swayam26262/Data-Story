/**
 * Responsive Chart Wrapper Component
 * Wraps chart components with responsive behavior and touch gesture support
 */

'use client';

import { useResponsiveChart, useTouchGestures } from '@/lib/hooks/useResponsiveChart';
import { useChartThemeOptional } from '@/lib/theme';

export interface ResponsiveChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onPinchZoom?: (scale: number) => void;
  onSwipePan?: (deltaX: number, deltaY: number) => void;
  enableTouchGestures?: boolean;
}

/**
 * Responsive Chart Wrapper
 * Provides responsive container with touch gesture support
 */
export function ResponsiveChartWrapper({
  children,
  title,
  className = '',
  onPinchZoom,
  onSwipePan,
  enableTouchGestures = true,
}: ResponsiveChartWrapperProps) {
  const responsive = useResponsiveChart();
  const { theme } = useChartThemeOptional();

  // Enable touch gestures if callbacks provided
  useTouchGestures(
    enableTouchGestures ? onPinchZoom : undefined,
    enableTouchGestures ? onSwipePan : undefined
  );

  return (
    <div
      className={`w-full ${className}`}
      style={{
        minHeight: responsive.layout.minHeight,
        touchAction: enableTouchGestures ? 'none' : 'auto', // Prevent default touch behaviors
      }}
    >
      {title && (
        <h3
          style={{
            fontSize: `${responsive.fontSize.title}px`,
            fontWeight: theme.typography.title.fontWeight,
            color: theme.typography.title.color,
            marginBottom: `${responsive.spacing.titleMargin}px`,
          }}
          className="truncate"
        >
          {title}
        </h3>
      )}
      
      <div
        className="relative"
        style={{
          minHeight: responsive.layout.minHeight,
        }}
      >
        {children}
      </div>

      {/* Touch gesture hint for mobile */}
      {responsive.isMobile && enableTouchGestures && (onPinchZoom || onSwipePan) && (
        <div className="text-xs text-gray-500 text-center mt-2" aria-live="polite">
          {onPinchZoom && onSwipePan && 'Pinch to zoom, swipe to pan'}
          {onPinchZoom && !onSwipePan && 'Pinch to zoom'}
          {!onPinchZoom && onSwipePan && 'Swipe to pan'}
        </div>
      )}
    </div>
  );
}

export default ResponsiveChartWrapper;
