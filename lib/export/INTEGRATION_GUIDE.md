# Export System Integration Guide

Step-by-step guide to integrate the export system into DataStory.

## Integration Steps

### Step 1: Add Export Button to StoryViewer

Update `components/StoryViewer.tsx` to include export buttons for each chart:

```tsx
import ChartExportButton from './ChartExportButton';

// Inside the chart rendering section, add:
<div className="flex justify-between items-center mb-4">
  <h3 className="text-xl font-bold">{chart.title}</h3>
  <ChartExportButton
    chartData={{
      chartId: chart.chartId,
      title: chart.title,
      type: chart.type,
      data: chart.data,
      config: chart.config,
      statistics: chart.statistics, // If available
    }}
    storyId={storyId}
    userTier={userTier}
  />
</div>
```

### Step 2: Ensure Charts Have data-chart-id

Make sure all chart containers have the `data-chart-id` attribute:

```tsx
<div 
  className="bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-4 sm:p-6"
  data-chart-id={chart.chartId}  // ← This is essential
>
  {renderChart(chart)}
</div>
```

### Step 3: Add Export to Chart Components

For individual chart components (LineChart, BarChart, etc.), you can add an export button in the chart header:

```tsx
// In components/charts/LineChart.tsx (or any chart component)
import ChartExportButton from '../ChartExportButton';

export default function LineChart({ data, title, config, chartId, storyId }) {
  return (
    <div data-chart-id={chartId}>
      <div className="flex justify-between items-center mb-4">
        <h3>{title}</h3>
        {chartId && storyId && (
          <ChartExportButton
            chartData={{
              chartId,
              title,
              type: 'line',
              data,
              config,
            }}
            storyId={storyId}
            userTier="professional"
          />
        )}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        {/* Chart content */}
      </ResponsiveContainer>
    </div>
  );
}
```

### Step 4: Update Chart Interfaces

Add optional export-related props to chart interfaces:

```tsx
// In types/chart.ts or similar
interface ChartProps {
  data: ChartData;
  title: string;
  config: ChartConfig;
  chartId?: string;      // ← Add these
  storyId?: string;      // ← for export
  userTier?: string;     // ← functionality
}
```

### Step 5: Add Bulk Export to Story Actions

Add a "Export All Charts" option to the story header:

```tsx
// In StoryViewer.tsx header section
<div className="flex items-center gap-4">
  {/* Existing Export PDF Button */}
  <button onClick={handleExportPDF}>Export PDF</button>
  
  {/* New: Export All Charts */}
  <button onClick={handleExportAllCharts}>
    Export All Charts
  </button>
</div>

// Implementation
const handleExportAllCharts = async () => {
  const format = await promptUserForFormat(); // PNG, SVG, CSV, JSON
  
  for (const chart of charts) {
    const element = document.querySelector(
      `[data-chart-id="${chart.chartId}"]`
    ) as HTMLElement;
    
    if (element && format === 'png') {
      await exportManager.exportPNG(element, {
        dpi: 300,
        includeWatermark: userTier === 'free',
      });
    }
    // Add delay between exports
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
```

### Step 6: Add Embed Links to Share Menu

Create a share menu with embed options:

```tsx
// New component: components/ShareMenu.tsx
import { embedGenerator } from '@/lib/export';

export default function ShareMenu({ chartId, storyId }) {
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  
  const handleCopyEmbedCode = async () => {
    const embedCode = embedGenerator.generateIframeEmbed(
      chartId,
      storyId,
      { theme: 'dark', interactive: true }
    );
    
    await embedGenerator.copyToClipboard(embedCode);
    // Show success message
  };
  
  const handleCopyShareLink = async () => {
    const shareLink = embedGenerator.generateShareableLink(
      chartId,
      storyId
    );
    
    await navigator.clipboard.writeText(shareLink);
    // Show success message
  };
  
  return (
    <div className="share-menu">
      <button onClick={handleCopyShareLink}>
        Copy Share Link
      </button>
      <button onClick={handleCopyEmbedCode}>
        Copy Embed Code
      </button>
    </div>
  );
}
```

### Step 7: Update API Routes (Already Done)

The API route for fetching individual chart data is already created:
- `app/api/stories/[storyId]/charts/[chartId]/route.ts`

And the embed page:
- `app/embed/chart/[storyId]/[chartId]/page.tsx`

### Step 8: Add Export Options to Settings

Allow users to set default export preferences:

```tsx
// In user settings or preferences
interface ExportPreferences {
  defaultFormat: 'png' | 'svg' | 'csv' | 'json';
  pngDPI: 150 | 300;
  includeStatistics: boolean;
  embedTheme: 'light' | 'dark';
}

// Save to user profile or localStorage
const saveExportPreferences = (prefs: ExportPreferences) => {
  localStorage.setItem('exportPreferences', JSON.stringify(prefs));
};

// Load and use in exports
const loadExportPreferences = (): ExportPreferences => {
  const saved = localStorage.getItem('exportPreferences');
  return saved ? JSON.parse(saved) : defaultPreferences;
};
```

## Testing Integration

### Test Checklist

- [ ] Export button appears on all charts
- [ ] PNG export works with different DPI settings
- [ ] SVG export produces valid SVG files
- [ ] CSV export includes proper headers and data
- [ ] JSON export includes metadata and statistics
- [ ] Embed codes can be copied to clipboard
- [ ] Embed page loads charts correctly
- [ ] Watermark appears for free tier users
- [ ] Export dialog shows all options
- [ ] Downloads work in all browsers

### Manual Testing

1. **Test PNG Export**
   ```
   - Click export button on a chart
   - Select PNG format
   - Adjust DPI to 300
   - Set custom dimensions
   - Export and verify file quality
   ```

2. **Test SVG Export**
   ```
   - Select SVG format
   - Enable font embedding
   - Export and open in browser
   - Verify all elements are vectorized
   ```

3. **Test Data Export**
   ```
   - Select CSV format
   - Enable statistics
   - Export and open in Excel/Sheets
   - Verify data integrity
   ```

4. **Test Embed System**
   ```
   - Generate iframe embed code
   - Copy to test HTML file
   - Open in browser
   - Verify chart renders correctly
   - Test theme switching
   ```

## Migration Guide

### From Old Export System

If you have an existing export system, here's how to migrate:

```tsx
// Old way (using chart-capture.ts)
import { captureChartAsImage } from '@/lib/chart-capture';

const image = await captureChartAsImage(chartElement, 2);
// Download manually

// New way (using export system)
import { exportManager } from '@/lib/export';

const result = await exportManager.exportPNG(chartElement, {
  dpi: 300,
  includeWatermark: userTier === 'free',
});

if (result.success) {
  exportManager.download(result.data as Blob, result.filename!);
}
```

### Updating Existing Components

```tsx
// Before
<button onClick={() => captureAndDownload()}>
  Export
</button>

// After
import ChartExportButton from '@/components/ChartExportButton';

<ChartExportButton
  chartData={chartData}
  storyId={storyId}
  userTier={userTier}
/>
```

## Performance Optimization

### Lazy Load Export Dialog

```tsx
import { lazy, Suspense } from 'react';

const ChartExportDialog = lazy(() => import('./ChartExportDialog'));

function MyChart() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChartExportDialog {...props} />
    </Suspense>
  );
}
```

### Debounce Rapid Exports

```tsx
import { debounce } from 'lodash';

const debouncedExport = debounce(async (element) => {
  await exportManager.exportPNG(element);
}, 1000);
```

### Cache Chart Elements

```tsx
const chartElementCache = new Map<string, HTMLElement>();

function getChartElement(chartId: string): HTMLElement | null {
  if (chartElementCache.has(chartId)) {
    return chartElementCache.get(chartId)!;
  }
  
  const element = document.querySelector(
    `[data-chart-id="${chartId}"]`
  ) as HTMLElement;
  
  if (element) {
    chartElementCache.set(chartId, element);
  }
  
  return element;
}
```

## Troubleshooting

### Export Button Not Working

**Problem**: Export button doesn't trigger export
**Solution**: Ensure chart has `data-chart-id` attribute

```tsx
// ✅ Correct
<div data-chart-id="chart-1">
  <Chart />
</div>

// ❌ Wrong
<div>
  <Chart />
</div>
```

### Poor Export Quality

**Problem**: Exported PNG looks blurry
**Solution**: Increase DPI setting

```tsx
// Low quality (screen only)
exportPNG(element, { dpi: 150 });

// High quality (print)
exportPNG(element, { dpi: 300 });
```

### Embed Not Loading

**Problem**: Embedded chart shows error
**Solution**: Check API endpoint and CORS settings

```tsx
// Verify API is accessible
fetch('/api/stories/story-id/charts/chart-id')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Memory Leaks

**Problem**: Browser slows down after many exports
**Solution**: Clean up object URLs

```tsx
// The export manager already does this, but if you're
// creating your own URLs:
const url = URL.createObjectURL(blob);
// ... use url ...
URL.revokeObjectURL(url); // Clean up
```

## Best Practices

1. **Always set data-chart-id**: Required for export functionality
2. **Use appropriate DPI**: 150 for web, 300 for print
3. **Include statistics**: Makes data exports more valuable
4. **Test embed codes**: Verify in different contexts
5. **Handle errors gracefully**: Show user-friendly messages
6. **Optimize for performance**: Debounce, cache, lazy load
7. **Respect user tier**: Apply watermarks for free users
8. **Provide feedback**: Show loading states and success messages

## Next Steps

1. Integrate export buttons into all chart components
2. Add bulk export functionality to StoryViewer
3. Create user preferences for export settings
4. Add export analytics tracking
5. Implement export history/logs
6. Add cloud storage integration (optional)
7. Create export templates (optional)

## Support

For questions or issues:
- Review main documentation: `lib/export/README.md`
- Check usage examples: `lib/export/USAGE_EXAMPLES.md`
- Examine type definitions: `lib/export/types.ts`
- Test with provided examples
