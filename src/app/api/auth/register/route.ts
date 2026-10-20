import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { verifyVerificationToken, createSession } from '@/lib/auth';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Extract verification token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Verification token required' },
        { status: 401 }
      );
    }

    const verificationToken = authHeader.substring(7);
    const phone = await verifyVerificationToken(verificationToken);

    if (!phone) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user with verified phone
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        phone,
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        role: 'customer',
      })
      .returning();

    // Create session
    await createSession(newUser.id, newUser.role);

    return NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
