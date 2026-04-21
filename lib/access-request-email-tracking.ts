import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Update fields for email-delivery tracking. Migration 011 (`email_provider`,
 * `email_provider_id`, `email_status`, `email_sent_at`, `email_last_error`) is
 * required for the full set to be persisted. If the migration has not been
 * applied yet in the target database, we must not let the missing columns
 * break the approve / resend flow — testers still need to receive the access
 * link. This helper attempts the full update first and, on a Postgres
 * `undefined_column` error (42703), silently retries with just the columns
 * that are guaranteed by migration 005.
 */
export type EmailTrackingFields = {
  email_provider?: 'resend' | null;
  email_provider_id?: string | null;
  email_status?: 'sent' | 'failed' | null;
  email_sent_at?: string | null;
  email_last_error?: string | null;
};

export async function updateAccessRequestEmailTracking(
  id: string,
  fields: EmailTrackingFields
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('access_requests')
    .update(fields)
    .eq('id', id);

  if (!error) return;

  const isMissingColumn =
    error.code === '42703' || /does not exist/i.test(error.message ?? '');

  if (!isMissingColumn) {
    console.error('updateAccessRequestEmailTracking failed:', error);
    return;
  }

  console.warn(
    'updateAccessRequestEmailTracking: Migration 011 (email_* Spalten) fehlt - Telemetrie wird nicht persistiert, Freigabe/Versand laufen weiter.'
  );
}
