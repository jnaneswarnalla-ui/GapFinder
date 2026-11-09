import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SessionUser } from './jwt';

export const AUTH_COOKIE_NAME = 'gapfinder_session';

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getUserFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifySessionToken(token);
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}
