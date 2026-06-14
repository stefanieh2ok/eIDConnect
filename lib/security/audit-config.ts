/**
 * Supabase-Audit-Konfiguration — persistentes Logging nur mit Env.
 * Ohne Konfiguration: Demo-Fallback (no-op), kein revisionssicheres Audit.
 */

export function isSupabaseAuditConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && key);
}
