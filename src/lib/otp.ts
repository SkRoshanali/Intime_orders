import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP using HMAC-SHA256
 */
export function hashOTP(otp: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}

/**
 * Verify OTP against hash
 */
export function verifyOTP(otp: string, hash: string, secret: string): boolean {
  return hashOTP(otp, secret) === hash;
}
