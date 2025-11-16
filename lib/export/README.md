# Chart Export System

A comprehensive export system for DataStory charts supporting multiple formats and embedding options.

## Features

### Export Formats

1. **PNG Export** - High-quality raster images
   - Configurable DPI (150-300)
   - Custom dimensions
   - Transparent or custom background
   - Optional watermark for free tier
   - Optimized compression

2. **SVG Export** - Vector graphics
   - Scalable without quality loss
   - Embedded fonts for consistency
   - CSS styles included
   - Custom dimensions
   - Perfect for print and web

3. **CSV Export** - Data export
   - Proper formatting and headers
   - Optional statistics inclusion
   - Configurable delimiter
   - Comments for metadata

4. **JSON Export** - Structured data
   - Complete metadata
   - Statistical calculations
   - Pretty print option
   - Easy to parse and process

5. **Embed System** - Share charts
   - iframe embedding
   - Script-based embedding
   - Customizable theme (light/dark)
   - Interactive controls
   - Responsive sizing

## Usage

### Basic Export

```typescript
import { exportManager } from '@/lib/export';

// Export as PNG
const result = await exportManager.exportPNG(chartElement, {
  width: 1200,
  height: 800,
  dpi: 300,
  transparent: false,
});

if (result.success) {
  exportManager.download(result.data, result.filename);
}
```

### Using the Hook

```typescript
import { useChartExport } from '@/lib/hooks/useChartExport';

function MyChart() {
  const { exportPNG, exportSVG, exportCSV, isExporting } = useChartExport({
    chartData: {
      chartId: 'chart-1',
      title: 'Sales Data',
      type: 'line',
      data: [...],
      config: {...},
    },
    userTier: 'professional',
  });

  return (
    <button onClick={() => exportPNG(chartElement)}>
      Export PNG
    </button>
  );
}
```

### Using the Export Dialog

```typescript
import ChartExportDialog from '@/components/ChartExportDialog';

function MyChart() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button onClick={() => setShowDialog(true)}>
        Export Options
      </button>
      
      <ChartExportDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        chartElement={chartRef.current}
        chartData={chartData}
        storyId={storyId}
        userTier="professional"
      />
    </>
  );
}
```

### Using the Export Button Component

```typescript
import ChartExportButton from '@/components/ChartExportButton';

function MyChart() {
  return (
    <div data-chart-id="chart-1">
      <ChartExportButton
        chartData={chartData}
        storyId={storyId}
        userTier="professional"
      />
      {/* Chart content */}
    </div>
  );
}
```

## Embedding Charts

### Generate Embed Code

```typescript
import { embedGenerator } from '@/lib/export';

// Generate iframe embed
const iframeCode = embedGenerator.generateIframeEmbed(
  'chart-id',
  'story-id',
  {
    theme: 'dark',
    interactive: true,
    width: '100%',
    height: '400px',
  }
);

// Generate script embed
const scriptCode = embedGenerator.generateScriptEmbed(
  'chart-id',
  'story-id',
  {
    theme: 'light',
    interactive: true,
  }
);

// Generate shareable link
const shareLink = embedGenerator.generateShareableLink(
  'chart-id',
  'story-id'
);
```

### Embed Page

Charts can be embedded using the `/embed/chart/[storyId]/[chartId]` route:

```html
<iframe 
  src="https://yourapp.com/embed/chart/story-123/chart-456?theme=dark&interactive=true" 
  width="100%" 
  height="400px" 
  frameborder="0"
></iframe>
```

## API Endpoints

### Get Chart Data

```
GET /api/stories/[storyId]/charts/[chartId]
```

Returns individual chart data for embedding or export.

**Response:**
```json
{
  "chartId": "chart-1",
  "type": "line",
  "title": "Sales Over Time",
  "data": [...],
  "config": {...},
  "statistics": {...}
}
```

## Export Options

### PNG Options

```typescript
interface PNGExportOptions {
  width?: number;          // Default: 1200
  height?: number;         // Default: 800
  dpi?: number;           // Default: 300 (150-300)
  backgroundColor?: string; // Default: '#ffffff'
  transparent?: boolean;   // Default: false
  includeWatermark?: boolean; // Auto-set for free tier
  quality?: number;        // Default: 0.95 (0-1)
}
```

### SVG Options

```typescript
interface SVGExportOptions {
  width?: number;          // Default: 1200
  height?: number;         // Default: 800
  embedFonts?: boolean;    // Default: true
  includeCSS?: boolean;    // Default: true
  preserveAspectRatio?: boolean; // Default: true
}
```

### CSV Options

```typescript
interface CSVExportOptions {
  includeHeaders?: boolean;    // Default: true
  delimiter?: string;          // Default: ','
  includeStatistics?: boolean; // Default: true
}
```

### JSON Options

```typescript
interface JSONExportOptions {
  includeMetadata?: boolean;   // Default: true
  includeStatistics?: boolean; // Default: true
  pretty?: boolean;            // Default: true
}
```

### Embed Options

```typescript
interface EmbedOptions {
  theme?: 'light' | 'dark';    // Default: 'light'
  interactive?: boolean;        // Default: true
  width?: string | number;      // Default: '100%'
  height?: string | number;     // Default: '400px'
  showTitle?: boolean;          // Default: true
  showLegend?: boolean;         // Default: true
}
```

## Architecture

```
lib/export/
├── types.ts              # TypeScript interfaces
├── png-export.ts         # PNG export implementation
├── svg-export.ts         # SVG export implementation
├── data-export.ts        # CSV/JSON export implementation
├── embed-generator.ts    # Embed code generation
├── index.ts             # Unified export manager
└── README.md            # This file

components/
├── ChartExportDialog.tsx    # Full-featured export dialog
├── ChartExportButton.tsx    # Simple export button
└── EmbeddableChartViewer.tsx # Embeddable chart component

lib/hooks/
└── useChartExport.ts    # React hook for exports

app/
├── api/stories/[storyId]/charts/[chartId]/route.ts  # Chart data API
└── embed/chart/[storyId]/[chartId]/page.tsx         # Embed page
```

## Best Practices

1. **Always use data-chart-id attribute** on chart containers for export functionality
2. **Set appropriate DPI** based on use case (150 for web, 300 for print)
3. **Include statistics** in data exports for comprehensive analysis
4. **Use SVG for print** materials and presentations
5. **Use PNG for social media** and web sharing
6. **Test embed codes** in different contexts before sharing
7. **Consider user tier** when setting watermark options

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES2020 support
- Uses html2canvas for PNG export
- Native SVG serialization
- Clipboard API for embed code copying

## Performance Considerations

- Large charts may take longer to export
- High DPI settings increase file size
- SVG export is faster than PNG
- Data exports are instant
- Consider implementing export queues for batch operations

## Future Enhancements

- [ ] PDF export for individual charts
- [ ] Batch export multiple charts
- [ ] Custom watermark text/logo
- [ ] Export templates
- [ ] Scheduled exports
- [ ] Cloud storage integration
- [ ] Export history tracking
