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
    <div className="bg-[#0A0A0A] rounded-2xl shadow-lg overflow-hidden animate-pulse border border-[#2a2a2a]">
      {/* Thumbnail skeleton */}
      <div className="h-48 bg-white/5" />
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-6 bg-white/10 rounded mb-2 w-3/4" />
        <div className="h-4 bg-white/10 rounded mb-4 w-1/2" />
        
        {/* Metadata skeleton */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-4 bg-white/10 rounded w-20" />
          <div className="h-4 bg-white/10 rounded w-16" />
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-10 bg-white/10 rounded" />
          <div className="h-10 w-10 bg-white/10 rounded" />
          <div className="h-10 w-10 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full">
      <div className="bg-[#0A0A0A] rounded-2xl shadow-lg p-12 text-center border border-[#2a2a2a]">
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-full bg-primary/10">
            <svg
              className="h-20 w-20 text-primary"
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
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No stories yet</h3>
        <p className="text-[#D4D4D4] max-w-md mx-auto text-lg">
          Your generated stories will appear here. Click "New Story" to create your first data story.
        </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
