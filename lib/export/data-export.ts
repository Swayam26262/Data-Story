import type {
  CSVExportOptions,
  JSONExportOptions,
  ExportResult,
  ChartExportData,
} from './types';

/**
 * Data export for CSV and JSON formats
 */
export class DataExporter {
  private defaultCSVOptions: Required<CSVExportOptions> = {
    includeHeaders: true,
    delimiter: ',',
    includeStatistics: true,
  };

  private defaultJSONOptions: Required<JSONExportOptions> = {
    includeMetadata: true,
    includeStatistics: true,
    pretty: true,
  };

  /**
   * Export chart data as CSV
   */
  exportToCSV(
    chartData: ChartExportData,
    options: CSVExportOptions = {}
  ): ExportResult {
    const opts = { ...this.defaultCSVOptions, ...options };

    try {
      const lines: string[] = [];

      // Add metadata as comments
      if (opts.includeStatistics && chartData.statistics) {
        lines.push(`# Chart: ${chartData.title}`);
        lines.push(`# Type: ${chartData.type}`);
        lines.push(`# Exported: ${new Date().toISOString()}`);
        lines.push('');
      }

      // Get all unique keys from data
      const keys = this.extractKeys(chartData.data);

      // Add headers
      if (opts.includeHeaders) {
        lines.push(keys.map((k) => this.escapeCSV(k)).join(opts.delimiter));
      }

      // Add data rows
      chartData.data.forEach((row) => {
        const values = keys.map((key) => {
          const value = row[key];
          return this.escapeCSV(this.formatValue(value));
        });
        lines.push(values.join(opts.delimiter));
      });

      // Add statistics section if requested
      if (opts.includeStatistics && chartData.statistics) {
        lines.push('');
        lines.push('# Statistics');
        lines.push(this.statisticsToCSV(chartData.statistics, opts.delimiter));
      }

      const csvString = lines.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

      return {
        success: true,
        data: blob,
        filename: this.generateFilename(chartData.title, 'csv'),
      };
    } catch (error) {
      console.error('CSV export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export CSV',
      };
    }
  }

  /**
   * Export chart data as JSON
   */
  exportToJSON(
    chartData: ChartExportData,
    options: JSONExportOptions = {}
  ): ExportResult {
    const opts = { ...this.defaultJSONOptions, ...options };

    try {
      const exportData: any = {
        data: chartData.data,
      };

      // Add metadata
      if (opts.includeMetadata) {
        exportData.metadata = {
          chartId: chartData.chartId,
          title: chartData.title,
          type: chartData.type,
          exportedAt: new Date().toISOString(),
          recordCount: chartData.data.length,
        };
      }

      // Add configuration
      if (opts.includeMetadata && chartData.config) {
        exportData.config = chartData.config;
      }

      // Add statistics
      if (opts.includeStatistics && chartData.statistics) {
        exportData.statistics = chartData.statistics;
      }

      const jsonString = opts.pretty
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData);

      const blob = new Blob([jsonString], {
        type: 'application/json;charset=utf-8;',
      });

      return {
        success: true,
        data: blob,
        filename: this.generateFilename(chartData.title, 'json'),
      };
    } catch (error) {
      console.error('JSON export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export JSON',
      };
    }
  }

  /**
   * Extract all unique keys from data array
   */
  private extractKeys(data: any[]): string[] {
    const keysSet = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => keysSet.add(key));
    });
    return Array.from(keysSet);
  }

  /**
   * Escape CSV value
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Format value for CSV
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Convert statistics object to CSV format
   */
  private statisticsToCSV(statistics: any, delimiter: string): string {
    const lines: string[] = [];

    const flattenObject = (obj: any, prefix = ''): void => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flattenObject(value, fullKey);
        } else {
          lines.push(
            `${this.escapeCSV(fullKey)}${delimiter}${this.escapeCSV(
              this.formatValue(value)
            )}`
          );
        }
      });
    };

    flattenObject(statistics);
    return lines.join('\n');
  }

  /**
   * Generate filename from chart title
   */
  private generateFilename(title: string, extension: string): string {
    const sanitized = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitized}-${timestamp}.${extension}`;
  }

  /**
   * Download the exported data
   */
  downloadData(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const dataExporter = new DataExporter();
