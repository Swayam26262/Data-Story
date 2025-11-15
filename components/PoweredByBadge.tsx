'use client';

interface PoweredByBadgeProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function PoweredByBadge({
  className = '',
  variant = 'light',
}: PoweredByBadgeProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isDark
          ? 'bg-gray-800 text-gray-300 border border-gray-700'
          : 'bg-gray-100 text-gray-600 border border-gray-300'
      } ${className}`}
    >
      <svg
        className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <span>
        Powered by <strong>DataStory AI</strong>
      </span>
    </div>
  );
}
