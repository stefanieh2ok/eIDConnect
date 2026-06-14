import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';
import {
  devLocalCreateSession,
  devLocalDeactivateSessionsForToken,
  isDevLocalAccessEnabled,
  isDevLocalTokenId,
} from '@/lib/security/dev-local-access';

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

  if (isDevLocalAccessEnabled() && isDevLocalTokenId(input.tokenId)) {
    return devLocalCreateSession({
      sessionTokenHash,
      tokenId: input.tokenId,
      demoId: input.demoId,
      fullName: input.fullName,
      company: input.company ?? null,
      email: input.email ?? '',
      expiresAt: input.expiresAt,
    });
  }

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
    if (isDevLocalAccessEnabled() && isDevLocalTokenId(input.tokenId)) {
      return devLocalCreateSession({
        sessionTokenHash,
        tokenId: input.tokenId,
        demoId: input.demoId,
        fullName: input.fullName,
        company: input.company ?? null,
        email: input.email ?? '',
        expiresAt: input.expiresAt,
      });
    }
    throw new Error('Demo-Session konnte nicht erstellt werden.');
  }

  return data as { id: string };
}

/** Deaktiviert alle anderen aktiven Sessions für diesen Access-Token (max_devices). */
export async function deactivateOtherSessionsForToken(tokenId: string): Promise<void> {
  if (isDevLocalAccessEnabled() && isDevLocalTokenId(tokenId)) {
    devLocalDeactivateSessionsForToken(tokenId);
    return;
  }

  const { error } = await supabaseAdmin
    .from('demo_sessions')
    .update({ is_active: false, is_live: false, ended_at: new Date().toISOString() })
    .eq('access_token_id', tokenId)
    .eq('is_active', true);

  if (error) {
    console.error('Deactivating other sessions failed:', error);
    if (isDevLocalAccessEnabled() && isDevLocalTokenId(tokenId)) {
      devLocalDeactivateSessionsForToken(tokenId);
    }
  }
}
