import { NextRequest, NextResponse } from 'next/server';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

/**
 * GET /api/admin/email-config
 *
 * Liefert eine sichere Diagnose, OHNE Secrets preiszugeben:
 * - ist `RESEND_API_KEY` gesetzt
 * - welcher From-Absender wird benutzt (sichtbar)
 * - läuft Resend noch im Sandbox-/Testmodus (`onboarding@resend.dev`)
 * - Hinweis-Text und Schritte zur Behebung
 *
 * Wir rufen Resend NICHT live auf, damit kein Versand entsteht.
 */
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

  const apiKeyPresent = Boolean(process.env.RESEND_API_KEY);
  const apiKeyLooksValid =
    apiKeyPresent && /^re_[A-Za-z0-9_-]{6,}$/.test(process.env.RESEND_API_KEY ?? '');

  const fromRaw = process.env.SEND_ACCESS_EMAIL_FROM ?? '';
  const fromUsedForSend = fromRaw || 'HookAI Demo <onboarding@resend.dev>';

  const fromAddressMatch = fromUsedForSend.match(/<([^>]+)>/);
  const fromAddress = (fromAddressMatch?.[1] ?? fromUsedForSend).trim().toLowerCase();
  const fromDomain = fromAddress.includes('@') ? fromAddress.split('@')[1] : '';

  const isResendSandboxDomain = fromDomain === 'resend.dev';
  const isFreeMailDomain = ['gmail.com', 'gmx.de', 'gmx.net', 'web.de', 'yahoo.de', 'yahoo.com', 't-online.de', 'outlook.com', 'hotmail.com'].includes(fromDomain);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const accessLinkBaseUrl = process.env.ACCESS_LINK_BASE_URL ?? '';
  const effectiveLinkBase = accessLinkBaseUrl || appUrl;

  const blockingIssues: string[] = [];
  if (!apiKeyPresent) {
    blockingIssues.push('RESEND_API_KEY ist nicht gesetzt – es kann gar keine E-Mail versendet werden.');
  } else if (!apiKeyLooksValid) {
    blockingIssues.push('RESEND_API_KEY hat nicht das Format `re_…` – möglicherweise ungültig.');
  }
  if (isResendSandboxDomain) {
    blockingIssues.push(
      'Absender steht auf der Resend-Sandbox-Domain `onboarding@resend.dev`. Resend liefert in diesem Modus NUR an die im Resend-Account verifizierte Adresse (z. B. deine eigene Mail). Tester erhalten nichts. Lösung: in Resend eine Domain verifizieren und `SEND_ACCESS_EMAIL_FROM` in Vercel auf `HookAI <noreply@deine-domain.de>` setzen.'
    );
  }
  if (isFreeMailDomain) {
    blockingIssues.push(
      `Absender liegt auf einer Freemail-Domain (${fromDomain}). Resend kann solche Domains nicht für dich verifizieren – du brauchst eine eigene Domain (z. B. hookai.de) und musst sie unter resend.com/domains per DNS-Records verifizieren.`
    );
  }
  if (!effectiveLinkBase) {
    blockingIssues.push('Weder `NEXT_PUBLIC_APP_URL` noch `ACCESS_LINK_BASE_URL` ist gesetzt – Zugangslinks könnten auf localhost zeigen.');
  } else if (/localhost|127\.0\.0\.1/.test(effectiveLinkBase)) {
    blockingIssues.push(
      `Link-Basis zeigt auf eine lokale Adresse (${effectiveLinkBase}). Tester können den Link nicht öffnen. In Vercel NEXT_PUBLIC_APP_URL auf die Live-URL setzen.`
    );
  }

  const ready = blockingIssues.length === 0;

  return NextResponse.json({
    success: true,
    ready,
    apiKeyPresent,
    apiKeyLooksValid,
    from: fromUsedForSend,
    fromDomain,
    isResendSandboxDomain,
    isFreeMailDomain,
    appUrl,
    accessLinkBaseUrl,
    effectiveLinkBase,
    blockingIssues,
    nextSteps: ready
      ? []
      : [
          'In Resend (resend.com/domains) eine eigene Domain hinzufügen und die DNS-Records (MX/TXT/DKIM) im DNS-Provider eintragen, bis Resend „Verified“ anzeigt.',
          'In Vercel → Project → Settings → Environment Variables: `SEND_ACCESS_EMAIL_FROM` setzen, z. B. `HookAI Demo <noreply@deine-domain.de>`.',
          'Vercel-Redeploy auslösen (Settings → Deployments → letzter Deploy → Redeploy).',
          'In Admin → Access Requests einen Test mit einer externen Adresse auslösen.',
        ],
  });
}
