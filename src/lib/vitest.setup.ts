// Setup file for vitest - runs before any test files
// This ensures SESSION_SECRET is set before auth.ts is imported

process.env.SESSION_SECRET = 'test-secret-key-for-password-reset-tokens';
process.env.OTP_HMAC_SECRET = 'test-otp-hmac-secret';
