import { NextRequest } from 'next/server';
import type { DemoAccessTokenRecord } from '@/lib/security/token';
import { insertAuditLog } from '@/lib/security/audit-server';
import {
  buildDeviceFingerprint,
  getClientIp,
  getUserAgent,
} from '@/lib/security/request';
import {
  countAcceptanceEvents,
  countTokenSessions,
  generateRawSessionToken,
} from '@/lib/security/token';
import {
  createDemoSession,
  deactivateOtherSessionsForToken,
} from '@/lib/security/session-create';
import { insertAcceptanceLog } from '@/lib/security/acceptance';
import { insertNdaAcceptanceLog } from '@/lib/security/nda-acceptance-log';

export type AcceptAndSessionResult = {
  redirectTo: string;
  rawSessionToken: string;
  sessionExpiresAt: string;
};

/**
 * Führt die komplette Accept-Logik aus: Session anlegen, Acceptance- + NDA-Log,
 * Audit-Log. Wird von POST /api/accept und GET /api/docusign/return genutzt.
 * max_views/max_devices müssen vom Aufrufer bereits geprüft sein.
 */
export async function performAcceptAndCreateSession(
  tokenRecord: DemoAccessTokenRecord,
  rawToken: string,
  request: NextRequest,
  options?: { source?: 'docusign' }
): Promise<AcceptAndSessionResult> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  const deviceFingerprint = buildDeviceFingerprint(ipAddress, userAgent);

  const rawSessionToken = generateRawSessionToken();
  const sessionExpiresAt = new Date(
    Math.min(
      new Date(tokenRecord.expires_at).getTime(),
      Date.now() + 8 * 60 * 60 * 1000
    )
  ).toISOString();

  const createdSession = await createDemoSession({
    rawSessionToken,
    tokenId: tokenRecord.id,
    demoId: tokenRecord.demo_id,
    fullName: tokenRecord.full_name,
    company: tokenRecord.company,
    email: tokenRecord.email,
    expiresAt: sessionExpiresAt,
  });

  await insertAcceptanceLog({
    tokenId: tokenRecord.id,
    demoId: tokenRecord.demo_id,
    fullName: tokenRecord.full_name,
    company: tokenRecord.company,
    email: tokenRecord.email,
    ndaVersion: tokenRecord.nda_version,
    ndaDocumentHash: tokenRecord.nda_document_hash,
    ipAddress,
    userAgent,
    referrer: request.headers.get('referer') ?? null,
    sessionId: createdSession.id,
  });

  await insertNdaAcceptanceLog({
    token: rawToken,
    recipient_name: tokenRecord.full_name,
    recipient_org: tokenRecord.company ?? null,
    nda_version: tokenRecord.nda_version,
    nda_text_checksum: tokenRecord.nda_document_hash,
    accepted_at: new Date().toISOString(),
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
    session_id: createdSession.id,
  });

  await insertAuditLog({
    demo_id: tokenRecord.demo_id,
    token_id: tokenRecord.id,
    session_id: createdSession.id,
    event_type: 'nda_accepted',
    event_data: {
      ndaVersion: tokenRecord.nda_version,
      ndaDocumentHash: tokenRecord.nda_document_hash,
      ...(options?.source && { source: options.source }),
    },
    ip_address: ipAddress,
    user_agent: userAgent,
    device_fingerprint: deviceFingerprint,
  });

  return {
    redirectTo: `/demo/${tokenRecord.demo_id}`,
    rawSessionToken,
    sessionExpiresAt,
  };
}
