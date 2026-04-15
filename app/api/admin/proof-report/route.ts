import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sha256HexSync } from '@/lib/utils/hash';
import { jsPDF } from 'jspdf';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'config' }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const tokenId = request.nextUrl.searchParams.get('tokenId');
  if (!tokenId) return NextResponse.json({ error: 'missing_tokenId' }, { status: 400 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'config' }, { status: 503 });

  const { data: token, error: tokErr } = await admin.from('demo_tokens').select('*').eq('id', tokenId).single();
  if (tokErr || !token) return NextResponse.json({ error: 'token_not_found' }, { status: 404 });

  const { data: sessions } = await admin.from('demo_sessions').select('*').eq('token_id', tokenId).order('started_at', { ascending: true });
  const { data: logs } = await admin.from('demo_access_logs').select('*').eq('token_id', tokenId).order('accessed_at', { ascending: true });

  const reportData = {
    title: 'Zugriffs-Nachweis – eIDConnect',
    token: {
      recipient_name: token.recipient_name,
      recipient_org: token.recipient_org,
      token: token.token,
      created_at: token.created_at,
      expires_at: token.expires_at,
      is_active: token.is_active,
      first_accessed_at: token.first_accessed_at,
      last_accessed_at: token.last_accessed_at,
      access_count: token.access_count,
    },
    sessions: (sessions ?? []).map((s: Record<string, unknown>) => ({
      started_at: s.started_at,
      ended_at: s.ended_at,
      session_duration_seconds: s.session_duration_seconds,
      ip_address: s.ip_address,
      user_agent: s.user_agent,
      language: s.language,
      timezone: s.timezone,
      referrer: s.referrer,
      viewport: s.viewport,
    })),
    access_logs: (logs ?? []).map((l: Record<string, unknown>) => ({
      accessed_at: l.accessed_at,
      event_type: l.event_type,
      page_path: l.page_path,
      ip_address: l.ip_address,
      metadata: l.metadata ?? {},
    })),
    generated_at: new Date().toISOString(),
  };

  const contentString = JSON.stringify(reportData, null, 2);
  const contentHash = sha256HexSync(contentString);

  await admin.from('proof_reports').insert({
    token_id: tokenId,
    content_hash: contentHash,
    report_data: reportData,
  });

  const doc = new jsPDF({ unit: 'mm' });
  let y = 15;

  doc.setFontSize(16);
  doc.text(reportData.title, 14, y);
  y += 12;

  doc.setFontSize(10);
  doc.text(`Empfänger: ${token.recipient_name}`, 14, y);
  y += 6;
  doc.text(`Organisation: ${token.recipient_org ?? '–'}`, 14, y);
  y += 6;
  doc.text(`Token: ${token.token}`, 14, y);
  y += 6;
  doc.text(`Erstellt: ${new Date(token.created_at).toLocaleString('de-DE')}`, 14, y);
  y += 6;
  doc.text(`Ablauf: ${new Date(token.expires_at).toLocaleString('de-DE')}`, 14, y);
  y += 6;
  doc.text(`Status: ${token.is_active ? 'Aktiv' : 'Deaktiviert'}`, 14, y);
  y += 6;
  doc.text(`Erster Zugriff: ${token.first_accessed_at ? new Date(token.first_accessed_at).toLocaleString('de-DE') : '–'}`, 14, y);
  y += 6;
  doc.text(`Letzter Zugriff: ${token.last_accessed_at ? new Date(token.last_accessed_at).toLocaleString('de-DE') : '–'}`, 14, y);
  y += 6;
  doc.text(`Anzahl Zugriffe: ${token.access_count}`, 14, y);
  y += 12;

  doc.setFontSize(11);
  doc.text('Sessions', 14, y);
  y += 8;
  doc.setFontSize(9);
  for (const s of sessions ?? []) {
    if (y > 270) { doc.addPage(); y = 15; }
    doc.text(`Start: ${new Date(s.started_at).toLocaleString('de-DE')} | Ende: ${s.ended_at ? new Date(s.ended_at).toLocaleString('de-DE') : '–'} | Dauer: ${s.session_duration_seconds ?? 0} s`, 14, y);
    y += 5;
    doc.text(`IP: ${s.ip_address ?? '–'} | Viewport: ${(s as { viewport?: string }).viewport ?? '–'}`, 14, y);
    y += 5;
    doc.text(`User-Agent: ${(s.user_agent ?? '–').slice(0, 80)}`, 14, y);
    y += 5;
    doc.text(`Sprache: ${(s as { language?: string }).language ?? '–'} | Zeitzone: ${(s as { timezone?: string }).timezone ?? '–'} | Referrer: ${(s as { referrer?: string }).referrer ?? '–'}`, 14, y);
    y += 6;
  }
  y += 6;

  doc.setFontSize(11);
  doc.text('Seitenaufrufe / Events', 14, y);
  y += 8;
  doc.setFontSize(9);
  for (const l of logs ?? []) {
    if (y > 270) { doc.addPage(); y = 15; }
    doc.text(`${new Date(l.accessed_at).toLocaleString('de-DE')} | ${l.event_type} | ${l.page_path ?? '–'}`, 14, y);
    y += 5;
    const meta = (l as { metadata?: { nda_version?: string; nda_document_hash?: string } }).metadata;
    if (l.event_type === 'terms_accepted' && meta?.nda_version) {
      doc.setFontSize(8);
      doc.text(`  NDA-Version: ${meta.nda_version} | Hash: ${(meta.nda_document_hash ?? '–').slice(0, 32)}…`, 14, y);
      y += 5;
      doc.setFontSize(9);
    }
  }

  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.text(`SHA-256: ${contentHash}`, 14, footerY);
  doc.text(`Generiert: ${new Date().toLocaleString('de-DE')}`, 14, footerY + 5);
  doc.text('Dieser Report dokumentiert den technischen Zugriff auf eine personalisierte Demo-Umgebung.', 14, footerY + 10);

  const buf = Buffer.from(doc.output('arraybuffer'));
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Zugriffs-Nachweis.pdf"',
    },
  });
}
