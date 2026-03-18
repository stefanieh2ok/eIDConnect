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

/**
 * POST /api/accept-checkbox
 * NDA per Checkbox akzeptieren (nur für Test-Tokens ohne DocuSign).
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = (await request.json()) as { token?: string };
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token fehlt.' }, { status: 400 });
    }

    const tokenRecord = await findAccessTokenByRawToken(token);
    if (!tokenRecord) {
      return NextResponse.json({ success: false, error: 'Ungültiger Token.' }, { status: 404 });
    }

    if (tokenRecord.require_docusign) {
      return NextResponse.json({ success: false, error: 'Dieser Token erfordert DocuSign.' }, { status: 403 });
    }

    if (tokenRecord.is_revoked) {
      return NextResponse.json({ success: false, error: 'Token widerrufen.' }, { status: 403 });
    }

    if (isTokenExpired(tokenRecord.expires_at)) {
      return NextResponse.json({ success: false, error: 'Token abgelaufen.' }, { status: 403 });
    }

    const activeSessions = await countTokenSessions(tokenRecord.id);
    if (activeSessions >= tokenRecord.max_devices) {
      await deactivateOtherSessionsForToken(tokenRecord.id);
    }

    const acceptanceCount = await countAcceptanceEvents(tokenRecord.id);
    if (acceptanceCount >= tokenRecord.max_views) {
      return NextResponse.json({ success: false, error: 'Maximale Zugriffe erreicht.' }, { status: 403 });
    }

    const { redirectTo, rawSessionToken, sessionExpiresAt } =
      await performAcceptAndCreateSession(tokenRecord, token, request, {
        source: 'checkbox' as 'docusign',
      });

    const response = NextResponse.json({ success: true, redirectTo });
    response.cookies.set(DEMO_SESSION_COOKIE, rawSessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(sessionExpiresAt),
    });

    return response;
  } catch (error) {
    console.log('[accept-checkbox] error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Ein Fehler ist aufgetreten.' }, { status: 500 });
  }
}
