import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

export async function GET(request: NextRequest) {
  if (!isValidBasicAuth(request.headers.get('authorization'))) {
    return NextResponse.json(
      { success: false, error: 'Nicht autorisiert.' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // pending | approved | rejected | leer = alle

  // Robust gegen fehlende Migration 011 (email_* Spalten). Wir probieren zuerst
  // den vollen Spalten-Satz; bei 42703 (undefined_column) fallen wir auf den
  // Minimal-Satz zurueck, damit die Liste und damit der Freigabe-Flow immer
  // funktionieren. Das UI behandelt fehlende email_*-Felder ohnehin als null.
  const FULL_COLS =
    'id, full_name, email, company, status, created_at, reviewed_at, demo_access_token_id, email_provider, email_provider_id, email_status, email_sent_at, email_last_error';
  const MIN_COLS =
    'id, full_name, email, company, status, created_at, reviewed_at, demo_access_token_id';

  const runQuery = async (cols: string) => {
    let q = supabaseAdmin
      .from('access_requests')
      .select(cols)
      .order('created_at', { ascending: false });
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      q = q.eq('status', status);
    }
    return q;
  };

  let { data, error } = await runQuery(FULL_COLS);
  if (error && (error.code === '42703' || /does not exist/i.test(error.message ?? ''))) {
    console.warn(
      'Access-requests list: email_* Spalten fehlen (Migration 011 nicht ausgefuehrt) - fallback auf Minimal-Select.'
    );
    const retry = await runQuery(MIN_COLS);
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Access-requests list failed:', error);
    return NextResponse.json(
      { success: false, error: 'Anfragen konnten nicht geladen werden.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, requests: data ?? [] });
}
