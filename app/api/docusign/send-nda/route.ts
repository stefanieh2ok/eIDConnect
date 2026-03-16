import { NextRequest, NextResponse } from 'next/server';
import {
  countAcceptanceEvents,
  countTokenSessions,
  findAccessTokenByRawToken,
  isTokenExpired,
} from '@/lib/security/token';
import { deactivateOtherSessionsForToken } from '@/lib/security/session-create';
import { sendNdaEnvelopeAndGetSigningUrl } from '@/lib/docusign';

/**
 * POST /api/docusign/send-nda
 * Body: { token: string }
 * Validiert den Access-Token, erstellt NDA-PDF, sendet DocuSign-Envelope
 * und gibt die Embedded-Signing-URL zurück.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string };

    if (!body?.token || typeof body.token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token fehlt.' },
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

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin;
    const returnUrl = `${baseUrl}/api/docusign/return?token=${encodeURIComponent(body.token)}`;

    const { signingUrl } = await sendNdaEnvelopeAndGetSigningUrl({
      signerEmail: tokenRecord.email,
      signerName: tokenRecord.full_name,
      returnUrl,
    });

    return NextResponse.json({
      success: true,
      signingUrl,
    });
  } catch (error) {
    console.error('DocuSign send-nda failed:', error);

    let message =
      error instanceof Error ? error.message : 'DocuSign-Versand fehlgeschlagen.';

    const err = error as {
      response?: { body?: unknown; data?: unknown; text?: string; status?: number };
      body?: unknown;
    };
    const body =
      err?.response?.body ?? err?.response?.data ?? err?.body;
    let parsed: { errorCode?: string; message?: string } | null = null;
    if (body && typeof body === 'object') {
      parsed = body as { errorCode?: string; message?: string };
    } else if (typeof err?.response?.text === 'string') {
      try {
        parsed = JSON.parse(err.response.text) as { errorCode?: string; message?: string };
      } catch {
        if (err.response.text.length < 200) message = err.response.text;
      }
    }
    if (parsed && (parsed.errorCode || parsed.message)) {
      message = [parsed.errorCode, parsed.message].filter(Boolean).join(': ') || message;
    }
    const oauth = body && typeof body === 'object' ? body as { error?: string; error_description?: string } : null;
    if (oauth?.error || oauth?.error_description) {
      message = [oauth.error, oauth.error_description].filter(Boolean).join(': ') || message;
    }
    if (message === 'Request failed with status code 400' && body && typeof body === 'object') {
      message = (parsed?.message || oauth?.error_description || JSON.stringify(body).slice(0, 300)) || message;
    }

    const status = err?.response?.status ?? 500;
    return NextResponse.json(
      { success: false, error: message },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
