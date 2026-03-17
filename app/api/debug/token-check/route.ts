import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  countAcceptanceEvents,
  countTokenSessions,
  findAccessTokenByRawToken,
  isTokenExpired,
} from '@/lib/security/token';

async function tableExists(name: string): Promise<{ exists: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from(name).select('id').limit(1);
  if (error) return { exists: false, error: error.message };
  return { exists: true };
}

async function tryInsertSession(tokenId: string, demoId: string): Promise<{ ok: boolean; error?: string }> {
  const { sha256 } = await import('@/lib/security/hash');
  const fakeToken = 'debug_test_' + Date.now();
  const hash = sha256(fakeToken);
  const { data, error } = await supabaseAdmin
    .from('demo_sessions')
    .insert({
      token_id: null,
      access_token_id: tokenId,
      demo_id: demoId,
      session_token_hash: hash,
      started_at: new Date().toISOString(),
      session_expires_at: new Date(Date.now() + 60_000).toISOString(),
      is_active: false,
      is_live: false,
      full_name: 'DEBUG TEST',
      company: null,
      email: null,
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  // Clean up
  if (data?.id) {
    await supabaseAdmin.from('demo_sessions').delete().eq('id', data.id);
  }
  return { ok: true };
}

/**
 * GET /api/debug/token-check?token=dm_xxx
 * Diagnose-Infos: Token-Status, Tabellen-Checks, Session-Insert-Test.
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
    node_env: process.env.NODE_ENV,
  };

  // Table existence checks
  const tables = ['demo_access_tokens', 'demo_sessions', 'demo_acceptance_logs', 'nda_acceptance_logs', 'audit_logs', 'demo_one_time_entry', 'demo_docusign_envelopes'];
  const tableChecks: Record<string, unknown> = {};
  for (const t of tables) {
    tableChecks[t] = await tableExists(t);
  }
  checks.tables = tableChecks;

  try {
    const rec = await findAccessTokenByRawToken(token);
    if (!rec) {
      checks.tokenRecord = null;
      checks.diagnosis = 'Token nicht in der Datenbank gefunden.';
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

    // Test session insert
    checks.session_insert_test = await tryInsertSession(rec.id, rec.demo_id);

    // Test nda_acceptance_logs insert
    try {
      const { error: ndaErr } = await supabaseAdmin.from('nda_acceptance_logs').insert({
        token: 'debug_test',
        recipient_name: 'DEBUG',
        recipient_org: null,
        nda_version: 'test',
        nda_text_checksum: 'test',
        accepted_at: new Date().toISOString(),
        ip_address: null,
        user_agent: null,
        session_id: null,
      }).select('id').single();
      if (ndaErr) {
        checks.nda_log_insert_test = { ok: false, error: ndaErr.message };
      } else {
        checks.nda_log_insert_test = { ok: true };
        await supabaseAdmin.from('nda_acceptance_logs').delete().eq('token', 'debug_test');
      }
    } catch (e) {
      checks.nda_log_insert_test = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }

    const problems: string[] = [];
    if (rec.is_revoked) problems.push('Token widerrufen');
    if (checks.is_expired) problems.push(`Token abgelaufen (${rec.expires_at})`);
    if (acceptances >= rec.max_views) problems.push(`max_views erreicht (${acceptances}/${rec.max_views})`);

    const failedTables = Object.entries(tableChecks)
      .filter(([, v]) => !(v as { exists: boolean }).exists)
      .map(([k]) => k);
    if (failedTables.length > 0) problems.push(`Fehlende Tabellen: ${failedTables.join(', ')}`);

    if ((checks.session_insert_test as { ok: boolean }).ok === false) {
      problems.push(`Session-Insert schlägt fehl: ${(checks.session_insert_test as { error?: string }).error}`);
    }
    if ((checks.nda_log_insert_test as { ok: boolean }).ok === false) {
      problems.push(`NDA-Log-Insert schlägt fehl: ${(checks.nda_log_insert_test as { error?: string }).error}`);
    }

    checks.diagnosis = problems.length > 0
      ? `PROBLEME: ${problems.join(' | ')}`
      : 'Alles OK – Token gültig, alle Tabellen erreichbar, Insert-Tests bestanden.';
  } catch (e) {
    checks.error = e instanceof Error ? e.message : String(e);
    checks.stack = e instanceof Error ? e.stack : undefined;
    checks.diagnosis = 'Fehler bei der Prüfung – wahrscheinlich Supabase-Verbindungsproblem.';
  }

  return NextResponse.json(checks, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
