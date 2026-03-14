import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sha256 } from '@/lib/security/hash';
import type { DemoSessionRecord } from '@/types/security';
import {
  ADMIN_DEMO_COOKIE,
  verifyAdminDemoCookie,
} from '@/lib/security/admin-demo';

export const DEMO_SESSION_COOKIE = 'demo_session';

export type ActiveDemoSession = {
  sessionId: string;
  tokenId: string;
  demoId: string;
  fullName: string;
  company: string;
  email: string;
  expiresAt: string;
};

/**
 * Liefert die aktive Demo-Session (Cookie → demo_sessions) oder,
 * falls demoId übergeben wird, bei fehlender Session den Admin-Direktzugang
 * (Cookie admin_demo), sofern gültig und für diese demoId.
 */
export async function getActiveDemoSession(
  demoIdForAdmin?: string
): Promise<ActiveDemoSession | null> {
  const cookieStore = await cookies();
  const rawSessionToken = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  if (rawSessionToken) {

  const sessionTokenHash = sha256(rawSessionToken);

  const { data, error } = await supabaseAdmin
    .from('demo_sessions')
    .select(
      `
        id,
        token_id,
        access_token_id,
        demo_id,
        session_token_hash,
        started_at,
        session_expires_at,
        is_active,
        full_name,
        company,
        email
      `
    )
    .eq('session_token_hash', sessionTokenHash)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Session lookup failed:', error);
    return null;
  }

  const row = data as DemoSessionRecord | null;
  if (!row || !row.session_token_hash) {
    return null;
  }

  const now = Date.now();
  const expiresAt = row.session_expires_at;
  if (!expiresAt) return null;
  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs) || expiresAtMs <= now) {
    await invalidateDemoSession(row.id);
    return null;
  }

  return {
    sessionId: row.id,
    tokenId: row.token_id ?? row.access_token_id ?? row.id,
    demoId: row.demo_id ?? 'eidconnect',
    fullName: row.full_name ?? 'Autorisierter Empfänger',
    company: row.company ?? '',
    email: row.email ?? '',
    expiresAt,
  };
  }

  // Admin-Direktzugang (ohne NDA/DocuSign)
  if (demoIdForAdmin) {
    const secret = process.env.ADMIN_DEMO_SECRET;
    const adminCookie = cookieStore.get(ADMIN_DEMO_COOKIE)?.value;
    if (secret && adminCookie) {
      const parsed = verifyAdminDemoCookie(secret, adminCookie);
      if (parsed && parsed.demoId === demoIdForAdmin) {
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
        return {
          sessionId: 'admin',
          tokenId: 'admin',
          demoId: parsed.demoId,
          fullName: 'Admin',
          company: '',
          email: '',
          expiresAt,
        };
      }
    }
  }

  return null;
}

export async function invalidateDemoSession(sessionId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('demo_sessions')
    .update({ is_active: false, is_live: false, ended_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to invalidate session:', error);
  }
}
