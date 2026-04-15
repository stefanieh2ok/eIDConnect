import { NextRequest, NextResponse } from 'next/server';
import { isValidBasicAuth } from '@/lib/security/basic-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createAccessToken } from '@/lib/access-request-approve';
const DEFAULT_FROM =
  process.env.SEND_ACCESS_EMAIL_FROM || 'eIDConnect Demo <onboarding@resend.dev>';

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
    process.env.ACCESS_LINK_BASE_URL ||
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

  // Alle anderen offenen Anfragen derselben E-Mail schließen, damit der Nutzer nicht
  // weiter „Sie haben bereits eine offene Anfrage“ sieht und den Zugang nutzen kann.
  await supabaseAdmin
    .from('access_requests')
    .update({ status: 'rejected', reviewed_at: now })
    .eq('email', req.email)
    .eq('status', 'pending')
    .neq('id', id);

  let emailSent = false;
  let emailError: string | null = null;

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
          subject: 'Dein eIDConnect Demo-Zugang wurde freigegeben',
          html: `
          <p>Hallo ${escapeHtml(req.full_name)},</p>
          <p>Dein Zugang wurde freigegeben. Hier ist dein personalisierter Link:</p>
          <p><a href="${escapeHtml(tokenResult.accessUrl)}" style="word-break: break-all;">${escapeHtml(
            tokenResult.accessUrl
          )}</a></p>
          <p>Bitte öffne den Link in deinem Browser. Nach deiner Zustimmung zur Vertraulichkeitsvereinbarung gelangst du in die Demo.</p>
          <p>Mit freundlichen Grüßen<br />Stefanie Hook</p>
        `,
        }),
      });
      const text = await res.text();
      if (res.ok) {
        emailSent = true;
      } else {
        emailError = text || `HTTP ${res.status}`;
        console.error('Approve email failed:', res.status, text);
      }
    } catch (mailErr) {
      emailError = mailErr instanceof Error ? mailErr.message : String(mailErr);
      console.error('Approve email failed:', mailErr);
    }
  } else {
    emailError = 'RESEND_API_KEY ist nicht gesetzt (Environment Variables prüfen).';
  }

  return NextResponse.json({
    success: true,
    accessUrl: tokenResult.accessUrl,
    rawToken: tokenResult.rawToken,
    emailSent,
    emailError: emailError || undefined,
  });
}
