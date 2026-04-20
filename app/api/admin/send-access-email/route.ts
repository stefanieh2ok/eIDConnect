import { NextRequest, NextResponse } from 'next/server';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

const DEFAULT_FROM =
  process.env.SEND_ACCESS_EMAIL_FROM || 'HookAI Demo <onboarding@resend.dev>';
const RESEND_TESTMODE_HINT =
  'Resend-Testmodus aktiv: E-Mails an externe Tester werden blockiert. Bitte Resend-Domain verifizieren und SEND_ACCESS_EMAIL_FROM setzen.';

type Body = {
  to: string;
  accessUrl: string;
  recipientName: string;
};

function normalizeAccessUrl(rawUrl: string): string {
  const input = rawUrl.trim();
  const preferredBase =
    process.env.ACCESS_LINK_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    '';
  if (!preferredBase) return input;

  try {
    const parsed = new URL(input);
    const host = parsed.hostname.toLowerCase();
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1';
    if (!isLocalHost) return input;
    const base = new URL(preferredBase);
    return `${base.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return input;
  }
}

export async function POST(request: NextRequest) {
  if (!isValidBasicAuth(request.headers.get('authorization'))) {
    return NextResponse.json(
      { success: false, error: 'Nicht autorisiert.' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Ungültige Anfrage.' },
      { status: 400 }
    );
  }

  const { to, accessUrl, recipientName } = body;
  if (!to || typeof to !== 'string' || !accessUrl || typeof accessUrl !== 'string') {
    return NextResponse.json(
      { success: false, error: 'E-Mail-Adresse und Zugangs-URL sind erforderlich.' },
      { status: 400 }
    );
  }

  const email = to.trim();
  const url = normalizeAccessUrl(accessUrl);
  const name = (recipientName && typeof recipientName === 'string' ? recipientName.trim() : '') || 'du';

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'E-Mail-Versand ist nicht konfiguriert (RESEND_API_KEY fehlt in .env.local).' },
      { status: 503 }
    );
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: DEFAULT_FROM,
      to: [email],
      subject: 'Dein personalisierter Demo-Zugang – HookAI',
      html: `
      <p>Hallo ${escapeHtml(name)},</p>
      <p>du erhältst deinen personalisierten Demozugang (Link zur App):</p>
      <p><a href="${escapeHtml(url)}" style="word-break: break-all;">${escapeHtml(url)}</a></p>
      <p>Bitte öffne den Link im Browser deines Geräts. Der Link führt zuerst zur Vertraulichkeitsvereinbarung und danach direkt in die Demo-App.</p>
      <p>Mit freundlichen Grüßen,<br />Stefanie Hook</p>
    `,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend send failed:', res.status, text);
    const isResendTestModeBlock =
      res.status === 403 &&
      text.toLowerCase().includes('only send testing emails to your own email');
    const errorMessage = isResendTestModeBlock
      ? RESEND_TESTMODE_HINT
      : 'E-Mail konnte nicht gesendet werden. Bitte Einstellungen für Resend prüfen.';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        accessUrl: url,
        isResendTestModeBlock,
      },
      { status: 500 }
    );
  }

  const data = (await res.json()) as { id?: string };
  return NextResponse.json({
    success: true,
    id: data?.id,
    message: 'E-Mail wurde gesendet.',
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
