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

  let query = supabaseAdmin
    .from('access_requests')
    .select('id, full_name, email, company, status, created_at, reviewed_at, demo_access_token_id, email_provider, email_provider_id, email_status, email_sent_at, email_last_error')
    .order('created_at', { ascending: false });

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Access-requests list failed:', error);
    return NextResponse.json(
      { success: false, error: 'Anfragen konnten nicht geladen werden.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, requests: data ?? [] });
}
