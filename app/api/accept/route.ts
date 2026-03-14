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

type AcceptPayload = {
  token?: string;
  accepted?: boolean;
};

/**
 * POST /api/accept
 * NDA-Akzeptanz: Access-Token validieren, max_views/max_devices prüfen,
 * Session anlegen, Akzeptanz + Audit loggen, Cookie setzen.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AcceptPayload;

    if (!body?.token || typeof body.token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token fehlt.' },
        { status: 400 }
      );
    }

    if (body.accepted !== true) {
      return NextResponse.json(
        { success: false, error: 'Die Vereinbarung wurde nicht akzeptiert.' },
        { status: 400 }
      );
    }

    const tokenRecord = await findAccessTokenByRawToken(body.token);

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, error: 'Ungültiger Zugangslink.' },
        { status: 404 }
      );
    }

    if (tokenRecord.is_revoked) {
      return NextResponse.json(
        { success: false, error: 'Dieser Zugangslink wurde widerrufen.' },
        { status: 403 }
      );
    }

    if (isTokenExpired(tokenRecord.expires_at)) {
      return NextResponse.json(
        { success: false, error: 'Dieser Zugangslink ist abgelaufen.' },
        { status: 403 }
      );
    }

    const activeSessions = await countTokenSessions(tokenRecord.id);
    if (activeSessions >= tokenRecord.max_devices) {
      await deactivateOtherSessionsForToken(tokenRecord.id);
    }

    const acceptanceCount = await countAcceptanceEvents(tokenRecord.id);
    if (acceptanceCount >= tokenRecord.max_views) {
      return NextResponse.json(
        {
          success: false,
          error: 'Die maximale Anzahl an Zugriffen wurde erreicht.',
        },
        { status: 403 }
      );
    }

    const { redirectTo, rawSessionToken, sessionExpiresAt } =
      await performAcceptAndCreateSession(tokenRecord, body.token, request);

    const response = NextResponse.json({
      success: true,
      redirectTo,
    });

    response.cookies.set(DEMO_SESSION_COOKIE, rawSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(sessionExpiresAt),
    });

    return response;
  } catch (error) {
    console.error('Accept route failed:', error);

    return NextResponse.json(
      { success: false, error: 'NDA-Akzeptanz fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
