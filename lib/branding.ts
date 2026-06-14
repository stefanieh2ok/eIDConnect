/**
 * Einheitlicher Produktname in der App-Oberfläche (Header, Metadaten, zitierte Texte).
 *
 * Bewusst **nicht** aus `NEXT_PUBLIC_APP_NAME` abgeleitet: auf älteren Deployments oder in
 * `.env` steht dort oft noch eine Legacy-eID-Marke — dann würde die eingeloggte App
 * weiter den falschen Namen zeigen. Kurzformen wie nur „HookAI“ wären ebenfalls irreführend.
 *
 * `normalizeAppDisplayName` bleibt für Tests und ggf. Migrationen/Docs nutzbar.
 */
const DEMO_APP_NAME = 'HookAI Civic';

/** Kurzzeile unter dem Produktnamen (Header, Zugang, Marketing). */
export const APP_TAGLINE = 'Informieren. Verstehen. Mitwirken.' as const;

/**
 * Mappt alte Tab-Titel / Vercel-Namen / Schreibweisen auf die einheitliche Demo-Marke.
 * Export für Tests; Client/Server nutzen `APP_DISPLAY_NAME`.
 */
export function normalizeAppDisplayName(raw: string | undefined): string {
  if (!raw?.trim()) return DEMO_APP_NAME;
  const t = raw.trim().normalize('NFKC');
  /** Frühere Projekt-/Repo-Arbeitstitel (Tabs, Vercel, Bookmarks) — nicht mit allgemeinem „Bürger…“ verwechseln. */
  if (/bürger[\s._-]*app|buerger[\s._-]*app|bürgerapp|buergerapp/i.test(t)) {
    return DEMO_APP_NAME;
  }
  const compact = t
    .toLowerCase()
    .replace(/[\s\u00a0\u2009\u2002\u2003\u2011\u2013\u2014._-]+/g, '')
    .replace(/[^a-z0-9]/g, '');

  const exactLegacy = new Set([
    'eidconnect',
    'eidconnectdemo',
    'eiddemoconnect',
    'eiddemo',
    'eidconnectapp',
  ]);

  const looksLikeLegacyEidDemo =
    exactLegacy.has(compact) ||
    compact.includes('eidconnect') ||
    compact.includes('eiddemoconnect') ||
    compact.includes('eidconnectdemo');

  if (looksLikeLegacyEidDemo) return DEMO_APP_NAME;

  return t;
}

/** Immer die vollständige Produktmarke — siehe Kommentar zu `DEMO_APP_NAME`. */
export const APP_DISPLAY_NAME = DEMO_APP_NAME;

/** Dateiname für NDA-Downloads (ASCII, Bindestriche) */
export const NDA_PDF_FILENAME = 'HookAI-Civic-Konzeptvorschau-NDA.pdf';

/**
 * Query auf `manifest.start_url`: bei geänderter Marke/PWA erhöhen, damit Browser
 * die installierte Web-App neu zuordnen und nicht alte `short_name`-Caches festhalten.
 */
export const PWA_MANIFEST_CACHE_TAG = 'hookai-brand-20260426';
