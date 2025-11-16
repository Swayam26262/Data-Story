/**
 * Professional Theme System - Unit Tests
 * Tests for theme configuration, utilities, and color functions
 */

import {
  hexToRgb,
  rgbToHex,
  interpolateColor,
  generateSequentialPalette,
  generateDivergingPalette,
  adjustBrightness,
  adjustOpacity,
  getColorFromPalette,
  generateCategoricalColors,
  meetsContrastRequirement,
  getAccessibleTextColor,
  createColorScale,
  validatePaletteAccessibility,
} from '../utils';
import { themes, defaultTheme } from '../config';

describe('Theme System - Color Utilities', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB correctly', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle hex without # prefix', () => {
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should return null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#gggggg')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex correctly', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    });
  });

  describe('interpolateColor', () => {
    it('should interpolate between two colors', () => {
      const result = interpolateColor('#000000', '#ffffff', 0.5);
      const rgb = hexToRgb(result);
      expect(rgb).toBeTruthy();
      if (rgb) {
        expect(rgb.r).toBeCloseTo(128, 0);
        expect(rgb.g).toBeCloseTo(128, 0);
        expect(rgb.b).toBeCloseTo(128, 0);
      }
    });

    it('should return start color at factor 0', () => {
      expect(interpolateColor('#ff0000', '#0000ff', 0)).toBe('#ff0000');
    });

    it('should return end color at factor 1', () => {
      expect(interpolateColor('#ff0000', '#0000ff', 1)).toBe('#0000ff');
    });
  });

  describe('generateSequentialPalette', () => {
    it('should generate correct number of colors', () => {
      const palette = generateSequentialPalette('#3b82f6', 8);
      expect(palette).toHaveLength(8);
    });

    it('should include base color', () => {
      const palette = generateSequentialPalette('#3b82f6', 8);
      expect(palette).toContain('#3b82f6');
    });
  });

  describe('generateDivergingPalette', () => {
    it('should generate correct number of colors', () => {
      const palette = generateDivergingPalette('#ef4444', '#fbbf24', '#10b981', 7);
      expect(palette).toHaveLength(7);
    });

    it('should include neutral color', () => {
      const palette = generateDivergingPalette('#ef4444', '#fbbf24', '#10b981', 7);
      expect(palette).toContain('#fbbf24');
    });
  });

  describe('adjustBrightness', () => {
    it('should brighten color', () => {
      const brighter = adjustBrightness('#808080', 50);
      const rgb = hexToRgb(brighter);
      expect(rgb).toBeTruthy();
      if (rgb) {
        expect(rgb.r).toBeGreaterThan(128);
      }
    });

    it('should darken color', () => {
      const darker = adjustBrightness('#808080', -50);
      const rgb = hexToRgb(darker);
      expect(rgb).toBeTruthy();
      if (rgb) {
        expect(rgb.r).toBeLessThan(128);
      }
    });
  });

  describe('adjustOpacity', () => {
    it('should add opacity to color', () => {
      const result = adjustOpacity('#ff0000', 0.5);
      expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });
  });

  describe('getColorFromPalette', () => {
    it('should get color by index', () => {
      const palette = ['#ff0000', '#00ff00', '#0000ff'];
      expect(getColorFromPalette(palette, 0)).toBe('#ff0000');
      expect(getColorFromPalette(palette, 1)).toBe('#00ff00');
      expect(getColorFromPalette(palette, 2)).toBe('#0000ff');
    });

    it('should wrap around for large indices', () => {
      const palette = ['#ff0000', '#00ff00', '#0000ff'];
      expect(getColorFromPalette(palette, 3)).toBe('#ff0000');
      expect(getColorFromPalette(palette, 4)).toBe('#00ff00');
    });
  });

  describe('generateCategoricalColors', () => {
    it('should return subset when count is less than base colors', () => {
      const baseColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
      const result = generateCategoricalColors(baseColors, 2);
      expect(result).toHaveLength(2);
    });

    it('should generate variations when count exceeds base colors', () => {
      const baseColors = ['#ff0000', '#00ff00', '#0000ff'];
      const result = generateCategoricalColors(baseColors, 6);
      expect(result).toHaveLength(6);
    });
  });

  describe('meetsContrastRequirement', () => {
    it('should pass for high contrast combinations', () => {
      expect(meetsContrastRequirement('#000000', '#ffffff', 'AA')).toBe(true);
      expect(meetsContrastRequirement('#ffffff', '#000000', 'AA')).toBe(true);
    });

    it('should fail for low contrast combinations', () => {
      expect(meetsContrastRequirement('#ffffff', '#fefefe', 'AA')).toBe(false);
    });
  });

  describe('getAccessibleTextColor', () => {
    it('should return white for dark backgrounds', () => {
      expect(getAccessibleTextColor('#000000')).toBe('#ffffff');
    });

    it('should return black for light backgrounds', () => {
      expect(getAccessibleTextColor('#ffffff')).toBe('#000000');
    });
  });

  describe('createColorScale', () => {
    it('should create a color scale function', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      const scale = createColorScale(colors, [0, 100]);
      
      expect(typeof scale).toBe('function');
      expect(scale(0)).toBeTruthy();
      expect(scale(50)).toBeTruthy();
      expect(scale(100)).toBeTruthy();
    });
  });

  describe('validatePaletteAccessibility', () => {
    it('should validate palette accessibility', () => {
      const result = validatePaletteAccessibility(defaultTheme.colors);
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });
});

describe('Theme System - Configuration', () => {
  describe('themes', () => {
    it('should have all required themes', () => {
      expect(themes).toHaveProperty('default');
      expect(themes).toHaveProperty('colorblindSafe');
      expect(themes).toHaveProperty('highContrast');
      expect(themes).toHaveProperty('dark');
    });

    it('should have valid theme structure', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('colors');
        expect(theme).toHaveProperty('typography');
        expect(theme).toHaveProperty('tokens');
      });
    });
  });

  describe('color palettes', () => {
    it('should have all required color types', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.colors).toHaveProperty('categorical');
        expect(theme.colors).toHaveProperty('sequential');
        expect(theme.colors).toHaveProperty('diverging');
        expect(theme.colors).toHaveProperty('semantic');
      });
    });

    it('should have correct number of categorical colors', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.colors.categorical.length).toBeGreaterThanOrEqual(6);
      });
    });

    it('should have all semantic colors', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.colors.semantic).toHaveProperty('positive');
        expect(theme.colors.semantic).toHaveProperty('negative');
        expect(theme.colors.semantic).toHaveProperty('neutral');
        expect(theme.colors.semantic).toHaveProperty('warning');
        expect(theme.colors.semantic).toHaveProperty('info');
      });
    });
  });

  describe('typography', () => {
    it('should have all typography elements', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.typography).toHaveProperty('title');
        expect(theme.typography).toHaveProperty('subtitle');
        expect(theme.typography).toHaveProperty('axisLabel');
        expect(theme.typography).toHaveProperty('dataLabel');
        expect(theme.typography).toHaveProperty('tooltip');
        expect(theme.typography).toHaveProperty('legend');
      });
    });

    it('should have valid typography values', () => {
      Object.values(themes).forEach((theme) => {
        Object.values(theme.typography).forEach((typo) => {
          expect(typo.fontSize).toBeGreaterThan(0);
          expect(typo.fontWeight).toBeGreaterThan(0);
          expect(typo.color).toBeTruthy();
        });
      });
    });
  });

  describe('design tokens', () => {
    it('should have all token categories', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.tokens).toHaveProperty('spacing');
        expect(theme.tokens).toHaveProperty('borders');
        expect(theme.tokens).toHaveProperty('animations');
        expect(theme.tokens).toHaveProperty('shadows');
      });
    });

    it('should have valid spacing values', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.tokens.spacing).toHaveProperty('chartPadding');
        expect(theme.tokens.spacing).toHaveProperty('labelMargin');
        expect(theme.tokens.spacing).toHaveProperty('legendSpacing');
      });
    });

    it('should have valid animation values', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme.tokens.animations.duration).toBeGreaterThan(0);
        expect(theme.tokens.animations.easing).toBeTruthy();
      });
    });
  });
});
