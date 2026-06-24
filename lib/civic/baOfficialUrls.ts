/**
 * Stable Bundesagentur für Arbeit entry points — verified landing pages only.
 * Do not add fragile deep links that have returned 404 in link audits.
 */
export const BA_URLS = {
  arbeitslosengeldHub: 'https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld',
  eservices: 'https://web.arbeitsagentur.de/',
  bildungsgutschein: 'https://www.arbeitsagentur.de/karriere-und-weiterbildung/bildungsgutschein',
  weiterbildung: 'https://www.arbeitsagentur.de/karriere-und-weiterbildung',
} as const;

export type BaOfficialUrlKey = keyof typeof BA_URLS;
