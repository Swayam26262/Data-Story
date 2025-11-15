# Security Implementation Guide

This document outlines the security measures implemented in DataStory AI MVP to protect user data and prevent common web vulnerabilities.

## Overview

DataStory AI implements defense-in-depth security with multiple layers:

1. **Input Validation & Sanitization** - Prevent injection attacks
2. **Security Headers & CORS** - Protect against XSS, clickjacking, and unauthorized access
3. **Data Encryption** - Encrypt data in transit and at rest
4. **Rate Limiting** - Prevent abuse and brute force attacks
5. **Secure Logging** - Never log sensitive information

## 1. Input Validation and Sanitization

### Implementation

All user inputs are validated and sanitized using utilities in `lib/validation.ts`:

- **Email validation**: RFC 5322 compliant regex with max length check
- **Password validation**: 8-128 characters, mixed case, numbers required
- **File validation**: Magic number verification (not just extensions)
- **Filename sanitization**: Remove path traversal attempts and special characters
- **String sanitization**: Remove HTML tags, script tags, and event handlers

### Usage Example

```typescript
import { sanitizeEmail, isValidEmail, validateFileType } from '@/lib/validation';

// Sanitize and validate email
const email = sanitizeEmail(userInput);
if (!isValidEmail(email)) {
  throw new Error('Invalid email');
}

// Validate file using magic numbers
const buffer = await file.arrayBuffer();
const validation = validateFileType(Buffer.from(buffer), file.name);
if (!validation.isValid) {
  throw new Error('Invalid file type');
}
```

### Protected Endpoints

All API endpoints validate inputs:
- `/api/auth/register` - Email and password validation
- `/api/auth/login` - Email sanitization and validation
- `/api/upload` - File type, size, and content validation
- All other endpoints - Input sanitization as needed

## 2. Security Headers and CORS

### Security Headers

Implemented in `lib/middleware/security.ts` and applied via Next.js middleware:

- **Content-Security-Policy**: Prevents XSS by restricting resource loading
- **X-Frame-Options**: DENY - Prevents clickjacking
- **X-Content-Type-Options**: nosniff - Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser XSS protection
- **Strict-Transport-Security**: Enforces HTTPS (31536000 seconds = 1 year)
- **Referrer-Policy**: Controls referrer information leakage
- **Permissions-Policy**: Disables unnecessary browser features

### CORS Configuration

CORS is configured to whitelist only allowed origins:

```typescript
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000', // Development
];
```

Preflight requests (OPTIONS) are handled with proper CORS headers.

### CSRF Protection

- **SameSite Cookies**: All auth cookies use `sameSite: 'lax'`
- **httpOnly Cookies**: Auth tokens stored in httpOnly cookies (not accessible via JavaScript)
- **Secure Flag**: Cookies marked secure in production (HTTPS only)

### Rate Limiting

Two levels of rate limiting:

1. **Authentication Rate Limiting** (`lib/rate-limit.ts`)
   - 5 login attempts per 15 minutes per email
   - Prevents brute force attacks

2. **User Rate Limiting** (`lib/middleware/security.ts`)
   - 100 API requests per hour per authenticated user
   - Prevents API abuse

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-15T10:00:00Z
```

## 3. Data Encryption

### Transport Layer Security (TLS)

- **Vercel Default**: TLS 1.3 for all connections
- **Strict-Transport-Security**: HSTS header enforces HTTPS
- **No HTTP**: All traffic redirected to HTTPS in production

### Data at Rest Encryption

#### MongoDB Atlas
- **Encryption at Rest**: Enabled by default on all Atlas clusters
- **Encryption Method**: AES-256
- **Key Management**: MongoDB manages encryption keys
- **Verification**: Check Atlas dashboard → Security → Encryption at Rest

#### AWS S3
- **Server-Side Encryption**: AES-256 enforced on all uploads
- **Implementation**: `ServerSideEncryption: 'AES256'` in all PutObject commands
- **Bucket Policy**: Enforce encryption via bucket policy (recommended)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::datastory-uploads/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

#### Cloudinary (Current Storage)
- **Encryption**: HTTPS for all transfers
- **Storage**: Cloudinary encrypts data at rest
- **Access Control**: Signed URLs with expiration

### Presigned URLs

S3 presigned URLs are configured with security in mind:

- **Maximum Expiration**: 1 hour (3600 seconds)
- **Enforcement**: Code enforces max expiration even if higher value requested
- **Usage**: Temporary access to uploaded files for Python analysis service

```typescript
// Enforces 1-hour maximum
const url = await getPresignedUrl(key, expiresIn);
```

### Password Hashing

- **Algorithm**: bcrypt with 12 rounds
- **Salt**: Unique salt per password (bcrypt default)
- **Storage**: Only hashed passwords stored, never plaintext

```typescript
const passwordHash = await hashPassword(password); // bcrypt with 12 rounds
```

### JWT Tokens

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret**: Strong secret from environment variable
- **Expiration**: 7 days (default) or 30 days (remember me)
- **Storage**: httpOnly cookies (not localStorage)

## 4. Secure Logging

### Implementation

Custom logger in `lib/logger.ts` automatically redacts sensitive data:

```typescript
import { logger } from '@/lib/logger';

// Automatically redacts passwords, tokens, etc.
logger.info('User registered', { email, password }); 
// Logs: { email: 'user@example.com', password: '[REDACTED]' }
```

### Redacted Fields

The following fields are automatically redacted:
- password, passwordHash
- token, auth_token, authorization
- resetPasswordToken
- apiKey, api_key, secret, secretKey
- dataset, fileContent, buffer (large data)

### Audit Logging

Security-sensitive operations are logged:

```typescript
import { auditLog, securityLog } from '@/lib/logger';

// Audit user actions
auditLog('USER_LOGIN', userId, { ip, userAgent });

// Log security events
securityLog('RATE_LIMIT_EXCEEDED', 'medium', { userId, endpoint });
```

## 5. Environment Variables

### Required Security Variables

```bash
# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-strong-secret-here

# Database (MongoDB Atlas with encryption enabled)
MONGODB_URI=mongodb+srv://...

# AWS S3 (with encryption enabled)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=datastory-uploads

# Application URL (for CORS)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Security Best Practices

1. **Never commit secrets**: Use `.env.local` (gitignored)
2. **Rotate secrets regularly**: Especially after team member changes
3. **Use strong secrets**: Minimum 32 characters, random
4. **Separate environments**: Different secrets for dev/staging/prod

## 6. Deployment Security Checklist

### Vercel Deployment

- [ ] Set all environment variables in Vercel dashboard
- [ ] Enable "Automatically expose System Environment Variables" (for NODE_ENV)
- [ ] Configure custom domain with HTTPS
- [ ] Verify security headers in production (use securityheaders.com)

### MongoDB Atlas

- [ ] Enable encryption at rest
- [ ] Configure IP whitelist (or use VPC peering)
- [ ] Enable audit logging
- [ ] Set up automated backups
- [ ] Use strong database password

### AWS S3

- [ ] Enable server-side encryption (AES-256)
- [ ] Configure bucket policy to enforce encryption
- [ ] Enable versioning for data recovery
- [ ] Set up lifecycle policies to delete old files
- [ ] Configure CORS for Vercel domain only
- [ ] Block public access (use presigned URLs)

### Python Service (ECS)

- [ ] Store secrets in AWS Secrets Manager or Parameter Store
- [ ] Use IAM roles (not access keys) for AWS access
- [ ] Enable CloudWatch logging
- [ ] Configure security groups to allow only necessary traffic
- [ ] Use private subnets with NAT gateway

## 7. Security Monitoring

### Metrics to Monitor

1. **Failed login attempts**: Spike indicates brute force attack
2. **Rate limit hits**: Unusual patterns may indicate abuse
3. **Invalid file uploads**: May indicate attack attempts
4. **Error rates**: Sudden increase may indicate security issue
5. **Unusual API patterns**: Monitor for suspicious behavior

### Alerting

Set up alerts for:
- Multiple failed login attempts from same IP
- Rate limit exceeded repeatedly
- Unusual file upload patterns
- Database connection failures
- S3 access errors

### Tools

- **Vercel Analytics**: Monitor frontend performance and errors
- **MongoDB Atlas Monitoring**: Database performance and security
- **AWS CloudWatch**: Monitor S3 and ECS
- **Sentry**: Error tracking and alerting

## 8. Incident Response

### If Security Breach Suspected

1. **Immediate Actions**:
   - Rotate all secrets (JWT_SECRET, database passwords, API keys)
   - Review access logs for suspicious activity
   - Disable compromised accounts
   - Document timeline and actions taken

2. **Investigation**:
   - Check audit logs for unauthorized access
   - Review database for data modifications
   - Analyze S3 access logs
   - Check for unusual API patterns

3. **Communication**:
   - Notify affected users if data compromised
   - Document incident and lessons learned
   - Update security measures to prevent recurrence

## 9. Regular Security Maintenance

### Weekly
- Review failed login attempts
- Check rate limit logs
- Monitor error rates

### Monthly
- Review and update dependencies (npm audit)
- Check for security advisories
- Review access logs for patterns

### Quarterly
- Rotate secrets and credentials
- Security audit of codebase
- Penetration testing (if budget allows)
- Review and update security policies

## 10. Additional Security Recommendations

### For Production Launch

1. **Web Application Firewall (WAF)**: Consider Cloudflare or AWS WAF
2. **DDoS Protection**: Cloudflare or AWS Shield
3. **Vulnerability Scanning**: Regular automated scans
4. **Penetration Testing**: Annual third-party security audit
5. **Bug Bounty Program**: Incentivize security researchers
6. **Security Training**: Regular training for development team

### Compliance Considerations

If handling sensitive data:
- **GDPR**: Right to deletion, data portability, consent
- **CCPA**: California privacy rights
- **SOC 2**: Security controls audit
- **HIPAA**: If handling health data (not applicable for MVP)

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
