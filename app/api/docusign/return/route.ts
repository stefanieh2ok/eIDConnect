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

    const status = await getEnvelopeStatus(envelopeId);
    if (status !== 'completed') {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      return NextResponse.redirect(
        new URL(
          `/access/${token}?docusign=not_completed&event=${event ?? ''}`,
          baseUrl
        )
      );
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

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
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
