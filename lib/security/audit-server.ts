/**
 * Server-seitiges Audit-Logging. Nur in API Routes / Server Actions.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import type { DemoAuditLogInsert } from '@/types/security';

export async function insertAuditLog(entry: DemoAuditLogInsert): Promise<void> {
  const { error } = await supabaseAdmin.from('audit_logs').insert({
    demo_id: entry.demo_id ?? 'buerger-app',
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
  }
}
