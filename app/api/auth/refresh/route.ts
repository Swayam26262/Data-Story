import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'No token provided' } },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the current token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Generate new token
    const newToken = generateToken(user._id.toString());

    return NextResponse.json({
      token: newToken,
      userId: user._id.toString(),
      tier: user.tier,
      storiesRemaining: user.limits.storiesPerMonth - user.storiesThisMonth,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: { code: 'REFRESH_FAILED', message: 'Failed to refresh token' } },
      { status: 500 }
    );
  }
}
