import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { getMongoDBStats, getCollectionStats } from '@/lib/mongodb-monitoring';
import { getCloudinaryUsage, getCloudinaryResourceCount } from '@/lib/cloudinary-monitoring';
import { logger } from '@/lib/logger';

/**
 * Monitoring endpoint - returns detailed system metrics
 * Requires authentication (admin only in production)
 */
export async function GET(request: NextRequest) {
  try {
    // In production, this should be restricted to admin users
    // For MVP, we'll allow authenticated users to view monitoring data
    const authResult = await verifyAuth(request);

    if (!authResult || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Gather monitoring data from all services
    const [mongoStats, cloudinaryUsage, cloudinaryResources] = await Promise.all([
      getMongoDBStats(),
      getCloudinaryUsage(),
      getCloudinaryResourceCount(),
    ]);

    // Get collection-specific stats
    const collectionStats = await Promise.all([
      getCollectionStats('users'),
      getCollectionStats('stories'),
      getCollectionStats('jobs'),
    ]);

    const monitoringData = {
      timestamp: new Date().toISOString(),
      mongodb: {
        connection: mongoStats,
        collections: {
          users: collectionStats[0],
          stories: collectionStats[1],
          jobs: collectionStats[2],
        },
      },
      cloudinary: {
        usage: cloudinaryUsage,
        resources: cloudinaryResources,
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV,
      },
    };

    logger.info('Monitoring data retrieved', {
      userId: String(authResult.user._id),
      collections: Object.keys(monitoringData.mongodb.collections).length,
    });

    return NextResponse.json(monitoringData);
  } catch (error: any) {
    logger.error('Failed to retrieve monitoring data', error);

    return NextResponse.json(
      { error: 'Failed to retrieve monitoring data' },
      { status: 500 }
    );
  }
}
