import { useState } from 'react';
import { captureAllCharts } from '@/lib/chart-capture';

interface UsePDFExportOptions {
  storyId: string;
  storyTitle: string;
}

interface UsePDFExportReturn {
  isExporting: boolean;
  error: string | null;
  exportPDF: (containerElement: HTMLElement) => Promise<void>;
}

export function usePDFExport({
  storyId,
  storyTitle,
}: UsePDFExportOptions): UsePDFExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPDF = async (containerElement: HTMLElement) => {
    setIsExporting(true);
    setError(null);

    try {
      // Capture all charts as images
      console.log('Capturing charts...');
      const chartImages = await captureAllCharts(containerElement);

      // Call export API
      console.log('Generating PDF...');
      const response = await fetch(`/api/stories/${storyId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chartImages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 'Failed to generate PDF'
        );
      }

      // Get PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `datastory-${storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('PDF exported successfully');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to export PDF'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    error,
    exportPDF,
  };
}
