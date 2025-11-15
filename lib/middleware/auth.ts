import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth';
import connectDB from '@/lib/db';
import User, { IUser } from '@/lib/models/User';
import Session from '@/lib/models/Session';

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser;
  userId?: string;
  userPayload?: JWTPayload;
}

/**
 * Extract token from request (cookie or Authorization header)
 */
export function extractToken(request: NextRequest): string | null {
  // Try cookie first
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Verify authentication and attach user to request
 * Returns null if authentication fails, otherwise returns user payload
 */
export async function verifyAuth(
  request: NextRequest
): Promise<{ payload: JWTPayload; user: IUser } | null> {
  try {
    // Extract token
    const token = extractToken(request);
    if (!token) {
      return null;
    }

    // Verify JWT
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Connect to database
    await connectDB();

    // Verify session exists and is not expired
    const session = await Session.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return null;
    }

    // Update last activity
    session.updateActivity();
    await session.save();

    // Get user
    const user = await User.findById(payload.userId);
    if (!user) {
      return null;
    }

    // Check if monthly reset is needed
    if (user.monthlyResetDate < new Date()) {
      user.resetMonthlyUsage();
      await user.save();
    }

    return { payload, user };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Middleware to require authentication
 * Returns 401 response if not authenticated
 */
export async function requireAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: IUser, payload: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await verifyAuth(request);

  if (!auth) {
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

  return handler(request, auth.user, auth.payload);
}

/**
 * Check if user owns a resource
 */
export function checkOwnership(
  userId: string,
  resourceUserId: string
): boolean {
  return userId === resourceUserId;
}

/**
 * Middleware to check resource ownership
 */
export function requireOwnership(
  userId: string,
  resourceUserId: string
): NextResponse | null {
  if (!checkOwnership(userId, resourceUserId)) {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
          retryable: false,
        },
      },
      { status: 403 }
    );
  }
  return null;
}
