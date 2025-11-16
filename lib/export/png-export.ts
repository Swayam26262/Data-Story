import html2canvas from 'html2canvas';
import type { PNGExportOptions, ExportResult } from './types';

/**
 * Enhanced PNG export with high-DPI support and customization options
 */
export class PNGExporter {
  private defaultOptions: Required<PNGExportOptions> = {
    width: 1200,
    height: 800,
    dpi: 300,
    backgroundColor: '#ffffff',
    transparent: false,
    includeWatermark: false,
    quality: 0.95,
  };

  /**
   * Export a chart element as high-quality PNG
   */
  async exportChart(
    chartElement: HTMLElement,
    options: PNGExportOptions = {}
  ): Promise<ExportResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Calculate scale factor based on DPI
      // Standard screen DPI is ~96, so scale = targetDPI / 96
      const scale = opts.dpi / 96;

      // Capture the chart with html2canvas
      const canvas = await html2canvas(chartElement, {
        scale,
        backgroundColor: opts.transparent ? null : opts.backgroundColor,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: opts.width,
        height: opts.height,
        windowWidth: opts.width,
        windowHeight: opts.height,
      });

      // Add watermark if requested (for free tier)
      if (opts.includeWatermark) {
        this.addWatermark(canvas);
      }

      // Convert to blob with specified quality
      const blob = await this.canvasToBlob(canvas, opts.quality);

      return {
        success: true,
        data: blob,
        filename: this.generateFilename('png'),
      };
    } catch (error) {
      console.error('PNG export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export PNG',
      };
    }
  }

  /**
   * Export chart as base64 data URL
   */
  async exportChartAsDataURL(
    chartElement: HTMLElement,
    options: PNGExportOptions = {}
  ): Promise<string> {
    const opts = { ...this.defaultOptions, ...options };
    const scale = opts.dpi / 96;

    const canvas = await html2canvas(chartElement, {
      scale,
      backgroundColor: opts.transparent ? null : opts.backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    if (opts.includeWatermark) {
      this.addWatermark(canvas);
    }

    return canvas.toDataURL('image/png', opts.quality);
  }

  /**
   * Add watermark to canvas (for free tier users)
   */
  private addWatermark(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const text = 'Created with DataStory';
    const fontSize = Math.max(12, canvas.height * 0.02);
    
    ctx.save();
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    const padding = 10;
    ctx.fillText(text, canvas.width - padding, canvas.height - padding);
    ctx.restore();
  }

  /**
   * Convert canvas to blob with compression
   */
  private canvasToBlob(
    canvas: HTMLCanvasElement,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/png',
        quality
      );
    });
  }

  /**
   * Generate filename with timestamp
   */
  private generateFilename(extension: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `chart-${timestamp}.${extension}`;
  }

  /**
   * Download the exported PNG
   */
  downloadPNG(blob: Blob, filename: string): void {
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
export const pngExporter = new PNGExporter();
