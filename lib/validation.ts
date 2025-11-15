/**
 * Input validation and sanitization utilities
 * Provides comprehensive validation for user inputs to prevent XSS and injection attacks
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags and special characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Sanitize email input
 * Converts to lowercase and removes dangerous characters
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[<>'"]/g, ''); // Remove quotes and angle brackets
}

/**
 * Validate email format using RFC 5322 compliant regex
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 max length
}

/**
 * Validate password complexity
 * Requirements: 8+ characters, at least one uppercase, one lowercase, one number
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  if (password.length < 8 || password.length > 128) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Get detailed password validation error message
 */
export function getPasswordError(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }

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

/**
 * Validate file type using magic numbers (file signatures)
 * More secure than relying on file extensions
 */
export function validateFileType(
  buffer: Buffer,
  filename: string
): { isValid: boolean; detectedType: string | null } {
  const extension = filename.toLowerCase().split('.').pop();

  // CSV files - check for text content
  if (extension === 'csv') {
    try {
      const firstBytes = buffer.subarray(0, 100).toString('utf8');
      const isText = /^[\x20-\x7E\r\n\t]+$/.test(firstBytes);
      return {
        isValid: isText,
        detectedType: isText ? 'text/csv' : null,
      };
    } catch {
      return { isValid: false, detectedType: null };
    }
  }

  // Excel .xlsx files (ZIP format - PK signature)
  if (extension === 'xlsx') {
    const isXlsx =
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04;
    return {
      isValid: isXlsx,
      detectedType: isXlsx
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : null,
    };
  }

  // Excel .xls files (OLE2 format)
  if (extension === 'xls') {
    const isXls =
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0 &&
      buffer[4] === 0xa1 &&
      buffer[5] === 0xb1 &&
      buffer[6] === 0x1a &&
      buffer[7] === 0xe1;
    return {
      isValid: isXls,
      detectedType: isXls ? 'application/vnd.ms-excel' : null,
    };
  }

  return { isValid: false, detectedType: null };
}

/**
 * Validate file size against limit
 */
export function validateFileSize(
  size: number,
  maxSize: number = 10 * 1024 * 1024 // 10 MB default
): { isValid: boolean; error: string | null } {
  if (size <= 0) {
    return { isValid: false, error: 'File is empty' };
  }

  if (size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB} MB limit`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed_file';
  }

  return filename
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[/\\]/g, '') // Remove path separators
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .substring(0, 255); // Limit length
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    uuid
  );
}

/**
 * Sanitize and validate URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validate numeric input within range
 */
export function validateNumber(
  value: unknown,
  min?: number,
  max?: number
): { isValid: boolean; value: number | null; error: string | null } {
  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, value: null, error: 'Invalid number' };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, value: null, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, value: null, error: `Value must not exceed ${max}` };
  }

  return { isValid: true, value: num, error: null };
}

/**
 * Validate and sanitize tier value
 */
export function validateTier(
  tier: string
): 'free' | 'professional' | 'business' | 'enterprise' | null {
  const validTiers = ['free', 'professional', 'business', 'enterprise'];

  if (!tier || typeof tier !== 'string') {
    return null;
  }

  const sanitized = tier.toLowerCase().trim();

  if (validTiers.includes(sanitized)) {
    return sanitized as 'free' | 'professional' | 'business' | 'enterprise';
  }

  return null;
}

/**
 * Validate audience level
 */
export function validateAudienceLevel(
  level: string
): 'executive' | 'technical' | 'general' | null {
  const validLevels = ['executive', 'technical', 'general'];

  if (!level || typeof level !== 'string') {
    return null;
  }

  const sanitized = level.toLowerCase().trim();

  if (validLevels.includes(sanitized)) {
    return sanitized as 'executive' | 'technical' | 'general';
  }

  return null;
}

/**
 * Validate request body has required fields
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === undefined || body[field] === null) {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Rate limit validation result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Validate content length for API requests
 */
export function validateContentLength(
  contentLength: number | null,
  maxLength: number = 10 * 1024 * 1024 // 10 MB default
): { isValid: boolean; error: string | null } {
  if (contentLength === null || contentLength === undefined) {
    return { isValid: false, error: 'Content-Length header is required' };
  }

  if (contentLength > maxLength) {
    const maxMB = (maxLength / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Request body exceeds ${maxMB} MB limit`,
    };
  }

  return { isValid: true, error: null };
}
