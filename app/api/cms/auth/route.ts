import { NextRequest, NextResponse } from 'next/server';
import { adminAuthIsConfigured, CMS_SESSION_COOKIE, CMS_SESSION_MAX_AGE, createAdminSession, isAdminRequest, verifyAdminPassword } from '@/lib/cms-auth';

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isAdminRequest(request), configured: adminAuthIsConfigured() });
}

export async function POST(request: NextRequest) {
  if (!adminAuthIsConfigured()) return NextResponse.json({ error: 'Admin authentication is not securely configured.' }, { status: 503 });
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now(); const previous = attempts.get(key);
  const state = !previous || previous.resetAt <= now ? { count: 0, resetAt: now + WINDOW_MS } : previous;
  if (state.count >= MAX_ATTEMPTS) return NextResponse.json({ error: 'Too many attempts.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((state.resetAt - now) / 1000)) } });
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  if (typeof body?.password !== 'string' || !verifyAdminPassword(body.password)) {
    state.count += 1; attempts.set(key, state);
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }
  attempts.delete(key);
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(CMS_SESSION_COOKIE, createAdminSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: CMS_SESSION_MAX_AGE });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(CMS_SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
