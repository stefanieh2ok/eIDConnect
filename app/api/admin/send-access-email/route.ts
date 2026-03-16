import { NextRequest, NextResponse } from 'next/server';
import { isValidBasicAuth } from '@/lib/security/basic-auth';

const DEFAULT_FROM =
  process.env.SEND_ACCESS_EMAIL_FROM || 'HookAI Demo <onboarding@resend.dev>';

type Body = {
  to: string;
  accessUrl: string;
  recipientName: string;
};

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
  const url = accessUrl.trim();
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
      <p>Du erhältst deinen personalisierten Zugang zur Demo:</p>
      <p><a href="${escapeHtml(url)}" style="word-break: break-all;">${escapeHtml(url)}</a></p>
      <p>Bitte öffne den Link in deinem Browser. Du wirst zu einer Vertraulichkeitsvereinbarung geführt. Nach deiner Zustimmung gelangst du in die Demo.</p>
      <p>Mit freundlichen Grüßen<br />Dein HookAI-Team</p>
    `,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend send failed:', res.status, text);
    return NextResponse.json(
      { success: false, error: 'E-Mail konnte nicht gesendet werden. Bitte Einstellungen für Resend prüfen.' },
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
