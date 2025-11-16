/**
 * Professional Theme System - Configuration
 * Defines color palettes, typography, and design tokens for professional charts
 */

import type { ThemeConfig, ColorPalette, TypographyConfig, DesignTokens } from './types';

/**
 * Default Color Palette
 * Based on modern data visualization best practices
 */
const defaultColors: ColorPalette = {
  // Categorical colors for distinct categories (6 colors)
  categorical: [
    '#2563eb', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
  ],
  
  // Sequential colors for ordered data (light to dark)
  sequential: [
    '#dbeafe', // Blue 100
    '#93c5fd', // Blue 300
    '#60a5fa', // Blue 400
    '#3b82f6', // Blue 500
    '#2563eb', // Blue 600
    '#1d4ed8', // Blue 700
    '#1e40af', // Blue 800
    '#1e3a8a', // Blue 900
  ],
  
  // Diverging colors for data with meaningful midpoint
  diverging: [
    '#ef4444', // Red (negative)
    '#f87171', // Red light
    '#fca5a5', // Red lighter
    '#fbbf24', // Yellow (neutral)
    '#86efac', // Green lighter
    '#4ade80', // Green light
    '#10b981', // Green (positive)
  ],
  
  // Semantic colors for specific meanings
  semantic: {
    positive: '#10b981', // Green
    negative: '#ef4444', // Red
    neutral: '#6b7280',  // Gray
    warning: '#f59e0b',  // Amber
    info: '#3b82f6',     // Blue
  },
};

/**
 * Colorblind-Safe Palette
 * Optimized for deuteranopia and protanopia
 */
const colorblindSafeColors: ColorPalette = {
  categorical: [
    '#0173b2', // Blue
    '#de8f05', // Orange
    '#029e73', // Teal
    '#cc78bc', // Purple
    '#ca9161', // Brown
    '#949494', // Gray
  ],
  
  sequential: [
    '#e6f2ff',
    '#b3d9ff',
    '#80bfff',
    '#4da6ff',
    '#1a8cff',
    '#0073e6',
    '#005bb3',
    '#004280',
  ],
  
  diverging: [
    '#d55e00', // Orange (negative)
    '#e69f00',
    '#f0e442',
    '#ffffff', // White (neutral)
    '#009e73',
    '#56b4e9',
    '#0072b2', // Blue (positive)
  ],
  
  semantic: {
    positive: '#009e73',
    negative: '#d55e00',
    neutral: '#949494',
    warning: '#e69f00',
    info: '#0072b2',
  },
};

/**
 * High Contrast Palette
 * For better visibility and accessibility
 */
const highContrastColors: ColorPalette = {
  categorical: [
    '#000000', // Black
    '#0066cc', // Blue
    '#cc0000', // Red
    '#00aa00', // Green
    '#ff6600', // Orange
    '#9900cc', // Purple
  ],
  
  sequential: [
    '#f0f0f0',
    '#d0d0d0',
    '#a0a0a0',
    '#707070',
    '#404040',
    '#202020',
    '#101010',
    '#000000',
  ],
  
  diverging: [
    '#cc0000',
    '#ff3333',
    '#ff9999',
    '#ffffff',
    '#99ccff',
    '#3399ff',
    '#0066cc',
  ],
  
  semantic: {
    positive: '#00aa00',
    negative: '#cc0000',
    neutral: '#666666',
    warning: '#ff6600',
    info: '#0066cc',
  },
};

/**
 * Dark Theme Palette
 * Optimized for dark backgrounds
 */
const darkColors: ColorPalette = {
  categorical: [
    '#60a5fa', // Blue
    '#34d399', // Green
    '#fbbf24', // Amber
    '#f87171', // Red
    '#a78bfa', // Purple
    '#f472b6', // Pink
  ],
  
  sequential: [
    '#1e3a8a',
    '#1e40af',
    '#1d4ed8',
    '#2563eb',
    '#3b82f6',
    '#60a5fa',
    '#93c5fd',
    '#dbeafe',
  ],
  
  diverging: [
    '#f87171',
    '#fca5a5',
    '#fcd34d',
    '#a3a3a3',
    '#86efac',
    '#4ade80',
    '#34d399',
  ],
  
  semantic: {
    positive: '#34d399',
    negative: '#f87171',
    neutral: '#9ca3af',
    warning: '#fbbf24',
    info: '#60a5fa',
  },
};

/**
 * Typography Configuration
 * Defines font sizes, weights, and line heights for all chart elements
 */
const typography: TypographyConfig = {
  title: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.5,
    color: '#4b5563',
  },
  axisLabel: {
    fontSize: 12,
    fontWeight: 400,
    color: '#6b7280',
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#374151',
  },
  tooltip: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#1f2937',
  },
  legend: {
    fontSize: 12,
    fontWeight: 400,
    color: '#4b5563',
  },
};

/**
 * Dark Theme Typography
 */
const darkTypography: TypographyConfig = {
  title: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.5,
    color: '#d1d5db',
  },
  axisLabel: {
    fontSize: 12,
    fontWeight: 400,
    color: '#9ca3af',
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#e5e7eb',
  },
  tooltip: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#f3f4f6',
  },
  legend: {
    fontSize: 12,
    fontWeight: 400,
    color: '#d1d5db',
  },
};

/**
 * Design Tokens
 * Spacing, borders, animations, and shadows
 */
const designTokens: DesignTokens = {
  spacing: {
    chartPadding: {
      top: 20,
      right: 30,
      bottom: 20,
      left: 20,
    },
    labelMargin: 8,
    legendSpacing: 16,
    titleMargin: 16,
    gridSpacing: 10,
  },
  
  borders: {
    gridLineWidth: 1,
    gridLineColor: '#e5e7eb',
    gridLineDash: [3, 3],
    axisLineWidth: 1,
    axisLineColor: '#d1d5db',
    chartBorderWidth: 0,
    chartBorderColor: 'transparent',
    chartBorderRadius: 8,
  },
  
  animations: {
    duration: 500,
    easing: 'ease-in-out',
    delay: 0,
    stagger: 50,
  },
  
  shadows: {
    tooltip: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    chart: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  },
};

/**
 * Dark Theme Design Tokens
 */
const darkDesignTokens: DesignTokens = {
  spacing: designTokens.spacing,
  
  borders: {
    ...designTokens.borders,
    gridLineColor: '#374151',
    axisLineColor: '#4b5563',
  },
  
  animations: designTokens.animations,
  
  shadows: {
    tooltip: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    chart: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    focus: '0 0 0 3px rgba(96, 165, 250, 0.5)',
  },
};

/**
 * Theme Configurations
 */
export const themes: Record<string, ThemeConfig> = {
  default: {
    name: 'Default',
    colors: defaultColors,
    typography,
    tokens: designTokens,
  },
  
  colorblindSafe: {
    name: 'Colorblind Safe',
    colors: colorblindSafeColors,
    typography,
    tokens: designTokens,
  },
  
  highContrast: {
    name: 'High Contrast',
    colors: highContrastColors,
    typography,
    tokens: designTokens,
  },
  
  dark: {
    name: 'Dark',
    colors: darkColors,
    typography: darkTypography,
    tokens: darkDesignTokens,
  },
};

/**
 * Default theme export
 */
export const defaultTheme = themes.default;
