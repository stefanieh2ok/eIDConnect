import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';
import { DEMO_SESSION_COOKIE } from '@/lib/security/session';

const DEMO_ID = 'buerger-app';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 h

function randomToken(): string {
  const arr = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 32; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * POST /api/demo/session
 * Body: { tokenId, sessionId }
 * Prüft Token, aktualisiert demo_sessions mit session_token_hash, setzt HTTP-only Cookie.
 * sessionId = bestehende Session aus demo_open (wird mit Auth-Daten versehen).
 */
export async function POST(request: NextRequest) {
  try {
    let body: { tokenId?: string; sessionId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Ungültiger Body.' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const { tokenId, sessionId } = body;
    if (!tokenId) {
      return NextResponse.json(
        { success: false, error: 'tokenId erforderlich.' },
        { status: 400 }
      );
    }

    const { data: token, error: tokErr } = await supabaseAdmin
      .from('demo_tokens')
      .select('id, recipient_name, recipient_org, is_active, expires_at')
      .eq('id', tokenId)
      .single();

    if (tokErr || !token) {
      return NextResponse.json({ success: false, error: 'Token nicht gefunden.' }, { status: 404 });
    }

    if (!(token as { is_active: boolean }).is_active) {
      return NextResponse.json({ success: false, error: 'Token wurde widerrufen.' }, { status: 403 });
    }

    if (new Date((token as { expires_at: string }).expires_at) <= new Date()) {
      return NextResponse.json({ success: false, error: 'Token abgelaufen.' }, { status: 403 });
    }

    const rawToken = randomToken();
    const sessionTokenHash = sha256(rawToken);
    const sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    const fullName = (token as { recipient_name: string }).recipient_name;
    const company = (token as { recipient_org: string | null }).recipient_org ?? null;

    if (sessionId) {
      const { data: existingSession, error: sessErr } = await supabaseAdmin
        .from('demo_sessions')
        .select('id, token_id')
        .eq('id', sessionId)
        .eq('token_id', tokenId)
        .maybeSingle();

      if (!sessErr && existingSession) {
        const { error: updateErr } = await supabaseAdmin
          .from('demo_sessions')
          .update({
            session_token_hash: sessionTokenHash,
            demo_id: DEMO_ID,
            session_expires_at: sessionExpiresAt,
            full_name: fullName,
            company,
            email: null,
            is_active: true,
          })
          .eq('id', sessionId);

        if (!updateErr) {
          cookieStore.set(DEMO_SESSION_COOKIE, rawToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: Math.floor(SESSION_DURATION_MS / 1000),
          });
          return NextResponse.json({ success: true, redirectTo: `/demo/${DEMO_ID}` });
        }
      }
    }

    const { data: newSession, error: insertErr } = await supabaseAdmin
      .from('demo_sessions')
      .insert({
        token_id: tokenId,
        session_token_hash: sessionTokenHash,
        demo_id: DEMO_ID,
        started_at: new Date().toISOString(),
        session_expires_at: sessionExpiresAt,
        full_name: fullName,
        company,
        email: null,
        is_active: true,
        is_live: true,
      })
      .select('id')
      .single();

    if (insertErr || !newSession) {
      console.error('Session insert failed:', insertErr);
      return NextResponse.json({ success: false, error: 'Session konnte nicht angelegt werden.' }, { status: 500 });
    }

    cookieStore.set(DEMO_SESSION_COOKIE, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    });

    return NextResponse.json({
      success: true,
      redirectTo: `/demo/${DEMO_ID}`,
    });
  } catch (error) {
    console.error('Demo session route failed:', error);
    return NextResponse.json(
      { success: false, error: 'Session-Erstellung fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
