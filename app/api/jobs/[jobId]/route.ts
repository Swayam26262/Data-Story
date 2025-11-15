import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/db';
import Job from '@/lib/models/Job';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
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

    const userId = String(authResult.user._id);
    const { jobId } = await params;

    // Connect to database
    await connectDB();

    // Find job
    const job = await Job.findOne({ jobId });

    if (!job) {
      return NextResponse.json(
        { error: { code: 'JOB_NOT_FOUND', message: 'Job not found' } },
        { status: 404 }
      );
    }

    // Verify user owns this job
    if (job.userId.toString() !== userId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Return job status
    const response: any = {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      currentStage: job.currentStage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };

    // Include storyId if job completed
    if (job.status === 'completed' && job.storyId) {
      response.storyId = job.storyId.toString();
    }

    // Include error details if job failed
    if (job.status === 'failed' && job.error) {
      response.error = {
        code: job.error.code,
        message: job.error.message,
        timestamp: job.error.timestamp,
      };
      response.canRetry = job.canRetry();
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Job status error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve job status',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
