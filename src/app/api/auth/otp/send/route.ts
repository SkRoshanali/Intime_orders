import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { otpCodes } from '@/db/schema';
import { generateOTP, hashOTP } from '@/lib/otp';
import { sendSms } from '@/lib/sms';
import { PHONE_REGEX } from '@/lib/validation';
import { and, gte, eq, count } from 'drizzle-orm';

const sendOtpSchema = z.object({
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone number'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = sendOtpSchema.parse(body);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit: max 3 sends per phone per hour
    const phoneCount = await db
      .select({ count: count() })
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, phone),
          gte(otpCodes.createdAt, oneHourAgo)
        )
      );

    if (phoneCount[0]?.count >= 3) {
      return NextResponse.json(
        { error: 'Too many OTP requests for this phone. Try again later.' },
        { status: 429 }
      );
    }

    // Check rate limit: max 10 sends per IP per hour
    const ipCount = await db
      .select({ count: count() })
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.ip, ip),
          gte(otpCodes.createdAt, oneHourAgo)
        )
      );

    if (ipCount[0]?.count >= 10) {
      return NextResponse.json(
        { error: 'Too many OTP requests from this IP. Try again later.' },
        { status: 429 }
      );
    }

    // Generate OTP and hash it
    const otp = generateOTP();
    const secret = process.env.OTP_HMAC_SECRET || '';
    if (!secret) {
      throw new Error('OTP_HMAC_SECRET not configured');
    }
    const codeHash = hashOTP(otp, secret);

    // Store OTP (expires in 5 minutes)
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    await db.insert(otpCodes).values({
      phone,
      codeHash,
      ip,
      expiresAt,
      attempts: 0,
    });

    console.log('[OTP/SEND] Sending OTP to', phone);

    // Send SMS
    await sendSms(phone, `otp ${otp} is your code, valid for 5 minutes.`);

    return NextResponse.json({
      message: 'OTP sent',
      expiresIn: 300,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
