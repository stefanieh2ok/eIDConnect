import { NextRequest, NextResponse } from 'next/server';
import { getActiveDemoSession } from '@/lib/security/session';
import { insertAuditLog } from '@/lib/security/audit-server';
import {
  buildDeviceFingerprint,
  getClientIp,
  getUserAgent,
} from '@/lib/security/request';

const ALLOWED_EVENT_TYPES = [
  'demo_page_viewed',
  'module_opened',
  'sensitive_content_revealed',
  'rapid_navigation',
  'failed_access_attempt',
  'revoked_token_attempt',
] as const;

type AuditPayload = {
  eventType: string;
  eventData?: Record<string, unknown>;
};

/**
 * POST /api/audit
 * Erfordert aktive Demo-Session (Cookie). Schreibt in audit_logs.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AuditPayload;

    if (!body?.eventType) {
      return NextResponse.json(
        { success: false, error: 'eventType fehlt.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_EVENT_TYPES.includes(body.eventType as (typeof ALLOWED_EVENT_TYPES)[number])) {
      return NextResponse.json(
        { success: false, error: 'Ungültiger eventType.' },
        { status: 400 }
      );
    }

    const session = await getActiveDemoSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Keine aktive Demo-Session.' },
        { status: 401 }
      );
    }

    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);
    const deviceFingerprint = buildDeviceFingerprint(ipAddress, userAgent);

    await insertAuditLog({
      demo_id: session.demoId,
      token_id: session.tokenId,
      session_id: session.sessionId,
      event_type: body.eventType,
      event_data: body.eventData ?? {},
      ip_address: ipAddress,
      user_agent: userAgent,
      device_fingerprint: deviceFingerprint,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Audit route failed:', error);
    return NextResponse.json(
      { success: false, error: 'Audit-Logging fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
