/**
 * Stable official entry points for Wegweiser catalogue links.
 * Prefer hub/landing pages over fragile deep links.
 */
export { BA_URLS } from '@/lib/civic/baOfficialUrls';
export type { BaOfficialUrlKey } from '@/lib/civic/baOfficialUrls';

export const FAMILY_OFFICIAL_URLS = {
  familienportalForms:
    'https://familienportal.de/familienportal/rechner-antraege/antragsformulare',
  kinderzuschlag:
    'https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-beantragen',
} as const;

export const EMPLOYER_OFFICIAL_URLS = {
  betriebsnummerService:
    'https://www.arbeitsagentur.de/unternehmen/betriebsnummern-service',
  betriebsnummerAllesWichtige:
    'https://www.arbeitsagentur.de/unternehmen/betriebsnummern-service/alles-wichtige',
  meldeverfahrenSozialversicherung:
    'https://www.arbeitsagentur.de/unternehmen/betriebsnummern-service/meldeverfahren-sozialversicherung',
} as const;

export type FamilyOfficialUrlKey = keyof typeof FAMILY_OFFICIAL_URLS;
export type EmployerOfficialUrlKey = keyof typeof EMPLOYER_OFFICIAL_URLS;
