import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import Story from '@/lib/models/Story';
import mongoose from 'mongoose';
import { checkRateLimit } from '@/lib/rate-limit';
import { cache, getExportCacheKey } from '@/lib/cache';
import { handleApiError, Errors } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * POST /api/stories/[storyId]/charts/[chartId]/export
 * Export individual chart in various formats (PNG, SVG, CSV, JSON)
 * Rate limited to prevent abuse
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string; chartId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      throw Errors.unauthorized();
    }

    const userId = (authResult.user._id as any).toString();
    const { storyId, chartId } = await params;

    // Rate limiting for export endpoints (10 exports per minute per user)
    const rateLimitKey = `export:${userId}`;
    const rateLimit = checkRateLimit(rateLimitKey, 10, 60 * 1000);

    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many export requests. Please try again later.',
            retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000)),
          },
        }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid story ID format' } },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      format = 'png',
      width = 1200,
      height = 800,
      dpi = 150,
      backgroundColor = '#ffffff',
      includeWatermark = false,
    } = body;

    // Validate format
    const validFormats = ['png', 'svg', 'csv', 'json'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_FORMAT',
            message: `Invalid format. Supported formats: ${validFormats.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getExportCacheKey(storyId, chartId, format);
    const cachedExport = cache.get<string>(cacheKey);

    if (cachedExport) {
      logger.info('Export served from cache', { storyId, chartId, format });
      return NextResponse.json({
        success: true,
        format,
        data: cachedExport,
        cached: true,
      });
    }

    // Connect to database
    await dbConnect();

    // Fetch story
    const story = await Story.findById(storyId);

    if (!story) {
      throw Errors.notFound('Story not found');
    }

    // Check authorization
    if (story.userId.toString() !== userId) {
      throw Errors.forbidden('You do not have access to this story');
    }

    // Find the specific chart
    const chart = story.charts?.find((c: any) => c.chartId === chartId);

    if (!chart) {
      throw Errors.notFound('Chart not found');
    }

    let exportData: string;

    // Generate export based on format
    switch (format) {
      case 'csv':
        exportData = await exportToCSV(chart);
        break;
      case 'json':
        exportData = JSON.stringify(
          {
            chartId: chart.chartId,
            type: chart.type,
            title: chart.title,
            data: chart.data,
            config: chart.config,
            statistics: chart.statistics,
            insights: chart.insights,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
        break;
      case 'svg':
      case 'png':
        // For image exports, return chart data and let client handle rendering
        // This is because server-side rendering of charts is complex
        exportData = JSON.stringify({
          chartId: chart.chartId,
          type: chart.type,
          title: chart.title,
          data: chart.data,
          config: chart.config,
          statistics: chart.statistics,
          exportOptions: {
            width,
            height,
            dpi,
            backgroundColor,
            includeWatermark,
          },
        });
        break;
      default:
        throw new Error('Unsupported format');
    }

    // Cache the export (5 minutes TTL)
    cache.set(cacheKey, exportData, 5 * 60 * 1000);

    logger.info('Chart exported successfully', {
      storyId,
      chartId,
      format,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        format,
        data: exportData,
        cached: false,
      },
      {
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000)),
        },
      }
    );
  } catch (error) {
    return handleApiError(error, {
      userId: (await verifyAuth(request))?.user._id?.toString(),
      endpoint: '/api/stories/[storyId]/charts/[chartId]/export',
      method: 'POST',
    });
  }
}

/**
 * Export chart data to CSV format
 */
async function exportToCSV(chart: any): Promise<string> {
  const data = chart.data;

  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get all unique keys from data
  const keys = Array.from(
    new Set(data.flatMap((row) => Object.keys(row)))
  );

  // Create CSV header
  const header = keys.join(',');

  // Create CSV rows
  const rows = data.map((row) => {
    return keys
      .map((key) => {
        const value = row[key];
        // Handle values that contain commas or quotes
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}
