'use client';

import { useEffect, useState } from 'react';
import { type UserTier } from '@/lib/tier-config';

interface UsageData {
  tier: UserTier;
  tierDisplayName: string;
  storiesUsed: number;
  storiesLimit: number;
  storiesRemaining: number;
  resetDate: string;
}

interface UsageIndicatorProps {
  onUpgradeClick?: () => void;
  className?: string;
}

export default function UsageIndicator({
  onUpgradeClick,
  className = '',
}: UsageIndicatorProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usage');

      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsage(data.usage);
      setError(null);
    } catch (err) {
      console.error('Error fetching usage:', err);
      setError('Unable to load usage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-[#0A0A0A] rounded-2xl shadow-lg p-4 animate-pulse border border-[#2a2a2a] ${className}`}>
        <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-white/10 rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className={`bg-red-500/10 border border-red-500/50 rounded-2xl p-4 ${className}`}>
        <p className="text-red-400 text-sm">{error || 'Unable to load usage data'}</p>
      </div>
    );
  }

  const isUnlimited = usage.storiesLimit === -1;
  const percentage = isUnlimited ? 0 : (usage.storiesUsed / usage.storiesLimit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = usage.storiesRemaining === 0;

  const formatResetDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`bg-[#0A0A0A] rounded-2xl shadow-lg p-6 border border-[#2a2a2a] ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {usage.tierDisplayName} Plan
          </h3>
          <p className="text-sm text-[#D4D4D4] mt-1">
            {isUnlimited ? (
              'Unlimited stories'
            ) : (
              <>
                {usage.storiesUsed} of {usage.storiesLimit} stories used this month
              </>
            )}
          </p>
        </div>
        {usage.tier === 'free' && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2 py-1"
          >
            Upgrade
          </button>
        )}
      </div>

      {!isUnlimited && (
        <>
          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${
                isAtLimit
                  ? 'bg-red-500'
                  : isNearLimit
                  ? 'bg-yellow-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Status Message */}
          <div className="flex items-center justify-between text-sm">
            <span
              className={`font-medium ${
                isAtLimit
                  ? 'text-red-400'
                  : isNearLimit
                  ? 'text-yellow-400'
                  : 'text-[#D4D4D4]'
              }`}
            >
              {isAtLimit ? (
                'Limit reached'
              ) : (
                <>
                  {usage.storiesRemaining}{' '}
                  {usage.storiesRemaining === 1 ? 'story' : 'stories'} remaining
                </>
              )}
            </span>
            <span className="text-[#A0A0A0]">
              Resets {formatResetDate(usage.resetDate)}
            </span>
          </div>

          {/* Upgrade CTA for near/at limit */}
          {(isNearLimit || isAtLimit) && usage.tier === 'free' && onUpgradeClick && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={onUpgradeClick}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-background-dark font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Upgrade for More Stories
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
