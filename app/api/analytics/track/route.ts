import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { recordMetric, MetricType } from '@/lib/monitoring';

/**
 * Analytics tracking endpoint
 * Receives client-side analytics events and logs them
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, properties, timestamp } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Log the analytics event
    logger.info(`Analytics: ${event}`, {
      ...properties,
      timestamp,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    });

    // Record as metric
    recordMetric({
      name: `analytics.${event}`,
      type: MetricType.COUNTER,
      value: 1,
      timestamp: timestamp || new Date().toISOString(),
      tags: {
        event,
        ...properties,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Analytics tracking failed', error);

    // Return success anyway - don't block client
    return NextResponse.json({ success: true });
  }
}
