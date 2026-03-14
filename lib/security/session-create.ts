import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';

export type CreateDemoSessionInput = {
  rawSessionToken: string;
  tokenId: string;
  demoId: string;
  fullName: string;
  company?: string | null;
  email?: string | null;
  expiresAt: string;
};

/**
 * Legt eine Demo-Session für den Accept-Flow an (access_token_id gesetzt, token_id null).
 */
export async function createDemoSession(input: CreateDemoSessionInput): Promise<{ id: string }> {
  const sessionTokenHash = sha256(input.rawSessionToken);

  const { data, error } = await supabaseAdmin
    .from('demo_sessions')
    .insert({
      token_id: null,
      access_token_id: input.tokenId,
      demo_id: input.demoId,
      session_token_hash: sessionTokenHash,
      started_at: new Date().toISOString(),
      session_expires_at: input.expiresAt,
      is_active: true,
      is_live: true,
      full_name: input.fullName,
      company: input.company ?? null,
      email: input.email ?? null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Creating demo session failed:', error);
    throw new Error('Demo-Session konnte nicht erstellt werden.');
  }

  return data as { id: string };
}

/** Deaktiviert alle anderen aktiven Sessions für diesen Access-Token (max_devices). */
export async function deactivateOtherSessionsForToken(tokenId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('demo_sessions')
    .update({ is_active: false, is_live: false, ended_at: new Date().toISOString() })
    .eq('access_token_id', tokenId)
    .eq('is_active', true);

  if (error) {
    console.error('Deactivating other sessions failed:', error);
  }
}
