/**
 * Erstellt einen Demo-Access-Token und gibt Zugangs-URL zurück.
 * Für Freigabe von Zugangsanfragen verwendet.
 */
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';
import { getNdaConfigForRecipient, getNdaDocumentHash } from '@/config/nda';

const DEMO_ID = process.env.DEMO_ACCESS_DEFAULT_ID || 'eidconnect-v1';
const EXPIRES_IN_DAYS = 14;
const MAX_VIEWS = 10;
const MAX_DEVICES = 1;

function generateRawAccessToken(): string {
  return `dm_${randomBytes(24).toString('hex')}`;
}

export type CreateTokenInput = {
  fullName: string;
  email: string;
  company?: string | null;
};

export type CreateTokenResult =
  | { success: true; rawToken: string; accessUrl: string; expiresAt: string; tokenId: string }
  | { success: false; error: string };

export async function createAccessToken(
  input: CreateTokenInput,
  baseUrl: string
): Promise<CreateTokenResult> {
  const rawToken = generateRawAccessToken();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(
    Date.now() + EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const ndaCfg = getNdaConfigForRecipient({
    email: input.email,
    company: input.company ?? null,
  });

  const { data: inserted, error } = await supabaseAdmin
    .from('demo_access_tokens')
    .insert({
      token_hash: tokenHash,
      demo_id: DEMO_ID,
      full_name: input.fullName.trim(),
      company: input.company?.trim() ?? null,
      email: input.email.trim(),
      nda_version: ndaCfg.version,
      nda_document_hash: getNdaDocumentHash({
        email: input.email,
        company: input.company ?? null,
      }),
      expires_at: expiresAt,
      max_views: MAX_VIEWS,
      max_devices: MAX_DEVICES,
      is_revoked: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('createAccessToken failed:', error);
    return { success: false, error: error.message };
  }

  const accessUrl = `${baseUrl.replace(/\/$/, '')}/access/${rawToken}`;
  return {
    success: true,
    rawToken,
    accessUrl,
    expiresAt,
    tokenId: inserted?.id ?? '',
  };
}
