/**
 * Professional Theme System - Utility Functions
 * Color interpolation, palette generation, and theme helpers
 */

import type { ColorPalette } from './types';

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Interpolate between two colors
 * @param color1 - Start color (hex)
 * @param color2 - End color (hex)
 * @param factor - Interpolation factor (0-1)
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return color1;
  }

  const r = rgb1.r + factor * (rgb2.r - rgb1.r);
  const g = rgb1.g + factor * (rgb2.g - rgb1.g);
  const b = rgb1.b + factor * (rgb2.b - rgb1.b);

  return rgbToHex(r, g, b);
}

/**
 * Generate a sequential color palette from a base color
 * @param baseColor - Base color (hex)
 * @param steps - Number of colors to generate
 */
export function generateSequentialPalette(baseColor: string, steps: number = 8): string[] {
  const lightColor = '#ffffff';
  const darkColor = '#000000';
  const palette: string[] = [];

  // Generate lighter shades (first half)
  for (let i = 0; i < Math.floor(steps / 2); i++) {
    const factor = (i + 1) / (Math.floor(steps / 2) + 1);
    palette.push(interpolateColor(lightColor, baseColor, factor));
  }

  // Add base color
  palette.push(baseColor);

  // Generate darker shades (second half)
  for (let i = 0; i < Math.floor(steps / 2) - 1; i++) {
    const factor = (i + 1) / Math.floor(steps / 2);
    palette.push(interpolateColor(baseColor, darkColor, factor));
  }

  return palette;
}

/**
 * Generate a diverging color palette
 * @param negativeColor - Color for negative values (hex)
 * @param neutralColor - Color for neutral/zero values (hex)
 * @param positiveColor - Color for positive values (hex)
 * @param steps - Number of colors to generate
 */
export function generateDivergingPalette(
  negativeColor: string,
  neutralColor: string,
  positiveColor: string,
  steps: number = 7
): string[] {
  const palette: string[] = [];
  const halfSteps = Math.floor(steps / 2);

  // Generate negative side
  for (let i = 0; i < halfSteps; i++) {
    const factor = (i + 1) / (halfSteps + 1);
    palette.push(interpolateColor(negativeColor, neutralColor, factor));
  }

  // Add neutral color
  palette.push(neutralColor);

  // Generate positive side
  for (let i = 0; i < halfSteps; i++) {
    const factor = (i + 1) / (halfSteps + 1);
    palette.push(interpolateColor(neutralColor, positiveColor, factor));
  }

  return palette;
}

/**
 * Adjust color brightness
 * @param color - Color (hex)
 * @param percent - Brightness adjustment (-100 to 100)
 */
export function adjustBrightness(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const factor = 1 + percent / 100;
  const r = Math.min(255, Math.max(0, rgb.r * factor));
  const g = Math.min(255, Math.max(0, rgb.g * factor));
  const b = Math.min(255, Math.max(0, rgb.b * factor));

  return rgbToHex(r, g, b);
}

/**
 * Adjust color opacity
 * @param color - Color (hex)
 * @param opacity - Opacity (0-1)
 */
export function adjustOpacity(color: string, opacity: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Get color from palette by index (with wrapping)
 * @param palette - Color palette array
 * @param index - Index
 */
export function getColorFromPalette(palette: string[], index: number): string {
  return palette[index % palette.length];
}

/**
 * Generate categorical colors for a given count
 * @param baseColors - Base categorical colors
 * @param count - Number of colors needed
 */
export function generateCategoricalColors(baseColors: string[], count: number): string[] {
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // If we need more colors, generate variations
  const colors: string[] = [...baseColors];
  let colorIndex = 0;
  let brightnessAdjustment = 20;

  while (colors.length < count) {
    const baseColor = baseColors[colorIndex % baseColors.length];
    const adjustment = Math.floor(colorIndex / baseColors.length) % 2 === 0 
      ? brightnessAdjustment 
      : -brightnessAdjustment;
    
    colors.push(adjustBrightness(baseColor, adjustment));
    colorIndex++;

    // Increase brightness adjustment for next round
    if (colorIndex % baseColors.length === 0) {
      brightnessAdjustment += 15;
    }
  }

  return colors;
}

/**
 * Check if a color meets WCAG contrast requirements
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param level - WCAG level ('AA' or 'AAA')
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  const threshold = level === 'AAA' ? 7 : 4.5;
  return contrast >= threshold;
}

/**
 * Get accessible text color for a given background
 * @param backgroundColor - Background color (hex)
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  const white = '#ffffff';
  const black = '#000000';

  return meetsContrastRequirement(white, backgroundColor)
    ? white
    : black;
}

/**
 * Create a color scale function for continuous data
 * @param colors - Array of colors for the scale
 * @param domain - Data domain [min, max]
 */
export function createColorScale(
  colors: string[],
  domain: [number, number]
): (value: number) => string {
  return (value: number) => {
    const [min, max] = domain;
    const normalized = (value - min) / (max - min);
    const clampedValue = Math.max(0, Math.min(1, normalized));

    const segmentCount = colors.length - 1;
    const segment = Math.floor(clampedValue * segmentCount);
    const segmentStart = segment / segmentCount;
    const segmentEnd = (segment + 1) / segmentCount;
    const segmentFactor = (clampedValue - segmentStart) / (segmentEnd - segmentStart);

    const startColor = colors[Math.min(segment, colors.length - 1)];
    const endColor = colors[Math.min(segment + 1, colors.length - 1)];

    return interpolateColor(startColor, endColor, segmentFactor);
  };
}

/**
 * Validate color palette for accessibility
 * @param palette - Color palette to validate
 */
export function validatePaletteAccessibility(palette: ColorPalette): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const backgroundColor = '#ffffff';

  // Check categorical colors
  palette.categorical.forEach((color, index) => {
    if (!meetsContrastRequirement(color, backgroundColor)) {
      warnings.push(`Categorical color ${index + 1} (${color}) may not meet contrast requirements`);
    }
  });

  // Check semantic colors
  Object.entries(palette.semantic).forEach(([key, color]) => {
    if (!meetsContrastRequirement(color, backgroundColor)) {
      warnings.push(`Semantic color '${key}' (${color}) may not meet contrast requirements`);
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
