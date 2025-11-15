import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { checkHealth } from '@/lib/monitoring';
import { logger } from '@/lib/logger';

/**
 * Health check endpoint for monitoring and deployment verification
 * Tests database connectivity, external services, and returns comprehensive system status
 */
export async function GET() {
  try {
    // Ensure database is connected
    await connectDB();

    // Perform comprehensive health check
    const healthStatus = await checkHealth();

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error: any) {
    logger.error('Health check failed', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error.message,
      },
      { status: 503 }
    );
  }
}
