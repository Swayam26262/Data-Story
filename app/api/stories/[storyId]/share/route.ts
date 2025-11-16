import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import Story from '@/lib/models/Story';
import mongoose from 'mongoose';
import { handleApiError, Errors } from '@/lib/errors';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

/**
 * POST /api/stories/[storyId]/share
 * Generate a shareable link for a story
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

    // Generate share token if not exists
    if (!story.shareToken) {
      story.shareToken = crypto.randomBytes(32).toString('hex');
      story.visibility = 'public';
      await story.save();
    }

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/story/${storyId}?token=${story.shareToken}`;

    logger.info('Share link generated', {
      storyId,
      userId,
      shareToken: story.shareToken,
    });

    return NextResponse.json({
      success: true,
      shareUrl,
      shareToken: story.shareToken,
      expiresAt: null, // No expiration for now
    });
  } catch (error) {
    return handleApiError(error, {
      userId: (await verifyAuth(request))?.user._id?.toString(),
      endpoint: '/api/stories/[storyId]/share',
      method: 'POST',
    });
  }
}

/**
 * DELETE /api/stories/[storyId]/share
 * Revoke shareable link for a story
 */
export async function DELETE(
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

    // Revoke share token
    story.shareToken = undefined;
    story.visibility = 'private';
    await story.save();

    logger.info('Share link revoked', {
      storyId,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Share link revoked successfully',
    });
  } catch (error) {
    return handleApiError(error, {
      userId: (await verifyAuth(request))?.user._id?.toString(),
      endpoint: '/api/stories/[storyId]/share',
      method: 'DELETE',
    });
  }
}

/**
 * GET /api/stories/[storyId]/share
 * Get current share status
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

    // Return share status
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = story.shareToken
      ? `${baseUrl}/story/${storyId}?token=${story.shareToken}`
      : null;

    return NextResponse.json({
      isShared: !!story.shareToken,
      shareUrl,
      visibility: story.visibility,
    });
  } catch (error) {
    return handleApiError(error, {
      userId: (await verifyAuth(request))?.user._id?.toString(),
      endpoint: '/api/stories/[storyId]/share',
      method: 'GET',
    });
  }
}
