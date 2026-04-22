import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

export const dynamic = 'force-dynamic';

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
    const demoId = url.searchParams.get('demoId');
    const eventType = url.searchParams.get('eventType');

    let query = supabaseAdmin
      .from('audit_logs')
      .select(
        `
          id,
          demo_id,
          token_id,
          session_id,
          event_type,
          event_data,
          ip_address,
          user_agent,
          device_fingerprint,
          created_at
        `
      )
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 500));

    if (demoId?.trim()) {
      query = query.eq('demo_id', demoId.trim());
    }

    if (eventType?.trim()) {
      query = query.eq('event_type', eventType.trim());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetching audit logs failed:', error);
      return NextResponse.json(
        { success: false, error: 'Audit-Logs konnten nicht geladen werden.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: data ?? [],
    });
  } catch (error) {
    console.error('Admin audit route failed:', error);
    return NextResponse.json(
      { success: false, error: 'Audit-Endpoint fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
