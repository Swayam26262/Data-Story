/**
 * Tier Configuration System
 * Defines tier limits, features, and utility functions for tier management
 */

export type UserTier = 'free' | 'professional' | 'business' | 'enterprise';

export interface TierLimits {
  storiesPerMonth: number; // -1 means unlimited
  maxDatasetRows: number;
  teamMembers: number; // -1 means unlimited
}

export interface TierFeatures {
  pdfExport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
}

export interface TierConfig {
  name: string;
  displayName: string;
  limits: TierLimits;
  features: TierFeatures;
  price: {
    monthly: number; // USD
    annual: number; // USD
  };
}

/**
 * Complete tier configuration
 */
export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  free: {
    name: 'free',
    displayName: 'Free',
    limits: {
      storiesPerMonth: 3,
      maxDatasetRows: 1000,
      teamMembers: 1,
    },
    features: {
      pdfExport: true,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      advancedAnalytics: false,
    },
    price: {
      monthly: 0,
      annual: 0,
    },
  },
  professional: {
    name: 'professional',
    displayName: 'Professional',
    limits: {
      storiesPerMonth: 50,
      maxDatasetRows: 50000,
      teamMembers: 5,
    },
    features: {
      pdfExport: true,
      customBranding: true,
      apiAccess: false,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    price: {
      monthly: 49,
      annual: 470, // ~20% discount
    },
  },
  business: {
    name: 'business',
    displayName: 'Business',
    limits: {
      storiesPerMonth: 200,
      maxDatasetRows: 100000,
      teamMembers: 20,
    },
    features: {
      pdfExport: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    price: {
      monthly: 149,
      annual: 1430, // ~20% discount
    },
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    limits: {
      storiesPerMonth: -1, // Unlimited
      maxDatasetRows: 1000000,
      teamMembers: -1, // Unlimited
    },
    features: {
      pdfExport: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    price: {
      monthly: 499,
      annual: 4790, // ~20% discount
    },
  },
};

/**
 * Get tier configuration for a specific tier
 */
export function getTierConfig(tier: UserTier): TierConfig {
  return TIER_CONFIGS[tier];
}

/**
 * Get tier limits for a specific tier
 */
export function getTierLimits(tier: UserTier): TierLimits {
  return TIER_CONFIGS[tier].limits;
}

/**
 * Get tier features for a specific tier
 */
export function getTierFeatures(tier: UserTier): TierFeatures {
  return TIER_CONFIGS[tier].features;
}

/**
 * Check if a tier has a specific feature
 */
export function hasFeature(tier: UserTier, feature: keyof TierFeatures): boolean {
  return TIER_CONFIGS[tier].features[feature];
}

/**
 * Check if user can create more stories based on current usage
 */
export function canCreateStory(tier: UserTier, currentUsage: number): boolean {
  const limit = TIER_CONFIGS[tier].limits.storiesPerMonth;
  // -1 means unlimited
  if (limit === -1) return true;
  return currentUsage < limit;
}

/**
 * Check if dataset size is within tier limits
 */
export function isDatasetSizeAllowed(tier: UserTier, rowCount: number): boolean {
  const limit = TIER_CONFIGS[tier].limits.maxDatasetRows;
  return rowCount <= limit;
}

/**
 * Get remaining stories for the month
 */
export function getRemainingStories(tier: UserTier, currentUsage: number): number {
  const limit = TIER_CONFIGS[tier].limits.storiesPerMonth;
  // -1 means unlimited
  if (limit === -1) return -1;
  return Math.max(0, limit - currentUsage);
}

/**
 * Calculate next monthly reset date (1st of next month at 00:00 UTC)
 */
export function getNextResetDate(fromDate: Date = new Date()): Date {
  const nextMonth = new Date(fromDate);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  nextMonth.setUTCDate(1);
  nextMonth.setUTCHours(0, 0, 0, 0);
  return nextMonth;
}

/**
 * Check if monthly usage should be reset
 */
export function shouldResetUsage(resetDate: Date): boolean {
  return new Date() >= resetDate;
}

/**
 * Get all tiers for comparison (useful for upgrade UI)
 */
export function getAllTiers(): TierConfig[] {
  return Object.values(TIER_CONFIGS);
}

/**
 * Compare two tiers (returns true if tier1 is higher than tier2)
 */
export function isTierHigher(tier1: UserTier, tier2: UserTier): boolean {
  const tierOrder: UserTier[] = ['free', 'professional', 'business', 'enterprise'];
  return tierOrder.indexOf(tier1) > tierOrder.indexOf(tier2);
}
