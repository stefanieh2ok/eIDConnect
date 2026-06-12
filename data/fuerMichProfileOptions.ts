import type {
  AgeGroup,
  ChildAgeBand,
  EmploymentStatus,
  HousingSituation,
  ProfileRole,
  UsageRole,
} from '@/types/fuerMich';

export const BUNDESLAENDER_OPTIONS = [
  { value: 'baden-wuerttemberg', label: 'Baden-Württemberg' },
  { value: 'bayern', label: 'Bayern' },
  { value: 'berlin', label: 'Berlin' },
  { value: 'brandenburg', label: 'Brandenburg' },
  { value: 'bremen', label: 'Bremen' },
  { value: 'hamburg', label: 'Hamburg' },
  { value: 'hessen', label: 'Hessen' },
  { value: 'mecklenburg-vorpommern', label: 'Mecklenburg-Vorpommern' },
  { value: 'niedersachsen', label: 'Niedersachsen' },
  { value: 'nordrhein-westfalen', label: 'Nordrhein-Westfalen' },
  { value: 'rheinland-pfalz', label: 'Rheinland-Pfalz' },
  { value: 'saarland', label: 'Saarland' },
  { value: 'sachsen', label: 'Sachsen' },
  { value: 'sachsen-anhalt', label: 'Sachsen-Anhalt' },
  { value: 'schleswig-holstein', label: 'Schleswig-Holstein' },
  { value: 'thueringen', label: 'Thüringen' },
] as const;

export const SPRACHE_OPTIONS = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'Englisch' },
  { value: 'tr', label: 'Türkisch' },
  { value: 'ar', label: 'Arabisch' },
  { value: 'uk', label: 'Ukrainisch' },
  { value: 'ru', label: 'Russisch' },
  { value: 'pl', label: 'Polnisch' },
] as const;

export const NUTZUNGSROLLE_OPTIONS: { value: UsageRole; label: string }[] = [
  { value: 'self', label: 'Ich nutze die App für mich selbst' },
  { value: 'child', label: 'Ich handle für mein Kind' },
  { value: 'relative', label: 'Ich handle für einen Angehörigen' },
];

export const ALTERSGRUPPE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'under_16', label: 'unter 16' },
  { value: '16_17', label: '16–17' },
  { value: '18_plus', label: '18+' },
];

/**
 * Demo-Schalter „Vorschau-Perspektive“ (NICHT Teil des normalen Bürgerprofils).
 * Bildet die Alterslogik in der Vorschau ab; im Produktivbetrieb würde sie aus
 * einem verifizierten Identitätskontext (eID/BundID/Wallet) abgeleitet.
 */
export const VORSCHAU_PERSPEKTIVE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'under_16', label: 'Eltern / Sorgeberechtigte' },
  { value: '16_17', label: 'Jugendlich / 16–17' },
  { value: '18_plus', label: 'Volljährig' },
];

export const KINDER_ALTERSGRUPPEN: { value: ChildAgeBand; label: string }[] = [
  { value: '0-3', label: '0–3' },
  { value: '4-6', label: '4–6' },
  { value: '7-17', label: '7–17' },
  { value: '18+', label: '18+' },
];

export const WOHNSITUATION_OPTIONS: { value: HousingSituation; label: string }[] = [
  { value: 'miete', label: 'Miete' },
  { value: 'eigentum', label: 'Eigentum' },
  { value: 'wg', label: 'WG' },
  { value: 'einrichtung', label: 'Einrichtung' },
];

export const ERWERBSSTATUS_OPTIONS: { value: EmploymentStatus; label: string }[] = [
  { value: 'arbeitnehmer', label: 'Arbeitnehmer:in' },
  { value: 'selbststaendig', label: 'selbstständig' },
  { value: 'student', label: 'Student:in' },
  { value: 'auszubildend', label: 'Auszubildende:r' },
  { value: 'arbeitssuchend', label: 'arbeitssuchend' },
  { value: 'rentner', label: 'Rentner:in' },
];

export const ROLLE_OPTIONS: { value: ProfileRole; label: string }[] = [
  { value: 'privatperson', label: 'Privatperson' },
  { value: 'unternehmer', label: 'Unternehmer:in' },
  { value: 'freiberufler', label: 'Freiberufler:in' },
  { value: 'verein', label: 'Verein' },
  { value: 'ehrenamt', label: 'Ehrenamt' },
];
