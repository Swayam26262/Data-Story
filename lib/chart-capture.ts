import html2canvas from 'html2canvas';

/**
 * Capture a chart element as a base64 PNG image
 * @param chartElement - The DOM element containing the chart
 * @param scale - Scale factor for image quality (2 = 2x resolution, ~300 DPI)
 * @returns Base64 encoded PNG image
 */
export async function captureChartAsImage(
  chartElement: HTMLElement,
  scale: number = 2
): Promise<string> {
  try {
    const canvas = await html2canvas(chartElement, {
      scale,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing chart:', error);
    throw new Error('Failed to capture chart image');
  }
}

/**
 * Capture all charts in the story viewer
 * @param containerElement - The container element with all charts
 * @returns Array of base64 encoded PNG images
 */
export async function captureAllCharts(
  containerElement: HTMLElement
): Promise<string[]> {
  // Find all chart containers
  const chartElements = containerElement.querySelectorAll('[data-chart-id]');
  const chartImages: string[] = [];

  for (const chartElement of Array.from(chartElements)) {
    try {
      const image = await captureChartAsImage(chartElement as HTMLElement, 2);
      chartImages.push(image);
    } catch (error) {
      console.error('Error capturing chart:', error);
      // Add placeholder for failed chart
      chartImages.push('');
    }
  }

  return chartImages;
}
