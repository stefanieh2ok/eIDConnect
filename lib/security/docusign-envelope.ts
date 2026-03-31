import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';
import type { DemoAccessTokenRecord } from '@/lib/security/token';

/**
 * Speichert die Zuordnung Token → Envelope, damit beim DocuSign-Return
 * (falls DocuSign token weglässt) der Token per envelopeId ermittelt werden kann.
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

/**
 * Ermittelt den Token-Record anhand der envelopeId (Fallback, wenn DocuSign
 * den token-Parameter beim Redirect weglässt).
 */
export async function findTokenRecordByEnvelopeId(
  envelopeId: string
): Promise<DemoAccessTokenRecord | null> {
  const { data: envRow, error: envErr } = await supabaseAdmin
    .from('demo_docusign_envelopes')
    .select('token_hash')
    .eq('envelope_id', envelopeId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (envErr || !envRow) {
    console.log('[docusign-envelope] findTokenRecordByEnvelopeId: no row for envelope', envelopeId);
    return null;
  }

  const tokenHash = (envRow as { token_hash: string }).token_hash;
  const { data: tokenRow, error: tokenErr } = await supabaseAdmin
    .from('demo_access_tokens')
    .select('id, demo_id, full_name, company, email, nda_version, nda_document_hash, expires_at, max_views, max_devices, is_revoked, require_docusign')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (tokenErr || !tokenRow) return null;
  return tokenRow as DemoAccessTokenRecord;
}
