'use client';

import { use } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useStory } from '@/lib/hooks/useStory';
import StoryViewer from '@/components/StoryViewer';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StoryPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { story, isLoading: storyLoading, error } = useStory(storyId);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading skeleton
  if (authLoading || storyLoading) {
    return (
      <>
        <Navbar variant="app" />
        <div className="min-h-screen bg-background-dark">
          {/* Header Skeleton */}
          <div className="bg-[#0A0A0A] border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="h-8 bg-white/10 rounded w-1/3 animate-pulse" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Text Skeleton */}
                  <div className="space-y-4">
                    <div className="h-6 bg-white/10 rounded w-1/4 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-4/5 animate-pulse" />
                  </div>

                  {/* Chart Skeleton */}
                  <div className="bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-6">
                    <div className="h-64 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <Navbar variant="app" />
        <div className="min-h-screen bg-background-dark flex items-center justify-center">
          <div className="max-w-md w-full bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Error Loading Story
          </h2>
          <p className="text-[#D4D4D4] mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="min-h-[44px] px-6 py-3 bg-secondary/20 border border-secondary text-white rounded-lg hover:bg-secondary/30 transition-all font-bold"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-6 py-3 bg-primary text-background-dark rounded-lg hover:bg-opacity-80 transition-all font-bold"
            >
              Retry
            </button>
          </div>
          </div>
        </div>
      </>
    );
  }

  // Show story not found
  if (!story) {
    return (
      <>
        <Navbar variant="app" />
        <div className="min-h-screen bg-background-dark flex items-center justify-center">
          <div className="max-w-md w-full bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Story Not Found
          </h2>
          <p className="text-[#D4D4D4] mb-6">
            The story you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="min-h-[44px] px-6 py-3 bg-primary text-background-dark rounded-lg hover:bg-opacity-80 transition-all font-bold"
          >
            Back to Dashboard
          </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar variant="app" />
      <StoryViewer
        narratives={story.narratives}
        charts={story.charts}
        userTier={user?.tier || 'free'}
        storyTitle={story.title}
        storyId={storyId}
      />
    </>
  );
}
