/**
 * Hook for lazy loading charts as they enter the viewport
 * Improves initial page load performance
 */

import { useState, useEffect, useRef } from 'react';

export interface UseLazyChartOptions {
  /**
   * Root margin for intersection observer
   * Default: '200px' (load charts 200px before they enter viewport)
   */
  rootMargin?: string;

  /**
   * Threshold for intersection observer
   * Default: 0.1 (10% of chart visible)
   */
  threshold?: number;

  /**
   * Whether to unload chart when it leaves viewport
   * Default: false
   */
  unloadOnExit?: boolean;
}

export interface UseLazyChartReturn {
  /**
   * Ref to attach to the chart container
   */
  ref: React.RefObject<HTMLDivElement | null>;

  /**
   * Whether the chart should be rendered
   */
  shouldRender: boolean;

  /**
   * Whether the chart is currently in viewport
   */
  isInView: boolean;
}

/**
 * Hook for lazy loading charts based on viewport visibility
 */
export function useLazyChart(
  options: UseLazyChartOptions = {}
): UseLazyChartReturn {
  const {
    rootMargin = '200px',
    threshold = 0.1,
    unloadOnExit = false,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);

          if (entry.isIntersecting) {
            setShouldRender(true);
          } else if (unloadOnExit) {
            setShouldRender(false);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, unloadOnExit]);

  return {
    ref,
    shouldRender,
    isInView,
  };
}

/**
 * Hook for preloading chart data
 */
export function useChartPreload(
  shouldPreload: boolean,
  preloadFn: () => Promise<void>
) {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    if (shouldPreload && !isPreloaded && !isPreloading) {
      setIsPreloading(true);
      preloadFn()
        .then(() => {
          setIsPreloaded(true);
        })
        .catch((error) => {
          console.error('Chart preload failed:', error);
        })
        .finally(() => {
          setIsPreloading(false);
        });
    }
  }, [shouldPreload, isPreloaded, isPreloading, preloadFn]);

  return { isPreloaded, isPreloading };
}
