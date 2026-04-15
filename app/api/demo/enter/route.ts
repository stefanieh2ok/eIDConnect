import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_SESSION_COOKIE } from '@/lib/security/session';
import { sha256 } from '@/lib/security/hash';
import crypto from 'crypto';

const DEFAULT_DEMO_ID = process.env.DEMO_ACCESS_DEFAULT_ID ?? 'eid-demo-connect-v1';
const SESSION_HOURS = 8;

/**
 * GET /api/demo/enter?token=xxx
 * Einmal-Link für Demo-Links (ohne NDA): /demo?token=xxx → validiert demo_tokens,
 * legt demo_session an, setzt Cookie, leitet auf /demo/{demoId} weiter.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token?.trim()) {
    return NextResponse.redirect(new URL('/access/denied?reason=invalid', request.url));
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.redirect(new URL('/access/denied?reason=config', request.url));
  }

  const { data: row, error } = await supabase
    .from('demo_tokens')
    .select('id, recipient_name, recipient_org, expires_at, is_active')
    .eq('token', token.trim())
    .single();

  if (error || !row) {
    return NextResponse.redirect(new URL('/access/denied?reason=invalid', request.url));
  }

  const now = new Date();
  const expiresAt = new Date(row.expires_at);
  if (!row.is_active || expiresAt <= now) {
    return NextResponse.redirect(new URL('/access/denied?reason=expired', request.url));
  }

  const rawSessionToken = crypto.randomBytes(32).toString('hex');
  const sessionTokenHash = sha256(rawSessionToken);
  const sessionExpiresAt = new Date(now.getTime() + SESSION_HOURS * 60 * 60 * 1000).toISOString();

  const { data: sessionData, error: sessionError } = await supabase
    .from('demo_sessions')
    .insert({
      token_id: row.id,
      access_token_id: null,
      demo_id: DEFAULT_DEMO_ID,
      session_token_hash: sessionTokenHash,
      started_at: now.toISOString(),
      session_expires_at: sessionExpiresAt,
      is_active: true,
      is_live: true,
      full_name: row.recipient_name,
      company: row.recipient_org ?? null,
      email: null,
    })
    .select('id')
    .single();

  if (sessionError || !sessionData) {
    console.error('[demo/enter] Session insert failed:', sessionError);
    return NextResponse.redirect(new URL('/access/denied?reason=session', request.url));
  }

  const baseUrl = request.nextUrl.origin;
  const redirectUrl = new URL(`/demo/${DEFAULT_DEMO_ID}`, baseUrl);
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
