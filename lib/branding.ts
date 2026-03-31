/**
 * Einheitlicher Produktname in der Demo-UI.
 * `NEXT_PUBLIC_APP_NAME` ist optional; die alte Kurzform „eIDConnect“ wird auf die Demo-Marke gemappt.
 */
const DEMO_APP_NAME = 'eID Demo Connect';

function normalizeAppDisplayName(raw: string | undefined): string {
  if (!raw?.trim()) return DEMO_APP_NAME;
  const t = raw.trim();
  const compact = t.toLowerCase().replace(/[\s-]/g, '');
  // Legacy Tab-/Repo-Name → einheitlich „eID Demo Connect“ (Intro, Header, Login)
  if (compact === 'eidconnect' || compact === 'eidconnectdemo') {
    return DEMO_APP_NAME;
  }
  return t;
}

export const APP_DISPLAY_NAME = normalizeAppDisplayName(
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_APP_NAME : undefined,
);

/** Dateiname für NDA-Downloads (ASCII, Bindestriche) */
export const NDA_PDF_FILENAME = 'eID-Demo-Connect-NDA.pdf';
