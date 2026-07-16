import type { Section } from '@/types';

/** Screen-H1 je App-Bereich (Bottom-Nav / Utility-Header ≠ Screen-Titel). */
export const CIVIC_MODULE_SCREEN_TITLES: Partial<Record<Section, string>> = {
  fuermich: 'Anliegen vorbereiten',
  meldungen: 'Neue Meldung',
  live: 'Abstimmungen',
  wahlen: 'Wahlinformationen',
  postfach: 'Postfach',
  kalender: 'Kalender',
  leaderboard: 'Prämien',
  settings: 'Einstellungen',
};

export const CIVIC_SETTINGS_SCREEN_TITLE = 'Einstellungen';
export const CIVIC_SETTINGS_SCREEN_SUBTITLE = 'Profil, Transparenz & Barrierefreiheit';
