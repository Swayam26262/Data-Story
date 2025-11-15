/**
 * Security middleware for setting security headers and CORS
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers configuration
 * Implements best practices for web application security
 */
export const securityHeaders = {
  // Content Security Policy - prevents XSS attacks
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
    "style-src 'self' 'unsafe-inline'", // TailwindCSS requires unsafe-inline
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://*.cloudinary.com https://*.amazonaws.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS protection in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Enforce HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Permissions policy (formerly Feature-Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
  ].join(', '),
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * CORS configuration
 * Whitelist only allowed origins
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || '',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  // Check if origin is allowed
  const isAllowed = origin && allowedOrigins.includes(origin);

  if (isAllowed) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    };
  }

  return {};
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    if (Object.keys(corsHeaders).length > 0) {
      const response = new NextResponse(null, { status: 204 });
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Reject preflight from disallowed origins
    return new NextResponse(null, { status: 403 });
  }

  return null;
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Rate limiting configuration per user
 * 100 requests per hour per user
 */
interface UserRateLimitEntry {
  count: number;
  resetAt: number;
}

const userRateLimitStore = new Map<string, UserRateLimitEntry>();

/**
 * Check user rate limit (100 requests/hour)
 */
export function checkUserRateLimit(
  userId: string
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 100;

  const entry = userRateLimitStore.get(userId);

  // No entry or expired entry
  if (!entry || entry.resetAt < now) {
    userRateLimitStore.set(userId, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupUserRateLimits(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of userRateLimitStore.entries()) {
    if (entry.resetAt < now) {
      userRateLimitStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Cleanup expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupUserRateLimits, 10 * 60 * 1000);
}

/**
 * Validate request content type for API endpoints
 */
export function validateContentType(
  request: NextRequest,
  allowedTypes: string[]
): boolean {
  const contentType = request.headers.get('content-type');

  if (!contentType) {
    return false;
  }

  return allowedTypes.some((type) => contentType.includes(type));
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetAt: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(resetAt).toISOString());

  return response;
}
