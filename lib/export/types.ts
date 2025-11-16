/**
 * Export system types and interfaces
 */

export interface PNGExportOptions {
  width?: number;
  height?: number;
  dpi?: number; // 150-300
  backgroundColor?: string;
  transparent?: boolean;
  includeWatermark?: boolean;
  quality?: number; // 0-1
}

export interface SVGExportOptions {
  width?: number;
  height?: number;
  embedFonts?: boolean;
  includeCSS?: boolean;
  preserveAspectRatio?: boolean;
}

export interface CSVExportOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  includeStatistics?: boolean;
}

export interface JSONExportOptions {
  includeMetadata?: boolean;
  includeStatistics?: boolean;
  pretty?: boolean;
}

export interface EmbedOptions {
  theme?: 'light' | 'dark';
  interactive?: boolean;
  width?: string | number;
  height?: string | number;
  showTitle?: boolean;
  showLegend?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  error?: string;
  filename?: string;
}

export interface ChartExportData {
  chartId: string;
  title: string;
  type: string;
  data: any[];
  config: any;
  statistics?: any;
}
