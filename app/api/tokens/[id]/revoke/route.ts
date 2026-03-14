import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Token-ID fehlt.' },
        { status: 400 }
      );
    }

    const { error: revokeError } = await supabaseAdmin
      .from('demo_access_tokens')
      .update({ is_revoked: true })
      .eq('id', id);

    if (revokeError) {
      console.error('Token revoke failed:', revokeError);
      return NextResponse.json(
        { success: false, error: 'Token konnte nicht widerrufen werden.' },
        { status: 500 }
      );
    }

    const { error: sessionError } = await supabaseAdmin
      .from('demo_sessions')
      .update({ is_active: false, is_live: false, ended_at: new Date().toISOString() })
      .eq('access_token_id', id)
      .eq('is_active', true);

    if (sessionError) {
      console.error('Session revoke failed:', sessionError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke route failed:', error);
    return NextResponse.json(
      { success: false, error: 'Widerruf fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
