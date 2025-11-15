/**
 * Cloudinary monitoring and usage tracking
 * Monitors storage usage, bandwidth, and API calls
 */

import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';
import { recordMetric, MetricType } from './monitoring';

/**
 * Cloudinary usage statistics
 */
export interface CloudinaryUsage {
  storage: {
    used: number; // bytes
    limit: number; // bytes
    percentage: number;
  };
  bandwidth: {
    used: number; // bytes
    limit: number; // bytes
    percentage: number;
  };
  transformations: {
    used: number;
    limit: number;
    percentage: number;
  };
  requests: {
    total: number;
    lastMonth: number;
  };
  credits: {
    used: number;
    limit: number;
    percentage: number;
  };
}

/**
 * Get Cloudinary usage statistics
 */
export async function getCloudinaryUsage(): Promise<CloudinaryUsage | null> {
  try {
    // Get usage data from Cloudinary API
    const usage = await cloudinary.api.usage();

    const usageStats: CloudinaryUsage = {
      storage: {
        used: usage.storage?.usage || 0,
        limit: usage.storage?.limit || 0,
        percentage: calculatePercentage(
          usage.storage?.usage || 0,
          usage.storage?.limit || 0
        ),
      },
      bandwidth: {
        used: usage.bandwidth?.usage || 0,
        limit: usage.bandwidth?.limit || 0,
        percentage: calculatePercentage(
          usage.bandwidth?.usage || 0,
          usage.bandwidth?.limit || 0
        ),
      },
      transformations: {
        used: usage.transformations?.usage || 0,
        limit: usage.transformations?.limit || 0,
        percentage: calculatePercentage(
          usage.transformations?.usage || 0,
          usage.transformations?.limit || 0
        ),
      },
      requests: {
        total: usage.requests || 0,
        lastMonth: usage.last_month_requests || 0,
      },
      credits: {
        used: usage.credits?.usage || 0,
        limit: usage.credits?.limit || 0,
        percentage: calculatePercentage(
          usage.credits?.usage || 0,
          usage.credits?.limit || 0
        ),
      },
    };

    // Log usage metrics
    logger.info('Cloudinary usage retrieved', {
      storage: usageStats.storage.percentage,
      bandwidth: usageStats.bandwidth.percentage,
      transformations: usageStats.transformations.percentage,
    });

    // Record metrics
    recordMetric({
      name: 'cloudinary.storage.usage',
      type: MetricType.GAUGE,
      value: usageStats.storage.percentage,
      timestamp: new Date().toISOString(),
      tags: { unit: 'percentage' },
    });

    recordMetric({
      name: 'cloudinary.bandwidth.usage',
      type: MetricType.GAUGE,
      value: usageStats.bandwidth.percentage,
      timestamp: new Date().toISOString(),
      tags: { unit: 'percentage' },
    });

    // Alert if usage is high
    if (usageStats.storage.percentage > 80) {
      logger.warn('Cloudinary storage usage high', {
        percentage: usageStats.storage.percentage,
        used: usageStats.storage.used,
        limit: usageStats.storage.limit,
      });
    }

    if (usageStats.bandwidth.percentage > 80) {
      logger.warn('Cloudinary bandwidth usage high', {
        percentage: usageStats.bandwidth.percentage,
        used: usageStats.bandwidth.used,
        limit: usageStats.bandwidth.limit,
      });
    }

    return usageStats;
  } catch (error: unknown) {
    logger.error('Failed to retrieve Cloudinary usage', error);
    return null;
  }
}

/**
 * Calculate percentage
 */
function calculatePercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.round((used / limit) * 100 * 100) / 100; // Round to 2 decimals
}

/**
 * Track Cloudinary upload
 */
export function trackCloudinaryUpload(
  fileSize: number,
  resourceType: string,
  success: boolean,
  duration: number
) {
  recordMetric({
    name: 'cloudinary.upload.duration',
    type: MetricType.HISTOGRAM,
    value: duration,
    timestamp: new Date().toISOString(),
    tags: {
      success: String(success),
      resourceType,
    },
  });

  if (success) {
    recordMetric({
      name: 'cloudinary.upload.size',
      type: MetricType.HISTOGRAM,
      value: fileSize,
      timestamp: new Date().toISOString(),
      tags: { resourceType },
    });

    recordMetric({
      name: 'cloudinary.upload.count',
      type: MetricType.COUNTER,
      value: 1,
      timestamp: new Date().toISOString(),
      tags: { resourceType },
    });
  }
}

/**
 * Track Cloudinary deletion
 */
export function trackCloudinaryDeletion(
  resourceType: string,
  success: boolean
) {
  recordMetric({
    name: 'cloudinary.delete.count',
    type: MetricType.COUNTER,
    value: 1,
    timestamp: new Date().toISOString(),
    tags: {
      success: String(success),
      resourceType,
    },
  });
}

/**
 * Monitor Cloudinary quota and send alerts
 */
export async function monitorCloudinaryQuota(): Promise<void> {
  const usage = await getCloudinaryUsage();

  if (!usage) {
    logger.error('Unable to monitor Cloudinary quota - usage data unavailable');
    return;
  }

  // Check for critical thresholds
  const criticalThreshold = 90;
  const warningThreshold = 80;

  // Storage alerts
  if (usage.storage.percentage >= criticalThreshold) {
    logger.critical('Cloudinary storage quota critical', undefined, {
      percentage: usage.storage.percentage,
      used: formatBytes(usage.storage.used),
      limit: formatBytes(usage.storage.limit),
    });
  } else if (usage.storage.percentage >= warningThreshold) {
    logger.warn('Cloudinary storage quota warning', {
      percentage: usage.storage.percentage,
      used: formatBytes(usage.storage.used),
      limit: formatBytes(usage.storage.limit),
    });
  }

  // Bandwidth alerts
  if (usage.bandwidth.percentage >= criticalThreshold) {
    logger.critical('Cloudinary bandwidth quota critical', undefined, {
      percentage: usage.bandwidth.percentage,
      used: formatBytes(usage.bandwidth.used),
      limit: formatBytes(usage.bandwidth.limit),
    });
  } else if (usage.bandwidth.percentage >= warningThreshold) {
    logger.warn('Cloudinary bandwidth quota warning', {
      percentage: usage.bandwidth.percentage,
      used: formatBytes(usage.bandwidth.used),
      limit: formatBytes(usage.bandwidth.limit),
    });
  }

  // Transformations alerts
  if (usage.transformations.percentage >= criticalThreshold) {
    logger.critical('Cloudinary transformations quota critical', undefined, {
      percentage: usage.transformations.percentage,
      used: usage.transformations.used,
      limit: usage.transformations.limit,
    });
  } else if (usage.transformations.percentage >= warningThreshold) {
    logger.warn('Cloudinary transformations quota warning', {
      percentage: usage.transformations.percentage,
      used: usage.transformations.used,
      limit: usage.transformations.limit,
    });
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get Cloudinary resource count
 */
export async function getCloudinaryResourceCount(): Promise<{
  images: number;
  videos: number;
  raw: number;
  total: number;
} | null> {
  try {
    const [images, videos, raw] = await Promise.all([
      cloudinary.api.resources({ resource_type: 'image', max_results: 1 }),
      cloudinary.api.resources({ resource_type: 'video', max_results: 1 }),
      cloudinary.api.resources({ resource_type: 'raw', max_results: 1 }),
    ]);

    const counts = {
      images: images.total_count || 0,
      videos: videos.total_count || 0,
      raw: raw.total_count || 0,
      total:
        (images.total_count || 0) +
        (videos.total_count || 0) +
        (raw.total_count || 0),
    };

    logger.info('Cloudinary resource count retrieved', counts);

    recordMetric({
      name: 'cloudinary.resources.total',
      type: MetricType.GAUGE,
      value: counts.total,
      timestamp: new Date().toISOString(),
    });

    return counts;
  } catch (error: unknown) {
    logger.error('Failed to retrieve Cloudinary resource count', error);
    return null;
  }
}
