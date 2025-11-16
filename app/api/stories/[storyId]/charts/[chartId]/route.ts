import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Story from '@/lib/models/Story';

/**
 * GET /api/stories/[storyId]/charts/[chartId]
 * Fetch individual chart data for embedding or export
 * Supports public access via share token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string; chartId: string }> }
) {
  try {
    const { storyId, chartId } = await params;

    // Get share token from query params
    const searchParams = request.nextUrl.searchParams;
    const shareToken = searchParams.get('token');

    // Connect to database
    await dbConnect();

    // Get the story
    const story = await Story.findById(storyId);

    if (!story) {
      return NextResponse.json(
        { error: { message: 'Story not found' } },
        { status: 404 }
      );
    }

    // Check access permissions
    // Allow access if:
    // 1. Story is public and has a valid share token
    // 2. User is authenticated and owns the story
    const isPublicAccess =
      story.visibility === 'public' &&
      story.shareToken &&
      shareToken === story.shareToken;

    if (!isPublicAccess) {
      // Try to verify authentication
      const { verifyAuth } = await import('@/lib/middleware/auth');
      const authResult = await verifyAuth(request);

      if (!authResult) {
        return NextResponse.json(
          { error: { message: 'Unauthorized access' } },
          { status: 401 }
        );
      }

      const userId = (authResult.user._id as any).toString();

      // Check if user owns the story
      if (story.userId.toString() !== userId) {
        return NextResponse.json(
          { error: { message: 'Forbidden' } },
          { status: 403 }
        );
      }
    }

    // Find the specific chart
    const chart = story.charts?.find((c: any) => c.chartId === chartId);

    if (!chart) {
      return NextResponse.json(
        { error: { message: 'Chart not found' } },
        { status: 404 }
      );
    }

    // Return chart data with enhanced statistics
    return NextResponse.json({
      chartId: chart.chartId,
      type: chart.type,
      title: chart.title,
      data: chart.data,
      config: chart.config,
      statistics: chart.statistics,
      interactions: chart.interactions,
      insights: chart.insights,
    });
  } catch (error) {
    console.error('Error fetching chart:', error);
    return NextResponse.json(
      {
        error: {
          message: 'Failed to fetch chart data',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
