/**
 * Job Callback Endpoint
 * Allows Python service to update job status during processing
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/lib/models/Job';

interface CallbackPayload {
  status: 'processing' | 'completed' | 'failed';
  stage?: 'uploading' | 'analyzing' | 'generating_narrative' | 'creating_visualizations';
  progress?: number;
  error?: {
    code: string;
    message: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const payload: CallbackPayload = await request.json();

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

    // Update job based on payload
    if (payload.status) {
      job.status = payload.status;
    }

    if (payload.stage) {
      job.currentStage = payload.stage;
    }

    if (payload.progress !== undefined) {
      job.progress = payload.progress;
    }

    if (payload.error) {
      job.markAsFailed(payload.error.code, payload.error.message);
    }

    await job.save();

    return NextResponse.json(
      { success: true, message: 'Job status updated' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Job callback error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update job status',
        },
      },
      { status: 500 }
    );
  }
}
