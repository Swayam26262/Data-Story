import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import Story from '@/lib/models/Story';
import { handleApiError, Errors } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      throw Errors.unauthorized();
    }

    const userId = (authResult.user._id as any).toString();

    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Connect to database
    await dbConnect();

    // Fetch user's stories with pagination
    const [stories, totalCount] = await Promise.all([
      Story.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title createdAt dataset charts processingTime')
        .lean(),
      Story.countDocuments({ userId }),
    ]);

    // Transform stories to match frontend interface
    const transformedStories = stories.map((story) => ({
      storyId: story._id.toString(),
      title: story.title,
      createdAt: story.createdAt,
      thumbnail: undefined, // Will be implemented when we add chart rendering
      datasetRows: story.dataset.rowCount,
      datasetColumns: story.dataset.columnCount,
      chartsCount: story.charts.length,
      processingTime: story.processingTime,
    }));

    return NextResponse.json({
      stories: transformedStories,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + stories.length < totalCount,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      userId: (await verifyAuth(request))?.user._id?.toString(),
      endpoint: '/api/stories',
      method: 'GET',
    });
  }
}
