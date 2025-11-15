/**
 * Usage API Endpoint
 * Returns current usage and limits for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/middleware/auth';
import { getTierConfig, getRemainingStories } from '@/lib/tier-config';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            retryable: false,
          },
        },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user data (already fetched by verifyAuth)
    const user = authResult.user;

    // Check and reset usage if needed
    user.checkAndResetUsage();
    await user.save();

    // Get tier configuration
    const tierConfig = getTierConfig(user.tier);
    const remaining = getRemainingStories(user.tier, user.storiesThisMonth);

    // Return usage data
    return NextResponse.json({
      usage: {
        tier: user.tier,
        tierDisplayName: tierConfig.displayName,
        storiesUsed: user.storiesThisMonth,
        storiesLimit: user.limits.storiesPerMonth,
        storiesRemaining: remaining,
        totalStoriesCreated: user.totalStoriesCreated,
        resetDate: user.monthlyResetDate,
        limits: {
          storiesPerMonth: user.limits.storiesPerMonth,
          maxDatasetRows: user.limits.maxDatasetRows,
          teamMembers: user.limits.teamMembers,
        },
        features: tierConfig.features,
      },
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch usage data',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
