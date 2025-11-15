import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db';
import Story from '@/lib/models/Story';
import { generateStoryPDF, generatePDFFilename } from '@/lib/pdf-generator';

export async function POST(
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
    const userTier = authResult.user.tier;
    const { storyId } = await params;

    // Connect to database
    await dbConnect();

    // Fetch story
    const story = await Story.findById(storyId);

    if (!story) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Story not found' } },
        { status: 404 }
      );
    }

    // Check authorization (user owns story)
    if (story.userId.toString() !== userId) {
      return NextResponse.json(
        { 
          error: { 
            code: 'FORBIDDEN', 
            message: 'You do not have access to this story' 
          } 
        },
        { status: 403 }
      );
    }

    // Parse chart images from request body
    const body = await request.json();
    const chartImages = body.chartImages || [];

    // Validate chart images
    if (!Array.isArray(chartImages)) {
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_REQUEST', 
            message: 'Chart images must be provided as an array' 
          } 
        },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateStoryPDF({
      story,
      userTier,
      chartImages,
    });

    // Generate filename
    const filename = generatePDFFilename(storyId, story.title);

    // Log export event for analytics
    console.log(`PDF export: userId=${userId}, storyId=${storyId}, tier=${userTier}`);

    // Return PDF as file stream
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Determine if error is retryable
    const isRetryable = error instanceof Error && 
      (error.message.includes('timeout') || error.message.includes('network'));

    return NextResponse.json(
      {
        error: {
          code: 'PDF_GENERATION_FAILED',
          message: 'Failed to generate PDF. Please try again.',
          retryable: isRetryable,
        },
      },
      { status: 500 }
    );
  }
}
