'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

export interface Story {
  storyId: string;
  title: string;
  createdAt: Date;
  thumbnail?: string;
  datasetRows: number;
  datasetColumns?: number;
  chartsCount: number;
  processingTime?: number;
}

type RawStory = Omit<Story, 'createdAt'> & { createdAt: string };

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

interface UseStoriesResult {
  stories: Story[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
}

export function useStories(initialPage: number = 1, initialLimit: number = 20): UseStoriesResult {
  const { token } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const fetchStories = useCallback(
    async (page: number = currentPage, append: boolean = false) => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/stories?page=${page}&limit=${initialLimit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to fetch stories');
        }

        const data = await response.json();

        // Transform date strings to Date objects
        const transformedStories: Story[] = data.stories.map(
          (story: RawStory) => ({
            ...story,
            createdAt: new Date(story.createdAt),
          })
        );

        if (append) {
          setStories((prev) => [...prev, ...transformedStories]);
        } else {
          setStories(transformedStories);
        }

        setPagination(data.pagination);
        setCurrentPage(page);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stories');
      } finally {
        setIsLoading(false);
      }
    },
    [token, currentPage, initialLimit]
  );

  // Initial fetch
  useEffect(() => {
    fetchStories(initialPage, false);
  }, [fetchStories, initialPage]);

  // Refresh function (resets to page 1)
  const refresh = useCallback(async () => {
    await fetchStories(1, false);
  }, [fetchStories]);

  // Load more function (fetches next page)
  const loadMore = useCallback(async () => {
    if (pagination && pagination.hasMore) {
      await fetchStories(currentPage + 1, true);
    }
  }, [fetchStories, pagination, currentPage]);

  // Delete story function
  const deleteStory = useCallback(
    async (storyId: string) => {
      if (!token) return;

      try {
        const response = await fetch(`/api/stories/${storyId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to delete story');
        }

        // Remove story from local state
        setStories((prev) => prev.filter((story) => story.storyId !== storyId));

        // Update pagination count
        if (pagination) {
          setPagination({
            ...pagination,
            totalCount: pagination.totalCount - 1,
            totalPages: Math.ceil((pagination.totalCount - 1) / pagination.limit),
          });
        }
      } catch (err) {
        console.error('Error deleting story:', err);
        throw err;
      }
    },
    [token, pagination]
  );

  return {
    stories,
    isLoading,
    error,
    pagination,
    refresh,
    loadMore,
    deleteStory,
  };
}
