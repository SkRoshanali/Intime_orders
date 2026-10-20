import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { otpCodes, users } from '@/db/schema';
import { verifyPasswordResetToken } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

const resetConfirmSchema = z.object({
  resetToken: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resetToken, password } = resetConfirmSchema.parse(body);

    // Verify the reset token
    const userId = await verifyPasswordResetToken(resetToken);
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please start the reset process again.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update the user's password
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));

    // Get user's email to invalidate related OTP codes
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user) {
      // Invalidate all OTP codes for this email by setting attempts to max
      await db
        .update(otpCodes)
        .set({ attempts: 3 })
        .where(eq(otpCodes.phone, user.email)); // Email stored in phone field
    }

    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Reset confirm error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}