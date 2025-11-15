/**
 * Error handling utilities for DataStory AI
 * Provides centralized error handling, categorization, and formatting
 */

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  USER_ERROR = 'USER_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * Standard error codes
 */
export enum ErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  TIER_LIMIT_EXCEEDED = 'TIER_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // User input errors (400)
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  ROW_LIMIT_EXCEEDED = 'ROW_LIMIT_EXCEEDED',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  NO_FILE = 'NO_FILE',
  
  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STORY_NOT_FOUND = 'STORY_NOT_FOUND',
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  
  // System errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  
  // External service errors (502, 503)
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  ANALYSIS_SERVICE_ERROR = 'ANALYSIS_SERVICE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Processing errors (422)
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  PARSING_FAILED = 'PARSING_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

/**
 * Application error class with additional metadata
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly category: ErrorCategory;
  public readonly statusCode: number;
  public readonly retryable: boolean;
  public readonly supportId: string;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    options: {
      category?: ErrorCategory;
      statusCode?: number;
      retryable?: boolean;
      details?: unknown;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.category = options.category || this.inferCategory(code);
    this.statusCode = options.statusCode || this.inferStatusCode(code);
    this.retryable = options.retryable ?? this.inferRetryable(code);
    this.supportId = uuidv4();
    this.details = options.details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Infer error category from error code
   */
  private inferCategory(code: ErrorCode): ErrorCategory {
    const userErrors = [
      ErrorCode.INVALID_INPUT,
      ErrorCode.INVALID_EMAIL,
      ErrorCode.INVALID_PASSWORD,
      ErrorCode.INVALID_FILE_TYPE,
      ErrorCode.FILE_TOO_LARGE,
      ErrorCode.ROW_LIMIT_EXCEEDED,
      ErrorCode.INSUFFICIENT_DATA,
      ErrorCode.NO_FILE,
      ErrorCode.TIER_LIMIT_EXCEEDED,
    ];

    const externalErrors = [
      ErrorCode.EXTERNAL_API_ERROR,
      ErrorCode.AI_SERVICE_ERROR,
      ErrorCode.ANALYSIS_SERVICE_ERROR,
      ErrorCode.SERVICE_UNAVAILABLE,
    ];

    if (userErrors.includes(code)) {
      return ErrorCategory.USER_ERROR;
    }
    if (externalErrors.includes(code)) {
      return ErrorCategory.EXTERNAL_SERVICE_ERROR;
    }
    return ErrorCategory.SYSTEM_ERROR;
  }

  /**
   * Infer HTTP status code from error code
   */
  private inferStatusCode(code: ErrorCode): number {
    const statusMap: Record<string, number> = {
      [ErrorCode.UNAUTHORIZED]: 401,
      [ErrorCode.INVALID_TOKEN]: 401,
      [ErrorCode.TOKEN_EXPIRED]: 401,
      [ErrorCode.FORBIDDEN]: 403,
      [ErrorCode.TIER_LIMIT_EXCEEDED]: 403,
      [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
      [ErrorCode.NOT_FOUND]: 404,
      [ErrorCode.USER_NOT_FOUND]: 404,
      [ErrorCode.STORY_NOT_FOUND]: 404,
      [ErrorCode.JOB_NOT_FOUND]: 404,
      [ErrorCode.INVALID_INPUT]: 400,
      [ErrorCode.INVALID_EMAIL]: 400,
      [ErrorCode.INVALID_PASSWORD]: 400,
      [ErrorCode.INVALID_FILE_TYPE]: 400,
      [ErrorCode.FILE_TOO_LARGE]: 400,
      [ErrorCode.ROW_LIMIT_EXCEEDED]: 400,
      [ErrorCode.INSUFFICIENT_DATA]: 400,
      [ErrorCode.NO_FILE]: 400,
      [ErrorCode.PROCESSING_FAILED]: 422,
      [ErrorCode.PARSING_FAILED]: 422,
      [ErrorCode.VALIDATION_FAILED]: 422,
      [ErrorCode.EXTERNAL_API_ERROR]: 502,
      [ErrorCode.AI_SERVICE_ERROR]: 502,
      [ErrorCode.ANALYSIS_SERVICE_ERROR]: 502,
      [ErrorCode.SERVICE_UNAVAILABLE]: 503,
    };

    return statusMap[code] || 500;
  }

  /**
   * Infer if error is retryable
   */
  private inferRetryable(code: ErrorCode): boolean {
    const retryableErrors = [
      ErrorCode.INTERNAL_ERROR,
      ErrorCode.DATABASE_ERROR,
      ErrorCode.STORAGE_ERROR,
      ErrorCode.EXTERNAL_API_ERROR,
      ErrorCode.AI_SERVICE_ERROR,
      ErrorCode.ANALYSIS_SERVICE_ERROR,
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.RATE_LIMIT_EXCEEDED,
    ];

    return retryableErrors.includes(code);
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        category: this.category,
        retryable: this.retryable,
        supportId: this.supportId,
        ...(this.details !== undefined ? { details: this.details } : {}),
      },
    };
  }
}

/**
 * Error response formatter
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    category?: ErrorCategory;
    retryable: boolean;
    supportId?: string;
    details?: unknown;
  };
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  // Handle AppError instances
  if (error instanceof AppError) {
    return error.toJSON();
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: error.message || 'An unexpected error occurred',
        category: ErrorCategory.SYSTEM_ERROR,
        retryable: true,
        supportId: uuidv4(),
      },
    };
  }

  // Handle unknown error types
  return {
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      category: ErrorCategory.SYSTEM_ERROR,
      retryable: true,
      supportId: uuidv4(),
    },
  };
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context: {
    userId?: string;
    endpoint?: string;
    method?: string;
    additionalInfo?: Record<string, unknown>;
  } = {}
) {
  const timestamp = new Date().toISOString();
  const errorInfo = error instanceof AppError ? error.toJSON() : formatErrorResponse(error);

  // In production, this would send to CloudWatch, Sentry, etc.
  console.error('[ERROR]', {
    timestamp,
    ...errorInfo,
    context,
    stack: error instanceof Error ? error.stack : undefined,
  });
}

/**
 * Centralized error handler for API routes
 */
export function handleApiError(
  error: unknown,
  context: {
    userId?: string;
    endpoint?: string;
    method?: string;
    additionalInfo?: Record<string, unknown>;
  } = {}
): NextResponse {
  // Log the error
  logError(error, context);

  // Format error response
  const errorResponse = formatErrorResponse(error);

  // Determine status code
  let statusCode = 500;
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  }

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Create common error instances
 */
export const Errors = {
  unauthorized: (message = 'Authentication required') =>
    new AppError(ErrorCode.UNAUTHORIZED, message),

  forbidden: (message = 'Access denied') =>
    new AppError(ErrorCode.FORBIDDEN, message),

  notFound: (resource = 'Resource', message?: string) =>
    new AppError(
      ErrorCode.NOT_FOUND,
      message || `${resource} not found`
    ),

  invalidInput: (message = 'Invalid input provided') =>
    new AppError(ErrorCode.INVALID_INPUT, message),

  tierLimitExceeded: (limit: number, resetDate: Date) =>
    new AppError(
      ErrorCode.TIER_LIMIT_EXCEEDED,
      `You've reached your monthly limit of ${limit} stories. Upgrade or wait until ${resetDate.toLocaleDateString()}.`,
      { retryable: false }
    ),

  fileTooLarge: (maxSize: string) =>
    new AppError(
      ErrorCode.FILE_TOO_LARGE,
      `File size exceeds ${maxSize} limit`,
      { retryable: false }
    ),

  invalidFileType: () =>
    new AppError(
      ErrorCode.INVALID_FILE_TYPE,
      'Please upload CSV or Excel files only (.csv, .xls, .xlsx)',
      { retryable: false }
    ),

  rowLimitExceeded: (rowCount: number, maxRows: number, tier: string) =>
    new AppError(
      ErrorCode.ROW_LIMIT_EXCEEDED,
      `Dataset contains approximately ${rowCount} rows. Your ${tier} tier supports up to ${maxRows} rows. Please upgrade or use a smaller dataset.`,
      { retryable: false }
    ),

  insufficientData: (minRows = 10) =>
    new AppError(
      ErrorCode.INSUFFICIENT_DATA,
      `Dataset must contain at least ${minRows} rows`,
      { retryable: false }
    ),

  databaseError: (message = 'Database operation failed') =>
    new AppError(ErrorCode.DATABASE_ERROR, message, {
      category: ErrorCategory.SYSTEM_ERROR,
      retryable: true,
    }),

  storageError: (message = 'Failed to upload file to storage. Please try again.') =>
    new AppError(ErrorCode.STORAGE_ERROR, message, {
      category: ErrorCategory.SYSTEM_ERROR,
      retryable: true,
    }),

  externalApiError: (service: string, message?: string) =>
    new AppError(
      ErrorCode.EXTERNAL_API_ERROR,
      message || `${service} service is currently unavailable. Please try again later.`,
      {
        category: ErrorCategory.EXTERNAL_SERVICE_ERROR,
        retryable: true,
      }
    ),

  analysisServiceError: (message = 'Analysis service failed. Please try again.') =>
    new AppError(ErrorCode.ANALYSIS_SERVICE_ERROR, message, {
      category: ErrorCategory.EXTERNAL_SERVICE_ERROR,
      retryable: true,
    }),

  processingFailed: (message = 'Failed to process your request') =>
    new AppError(ErrorCode.PROCESSING_FAILED, message, {
      retryable: true,
    }),
};
