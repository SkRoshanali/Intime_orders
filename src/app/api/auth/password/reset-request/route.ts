import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { otpCodes, users } from '@/db/schema';
import { generateOTP, hashOTP } from '@/lib/otp';
import { sendEmail } from '@/lib/email';
import { resetPasswordEmail } from '@/lib/email-templates';
import { and, gte, eq, count } from 'drizzle-orm';

const resetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resetRequestSchema.parse(body);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit: max 3 reset requests per email per hour
    const emailCount = await db
      .select({ count: count() })
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, email), // Reusing phone field to store email
          gte(otpCodes.createdAt, oneHourAgo)
        )
      );

    if (emailCount[0]?.count >= 3) {
      // Return the same generic message regardless of rate limit
      return NextResponse.json({
        message: 'If that email exists, a reset code has been sent.',
      });
    }

    // Look up user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always perform a dummy hash operation for timing consistency
    const secret = process.env.OTP_HMAC_SECRET || '';
    if (!secret) {
      throw new Error('OTP_HMAC_SECRET not configured');
    }

    if (!user) {
      // Perform dummy hash operation to prevent timing attacks
      hashOTP('000000', secret);
      
      return NextResponse.json({
        message: 'If that email exists, a reset code has been sent.',
      });
    }

    // Generate OTP and hash it
    const otp = generateOTP();
    const codeHash = hashOTP(otp, secret);

    // Store OTP (expires in 5 minutes) - using email in phone field
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    await db.insert(otpCodes).values({
      phone: email, // Store email in phone field
      codeHash,
      ip,
      expiresAt,
      attempts: 0,
    });

    // Send email with reset code
    const emailTemplate = resetPasswordEmail(otp);
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return NextResponse.json({
      message: 'If that email exists, a reset code has been sent.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process reset request' },
      { status: 500 }
    );
  }
}