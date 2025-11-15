/**
 * Simple in-memory rate limiter for authentication endpoints
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (email or IP)
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with isLimited flag and remaining attempts
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { isLimited: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or expired entry
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      resetAt: now + windowMs,
    });
    return {
      isLimited: false,
      remaining: maxAttempts - 1,
      resetAt: now + windowMs,
    };
  }

  // Increment attempts
  entry.attempts += 1;

  // Check if limit exceeded
  if (entry.attempts > maxAttempts) {
    return {
      isLimited: true,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    isLimited: false,
    remaining: maxAttempts - entry.attempts,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired entries (should be called periodically)
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
