'use client';

import { useState } from 'react';
import { TIER_CONFIGS, type UserTier } from '@/lib/tier-config';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: UserTier;
  reason?: 'story_limit' | 'row_limit' | 'feature' | 'general';
  resetDate?: Date;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  reason = 'general',
  resetDate,
}: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  if (!isOpen) return null;

  const tiers = ['free', 'professional', 'business', 'enterprise'] as UserTier[];
  const currentTierIndex = tiers.indexOf(currentTier);

  const getReasonMessage = () => {
    switch (reason) {
      case 'story_limit':
        return `You've reached your monthly limit of ${TIER_CONFIGS[currentTier].limits.storiesPerMonth} stories. Upgrade to create more!`;
      case 'row_limit':
        return `Your dataset exceeds the ${TIER_CONFIGS[currentTier].limits.maxDatasetRows.toLocaleString()} row limit. Upgrade for larger datasets!`;
      case 'feature':
        return 'This feature is available on higher tier plans. Upgrade to unlock!';
      default:
        return 'Upgrade your plan to unlock more features and higher limits!';
    }
  };

  const formatResetDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-gray-600 mt-1">{getReasonMessage()}</p>
            {resetDate && reason === 'story_limit' && (
              <p className="text-sm text-gray-500 mt-1">
                Your limit resets on {formatResetDate(resetDate)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-center gap-4">
            <span
              className={`text-sm font-medium ${
                billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')
              }
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              Annual <span className="text-green-600">(Save ~20%)</span>
            </span>
          </div>
        </div>

        {/* Tier Comparison Table */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {tiers.map((tier, index) => {
              const config = TIER_CONFIGS[tier];
              const isCurrent = tier === currentTier;
              const isUpgrade = index > currentTierIndex;
              const price =
                billingCycle === 'monthly'
                  ? config.price.monthly
                  : config.price.annual / 12;

              return (
                <div
                  key={tier}
                  className={`relative rounded-lg border-2 p-6 ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50'
                      : isUpgrade
                      ? 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-lg transition-all'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                      Current Plan
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {config.displayName}
                    </h3>
                    <div className="mt-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ${Math.round(price)}
                      </span>
                      <span className="text-gray-600">/mo</span>
                    </div>
                    {billingCycle === 'annual' && tier !== 'free' && (
                      <p className="text-sm text-gray-500 mt-1">
                        ${config.price.annual}/year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        <strong>
                          {config.limits.storiesPerMonth === -1
                            ? 'Unlimited'
                            : config.limits.storiesPerMonth}
                        </strong>{' '}
                        stories/month
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        Up to{' '}
                        <strong>
                          {config.limits.maxDatasetRows.toLocaleString()}
                        </strong>{' '}
                        rows
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        <strong>
                          {config.limits.teamMembers === -1
                            ? 'Unlimited'
                            : config.limits.teamMembers}
                        </strong>{' '}
                        team {config.limits.teamMembers === 1 ? 'member' : 'members'}
                      </span>
                    </li>
                    {config.features.customBranding && (
                      <li className="flex items-start gap-2 text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Custom branding</span>
                      </li>
                    )}
                    {config.features.advancedAnalytics && (
                      <li className="flex items-start gap-2 text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Advanced analytics</span>
                      </li>
                    )}
                    {config.features.apiAccess && (
                      <li className="flex items-start gap-2 text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>API access</span>
                      </li>
                    )}
                    {config.features.prioritySupport && (
                      <li className="flex items-start gap-2 text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Priority support</span>
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  {isUpgrade && (
                    <button
                      onClick={() => {
                        // TODO: Implement upgrade flow
                        console.log(`Upgrade to ${tier}`);
                        alert(`Upgrade to ${config.displayName} - Payment integration coming soon!`);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Upgrade Now
                    </button>
                  )}
                  {isCurrent && (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-600 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  )}
                  {!isUpgrade && !isCurrent && (
                    <button
                      disabled
                      className="w-full bg-gray-200 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Need a custom plan?{' '}
            <a href="mailto:sales@datastory.ai" className="text-blue-600 hover:underline">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
