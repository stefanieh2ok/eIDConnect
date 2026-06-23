import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { sha256 } from '@/lib/security/hash';
import { DEMO_SESSION_COOKIE } from '@/lib/security/session';
import { devLocalCreateSession } from '@/lib/security/dev-local-access';
import {
  getDefaultDemoId,
  isDevDemoAutoEnterEnabled,
} from '@/lib/security/dev-demo-enter-path';

const SESSION_HOURS = 8;

export function createDevDemoEnterResponse(
  requestUrl: string,
  demoId: string = getDefaultDemoId(),
): NextResponse {
  if (!isDevDemoAutoEnterEnabled()) {
    return NextResponse.redirect(new URL('/access/denied?reason=invalid', requestUrl));
  }

  const safeDemoId = demoId.trim() || getDefaultDemoId();
  const rawSessionToken = crypto.randomBytes(32).toString('hex');
  const sessionTokenHash = sha256(rawSessionToken);
  const sessionExpiresAt = new Date(
    Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  ).toISOString();

  devLocalCreateSession({
    sessionTokenHash,
    tokenId: 'devlocal-bypass',
    demoId: safeDemoId,
    fullName: 'Lokale Entwicklung',
    company: null,
    email: 'dev@localhost',
    expiresAt: sessionExpiresAt,
  });

  const baseUrl = new URL(requestUrl).origin;
  const redirectUrl = new URL(`/demo/${encodeURIComponent(safeDemoId)}`, baseUrl);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(DEMO_SESSION_COOKIE, rawSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(sessionExpiresAt),
  });

  return response;
}
