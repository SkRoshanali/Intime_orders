import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { otpCodes, users } from '@/db/schema';
import { verifyOTP } from '@/lib/otp';
import { createPasswordResetToken } from '@/lib/auth';
import { and, eq, gte, lt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const resetVerifySchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = resetVerifySchema.parse(body);

    const now = new Date();

    // Find the latest valid OTP for this email
    const [otpRecord] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, email), // Email stored in phone field
          gte(otpCodes.expiresAt, now),
          lt(otpCodes.attempts, 3)
        )
      )
      .orderBy(sql`${otpCodes.createdAt} DESC`)
      .limit(1);

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Code expired or not found' },
        { status: 400 }
      );
    }

    // Verify OTP
    const secret = process.env.OTP_HMAC_SECRET || '';
    if (!secret) {
      throw new Error('OTP_HMAC_SECRET not configured');
    }

    const isValid = verifyOTP(code, otpRecord.codeHash, secret);

    if (!isValid) {
      // Increment attempts
      await db
        .update(otpCodes)
        .set({ attempts: otpRecord.attempts + 1 })
        .where(eq(otpCodes.id, otpRecord.id));

      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      );
    }

    // Code is valid - look up the user to get their ID
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Create password reset token
    const resetToken = await createPasswordResetToken(user.id);

    return NextResponse.json({
      resetToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Reset verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}