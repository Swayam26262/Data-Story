import { NextResponse } from 'next/server';
import { monitorMongoDBHealth, monitorDatabaseSize } from '@/lib/mongodb-monitoring';
import { monitorCloudinaryQuota } from '@/lib/cloudinary-monitoring';
import { logger } from '@/lib/logger';

/**
 * Cron job endpoint for periodic monitoring
 * Runs health checks and sends alerts if thresholds are exceeded
 * Should be called by Vercel Cron or external scheduler
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron job access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting periodic monitoring checks');

    // Run all monitoring checks in parallel
    await Promise.all([
      monitorMongoDBHealth(),
      monitorDatabaseSize(),
      monitorCloudinaryQuota(),
    ]);

    logger.info('Periodic monitoring checks completed');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Monitoring checks completed',
    });
  } catch (error: any) {
    logger.error('Periodic monitoring failed', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Monitoring checks failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
