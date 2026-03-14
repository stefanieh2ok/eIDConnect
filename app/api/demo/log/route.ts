import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCanonicalContentForHash } from '@/lib/nda-canonical.server';
import { sha256HexSync } from '@/lib/utils/hash';
import { NDA_VERSION } from '@/lib/nda-content';

function getClientMeta(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;
  const userAgent = request.headers.get('user-agent') ?? null;
  const language = request.headers.get('accept-language')?.split(',')[0] ?? null;
  return { ip, userAgent, language };
}

/**
 * POST /api/demo/log
 * Body: { tokenId, sessionId?, eventType, pagePath?, metadata? }
 * eventType: demo_open | page_view | heartbeat | demo_close | token_expired_attempt | terms_accepted
 * Erstellt Session bei demo_open; schließt Session bei demo_close.
 */
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'config' }, { status: 503 });
  }

  let body: {
    tokenId?: string;
    token?: string;
    sessionId?: string;
    eventType: string;
    pagePath?: string;
    metadata?: Record<string, unknown>;
    nda_version?: string;
    viewport?: string;
    timezone?: string;
    referrer?: string;
    sessionDurationSeconds?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { tokenId, token, sessionId, eventType, pagePath, metadata, nda_version: bodyNdaVersion, viewport, timezone, referrer, sessionDurationSeconds } = body;
  const allowed = ['demo_open', 'page_view', 'heartbeat', 'demo_close', 'token_expired_attempt', 'terms_accepted'];
  if (!eventType || !allowed.includes(eventType)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }
  if (eventType !== 'token_expired_attempt' && !tokenId) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  const { ip, userAgent, language } = getClientMeta(request);

  if (eventType === 'demo_open') {
    const { data: session, error: sessErr } = await supabase
      .from('demo_sessions')
      .insert({
        token_id: tokenId,
        ip_address: ip,
        user_agent: userAgent,
        language: language ?? undefined,
        timezone: timezone ?? undefined,
        referrer: referrer ?? undefined,
        viewport: viewport ?? undefined,
        is_live: true,
      })
      .select('id')
      .single();

    if (sessErr) {
      return NextResponse.json({ error: 'session_create_failed' }, { status: 500 });
    }

    const { data: tok } = await supabase.from('demo_tokens').select('first_accessed_at, access_count').eq('id', tokenId).single();
    await supabase
      .from('demo_tokens')
      .update({
        first_accessed_at: tok?.first_accessed_at ?? new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        access_count: (tok?.access_count ?? 0) + 1,
      })
      .eq('id', tokenId);

    await supabase.from('demo_access_logs').insert({
      session_id: session.id,
      token_id: tokenId,
      ip_address: ip,
      user_agent: userAgent,
      page_path: pagePath ?? '/demo',
      event_type: 'demo_open',
      metadata: metadata ?? {},
    });

    return NextResponse.json({ sessionId: session.id });
  }

  if (eventType === 'demo_close' && sessionId) {
    await supabase
      .from('demo_sessions')
      .update({
        ended_at: new Date().toISOString(),
        is_live: false,
        session_duration_seconds: sessionDurationSeconds ?? 0,
      })
      .eq('id', sessionId);

    await supabase.from('demo_tokens').update({
      last_accessed_at: new Date().toISOString(),
    }).eq('id', tokenId);

    await supabase.from('demo_access_logs').insert({
      session_id: sessionId,
      token_id: tokenId,
      ip_address: ip,
      user_agent: userAgent,
      page_path: pagePath ?? null,
      event_type: 'demo_close',
      metadata: metadata ?? {},
    });

    return NextResponse.json({ ok: true });
  }

  if (eventType === 'page_view' || eventType === 'heartbeat') {
    if (sessionId) {
      await supabase.from('demo_tokens').update({
        last_accessed_at: new Date().toISOString(),
      }).eq('id', tokenId);

    if (eventType === 'heartbeat') {
      await supabase
        .from('demo_sessions')
        .update({ is_live: true })
        .eq('id', sessionId);
    }
    }

    await supabase.from('demo_access_logs').insert({
      session_id: sessionId ?? null,
      token_id: tokenId,
      ip_address: ip,
      user_agent: userAgent,
      page_path: pagePath ?? null,
      event_type: eventType,
      metadata: metadata ?? {},
    });

    return NextResponse.json({ ok: true });
  }

  if (eventType === 'terms_accepted') {
    if (tokenId) {
      const ndaVersion = bodyNdaVersion ?? NDA_VERSION;
      const canonicalContent = getCanonicalContentForHash();
      const ndaDocumentHash = sha256HexSync(canonicalContent);

      await supabase.from('demo_tokens').update({
        last_accessed_at: new Date().toISOString(),
      }).eq('id', tokenId);

      await supabase.from('demo_access_logs').insert({
        session_id: sessionId ?? null,
        token_id: tokenId,
        ip_address: ip,
        user_agent: userAgent,
        page_path: pagePath ?? '/demo',
        event_type: 'terms_accepted',
        metadata: {
          ...(metadata ?? {}),
          nda_version: ndaVersion,
          nda_document_hash: ndaDocumentHash,
        },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (eventType === 'token_expired_attempt') {
    let logTokenId = tokenId;
    if (!logTokenId && body.token) {
      const { data: t } = await supabase.from('demo_tokens').select('id').eq('token', body.token).single();
      logTokenId = t?.id ?? null;
    }
    if (logTokenId) {
      await supabase.from('demo_access_logs').insert({
        token_id: logTokenId,
        ip_address: ip,
        user_agent: userAgent,
        page_path: pagePath ?? null,
        event_type: 'token_expired_attempt',
        metadata: metadata ?? {},
      });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
}
