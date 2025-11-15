import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Job from '@/lib/models/Job';
import { uploadFile } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import {
  validateFileType,
  validateFileSize,
  sanitizeFilename,
} from '@/lib/validation';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Count rows in CSV file
 */
function countCSVRows(buffer: Buffer): number {
  const content = buffer.toString('utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  // Subtract 1 for header row
  return Math.max(0, lines.length - 1);
}

/**
 * Estimate rows in Excel file (simplified - actual parsing would require xlsx library)
 */
async function estimateExcelRows(buffer: Buffer): Promise<number> {
  // For MVP, we'll do a rough estimate based on file size
  // In production, you'd use xlsx library to parse and count actual rows
  // Average row size in Excel is ~100-200 bytes
  const estimatedRows = Math.floor(buffer.length / 150);
  return estimatedRows;
}

export async function POST(request: NextRequest) {
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

    // Connect to database
    await connectDB();

    // Get user and check tier limits
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Check and reset usage if needed
    user.checkAndResetUsage();

    // Check if user can create more stories
    if (!user.canCreateStory()) {
      return NextResponse.json(
        {
          error: {
            code: 'TIER_LIMIT_EXCEEDED',
            message: `You've reached your monthly limit of ${user.limits.storiesPerMonth} stories. Upgrade or wait until ${user.monthlyResetDate.toLocaleDateString()}.`,
            retryable: false,
          },
        },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_FILE',
            message: 'No file provided',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size, MAX_FILE_SIZE);
    if (!sizeValidation.isValid) {
      return NextResponse.json(
        {
          error: {
            code: 'FILE_TOO_LARGE',
            message: sizeValidation.error,
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file type using magic numbers
    const fileTypeValidation = validateFileType(buffer, file.name);
    if (!fileTypeValidation.isValid) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Please upload CSV or Excel files only (.csv, .xls, .xlsx)',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Count/estimate rows
    let rowCount = 0;
    const extension = file.name.toLowerCase().split('.').pop();
    
    if (extension === 'csv') {
      rowCount = countCSVRows(buffer);
    } else {
      rowCount = await estimateExcelRows(buffer);
    }

    // Validate row count against tier limits
    if (rowCount > user.limits.maxDatasetRows) {
      return NextResponse.json(
        {
          error: {
            code: 'ROW_LIMIT_EXCEEDED',
            message: `Dataset contains approximately ${rowCount} rows. Your ${user.tier} tier supports up to ${user.limits.maxDatasetRows} rows. Please upgrade or use a smaller dataset.`,
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Validate minimum data requirements
    if (rowCount < 10) {
      return NextResponse.json(
        {
          error: {
            code: 'INSUFFICIENT_DATA',
            message: 'Dataset must contain at least 10 rows',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Upload file to storage (Cloudinary) with sanitized filename
    const uploadResult = await uploadFile(buffer, sanitizedFilename, {
      folder: `datastory-uploads/${userId}`,
      resourceType: 'raw',
      tags: ['upload', userId],
    });

    // Create job record with dataset metadata
    const jobId = uuidv4();
    const job = new Job({
      jobId,
      userId: user._id,
      status: 'queued',
      currentStage: 'uploading',
      progress: 0,
      fileUrl: uploadResult.secureUrl,
      options: {
        audienceLevel: user.preferences.defaultAudienceLevel,
      },
      attempts: 0,
      maxAttempts: 3,
      // Store dataset metadata for later use
      metadata: {
        originalFilename: sanitizedFilename,
        storageKey: uploadResult.publicId,
        fileSize: uploadResult.size,
        rowCount,
      },
    });

    await job.save();

    // Save user (in case usage was reset)
    await user.save();

    // Trigger Python analysis service asynchronously
    // Import at the top of the file
    const { triggerAnalysis } = await import('@/lib/job-orchestrator');
    
    // Don't await - let it run in background
    triggerAnalysis(
      jobId,
      String(user._id),
      uploadResult.secureUrl,
      {
        audienceLevel: user.preferences.defaultAudienceLevel,
      }
    ).catch((error) => {
      console.error('Failed to trigger analysis:', error);
    });

    return NextResponse.json(
      {
        jobId,
        status: 'processing',
        message: 'File uploaded successfully. Processing started.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Use secure logger to avoid logging sensitive data (like file contents)
    const { logger } = await import('@/lib/logger');
    logger.error('Upload error:', error);

    // Handle specific errors
    if (error.message?.includes('Cloudinary')) {
      return NextResponse.json(
        {
          error: {
            code: 'STORAGE_ERROR',
            message: 'Failed to upload file to storage. Please try again.',
            retryable: true,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again.',
          retryable: true,
          supportId: uuidv4(),
        },
      },
      { status: 500 }
    );
  }
}

// Configure route to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
