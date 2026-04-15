import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

type Body = {
  recipientName: string;
  recipientOrg?: string;
  expiresInDays?: number;
};

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 30) || 'demo';
}

/**
 * POST /api/admin/create-demo-token
 * Erstellt einen Demo-Link (ohne NDA). Admin Basic Auth erforderlich.
 */
export async function POST(request: NextRequest) {
  if (!isValidBasicAuth(request.headers.get('authorization'))) {
    return NextResponse.json(
      { success: false, error: 'Nicht autorisiert.' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' } }
    );
  }

  try {
    const body = (await request.json()) as Body;
    const recipientName = (body.recipientName ?? '').trim();
    const recipientOrg = (body.recipientOrg ?? '').trim() || null;
    const expiresInDays = Math.max(1, Number(body.expiresInDays) || 30);

    if (!recipientName) {
      return NextResponse.json(
        { success: false, error: 'Empfänger-Name ist ein Pflichtfeld.' },
        { status: 400 }
      );
    }

    const exp = new Date();
    exp.setDate(exp.getDate() + expiresInDays);
    const token = `${slug(recipientOrg || recipientName)}-${Date.now().toString(36)}`;

    const { data, error } = await supabaseAdmin
      .from('demo_tokens')
      .insert({
        token,
        recipient_name: recipientName,
        recipient_org: recipientOrg,
        expires_at: exp.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('create-demo-token failed:', error);
      return NextResponse.json(
        { success: false, error: 'Link konnte nicht erstellt werden.' },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.nextUrl?.origin ?? '').replace(/\/$/, '');
    const demoUrl = `${baseUrl}/demo?token=${encodeURIComponent(token)}`;

    return NextResponse.json({
      success: true,
      token: data,
      demoUrl,
    });
  } catch (e) {
    console.error('create-demo-token:', e);
    return NextResponse.json(
      { success: false, error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
