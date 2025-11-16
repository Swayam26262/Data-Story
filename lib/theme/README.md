# Professional Theme System

A comprehensive theming system for professional data visualizations with support for multiple color palettes, typography configurations, and design tokens.

## Features

- **Multiple Color Palettes**: Default, Colorblind-Safe, High Contrast, and Dark themes
- **Categorical Colors**: For distinct categories (6+ colors)
- **Sequential Colors**: For ordered data (light to dark gradients)
- **Diverging Colors**: For data with meaningful midpoints
- **Semantic Colors**: Positive, negative, neutral, warning, and info
- **Typography System**: Consistent font sizes, weights, and line heights
- **Design Tokens**: Spacing, borders, animations, and shadows
- **Accessibility**: WCAG AA/AAA contrast checking and colorblind-safe palettes
- **Utility Functions**: Color interpolation, palette generation, and more

## Usage

### Basic Setup

Wrap your chart components with the `ChartThemeProvider`:

```tsx
import { ChartThemeProvider } from '@/lib/theme';

function App() {
  return (
    <ChartThemeProvider initialTheme="default">
      <YourChartComponents />
    </ChartThemeProvider>
  );
}
```

### Using Theme in Components

```tsx
import { useChartTheme } from '@/lib/theme';

function MyChart() {
  const { theme, getColor, getSemanticColor } = useChartTheme();

  return (
    <div>
      <h1 style={{
        fontSize: theme.typography.title.fontSize,
        fontWeight: theme.typography.title.fontWeight,
        color: theme.typography.title.color,
      }}>
        Chart Title
      </h1>
      
      {/* Use categorical colors */}
      <div style={{ backgroundColor: getColor(0) }}>Category 1</div>
      <div style={{ backgroundColor: getColor(1) }}>Category 2</div>
      
      {/* Use semantic colors */}
      <div style={{ color: getSemanticColor('positive') }}>+15%</div>
      <div style={{ color: getSemanticColor('negative') }}>-8%</div>
    </div>
  );
}
```

### Switching Themes

```tsx
import { useChartTheme } from '@/lib/theme';

function ThemeSwitcher() {
  const { themeName, setTheme } = useChartTheme();

  return (
    <select value={themeName} onChange={(e) => setTheme(e.target.value as ThemeName)}>
      <option value="default">Default</option>
      <option value="colorblindSafe">Colorblind Safe</option>
      <option value="highContrast">High Contrast</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

### Using Utility Functions

```tsx
import {
  interpolateColor,
  generateSequentialPalette,
  adjustBrightness,
  meetsContrastRequirement,
} from '@/lib/theme';

// Interpolate between two colors
const midColor = interpolateColor('#ff0000', '#0000ff', 0.5);

// Generate a sequential palette
const palette = generateSequentialPalette('#3b82f6', 8);

// Adjust brightness
const lighterBlue = adjustBrightness('#3b82f6', 20);
const darkerBlue = adjustBrightness('#3b82f6', -20);

// Check contrast
const hasGoodContrast = meetsContrastRequirement('#3b82f6', '#ffffff', 'AA');
```

## Theme Structure

### Color Palettes

Each theme includes four types of color palettes:

1. **Categorical** (6 colors): For distinct categories
2. **Sequential** (8 colors): For ordered data
3. **Diverging** (7 colors): For data with meaningful midpoint
4. **Semantic** (5 colors): positive, negative, neutral, warning, info

### Typography

Typography configuration includes:
- Title (18px, weight 600)
- Subtitle (14px, weight 500)
- Axis Label (12px, weight 400)
- Data Label (11px, weight 500)
- Tooltip (13px, weight 400)
- Legend (12px, weight 400)

### Design Tokens

Design tokens include:
- **Spacing**: Chart padding, margins, and spacing
- **Borders**: Grid lines, axis lines, and chart borders
- **Animations**: Duration, easing, delay, and stagger
- **Shadows**: Tooltip, chart, hover, and focus shadows

## Available Themes

### Default Theme
Professional color palette optimized for clarity and modern aesthetics.

### Colorblind-Safe Theme
Optimized for deuteranopia and protanopia with distinct hues.

### High Contrast Theme
Maximum contrast for better visibility and accessibility.

### Dark Theme
Optimized for dark backgrounds with adjusted colors and typography.

## Accessibility

The theme system includes built-in accessibility features:

- WCAG AA/AAA contrast checking
- Colorblind-safe palette option
- High contrast theme option
- Accessible text color calculation
- Palette validation utilities

## API Reference

### Hooks

- `useChartTheme()`: Access theme context (throws if not in provider)
- `useChartThemeOptional()`: Access theme with fallback to default

### Utility Functions

- `interpolateColor(color1, color2, factor)`: Interpolate between colors
- `generateSequentialPalette(baseColor, steps)`: Generate sequential palette
- `generateDivergingPalette(neg, neutral, pos, steps)`: Generate diverging palette
- `adjustBrightness(color, percent)`: Adjust color brightness
- `adjustOpacity(color, opacity)`: Add opacity to color
- `getColorFromPalette(palette, index)`: Get color with wrapping
- `generateCategoricalColors(baseColors, count)`: Generate categorical colors
- `meetsContrastRequirement(fg, bg, level)`: Check WCAG contrast
- `getAccessibleTextColor(backgroundColor)`: Get accessible text color
- `createColorScale(colors, domain)`: Create continuous color scale
- `validatePaletteAccessibility(palette)`: Validate palette accessibility

## Examples

See the `components/charts` directory for examples of charts using the theme system.
