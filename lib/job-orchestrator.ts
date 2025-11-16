/**
 * Job Orchestration Logic
 * Handles triggering Python analysis service and processing results
 */

import type { Types } from 'mongoose';
import connectDB from './db';
import Job from './models/Job';
import Story, { type ChartData } from './models/Story';
import User from './models/User';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

interface AnalysisResult {
  narratives: {
    summary: string;
    keyFindings: string;
    recommendations: string;
  };
  charts: Array<{
    chartId: string;
    type: 'line' | 'bar' | 'scatter' | 'pie';
    title: string;
    data: ChartData;
    config: {
      xAxis?: string;
      yAxis?: string;
      colors?: string[];
      legend?: boolean;
    };
  }>;
  statistics: {
    trends: Array<{
      column: string;
      direction: 'increasing' | 'decreasing' | 'stable';
      slope: number;
      rSquared: number;
    }>;
    correlations: Array<{
      column1: string;
      column2: string;
      coefficient: number;
      significance: 'strong' | 'moderate' | 'weak';
    }>;
    distributions: Array<{
      column: string;
      mean: number;
      median: number;
      stdDev: number;
      outliers: number;
    }>;
  };
}

/**
 * Trigger Python analysis service asynchronously
 */
export async function triggerAnalysis(
  jobId: string,
  userId: string,
  fileUrl: string,
  options: { audienceLevel?: string } = {}
): Promise<void> {
  try {
    console.log(`Triggering analysis for job ${jobId}`);

    // Call Python service asynchronously (don't await)
    fetch(`${PYTHON_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileUrl,
        userId,
        jobId,
        options,
      }),
    })
      .then(async (response) => {
        console.log(`Received response from Python service for job ${jobId}: ${response.status}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Python service error for job ${jobId}:`, errorText);
          throw new Error(`Analysis service error: ${errorText}`);
        }
        return response.json();
      })
      .then(async (result: AnalysisResult) => {
        // Handle successful completion
        console.log(`Analysis completed for job ${jobId}, creating story...`);
        console.log(`Result contains ${result.charts?.length || 0} charts`);
        await handleJobCompletion(jobId, userId, result);
      })
      .catch(async (error) => {
        // Handle failure
        console.error(`Analysis failed for job ${jobId}:`, error);
        await handleJobFailure(jobId, error);
      });

    console.log(`Analysis triggered for job ${jobId}`);
  } catch (error: unknown) {
    console.error(`Failed to trigger analysis for job ${jobId}:`, error);
    await handleJobFailure(jobId, error);
  }
}

/**
 * Handle successful job completion
 * Creates Story record and updates job status
 */
export async function handleJobCompletion(
  jobId: string,
  userId: string,
  result: AnalysisResult
): Promise<void> {
  try {
    console.log(`Handling completion for job ${jobId}`);

    await connectDB();

    // Find the job
    const job = await Job.findOne({ jobId });
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Extract dataset metadata from job
    const metadata = job.metadata || {};
    const filename = metadata.originalFilename || job.fileUrl.split('/').pop() || 'dataset.csv';

    // Calculate processing time
    const processingTime = Date.now() - new Date(job.createdAt).getTime();

    // Determine column count from statistics
    const columnCount = metadata.columnCount || 
                       (result.statistics as any).summary?.total_columns || 
                       result.statistics.distributions?.length || 
                       0;

    // Create story record
    const story = new Story({
      userId,
      title: `Analysis of ${filename}`,
      dataset: {
        originalFilename: filename,
        storageKey: metadata.storageKey || job.fileUrl,
        rowCount: metadata.rowCount || 0,
        columnCount,
        fileSize: metadata.fileSize || 0,
      },
      narratives: result.narratives,
      charts: result.charts,
      statistics: result.statistics,
      processingTime,
      aiModel: 'gemini-1.5-flash',
      visibility: 'private',
    });

    await story.save();
    console.log(`Story created with ID: ${story._id}`);

    // Update job with story ID and mark as completed
    job.storyId = story._id as Types.ObjectId;
    job.status = 'completed';
    job.progress = 100;
    job.currentStage = 'creating_visualizations';
    await job.save();
    console.log(`Job ${jobId} updated with storyId: ${story._id}`);

    // Increment user's story count
    const user = await User.findById(userId);
    if (user) {
      user.storiesThisMonth += 1;
      user.totalStoriesCreated += 1;
      await user.save();
    }

    console.log(`Job ${jobId} completed successfully. Story ${story._id} created.`);
  } catch (error: unknown) {
    console.error(`Failed to handle job completion for ${jobId}:`, error);
    await handleJobFailure(jobId, error);
  }
}

/**
 * Handle job failure
 * Updates job status with error details
 */
export async function handleJobFailure(
  jobId: string,
  error: unknown
): Promise<void> {
  try {
    console.error(`Handling failure for job ${jobId}:`, error);

    await connectDB();

    const job = await Job.findOne({ jobId });
    if (!job) {
      console.error(`Job ${jobId} not found for failure handling`);
      return;
    }

    // Increment attempts
    job.attempts += 1;

    // Determine error code and message
    let errorCode = 'PROCESSING_ERROR';
    let errorMessage = 'An error occurred during processing';

    if (error instanceof Error && typeof error.message === 'string') {
      errorMessage = error.message;

      // Categorize errors
      if (error.message.includes('preprocess')) {
        errorCode = 'PREPROCESSING_ERROR';
      } else if (error.message.includes('analysis')) {
        errorCode = 'ANALYSIS_ERROR';
      } else if (error.message.includes('narrative')) {
        errorCode = 'NARRATIVE_GENERATION_ERROR';
      } else if (error.message.includes('visualization')) {
        errorCode = 'VISUALIZATION_ERROR';
      }
    }

    // Mark as failed
    job.markAsFailed(errorCode, errorMessage);
    await job.save();

    console.log(`Job ${jobId} marked as failed: ${errorCode}`);
  } catch (err: unknown) {
    console.error(`Failed to handle job failure for ${jobId}:`, err);
  }
}

/**
 * Retry a failed job
 */
export async function retryJob(jobId: string): Promise<boolean> {
  try {
    await connectDB();

    const job = await Job.findOne({ jobId });
    if (!job) {
      throw new Error('Job not found');
    }

    if (!job.canRetry()) {
      throw new Error('Job has exceeded maximum retry attempts');
    }

    // Reset job status
    job.status = 'queued';
    job.currentStage = 'uploading';
    job.progress = 0;
    job.error = undefined;
    await job.save();

    // Trigger analysis again
    await triggerAnalysis(
      job.jobId,
      job.userId.toString(),
      job.fileUrl,
      job.options
    );

    return true;
  } catch (error: unknown) {
    console.error(`Failed to retry job ${jobId}:`, error);
    return false;
  }
}
