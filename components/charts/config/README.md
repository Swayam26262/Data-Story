# Chart Configuration System

The Chart Configuration System provides a comprehensive UI for customizing chart appearance, behavior, and statistical overlays. User preferences are persisted both locally and on the server.

## Features

### 1. Theme Customization
- **Color Themes**: Default, Colorblind Safe, High Contrast, Dark
- **Color Palette Types**: Categorical, Sequential, Diverging
- Visual preview of color schemes

### 2. Statistical Overlays
- **Trend Line**: Linear regression with R² value
- **Moving Average**: 7, 30, and 90-day averages
- **Outlier Detection**: Highlight statistical outliers
- **Confidence Interval**: 95% confidence bands

### 3. Interactive Features
- **Zoom**: Enable zoom controls
- **Pan**: Allow panning across data
- **Brush Selection**: Select data ranges
- **Crosshair**: Show crosshair on hover
- **Enhanced Tooltips**: Display detailed statistics
- **Interactive Legend**: Click to toggle series

### 4. Annotations
- **Text Annotations**: Add custom text at specific coordinates
- **Reference Lines**: Mark important thresholds
- **Regions**: Highlight specific areas
- Per-chart or global annotations

## Usage

### Basic Setup

Wrap your application with the `ChartConfigProvider`:

```tsx
import { ChartConfigProvider } from '@/components/charts/config';

function App() {
  return (
    <ChartConfigProvider>
      {/* Your app content */}
    </ChartConfigProvider>
  );
}
```

### Adding Configuration Button

Add the configuration button to your chart or story viewer:

```tsx
import { ChartConfigButton } from '@/components/charts/config';

function ChartComponent() {
  return (
    <div>
      <ChartConfigButton chartId="my-chart" variant="icon" />
      {/* Your chart */}
    </div>
  );
}
```

### Using Configuration in Charts

Apply user configuration to your charts:

```tsx
import { useApplyChartConfig } from '@/lib/hooks/useApplyChartConfig';

function MyChart({ chartId, data, config }) {
  const { statistics, interactions, annotations } = useApplyChartConfig(
    chartId,
    config.statistics,
    config.interactions
  );

  return (
    <LineChart
      data={data}
      config={config}
      statistics={statistics}
      interactions={interactions}
    />
  );
}
```

### Accessing Configuration Directly

Use the hook to access and modify configuration:

```tsx
import { useChartConfig } from '@/components/charts/config';

function CustomComponent() {
  const {
    config,
    updateConfig,
    updateStatisticalOverlay,
    updateInteraction,
    addAnnotation,
    removeAnnotation,
  } = useChartConfig();

  // Enable trend lines
  const enableTrendLines = () => {
    updateStatisticalOverlay('trendLine', true);
  };

  // Add custom annotation
  const addCustomAnnotation = () => {
    addAnnotation({
      id: 'custom-1',
      type: 'text',
      chartId: 'my-chart',
      position: { x: '2024-01', y: 100 },
      content: 'Important milestone',
    });
  };

  return (
    <div>
      <button onClick={enableTrendLines}>Enable Trend Lines</button>
      <button onClick={addCustomAnnotation}>Add Annotation</button>
    </div>
  );
}
```

## Configuration Structure

```typescript
interface ChartConfiguration {
  // Theme settings
  theme: 'default' | 'colorblindSafe' | 'highContrast' | 'dark';
  colorPalette: 'categorical' | 'sequential' | 'diverging';
  
  // Statistical overlays
  statisticalOverlays: {
    trendLine: boolean;
    movingAverage: boolean;
    outliers: boolean;
    confidenceInterval: boolean;
  };
  
  // Interaction features
  interactions: {
    zoom: boolean;
    pan: boolean;
    brush: boolean;
    crosshair: boolean;
    tooltipEnhanced: boolean;
    legendInteractive: boolean;
  };
  
  // Annotations
  annotations: {
    enabled: boolean;
    items: Array<{
      id: string;
      type: 'text' | 'line' | 'region';
      chartId?: string;
      position: { x: number | string; y: number | string };
      content: string;
      style?: Record<string, unknown>;
    }>;
  };
  
  // Chart type preferences
  preferredChartTypes: Partial<Record<AllChartTypes, boolean>>;
}
```

## Persistence

Configuration is automatically saved in two places:

1. **LocalStorage**: Immediate persistence for offline access
2. **Server**: Synced when user is authenticated

### API Endpoints

- `GET /api/user/chart-config` - Retrieve user's configuration
- `POST /api/user/chart-config` - Save user's configuration
- `DELETE /api/user/chart-config` - Reset to defaults

## Components

### ChartConfigPanel

The main configuration panel with tabbed interface:

```tsx
<ChartConfigPanel
  isOpen={true}
  onClose={() => setIsOpen(false)}
  chartId="optional-chart-id"
/>
```

### ChartConfigButton

Button to open the configuration panel:

```tsx
// Icon variant (default)
<ChartConfigButton chartId="my-chart" />

// Button variant
<ChartConfigButton chartId="my-chart" variant="button" />
```

## Hooks

### useChartConfig

Access and modify chart configuration:

```tsx
const {
  config,
  updateConfig,
  updateStatisticalOverlay,
  updateInteraction,
  addAnnotation,
  removeAnnotation,
  updateAnnotation,
  resetConfig,
  saveConfig,
  loadConfig,
} = useChartConfig();
```

### useApplyChartConfig

Apply configuration to chart components:

```tsx
const { statistics, interactions, annotations, theme } = useApplyChartConfig(
  chartId,
  chartStatistics,
  chartInteractions
);
```

## Examples

### Example 1: Global Configuration Button

Add a settings button to your story viewer header:

```tsx
import { ChartConfigButton } from '@/components/charts/config';

function StoryHeader() {
  return (
    <div className="header">
      <h1>My Data Story</h1>
      <ChartConfigButton variant="button" />
    </div>
  );
}
```

### Example 2: Per-Chart Configuration

Add configuration to individual charts:

```tsx
function ChartCard({ chart }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{chart.title}</h3>
        <ChartConfigButton chartId={chart.chartId} />
      </div>
      <Chart {...chart} />
    </div>
  );
}
```

### Example 3: Programmatic Configuration

Set configuration programmatically:

```tsx
import { useChartConfig } from '@/components/charts/config';

function DataAnalysisTool() {
  const { updateConfig, updateStatisticalOverlay } = useChartConfig();

  const enableAdvancedAnalysis = () => {
    // Enable all statistical overlays
    updateStatisticalOverlay('trendLine', true);
    updateStatisticalOverlay('movingAverage', true);
    updateStatisticalOverlay('outliers', true);
    updateStatisticalOverlay('confidenceInterval', true);
    
    // Switch to high contrast theme
    updateConfig({ theme: 'highContrast' });
  };

  return (
    <button onClick={enableAdvancedAnalysis}>
      Enable Advanced Analysis
    </button>
  );
}
```

## Best Practices

1. **Wrap Early**: Add `ChartConfigProvider` at the root of your app or story viewer
2. **Persist Changes**: Configuration is auto-saved, but call `saveConfig()` for critical changes
3. **Chart-Specific Annotations**: Use `chartId` to scope annotations to specific charts
4. **Theme Consistency**: Apply theme at the provider level for consistent appearance
5. **Graceful Degradation**: Use `useChartConfigOptional()` for optional configuration support

## Accessibility

- All controls are keyboard accessible
- ARIA labels for screen readers
- Focus management in modal panel
- High contrast theme option
- Colorblind-safe palette option

## Performance

- Configuration changes are debounced
- LocalStorage provides instant feedback
- Server sync happens asynchronously
- Memoized configuration application

## Troubleshooting

### Configuration Not Persisting

Check that:
1. `ChartConfigProvider` is wrapping your components
2. User is authenticated for server persistence
3. LocalStorage is enabled in browser

### Theme Not Applying

Ensure:
1. `ChartThemeProvider` is also present
2. Charts are using `useChartTheme()` hook
3. Theme name is valid

### Annotations Not Showing

Verify:
1. Annotations are enabled in configuration
2. `chartId` matches if using per-chart annotations
3. Position coordinates are valid for your data

## Related Documentation

- [Theme System](../../lib/theme/README.md)
- [Chart Components](../README.md)
- [Interaction System](../interactions/README.md)
