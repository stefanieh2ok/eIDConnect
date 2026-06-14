/**
 * Sichtbare Produktlabels vs. interne Section-Keys.
 * Keys nicht umbenennen ohne vollständige Migration (Tests, Tour-IDs, Context).
 */
import type { Section } from '@/types';

/** Interner Key → sichtbares UI-Label im Produkt. */
export const SECTION_PRODUCT_LABELS: Partial<Record<Section, string>> = {
  /** Prämien-Bereich: intern `leaderboard`, UI „Prämien“, Icon Gift. */
  leaderboard: 'Prämien',
  fuermich: 'Wegweiser',
  live: 'Beteiligen',
  meldungen: 'Melden',
  wahlen: 'Wahlen',
  kalender: 'Kalender',
  postfach: 'Postfach',
};

export function sectionProductLabel(section: Section): string {
  return SECTION_PRODUCT_LABELS[section] ?? section;
}
