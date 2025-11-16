/**
 * Chart Data Validator
 * Validates and sanitizes chart data before rendering
 */

import type { ChartData, AllChartTypes } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SanitizationOptions {
  removeNulls?: boolean;
  removeUndefined?: boolean;
  removeInvalidNumbers?: boolean;
  fillMissingValues?: boolean;
  fillStrategy?: 'zero' | 'interpolate' | 'remove';
}

/**
 * Chart Data Validator Class
 * Provides validation and sanitization for chart data
 */
export class ChartDataValidator {
  /**
   * Validate chart data for a specific chart type
   */
  static validateData(data: ChartData, chartType: AllChartTypes): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Check if data exists
    if (!data) {
      result.isValid = false;
      result.errors.push('Data is null or undefined');
      return result;
    }

    // Check if data is an array
    if (!Array.isArray(data)) {
      result.isValid = false;
      result.errors.push('Data must be an array');
      return result;
    }

    // Check if data is empty
    if (data.length === 0) {
      result.isValid = false;
      result.errors.push('Data array is empty');
      return result;
    }

    // Check for minimum data points based on chart type
    const minDataPoints = this.getMinimumDataPoints(chartType);
    if (data.length < minDataPoints) {
      result.warnings.push(
        `Chart type '${chartType}' typically requires at least ${minDataPoints} data points. Current: ${data.length}`
      );
    }

    // Validate data structure
    const structureValidation = this.validateDataStructure(data);
    result.errors.push(...structureValidation.errors);
    result.warnings.push(...structureValidation.warnings);

    // Check for missing values
    const missingValueCheck = this.checkMissingValues(data);
    if (missingValueCheck.hasMissing) {
      result.warnings.push(
        `Found ${missingValueCheck.count} missing values in data. Consider using sanitization.`
      );
    }

    // Check for invalid numbers
    const invalidNumberCheck = this.checkInvalidNumbers(data);
    if (invalidNumberCheck.hasInvalid) {
      result.warnings.push(
        `Found ${invalidNumberCheck.count} invalid numbers (NaN, Infinity) in data.`
      );
    }

    // Chart-specific validations
    const chartSpecificValidation = this.validateChartSpecific(data, chartType);
    result.errors.push(...chartSpecificValidation.errors);
    result.warnings.push(...chartSpecificValidation.warnings);
    result.suggestions.push(...chartSpecificValidation.suggestions);

    // Update isValid based on errors
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Sanitize chart data
   */
  static sanitizeData(
    data: ChartData,
    options: SanitizationOptions = {}
  ): ChartData {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const {
      removeNulls = true,
      removeUndefined = true,
      removeInvalidNumbers = true,
      fillMissingValues = false,
      fillStrategy = 'remove',
    } = options;

    let sanitized = [...data];

    // Remove null/undefined entries
    if (removeNulls || removeUndefined) {
      sanitized = sanitized.filter((item) => {
        if (removeNulls && item === null) return false;
        if (removeUndefined && item === undefined) return false;
        return true;
      });
    }

    // Clean each data point
    sanitized = sanitized.map((item) => {
      if (typeof item !== 'object' || item === null) {
        return item;
      }

      const cleaned: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(item)) {
        // Handle null/undefined
        if (value === null && removeNulls) continue;
        if (value === undefined && removeUndefined) continue;

        // Handle invalid numbers
        if (typeof value === 'number') {
          if (removeInvalidNumbers && (!isFinite(value) || isNaN(value))) {
            if (fillMissingValues) {
              cleaned[key] = fillStrategy === 'zero' ? 0 : null;
            }
            continue;
          }
        }

        cleaned[key] = value;
      }

      return cleaned;
    });

    // Handle missing values with interpolation
    if (fillMissingValues && fillStrategy === 'interpolate') {
      sanitized = this.interpolateMissingValues(sanitized);
    }

    return sanitized;
  }

  /**
   * Handle missing values with different strategies
   */
  static handleMissingValues(
    data: ChartData,
    strategy: 'remove' | 'interpolate' | 'zero' = 'remove'
  ): ChartData {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    switch (strategy) {
      case 'remove':
        return this.sanitizeData(data, { fillMissingValues: false });

      case 'zero':
        return this.sanitizeData(data, {
          fillMissingValues: true,
          fillStrategy: 'zero',
        });

      case 'interpolate':
        return this.interpolateMissingValues(data);

      default:
        return data;
    }
  }

  /**
   * Get minimum data points required for a chart type
   */
  private static getMinimumDataPoints(chartType: AllChartTypes): number {
    const minimums: Record<string, number> = {
      line: 2,
      bar: 1,
      pie: 1,
      scatter: 2,
      area: 2,
      combination: 2,
      heatmap: 4,
      boxplot: 5,
      waterfall: 2,
      funnel: 2,
      radar: 3,
      candlestick: 1,
    };

    return minimums[chartType] || 1;
  }

  /**
   * Validate data structure
   */
  private static validateDataStructure(data: ChartData): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if all items are objects
    const nonObjects = data.filter(
      (item) => typeof item !== 'object' || item === null
    );
    if (nonObjects.length > 0) {
      warnings.push(
        `Found ${nonObjects.length} non-object items in data array`
      );
    }

    // Check for consistent keys
    const keys = new Set<string>();
    data.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach((key) => keys.add(key));
      }
    });

    if (keys.size === 0) {
      errors.push('No valid keys found in data objects');
    }

    return { errors, warnings };
  }

  /**
   * Check for missing values
   */
  private static checkMissingValues(data: ChartData): {
    hasMissing: boolean;
    count: number;
  } {
    let count = 0;

    data.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.values(item).forEach((value) => {
          if (value === null || value === undefined) {
            count++;
          }
        });
      }
    });

    return { hasMissing: count > 0, count };
  }

  /**
   * Check for invalid numbers
   */
  private static checkInvalidNumbers(data: ChartData): {
    hasInvalid: boolean;
    count: number;
  } {
    let count = 0;

    data.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.values(item).forEach((value) => {
          if (typeof value === 'number' && (!isFinite(value) || isNaN(value))) {
            count++;
          }
        });
      }
    });

    return { hasInvalid: count > 0, count };
  }

  /**
   * Chart-specific validations
   */
  private static validateChartSpecific(
    data: ChartData,
    chartType: AllChartTypes
  ): {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Add chart-specific validation logic here
    switch (chartType) {
      case 'pie':
        // Pie charts should have positive values
        const hasNegative = data.some((item) =>
          Object.values(item).some(
            (val) => typeof val === 'number' && val < 0
          )
        );
        if (hasNegative) {
          warnings.push('Pie charts typically use positive values only');
        }
        break;

      case 'scatter':
        // Scatter plots need x and y coordinates
        const hasCoordinates = data.every(
          (item) =>
            typeof item === 'object' &&
            item !== null &&
            ('x' in item || 'y' in item)
        );
        if (!hasCoordinates) {
          suggestions.push(
            'Scatter plots work best with x and y coordinate fields'
          );
        }
        break;

      case 'heatmap':
        // Heatmaps need matrix-like data
        if (data.length < 4) {
          warnings.push('Heatmaps typically require more data points for effective visualization');
        }
        break;
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Interpolate missing values
   */
  private static interpolateMissingValues(data: ChartData): ChartData {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Simple linear interpolation for numeric values
    const result = [...data];

    // Get all numeric keys
    const numericKeys = new Set<string>();
    data.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([key, value]) => {
          if (typeof value === 'number') {
            numericKeys.add(key);
          }
        });
      }
    });

    // Interpolate each numeric key
    numericKeys.forEach((key) => {
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        if (typeof item !== 'object' || item === null) continue;

        const value = item[key];
        if (value === null || value === undefined || (typeof value === 'number' && !isFinite(value))) {
          // Find previous and next valid values
          let prevValue: number | null = null;
          let nextValue: number | null = null;
          let prevIndex = -1;
          let nextIndex = -1;

          // Look backwards
          for (let j = i - 1; j >= 0; j--) {
            const prevItem = result[j];
            if (typeof prevItem === 'object' && prevItem !== null) {
              const val = prevItem[key];
              if (typeof val === 'number' && isFinite(val)) {
                prevValue = val;
                prevIndex = j;
                break;
              }
            }
          }

          // Look forwards
          for (let j = i + 1; j < result.length; j++) {
            const nextItem = result[j];
            if (typeof nextItem === 'object' && nextItem !== null) {
              const val = nextItem[key];
              if (typeof val === 'number' && isFinite(val)) {
                nextValue = val;
                nextIndex = j;
                break;
              }
            }
          }

          // Interpolate
          if (prevValue !== null && nextValue !== null) {
            const ratio = (i - prevIndex) / (nextIndex - prevIndex);
            item[key] = prevValue + (nextValue - prevValue) * ratio;
          } else if (prevValue !== null) {
            item[key] = prevValue;
          } else if (nextValue !== null) {
            item[key] = nextValue;
          } else {
            item[key] = 0;
          }
        }
      }
    });

    return result;
  }
}

export default ChartDataValidator;
