'use client';

import { useState, useEffect } from 'react';

export interface StoryCardProps {
  storyId: string;
  title: string;
  createdAt: Date;
  thumbnail?: string;
  datasetRows: number;
  datasetColumns?: number;
  chartsCount: number;
  processingTime?: number;
  onView?: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
  onExport?: (storyId: string) => void;
}

export default function StoryCard({
  storyId,
  title,
  createdAt,
  thumbnail,
  datasetRows,
  datasetColumns,
  chartsCount,
  processingTime,
  onView,
  onDelete,
  onExport,
}: StoryCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Close delete modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(false);
        setDeleteError(null);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDeleteConfirm]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  };

  const formatProcessingTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(storyId);
      setShowDeleteConfirm(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete story');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out overflow-hidden group border border-[#2a2a2a] transform hover:scale-[1.02]">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-primary/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        )}
        
        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 ease-in-out flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onView?.(storyId)}
            className="px-4 py-2 bg-primary text-background-dark rounded-lg font-medium hover:bg-opacity-80 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            View Story
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-sm text-[#A0A0A0] mb-4">
          {formatDate(createdAt)}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#D4D4D4] mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>{datasetRows.toLocaleString()} rows</span>
          </div>
          {datasetColumns && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span>{datasetColumns} {datasetColumns === 1 ? 'column' : 'columns'}</span>
            </div>
          )}
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{chartsCount} {chartsCount === 1 ? 'chart' : 'charts'}</span>
          </div>
          {processingTime && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatProcessingTime(processingTime)}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView?.(storyId)}
            className="flex-1 px-3 py-2 text-sm font-medium text-background-dark bg-primary hover:bg-opacity-80 rounded-lg transition-all duration-300 ease-in-out touch-manipulation transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="View story"
          >
            View
          </button>
          <button
            onClick={() => onExport?.(storyId)}
            className="p-2 text-sm font-medium text-[#D4D4D4] border border-secondary/50 hover:bg-white/5 rounded-lg transition-all duration-300 ease-in-out touch-manipulation transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            title="Export PDF"
            aria-label="Export PDF"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-sm font-medium text-red-400 border border-red-500/50 hover:bg-red-500/10 rounded-lg transition-all duration-300 ease-in-out touch-manipulation transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            title="Delete"
            aria-label="Delete story"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#0A0A0A] rounded-2xl max-w-md w-full p-4 sm:p-6 border border-[#2a2a2a] shadow-2xl animate-scaleIn">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Story</h3>
            <p className="text-[#D4D4D4] mb-6">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
            
            {/* Error Message */}
            {deleteError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-300">{deleteError}</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-[#D4D4D4] border border-secondary/50 hover:bg-white/5 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 touch-manipulation focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500/50 transform hover:scale-[1.02]"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
