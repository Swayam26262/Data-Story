/**
 * Professional Theme System - Type Definitions
 * Defines TypeScript interfaces for the chart theme system
 */

export interface ColorPalette {
  categorical: string[];
  sequential: string[];
  diverging: string[];
  semantic: {
    positive: string;
    negative: string;
    neutral: string;
    warning: string;
    info: string;
  };
}

export interface TypographyConfig {
  title: {
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    color: string;
  };
  subtitle: {
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    color: string;
  };
  axisLabel: {
    fontSize: number;
    fontWeight: number;
    color: string;
  };
  dataLabel: {
    fontSize: number;
    fontWeight: number;
    color: string;
  };
  tooltip: {
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    color: string;
  };
  legend: {
    fontSize: number;
    fontWeight: number;
    color: string;
  };
}

export interface SpacingConfig {
  chartPadding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  labelMargin: number;
  legendSpacing: number;
  titleMargin: number;
  gridSpacing: number;
}

export interface BorderConfig {
  gridLineWidth: number;
  gridLineColor: string;
  gridLineDash: number[];
  axisLineWidth: number;
  axisLineColor: string;
  chartBorderWidth: number;
  chartBorderColor: string;
  chartBorderRadius: number;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay: number;
  stagger: number;
}

export interface ShadowConfig {
  tooltip: string;
  chart: string;
  hover: string;
  focus: string;
}

export interface DesignTokens {
  spacing: SpacingConfig;
  borders: BorderConfig;
  animations: AnimationConfig;
  shadows: ShadowConfig;
}

export interface ThemeConfig {
  name: string;
  colors: ColorPalette;
  typography: TypographyConfig;
  tokens: DesignTokens;
}

export type ThemeName = 'default' | 'colorblindSafe' | 'highContrast' | 'dark';

export interface ChartThemeContextValue {
  theme: ThemeConfig;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  getColor: (index: number, type?: 'categorical' | 'sequential' | 'diverging') => string;
  getSemanticColor: (type: keyof ColorPalette['semantic']) => string;
}
