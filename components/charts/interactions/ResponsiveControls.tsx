/**
 * Responsive Controls Component
 * Provides touch-friendly controls for chart interactions
 */

'use client';

import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';

export interface ResponsiveControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onPanLeft?: () => void;
  onPanRight?: () => void;
  zoomDisabled?: { in: boolean; out: boolean };
  panDisabled?: { left: boolean; right: boolean };
  className?: string;
}

/**
 * Responsive Controls Component
 * Provides touch-friendly buttons for chart interactions
 */
export function ResponsiveControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onPanLeft,
  onPanRight,
  zoomDisabled = { in: false, out: false },
  panDisabled = { left: false, right: false },
  className = '',
}: ResponsiveControlsProps) {
  const { interactions, isMobile } = useResponsiveChart();

  const buttonBaseClass = `
    px-3 py-2 text-xs font-medium rounded border
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  const primaryButtonClass = `
    ${buttonBaseClass}
    bg-blue-500 text-white border-blue-600
    hover:bg-blue-600 active:bg-blue-700
    disabled:bg-blue-300 disabled:border-blue-300
  `;

  const secondaryButtonClass = `
    ${buttonBaseClass}
    bg-white text-gray-700 border-gray-300
    hover:bg-gray-50 active:bg-gray-100
    disabled:bg-gray-100 disabled:text-gray-400
  `;

  const resetButtonClass = `
    ${buttonBaseClass}
    bg-gray-500 text-white border-gray-600
    hover:bg-gray-600 active:bg-gray-700
    disabled:bg-gray-300 disabled:border-gray-300
  `;

  const touchTargetStyle = {
    minWidth: interactions.touchTargetSize,
    minHeight: interactions.touchTargetSize,
  };

  // Stack controls vertically on mobile
  const containerClass = interactions.controlsStacked
    ? 'flex flex-col gap-2'
    : 'flex flex-row flex-wrap gap-2';

  return (
    <div className={`${containerClass} ${className}`} role="toolbar" aria-label="Chart controls">
      {/* Zoom Controls */}
      {(onZoomIn || onZoomOut) && (
        <div className="flex gap-2" role="group" aria-label="Zoom controls">
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              disabled={zoomDisabled.in}
              className={primaryButtonClass}
              style={touchTargetStyle}
              aria-label="Zoom in"
              title="Zoom in"
            >
              {isMobile ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                  />
                </svg>
              ) : (
                'Zoom In'
              )}
            </button>
          )}
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              disabled={zoomDisabled.out}
              className={primaryButtonClass}
              style={touchTargetStyle}
              aria-label="Zoom out"
              title="Zoom out"
            >
              {isMobile ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                  />
                </svg>
              ) : (
                'Zoom Out'
              )}
            </button>
          )}
        </div>
      )}

      {/* Pan Controls */}
      {(onPanLeft || onPanRight) && (
        <div className="flex gap-2" role="group" aria-label="Pan controls">
          {onPanLeft && (
            <button
              onClick={onPanLeft}
              disabled={panDisabled.left}
              className={secondaryButtonClass}
              style={touchTargetStyle}
              aria-label="Pan left"
              title="Pan left"
            >
              {isMobile ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                '← Pan Left'
              )}
            </button>
          )}
          {onPanRight && (
            <button
              onClick={onPanRight}
              disabled={panDisabled.right}
              className={secondaryButtonClass}
              style={touchTargetStyle}
              aria-label="Pan right"
              title="Pan right"
            >
              {isMobile ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                'Pan Right →'
              )}
            </button>
          )}
        </div>
      )}

      {/* Reset Control */}
      {onReset && (
        <button
          onClick={onReset}
          className={resetButtonClass}
          style={touchTargetStyle}
          aria-label="Reset view"
          title="Reset view"
        >
          {isMobile ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : (
            'Reset'
          )}
        </button>
      )}
    </div>
  );
}

export default ResponsiveControls;
