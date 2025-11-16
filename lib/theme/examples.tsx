'use client';

/**
 * Theme System Examples
 * Demonstrates various ways to use the professional theme system
 */

import React from 'react';
import { ChartThemeProvider, useChartTheme, type ThemeName } from '@/lib/theme';

/**
 * Example 1: Theme Switcher Component
 */
export function ThemeSwitcher() {
  const { themeName, setTheme } = useChartTheme();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-select" className="text-sm font-medium">
        Theme:
      </label>
      <select
        id="theme-select"
        value={themeName}
        onChange={(e) => setTheme(e.target.value as ThemeName)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="default">Default</option>
        <option value="colorblindSafe">Colorblind Safe</option>
        <option value="highContrast">High Contrast</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}

/**
 * Example 2: Color Palette Display
 */
export function ColorPaletteDisplay() {
  const { theme } = useChartTheme();

  return (
    <div className="space-y-6">
      {/* Categorical Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Categorical Colors</h3>
        <div className="flex gap-2">
          {theme.colors.categorical.map((color, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-lg shadow-md"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs mt-2">{color}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sequential Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Sequential Colors</h3>
        <div className="flex gap-1">
          {theme.colors.sequential.map((color, index) => (
            <div
              key={index}
              className="w-12 h-16 rounded"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Diverging Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Diverging Colors</h3>
        <div className="flex gap-1">
          {theme.colors.diverging.map((color, index) => (
            <div
              key={index}
              className="w-12 h-16 rounded"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Semantic Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Semantic Colors</h3>
        <div className="flex gap-4">
          {Object.entries(theme.colors.semantic).map(([key, color]) => (
            <div key={key} className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-lg shadow-md"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs mt-2 capitalize">{key}</span>
              <span className="text-xs text-gray-500">{color}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Typography Showcase
 */
export function TypographyShowcase() {
  const { theme } = useChartTheme();

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs text-gray-500 uppercase">Title</span>
        <h1
          style={{
            fontSize: `${theme.typography.title.fontSize}px`,
            fontWeight: theme.typography.title.fontWeight,
            lineHeight: theme.typography.title.lineHeight,
            color: theme.typography.title.color,
          }}
        >
          Chart Title Example
        </h1>
      </div>

      <div>
        <span className="text-xs text-gray-500 uppercase">Subtitle</span>
        <h2
          style={{
            fontSize: `${theme.typography.subtitle.fontSize}px`,
            fontWeight: theme.typography.subtitle.fontWeight,
            lineHeight: theme.typography.subtitle.lineHeight,
            color: theme.typography.subtitle.color,
          }}
        >
          Chart Subtitle Example
        </h2>
      </div>

      <div>
        <span className="text-xs text-gray-500 uppercase">Axis Label</span>
        <p
          style={{
            fontSize: `${theme.typography.axisLabel.fontSize}px`,
            fontWeight: theme.typography.axisLabel.fontWeight,
            color: theme.typography.axisLabel.color,
          }}
        >
          X-Axis Label
        </p>
      </div>

      <div>
        <span className="text-xs text-gray-500 uppercase">Data Label</span>
        <p
          style={{
            fontSize: `${theme.typography.dataLabel.fontSize}px`,
            fontWeight: theme.typography.dataLabel.fontWeight,
            color: theme.typography.dataLabel.color,
          }}
        >
          42.5%
        </p>
      </div>

      <div>
        <span className="text-xs text-gray-500 uppercase">Tooltip</span>
        <div
          style={{
            fontSize: `${theme.typography.tooltip.fontSize}px`,
            fontWeight: theme.typography.tooltip.fontWeight,
            lineHeight: theme.typography.tooltip.lineHeight,
            color: theme.typography.tooltip.color,
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: theme.tokens.shadows.tooltip,
            display: 'inline-block',
          }}
        >
          <strong>January 2024</strong>
          <br />
          Sales: $45,230
        </div>
      </div>

      <div>
        <span className="text-xs text-gray-500 uppercase">Legend</span>
        <p
          style={{
            fontSize: `${theme.typography.legend.fontSize}px`,
            fontWeight: theme.typography.legend.fontWeight,
            color: theme.typography.legend.color,
          }}
        >
          ● Revenue ● Expenses ● Profit
        </p>
      </div>
    </div>
  );
}

/**
 * Example 4: Using Theme Colors in Custom Components
 */
export function CustomStyledComponent() {
  const { theme, getColor, getSemanticColor } = useChartTheme();

  return (
    <div className="space-y-4">
      {/* Using categorical colors */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: getColor(index) }}
          >
            Category {index + 1}
          </div>
        ))}
      </div>

      {/* Using semantic colors */}
      <div className="space-y-2">
        <div
          className="px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: getSemanticColor('positive') }}
        >
          ✓ Success: Operation completed
        </div>
        <div
          className="px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: getSemanticColor('negative') }}
        >
          ✗ Error: Something went wrong
        </div>
        <div
          className="px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: getSemanticColor('warning') }}
        >
          ⚠ Warning: Please review
        </div>
        <div
          className="px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: getSemanticColor('info') }}
        >
          ℹ Info: Additional details
        </div>
      </div>

      {/* Using design tokens */}
      <div
        className="p-4 rounded-lg"
        style={{
          border: `${theme.tokens.borders.chartBorderWidth}px solid ${theme.tokens.borders.chartBorderColor}`,
          borderRadius: `${theme.tokens.borders.chartBorderRadius}px`,
          boxShadow: theme.tokens.shadows.chart,
        }}
      >
        <p style={{ color: theme.typography.title.color }}>
          This component uses theme design tokens for consistent styling
        </p>
      </div>
    </div>
  );
}

/**
 * Example 5: Complete Theme Demo Page
 */
export function ThemeDemoPage() {
  return (
    <ChartThemeProvider initialTheme="default">
      <div className="max-w-6xl mx-auto p-8 space-y-12">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Professional Theme System Demo</h1>
          <ThemeSwitcher />
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Color Palettes</h2>
          <ColorPaletteDisplay />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Typography</h2>
          <TypographyShowcase />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Custom Components</h2>
          <CustomStyledComponent />
        </section>
      </div>
    </ChartThemeProvider>
  );
}
