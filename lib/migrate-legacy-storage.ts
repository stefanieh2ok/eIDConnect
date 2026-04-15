/**
 * Einmalige Migration: neuere hookai_*-Schritte zurück auf eidconnect_* (eID Demo Connect).
 */
const LEGACY_PAIRS: [string, string][] = [
  ['hookai_voted_elections', 'eidconnect_voted_elections'],
  ['hookai_consent_clara_personalization', 'eidconnect_consent_clara_personalization'],
  ['hookai_consent_participation', 'eidconnect_consent_participation'],
  ['hookai_participation_data', 'eidconnect_participation_data'],
  ['hookai_intro_done', 'eidconnect_intro_done'],
  ['hookai_highlights_seen', 'eidconnect_highlights_seen'],
  ['hookai_mangel_reports', 'eidconnect_mangel_reports'],
  ['hookai_tour_done', 'eidconnect_tour_done'],
  ['hookai_pulse_done', 'eidconnect_pulse_done'],
];

let didMigrate = false;

export function migrateLegacyLocalStorageKeysOnce(): void {
  if (typeof window === 'undefined' || didMigrate) return;
  didMigrate = true;
  try {
    for (const [oldKey, newKey] of LEGACY_PAIRS) {
      if (localStorage.getItem(newKey) != null) continue;
      const v = localStorage.getItem(oldKey);
      if (v === null) continue;
      localStorage.setItem(newKey, v);
      localStorage.removeItem(oldKey);
    }
  } catch {
    // stillschweigend
  }
}
