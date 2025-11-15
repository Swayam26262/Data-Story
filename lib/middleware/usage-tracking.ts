/**
 * Usage Tracking Middleware
 * Handles story count increments and usage validation
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../db';
import User from '../models/User';
import { canCreateStory } from '../tier-config';

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  resetDate?: Date;
}

/**
 * Check if user can create a story based on tier limits
 */
export async function checkUsageLimit(userId: string): Promise<UsageCheckResult> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      return {
        allowed: false,
        reason: 'User not found',
      };
    }

    // Check and reset usage if needed
    user.checkAndResetUsage();
    await user.save();

    // Check if user can create more stories
    const allowed = canCreateStory(user.tier, user.storiesThisMonth);
    
    if (!allowed) {
      return {
        allowed: false,
        reason: `You have reached your monthly limit of ${user.limits.storiesPerMonth} stories`,
        remaining: 0,
        resetDate: user.monthlyResetDate,
      };
    }

    const remaining = user.limits.storiesPerMonth === -1 
      ? -1 
      : user.limits.storiesPerMonth - user.storiesThisMonth;

    return {
      allowed: true,
      remaining,
      resetDate: user.monthlyResetDate,
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return {
      allowed: false,
      reason: 'Error checking usage limit',
    };
  }
}

/**
 * Increment story count for user after successful generation
 */
export async function incrementStoryCount(userId: string): Promise<boolean> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for story count increment');
      return false;
    }

    // Check and reset usage if needed before incrementing
    user.checkAndResetUsage();
    
    // Increment counters
    user.incrementStoryCount();
    
    await user.save();
    
    console.log(`Story count incremented for user ${userId}: ${user.storiesThisMonth}/${user.limits.storiesPerMonth}`);
    return true;
  } catch (error) {
    console.error('Error incrementing story count:', error);
    return false;
  }
}

/**
 * Decrement story count (e.g., when user deletes a story)
 */
export async function decrementStoryCount(userId: string): Promise<boolean> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for story count decrement');
      return false;
    }

    // Only decrement if count is greater than 0
    if (user.storiesThisMonth > 0) {
      user.storiesThisMonth -= 1;
      await user.save();
      console.log(`Story count decremented for user ${userId}: ${user.storiesThisMonth}/${user.limits.storiesPerMonth}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error decrementing story count:', error);
    return false;
  }
}

/**
 * Middleware to check usage before story creation
 */
export async function usageCheckMiddleware(
  request: NextRequest,
  userId: string
): Promise<NextResponse | null> {
  const usageCheck = await checkUsageLimit(userId);
  
  if (!usageCheck.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'USAGE_LIMIT_EXCEEDED',
          message: usageCheck.reason || 'Usage limit exceeded',
          retryable: false,
          resetDate: usageCheck.resetDate,
        },
      },
      { status: 403 }
    );
  }
  
  return null; // Allow request to proceed
}
