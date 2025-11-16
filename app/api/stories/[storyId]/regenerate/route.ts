import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import Story from '@/lib/models/Story';
import mongoose from 'mongoose';
import { cache, getStoryStatsCacheKey } from '@/lib/cache';
import { handleApiError, Errors } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * POST /api/stories/[storyId]/regenerate
 * Regenerate charts with different configurations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      throw Errors.unauthorized();
    }

    const userId = (authResult.user._id as any).toString();
    const { storyId } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid story ID format' } },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { chartTypes, aggregationLevel, statisticalOverlays } = body;

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

    // Get dataset from storage
    const { downloadFile } = await import('@/lib/storage');
    const fileBuffer = await downloadFile(story.dataset.storageKey);

    // Call Python service to regenerate analysis with new configuration
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL;
    if (!pythonServiceUrl) {
      throw new Error('Python service URL not configured');
    }

    // Convert buffer to base64 for transmission
    const fileBase64 = fileBuffer.toString('base64');

    const analysisResponse = await fetch(`${pythonServiceUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_content: fileBase64,
        filename: story.dataset.originalFilename,
        options: {
          chart_types: chartTypes,
          aggregation_level: aggregationLevel,
          statistical_overlays: statisticalOverlays,
        },
      }),
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      throw new Error(
        `Python service error: ${errorData.error || analysisResponse.statusText}`
      );
    }

    const analysisResult = await analysisResponse.json();

    // Update story with new charts and statistics
    story.charts = analysisResult.charts || story.charts;
    story.statistics = {
      ...story.statistics,
      ...analysisResult.statistics,
    };
    story.updatedAt = new Date();

    await story.save();

    // Invalidate cache
    cache.delete(getStoryStatsCacheKey(storyId));

    logger.info('Story regenerated successfully', {
      storyId,
      userId,
      chartCount: story.charts.length,
    });

    return NextResponse.json({
      success: true,
      storyId: (story._id as any).toString(),
      charts: story.charts,
      statistics: story.statistics,
    });
  } catch (error) {
    return handleApiError(error, {
      userId: (await verifyAuth(request))?.user._id?.toString(),
      endpoint: '/api/stories/[storyId]/regenerate',
      method: 'POST',
    });
  }
}
