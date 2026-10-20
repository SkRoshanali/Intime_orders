import { describe, it, expect, beforeEach } from 'vitest';
import { createPasswordResetToken, verifyPasswordResetToken } from './auth';

describe('Password Reset Tokens', () => {
  describe('createPasswordResetToken', () => {
    it('should create a valid JWT token', async () => {
      const userId = 'test-user-id-123';
      const token = await createPasswordResetToken(userId);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      // JWT format: header.payload.signature
      expect(token.split('.')).toHaveLength(3);
    });

    it('should create different tokens for same user (when called at different times)', async () => {
      const userId = 'test-user-id-123';
      const token1 = await createPasswordResetToken(userId);
      
      // Wait 1 second to ensure different iat
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const token2 = await createPasswordResetToken(userId);
      
      // Tokens should be different due to different iat timestamps
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyPasswordResetToken', () => {
    it('should verify and extract userId from valid token', async () => {
      const userId = 'test-user-id-456';
      const token = await createPasswordResetToken(userId);
      
      const verifiedUserId = await verifyPasswordResetToken(token);
      expect(verifiedUserId).toBe(userId);
    });

    it('should reject invalid token signature', async () => {
      const tampered = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwidHlwZSI6InBhc3N3b3JkLXJlc2V0In0.invalid_signature';
      const result = await verifyPasswordResetToken(tampered);
      
      expect(result).toBeNull();
    });

    it('should reject malformed token', async () => {
      const malformed = 'not.a.token.with.too.many.parts';
      const result = await verifyPasswordResetToken(malformed);
      
      expect(result).toBeNull();
    });

    it('should reject empty token', async () => {
      const result = await verifyPasswordResetToken('');
      
      expect(result).toBeNull();
    });

    it('should reject token with wrong type', async () => {
      // Create a token without the password-reset type
      const { SignJWT } = await import('jose');
      const secret = new TextEncoder().encode('test-secret-key-for-password-reset-tokens');
      
      const wrongTypeToken = await new SignJWT({ userId: 'test-user-id' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(Math.floor(Date.now() / 1000))
        .setExpirationTime(Math.floor(Date.now() / 1000) + 600)
        .sign(secret);
      
      const result = await verifyPasswordResetToken(wrongTypeToken);
      expect(result).toBeNull();
    });

    it('should reject token with incorrect type value', async () => {
      // Create a token with wrong type value
      const { SignJWT } = await import('jose');
      const secret = new TextEncoder().encode('test-secret-key-for-password-reset-tokens');
      
      const wrongTypeToken = await new SignJWT({ userId: 'test-user-id', type: 'wrong-type' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(Math.floor(Date.now() / 1000))
        .setExpirationTime(Math.floor(Date.now() / 1000) + 600)
        .sign(secret);
      
      const result = await verifyPasswordResetToken(wrongTypeToken);
      expect(result).toBeNull();
    });

    it('should reject expired token', async () => {
      // Create a token that expired 1 second ago
      const { SignJWT } = await import('jose');
      const secret = new TextEncoder().encode('test-secret-key-for-password-reset-tokens');
      
      const now = Math.floor(Date.now() / 1000);
      const expiredToken = await new SignJWT({ userId: 'test-user-id', type: 'password-reset' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now - 600)
        .setExpirationTime(now - 1) // Expired 1 second ago
        .sign(secret);
      
      const result = await verifyPasswordResetToken(expiredToken);
      expect(result).toBeNull();
    });

    it('should verify token with correct type and non-expired expiry', async () => {
      const userId = 'test-user-id-789';
      const token = await createPasswordResetToken(userId);
      
      // Should verify successfully
      const result = await verifyPasswordResetToken(token);
      expect(result).toBe(userId);
    });
  });
});
