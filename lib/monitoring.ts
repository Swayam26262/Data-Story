/**
 * Monitoring and observability utilities
 * Tracks application metrics, performance, and health
 */

import { logger, LogLevel } from './logger';

/**
 * Metric types for monitoring
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer',
}

/**
 * Metric interface
 */
interface Metric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
}

/**
 * Performance timer for measuring operation duration
 */
export class PerformanceTimer {
  private startTime: number;
  private operation: string;
  private metadata?: Record<string, unknown>;

  constructor(operation: string, metadata?: Record<string, unknown>) {
    this.startTime = Date.now();
    this.operation = operation;
    this.metadata = metadata;
  }

  /**
   * End timer and log duration
   */
  end(success: boolean = true): number {
    const duration = Date.now() - this.startTime;

    logger.log(
      success ? LogLevel.INFO : LogLevel.WARN,
      `Operation completed: ${this.operation}`,
      {
        duration,
        success,
        ...this.metadata,
      }
    );

    // Record metric
    recordMetric({
      name: `operation.duration.${this.operation}`,
      type: MetricType.TIMER,
      value: duration,
      timestamp: new Date().toISOString(),
      tags: {
        success: String(success),
        operation: this.operation,
      },
    });

    return duration;
  }
}

/**
 * Record a metric
 */
export function recordMetric(metric: Metric) {
  // In production, send to monitoring service (Vercel Analytics, Datadog, etc.)
  // For now, log structured metric
  logger.debug('Metric recorded', metric);
}

/**
 * Track API endpoint performance
 */
export function trackApiPerformance(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  recordMetric({
    name: 'api.request.duration',
    type: MetricType.HISTOGRAM,
    value: duration,
    timestamp: new Date().toISOString(),
    tags: {
      endpoint,
      method,
      status: String(statusCode),
      userId: userId || 'anonymous',
    },
  });

  // Track error rate
  if (statusCode >= 400) {
    recordMetric({
      name: 'api.request.errors',
      type: MetricType.COUNTER,
      value: 1,
      timestamp: new Date().toISOString(),
      tags: {
        endpoint,
        method,
        status: String(statusCode),
      },
    });
  }
}

/**
 * Track story generation metrics
 */
export function trackStoryGeneration(
  userId: string,
  success: boolean,
  duration: number,
  datasetRows: number,
  chartsGenerated: number
) {
  recordMetric({
    name: 'story.generation.duration',
    type: MetricType.HISTOGRAM,
    value: duration,
    timestamp: new Date().toISOString(),
    tags: {
      success: String(success),
      userId,
    },
  });

  recordMetric({
    name: 'story.generation.count',
    type: MetricType.COUNTER,
    value: 1,
    timestamp: new Date().toISOString(),
    tags: {
      success: String(success),
      userId,
    },
  });

  if (success) {
    recordMetric({
      name: 'story.dataset.rows',
      type: MetricType.HISTOGRAM,
      value: datasetRows,
      timestamp: new Date().toISOString(),
      tags: { userId },
    });

    recordMetric({
      name: 'story.charts.count',
      type: MetricType.HISTOGRAM,
      value: chartsGenerated,
      timestamp: new Date().toISOString(),
      tags: { userId },
    });
  }
}

/**
 * Track user authentication events
 */
export function trackAuthEvent(
  event: 'login' | 'register' | 'logout' | 'password_reset',
  success: boolean,
  userId?: string
) {
  recordMetric({
    name: `auth.${event}`,
    type: MetricType.COUNTER,
    value: 1,
    timestamp: new Date().toISOString(),
    tags: {
      success: String(success),
      userId: userId || 'unknown',
    },
  });
}

/**
 * Track file upload metrics
 */
export function trackFileUpload(
  userId: string,
  fileSize: number,
  fileType: string,
  success: boolean,
  duration: number
) {
  recordMetric({
    name: 'file.upload.duration',
    type: MetricType.HISTOGRAM,
    value: duration,
    timestamp: new Date().toISOString(),
    tags: {
      success: String(success),
      fileType,
      userId,
    },
  });

  if (success) {
    recordMetric({
      name: 'file.upload.size',
      type: MetricType.HISTOGRAM,
      value: fileSize,
      timestamp: new Date().toISOString(),
      tags: {
        fileType,
        userId,
      },
    });
  }
}

/**
 * Track external service calls (OpenAI, Cloudinary, etc.)
 */
export function trackExternalService(
  service: string,
  operation: string,
  success: boolean,
  duration: number,
  error?: string
) {
  recordMetric({
    name: `external.${service}.duration`,
    type: MetricType.HISTOGRAM,
    value: duration,
    timestamp: new Date().toISOString(),
    tags: {
      service,
      operation,
      success: String(success),
    },
  });

  if (!success) {
    logger.error(`External service error: ${service}.${operation}`, error, {
      service,
      operation,
      duration,
    });

    recordMetric({
      name: `external.${service}.errors`,
      type: MetricType.COUNTER,
      value: 1,
      timestamp: new Date().toISOString(),
      tags: {
        service,
        operation,
      },
    });
  }
}

/**
 * Health check status
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    storage: ServiceHealth;
    pythonService: ServiceHealth;
  };
  metrics: {
    uptime: number;
    memoryUsage: number;
    cpuUsage?: number;
  };
}

/**
 * Individual service health
 */
export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  error?: string;
  lastCheck: string;
}

/**
 * Check application health
 */
export async function checkHealth(): Promise<HealthStatus> {
  const startTime = Date.now();

  // Check database
  const dbHealth = await checkDatabaseHealth();

  // Check storage (Cloudinary)
  const storageHealth = await checkStorageHealth();

  // Check Python service
  const pythonHealth = await checkPythonServiceHealth();

  // Determine overall status
  const allHealthy =
    dbHealth.status === 'up' &&
    storageHealth.status === 'up' &&
    pythonHealth.status === 'up';

  const anyDown =
    dbHealth.status === 'down' ||
    storageHealth.status === 'down' ||
    pythonHealth.status === 'down';

  const overallStatus = anyDown
    ? 'unhealthy'
    : allHealthy
      ? 'healthy'
      : 'degraded';

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth,
      storage: storageHealth,
      pythonService: pythonHealth,
    },
    metrics: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
    },
  };

  const checkDuration = Date.now() - startTime;
  logger.info('Health check completed', {
    status: overallStatus,
    duration: checkDuration,
  });

  return healthStatus;
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    const mongoose = await import('mongoose');

    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return {
        status: 'down',
        error: 'Database not connected',
        lastCheck: new Date().toISOString(),
      };
    }

    // Simple ping to check latency
    await mongoose.connection.db.admin().ping();

    const latency = Date.now() - startTime;

    return {
      status: latency < 1000 ? 'up' : 'degraded',
      latency,
      lastCheck: new Date().toISOString(),
    };
  } catch (error: unknown) {
    logger.error('Database health check failed', error);

    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Database health check failed',
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Check storage (Cloudinary) health
 */
async function checkStorageHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    // Check if Cloudinary credentials are configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return {
        status: 'down',
        error: 'Cloudinary not configured',
        lastCheck: new Date().toISOString(),
      };
    }

    // In production, you could make a lightweight API call to Cloudinary
    // For now, just check configuration
    const latency = Date.now() - startTime;

    return {
      status: 'up',
      latency,
      lastCheck: new Date().toISOString(),
    };
  } catch (error: unknown) {
    logger.error('Storage health check failed', error);

    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Storage health check failed',
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Check Python service health
 */
async function checkPythonServiceHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL;

    if (!pythonServiceUrl) {
      return {
        status: 'down',
        error: 'Python service URL not configured',
        lastCheck: new Date().toISOString(),
      };
    }

    const response = await fetch(`${pythonServiceUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'degraded',
        latency,
        error: `HTTP ${response.status}`,
        lastCheck: new Date().toISOString(),
      };
    }

    return {
      status: latency < 2000 ? 'up' : 'degraded',
      latency,
      lastCheck: new Date().toISOString(),
    };
  } catch (error: unknown) {
    logger.error('Python service health check failed', error);

    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Python service health check failed',
      lastCheck: new Date().toISOString(),
    };
  }
}
