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
import { createOneTimeEntry } from '@/lib/security/one-time-entry';
import { findTokenRecordByEnvelopeId } from '@/lib/security/docusign-envelope';

const DEFAULT_FROM =
  process.env.SEND_ACCESS_EMAIL_FROM || 'eIDConnect Demo <onboarding@resend.dev>';

/**
 * GET /api/docusign/return?token=...&envelopeId=...&event=...
 * DocuSign leitet nach dem Signieren hierher.
 * Wir legen eine Session an, setzen das Cookie und leiten zur Demo.
 */
export async function GET(request: NextRequest) {
  console.log('[DocuSign Return] START', request.nextUrl.toString());
  try {
    const token = request.nextUrl.searchParams.get('token');
    const envelopeId = request.nextUrl.searchParams.get('envelopeId');
    const event = request.nextUrl.searchParams.get('event');
    const code = request.nextUrl.searchParams.get('code');
    console.log('[DocuSign Return] params token:', token ? `${token.slice(0, 20)}…` : 'MISSING', 'envelopeId:', envelopeId ?? 'MISSING', 'event:', event ?? 'MISSING');

    if (!token && code) {
      console.log('[DocuSign Return] EXIT consent-callback');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DocuSign Consent</title></head><body style="font-family:sans-serif;max-width:480px;margin:2rem auto;padding:1rem;"><p style="color:#166534;">Consent erteilt.</p><p>Sie können dieses Fenster schließen und auf der Zugangsseite erneut auf „Unterzeichnen Sie mit DocuSign und öffnen Sie die Demo" klicken.</p></body></html>`;
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    let tokenRecord: Awaited<ReturnType<typeof findAccessTokenByRawToken>> = null;
    const rawTokenForSession = token ?? (envelopeId ? `envelope:${envelopeId}` : '');

    if (token) {
      console.log('[DocuSign Return] DB lookup by token...');
      tokenRecord = await findAccessTokenByRawToken(token);
    } else if (envelopeId) {
      console.log('[DocuSign Return] Kein token – Fallback: Lookup per envelopeId', envelopeId);
      tokenRecord = await findTokenRecordByEnvelopeId(envelopeId);
    }

    console.log('[DocuSign Return] tokenRecord:', tokenRecord ? `id=${tokenRecord.id} demo_id=${tokenRecord.demo_id}` : 'NULL');

    if (!tokenRecord) {
      console.log('[DocuSign Return] EXIT tokenRecord=null → /access/denied?reason=invalid');
      return NextResponse.redirect(new URL('/access/denied?reason=invalid', request.url));
    }

    if (tokenRecord.is_revoked) {
      console.log('[DocuSign Return] EXIT revoked → /access/denied?reason=revoked');
      return NextResponse.redirect(new URL('/access/denied?reason=revoked', request.url));
    }

    if (isTokenExpired(tokenRecord.expires_at)) {
      console.log('[DocuSign Return] EXIT expired (expires_at=' + tokenRecord.expires_at + ' now=' + new Date().toISOString() + ') → /access/denied?reason=expired');
      return NextResponse.redirect(new URL('/access/denied?reason=expired', request.url));
    }

    const activeSessions = await countTokenSessions(tokenRecord.id);
    console.log('[DocuSign Return] activeSessions:', activeSessions, '/ max_devices:', tokenRecord.max_devices);
    if (activeSessions >= tokenRecord.max_devices) {
      console.log('[DocuSign Return] deactivating older sessions...');
      await deactivateOtherSessionsForToken(tokenRecord.id);
    }

    const acceptanceCount = await countAcceptanceEvents(tokenRecord.id);
    console.log('[DocuSign Return] acceptanceCount:', acceptanceCount, '/ max_views:', tokenRecord.max_views);
    if (acceptanceCount >= tokenRecord.max_views) {
      console.log('[DocuSign Return] EXIT max_views reached → /access/denied?reason=max_views');
      return NextResponse.redirect(new URL('/access/denied?reason=max_views', request.url));
    }

    console.log('[DocuSign Return] creating session...');
    const { redirectTo, rawSessionToken, sessionExpiresAt } =
      await performAcceptAndCreateSession(tokenRecord, rawTokenForSession, request, {
        source: 'docusign',
      });
    console.log('[DocuSign Return] session created. redirectTo:', redirectTo, 'sessionExpiresAt:', sessionExpiresAt);

    const baseUrl = request.nextUrl.origin;
    const finalRedirectUrl = new URL(redirectTo, baseUrl).toString();
    console.log('[DocuSign Return] finalRedirectUrl:', finalRedirectUrl);

    // E-Mail senden (async, blockiert nicht die Weiterleitung)
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
        console.log('[DocuSign Return] createOneTimeEntry failed:', e instanceof Error ? e.message : e);
      }

      const accessLink = token ? `${baseUrl}/access/${token}` : null;
      const html = enterUrl
        ? `
          <p>Hallo ${tokenRecord.full_name},</p>
          <p><strong>Sie haben die Vertraulichkeitsvereinbarung unterzeichnet.</strong> Vielen Dank.</p>
          <p>Falls Sie nicht automatisch in die Demo weitergeleitet wurden, klicken Sie bitte auf den folgenden Link:</p>
          <p><strong>Direkt in die Demo (1 Stunde gültig, einmal nutzbar):</strong><br />
          <a href="${enterUrl}" style="word-break: break-all;">${enterUrl}</a></p>
          ${accessLink ? `<p><strong>Oder Zugangsseite öffnen</strong> und erneut auf „Unterzeichnen mit DocuSign" klicken:<br /><a href="${accessLink}" style="word-break: break-all;">${accessLink}</a></p>` : ''}
          <p>Mit freundlichen Grüßen<br />Stefanie Hook</p>
        `
        : accessLink
          ? `
          <p>Hallo ${tokenRecord.full_name},</p>
          <p><strong>Sie haben die Vertraulichkeitsvereinbarung unterzeichnet.</strong> Vielen Dank.</p>
          <p>Bitte öffnen Sie den folgenden Link und klicken Sie auf „Unterzeichnen mit DocuSign" – Sie werden dann in die Demo weitergeleitet:</p>
          <p><a href="${accessLink}" style="word-break: break-all;">${accessLink}</a></p>
          <p>Mit freundlichen Grüßen<br />Stefanie Hook</p>
        `
          : `
          <p>Hallo ${tokenRecord.full_name},</p>
          <p><strong>Sie haben die Vertraulichkeitsvereinbarung unterzeichnet.</strong> Vielen Dank.</p>
          <p>Sie sollten in Kürze automatisch in die Demo weitergeleitet werden. Falls nicht, wenden Sie sich bitte an den Absender.</p>
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
        console.log('[DocuSign Return] email sent status:', res.status);
        if (!res.ok) {
          const errText = await res.text();
          console.log('[DocuSign Return] email error body:', errText);
        }
      } catch (e) {
        console.log('[DocuSign Return] email send failed:', e instanceof Error ? e.message : e);
      }
    } else {
      console.log('[DocuSign Return] skipping email (RESEND_API_KEY:', !!process.env.RESEND_API_KEY, 'email:', !!tokenRecord.email, ')');
    }

    const response = NextResponse.redirect(new URL(redirectTo, baseUrl));
    response.cookies.set(DEMO_SESSION_COOKIE, rawSessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(sessionExpiresAt),
    });

    console.log('[DocuSign Return] SUCCESS → 307 to', redirectTo);
    return response;
  } catch (error) {
    console.log('[DocuSign Return] CATCH ERROR:', error instanceof Error ? error.message : String(error));
    console.log('[DocuSign Return] CATCH STACK:', error instanceof Error ? error.stack : 'no stack');
    return NextResponse.redirect(new URL('/access/denied?reason=error', request.url));
  }
}
