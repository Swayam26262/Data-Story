'use client';

/**
 * Highlight Effects Component
 * Provides visual effects for highlighted data points (glow, border, size increase)
 */

import React from 'react';

/**
 * Highlight effect types
 */
export type HighlightEffectType = 'glow' | 'border' | 'scale' | 'pulse' | 'combined';

/**
 * Highlight effect configuration
 */
export interface HighlightEffectConfig {
  type: HighlightEffectType;
  color?: string;
  intensity?: number; // 0-1 scale
  duration?: number; // Animation duration in ms
  glowSize?: number; // Size of glow effect in pixels
  borderWidth?: number; // Width of border in pixels
  scaleAmount?: number; // Scale multiplier (e.g., 1.2 for 20% larger)
}

/**
 * Default highlight effect configuration
 */
export const DEFAULT_HIGHLIGHT_CONFIG: HighlightEffectConfig = {
  type: 'combined',
  color: '#2563eb',
  intensity: 0.8,
  duration: 300,
  glowSize: 8,
  borderWidth: 3,
  scaleAmount: 1.3,
};

/**
 * Generate CSS for glow effect
 */
export function getGlowStyle(config: HighlightEffectConfig): React.CSSProperties {
  const { color = '#2563eb', intensity = 0.8, glowSize = 8 } = config;
  
  return {
    filter: `drop-shadow(0 0 ${glowSize}px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')})`,
    transition: `filter ${config.duration || 300}ms ease-in-out`,
  };
}

/**
 * Generate CSS for border effect
 */
export function getBorderStyle(config: HighlightEffectConfig): React.CSSProperties {
  const { color = '#2563eb', borderWidth = 3, duration = 300 } = config;
  
  return {
    outline: `${borderWidth}px solid ${color}`,
    outlineOffset: '2px',
    transition: `outline ${duration}ms ease-in-out`,
  };
}

/**
 * Generate CSS for scale effect
 */
export function getScaleStyle(config: HighlightEffectConfig): React.CSSProperties {
  const { scaleAmount = 1.3, duration = 300 } = config;
  
  return {
    transform: `scale(${scaleAmount})`,
    transformOrigin: 'center',
    transition: `transform ${duration}ms ease-in-out`,
    zIndex: 10,
  };
}

/**
 * Generate CSS for pulse effect
 */
export function getPulseStyle(config: HighlightEffectConfig): React.CSSProperties {
  const { color = '#2563eb', intensity = 0.8, duration = 300 } = config;
  
  return {
    animation: `highlight-pulse ${duration * 2}ms ease-in-out infinite`,
    boxShadow: `0 0 0 0 ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
  };
}

/**
 * Generate combined CSS for all effects
 */
export function getCombinedStyle(config: HighlightEffectConfig): React.CSSProperties {
  const { color = '#2563eb', intensity = 0.8, glowSize = 8, scaleAmount = 1.2, duration = 300 } = config;
  
  return {
    filter: `drop-shadow(0 0 ${glowSize}px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')})`,
    transform: `scale(${scaleAmount})`,
    transformOrigin: 'center',
    transition: `all ${duration}ms ease-in-out`,
    zIndex: 10,
  };
}

/**
 * Get highlight style based on effect type
 */
export function getHighlightStyle(
  config: HighlightEffectConfig = DEFAULT_HIGHLIGHT_CONFIG
): React.CSSProperties {
  switch (config.type) {
    case 'glow':
      return getGlowStyle(config);
    case 'border':
      return getBorderStyle(config);
    case 'scale':
      return getScaleStyle(config);
    case 'pulse':
      return getPulseStyle(config);
    case 'combined':
    default:
      return getCombinedStyle(config);
  }
}

/**
 * Highlight wrapper component
 * Wraps a chart element and applies highlight effects
 */
export interface HighlightWrapperProps {
  children: React.ReactNode;
  isHighlighted: boolean;
  config?: HighlightEffectConfig;
  className?: string;
}

export function HighlightWrapper({
  children,
  isHighlighted,
  config = DEFAULT_HIGHLIGHT_CONFIG,
  className = '',
}: HighlightWrapperProps) {
  const style = isHighlighted ? getHighlightStyle(config) : {};

  return (
    <div className={`highlight-wrapper ${className}`} style={style}>
      {children}
    </div>
  );
}

/**
 * CSS keyframes for pulse animation
 * Should be added to global styles or component styles
 */
export const HIGHLIGHT_KEYFRAMES = `
@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 0 10px currentColor;
    opacity: 0.5;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
}
`;

/**
 * Inject highlight styles into document
 */
export function injectHighlightStyles() {
  if (typeof document === 'undefined') return;

  const styleId = 'cross-chart-highlight-styles';
  
  // Check if styles already exist
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = HIGHLIGHT_KEYFRAMES;
  document.head.appendChild(style);
}

/**
 * Hook to inject highlight styles on mount
 */
export function useHighlightStyles() {
  React.useEffect(() => {
    injectHighlightStyles();
  }, []);
}

/**
 * Recharts-specific highlight props
 * Generates props to apply to Recharts components for highlighting
 */
export interface RechartsHighlightProps {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  r?: number; // For dots
  opacity?: number;
  filter?: string;
}

/**
 * Get Recharts-compatible highlight props
 */
export function getRechartsHighlightProps(
  isHighlighted: boolean,
  config: HighlightEffectConfig = DEFAULT_HIGHLIGHT_CONFIG
): RechartsHighlightProps {
  if (!isHighlighted) return {};

  const { color = '#2563eb', borderWidth = 3, scaleAmount = 1.3 } = config;

  return {
    stroke: color,
    strokeWidth: borderWidth,
    r: 6 * (scaleAmount || 1.3), // For dot radius
    opacity: 1,
    filter: `drop-shadow(0 0 ${config.glowSize || 8}px ${color})`,
  };
}

/**
 * Custom dot component for Recharts with highlight support
 */
export interface HighlightDotProps {
  cx?: number;
  cy?: number;
  r?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  isHighlighted?: boolean;
  config?: HighlightEffectConfig;
  payload?: any;
  dataKey?: string;
}

export function HighlightDot({
  cx = 0,
  cy = 0,
  r = 4,
  fill = '#2563eb',
  stroke = '#ffffff',
  strokeWidth = 2,
  isHighlighted = false,
  config = DEFAULT_HIGHLIGHT_CONFIG,
}: HighlightDotProps) {
  const highlightProps = isHighlighted ? getRechartsHighlightProps(true, config) : {};
  
  const finalR = highlightProps.r || r;
  const finalStroke = highlightProps.stroke || stroke;
  const finalStrokeWidth = highlightProps.strokeWidth || strokeWidth;

  return (
    <g>
      {isHighlighted && (
        <>
          {/* Glow effect circle */}
          <circle
            cx={cx}
            cy={cy}
            r={finalR + 4}
            fill={config.color || '#2563eb'}
            opacity={0.3}
            className="animate-ping"
          />
          {/* Outer highlight circle */}
          <circle
            cx={cx}
            cy={cy}
            r={finalR + 2}
            fill="none"
            stroke={config.color || '#2563eb'}
            strokeWidth={2}
            opacity={0.6}
          />
        </>
      )}
      {/* Main dot */}
      <circle
        cx={cx}
        cy={cy}
        r={finalR}
        fill={fill}
        stroke={finalStroke}
        strokeWidth={finalStrokeWidth}
        style={{
          transition: `all ${config.duration || 300}ms ease-in-out`,
        }}
      />
    </g>
  );
}

/**
 * Custom bar component for Recharts with highlight support
 */
export interface HighlightBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  isHighlighted?: boolean;
  config?: HighlightEffectConfig;
  payload?: any;
}

export function HighlightBar({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = '#2563eb',
  isHighlighted = false,
  config = DEFAULT_HIGHLIGHT_CONFIG,
}: HighlightBarProps) {
  const style: React.CSSProperties = isHighlighted
    ? {
        filter: `drop-shadow(0 0 ${config.glowSize || 8}px ${config.color || fill})`,
        transition: `all ${config.duration || 300}ms ease-in-out`,
      }
    : {
        transition: `all ${config.duration || 300}ms ease-in-out`,
      };

  return (
    <g>
      {isHighlighted && (
        <rect
          x={x - 2}
          y={y - 2}
          width={width + 4}
          height={height + 4}
          fill="none"
          stroke={config.color || '#2563eb'}
          strokeWidth={config.borderWidth || 3}
          opacity={0.6}
          rx={2}
        />
      )}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        style={style}
      />
    </g>
  );
}

export default HighlightWrapper;
