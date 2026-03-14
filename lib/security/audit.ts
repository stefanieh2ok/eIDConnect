/**
 * Client-seitiger Aufruf des Audit-Log-API.
 * Erfordert aktive Demo-Session (Cookie wird automatisch mitgesendet).
 */

export type AuditEventType =
  | 'demo_page_viewed'
  | 'module_opened'
  | 'sensitive_content_revealed'
  | 'rapid_navigation'
  | 'failed_access_attempt'
  | 'revoked_token_attempt';

export async function logAuditEvent(params: {
  eventType: AuditEventType;
  eventData?: Record<string, unknown>;
}): Promise<void> {
  try {
    await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        eventType: params.eventType,
        eventData: params.eventData ?? {},
      }),
    });
  } catch {
    // Stillschweigend; Blockierung der UI vermeiden
  }
}
