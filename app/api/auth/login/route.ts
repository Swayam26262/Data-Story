import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Session from '@/lib/models/Session';
import {
  generateToken,
  comparePassword,
} from '@/lib/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { isValidEmail, sanitizeEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { email, password, rememberMe = false } = body;

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

    // Check rate limit (5 attempts per 15 minutes) - email is already sanitized and lowercased
    const rateLimit = checkRateLimit(email, 5, 15 * 60 * 1000);

    if (rateLimit.isLimited) {
      const resetInMinutes = Math.ceil(
        (rateLimit.resetAt - Date.now()) / (60 * 1000)
      );
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many login attempts. Please try again in ${resetInMinutes} minutes.`,
            retryable: false,
            details: {
              resetAt: new Date(rateLimit.resetAt).toISOString(),
            },
          },
        },
        { status: 429 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user (email is already sanitized and lowercased)
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            retryable: false,
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            retryable: false,
          },
        },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    resetRateLimit(email);

    // Update last login
    user.lastLoginAt = new Date();
    
    // Check if monthly reset is needed
    if (user.monthlyResetDate < new Date()) {
      user.resetMonthlyUsage();
    }
    
    await user.save();

    // Generate JWT token
    const token = generateToken(
      {
        userId: String(user._id),
        email: user.email,
        tier: user.tier,
      },
      rememberMe
    );

    // Create session record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '';

    await Session.create({
      userId: user._id,
      token,
      expiresAt,
      userAgent,
      ipAddress,
      rememberMe,
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
      { status: 200 }
    );

    // Set httpOnly cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    // Use secure logger to avoid logging sensitive data
    const { logger } = await import('@/lib/logger');
    logger.error('Login error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'LOGIN_FAILED',
          message: 'Login failed. Please try again.',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
