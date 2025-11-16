import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import Story from '@/lib/models/Story';
import mongoose from 'mongoose';
import { cache, getStoryStatsCacheKey } from '@/lib/cache';
import { handleApiError, Errors } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * GET /api/stories/[storyId]/statistics
 * Get enhanced statistics for a story with caching
 */
export async function GET(
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

    // Check cache first
    const cacheKey = getStoryStatsCacheKey(storyId);
    const cachedStats = cache.get<any>(cacheKey);

    if (cachedStats) {
      logger.info('Statistics served from cache', { storyId, userId });
      return NextResponse.json({
        ...cachedStats,
        cached: true,
      });
    }

    // Connect to database
    await dbConnect();

    // Fetch story
    const story = await Story.findById(storyId).select('userId statistics');

    if (!story) {
      throw Errors.notFound('Story not found');
    }

    // Check authorization
    if (story.userId.toString() !== userId) {
      throw Errors.forbidden('You do not have access to this story');
    }

    // Prepare statistics response
    const statistics = {
      trends: story.statistics?.trends || [],
      correlations: story.statistics?.correlations || [],
      distributions: story.statistics?.distributions || [],
      advancedTrends: story.statistics?.advancedTrends || null,
      correlationMatrix: story.statistics?.correlationMatrix || null,
      outlierAnalysis: story.statistics?.outlierAnalysis || null,
      insights: story.statistics?.insights || [],
    };

    // Cache statistics (1 hour TTL)
    cache.set(cacheKey, statistics, 60 * 60 * 1000);

    logger.info('Statistics computed and cached', { storyId, userId });

    return NextResponse.json({
      ...statistics,
      cached: false,
    });
  } catch (error) {
    return handleApiError(error, {
      userId: (await verifyAuth(request))?.user._id?.toString(),
      endpoint: '/api/stories/[storyId]/statistics',
      method: 'GET',
    });
  }
}

/**
 * POST /api/stories/[storyId]/statistics/recompute
 * Force recomputation of statistics (invalidates cache)
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

    // Call Python service to recompute statistics
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
          compute_advanced_statistics: true,
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

    // Update story with new statistics
    story.statistics = {
      ...story.statistics,
      ...analysisResult.statistics,
    };
    story.updatedAt = new Date();

    await story.save();

    // Invalidate cache
    const cacheKey = getStoryStatsCacheKey(storyId);
    cache.delete(cacheKey);

    logger.info('Statistics recomputed successfully', {
      storyId,
      userId,
    });

    return NextResponse.json({
      success: true,
      statistics: story.statistics,
    });
  } catch (error) {
    return handleApiError(error, {
      userId: (await verifyAuth(request))?.user._id?.toString(),
      endpoint: '/api/stories/[storyId]/statistics/recompute',
      method: 'POST',
    });
  }
}
