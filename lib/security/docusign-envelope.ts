import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';

/**
 * Speichert die Zuordnung Token → Envelope, damit beim DocuSign-Return
 * (falls DocuSign envelopeId nicht mitschickt) der Envelope trotzdem ermittelt werden kann.
 */
export async function saveEnvelopeForToken(
  rawToken: string,
  envelopeId: string
): Promise<void> {
  const tokenHash = sha256(rawToken);
  await supabaseAdmin.from('demo_docusign_envelopes').insert({
    token_hash: tokenHash,
    envelope_id: envelopeId,
  });
}

/**
 * Liefert die zuletzt gespeicherte envelopeId für diesen Token (Fallback bei Return ohne envelopeId).
 */
export async function getEnvelopeIdForToken(
  rawToken: string
): Promise<string | null> {
  const tokenHash = sha256(rawToken);
  const { data, error } = await supabaseAdmin
    .from('demo_docusign_envelopes')
    .select('envelope_id')
    .eq('token_hash', tokenHash)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('getEnvelopeIdForToken:', error);
    return null;
  }
  return (data as { envelope_id: string } | null)?.envelope_id ?? null;
}
