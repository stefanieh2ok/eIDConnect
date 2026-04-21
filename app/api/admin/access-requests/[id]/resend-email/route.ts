import { NextRequest, NextResponse } from 'next/server';
import { isValidBasicAuth } from '@/lib/security/basic-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createAccessToken } from '@/lib/access-request-approve';
import { updateAccessRequestEmailTracking } from '@/lib/access-request-email-tracking';

const DEFAULT_FROM =
  process.env.SEND_ACCESS_EMAIL_FROM || 'HookAI Demo <onboarding@resend.dev>';
const RESEND_TESTMODE_HINT =
  'Resend-Testmodus aktiv: E-Mails an externe Tester werden blockiert. Bitte Resend-Domain verifizieren und SEND_ACCESS_EMAIL_FROM setzen.';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * POST /api/admin/access-requests/[id]/resend-email
 * Sendet die Zugangs-E-Mail für eine bereits freigegebene Anfrage erneut
 * (erstellt dabei einen neuen Token/Link).
 */
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

  if (req.status !== 'approved') {
    return NextResponse.json(
      { success: false, error: 'Nur bei freigegebenen Anfragen kann die E-Mail erneut gesendet werden.' },
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

  const { error: updateError } = await supabaseAdmin
    .from('access_requests')
    .update({ demo_access_token_id: tokenResult.tokenId })
    .eq('id', id);

  if (updateError) {
    console.error('Resend-email: update access_requests failed', updateError);
  }

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
          subject: 'Dein HookAI Demo-Zugang (Link erneut gesendet)',
          html: `
          <p>Hallo ${escapeHtml(req.full_name)},</p>
          <p>wie gewünscht senden wir dir deinen Zugangslink zur App erneut:</p>
          <p><a href="${escapeHtml(tokenResult.accessUrl)}" style="word-break: break-all;">${escapeHtml(
            tokenResult.accessUrl
          )}</a></p>
          <p>Bitte öffne den Link im Browser deines Geräts. Der Link führt zuerst zur Vertraulichkeitsvereinbarung und danach direkt in die Demo-App.</p>
          <p>Mit freundlichen Grüßen,<br />Stefanie Hook</p>
        `,
        }),
      });
      const text = await res.text();
      let providerId: string | undefined;
      try {
        const parsed = JSON.parse(text) as { id?: string };
        providerId = parsed?.id;
      } catch {
        providerId = undefined;
      }
      if (res.ok) {
        emailSent = true;
        await updateAccessRequestEmailTracking(id, {
          email_provider: 'resend',
          email_provider_id: providerId ?? null,
          email_status: 'sent',
          email_sent_at: new Date().toISOString(),
          email_last_error: null,
        });
      } else {
        const isResendTestModeBlock =
          res.status === 403 &&
          text.toLowerCase().includes('only send testing emails to your own email');
        emailError = isResendTestModeBlock ? RESEND_TESTMODE_HINT : text || `HTTP ${res.status}`;
        console.error('Resend-email failed:', res.status, text);
        await updateAccessRequestEmailTracking(id, {
          email_provider: 'resend',
          email_provider_id: providerId ?? null,
          email_status: 'failed',
          email_last_error: emailError,
        });
      }
    } catch (mailErr) {
      emailError = mailErr instanceof Error ? mailErr.message : String(mailErr);
      console.error('Resend-email failed:', mailErr);
      await updateAccessRequestEmailTracking(id, {
        email_provider: 'resend',
        email_status: 'failed',
        email_last_error: emailError,
      });
    }
  } else {
    emailError = 'RESEND_API_KEY ist nicht gesetzt (Environment Variables prüfen).';
    await updateAccessRequestEmailTracking(id, {
      email_status: 'failed',
      email_last_error: emailError,
    });
  }

  return NextResponse.json({
    success: true,
    accessUrl: tokenResult.accessUrl,
    emailSent,
    emailError: emailError || undefined,
  });
}
