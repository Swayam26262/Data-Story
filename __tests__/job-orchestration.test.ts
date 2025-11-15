/**
 * Job Orchestration Tests
 * Tests for job processing and status tracking
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Job from '@/lib/models/Job';
import Story from '@/lib/models/Story';
import User from '@/lib/models/User';
import { handleJobCompletion, handleJobFailure } from '@/lib/job-orchestrator';

describe('Job Orchestration', () => {
  let testUserId: string;
  let testJobId: string;

  beforeAll(async () => {
    await connectDB();

    // Create test user
    const testUser = new User({
      email: `test-job-${Date.now()}@example.com`,
      passwordHash: 'test-hash',
      tier: 'free',
      storiesThisMonth: 0,
      totalStoriesCreated: 0,
    });
    await testUser.save();
    testUserId = testUser._id.toString();

    // Create test job
    const testJob = new Job({
      jobId: `test-job-${Date.now()}`,
      userId: testUser._id,
      status: 'processing',
      currentStage: 'analyzing',
      progress: 50,
      fileUrl: 'https://example.com/test.csv',
      options: { audienceLevel: 'general' },
      metadata: {
        originalFilename: 'test.csv',
        storageKey: 'test-key',
        fileSize: 1000,
        rowCount: 100,
        columnCount: 5,
      },
    });
    await testJob.save();
    testJobId = testJob.jobId;
  });

  afterAll(async () => {
    // Cleanup
    await Job.deleteMany({ userId: testUserId });
    await Story.deleteMany({ userId: testUserId });
    await User.deleteOne({ _id: testUserId });
    await mongoose.connection.close();
  });

  it('should handle job completion successfully', async () => {
    const mockResult = {
      narratives: {
        summary: 'Test summary',
        keyFindings: 'Test findings',
        recommendations: 'Test recommendations',
      },
      charts: [
        {
          chartId: 'chart-1',
          type: 'line' as const,
          title: 'Test Chart',
          data: { x: [1, 2, 3], y: [4, 5, 6] },
          config: { xAxis: 'X', yAxis: 'Y' },
        },
      ],
      statistics: {
        trends: [],
        correlations: [],
        distributions: [
          {
            column: 'test',
            mean: 10,
            median: 10,
            stdDev: 2,
            outliers: 0,
          },
        ],
      },
    };

    await handleJobCompletion(testJobId, testUserId, mockResult);

    // Verify job was updated
    const job = await Job.findOne({ jobId: testJobId });
    expect(job).toBeTruthy();
    expect(job?.status).toBe('completed');
    expect(job?.progress).toBe(100);
    expect(job?.storyId).toBeTruthy();

    // Verify story was created
    const story = await Story.findById(job?.storyId);
    expect(story).toBeTruthy();
    expect(story?.narratives.summary).toBe('Test summary');
    expect(story?.charts.length).toBe(1);

    // Verify user story count was incremented
    const user = await User.findById(testUserId);
    expect(user?.storiesThisMonth).toBe(1);
    expect(user?.totalStoriesCreated).toBe(1);
  });

  it('should handle job failure correctly', async () => {
    // Create another test job
    const failJob = new Job({
      jobId: `fail-job-${Date.now()}`,
      userId: testUserId,
      status: 'processing',
      currentStage: 'analyzing',
      progress: 30,
      fileUrl: 'https://example.com/fail.csv',
      options: {},
    });
    await failJob.save();

    const testError = new Error('Test analysis error');
    await handleJobFailure(failJob.jobId, testError);

    // Verify job was marked as failed
    const job = await Job.findOne({ jobId: failJob.jobId });
    expect(job).toBeTruthy();
    expect(job?.status).toBe('failed');
    expect(job?.error).toBeTruthy();
    expect(job?.error?.message).toContain('Test analysis error');
    expect(job?.attempts).toBe(1);
  });
});
