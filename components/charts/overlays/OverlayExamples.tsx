'use client';

/**
 * Statistical Overlay Examples
 * Demonstrates usage of all overlay components
 */

import React from 'react';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { TrendLineOverlay } from './TrendLineOverlay';
import { MovingAverageOverlay, MovingAverageLegend } from './MovingAverageOverlay';
import { OutlierHighlight, OutlierSummary } from './OutlierHighlight';
import { AnnotationLayer, SignificanceMarker } from './AnnotationLayer';
import { ChartThemeProvider } from '@/lib/contexts/ChartThemeContext';
import type {
  TrendLineData,
  TrendLineConfig,
  MovingAverageData,
  MovingAverageConfig,
  OutlierData,
  OutlierConfig,
  Annotation,
  ReferenceLine,
} from '@/types';

/**
 * Example 1: Trend Line Overlay
 */
export function TrendLineExample() {
  // Sample data
  const data = [
    { x: 1, y: 10 },
    { x: 2, y: 15 },
    { x: 3, y: 13 },
    { x: 4, y: 18 },
    { x: 5, y: 22 },
    { x: 6, y: 25 },
    { x: 7, y: 28 },
    { x: 8, y: 30 },
  ];

  const trendLineData: TrendLineData = {
    slope: 2.5,
    intercept: 8,
    rSquared: 0.92,
    equation: 'y = 2.5x + 8',
    confidenceInterval: {
      upper: [11, 13.5, 16, 18.5, 21, 23.5, 26, 28.5],
      lower: [9, 11.5, 14, 16.5, 19, 21.5, 24, 26.5],
    },
  };

  const config: TrendLineConfig = {
    enabled: true,
    type: 'linear',
    showRSquared: true,
    showEquation: true,
  };

  return (
    <ChartThemeProvider>
      <div style={{ padding: '20px' }}>
        <h3>Trend Line with Confidence Interval</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" domain={[0, 9]} />
            <YAxis type="number" domain={[0, 35]} />
            <Scatter data={data} fill="#2563eb" />
            <TrendLineOverlay
              data={data.map(d => [d.x, d.y])}
              trendLineData={trendLineData}
              config={config}
              xScale={(x) => x * 50}
              yScale={(y) => 300 - y * 8}
              width={400}
              height={300}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartThemeProvider>
  );
}

/**
 * Example 2: Moving Average Overlay
 */
export function MovingAverageExample() {
  // Sample time series data
  const data = Array.from({ length: 90 }, (_, i) => ({
    day: i + 1,
    value: 100 + Math.sin(i / 10) * 20 + Math.random() * 10,
  }));

  const movingAverageData: MovingAverageData[] = [
    {
      period: 7,
      values: data.map((_, i) => {
        if (i < 6) return NaN;
        const sum = data.slice(i - 6, i + 1).reduce((acc, d) => acc + d.value, 0);
        return sum / 7;
      }),
      label: '7-day MA',
    },
    {
      period: 30,
      values: data.map((_, i) => {
        if (i < 29) return NaN;
        const sum = data.slice(i - 29, i + 1).reduce((acc, d) => acc + d.value, 0);
        return sum / 30;
      }),
      label: '30-day MA',
    },
  ];

  const config: MovingAverageConfig = {
    enabled: true,
    periods: [7, 30],
    lineStyles: ['dashed', 'dotted'],
  };

  return (
    <ChartThemeProvider>
      <div style={{ padding: '20px' }}>
        <h3>Moving Averages</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[80, 140]} />
            <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} />
            <MovingAverageOverlay
              data={movingAverageData}
              config={config}
              xScale={(x) => x * 5}
              yScale={(y) => 300 - (y - 80) * 4}
              xData={data.map(d => d.day)}
            />
          </LineChart>
        </ResponsiveContainer>
        <MovingAverageLegend data={movingAverageData} config={config} />
      </div>
    </ChartThemeProvider>
  );
}

/**
 * Example 3: Outlier Highlight
 */
export function OutlierExample() {
  const data = [
    { x: 1, y: 10 },
    { x: 2, y: 12 },
    { x: 3, y: 11 },
    { x: 4, y: 45 }, // Outlier
    { x: 5, y: 13 },
    { x: 6, y: 14 },
    { x: 7, y: 12 },
    { x: 8, y: 55 }, // Outlier
  ];

  const outlierData: OutlierData = {
    indices: [3, 7],
    values: [45, 55],
    method: 'zscore',
    zScores: [3.2, 3.8],
  };

  const config: OutlierConfig = {
    enabled: true,
    method: 'zscore',
  };

  return (
    <ChartThemeProvider>
      <div style={{ padding: '20px' }}>
        <h3>Outlier Detection</h3>
        <OutlierSummary outlierData={outlierData} config={config} />
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" domain={[0, 9]} />
            <YAxis type="number" domain={[0, 60]} />
            <Scatter data={data} fill="#2563eb" />
            <OutlierHighlight
              data={data}
              outlierData={outlierData}
              config={config}
              xScale={(x) => x * 50}
              yScale={(y) => 300 - y * 5}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartThemeProvider>
  );
}

/**
 * Example 4: Annotation Layer
 */
export function AnnotationExample() {
  const data = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    sales: 50 + Math.sin(i / 2) * 20 + Math.random() * 10,
  }));

  const annotations: Annotation[] = [
    {
      type: 'text',
      position: { x: 6, y: 70 },
      content: 'Peak Season',
      style: { color: '#10b981', fontWeight: 600 },
    },
    {
      type: 'region',
      position: { x: 5, y: 0 },
      content: '7',
      style: { backgroundColor: '#10b981', opacity: 0.1 },
    },
  ];

  const referenceLines: ReferenceLine[] = [
    {
      axis: 'y',
      value: 60,
      label: 'Target',
      color: '#ef4444',
      strokeDasharray: '5,5',
    },
  ];

  return (
    <ChartThemeProvider>
      <div style={{ padding: '20px' }}>
        <h3>Annotations and Reference Lines</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Line type="monotone" dataKey="sales" stroke="#2563eb" />
            <AnnotationLayer
              annotations={annotations}
              referenceLines={referenceLines}
              xScale={(x) => x * 40}
              yScale={(y) => 300 - y * 3}
              width={480}
              height={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartThemeProvider>
  );
}

/**
 * Example 5: Combined Overlays
 */
export function CombinedOverlaysExample() {
  const data = Array.from({ length: 30 }, (_, i) => ({
    x: i + 1,
    y: 50 + i * 2 + Math.sin(i / 3) * 10 + Math.random() * 5,
  }));

  // Add some outliers
  data[10].y = 90;
  data[20].y = 95;

  const trendLineData: TrendLineData = {
    slope: 2,
    intercept: 50,
    rSquared: 0.85,
  };

  const outlierData: OutlierData = {
    indices: [10, 20],
    values: [90, 95],
    method: 'iqr',
  };

  const referenceLines: ReferenceLine[] = [
    {
      axis: 'y',
      value: 80,
      label: 'Threshold',
      color: '#f59e0b',
    },
  ];

  return (
    <ChartThemeProvider>
      <div style={{ padding: '20px' }}>
        <h3>Combined Statistical Overlays</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" domain={[0, 31]} />
            <YAxis type="number" domain={[40, 100]} />
            <Scatter data={data} fill="#2563eb" />
            <TrendLineOverlay
              data={data.map(d => [d.x, d.y])}
              trendLineData={trendLineData}
              config={{ enabled: true, type: 'linear', showRSquared: true }}
              xScale={(x) => x * 15}
              yScale={(y) => 400 - (y - 40) * 6}
              width={450}
              height={400}
            />
            <OutlierHighlight
              data={data}
              outlierData={outlierData}
              config={{ enabled: true, method: 'iqr' }}
              xScale={(x) => x * 15}
              yScale={(y) => 400 - (y - 40) * 6}
            />
            <AnnotationLayer
              referenceLines={referenceLines}
              xScale={(x) => x * 15}
              yScale={(y) => 400 - (y - 40) * 6}
              width={450}
              height={400}
            />
            <SignificanceMarker
              x={15}
              y={80}
              significance={0.95}
              label="**"
              xScale={(x) => x * 15}
              yScale={(y) => 400 - (y - 40) * 6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartThemeProvider>
  );
}

/**
 * Main Examples Component
 */
export default function OverlayExamples() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Statistical Overlay Components</h1>
      <p>
        These components add statistical analysis and annotations to charts,
        enabling professional-grade data visualization.
      </p>

      <div style={{ marginTop: '40px' }}>
        <TrendLineExample />
      </div>

      <div style={{ marginTop: '40px' }}>
        <MovingAverageExample />
      </div>

      <div style={{ marginTop: '40px' }}>
        <OutlierExample />
      </div>

      <div style={{ marginTop: '40px' }}>
        <AnnotationExample />
      </div>

      <div style={{ marginTop: '40px' }}>
        <CombinedOverlaysExample />
      </div>
    </div>
  );
}
