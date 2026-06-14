/**
 * Supabase-Audit-Konfiguration — persistentes Logging nur mit Env.
 * Ohne Konfiguration: Demo-Fallback (no-op), kein revisionssicheres Audit.
 */

export function isSupabaseAuditConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && key);
}

/** Client-sichtbar: öffentliche Supabase-URL gesetzt (Service-Role nur serverseitig). */
export function isSupabasePublicUrlConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
}

export type AuditPersistenceDisplay = {
  mode: 'persistent' | 'demo_fallback';
  shortLabel: string;
  detail: string;
};

/**
 * Read-only Hinweis für Trust Center / Doku.
 * Kein revisionssicheres Audit ohne vollständige Server-Konfiguration.
 */
export function getAuditPersistenceDisplay(): AuditPersistenceDisplay {
  if (typeof window === 'undefined' && isSupabaseAuditConfigured()) {
    return {
      mode: 'persistent',
      shortLabel: 'Persistent (Supabase konfiguriert)',
      detail:
        'Audit-Ereignisse werden in Supabase gespeichert, sofern Insert erfolgreich. Kein Ersatz für revisionssicheres SIEM ohne Mandanten-Policy.',
    };
  }

  if (isSupabasePublicUrlConfigured()) {
    return {
      mode: 'demo_fallback',
      shortLabel: 'Teilkonfiguration — Fallback möglich',
      detail:
        'Supabase-URL erkannt; persistentes Audit nur mit vollständiger Server-Konfiguration (Service Role). Demo-Fallback ist nicht persistent.',
    };
  }

  return {
    mode: 'demo_fallback',
    shortLabel: 'Demo-Fallback (nicht persistent)',
    detail:
      'Ohne Supabase-Konfiguration: Audit nur als Demo-Fallback — nicht persistent, kein revisionssicheres Audit-Logging.',
  };
}
