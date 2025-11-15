import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Session from '@/lib/models/Session';
import {
  hashPassword,
  isValidPassword,
  getPasswordError,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_FIELDS',
            message: 'Token and password are required',
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

    // Hash the token to match stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Connect to database
    await connectDB();

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: 'Password reset token is invalid or has expired',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password and clear reset token
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Invalidate all existing sessions for security
    await Session.deleteMany({ userId: user._id });

    console.log('='.repeat(60));
    console.log('PASSWORD RESET SUCCESSFUL');
    console.log('='.repeat(60));
    console.log(`Email: ${user.email}`);
    console.log(`All sessions invalidated for security`);
    console.log('='.repeat(60));

    return NextResponse.json(
      {
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password update error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'PASSWORD_UPDATE_FAILED',
          message: 'Failed to update password. Please try again.',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
