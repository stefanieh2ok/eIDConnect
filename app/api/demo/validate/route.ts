import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/demo/validate?token=xxx
 * Serverseitige Token-Validierung. Kein Service-Role-Key im Client.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token?.trim()) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'config' }, { status: 503 });
  }

  const { data: row, error } = await supabase
    .from('demo_tokens')
    .select('id, token, recipient_name, recipient_org, expires_at, is_active')
    .eq('token', token.trim())
    .single();

  if (error || !row) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 404 });
  }

  const now = new Date();
  const expiresAt = new Date(row.expires_at);
  if (!row.is_active || expiresAt <= now) {
    return NextResponse.json({ error: 'expired_or_inactive' }, { status: 403 });
  }

  return NextResponse.json({
    tokenId: row.id,
    recipientName: row.recipient_name,
    recipientOrg: row.recipient_org ?? '',
  });
}
