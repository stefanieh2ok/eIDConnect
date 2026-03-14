import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

export async function GET(request: NextRequest) {
  try {
    if (!isValidBasicAuth(request.headers.get('authorization'))) {
      return NextResponse.json(
        { success: false, error: 'Nicht autorisiert.' },
        {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
        }
      );
    }

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '100');

    const { data, error } = await supabaseAdmin
      .from('demo_access_tokens')
      .select(
        `
          id,
          demo_id,
          full_name,
          company,
          email,
          nda_version,
          expires_at,
          max_views,
          max_devices,
          is_revoked,
          created_at
        `
      )
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 500));

    if (error) {
      console.error('Fetching tokens failed:', error);
      return NextResponse.json(
        { success: false, error: 'Tokens konnten nicht geladen werden.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tokens: data ?? [],
    });
  } catch (error) {
    console.error('Admin tokens route failed:', error);
    return NextResponse.json(
      { success: false, error: 'Token-Übersicht fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
