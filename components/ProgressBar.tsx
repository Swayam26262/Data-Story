'use client';

import React from 'react';

export interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  estimatedTimeRemaining?: number; // in seconds
}

/**
 * ProgressBar component displays progress with optional label and percentage
 */
export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  size = 'md',
  color = 'primary',
  className = '',
  estimatedTimeRemaining,
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-indigo-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className={className}>
      {/* Label and percentage */}
      {(label || showPercentage || estimatedTimeRemaining !== undefined) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <div className="flex items-center gap-2">
            {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
              <span className="text-gray-500">
                ~{formatTime(estimatedTimeRemaining)} remaining
              </span>
            )}
            {showPercentage && (
              <span className="font-medium text-gray-900">{Math.round(clampedProgress)}%</span>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className={`w-full overflow-hidden rounded-full bg-gray-200 ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

/**
 * MultiStageProgressBar for multi-step processes
 */
export interface Stage {
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export function MultiStageProgressBar({
  stages,
  className = '',
}: {
  stages: Stage[];
  className?: string;
}) {
  const getStageIcon = (status: Stage['status']) => {
    switch (status) {
      case 'completed':
        return (
          <svg
            className="h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'active':
        return (
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        );
      case 'error':
        return (
          <svg
            className="h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStageColor = (status: Stage['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'active':
        return 'bg-indigo-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className="overflow-hidden">
        {stages.map((stage, index) => (
          <li
            key={stage.label}
            className={index !== stages.length - 1 ? 'pb-10' : ''}
            style={{ position: 'relative' }}
          >
            {/* Connector line */}
            {index !== stages.length - 1 && (
              <div
                className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                aria-hidden="true"
              />
            )}

            <div className="group relative flex items-start">
              {/* Stage icon */}
              <span className="flex h-9 items-center">
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${getStageColor(
                    stage.status
                  )}`}
                >
                  {getStageIcon(stage.status)}
                </span>
              </span>

              {/* Stage label */}
              <span className="ml-4 flex min-w-0 flex-col">
                <span
                  className={`text-sm font-medium ${
                    stage.status === 'active'
                      ? 'text-indigo-600'
                      : stage.status === 'completed'
                      ? 'text-gray-900'
                      : stage.status === 'error'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {stage.label}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
