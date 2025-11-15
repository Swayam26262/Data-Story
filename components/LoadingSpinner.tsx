'use client';

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  label?: string;
}

/**
 * LoadingSpinner component displays a spinning loader
 */
export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'text-indigo-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && (
        <p className="mt-2 text-sm text-gray-600" role="status">
          {label}
        </p>
      )}
    </div>
  );
}

/**
 * FullPageLoader component displays a centered loading spinner
 */
export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <LoadingSpinner size="xl" label={label} />
    </div>
  );
}

/**
 * InlineLoader component displays a small inline spinner
 */
export function InlineLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
}

/**
 * ButtonLoader component displays a spinner inside a button
 */
export function ButtonLoader() {
  return <LoadingSpinner size="sm" color="white" />;
}
