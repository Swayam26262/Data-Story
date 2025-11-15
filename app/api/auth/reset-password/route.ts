import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { isValidEmail, sanitizeEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_EMAIL',
            message: 'Email is required',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Sanitize email input
    email = sanitizeEmail(email);

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

    // Connect to database
    await connectDB();

    // Find user (email is already sanitized and lowercased)
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set token and expiration (1 hour)
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      // In production, send email with reset link
      // For MVP, log to console
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      console.log('='.repeat(60));
      console.log('PASSWORD RESET REQUEST');
      console.log('='.repeat(60));
      console.log(`Email: ${user.email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`Token expires in: 1 hour`);
      console.log('='.repeat(60));
    }

    // Always return success message
    return NextResponse.json(
      {
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    // Use secure logger to avoid logging sensitive data
    const { logger } = await import('@/lib/logger');
    logger.error('Password reset request error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'RESET_REQUEST_FAILED',
          message: 'Failed to process password reset request. Please try again.',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
