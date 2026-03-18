import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';

export type DemoAccessTokenRecord = {
  id: string;
  demo_id: string;
  full_name: string;
  company: string | null;
  email: string;
  nda_version: string;
  nda_document_hash: string;
  expires_at: string;
  max_views: number;
  max_devices: number;
  is_revoked: boolean;
  require_docusign: boolean;
};

export async function findAccessTokenByRawToken(
  rawToken: string
): Promise<DemoAccessTokenRecord | null> {
  const tokenHash = sha256(rawToken);

  const { data, error } = await supabaseAdmin
    .from('demo_access_tokens')
    .select(
      `
        id,
        demo_id,
        full_name,
        company,
        email,
        nda_version,
        nda_document_hash,
        expires_at,
        max_views,
        max_devices,
        is_revoked,
        require_docusign
      `
    )
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) {
    console.error('Token lookup failed:', error);
    return null;
  }

  return data as DemoAccessTokenRecord | null;
}

export function isTokenExpired(expiresAt: string): boolean {
  const expiresMs = new Date(expiresAt).getTime();
  return Number.isNaN(expiresMs) || expiresMs <= Date.now();
}

/** Anzahl aktiver Sessions für diesen Access-Token (für max_devices). */
export async function countTokenSessions(tokenId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('demo_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('access_token_id', tokenId)
    .eq('is_active', true);

  if (error) {
    console.error('Counting token sessions failed:', error);
    return 0;
  }

  return count ?? 0;
}

/** Anzahl Akzeptanzen für diesen Token (für max_views). */
export async function countAcceptanceEvents(tokenId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('demo_acceptance_logs')
    .select('*', { count: 'exact', head: true })
    .eq('token_id', tokenId);

  if (error) {
    console.error('Counting acceptance events failed:', error);
    return 0;
  }

  return count ?? 0;
}

export function generateRawSessionToken(): string {
  return `ds_${randomBytes(32).toString('hex')}`;
}
