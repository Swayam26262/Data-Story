/**
 * Job Retry Endpoint
 * Allows users to retry failed jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/db';
import Job from '@/lib/models/Job';
import { retryJob } from '@/lib/job-orchestrator';

export async function POST(
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

    // Check if job can be retried
    if (!job.canRetry()) {
      return NextResponse.json(
        {
          error: {
            code: 'MAX_RETRIES_EXCEEDED',
            message: 'Job has exceeded maximum retry attempts',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Retry the job
    const success = await retryJob(jobId);

    if (!success) {
      return NextResponse.json(
        {
          error: {
            code: 'RETRY_FAILED',
            message: 'Failed to retry job',
            retryable: true,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Job retry initiated',
        jobId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Job retry error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retry job',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
