import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/lib/models/Session';
import { extractToken } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    // Extract token
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_TOKEN',
            message: 'No authentication token found',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Delete session
    await Session.deleteOne({ token });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Clear cookie
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Logout failed. Please try again.',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
