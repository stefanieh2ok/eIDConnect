/** Einheitliche Compliance-Formulierungen für Civic Trust / Behördenpakete. */

export const CIVIC_DEMO_NOTICE = 'Demo / nicht amtlich';
export const CIVIC_PREP_NOTICE = 'Diese Übersicht bereitet deinen Behördengang vor.';
export const CIVIC_BINDING_NOTICE = 'Verbindlich entscheidet die zuständige Stelle.';
export const CIVIC_NO_TRANSMISSION = 'Es wurde nichts übermittelt.';
export const CIVIC_DATA_USE =
  'Daten werden nur zur Vorbereitung dieses Pakets verwendet.';
export const CIVIC_NO_SUBMISSION = 'Keine Einreichung';
export const CIVIC_NO_CLAIM_CHECK = 'Keine Anspruchsprüfung.';
export const CIVIC_BA_CONTACT_NOTICE =
  'Bitte Kontakt- und Postlogik laut BA-Quelle prüfen.';

export const CIVIC_PREPARED_LOCAL_NOTICE =
  'Dieses Paket wurde lokal vorbereitet. Es wurde nichts an eine Behörde übermittelt.';

export const CIVIC_DEMO_STAMMDATEN_LABEL = 'Demo-Stammdaten';
export const CIVIC_DEMO_STAMMDATEN_PERSON = 'Max Mustermann · 66459 Kirkel';
export const CIVIC_DEMO_STAMMDATEN_HINT = 'Nur für Demo-Vorschau';

export function buildBaseServiceDisclaimer(): string {
  return [
    CIVIC_PREP_NOTICE,
    CIVIC_DEMO_NOTICE,
    CIVIC_BINDING_NOTICE,
    CIVIC_NO_SUBMISSION,
    CIVIC_DATA_USE,
  ].join(' ');
}

export function buildBuergergeldDisclaimer(): string {
  return [buildBaseServiceDisclaimer(), CIVIC_NO_CLAIM_CHECK].join(' ');
}

export function buildAlg1Disclaimer(): string {
  return [buildBaseServiceDisclaimer(), CIVIC_BA_CONTACT_NOTICE].join(' ');
}
