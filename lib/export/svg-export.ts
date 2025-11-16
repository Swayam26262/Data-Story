import type { SVGExportOptions, ExportResult } from './types';

/**
 * SVG export for vector-quality chart exports
 */
export class SVGExporter {
  private defaultOptions: Required<SVGExportOptions> = {
    width: 1200,
    height: 800,
    embedFonts: true,
    includeCSS: true,
    preserveAspectRatio: true,
  };

  /**
   * Export a chart element as SVG
   */
  async exportChart(
    chartElement: HTMLElement,
    options: SVGExportOptions = {}
  ): Promise<ExportResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Find SVG element within the chart
      const svgElement = chartElement.querySelector('svg');
      
      if (!svgElement) {
        throw new Error('No SVG element found in chart');
      }

      // Clone the SVG to avoid modifying the original
      const clonedSVG = svgElement.cloneNode(true) as SVGElement;

      // Set dimensions
      if (opts.width) {
        clonedSVG.setAttribute('width', opts.width.toString());
      }
      if (opts.height) {
        clonedSVG.setAttribute('height', opts.height.toString());
      }

      // Set viewBox for responsive scaling
      if (opts.preserveAspectRatio) {
        const bbox = svgElement.getBBox();
        clonedSVG.setAttribute(
          'viewBox',
          `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
        );
        clonedSVG.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }

      // Embed CSS styles
      if (opts.includeCSS) {
        this.embedStyles(clonedSVG, chartElement);
      }

      // Embed fonts
      if (opts.embedFonts) {
        await this.embedFonts(clonedSVG);
      }

      // Serialize SVG to string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSVG);

      // Add XML declaration
      svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;

      // Create blob
      const blob = new Blob([svgString], { type: 'image/svg+xml' });

      return {
        success: true,
        data: blob,
        filename: this.generateFilename('svg'),
      };
    } catch (error) {
      console.error('SVG export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export SVG',
      };
    }
  }

  /**
   * Export SVG as data URL
   */
  async exportChartAsDataURL(
    chartElement: HTMLElement,
    options: SVGExportOptions = {}
  ): Promise<string> {
    const result = await this.exportChart(chartElement, options);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to export SVG');
    }

    const blob = result.data as Blob;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Embed computed styles into SVG elements
   */
  private embedStyles(svgElement: SVGElement, sourceElement: HTMLElement): void {
    const styleElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'style'
    );

    // Collect all computed styles from the source
    const styles = this.collectStyles(sourceElement);
    styleElement.textContent = styles;

    // Insert style element at the beginning of SVG
    svgElement.insertBefore(styleElement, svgElement.firstChild);
  }

  /**
   * Collect CSS styles from element and its children
   */
  private collectStyles(element: HTMLElement): string {
    const styles: string[] = [];
    const elements = element.querySelectorAll('*');

    // Get inline styles from the document
    const styleSheets = Array.from(document.styleSheets);
    
    styleSheets.forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            // Check if rule applies to any element in our chart
            const matches = element.querySelectorAll(rule.selectorText);
            if (matches.length > 0) {
              styles.push(rule.cssText);
            }
          }
        });
      } catch (e) {
        // Skip stylesheets we can't access (CORS)
        console.warn('Could not access stylesheet:', e);
      }
    });

    // Add computed styles for SVG-specific elements
    elements.forEach((el) => {
      if (el instanceof SVGElement) {
        const computed = window.getComputedStyle(el);
        const inlineStyle = this.getRelevantStyles(computed);
        if (inlineStyle) {
          el.setAttribute('style', inlineStyle);
        }
      }
    });

    return styles.join('\n');
  }

  /**
   * Get relevant CSS properties for SVG elements
   */
  private getRelevantStyles(computed: CSSStyleDeclaration): string {
    const relevantProps = [
      'fill',
      'stroke',
      'stroke-width',
      'stroke-dasharray',
      'opacity',
      'font-family',
      'font-size',
      'font-weight',
      'text-anchor',
      'dominant-baseline',
    ];

    const styles: string[] = [];
    relevantProps.forEach((prop) => {
      const value = computed.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'normal') {
        styles.push(`${prop}: ${value}`);
      }
    });

    return styles.join('; ');
  }

  /**
   * Embed fonts as data URLs (basic implementation)
   */
  private async embedFonts(svgElement: SVGElement): Promise<void> {
    // Get all text elements
    const textElements = svgElement.querySelectorAll('text, tspan');
    const fontFamilies = new Set<string>();

    textElements.forEach((el) => {
      const computed = window.getComputedStyle(el as Element);
      const fontFamily = computed.fontFamily;
      if (fontFamily) {
        fontFamilies.add(fontFamily);
      }
    });

    // Note: Full font embedding would require loading font files
    // For now, we'll ensure font-family is set in the SVG
    // In production, you might want to use a service like Google Fonts
    // or embed base64-encoded font data

    if (fontFamilies.size > 0) {
      const styleElement = svgElement.querySelector('style') || 
        document.createElementNS('http://www.w3.org/2000/svg', 'style');
      
      const fontStyles = Array.from(fontFamilies)
        .map((font) => `* { font-family: ${font}; }`)
        .join('\n');
      
      styleElement.textContent = (styleElement.textContent || '') + '\n' + fontStyles;
      
      if (!svgElement.querySelector('style')) {
        svgElement.insertBefore(styleElement, svgElement.firstChild);
      }
    }
  }

  /**
   * Generate filename with timestamp
   */
  private generateFilename(extension: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `chart-${timestamp}.${extension}`;
  }

  /**
   * Download the exported SVG
   */
  downloadSVG(blob: Blob, filename: string): void {
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
export const svgExporter = new SVGExporter();
