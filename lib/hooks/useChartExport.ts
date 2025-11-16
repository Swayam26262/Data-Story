import { useState, useCallback } from 'react';
import { exportManager } from '@/lib/export';
import type {
  PNGExportOptions,
  SVGExportOptions,
  CSVExportOptions,
  JSONExportOptions,
  ChartExportData,
} from '@/lib/export/types';

interface UseChartExportOptions {
  chartData: ChartExportData;
  userTier?: 'free' | 'professional' | 'business' | 'enterprise';
}

interface UseChartExportReturn {
  isExporting: boolean;
  error: string | null;
  exportPNG: (
    chartElement: HTMLElement,
    options?: PNGExportOptions
  ) => Promise<void>;
  exportSVG: (
    chartElement: HTMLElement,
    options?: SVGExportOptions
  ) => Promise<void>;
  exportCSV: (options?: CSVExportOptions) => Promise<void>;
  exportJSON: (options?: JSONExportOptions) => Promise<void>;
}

/**
 * Hook for exporting charts in various formats
 */
export function useChartExport({
  chartData,
  userTier = 'free',
}: UseChartExportOptions): UseChartExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPNG = useCallback(
    async (chartElement: HTMLElement, options?: PNGExportOptions) => {
      setIsExporting(true);
      setError(null);

      try {
        const exportOptions: PNGExportOptions = {
          ...options,
          includeWatermark: userTier === 'free',
        };

        const result = await exportManager.exportPNG(
          chartElement,
          exportOptions
        );

        if (result.success && result.data) {
          exportManager.download(result.data as Blob, result.filename!);
        } else {
          throw new Error(result.error || 'PNG export failed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to export PNG';
        setError(errorMessage);
        console.error('PNG export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [userTier]
  );

  const exportSVG = useCallback(
    async (chartElement: HTMLElement, options?: SVGExportOptions) => {
      setIsExporting(true);
      setError(null);

      try {
        const result = await exportManager.exportSVG(chartElement, options);

        if (result.success && result.data) {
          exportManager.download(result.data as Blob, result.filename!);
        } else {
          throw new Error(result.error || 'SVG export failed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to export SVG';
        setError(errorMessage);
        console.error('SVG export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportCSV = useCallback(
    async (options?: CSVExportOptions) => {
      setIsExporting(true);
      setError(null);

      try {
        const result = exportManager.exportCSV(chartData, options);

        if (result.success && result.data) {
          exportManager.download(result.data as Blob, result.filename!);
        } else {
          throw new Error(result.error || 'CSV export failed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to export CSV';
        setError(errorMessage);
        console.error('CSV export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [chartData]
  );

  const exportJSON = useCallback(
    async (options?: JSONExportOptions) => {
      setIsExporting(true);
      setError(null);

      try {
        const result = exportManager.exportJSON(chartData, options);

        if (result.success && result.data) {
          exportManager.download(result.data as Blob, result.filename!);
        } else {
          throw new Error(result.error || 'JSON export failed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to export JSON';
        setError(errorMessage);
        console.error('JSON export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [chartData]
  );

  return {
    isExporting,
    error,
    exportPNG,
    exportSVG,
    exportCSV,
    exportJSON,
  };
}
