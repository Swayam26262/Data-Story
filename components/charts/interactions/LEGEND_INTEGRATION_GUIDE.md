# Legend Controller Integration Guide

This guide shows how to integrate the Legend Controller with existing chart components.

## Table of Contents

1. [Integration with CombinationChart](#integration-with-combinationchart)
2. [Integration with AreaChart](#integration-with-areachart)
3. [Integration with LineChart](#integration-with-linechart)
4. [Integration with BarChart](#integration-with-barchart)
5. [Integration with Multiple Charts](#integration-with-multiple-charts)
6. [Advanced Patterns](#advanced-patterns)

## Integration with CombinationChart

The CombinationChart supports multiple series with different types. Here's how to add interactive legend:

```tsx
import { CombinationChart, type CombinationSeries } from '@/components/charts/CombinationChart';
import { LegendController, InteractiveLegend } from '@/components/charts/interactions/LegendController';
import { useState } from 'react';

function CombinationChartWithLegend() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const series: CombinationSeries[] = [
    { type: 'line', dataKey: 'sales', name: 'Sales', color: '#2563eb', yAxisId: 'left' },
    { type: 'bar', dataKey: 'orders', name: 'Orders', color: '#10b981', yAxisId: 'right' },
    { type: 'area', dataKey: 'revenue', name: 'Revenue', color: '#f59e0b', yAxisId: 'left' },
  ];

  const legendItems = series.map(s => ({
    dataKey: s.dataKey,
    name: s.name,
    color: s.color,
  }));

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  // Filter visible series
  const visibleSeries = series.filter(s => !hiddenSeries.has(s.dataKey));

  return (
    <LegendController
      items={legendItems}
      onVisibilityChange={handleVisibilityChange}
    >
      {(state, handlers) => (
        <div className="space-y-4">
          <CombinationChart
            data={data}
            series={visibleSeries}
            title="Sales Performance"
            height={400}
          />
          
          <InteractiveLegend
            state={state}
            handlers={handlers}
            position="bottom"
            orientation="horizontal"
          />
        </div>
      )}
    </LegendController>
  );
}
```

## Integration with AreaChart

```tsx
import { AreaChart } from '@/components/charts/AreaChart';
import { LegendController, InteractiveLegend } from '@/components/charts/interactions/LegendController';
import { useState } from 'react';

function AreaChartWithLegend() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const series = [
    { dataKey: 'desktop', name: 'Desktop', color: '#2563eb' },
    { dataKey: 'mobile', name: 'Mobile', color: '#10b981' },
    { dataKey: 'tablet', name: 'Tablet', color: '#f59e0b' },
  ];

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  const visibleSeries = series.filter(s => !hiddenSeries.has(s.dataKey));

  return (
    <LegendController
      items={series}
      onVisibilityChange={handleVisibilityChange}
    >
      {(state, handlers) => (
        <div className="space-y-4">
          <AreaChart
            data={data}
            series={visibleSeries}
            title="Traffic by Device"
            mode="stacked"
            height={400}
          />
          
          <InteractiveLegend
            state={state}
            handlers={handlers}
            position="bottom"
          />
        </div>
      )}
    </LegendController>
  );
}
```

## Integration with LineChart

For existing LineChart components using Recharts:

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LegendController, InteractiveLegend } from '@/components/charts/interactions/LegendController';
import { useState } from 'react';

function LineChartWithLegend() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const legendItems = [
    { dataKey: 'sales', name: 'Sales', color: '#2563eb' },
    { dataKey: 'revenue', name: 'Revenue', color: '#10b981' },
    { dataKey: 'profit', name: 'Profit', color: '#f59e0b' },
  ];

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  return (
    <LegendController
      items={legendItems}
      onVisibilityChange={handleVisibilityChange}
    >
      {(state, handlers) => (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              
              {!hiddenSeries.has('sales') && (
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              )}
              {!hiddenSeries.has('revenue') && (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              )}
              {!hiddenSeries.has('profit') && (
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          
          <InteractiveLegend
            state={state}
            handlers={handlers}
            position="bottom"
          />
        </div>
      )}
    </LegendController>
  );
}
```

## Integration with BarChart

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LegendController, InteractiveLegend } from '@/components/charts/interactions/LegendController';
import { useState } from 'react';

function BarChartWithLegend() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const legendItems = [
    { dataKey: 'q1', name: 'Q1', color: '#2563eb' },
    { dataKey: 'q2', name: 'Q2', color: '#10b981' },
    { dataKey: 'q3', name: 'Q3', color: '#f59e0b' },
    { dataKey: 'q4', name: 'Q4', color: '#ef4444' },
  ];

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  return (
    <LegendController
      items={legendItems}
      onVisibilityChange={handleVisibilityChange}
    >
      {(state, handlers) => (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              
              {!hiddenSeries.has('q1') && <Bar dataKey="q1" fill="#2563eb" />}
              {!hiddenSeries.has('q2') && <Bar dataKey="q2" fill="#10b981" />}
              {!hiddenSeries.has('q3') && <Bar dataKey="q3" fill="#f59e0b" />}
              {!hiddenSeries.has('q4') && <Bar dataKey="q4" fill="#ef4444" />}
            </BarChart>
          </ResponsiveContainer>
          
          <InteractiveLegend
            state={state}
            handlers={handlers}
            position="bottom"
          />
        </div>
      )}
    </LegendController>
  );
}
```

## Integration with Multiple Charts

Synchronize legend state across multiple charts using the `syncKey` prop:

```tsx
import { LegendController, InteractiveLegend } from '@/components/charts/interactions/LegendController';
import { useState } from 'react';

function DashboardWithSyncedLegends() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const legendItems = [
    { dataKey: 'sales', name: 'Sales', color: '#2563eb' },
    { dataKey: 'revenue', name: 'Revenue', color: '#10b981' },
    { dataKey: 'profit', name: 'Profit', color: '#f59e0b' },
  ];

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  return (
    <div className="space-y-8">
      {/* First Chart */}
      <LegendController
        items={legendItems}
        onVisibilityChange={handleVisibilityChange}
        syncKey="dashboard-metrics"
      >
        {(state, handlers) => (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Monthly Trends</h3>
            <LineChart data={monthlyData} hiddenSeries={hiddenSeries} />
            <InteractiveLegend state={state} handlers={handlers} />
          </div>
        )}
      </LegendController>

      {/* Second Chart - synced with same key */}
      <LegendController
        items={legendItems}
        onVisibilityChange={handleVisibilityChange}
        syncKey="dashboard-metrics"
      >
        {(state, handlers) => (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quarterly Comparison</h3>
            <BarChart data={quarterlyData} hiddenSeries={hiddenSeries} />
            <InteractiveLegend state={state} handlers={handlers} />
          </div>
        )}
      </LegendController>

      {/* Third Chart - also synced */}
      <LegendController
        items={legendItems}
        onVisibilityChange={handleVisibilityChange}
        syncKey="dashboard-metrics"
      >
        {(state, handlers) => (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Year-over-Year</h3>
            <AreaChart data={yearlyData} hiddenSeries={hiddenSeries} />
            <InteractiveLegend state={state} handlers={handlers} />
          </div>
        )}
      </LegendController>
    </div>
  );
}
```

## Advanced Patterns

### Pattern 1: Hover Highlighting

Highlight series when hovering over legend items:

```tsx
function ChartWithHoverHighlight() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const handleVisibilityChange = (dataKey: string, visible: boolean) => {
    setHiddenSeries((prev) => {
      const updated = new Set(prev);
      if (visible) {
        updated.delete(dataKey);
      } else {
        updated.add(dataKey);
      }
      return updated;
    });
  };

  return (
    <LegendController
      items={legendItems}
      onVisibilityChange={handleVisibilityChange}
      onHoverChange={setHoveredSeries}
    >
      {(state, handlers) => (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              
              {!hiddenSeries.has('sales') && (
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={hoveredSeries === 'sales' ? 4 : 2}
                  strokeOpacity={
                    hoveredSeries === null || hoveredSeries === 'sales' ? 1 : 0.3
                  }
                />
              )}
              {/* Other lines... */}
            </LineChart>
          </ResponsiveContainer>
          
          <InteractiveLegend state={state} handlers={handlers} />
        </div>
      )}
    </LegendController>
  );
}
```

### Pattern 2: Mobile Collapsible Legend

```tsx
function MobileResponsiveChart() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  return (
    <LegendController
      items={legendItems}
      onVisibilityChange={handleVisibilityChange}
      collapsible={true}
      defaultCollapsed={false}
    >
      {(state, handlers) => (
        <div className="space-y-4">
          <MyChart hiddenSeries={hiddenSeries} />
          
          <InteractiveLegend
            state={state}
            handlers={handlers}
            collapsible={true}
            position="bottom"
          />
        </div>
      )}
    </LegendController>
  );
}
```

### Pattern 3: Custom Legend UI

Build your own legend UI using the controller:

```tsx
function CustomLegendUI() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  return (
    <LegendController
      items={legendItems}
      onVisibilityChange={handleVisibilityChange}
    >
      {(state, handlers) => (
        <div className="space-y-4">
          <MyChart hiddenSeries={hiddenSeries} />
          
          {/* Custom legend UI */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-sm">Series</h4>
              <div className="flex gap-2">
                <button
                  onClick={handlers.showAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Show All
                </button>
                <button
                  onClick={handlers.hideAll}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Hide All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {Array.from(state.items.values()).map((item) => (
                <button
                  key={item.dataKey}
                  onClick={(e) => handlers.toggleVisibility(item.dataKey, e.ctrlKey || e.metaKey)}
                  onMouseEnter={() => handlers.setHovered(item.dataKey)}
                  onMouseLeave={() => handlers.setHovered(null)}
                  className={`flex items-center gap-2 p-2 rounded transition-all ${
                    item.visible ? 'bg-white shadow-sm' : 'bg-gray-100 opacity-60'
                  } ${item.hovered ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  {!item.visible && (
                    <span className="ml-auto text-xs text-gray-400">Hidden</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </LegendController>
  );
}
```

### Pattern 4: Legend with Statistics

Show additional statistics in the legend:

```tsx
function LegendWithStats() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  // Calculate statistics for each series
  const stats = useMemo(() => {
    return legendItems.map(item => ({
      dataKey: item.dataKey,
      total: data.reduce((sum, d) => sum + (d[item.dataKey] || 0), 0),
      avg: data.reduce((sum, d) => sum + (d[item.dataKey] || 0), 0) / data.length,
    }));
  }, [data]);

  return (
    <LegendController
      items={legendItems}
      onVisibilityChange={handleVisibilityChange}
    >
      {(state, handlers) => (
        <div className="space-y-4">
          <MyChart hiddenSeries={hiddenSeries} />
          
          <div className="grid grid-cols-3 gap-4">
            {Array.from(state.items.values()).map((item) => {
              const itemStats = stats.find(s => s.dataKey === item.dataKey);
              return (
                <button
                  key={item.dataKey}
                  onClick={(e) => handlers.toggleVisibility(item.dataKey, e.ctrlKey || e.metaKey)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    item.visible
                      ? 'border-gray-300 bg-white'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-lg font-bold">
                      {itemStats?.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Avg: {itemStats?.avg.toFixed(0)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </LegendController>
  );
}
```

### Pattern 5: Vertical Legend for Side Panel

```tsx
function ChartWithSideLegend() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  return (
    <LegendController
      items={legendItems}
      onVisibilityChange={handleVisibilityChange}
    >
      {(state, handlers) => (
        <div className="flex gap-4">
          {/* Chart */}
          <div className="flex-1">
            <MyChart hiddenSeries={hiddenSeries} />
          </div>
          
          {/* Vertical Legend */}
          <div className="w-48">
            <InteractiveLegend
              state={state}
              handlers={handlers}
              position="right"
              orientation="vertical"
            />
          </div>
        </div>
      )}
    </LegendController>
  );
}
```

## Best Practices

1. **Always handle visibility state**: Maintain a `hiddenSeries` Set to track which series are hidden
2. **Use syncKey for related charts**: When multiple charts show the same metrics, use the same syncKey
3. **Enable collapsible on mobile**: For better mobile UX, enable the collapsible feature
4. **Provide hover feedback**: Use `onHoverChange` to highlight series when hovering over legend items
5. **Show control buttons**: Provide "Show All" and "Hide All" buttons for convenience
6. **Test keyboard navigation**: Ensure all legend interactions work with keyboard
7. **Consider color accessibility**: Use colorblind-safe palettes when possible

## Troubleshooting

### Issue: Legend not updating chart

**Solution**: Make sure you're properly filtering series based on the `hiddenSeries` state:

```tsx
{!hiddenSeries.has('sales') && <Line dataKey="sales" />}
```

### Issue: Synchronization not working across charts

**Solution**: Ensure all charts use the exact same `syncKey` value and that localStorage is available.

### Issue: Mobile collapse button not showing

**Solution**: The collapse button only shows on mobile (< 768px). Make sure you've set both `collapsible={true}` on the controller and the InteractiveLegend component.

## Related Documentation

- [Legend Controller README](./LEGEND_README.md) - Complete API reference
- [Legend Examples](./LegendExamples.tsx) - Working code examples
- [Tooltip Integration](./TOOLTIP_INTEGRATION_GUIDE.md) - Combine with tooltips