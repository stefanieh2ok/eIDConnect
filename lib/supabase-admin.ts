/**
 * Server-only. Service-Role-Client für Session- und Audit-Logik.
 * In API Routes / Server Actions verwenden.
 * Client wird erst bei erster Nutzung erstellt, damit der Build auch ohne
 * gesetzte Env-Variablen durchläuft (z. B. in CI). Zur Laufzeit wird bei
 * fehlender Konfiguration geworfen.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _instance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (_instance) return _instance;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL fehlt. In .env.local setzen und Dev-Server neu starten.'
    );
  }
  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY fehlt. In .env.local setzen und Dev-Server neu starten.'
    );
  }
  _instance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _instance;
}

/** Lazy: Fehler werden erst beim ersten Zugriff (z. B. .from()) geworfen, nicht beim Import. */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    return (getSupabaseAdmin() as unknown as Record<string, unknown>)[prop];
  },
});
