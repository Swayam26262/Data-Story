import type { EmbedOptions, ChartExportData } from './types';

/**
 * Generate embed codes for charts
 */
export class EmbedGenerator {
  private defaultOptions: Required<EmbedOptions> = {
    theme: 'light',
    interactive: true,
    width: '100%',
    height: '400px',
    showTitle: true,
    showLegend: true,
  };

  /**
   * Generate iframe embed code for a chart
   */
  generateIframeEmbed(
    chartId: string,
    storyId: string,
    options: EmbedOptions = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const baseUrl = this.getBaseUrl();
    
    // Build query parameters
    const params = new URLSearchParams({
      theme: opts.theme,
      interactive: opts.interactive.toString(),
      showTitle: opts.showTitle.toString(),
      showLegend: opts.showLegend.toString(),
    });

    const embedUrl = `${baseUrl}/embed/chart/${storyId}/${chartId}?${params.toString()}`;

    const width = typeof opts.width === 'number' ? `${opts.width}px` : opts.width;
    const height = typeof opts.height === 'number' ? `${opts.height}px` : opts.height;

    return `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  allowfullscreen
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
></iframe>`;
  }

  /**
   * Generate script embed code (for more control)
   */
  generateScriptEmbed(
    chartId: string,
    storyId: string,
    options: EmbedOptions = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const baseUrl = this.getBaseUrl();

    const width = typeof opts.width === 'number' ? `${opts.width}px` : opts.width;
    const height = typeof opts.height === 'number' ? `${opts.height}px` : opts.height;

    return `<div id="datastory-chart-${chartId}" style="width: ${width}; height: ${height};"></div>
<script>
  (function() {
    var config = ${JSON.stringify(opts, null, 2)};
    var script = document.createElement('script');
    script.src = '${baseUrl}/embed/loader.js';
    script.onload = function() {
      DataStoryEmbed.render('datastory-chart-${chartId}', {
        storyId: '${storyId}',
        chartId: '${chartId}',
        ...config
      });
    };
    document.head.appendChild(script);
  })();
</script>`;
  }

  /**
   * Generate shareable link for a chart
   */
  generateShareableLink(
    chartId: string,
    storyId: string,
    options: EmbedOptions = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const baseUrl = this.getBaseUrl();
    
    const params = new URLSearchParams({
      theme: opts.theme,
      interactive: opts.interactive.toString(),
    });

    return `${baseUrl}/share/chart/${storyId}/${chartId}?${params.toString()}`;
  }

  /**
   * Generate embed preview HTML
   */
  generatePreviewHTML(chartData: ChartExportData, options: EmbedOptions = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${chartData.title} - DataStory Chart</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${opts.theme === 'dark' ? '#0A0A0A' : '#ffffff'};
      color: ${opts.theme === 'dark' ? '#ffffff' : '#000000'};
      padding: 20px;
    }
    .chart-container {
      max-width: 1200px;
      margin: 0 auto;
      background: ${opts.theme === 'dark' ? '#1a1a1a' : '#f9fafb'};
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .chart-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
      display: ${opts.showTitle ? 'block' : 'none'};
    }
    .chart-content {
      width: 100%;
      height: ${typeof opts.height === 'number' ? `${opts.height}px` : opts.height};
    }
    .powered-by {
      text-align: center;
      margin-top: 16px;
      font-size: 12px;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="chart-container">
    <h1 class="chart-title">${chartData.title}</h1>
    <div class="chart-content" id="chart-root"></div>
    <div class="powered-by">
      Powered by <a href="${this.getBaseUrl()}" target="_blank">DataStory</a>
    </div>
  </div>
  
  <script>
    // Chart data would be rendered here
    // This is a placeholder for the actual chart rendering logic
    const chartData = ${JSON.stringify(chartData, null, 2)};
    console.log('Chart data:', chartData);
  </script>
</body>
</html>`;
  }

  /**
   * Get base URL for the application
   */
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * Copy embed code to clipboard
   */
  async copyToClipboard(embedCode: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(embedCode);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

// Singleton instance
export const embedGenerator = new EmbedGenerator();
