/**
 * Generiert einen frischen Access-Token fuer eine bereits freigegebene
 * Zugangsanfrage und verschickt den Zugangslink via Resend.
 *
 * Wird von zwei Stellen benutzt:
 * - Admin-UI: `/api/admin/access-requests/[id]/resend-email` (manueller Resend).
 * - Self-Service: `/api/request-access` (Tester fuellt Formular erneut aus;
 *   wenn die Mail bereits einmal freigegeben wurde, bekommen sie sofort einen
 *   neuen Link, ohne im Postfach suchen zu muessen).
 */
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

export type SendAccessEmailInput = {
  accessRequestId: string;
  fullName: string;
  email: string;
  company?: string | null;
  baseUrl: string;
  /**
   * Formulierung fuer den Betreff / Einstieg. Admin-Resend hat eine andere
   * Formulierung als Self-Service ("erneut gesendet" vs. "neuer Link").
   */
  intent: 'admin-resend' | 'self-service-resend' | 'admin-approve';
};

export type SendAccessEmailResult = {
  accessUrl: string;
  rawToken: string;
  emailSent: boolean;
  emailError?: string;
};

export async function sendAccessEmailForRequest(
  input: SendAccessEmailInput
): Promise<SendAccessEmailResult | { error: string }> {
  const tokenResult = await createAccessToken(
    {
      fullName: input.fullName,
      email: input.email,
      company: input.company ?? null,
    },
    input.baseUrl
  );

  if (!tokenResult.success) {
    return { error: tokenResult.error || 'Token konnte nicht erstellt werden.' };
  }

  // Neuer Token ist jetzt der aktive. Zusaetzlich das access_requests-Feld
  // demo_access_token_id refreshen, damit der Admin den aktuellen Token-Link
  // wiederfindet. Fehler hier blockieren den Versand nicht.
  {
    const { error: updErr } = await supabaseAdmin
      .from('access_requests')
      .update({ demo_access_token_id: tokenResult.tokenId })
      .eq('id', input.accessRequestId);
    if (updErr) {
      console.error('sendAccessEmailForRequest: update demo_access_token_id failed', updErr);
    }
  }

  const subject =
    input.intent === 'admin-approve'
      ? 'Dein HookAI Demo-Zugang wurde freigegeben'
      : input.intent === 'admin-resend'
        ? 'Dein HookAI Demo-Zugang (Link erneut gesendet)'
        : 'Dein HookAI Demo-Zugang (neuer Link)';

  const leadIn =
    input.intent === 'self-service-resend'
      ? 'du hattest bereits einen freigegebenen Zugang. Hier ist dein neuer, persoenlicher Zugangslink zur App:'
      : input.intent === 'admin-resend'
        ? 'wie gewuenscht senden wir dir deinen Zugangslink zur App erneut:'
        : 'dein Zugang wurde freigegeben. Hier ist dein personalisierter Link zur App:';

  const html = `
    <p>Hallo ${escapeHtml(input.fullName)},</p>
    <p>${leadIn}</p>
    <p><a href="${escapeHtml(tokenResult.accessUrl)}" style="word-break: break-all;">${escapeHtml(
      tokenResult.accessUrl
    )}</a></p>
    <p>Bitte &ouml;ffne den Link im Browser deines Ger&auml;ts. Der Link f&uuml;hrt zuerst zur Vertraulichkeitsvereinbarung und danach direkt in die Demo-App.</p>
    <p>Mit freundlichen Gr&uuml;&szlig;en,<br />Stefanie Hook</p>
  `;

  if (!process.env.RESEND_API_KEY) {
    const emailError = 'RESEND_API_KEY ist nicht gesetzt (Environment Variables pruefen).';
    await updateAccessRequestEmailTracking(input.accessRequestId, {
      email_status: 'failed',
      email_last_error: emailError,
    });
    return {
      accessUrl: tokenResult.accessUrl,
      rawToken: tokenResult.rawToken,
      emailSent: false,
      emailError,
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: DEFAULT_FROM,
        to: [input.email],
        subject,
        html,
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
      await updateAccessRequestEmailTracking(input.accessRequestId, {
        email_provider: 'resend',
        email_provider_id: providerId ?? null,
        email_status: 'sent',
        email_sent_at: new Date().toISOString(),
        email_last_error: null,
      });
      return {
        accessUrl: tokenResult.accessUrl,
        rawToken: tokenResult.rawToken,
        emailSent: true,
      };
    }

    const isResendTestModeBlock =
      res.status === 403 &&
      text.toLowerCase().includes('only send testing emails to your own email');
    const emailError = isResendTestModeBlock
      ? RESEND_TESTMODE_HINT
      : text || `HTTP ${res.status}`;
    console.error('sendAccessEmailForRequest: email failed', res.status, text);
    await updateAccessRequestEmailTracking(input.accessRequestId, {
      email_provider: 'resend',
      email_provider_id: providerId ?? null,
      email_status: 'failed',
      email_last_error: emailError,
    });
    return {
      accessUrl: tokenResult.accessUrl,
      rawToken: tokenResult.rawToken,
      emailSent: false,
      emailError,
    };
  } catch (mailErr) {
    const emailError = mailErr instanceof Error ? mailErr.message : String(mailErr);
    console.error('sendAccessEmailForRequest: exception', mailErr);
    await updateAccessRequestEmailTracking(input.accessRequestId, {
      email_provider: 'resend',
      email_status: 'failed',
      email_last_error: emailError,
    });
    return {
      accessUrl: tokenResult.accessUrl,
      rawToken: tokenResult.rawToken,
      emailSent: false,
      emailError,
    };
  }
}
