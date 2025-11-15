'use client';

import { useState, useEffect, useCallback } from 'react';

interface Chart {
  chartId: string;
  type: 'line' | 'bar' | 'scatter' | 'pie';
  title: string;
  data: Array<Record<string, unknown>>;
  config: {
    xAxis?: string;
    yAxis?: string;
    nameKey?: string;
    valueKey?: string;
    colors?: string[];
    legend?: boolean;
    orientation?: 'horizontal' | 'vertical';
    trendLine?: boolean;
  };
}

interface Narratives {
  summary: string;
  keyFindings: string;
  recommendations: string;
}

interface StoryMetadata {
  datasetRows: number;
  columnsAnalyzed: number;
  processingTime: number;
}

interface Story {
  storyId: string;
  title: string;
  createdAt: string;
  narratives: Narratives;
  charts: Chart[];
  metadata: StoryMetadata;
}

interface UseStoryResult {
  story: Story | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStory(storyId: string | null): UseStoryResult {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStory = useCallback(async () => {
    if (!storyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/stories/${storyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch story');
      }

      const data = await response.json();
      setStory(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch story';
      setError(errorMessage);
      console.error('Error fetching story:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  return {
    story,
    isLoading,
    error,
    refetch: fetchStory,
  };
}
