'use client';

import React from 'react';

/**
 * Base Skeleton component for loading states
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * StoryCardSkeleton for dashboard story list loading
 */
export function StoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Thumbnail skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title */}
        <Skeleton className="mb-2 h-6 w-3/4" />

        {/* Date */}
        <Skeleton className="mb-4 h-4 w-1/2" />

        {/* Metadata */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * StoryListSkeleton for dashboard loading state
 */
export function StoryListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <StoryCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * StoryViewerSkeleton for story page loading state
 */
export function StoryViewerSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Content sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="mb-12">
          {/* Section title */}
          <Skeleton className="mb-4 h-8 w-1/3" />

          {/* Paragraph lines */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Chart placeholder */}
          <Skeleton className="mt-6 h-64 w-full" />
        </div>
      ))}

      {/* Action buttons */}
      <div className="mt-8 flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

/**
 * DashboardSkeleton for dashboard page loading state
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Usage indicator */}
      <Skeleton className="h-16 w-full" />

      {/* Story list */}
      <StoryListSkeleton />
    </div>
  );
}

/**
 * TableSkeleton for table loading states
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Table header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
