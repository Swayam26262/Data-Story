'use client';

/**
 * Chart Theme Context Provider
 * Provides theme configuration to all chart components
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ThemeConfig, ThemeName, ChartThemeContextValue, ColorPalette } from '@/lib/theme/types';
import { themes, defaultTheme } from '@/lib/theme/config';
import { getColorFromPalette } from '@/lib/theme/utils';

const ChartThemeContext = createContext<ChartThemeContextValue | undefined>(undefined);

interface ChartThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeName;
}

/**
 * Chart Theme Provider Component
 * Wraps chart components and provides theme configuration
 */
export function ChartThemeProvider({ children, initialTheme = 'default' }: ChartThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);

  const theme = useMemo<ThemeConfig>(() => {
    return themes[themeName] || defaultTheme;
  }, [themeName]);

  const setTheme = useCallback((newThemeName: ThemeName) => {
    setThemeName(newThemeName);
  }, []);

  const getColor = useCallback(
    (index: number, type: 'categorical' | 'sequential' | 'diverging' = 'categorical'): string => {
      const palette = theme.colors[type];
      return getColorFromPalette(palette, index);
    },
    [theme]
  );

  const getSemanticColor = useCallback(
    (type: keyof ColorPalette['semantic']): string => {
      return theme.colors.semantic[type];
    },
    [theme]
  );

  const value = useMemo<ChartThemeContextValue>(
    () => ({
      theme,
      themeName,
      setTheme,
      getColor,
      getSemanticColor,
    }),
    [theme, themeName, setTheme, getColor, getSemanticColor]
  );

  return <ChartThemeContext.Provider value={value}>{children}</ChartThemeContext.Provider>;
}

/**
 * Hook to access chart theme context
 */
export function useChartTheme(): ChartThemeContextValue {
  const context = useContext(ChartThemeContext);
  
  if (context === undefined) {
    throw new Error('useChartTheme must be used within a ChartThemeProvider');
  }
  
  return context;
}

/**
 * Hook to access chart theme (with fallback to default theme)
 * Use this when theme provider might not be available
 */
export function useChartThemeOptional(): ChartThemeContextValue {
  const context = useContext(ChartThemeContext);
  
  if (context === undefined) {
    // Return default theme if provider is not available
    return {
      theme: defaultTheme,
      themeName: 'default',
      setTheme: () => {},
      getColor: (index: number, type: 'categorical' | 'sequential' | 'diverging' = 'categorical') => {
        return getColorFromPalette(defaultTheme.colors[type], index);
      },
      getSemanticColor: (type: keyof ColorPalette['semantic']) => {
        return defaultTheme.colors.semantic[type];
      },
    };
  }
  
  return context;
}
