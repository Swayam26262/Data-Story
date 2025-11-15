import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import {
  generateToken,
  hashPassword,
} from '@/lib/auth';
import {
  isValidEmail,
  isValidPassword,
  getPasswordError,
  sanitizeEmail,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { email, password } = body;

    // Validate input presence
    if (!email || !password) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email and password are required',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Sanitize email input
    email = sanitizeEmail(email);

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please provide a valid email address',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Validate password complexity
    if (!isValidPassword(password)) {
      const errorMessage = getPasswordError(password);
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PASSWORD',
            message:
              errorMessage ||
              'Password must be at least 8 characters with uppercase, lowercase, and number',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check for duplicate email (email is already sanitized and lowercased)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists',
            retryable: false,
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Get tier limits for free tier
    const tierLimits = User.getTierLimits('free');

    // Create user (email is already sanitized and lowercased)
    const user = await User.create({
      email,
      passwordHash,
      tier: 'free',
      limits: tierLimits,
    });

    // Generate JWT token
    const token = generateToken({
      userId: String(user._id),
      email: user.email,
      tier: user.tier,
    });

    // Create response
    const response = NextResponse.json(
      {
        userId: String(user._id),
        email: user.email,
        tier: user.tier,
        token,
        storiesRemaining: user.limits.storiesPerMonth - user.storiesThisMonth,
        storiesThisMonth: user.storiesThisMonth,
        limits: user.limits,
      },
      { status: 201 }
    );

    // Set httpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    // Use secure logger to avoid logging sensitive data
    const { logger } = await import('@/lib/logger');
    logger.error('Registration error:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Registration failed. Please try again.',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
