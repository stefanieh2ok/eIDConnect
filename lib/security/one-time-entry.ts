import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';

const EXPIRES_HOURS = 1;

export type CreateOneTimeEntryInput = {
  rawSessionToken: string;
  demoId: string;
  sessionExpiresAt: string;
};

/**
 * Erstellt einen Einmal-Link-Eintrag. Gibt den roten Token zurück (für URL).
 */
export async function createOneTimeEntry(
  input: CreateOneTimeEntryInput
): Promise<{ oneTimeToken: string }> {
  const oneTimeToken = randomBytes(24).toString('hex');
  const tokenHash = sha256(oneTimeToken);
  const expiresAt = new Date(Date.now() + EXPIRES_HOURS * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from('demo_one_time_entry').insert({
    token_hash: tokenHash,
    raw_session_token: input.rawSessionToken,
    demo_id: input.demoId,
    session_expires_at: input.sessionExpiresAt,
    expires_at: expiresAt,
  });

  if (error) {
    console.error('createOneTimeEntry failed:', error);
    throw new Error('Einmal-Link konnte nicht erstellt werden.');
  }

  return { oneTimeToken };
}

export type ConsumeOneTimeEntryResult = {
  rawSessionToken: string;
  demoId: string;
  sessionExpiresAt: string;
} | null;

/**
 * Verbraucht den Einmal-Token (Lookup + Delete). Gibt Session-Daten zurück oder null.
 */
export async function consumeOneTimeEntry(oneTimeToken: string): Promise<ConsumeOneTimeEntryResult | null> {
  const tokenHash = sha256(oneTimeToken);

  const { data, error } = await supabaseAdmin
    .from('demo_one_time_entry')
    .select('raw_session_token, demo_id, session_expires_at, expires_at')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !data) return null;

  const row = data as {
    raw_session_token: string;
    demo_id: string;
    session_expires_at: string;
    expires_at: string;
  };

  if (new Date(row.expires_at) <= new Date()) {
    await supabaseAdmin.from('demo_one_time_entry').delete().eq('token_hash', tokenHash);
    return null;
  }

  await supabaseAdmin.from('demo_one_time_entry').delete().eq('token_hash', tokenHash);

  return {
    rawSessionToken: row.raw_session_token,
    demoId: row.demo_id,
    sessionExpiresAt: row.session_expires_at,
  };
}
