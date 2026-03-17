import { NextRequest, NextResponse } from 'next/server';
import { consumeOneTimeEntry } from '@/lib/security/one-time-entry';
import { DEMO_SESSION_COOKIE } from '@/lib/security/session';

/**
 * GET /api/access/enter-demo?t=...
 * Einmal-Link aus der E-Mail nach DocuSign-Signatur. Setzt Session-Cookie und leitet in die Demo.
 */
export async function GET(request: NextRequest) {
  const t = request.nextUrl.searchParams.get('t');
  if (!t?.trim()) {
    return NextResponse.redirect(new URL('/access/denied?reason=invalid', request.url));
  }

  const entry = await consumeOneTimeEntry(t.trim());
  if (!entry) {
    return NextResponse.redirect(new URL('/access/denied?reason=expired', request.url));
  }

  const baseUrl = request.nextUrl.origin;
  const response = NextResponse.redirect(new URL(`/demo/${entry.demoId}`, baseUrl));

  response.cookies.set(DEMO_SESSION_COOKIE, entry.rawSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(entry.sessionExpiresAt),
  });

  return response;
}
