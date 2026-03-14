import { NextRequest, NextResponse } from 'next/server';
import { isValidBasicAuth } from '@/lib/security/basic-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createAccessToken } from '@/lib/access-request-approve';
const DEFAULT_FROM =
  process.env.SEND_ACCESS_EMAIL_FROM || 'HookAI Demo <onboarding@resend.dev>';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
    .select('id, full_name, email, company, status')
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

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (request.headers.get('x-forwarded-proto') && request.headers.get('host')
      ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('host')}`
      : new URL(request.url).origin);

  const tokenResult = await createAccessToken(
    {
      fullName: req.full_name,
      email: req.email,
      company: req.company,
    },
    baseUrl
  );

  if (!tokenResult.success) {
    return NextResponse.json(
      { success: false, error: tokenResult.error || 'Token konnte nicht erstellt werden.' },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from('access_requests')
    .update({
      status: 'approved',
      reviewed_at: now,
      demo_access_token_id: tokenResult.tokenId,
    })
    .eq('id', id);

  if (updateError) {
    console.error('Access-request approve update failed:', updateError);
    return NextResponse.json(
      { success: false, error: 'Anfrage konnte nicht aktualisiert werden.' },
      { status: 500 }
    );
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: DEFAULT_FROM,
          to: [req.email],
          subject: 'Ihr HookAI Demo-Zugang wurde freigegeben',
          html: `
          <p>Hallo ${escapeHtml(req.full_name)},</p>
          <p>Ihr Zugang wurde freigegeben. Hier ist Ihr personalisierter Link:</p>
          <p><a href="${escapeHtml(tokenResult.accessUrl)}" style="word-break: break-all;">${escapeHtml(
            tokenResult.accessUrl
          )}</a></p>
          <p>Bitte öffnen Sie den Link in Ihrem Browser. Nach Ihrer Zustimmung zur Vertraulichkeitsvereinbarung gelangen Sie in die Demo.</p>
          <p>Mit freundlichen Grüßen<br />Ihr HookAI-Team</p>
        `,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Approve email failed:', res.status, text);
      }
    } catch (mailErr) {
      console.error('Approve email failed:', mailErr);
    }
  }

  return NextResponse.json({
    success: true,
    accessUrl: tokenResult.accessUrl,
    rawToken: tokenResult.rawToken,
    emailSent: !!process.env.RESEND_API_KEY,
  });
}
