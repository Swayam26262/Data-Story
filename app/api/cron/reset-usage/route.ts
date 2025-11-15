/**
 * Cron Job: Reset Monthly Usage
 * This endpoint should be called by Vercel Cron on the 1st of each month
 * Configure in vercel.json: "crons": [{ "path": "/api/cron/reset-usage", "schedule": "0 0 1 * *" }]
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getNextResetDate } from '@/lib/tier-config';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (Vercel sets this header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          {
            error: {
              code: 'UNAUTHORIZED',
              message: 'Unauthorized cron request',
              retryable: false,
            },
          },
          { status: 401 }
        );
      }
    }

    await connectDB();

    // Find all users whose reset date has passed
    const now = new Date();
    const usersToReset = await User.find({
      monthlyResetDate: { $lte: now },
    });

    console.log(`Found ${usersToReset.length} users to reset`);

    let resetCount = 0;
    let errorCount = 0;

    // Reset usage for each user
    for (const user of usersToReset) {
      try {
        user.storiesThisMonth = 0;
        user.monthlyResetDate = getNextResetDate();
        await user.save();
        resetCount++;
      } catch (error) {
        console.error(`Error resetting usage for user ${user._id}:`, error);
        errorCount++;
      }
    }

    console.log(`Usage reset complete: ${resetCount} successful, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: 'Monthly usage reset completed',
      stats: {
        totalUsers: usersToReset.length,
        resetCount,
        errorCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in usage reset cron job:', error);
    return NextResponse.json(
      {
        error: {
          code: 'CRON_ERROR',
          message: 'Failed to reset monthly usage',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
