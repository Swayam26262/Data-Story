import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import Story from '@/lib/models/Story';
import User from '@/lib/models/User';
import { deleteFile } from '@/lib/storage';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userId = (authResult.user._id as any).toString();
    const { storyId } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      console.log(`Invalid story ID format: ${storyId}`);
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid story ID format' } },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Fetch story
    const story = await Story.findById(storyId).lean();

    if (!story) {
      console.log(`Story not found: ${storyId} for user: ${userId}`);
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Story not found' } },
        { status: 404 }
      );
    }

    // Check authorization (user owns story)
    if (story.userId.toString() !== userId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not have access to this story' } },
        { status: 403 }
      );
    }

    // Transform story for response with enhanced statistics
    const transformedStory = {
      storyId: story._id.toString(),
      title: story.title,
      createdAt: story.createdAt,
      narratives: story.narratives,
      charts: story.charts,
      statistics: story.statistics, // Include enhanced statistics
      metadata: {
        datasetRows: story.dataset.rowCount,
        columnsAnalyzed: story.dataset.columnCount,
        processingTime: story.processingTime,
      },
    };

    return NextResponse.json(transformedStory);
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch story',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userId = (authResult.user._id as any).toString();
    const { storyId } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      console.log(`Invalid story ID format: ${storyId}`);
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid story ID format' } },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Fetch story to verify ownership
    const story = await Story.findById(storyId);

    if (!story) {
      console.log(`Story not found for deletion: ${storyId} for user: ${userId}`);
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Story not found' } },
        { status: 404 }
      );
    }

    // Check authorization (user owns story)
    if (story.userId.toString() !== userId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You do not have access to this story' } },
        { status: 403 }
      );
    }

    // Delete associated storage files
    try {
      if (story.dataset?.storageKey) {
        await deleteFile(story.dataset.storageKey);
      }
    } catch (storageError) {
      console.error('Error deleting storage file:', storageError);
      // Continue with deletion even if storage cleanup fails
    }

    // Delete story from database
    await Story.findByIdAndDelete(storyId);

    // Update user's story count
    const user = await User.findById(userId);
    if (user && user.storiesThisMonth > 0) {
      user.storiesThisMonth -= 1;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete story',
          retryable: false,
        },
      },
      { status: 500 }
    );
  }
}
