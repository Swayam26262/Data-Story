'use client';

import { type UpgradeReason } from '@/lib/hooks/useUpgrade';

interface UpgradeButtonProps {
  onClick: (reason?: UpgradeReason) => void;
  reason?: UpgradeReason;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export default function UpgradeButton({
  onClick,
  reason = 'general',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: UpgradeButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all inline-flex items-center gap-2';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={() => onClick(reason)}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <svg
        className="w-5 h-5"
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
      {children || 'Upgrade Plan'}
    </button>
  );
}
