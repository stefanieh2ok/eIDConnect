/**
 * Server-seitiges Audit-Logging. Nur in API Routes / Server Actions.
 *
 * Persistent nur mit Supabase (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 * Ohne Konfiguration: Demo audit fallback only — not persistent.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import { isSupabaseAuditConfigured } from '@/lib/security/audit-config';
import type { DemoAuditLogInsert } from '@/types/security';

export type AuditInsertResult = {
  persisted: boolean;
  reason?: 'no_supabase' | 'insert_failed';
};

export { isSupabaseAuditConfigured } from '@/lib/security/audit-config';

export async function insertAuditLog(entry: DemoAuditLogInsert): Promise<AuditInsertResult> {
  if (!isSupabaseAuditConfigured()) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '[audit] Demo fallback only — not persistent. Supabase/Postgres required for persistent audit logging.',
        { event_type: entry.event_type },
      );
    }
    return { persisted: false, reason: 'no_supabase' };
  }

  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert({
      demo_id: entry.demo_id ?? 'eidconnect',
      token_id: entry.token_id ?? null,
      session_id: entry.session_id ?? null,
      event_type: entry.event_type,
      event_data: entry.event_data ?? {},
      ip_address: entry.ip_address ?? null,
      user_agent: entry.user_agent ?? null,
      device_fingerprint: entry.device_fingerprint ?? null,
    });

    if (error) {
      console.error('Failed to insert audit log:', error);
      return { persisted: false, reason: 'insert_failed' };
    }

    return { persisted: true };
  } catch (error) {
    console.error('Audit insert threw:', error);
    return { persisted: false, reason: 'insert_failed' };
  }
}
