import type { CivicAuthority } from '@/types/civic';

const DEMO_DISCLAIMER =
  'Demo / nicht amtlich. Verbindlich entscheidet die zuständige Stelle. Keine Einreichung über diese App.';

const VERIFIED_AT = '2026-06-13';

export const KIRKEL_BUERGERAMT: CivicAuthority = {
  authorityId: 'kirkel-buergeramt',
  name: 'Bürgeramt Kirkel / Gemeinde Kirkel',
  type: 'municipality',
  jurisdiction: ['66459 Kirkel', 'Gemeinde Kirkel'],
  address: {
    street: 'Hauptstraße 10',
    postalCode: '66459',
    city: 'Kirkel-Limbach',
    country: 'Deutschland',
  },
  contact: {
    phone: '+49 6842 9101-0',
    website: 'https://www.kirkel.de',
  },
  openingHoursSummary: 'Termine für Bürgeramtsleistungen erforderlich (Demo-Hinweis).',
  sourceUrl: 'https://www.kirkel.de/buergerservice-und-verwaltung/buergeramt/',
  lastVerifiedAt: VERIFIED_AT,
  confidenceLevel: 'demo',
  legalDisclaimer: DEMO_DISCLAIMER,
  services: [
    'personalausweis-eid',
    'reisepass',
    'meldewesen',
    'fuehrungszeugnis',
    'anmeldung',
    'ummeldung',
    'wohnungsgeberbestaetigung',
  ],
  contextNotes: ['Für Bürgeramtsleistungen sind in der Regel Termine erforderlich.'],
};

export const SAARPFALZ_KFZ_HOMBURG: CivicAuthority = {
  authorityId: 'saarpfalz-kfz-homburg',
  name: 'Kfz-Zulassungsstelle Saarpfalz-Kreis',
  type: 'county',
  jurisdiction: ['Saarpfalz-Kreis', '66424 Homburg'],
  address: {
    street: 'Am Forum 1',
    postalCode: '66424',
    city: 'Homburg',
    country: 'Deutschland',
  },
  contact: {
    website: 'https://www.saarpfalz-kreis.de',
  },
  openingHoursSummary: 'Terminvergabe empfohlen (Demo-Hinweis).',
  sourceUrl: 'https://www.saarpfalz-kreis.de/verwaltung-politik/behoerden/kfz-zulassungsstelle/',
  lastVerifiedAt: VERIFIED_AT,
  confidenceLevel: 'demo',
  legalDisclaimer: DEMO_DISCLAIMER,
  services: ['kfz-ummeldung', 'kfz-zulassung', 'ikfz', 'wunschkennzeichen'],
};

export const JOBCENTER_SAARPFALZ_HOMBURG: CivicAuthority = {
  authorityId: 'jobcenter-saarpfalz-homburg',
  name: 'Jobcenter Saarpfalz-Kreis – Dienststelle Homburg',
  type: 'jobcenter',
  jurisdiction: ['Saarpfalz-Kreis', '66424 Homburg'],
  address: {
    street: 'Talstraße 57',
    postalCode: '66424',
    city: 'Homburg',
    country: 'Deutschland',
  },
  contact: {
    website: 'https://www.saarpfalz-kreis.de',
  },
  openingHoursSummary: 'Termin oder Online-Kontakt je nach Anliegen (Demo-Hinweis).',
  sourceUrl: 'https://www.saarpfalz-kreis.de/buergerservice/jobcenter/',
  lastVerifiedAt: VERIFIED_AT,
  confidenceLevel: 'demo',
  legalDisclaimer: DEMO_DISCLAIMER,
  services: ['buergergeld-erstantrag', 'sgb-ii-orientierung'],
  contextNotes: ['Keine Anspruchsprüfung in dieser Demo.'],
};

export const ARBEITSAGENTUR_SAARLAND_HOMBURG_CONTEXT: CivicAuthority = {
  authorityId: 'arbeitsagentur-saarland-homburg-context',
  name: 'Agentur für Arbeit Saarland – Homburg-Kontext',
  type: 'federal_agency',
  jurisdiction: ['Regionaldirektion Saarland', 'Homburg-Kontext'],
  address: {
    street: 'Online-Services / regionale Beratung',
    postalCode: '66424',
    city: 'Homburg (Kontext)',
    country: 'Deutschland',
  },
  contact: {
    phone: '0800 4 5555 00',
    website: 'https://www.arbeitsagentur.de',
  },
  sourceUrl: 'https://www.arbeitsagentur.de/vor-ort/jobcenter/jobcenter-saarland',
  lastVerifiedAt: VERIFIED_AT,
  confidenceLevel: 'reference_only',
  legalDisclaimer: DEMO_DISCLAIMER,
  services: ['alg1-orientierung', 'arbeitslosmeldung'],
  contextNotes: [
    'Homburg-Kontext für regionale Orientierung und Online-Services.',
    'Zentrale Postanschrift laut BA-Quelle: Agentur für Arbeit Saarland, Franz-Josef-Röder-Str. 17, 66119 Saarbrücken.',
    'Dringende persönliche Vorsprache kann laut Quelle in Saarbrücken erforderlich sein — bitte offizielle BA-Seite prüfen.',
  ],
};

export const KIRKEL_AUTHORITIES: CivicAuthority[] = [
  KIRKEL_BUERGERAMT,
  SAARPFALZ_KFZ_HOMBURG,
  JOBCENTER_SAARPFALZ_HOMBURG,
  ARBEITSAGENTUR_SAARLAND_HOMBURG_CONTEXT,
];

export const KIRKEL_AUTHORITY_BY_ID: Record<string, CivicAuthority> = Object.fromEntries(
  KIRKEL_AUTHORITIES.map((a) => [a.authorityId, a]),
);
