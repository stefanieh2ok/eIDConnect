import { NextRequest, NextResponse } from 'next/server';
import { isValidBasicAuth } from '@/lib/security/basic-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isValidBasicAuth(request.headers.get('authorization'))) {
    return NextResponse.json(
      { success: false, error: 'Nicht autorisiert.' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Anfrage-ID fehlt.' },
      { status: 400 }
    );
  }

  const { data: req, error: fetchError } = await supabaseAdmin
    .from('access_requests')
    .select('id, status')
    .eq('id', id)
    .single();

  if (fetchError || !req) {
    return NextResponse.json(
      { success: false, error: 'Anfrage nicht gefunden.' },
      { status: 404 }
    );
  }

  if (req.status !== 'pending') {
    return NextResponse.json(
      { success: false, error: 'Diese Anfrage wurde bereits bearbeitet.' },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from('access_requests')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Access-request reject failed:', updateError);
    return NextResponse.json(
      { success: false, error: 'Anfrage konnte nicht abgelehnt werden.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
