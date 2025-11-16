/**
 * Professional Theme System - Main Export
 * Central export point for all theme-related functionality
 */

// Type definitions
export type {
  ColorPalette,
  TypographyConfig,
  SpacingConfig,
  BorderConfig,
  AnimationConfig,
  ShadowConfig,
  DesignTokens,
  ThemeConfig,
  ThemeName,
  ChartThemeContextValue,
} from './types';

// Theme configurations
export { themes, defaultTheme } from './config';

// Utility functions
export {
  hexToRgb,
  rgbToHex,
  interpolateColor,
  generateSequentialPalette,
  generateDivergingPalette,
  adjustBrightness,
  adjustOpacity,
  getColorFromPalette,
  generateCategoricalColors,
  meetsContrastRequirement,
  getAccessibleTextColor,
  createColorScale,
  validatePaletteAccessibility,
} from './utils';

// Context and hooks
export {
  ChartThemeProvider,
  useChartTheme,
  useChartThemeOptional,
} from '../contexts/ChartThemeContext';
