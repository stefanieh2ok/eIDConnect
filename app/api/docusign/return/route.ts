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

    if (!envelopeId) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      return NextResponse.redirect(
        new URL(`/access/${token}?docusign=return_no_envelope`, baseUrl)
      );
    }

    // Retry envelope status (DocuSign may not mark "completed" immediately; API kann "Completed" zurückgeben)
    const maxAttempts = 5;
    const delayMs = 2000;
    let status = await getEnvelopeStatus(envelopeId);
    for (let attempt = 1; attempt < maxAttempts && status.toLowerCase() !== 'completed'; attempt++) {
      await new Promise((r) => setTimeout(r, delayMs));
      status = await getEnvelopeStatus(envelopeId);
    }
    // DocuSign sendet oft event=signing_complete – wenn API noch nicht "completed", einmal länger warten
    const eventComplete = event && /signing_complete|complete/i.test(event);
    if (status.toLowerCase() !== 'completed' && eventComplete) {
      await new Promise((r) => setTimeout(r, 3000));
      status = await getEnvelopeStatus(envelopeId);
    }
    if (status.toLowerCase() !== 'completed') {
      // Bei signing_complete trotzdem durchlassen (Vercel/API-Verzögerung), um Weiterleitung nicht zu blockieren
      if (eventComplete) {
        // Vertraue DocuSign-Event und leite in die App weiter
      } else {
        const baseUrl = request.nextUrl.origin;
        return NextResponse.redirect(
          new URL(
            `/access/${token}?docusign=not_completed&event=${event ?? ''}`,
            baseUrl
          )
        );
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

    // Immer zur gleichen Domain weiterleiten (Vercel oder localhost) → Nutzer landet in der Demo-App
    const baseUrl = request.nextUrl.origin;
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
