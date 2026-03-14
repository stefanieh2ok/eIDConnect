/**
 * Speichert die dokumentierte NDA-Akzeptanz in nda_acceptance_logs
 * (Token als Text, Empfänger, Version, Checksumme, Zeitstempel, IP, User-Agent, Session).
 */
import { supabaseAdmin } from '@/lib/supabase-admin';

export type InsertNdaAcceptanceLogInput = {
  token: string;
  recipient_name: string;
  recipient_org: string | null;
  nda_version: string;
  nda_text_checksum: string;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
};

export async function insertNdaAcceptanceLog(
  input: InsertNdaAcceptanceLogInput
): Promise<void> {
  const { error } = await supabaseAdmin.from('nda_acceptance_logs').insert({
    token: input.token,
    recipient_name: input.recipient_name,
    recipient_org: input.recipient_org,
    nda_version: input.nda_version,
    nda_text_checksum: input.nda_text_checksum,
    accepted_at: input.accepted_at,
    ip_address: input.ip_address,
    user_agent: input.user_agent,
    session_id: input.session_id,
  });

  if (error) {
    console.error('nda_acceptance_logs insert failed:', error);
    throw new Error('Die Zustimmung konnte gerade nicht gespeichert werden. Bitte versuche es erneut.');
  }
}
