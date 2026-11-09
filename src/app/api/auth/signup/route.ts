import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createSessionToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await query(
      `INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, 'student')`,
      [userId, cleanEmail, passwordHash, name.trim()]
    );

    const token = await createSessionToken({
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      role: 'student',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        role: 'student',
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
