import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_DURATION = 30 * 60; // 30 minutes in seconds
const REFRESH_THRESHOLD = 5 * 60; // Refresh if token is older than 5 minutes

let cachedSecret: Uint8Array | null = null;
let secretInitialized = false;

/**
 * Get the signing secret (lazy-initialize to support testing)
 */
function getSecret(): Uint8Array {
  if (!cachedSecret) {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      throw new Error('SESSION_SECRET environment variable is not set');
    }
    cachedSecret = new TextEncoder().encode(secret);
  }
  return cachedSecret;
}

// Validate SESSION_SECRET is available in production (non-test) environments
if (process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true') {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
}

export interface SessionPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Create a session cookie with JWT
 */
export async function createSession(userId: string, role: string) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + SESSION_DURATION;

  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(getSecret());

  (await cookies()).set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

/**
 * Verify and decode session JWT
 */
export async function verifySession(
  request?: Request
): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number'
    ) {
      return {
        userId: payload.userId,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if session should be refreshed (older than 5 minutes)
 */
export function shouldRefreshSession(iat: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now - iat > REFRESH_THRESHOLD;
}

/**
 * Refresh session by issuing new cookie
 */
export async function refreshSession(userId: string, role: string) {
  await createSession(userId, role);
}

/**
 * Clear session cookie
 */
export async function clearSession() {
  (await cookies()).delete('session');
}

/**
 * Create a verification token (15 minute expiry) for post-OTP registration
 */
export async function createVerificationToken(phone: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 15 * 60; // 15 minutes

  const token = await new SignJWT({ phone })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(getSecret());

  return token;
}

/**
 * Verify verification token and extract phone
 */
export async function verifyVerificationToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.phone === 'string') {
      return payload.phone;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Create a password reset token (10 minute expiry)
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 10 * 60; // 10 minutes

  const token = await new SignJWT({ userId, type: 'password-reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(getSecret());

  return token;
}

/**
 * Verify password reset token and extract user ID
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId === 'string' &&
      payload.type === 'password-reset'
    ) {
      return payload.userId;
    }
    return null;
  } catch (error) {
    return null;
  }
}
