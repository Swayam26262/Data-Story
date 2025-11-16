# Chart Configuration Integration Guide

This guide shows how to integrate the chart configuration system into your application.

## Quick Start

### Step 1: Wrap Your App with Provider

Add the `ChartConfigProvider` at the root level of your application or story viewer:

```tsx
// app/layout.tsx or app/story/[id]/page.tsx
import { ChartConfigProvider } from '@/components/charts/config';

export default function Layout({ children }) {
  return (
    <ChartConfigProvider>
      {children}
    </ChartConfigProvider>
  );
}
```

### Step 2: Add Configuration Button

Add the configuration button to your UI (typically in the header):

```tsx
// components/StoryViewer.tsx
import { ChartConfigButton } from '@/components/charts/config';

export default function StoryViewer({ story }) {
  return (
    <div>
      <header>
        <h1>{story.title}</h1>
        <ChartConfigButton variant="button" />
      </header>
      {/* Rest of your content */}
    </div>
  );
}
```

### Step 3: Apply Configuration to Charts

Use the `useApplyChartConfig` hook in your chart rendering logic:

```tsx
// components/StoryViewer.tsx
import { useApplyChartConfig } from '@/lib/hooks/useApplyChartConfig';
import { LineChart, BarChart } from '@/components/charts';

function ChartRenderer({ chart }) {
  const { statistics, interactions } = useApplyChartConfig(
    chart.chartId,
    chart.statistics,
    chart.interactions
  );

  if (chart.type === 'line') {
    return (
      <LineChart
        data={chart.data}
        title={chart.title}
        config={chart.config}
        statistics={statistics}
        interactions={interactions}
        chartId={chart.chartId}
      />
    );
  }

  if (chart.type === 'bar') {
    return (
      <BarChart
        data={chart.data}
        title={chart.title}
        config={chart.config}
        statistics={statistics}
        interactions={interactions}
        chartId={chart.chartId}
      />
    );
  }

  // ... other chart types
}
```

## Complete StoryViewer Integration Example

Here's a complete example of integrating the configuration system into StoryViewer:

```tsx
'use client';

import { ChartConfigProvider, ChartConfigButton } from '@/components/charts/config';
import { useApplyChartConfig } from '@/lib/hooks/useApplyChartConfig';
import { LineChart, BarChart, ScatterPlot, PieChart } from '@/components/charts';

interface StoryViewerProps {
  story: {
    title: string;
    charts: Array<{
      chartId: string;
      type: string;
      title: string;
      data: any[];
      config: any;
      statistics?: any;
      interactions?: any;
    }>;
  };
}

function ChartWithConfig({ chart }: { chart: any }) {
  // Apply user configuration
  const { statistics, interactions } = useApplyChartConfig(
    chart.chartId,
    chart.statistics,
    chart.interactions
  );

  const commonProps = {
    data: chart.data,
    title: chart.title,
    config: chart.config,
    statistics,
    interactions,
    chartId: chart.chartId,
  };

  switch (chart.type) {
    case 'line':
      return <LineChart {...commonProps} />;
    case 'bar':
      return <BarChart {...commonProps} />;
    case 'scatter':
      return <ScatterPlot {...commonProps} />;
    case 'pie':
      return <PieChart {...commonProps} />;
    default:
      return <div>Unsupported chart type: {chart.type}</div>;
  }
}

export default function StoryViewer({ story }: StoryViewerProps) {
  return (
    <ChartConfigProvider>
      <div className="min-h-screen bg-background-dark">
        {/* Header with Configuration Button */}
        <header className="bg-[#0A0A0A] border-b border-white/10 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {story.title}
              </h1>
              <ChartConfigButton variant="button" />
            </div>
          </div>
        </header>

        {/* Charts */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8">
            {story.charts.map((chart) => (
              <div
                key={chart.chartId}
                className="bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-6"
              >
                <ChartWithConfig chart={chart} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartConfigProvider>
  );
}
```

## Per-Chart Configuration Button

You can also add a configuration button to individual charts:

```tsx
function ChartCard({ chart }: { chart: any }) {
  const { statistics, interactions } = useApplyChartConfig(
    chart.chartId,
    chart.statistics,
    chart.interactions
  );

  return (
    <div className="bg-[#0A0A0A] border border-secondary/50 rounded-xl p-6">
      {/* Chart Header with Config Button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{chart.title}</h3>
        <ChartConfigButton chartId={chart.chartId} variant="icon" />
      </div>

      {/* Chart */}
      <LineChart
        data={chart.data}
        title={chart.title}
        config={chart.config}
        statistics={statistics}
        interactions={interactions}
        chartId={chart.chartId}
      />
    </div>
  );
}
```

## Programmatic Configuration

You can also control configuration programmatically:

```tsx
import { useChartConfig } from '@/components/charts/config';

function AnalysisControls() {
  const {
    config,
    updateStatisticalOverlay,
    updateInteraction,
    updateConfig,
  } = useChartConfig();

  const enableFullAnalysis = () => {
    // Enable all statistical overlays
    updateStatisticalOverlay('trendLine', true);
    updateStatisticalOverlay('movingAverage', true);
    updateStatisticalOverlay('outliers', true);
    updateStatisticalOverlay('confidenceInterval', true);

    // Enable all interactions
    updateInteraction('zoom', true);
    updateInteraction('pan', true);
    updateInteraction('tooltipEnhanced', true);
  };

  const switchToHighContrast = () => {
    updateConfig({ theme: 'highContrast' });
  };

  return (
    <div className="flex gap-2">
      <button onClick={enableFullAnalysis}>
        Enable Full Analysis
      </button>
      <button onClick={switchToHighContrast}>
        High Contrast Mode
      </button>
    </div>
  );
}
```

## Adding Custom Annotations

```tsx
import { useChartConfig } from '@/components/charts/config';

function AnnotationTools({ chartId }: { chartId: string }) {
  const { addAnnotation } = useChartConfig();

  const addMilestone = () => {
    addAnnotation({
      id: `milestone-${Date.now()}`,
      type: 'text',
      chartId,
      position: { x: '2024-01', y: 1000 },
      content: 'Important Milestone',
      style: {
        color: '#10b981',
        fontSize: 12,
        fontWeight: 600,
      },
    });
  };

  const addThreshold = () => {
    addAnnotation({
      id: `threshold-${Date.now()}`,
      type: 'line',
      chartId,
      position: { x: 0, y: 500 },
      content: 'Target Threshold',
      style: {
        color: '#ef4444',
      },
    });
  };

  return (
    <div className="flex gap-2">
      <button onClick={addMilestone}>Add Milestone</button>
      <button onClick={addThreshold}>Add Threshold</button>
    </div>
  );
}
```

## Configuration Status Display

Show current configuration status to users:

```tsx
import { useChartConfig } from '@/components/charts/config';

function ConfigurationStatus() {
  const { config } = useChartConfig();

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-2">
        Active Configuration
      </h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Theme:</span>
          <span className="text-white">{config.theme}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Statistical Overlays:</span>
          <span className="text-white">
            {Object.values(config.statisticalOverlays).filter(Boolean).length} active
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Annotations:</span>
          <span className="text-white">
            {config.annotations.enabled ? config.annotations.items.length : 0}
          </span>
        </div>
      </div>
    </div>
  );
}
```

## Authentication Integration

The configuration system automatically syncs with the server when users are authenticated. Make sure to include the JWT token in API requests:

```tsx
// lib/contexts/ChartConfigContext.tsx (already implemented)

const saveConfig = async () => {
  try {
    // Get token from localStorage or your auth system
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('/api/user/chart-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      console.warn('Failed to save to server');
    }
  } catch (error) {
    console.error('Error saving configuration:', error);
  }
};
```

## Best Practices

1. **Provider Placement**: Place `ChartConfigProvider` as high as possible in your component tree
2. **Chart IDs**: Always provide unique `chartId` props to charts for annotation scoping
3. **Graceful Degradation**: Charts work without configuration - it's an enhancement
4. **Performance**: Configuration changes are memoized and debounced
5. **Accessibility**: Configuration panel is fully keyboard accessible
6. **Mobile**: Configuration panel is responsive and touch-friendly

## Troubleshooting

### Configuration Not Applying

**Problem**: Changes in configuration panel don't affect charts

**Solution**: 
- Ensure `ChartConfigProvider` wraps your components
- Verify you're using `useApplyChartConfig` hook
- Check that chart components accept `statistics` and `interactions` props

### Configuration Not Persisting

**Problem**: Configuration resets on page reload

**Solution**:
- Check browser localStorage is enabled
- For server persistence, ensure user is authenticated
- Verify JWT token is included in API requests

### Annotations Not Showing

**Problem**: Added annotations don't appear on charts

**Solution**:
- Ensure annotations are enabled in configuration
- Verify `chartId` matches if using per-chart annotations
- Check that chart components support annotation rendering

## Next Steps

1. Test the integration with your existing charts
2. Customize the configuration panel styling to match your brand
3. Add additional configuration options as needed
4. Implement analytics to track which features users prefer
5. Consider adding configuration presets for common use cases

## Support

For issues or questions:
- Check the main README: `components/charts/config/README.md`
- Review the implementation summary: `.kiro/specs/professional-data-visualization/task-18-implementation-summary.md`
- Test with the demo: `components/charts/config/ChartConfigDemo.tsx`
