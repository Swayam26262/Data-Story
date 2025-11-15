/**
 * Secure logging utility with monitoring and observability
 * Ensures sensitive data is never logged
 * Provides structured logging for better monitoring
 */

/**
 * List of sensitive field names that should never be logged
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'auth_token',
  'authorization',
  'resetPasswordToken',
  'apiKey',
  'api_key',
  'secret',
  'secretKey',
  'privateKey',
  'accessToken',
  'refreshToken',
  'sessionId',
  'creditCard',
  'ssn',
  'dataset', // Don't log raw dataset contents
  'fileContent',
  'buffer',
];

/**
 * Log levels for structured logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Structured log entry interface
 */
interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: unknown;
  userId?: string;
  requestId?: string;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Redact sensitive information from objects
 */
function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Don't log long strings that might contain sensitive data
    if (data.length > 1000) {
      return `[REDACTED: ${data.length} characters]`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  if (typeof data === 'object') {
    const redacted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      data as Record<string, unknown>
    )) {
      const lowerKey = key.toLowerCase();

      // Check if field is sensitive
      if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        redacted[key] = redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  return data;
}

/**
 * Create structured log entry
 */
function createStructuredLog(
  level: LogLevel,
  message: string,
  context?: unknown
): StructuredLog {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context ? redactSensitiveData(context) : undefined,
  };
}

function normalizeError(error: unknown): {
  message: string;
  stack?: string;
  code?: string;
} {
  if (error instanceof Error) {
    const maybeErrorWithCode = error as { code?: unknown };
    const codeValue = maybeErrorWithCode.code;

    return {
      message: error.message,
      stack: error.stack,
      code:
        typeof codeValue === 'string'
          ? codeValue
          : codeValue !== undefined
            ? String(codeValue)
            : undefined,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const maybe = error as {
      message?: unknown;
      stack?: unknown;
      code?: unknown;
    };

    const message =
      typeof maybe.message === 'string'
        ? maybe.message
        : JSON.stringify(error);

    const codeValue = maybe.code;

    return {
      message,
      stack: typeof maybe.stack === 'string' ? maybe.stack : undefined,
      code:
        typeof codeValue === 'string'
          ? codeValue
          : codeValue !== undefined
            ? String(codeValue)
            : undefined,
    };
  }

  return { message: String(error) };
}

/**
 * Output structured log
 */
function outputLog(log: StructuredLog) {
  const logString = JSON.stringify(log);

  switch (log.level) {
    case LogLevel.DEBUG:
      console.debug(logString);
      break;
    case LogLevel.INFO:
      console.log(logString);
      break;
    case LogLevel.WARN:
      console.warn(logString);
      break;
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      console.error(logString);
      break;
  }
}

/**
 * Safe logger that redacts sensitive information
 */
export const logger = {
  /**
   * Log info message with redacted sensitive data
   */
  info(message: string, context?: unknown) {
    const log = createStructuredLog(LogLevel.INFO, message, context);
    outputLog(log);
  },

  /**
   * Log error message with redacted sensitive data
   */
  error(message: string, error?: unknown, context?: unknown) {
    const log = createStructuredLog(LogLevel.ERROR, message, context);

    if (error !== undefined) {
      log.error = normalizeError(error);
    }

    outputLog(log);
  },

  /**
   * Log critical error (requires immediate attention)
   */
  critical(
    message: string,
    error?: unknown,
    context?: unknown
  ) {
    const log = createStructuredLog(LogLevel.CRITICAL, message, context);

    if (error !== undefined) {
      log.error = normalizeError(error);
    }

    outputLog(log);
  },

  /**
   * Log warning message with redacted sensitive data
   */
  warn(message: string, context?: unknown) {
    const log = createStructuredLog(LogLevel.WARN, message, context);
    outputLog(log);
  },

  /**
   * Log debug message with redacted sensitive data
   * Only logs in development environment
   */
  debug(message: string, context?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      const log = createStructuredLog(LogLevel.DEBUG, message, context);
      outputLog(log);
    }
  },

  /**
   * Log API request (redacts sensitive headers and body)
   */
  apiRequest(
    method: string,
    url: string,
    headers?: Record<string, unknown>,
    body?: unknown,
    requestId?: string
  ) {
    const log = createStructuredLog(LogLevel.INFO, 'API Request', {
      method,
      url,
      headers: headers ? redactSensitiveData(headers) : undefined,
      body: body ? redactSensitiveData(body) : undefined,
    });

    if (requestId) {
      log.requestId = requestId;
    }

    outputLog(log);
  },

  /**
   * Log API response (redacts sensitive data)
   */
  apiResponse(
    status: number,
    url: string,
    duration: number,
    data?: unknown,
    requestId?: string
  ) {
    const log = createStructuredLog(LogLevel.INFO, 'API Response', {
      status,
      url,
      data: data ? redactSensitiveData(data) : undefined,
    });

    log.duration = duration;

    if (requestId) {
      log.requestId = requestId;
    }

    outputLog(log);
  },

  /**
   * Log with custom context (for advanced use cases)
   */
  log(
    level: LogLevel,
    message: string,
    context?: unknown,
    userId?: string,
    requestId?: string
  ) {
    const log = createStructuredLog(level, message, context);

    if (userId) {
      log.userId = userId;
    }

    if (requestId) {
      log.requestId = requestId;
    }

    outputLog(log);
  },
};

/**
 * Create audit log entry for security-sensitive operations
 */
export function auditLog(
  action: string,
  userId: string,
  details?: Record<string, unknown>
) {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details: details ? redactSensitiveData(details) : undefined,
  };

  // In production, this should be sent to a secure audit logging service
  console.log('AUDIT:', auditEntry);
}

/**
 * Log security event
 */
export function securityLog(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details?: Record<string, unknown>
) {
  const securityEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details: details ? redactSensitiveData(details) : undefined,
  };

  // In production, this should trigger alerts for high/critical severity
  console.warn('SECURITY:', securityEntry);
}
