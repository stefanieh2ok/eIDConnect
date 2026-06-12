/** Nutzerfreundliche Meldung, wenn Supabase nicht erreichbar oder falsch konfiguriert ist. */
export function supabaseUserErrorMessage(error: unknown): string {
  const details = String(
    (error as { details?: string; message?: string })?.details ??
      (error as { message?: string })?.message ??
      error ??
      '',
  ).toLowerCase();

  if (details.includes('enotfound') || details.includes('fetch failed')) {
    return 'Supabase ist nicht erreichbar. Bitte NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env.local prüfen (Projekt evtl. gelöscht oder pausiert). Anleitung: docs/SETUP-ZUGANG.md';
  }

  return 'Link konnte nicht erstellt werden. Bitte Supabase-Konfiguration und Datenbank prüfen.';
}
