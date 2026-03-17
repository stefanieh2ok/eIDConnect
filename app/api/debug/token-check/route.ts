import { NextRequest, NextResponse } from 'next/server';
import {
  countAcceptanceEvents,
  countTokenSessions,
  findAccessTokenByRawToken,
  isTokenExpired,
} from '@/lib/security/token';

/**
 * GET /api/debug/token-check?token=dm_xxx
 * Zeigt Diagnose-Infos für einen Access-Token (kein Admin-Auth nötig,
 * gibt aber keine sensiblen Daten raus – nur Zähler und Status).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'token parameter missing' }, { status: 400 });
  }

  const checks: Record<string, unknown> = {
    token_prefix: token.slice(0, 20) + '…',
    supabase_url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  try {
    const rec = await findAccessTokenByRawToken(token);
    if (!rec) {
      checks.tokenRecord = null;
      checks.diagnosis = 'Token nicht in der Datenbank gefunden. Wurde der Token korrekt erstellt?';
      return NextResponse.json(checks);
    }

    checks.tokenRecord = {
      id: rec.id,
      demo_id: rec.demo_id,
      full_name: rec.full_name,
      company: rec.company,
      email: rec.email,
      expires_at: rec.expires_at,
      is_revoked: rec.is_revoked,
      max_views: rec.max_views,
      max_devices: rec.max_devices,
    };

    checks.is_expired = isTokenExpired(rec.expires_at);
    checks.now = new Date().toISOString();

    const sessions = await countTokenSessions(rec.id);
    checks.active_sessions = sessions;

    const acceptances = await countAcceptanceEvents(rec.id);
    checks.acceptance_count = acceptances;
    checks.max_views_reached = acceptances >= rec.max_views;

    if (rec.is_revoked) {
      checks.diagnosis = 'Token ist widerrufen (is_revoked=true).';
    } else if (checks.is_expired) {
      checks.diagnosis = `Token ist abgelaufen (expires_at=${rec.expires_at}, now=${checks.now}).`;
    } else if (acceptances >= rec.max_views) {
      checks.diagnosis = `max_views erreicht (${acceptances}/${rec.max_views}). Deshalb → /access/denied.`;
    } else {
      checks.diagnosis = 'Token ist gültig. Session-Erstellung sollte funktionieren.';
    }
  } catch (e) {
    checks.error = e instanceof Error ? e.message : String(e);
    checks.stack = e instanceof Error ? e.stack : undefined;
    checks.diagnosis = 'Fehler bei der Prüfung – wahrscheinlich Supabase-Verbindungsproblem.';
  }

  return NextResponse.json(checks, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
