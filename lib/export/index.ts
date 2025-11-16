/**
 * Unified export system for charts
 * Provides PNG, SVG, CSV, JSON export and embed code generation
 */

export * from './types';
export * from './png-export';
export * from './svg-export';
export * from './data-export';
export * from './embed-generator';

import { pngExporter } from './png-export';
import { svgExporter } from './svg-export';
import { dataExporter } from './data-export';
import { embedGenerator } from './embed-generator';
import type {
  PNGExportOptions,
  SVGExportOptions,
  CSVExportOptions,
  JSONExportOptions,
  EmbedOptions,
  ExportResult,
  ChartExportData,
} from './types';

/**
 * Unified export manager for all export operations
 */
export class ExportManager {
  /**
   * Export chart as PNG
   */
  async exportPNG(
    chartElement: HTMLElement,
    options?: PNGExportOptions
  ): Promise<ExportResult> {
    return pngExporter.exportChart(chartElement, options);
  }

  /**
   * Export chart as SVG
   */
  async exportSVG(
    chartElement: HTMLElement,
    options?: SVGExportOptions
  ): Promise<ExportResult> {
    return svgExporter.exportChart(chartElement, options);
  }

  /**
   * Export chart data as CSV
   */
  exportCSV(
    chartData: ChartExportData,
    options?: CSVExportOptions
  ): ExportResult {
    return dataExporter.exportToCSV(chartData, options);
  }

  /**
   * Export chart data as JSON
   */
  exportJSON(
    chartData: ChartExportData,
    options?: JSONExportOptions
  ): ExportResult {
    return dataExporter.exportToJSON(chartData, options);
  }

  /**
   * Generate iframe embed code
   */
  generateIframeEmbed(
    chartId: string,
    storyId: string,
    options?: EmbedOptions
  ): string {
    return embedGenerator.generateIframeEmbed(chartId, storyId, options);
  }

  /**
   * Generate script embed code
   */
  generateScriptEmbed(
    chartId: string,
    storyId: string,
    options?: EmbedOptions
  ): string {
    return embedGenerator.generateScriptEmbed(chartId, storyId, options);
  }

  /**
   * Generate shareable link
   */
  generateShareableLink(
    chartId: string,
    storyId: string,
    options?: EmbedOptions
  ): string {
    return embedGenerator.generateShareableLink(chartId, storyId, options);
  }

  /**
   * Download exported file
   */
  download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    return embedGenerator.copyToClipboard(text);
  }
}

// Singleton instance
export const exportManager = new ExportManager();
