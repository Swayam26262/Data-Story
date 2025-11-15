/**
 * Next.js Middleware
 * Applies security headers, CORS, and rate limiting to all requests
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  applySecurityHeaders,
  handleCorsPreFlight,
  applyCorsHeaders,
  checkUserRateLimit,
  addRateLimitHeaders,
} from '@/lib/middleware/security';

export function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreFlight(request);
  if (preflightResponse) {
    return preflightResponse;
  }

  // Create response
  const response = NextResponse.next();

  // Apply security headers
  applySecurityHeaders(response);

  // Apply CORS headers
  applyCorsHeaders(request, response);

  // Apply rate limiting for authenticated API requests
  const authToken = request.cookies.get('auth_token')?.value;
  if (authToken && request.nextUrl.pathname.startsWith('/api/')) {
    try {
      // Extract userId from token (simplified - in production, verify JWT)
      const payload = JSON.parse(
        Buffer.from(authToken.split('.')[1], 'base64').toString()
      );
      const userId = payload.userId;

      if (userId) {
        const rateLimit = checkUserRateLimit(userId);

        if (!rateLimit.allowed) {
          const rateLimitResponse = NextResponse.json(
            {
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please try again later.',
                retryable: true,
              },
            },
            { status: 429 }
          );

          addRateLimitHeaders(rateLimitResponse, 100, 0, rateLimit.resetAt);
          applySecurityHeaders(rateLimitResponse);

          return rateLimitResponse;
        }

        // Add rate limit headers to successful response
        addRateLimitHeaders(
          response,
          100,
          rateLimit.remaining,
          rateLimit.resetAt
        );
      }
    } catch (error) {
      // If token parsing fails, continue without rate limiting
      console.error('Rate limit token parsing error:', error);
    }
  }

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
