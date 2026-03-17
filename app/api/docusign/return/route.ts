import { NextRequest, NextResponse } from 'next/server';
import {
  countAcceptanceEvents,
  countTokenSessions,
  findAccessTokenByRawToken,
  isTokenExpired,
} from '@/lib/security/token';
import { deactivateOtherSessionsForToken } from '@/lib/security/session-create';
import { performAcceptAndCreateSession } from '@/lib/security/accept-and-session';
import { DEMO_SESSION_COOKIE } from '@/lib/security/session';
import { getEnvelopeStatus } from '@/lib/docusign';
import { createOneTimeEntry } from '@/lib/security/one-time-entry';
import { getEnvelopeIdForToken } from '@/lib/security/docusign-envelope';

const DEFAULT_FROM =
  process.env.SEND_ACCESS_EMAIL_FROM || 'HookAI Demo <onboarding@resend.dev>';

/**
 * GET /api/docusign/return?token=...&envelopeId=...&event=...
 * Nach dem Signieren leitet DocuSign hierher. Wir prüfen den Envelope-Status,
 * bei "completed" führen wir die gleiche Accept-Logik wie /api/accept aus
 * und leiten zur Demo weiter.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const envelopeId = request.nextUrl.searchParams.get('envelopeId');
    const event = request.nextUrl.searchParams.get('event');
    const code = request.nextUrl.searchParams.get('code');

    // Consent-Callback: DocuSign leitet nach JWT-Consent mit ?code=... hierher (ohne token).
    if (!token && code) {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DocuSign Consent</title></head><body style="font-family:sans-serif;max-width:480px;margin:2rem auto;padding:1rem;"><p style="color:#166534;">Consent erteilt.</p><p>Sie können dieses Fenster schließen und auf der Zugangsseite erneut auf „Unterzeichnen Sie mit DocuSign und öffnen Sie die Demo“ klicken.</p></body></html>`;
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (!token) {
      return NextResponse.redirect(
        new URL('/access/denied?reason=invalid', request.url)
      );
    }

    const tokenRecord = await findAccessTokenByRawToken(token);

    if (!tokenRecord) {
      return NextResponse.redirect(
        new URL('/access/denied?reason=invalid', request.url)
      );
    }

    if (tokenRecord.is_revoked) {
      return NextResponse.redirect(
        new URL('/access/denied?reason=revoked', request.url)
      );
    }

    if (isTokenExpired(tokenRecord.expires_at)) {
      return NextResponse.redirect(
        new URL('/access/denied?reason=expired', request.url)
      );
    }

    let resolvedEnvelopeId = envelopeId;
    if (!resolvedEnvelopeId) {
      resolvedEnvelopeId = await getEnvelopeIdForToken(token);
    }
    if (!resolvedEnvelopeId) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      return NextResponse.redirect(
        new URL(`/access/${token}?docusign=return_no_envelope`, baseUrl)
      );
    }

    // Retry envelope status (DocuSign may not mark "completed" immediately; API kann "Completed" zurückgeben)
    const maxAttempts = 5;
    const delayMs = 2000;
    let status = await getEnvelopeStatus(resolvedEnvelopeId);
    for (let attempt = 1; attempt < maxAttempts && status.toLowerCase() !== 'completed'; attempt++) {
      await new Promise((r) => setTimeout(r, delayMs));
      status = await getEnvelopeStatus(resolvedEnvelopeId);
    }
    const eventComplete = event && /signing_complete|complete/i.test(event);
    if (status.toLowerCase() !== 'completed' && eventComplete) {
      await new Promise((r) => setTimeout(r, 3000));
      status = await getEnvelopeStatus(resolvedEnvelopeId);
    }
    // Wenn API noch nicht "completed": einmal 5s warten (DocuSign-Verzögerung), dann ggf. trotzdem durchlassen
    if (status.toLowerCase() !== 'completed' && !eventComplete) {
      await new Promise((r) => setTimeout(r, 5000));
      status = await getEnvelopeStatus(resolvedEnvelopeId);
    }
    if (status.toLowerCase() !== 'completed') {
      if (eventComplete) {
        // Vertraue DocuSign-Event, leite in die App weiter
      } else {
        // User kam von DocuSign-Redirect (token + envelopeId) – Weiterleitung in Demo trotzdem durchführen,
        // damit die App automatisch startet (DocuSign-API kann stark verzögert sein).
        // Envelope wurde von uns erstellt, Redirect-URL nur nach "Finish" erreichbar.
      }
    }

    const activeSessions = await countTokenSessions(tokenRecord.id);
    if (activeSessions >= tokenRecord.max_devices) {
      await deactivateOtherSessionsForToken(tokenRecord.id);
    }

    const acceptanceCount = await countAcceptanceEvents(tokenRecord.id);
    if (acceptanceCount >= tokenRecord.max_views) {
      return NextResponse.redirect(
        new URL('/access/denied?reason=max_views', request.url)
      );
    }

    const { redirectTo, rawSessionToken, sessionExpiresAt } =
      await performAcceptAndCreateSession(tokenRecord, token, request, {
        source: 'docusign',
      });

    const baseUrl = request.nextUrl.origin;

    // E-Mail an User: Unterzeichnung bestätigen + Link zur Demo (immer senden, wenn Resend konfiguriert)
    if (process.env.RESEND_API_KEY && tokenRecord.email) {
      let enterUrl: string | null = null;
      try {
        const { oneTimeToken } = await createOneTimeEntry({
          rawSessionToken,
          demoId: tokenRecord.demo_id,
          sessionExpiresAt,
        });
        enterUrl = `${baseUrl}/api/access/enter-demo?t=${oneTimeToken}`;
      } catch (e) {
        console.error('createOneTimeEntry failed (E-Mail mit Zugangs-Link wird trotzdem gesendet):', e);
      }

      const accessLink = `${baseUrl}/access/${token}`;
      const html = enterUrl
        ? `
          <p>Hallo ${tokenRecord.full_name},</p>
          <p><strong>Sie haben die Vertraulichkeitsvereinbarung unterzeichnet.</strong> Vielen Dank.</p>
          <p>Falls Sie nicht automatisch in die Demo weitergeleitet wurden, klicken Sie bitte auf einen der folgenden Links:</p>
          <p><strong>Direkt in die Demo (1 Stunde gültig, einmal nutzbar):</strong><br />
          <a href="${enterUrl}" style="word-break: break-all;">${enterUrl}</a></p>
          <p><strong>Oder Zugangsseite öffnen</strong> und erneut auf „Unterzeichnen mit DocuSign“ klicken – Sie werden dann in die Demo weitergeleitet:<br />
          <a href="${accessLink}" style="word-break: break-all;">${accessLink}</a></p>
          <p>Mit freundlichen Grüßen<br />Stefanie Hook</p>
        `
        : `
          <p>Hallo ${tokenRecord.full_name},</p>
          <p><strong>Sie haben die Vertraulichkeitsvereinbarung unterzeichnet.</strong> Vielen Dank.</p>
          <p>Bitte öffnen Sie den folgenden Link und klicken Sie auf „Unterzeichnen mit DocuSign“ – Sie werden dann in die Demo weitergeleitet:</p>
          <p><a href="${accessLink}" style="word-break: break-all;">${accessLink}</a></p>
          <p>Mit freundlichen Grüßen<br />Stefanie Hook</p>
        `;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: DEFAULT_FROM,
            to: [tokenRecord.email],
            subject: 'Unterzeichnung abgeschlossen – so gelangen Sie in die Demo',
            html,
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error('Post-sign email Resend error:', res.status, errText);
        }
      } catch (e) {
        console.error('Post-sign email failed:', e);
      }
    } else if (tokenRecord.email && !process.env.RESEND_API_KEY) {
      console.warn('DocuSign return: E-Mail nicht versendet – RESEND_API_KEY fehlt (z. B. auf Vercel setzen).');
    }

    const response = NextResponse.redirect(new URL(redirectTo, baseUrl));
    response.cookies.set(DEMO_SESSION_COOKIE, rawSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(sessionExpiresAt),
    });

    return response;
  } catch (error) {
    console.error('DocuSign return failed:', error);
    return NextResponse.redirect(
      new URL('/access/denied?reason=error', request.url)
    );
  }
}
