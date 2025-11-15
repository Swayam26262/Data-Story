'use client';

import StoryCard, { StoryCardProps } from './StoryCard';

interface StoryListProps {
  stories: StoryCardProps[];
  isLoading?: boolean;
  onView?: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
  onExport?: (storyId: string) => void;
}

function StoryCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="h-48 bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
        
        {/* Metadata skeleton */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-10 bg-gray-200 rounded" />
          <div className="h-10 w-10 bg-gray-200 rounded" />
          <div className="h-10 w-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload?: () => void }) {
  return (
    <div className="col-span-full">
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Get started by uploading your first dataset. We'll automatically analyze it and create a beautiful data story for you.
        </p>
        <button
          onClick={onUpload}
          className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Upload Your First Dataset
        </button>
      </div>
    </div>
  );
}

export default function StoryList({
  stories,
  isLoading = false,
  onView,
  onDelete,
  onExport,
}: StoryListProps) {
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!stories || stories.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState />
      </div>
    );
  }

  // Show story cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryCard
          key={story.storyId}
          {...story}
          onView={onView}
          onDelete={onDelete}
          onExport={onExport}
        />
      ))}
    </div>
  );
}
