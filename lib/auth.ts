import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export interface JWTPayload {
  userId: string;
  email: string;
  tier: string;
}

/**
 * Generate JWT token with 7-day or 30-day expiration
 */
export function generateToken(
  payload: JWTPayload,
  rememberMe: boolean = false
): string {
  const expiresIn = rememberMe ? '30d' : '7d';
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: 'datastory-ai',
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'datastory-ai',
    });
    
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return decoded as JWTPayload;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate email format
 * @deprecated Use isValidEmail from lib/validation.ts instead
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password complexity
 * Requirements: 8+ characters, at least one uppercase, one lowercase, one number
 * @deprecated Use isValidPassword from lib/validation.ts instead
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8 || password.length > 128) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Get password validation error message
 * @deprecated Use getPasswordError from lib/validation.ts instead
 */
export function getPasswordError(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (password.length > 128) {
    return 'Password must not exceed 128 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}
