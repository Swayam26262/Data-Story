'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import { MultiStageProgressBar, Stage } from '@/components/ProgressBar';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';

interface JobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStage: 'uploading' | 'analyzing' | 'generating_narrative' | 'creating_visualizations';
  storyId?: string;
  error?: {
    code: string;
    message: string;
  };
  canRetry?: boolean;
}

const STAGE_LABELS = {
  uploading: 'Uploading',
  analyzing: 'Analyzing Data',
  generating_narrative: 'Generating Narrative',
  creating_visualizations: 'Creating Visualizations',
};

const STAGE_DESCRIPTIONS = {
  uploading: 'Uploading your dataset to our servers...',
  analyzing: 'Performing statistical analysis on your data...',
  generating_narrative: 'Creating compelling narratives with AI...',
  creating_visualizations: 'Generating beautiful charts and visualizations...',
};

export default function ProcessingPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(60);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let startTime = Date.now();

    const fetchJobStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${resolvedParams.jobId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Job not found');
            return;
          }
          throw new Error('Failed to fetch job status');
        }

        const data: JobStatus = await response.json();
        setJobStatus(data);

        // Update estimated time remaining
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        setEstimatedTime(remaining);

        // Handle completion
        if (data.status === 'completed' && data.storyId) {
          clearInterval(pollInterval);
          // Redirect to story viewer after a brief delay
          setTimeout(() => {
            router.push(`/stories/${data.storyId}`);
          }, 1500);
        }

        // Handle failure
        if (data.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.error('Error fetching job status:', err);
        setError(err.message || 'Failed to check processing status');
      }
    };

    // Initial fetch
    fetchJobStatus();

    // Poll every 2 seconds
    pollInterval = setInterval(fetchJobStatus, 2000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [resolvedParams.jobId, router]);

  const handleRetry = async () => {
    try {
      const response = await fetch(`/api/jobs/${resolvedParams.jobId}/retry`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to retry job');
      }

      // Reset state and start polling again
      setError(null);
      setJobStatus(null);
      window.location.reload();
    } catch (err: any) {
      console.error('Error retrying job:', err);
      setError('Failed to retry job. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            title="Error Loading Job"
            message={error}
            retryable={false}
            className="mb-4"
          />
          <button
            onClick={handleCancel}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (jobStatus?.status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            title="Processing Failed"
            message={jobStatus.error?.message || 'An error occurred during processing'}
            retryable={jobStatus.canRetry}
            onRetry={jobStatus.canRetry ? handleRetry : undefined}
            className="mb-4"
          />
          <button
            onClick={handleCancel}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Convert job stages to MultiStageProgressBar format
  const getStages = (): Stage[] => {
    const stageOrder = ['uploading', 'analyzing', 'generating_narrative', 'creating_visualizations'];
    const currentIndex = jobStatus ? stageOrder.indexOf(jobStatus.currentStage) : -1;

    return stageOrder.map((stage, index) => {
      let status: Stage['status'] = 'pending';
      
      if (jobStatus?.status === 'failed' && index === currentIndex) {
        status = 'error';
      } else if (index < currentIndex) {
        status = 'completed';
      } else if (index === currentIndex) {
        status = 'active';
      }

      return {
        label: STAGE_LABELS[stage as keyof typeof STAGE_LABELS],
        status,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Creating Your Story
          </h1>
          <p className="text-gray-600">
            Please wait while we analyze your data and generate insights
          </p>
        </div>

        {/* Loading spinner if no job status yet */}
        {!jobStatus && (
          <div className="flex justify-center mb-8">
            <LoadingSpinner size="xl" label="Loading job status..." />
          </div>
        )}

        {/* Progress Bar */}
        {jobStatus && (
          <div className="mb-8">
            <ProgressBar
              progress={jobStatus.progress}
              label={STAGE_LABELS[jobStatus.currentStage]}
              showPercentage={true}
              estimatedTimeRemaining={estimatedTime}
              size="lg"
            />
            <p className="mt-2 text-sm text-gray-600 text-center">
              {STAGE_DESCRIPTIONS[jobStatus.currentStage]}
            </p>
          </div>
        )}

        {/* Multi-Stage Progress Indicator */}
        {jobStatus && (
          <div className="mb-8">
            <MultiStageProgressBar stages={getStages()} />
          </div>
        )}

        {/* Cancel Button */}
        <div className="text-center">
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel and return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
