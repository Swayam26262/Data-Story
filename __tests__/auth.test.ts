import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  isValidEmail,
  isValidPassword,
  getPasswordError,
} from '../lib/auth';

describe('Authentication Utilities', () => {
  describe('Token Generation and Verification', () => {
    it('should generate and verify valid JWT token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        tier: 'free',
      };

      const token = generateToken(payload);
      expect(token).toBeTruthy();

      const decoded = verifyToken(token);
      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.tier).toBe(payload.tier);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should generate different tokens for rememberMe', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        tier: 'free',
      };

      const token1 = generateToken(payload, false);
      const token2 = generateToken(payload, true);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password and verify correctly', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);

      const isValid = await comparePassword('WrongPassword123', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate correct password formats', () => {
      expect(isValidPassword('TestPass123')).toBe(true);
      expect(isValidPassword('Abcdefgh1')).toBe(true);
      expect(isValidPassword('MyP@ssw0rd')).toBe(true);
    });

    it('should reject passwords without uppercase', () => {
      expect(isValidPassword('testpass123')).toBe(false);
      const error = getPasswordError('testpass123');
      expect(error).toContain('uppercase');
    });

    it('should reject passwords without lowercase', () => {
      expect(isValidPassword('TESTPASS123')).toBe(false);
      const error = getPasswordError('TESTPASS123');
      expect(error).toContain('lowercase');
    });

    it('should reject passwords without numbers', () => {
      expect(isValidPassword('TestPassword')).toBe(false);
      const error = getPasswordError('TestPassword');
      expect(error).toContain('number');
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(isValidPassword('Test12')).toBe(false);
      const error = getPasswordError('Test12');
      expect(error).toContain('8 characters');
    });
  });
});
