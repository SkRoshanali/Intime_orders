import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { otpCodes } from '@/db/schema';
import { verifyOTP } from '@/lib/otp';
import { createVerificationToken } from '@/lib/auth';
import { PHONE_REGEX } from '@/lib/validation';
import { and, eq, gte, lt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const verifyOtpSchema = z.object({
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone number'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = verifyOtpSchema.parse(body);

    const now = new Date();

    // Find the latest valid OTP for this phone
    const [otpRecord] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, phone),
          gte(otpCodes.expiresAt, now),
          lt(otpCodes.attempts, 3)
        )
      )
      .orderBy(sql`${otpCodes.createdAt} DESC`)
      .limit(1);

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP expired or not found' },
        { status: 400 }
      );
    }

    // Verify OTP
    const secret = process.env.OTP_HMAC_SECRET || '';
    if (!secret) {
      throw new Error('OTP_HMAC_SECRET not configured');
    }

    const isValid = verifyOTP(otp, otpRecord.codeHash, secret);

    if (!isValid) {
      // Increment attempts
      await db
        .update(otpCodes)
        .set({ attempts: otpRecord.attempts + 1 })
        .where(eq(otpCodes.id, otpRecord.id));

      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid - create verification token
    const verificationToken = await createVerificationToken(phone);

    return NextResponse.json({
      verificationToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
