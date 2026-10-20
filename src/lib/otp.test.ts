import { describe, it, expect } from 'vitest';
import { generateOTP, hashOTP, verifyOTP } from './otp';

describe('OTP utilities', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit string', () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      // Very unlikely to be the same
      expect(otp1).not.toBe(otp2);
    });

    it('should generate OTP in valid range', () => {
      const otp = generateOTP();
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    });
  });

  describe('hashOTP', () => {
    it('should produce consistent hash for same input', () => {
      const otp = '123456';
      const secret = 'test-secret';
      const hash1 = hashOTP(otp, secret);
      const hash2 = hashOTP(otp, secret);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different OTPs', () => {
      const secret = 'test-secret';
      const hash1 = hashOTP('123456', secret);
      const hash2 = hashOTP('654321', secret);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for different secrets', () => {
      const otp = '123456';
      const hash1 = hashOTP(otp, 'secret1');
      const hash2 = hashOTP(otp, 'secret2');
      expect(hash1).not.toBe(hash2);
    });

    it('should return a hex string', () => {
      const hash = hashOTP('123456', 'secret');
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });
  });

  describe('verifyOTP', () => {
    it('should verify correct OTP', () => {
      const otp = '123456';
      const secret = 'test-secret';
      const hash = hashOTP(otp, secret);
      expect(verifyOTP(otp, hash, secret)).toBe(true);
    });

    it('should reject incorrect OTP', () => {
      const secret = 'test-secret';
      const hash = hashOTP('123456', secret);
      expect(verifyOTP('654321', hash, secret)).toBe(false);
    });

    it('should reject OTP with wrong secret', () => {
      const otp = '123456';
      const hash = hashOTP(otp, 'secret1');
      expect(verifyOTP(otp, hash, 'secret2')).toBe(false);
    });
  });
});
