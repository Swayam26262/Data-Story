import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

/**
 * GET /api/user/chart-config
 * Retrieve user's chart configuration preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return chart configuration or empty object if not set
    return NextResponse.json(user.chartConfiguration || {});
  } catch (error) {
    console.error('Error fetching chart configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/chart-config
 * Save user's chart configuration preferences
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const configuration = await request.json();

    await dbConnect();

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { chartConfiguration: configuration },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      configuration: user.chartConfiguration,
    });
  } catch (error) {
    console.error('Error saving chart configuration:', error);
    return NextResponse.json(
      { error: 'Failed to save chart configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/chart-config
 * Reset user's chart configuration to defaults
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { $unset: { chartConfiguration: '' } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chart configuration reset to defaults',
    });
  } catch (error) {
    console.error('Error resetting chart configuration:', error);
    return NextResponse.json(
      { error: 'Failed to reset chart configuration' },
      { status: 500 }
    );
  }
}
