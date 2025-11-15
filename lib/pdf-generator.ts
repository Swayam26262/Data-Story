import jsPDF from 'jspdf';
import { IStory } from './models/Story';

interface PDFGenerationOptions {
  story: IStory;
  userTier: 'free' | 'professional' | 'business' | 'enterprise';
  chartImages: string[]; // Base64 encoded chart images
}

/**
 * Generate a PDF document from a story
 * @param options - PDF generation options including story data and chart images
 * @returns PDF as Buffer
 */
export async function generateStoryPDF(
  options: PDFGenerationOptions
): Promise<Buffer> {
  const { story, userTier, chartImages } = options;

  // Initialize jsPDF with A4 dimensions
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 72; // 1 inch margins
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (
    text: string,
    fontSize: number,
    fontStyle: 'normal' | 'bold' = 'normal',
    lineHeight: number = fontSize * 1.5
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);

    const lines = doc.splitTextToSize(text, contentWidth);
    
    lines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
  };

  // Helper function to add spacing
  const addSpacing = (space: number) => {
    yPosition += space;
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add chart image
  const addChartImage = (imageData: string, title: string) => {
    const imageWidth = contentWidth;
    const imageHeight = imageWidth * 0.6; // Maintain aspect ratio

    // Check if we need a new page for the chart
    if (yPosition + imageHeight + 40 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Add chart title
    addText(title, 12, 'bold', 18);
    addSpacing(10);

    try {
      // Add image at 300 DPI equivalent quality
      doc.addImage(
        imageData,
        'PNG',
        margin,
        yPosition,
        imageWidth,
        imageHeight,
        undefined,
        'FAST'
      );
      yPosition += imageHeight;
      addSpacing(20);
    } catch (error) {
      console.error('Error adding chart image:', error);
      addText('[Chart could not be rendered]', 10, 'normal', 15);
      addSpacing(20);
    }
  };

  // Title Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(story.title, contentWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 36;
  });

  addSpacing(20);

  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${new Date(story.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    margin,
    yPosition
  );
  yPosition += 15;
  doc.text(
    `Dataset: ${story.dataset.originalFilename} (${story.dataset.rowCount} rows, ${story.dataset.columnCount} columns)`,
    margin,
    yPosition
  );
  yPosition += 15;
  doc.text(
    `Processing Time: ${(story.processingTime / 1000).toFixed(1)}s`,
    margin,
    yPosition
  );

  // Reset text color
  doc.setTextColor(0, 0, 0);
  addSpacing(40);

  // Summary Section
  addText('Summary', 16, 'bold', 24);
  addSpacing(10);
  addText(story.narratives.summary, 11, 'normal', 16.5);
  addSpacing(30);

  // Add first chart if available
  if (chartImages.length > 0 && story.charts[0]) {
    addChartImage(chartImages[0], story.charts[0].title);
  }

  // Key Findings Section
  addText('Key Findings', 16, 'bold', 24);
  addSpacing(10);
  addText(story.narratives.keyFindings, 11, 'normal', 16.5);
  addSpacing(30);

  // Add second chart if available
  if (chartImages.length > 1 && story.charts[1]) {
    addChartImage(chartImages[1], story.charts[1].title);
  }

  // Recommendations Section
  addText('Recommendations', 16, 'bold', 24);
  addSpacing(10);
  addText(story.narratives.recommendations, 11, 'normal', 16.5);
  addSpacing(30);

  // Add third chart if available
  if (chartImages.length > 2 && story.charts[2]) {
    addChartImage(chartImages[2], story.charts[2].title);
  }

  // Add remaining charts if any
  if (chartImages.length > 3) {
    doc.addPage();
    yPosition = margin;
    addText('Additional Insights', 16, 'bold', 24);
    addSpacing(20);

    for (let i = 3; i < chartImages.length && i < story.charts.length; i++) {
      addChartImage(chartImages[i], story.charts[i].title);
    }
  }

  // Footer with branding for free tier
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    
    // Page number
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 40,
      { align: 'center' }
    );

    // Branding for free tier
    if (userTier === 'free') {
      doc.setFontSize(9);
      doc.text(
        'Powered by DataStory AI',
        pageWidth / 2,
        pageHeight - 25,
        { align: 'center' }
      );
    }
  }

  // Return PDF as Buffer
  const pdfArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
}

/**
 * Generate filename for PDF export
 * @param storyId - Story ID
 * @param storyTitle - Story title
 * @returns Formatted filename
 */
export function generatePDFFilename(storyId: string, storyTitle: string): string {
  const date = new Date().toISOString().split('T')[0];
  const sanitizedTitle = storyTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  return `datastory-${sanitizedTitle}-${date}.pdf`;
}
