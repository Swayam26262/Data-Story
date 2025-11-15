# Job Processing and Status Tracking Implementation

## Overview

This document describes the implementation of Task 10: "Create job processing and status tracking" for the DataStory AI MVP.

## Implementation Summary

### Task 10.1: Build job status API ✅

**Status:** Already implemented in `app/api/jobs/[jobId]/route.ts`

The job status API endpoint provides:
- GET `/api/jobs/:jobId` endpoint
- Returns job status, progress percentage, current stage
- Authorization check (user owns job)
- Includes storyId when job completes successfully
- Returns error details if job failed

**Example Response:**
```json
{
  "jobId": "uuid-here",
  "status": "processing",
  "progress": 50,
  "currentStage": "analyzing",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:01:00.000Z"
}
```

### Task 10.2: Create job orchestration logic ✅

**Status:** Implemented in `lib/job-orchestrator.ts`

#### Key Components:

1. **triggerAnalysis()** - Triggers Python analysis service asynchronously
   - Calls Python FastAPI `/analyze` endpoint
   - Doesn't block upload response
   - Handles success and failure callbacks

2. **handleJobCompletion()** - Processes successful job completion
   - Creates Story record in MongoDB
   - Updates job status to 'completed'
   - Increments user's story count
   - Stores all analysis results (narratives, charts, statistics)

3. **handleJobFailure()** - Handles job failures
   - Updates job status to 'failed'
   - Stores error details
   - Increments retry attempt counter
   - Categorizes errors (preprocessing, analysis, narrative, visualization)

4. **retryJob()** - Retries failed jobs
   - Checks if job can be retried (max 3 attempts)
   - Resets job status
   - Triggers analysis again

#### Integration with Upload Endpoint:

Updated `app/api/upload/route.ts` to:
- Store dataset metadata in job record (filename, size, row count)
- Call `triggerAnalysis()` asynchronously after job creation
- Return immediately with jobId for status polling

#### Additional Endpoints:

1. **POST `/api/jobs/:jobId/callback`** - Allows Python service to update job status
   - Updates status, stage, progress
   - Stores error details if failed

2. **POST `/api/jobs/:jobId/retry`** - Allows users to retry failed jobs
   - Verifies user ownership
   - Checks retry limit
   - Triggers new analysis

#### Job Model Updates:

Added `metadata` field to Job model:
```typescript
interface IJobMetadata {
  originalFilename?: string;
  storageKey?: string;
  fileSize?: number;
  rowCount?: number;
  columnCount?: number;
}
```

This metadata is used when creating the Story record to avoid re-parsing the file.

### Task 10.3: Build processing status UI ✅

**Status:** Already implemented in `app/processing/[jobId]/page.tsx`

The processing status UI provides:
- Multi-stage progress indicator with circular progress bar
- Polling mechanism (checks status every 2 seconds)
- Stage display: Uploading → Analyzing → Generating → Visualizing
- Estimated time remaining calculation
- Error message with retry button for failed jobs
- Automatic redirect to story viewer when complete

**UI Features:**
- Visual progress circle showing percentage
- Stage indicators with checkmarks for completed stages
- Stage descriptions explaining current activity
- Cancel button to return to dashboard
- Retry functionality for failed jobs

## Architecture Flow

```
1. User uploads file
   ↓
2. Upload API validates and stores file
   ↓
3. Job record created in MongoDB
   ↓
4. triggerAnalysis() called asynchronously
   ↓
5. Python service processes data
   ↓
6. Python service updates job status via MongoDB
   ↓
7. On completion: handleJobCompletion() creates Story
   ↓
8. On failure: handleJobFailure() stores error
   ↓
9. Frontend polls job status every 2 seconds
   ↓
10. User redirected to story viewer or shown error
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Preprocessing Errors** - Invalid file format, insufficient data
2. **Analysis Errors** - Statistical calculation failures
3. **Narrative Generation Errors** - AI API failures, timeouts
4. **Visualization Errors** - Chart generation failures

Each error type is:
- Categorized with specific error codes
- Logged for debugging
- Stored in job record
- Displayed to user with actionable message
- Retryable up to 3 attempts

## Testing

Integration tests are available in `__tests__/job-orchestration.test.ts` that verify:
- Job completion creates Story record
- User story count is incremented
- Job failure is handled correctly
- Error details are stored

Note: Tests require MongoDB connection to run.

## Configuration

Required environment variables:
```
PYTHON_SERVICE_URL=http://localhost:8000  # Python FastAPI service URL
DATABASE_URL=mongodb+srv://...            # MongoDB connection string
```

## Future Enhancements

Potential improvements for future iterations:
1. WebSocket support for real-time status updates (instead of polling)
2. Job queue management with priority levels
3. Batch processing for multiple files
4. Job cancellation support
5. Detailed progress tracking within each stage
6. Job history and analytics

## Requirements Satisfied

This implementation satisfies the following requirements:
- **Requirement 10.2**: Progress indicators during processing
- **Requirement 10.3**: Clear error messages with retry options
- **Requirement 10.4**: Complete workflow within 60 seconds for 95% of requests
- **Requirement 3.6**: Statistical analysis completion within 30 seconds
- **Requirement 7.2**: Automatic story saving after generation
