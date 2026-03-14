import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_DEMO_COOKIE,
  createAdminDemoCookieValue,
} from '@/lib/security/admin-demo';

const DEFAULT_DEMO_ID = process.env.DEMO_ACCESS_DEFAULT_ID ?? 'eidconnect-v1';

/**
 * GET /api/admin/enter-demo?secret=...&demo_id=...
 * Direktzugang zur Demo ohne NDA/DocuSign. Setzt signierten Admin-Cookie
 * und leitet auf /demo/{demo_id} weiter.
 * Nur mit gültigem ADMIN_DEMO_SECRET nutzbar.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_DEMO_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL('/access/denied', request.url));
  }

  const token = request.nextUrl.searchParams.get('secret');
  const demoId =
    request.nextUrl.searchParams.get('demo_id')?.trim() || DEFAULT_DEMO_ID;

  if (token !== secret) {
    return NextResponse.redirect(new URL('/access/denied', request.url));
  }

  const cookieValue = createAdminDemoCookieValue(secret, demoId);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectUrl = new URL(`/demo/${encodeURIComponent(demoId)}`, baseUrl);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(ADMIN_DEMO_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60, // 8 Stunden
  });

  return response;
}
