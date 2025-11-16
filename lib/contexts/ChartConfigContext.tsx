'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ThemeName } from '@/lib/theme/types';
import type { AllChartTypes, StatisticalOverlay, InteractionConfig } from '@/types/chart';

/**
 * Chart Configuration Interface
 * Stores user preferences for chart customization
 */
export interface ChartConfiguration {
  // Theme settings
  theme: ThemeName;
  colorPalette: 'categorical' | 'sequential' | 'diverging';
  
  // Statistical overlays
  statisticalOverlays: {
    trendLine: boolean;
    movingAverage: boolean;
    outliers: boolean;
    confidenceInterval: boolean;
  };
  
  // Interaction features
  interactions: {
    zoom: boolean;
    pan: boolean;
    brush: boolean;
    crosshair: boolean;
    tooltipEnhanced: boolean;
    legendInteractive: boolean;
  };
  
  // Annotations
  annotations: {
    enabled: boolean;
    items: Array<{
      id: string;
      type: 'text' | 'line' | 'region';
      chartId?: string;
      position: { x: number | string; y: number | string };
      content: string;
      style?: Record<string, unknown>;
    }>;
  };
  
  // Chart type preferences
  preferredChartTypes: Partial<Record<AllChartTypes, boolean>>;
}

/**
 * Default configuration
 */
const defaultConfig: ChartConfiguration = {
  theme: 'default',
  colorPalette: 'categorical',
  statisticalOverlays: {
    trendLine: false,
    movingAverage: false,
    outliers: false,
    confidenceInterval: false,
  },
  interactions: {
    zoom: true,
    pan: true,
    brush: false,
    crosshair: true,
    tooltipEnhanced: true,
    legendInteractive: true,
  },
  annotations: {
    enabled: false,
    items: [],
  },
  preferredChartTypes: {},
};

/**
 * Context value interface
 */
interface ChartConfigContextValue {
  config: ChartConfiguration;
  updateConfig: (updates: Partial<ChartConfiguration>) => void;
  updateStatisticalOverlay: (key: keyof ChartConfiguration['statisticalOverlays'], value: boolean) => void;
  updateInteraction: (key: keyof ChartConfiguration['interactions'], value: boolean) => void;
  addAnnotation: (annotation: ChartConfiguration['annotations']['items'][0]) => void;
  removeAnnotation: (id: string) => void;
  updateAnnotation: (id: string, updates: Partial<ChartConfiguration['annotations']['items'][0]>) => void;
  resetConfig: () => void;
  saveConfig: () => Promise<void>;
  loadConfig: () => Promise<void>;
}

const ChartConfigContext = createContext<ChartConfigContextValue | undefined>(undefined);

/**
 * Chart Configuration Provider
 * Manages chart configuration state and persistence
 */
export function ChartConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ChartConfiguration>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Load configuration from localStorage on mount
  useEffect(() => {
    loadConfig();
  }, []);

  // Save configuration to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('chartConfiguration', JSON.stringify(config));
    }
  }, [config, isLoading]);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((updates: Partial<ChartConfiguration>) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Update statistical overlay setting
   */
  const updateStatisticalOverlay = useCallback(
    (key: keyof ChartConfiguration['statisticalOverlays'], value: boolean) => {
      setConfig((prev) => ({
        ...prev,
        statisticalOverlays: {
          ...prev.statisticalOverlays,
          [key]: value,
        },
      }));
    },
    []
  );

  /**
   * Update interaction setting
   */
  const updateInteraction = useCallback(
    (key: keyof ChartConfiguration['interactions'], value: boolean) => {
      setConfig((prev) => ({
        ...prev,
        interactions: {
          ...prev.interactions,
          [key]: value,
        },
      }));
    },
    []
  );

  /**
   * Add annotation
   */
  const addAnnotation = useCallback(
    (annotation: ChartConfiguration['annotations']['items'][0]) => {
      setConfig((prev) => ({
        ...prev,
        annotations: {
          ...prev.annotations,
          items: [...prev.annotations.items, annotation],
        },
      }));
    },
    []
  );

  /**
   * Remove annotation
   */
  const removeAnnotation = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      annotations: {
        ...prev.annotations,
        items: prev.annotations.items.filter((item) => item.id !== id),
      },
    }));
  }, []);

  /**
   * Update annotation
   */
  const updateAnnotation = useCallback(
    (id: string, updates: Partial<ChartConfiguration['annotations']['items'][0]>) => {
      setConfig((prev) => ({
        ...prev,
        annotations: {
          ...prev.annotations,
          items: prev.annotations.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        },
      }));
    },
    []
  );

  /**
   * Reset configuration to defaults
   */
  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
    localStorage.removeItem('chartConfiguration');
  }, []);

  /**
   * Save configuration to server (if user is authenticated)
   */
  const saveConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/user/chart-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        console.warn('Failed to save chart configuration to server');
      }
    } catch (error) {
      console.error('Error saving chart configuration:', error);
    }
  }, [config]);

  /**
   * Load configuration from localStorage or server
   */
  const loadConfig = useCallback(async () => {
    try {
      // First try localStorage
      const stored = localStorage.getItem('chartConfiguration');
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({ ...defaultConfig, ...parsed });
      }

      // Then try to load from server (if authenticated)
      try {
        const response = await fetch('/api/user/chart-config');
        if (response.ok) {
          const serverConfig = await response.json();
          setConfig({ ...defaultConfig, ...serverConfig });
        }
      } catch (error) {
        // Server config not available, use localStorage
      }
    } catch (error) {
      console.error('Error loading chart configuration:', error);
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: ChartConfigContextValue = {
    config,
    updateConfig,
    updateStatisticalOverlay,
    updateInteraction,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    resetConfig,
    saveConfig,
    loadConfig,
  };

  return (
    <ChartConfigContext.Provider value={value}>
      {children}
    </ChartConfigContext.Provider>
  );
}

/**
 * Hook to use chart configuration
 */
export function useChartConfig() {
  const context = useContext(ChartConfigContext);
  if (!context) {
    throw new Error('useChartConfig must be used within ChartConfigProvider');
  }
  return context;
}

/**
 * Hook to use chart configuration (optional - returns null if not in provider)
 */
export function useChartConfigOptional() {
  return useContext(ChartConfigContext);
}
