# Export System Usage Examples

Quick reference guide for using the DataStory export system.

## Quick Start

### 1. Add Export Button to a Chart

```tsx
import ChartExportButton from '@/components/ChartExportButton';

function MyChart() {
  const chartData = {
    chartId: 'sales-chart-1',
    title: 'Monthly Sales',
    type: 'line',
    data: salesData,
    config: chartConfig,
  };

  return (
    <div data-chart-id="sales-chart-1">
      <div className="flex justify-between items-center mb-4">
        <h2>Monthly Sales</h2>
        <ChartExportButton
          chartData={chartData}
          storyId={storyId}
          userTier="professional"
        />
      </div>
      <LineChart data={salesData} config={chartConfig} />
    </div>
  );
}
```

### 2. Programmatic Export

```tsx
import { useChartExport } from '@/lib/hooks/useChartExport';
import { useRef } from 'react';

function MyChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const { exportPNG, exportSVG, exportCSV, isExporting } = useChartExport({
    chartData: {
      chartId: 'chart-1',
      title: 'Sales Data',
      type: 'line',
      data: chartData,
      config: chartConfig,
    },
    userTier: 'professional',
  });

  const handleExportPNG = async () => {
    if (chartRef.current) {
      await exportPNG(chartRef.current, {
        dpi: 300,
        width: 1200,
        height: 800,
      });
    }
  };

  return (
    <div>
      <button onClick={handleExportPNG} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export PNG'}
      </button>
      <div ref={chartRef}>
        <LineChart data={chartData} config={chartConfig} />
      </div>
    </div>
  );
}
```

### 3. Custom Export Dialog

```tsx
import { useState } from 'react';
import ChartExportDialog from '@/components/ChartExportDialog';

function MyChart() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button onClick={() => setShowExportDialog(true)}>
        Export Options
      </button>

      <div ref={chartRef} data-chart-id="chart-1">
        <LineChart data={chartData} config={chartConfig} />
      </div>

      <ChartExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        chartElement={chartRef.current}
        chartData={{
          chartId: 'chart-1',
          title: 'Sales Data',
          type: 'line',
          data: chartData,
          config: chartConfig,
        }}
        storyId={storyId}
        userTier="professional"
      />
    </>
  );
}
```

## Advanced Usage

### Export with Custom Options

```tsx
import { exportManager } from '@/lib/export';

// High-resolution PNG for print
const printExport = await exportManager.exportPNG(chartElement, {
  width: 3000,
  height: 2000,
  dpi: 300,
  backgroundColor: '#ffffff',
  transparent: false,
});

// Transparent PNG for presentations
const presentationExport = await exportManager.exportPNG(chartElement, {
  width: 1920,
  height: 1080,
  dpi: 150,
  transparent: true,
});

// SVG for web
const webExport = await exportManager.exportSVG(chartElement, {
  width: 800,
  height: 600,
  embedFonts: true,
  includeCSS: true,
});
```

### Export Data with Statistics

```tsx
import { exportManager } from '@/lib/export';

// CSV with statistics
const csvResult = exportManager.exportCSV(chartData, {
  includeHeaders: true,
  includeStatistics: true,
  delimiter: ',',
});

// JSON with full metadata
const jsonResult = exportManager.exportJSON(chartData, {
  includeMetadata: true,
  includeStatistics: true,
  pretty: true,
});

if (csvResult.success) {
  exportManager.download(csvResult.data as Blob, csvResult.filename!);
}
```

### Generate Embed Codes

```tsx
import { embedGenerator } from '@/lib/export';

// Generate iframe embed
const iframeCode = embedGenerator.generateIframeEmbed(
  chartId,
  storyId,
  {
    theme: 'dark',
    interactive: true,
    width: '100%',
    height: '500px',
    showTitle: true,
    showLegend: true,
  }
);

// Generate script embed
const scriptCode = embedGenerator.generateScriptEmbed(
  chartId,
  storyId,
  {
    theme: 'light',
    interactive: false,
  }
);

// Generate shareable link
const shareLink = embedGenerator.generateShareableLink(
  chartId,
  storyId,
  { theme: 'dark' }
);

// Copy to clipboard
await embedGenerator.copyToClipboard(iframeCode);
```

## Integration with StoryViewer

### Add Export to Story Charts

```tsx
import ChartExportButton from '@/components/ChartExportButton';

function StoryViewer({ charts, storyId, userTier }) {
  return (
    <div>
      {charts.map((chart) => (
        <div key={chart.chartId} data-chart-id={chart.chartId}>
          <div className="flex justify-between mb-4">
            <h3>{chart.title}</h3>
            <ChartExportButton
              chartData={{
                chartId: chart.chartId,
                title: chart.title,
                type: chart.type,
                data: chart.data,
                config: chart.config,
              }}
              storyId={storyId}
              userTier={userTier}
            />
          </div>
          {renderChart(chart)}
        </div>
      ))}
    </div>
  );
}
```

## Embedding Charts

### Basic Embed

```html
<!-- Light theme, interactive -->
<iframe 
  src="https://yourapp.com/embed/chart/story-123/chart-456?theme=light&interactive=true" 
  width="100%" 
  height="400px" 
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
></iframe>
```

### Dark Theme Embed

```html
<!-- Dark theme, non-interactive -->
<iframe 
  src="https://yourapp.com/embed/chart/story-123/chart-456?theme=dark&interactive=false" 
  width="800px" 
  height="600px" 
  frameborder="0"
></iframe>
```

### Responsive Embed

```html
<!-- Responsive container -->
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    src="https://yourapp.com/embed/chart/story-123/chart-456" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
  ></iframe>
</div>
```

## Error Handling

```tsx
import { useChartExport } from '@/lib/hooks/useChartExport';

function MyChart() {
  const { exportPNG, error, isExporting } = useChartExport({
    chartData,
    userTier: 'professional',
  });

  const handleExport = async () => {
    await exportPNG(chartElement);
    
    if (error) {
      // Show error to user
      alert(`Export failed: ${error}`);
    }
  };

  return (
    <div>
      <button onClick={handleExport} disabled={isExporting}>
        Export
      </button>
      {error && (
        <div className="text-red-500 mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Always Use data-chart-id

```tsx
// ✅ Good
<div data-chart-id="unique-chart-id">
  <Chart />
</div>

// ❌ Bad - export button won't find the chart
<div>
  <Chart />
</div>
```

### 2. Set Appropriate DPI

```tsx
// For web/screen display
exportPNG(element, { dpi: 150 });

// For print quality
exportPNG(element, { dpi: 300 });
```

### 3. Include Statistics in Data Exports

```tsx
// ✅ Good - includes valuable context
exportCSV(chartData, { includeStatistics: true });

// ⚠️ Less useful - just raw data
exportCSV(chartData, { includeStatistics: false });
```

### 4. Use SVG for Scalable Graphics

```tsx
// ✅ Good for logos, presentations, print
exportSVG(element, { embedFonts: true });

// Use PNG for photos or complex gradients
exportPNG(element, { dpi: 300 });
```

### 5. Test Embed Codes

```tsx
// Generate and test before sharing
const embedCode = embedGenerator.generateIframeEmbed(
  chartId,
  storyId,
  { theme: 'light' }
);

// Test in different contexts:
// - Blog posts
// - Documentation
// - Presentations
```

## Common Patterns

### Export All Charts in a Story

```tsx
async function exportAllCharts(charts: Chart[], storyId: string) {
  for (const chart of charts) {
    const element = document.querySelector(
      `[data-chart-id="${chart.chartId}"]`
    ) as HTMLElement;
    
    if (element) {
      await exportManager.exportPNG(element, {
        dpi: 300,
        includeWatermark: false,
      });
      
      // Wait a bit between exports
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
```

### Batch Data Export

```tsx
function exportAllData(charts: Chart[]) {
  charts.forEach((chart) => {
    const result = exportManager.exportCSV({
      chartId: chart.chartId,
      title: chart.title,
      type: chart.type,
      data: chart.data,
      config: chart.config,
    });
    
    if (result.success) {
      exportManager.download(result.data as Blob, result.filename!);
    }
  });
}
```

### Share Chart with Custom Theme

```tsx
function shareChart(chartId: string, storyId: string, theme: 'light' | 'dark') {
  const shareLink = embedGenerator.generateShareableLink(
    chartId,
    storyId,
    { theme }
  );
  
  // Copy to clipboard
  navigator.clipboard.writeText(shareLink);
  
  // Or open in new window
  window.open(shareLink, '_blank');
}
```

## Troubleshooting

### Chart Not Found for Export

```tsx
// Make sure the chart has data-chart-id attribute
<div data-chart-id={chart.chartId}>
  <Chart />
</div>

// And that you're using the same ID
<ChartExportButton chartData={{ chartId: chart.chartId, ... }} />
```

### Export Quality Issues

```tsx
// Increase DPI for better quality
exportPNG(element, { dpi: 300 }); // Instead of 150

// Or use SVG for perfect quality
exportSVG(element);
```

### Embed Not Loading

```tsx
// Check the API endpoint is accessible
fetch(`/api/stories/${storyId}/charts/${chartId}`)
  .then(res => res.json())
  .then(data => console.log('Chart data:', data));

// Verify the embed URL is correct
const embedUrl = `/embed/chart/${storyId}/${chartId}`;
```

## Performance Tips

1. **Debounce rapid exports**: Wait between multiple exports
2. **Use lower DPI for previews**: 150 DPI is fine for screen
3. **Cache chart elements**: Store refs to avoid repeated queries
4. **Batch data exports**: Export multiple charts' data at once
5. **Use SVG when possible**: Faster than PNG for simple charts

## Support

For issues or questions:
- Check the main README: `lib/export/README.md`
- Review type definitions: `lib/export/types.ts`
- See implementation: `lib/export/*.ts`
