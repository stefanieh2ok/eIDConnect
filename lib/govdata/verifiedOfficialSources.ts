/**
 * Manually curated official public sources for demo/pilot Wegweiser use.
 * Not PVOG live — traceable, reviewable catalogue entries only.
 */
import type { MatchInput } from '@/lib/govdata/serviceMatcher';
import type { GovService } from '@/lib/govdata/serviceTypes';

export const VERIFIED_CATALOG_SOURCE_LABEL = 'Manuell verifizierte offizielle Quelle';
export const VERIFIED_CATALOG_REVIEW_DATE = '2026-06-01';

export type VerifiedCatalogEntry = GovService & {
  sourceLabel: typeof VERIFIED_CATALOG_SOURCE_LABEL;
  sourceVerifiedAt: string;
  sourceOwner?: string;
};

const CATALOG: VerifiedCatalogEntry[] = [
  {
    serviceId: 'vc-elterngeld',
    title: 'Elterngeld',
    shortDescription: 'Informationen zur Elternzeit und zum Elterngeld — Antrag über die zuständige Familienkasse.',
    category: 'Familie',
    situationType: 'private',
    responsibleAuthority: 'Familienkasse / Bundesagentur für Arbeit',
    requiredDocuments: ['Geburtsurkunde', 'Einkommensnachweise', 'Mutterschaftsgeld-Bescheid'],
    officialSourceUrl: 'https://www.arbeitsagentur.de/familie-und-kinder/elterngeld',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'Bundesagentur für Arbeit',
    confidence: 'high',
    matchKeywords: ['elterngeld', 'elternzeit', 'kind', 'baby', 'geburt', 'familie'],
  },
  {
    serviceId: 'vc-kindergeld',
    title: 'Kindergeld',
    shortDescription: 'Kindergeld beantragen oder ändern — zuständig ist die Familienkasse.',
    category: 'Familie',
    situationType: 'private',
    responsibleAuthority: 'Familienkasse',
    requiredDocuments: ['Kindergeldantrag', 'Geburtsurkunde', 'Steuer-ID des Kindes'],
    officialSourceUrl: 'https://www.arbeitsagentur.de/familie-und-kinder/kindergeld',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'Bundesagentur für Arbeit',
    confidence: 'high',
    matchKeywords: ['kindergeld', 'kind', 'familie', 'unterhalt'],
  },
  {
    serviceId: 'vc-kita',
    title: 'Kita / Kinderbetreuung',
    shortDescription: 'Orientierung zu Betreuungsplätzen und Anspruch auf Kinderbetreuung — zuständig sind Kommune und Jugendamt.',
    category: 'Familie',
    situationType: 'private',
    responsibleAuthority: 'Kommune / Jugendamt',
    regionRequired: true,
    regionHint: 'Die zuständige Stelle hängt von Kommune/Bundesland ab.',
    officialSourceUrl: 'https://www.bmfsfj.de/bmfsfj/themen/familie/kinderbetreuung/kinderbetreuung-69710',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'BMFSFJ',
    confidence: 'medium',
    matchKeywords: ['kita', 'kinderbetreuung', 'betreuung', 'kind', 'tagesmutter'],
  },
  {
    serviceId: 'vc-ummeldung',
    title: 'Wohnsitz anmelden / Ummeldung',
    shortDescription: 'Nach einem Umzug innerhalb Deutschlands meldest du dich bei der zuständigen Meldebehörde an.',
    category: 'Wohnen',
    situationType: 'private',
    responsibleAuthority: 'Meldebehörde / Bürgeramt',
    regionRequired: true,
    regionHint: 'Die zuständige Stelle hängt von Kommune/Bundesland ab.',
    requiredDocuments: ['Personalausweis oder Reisepass', 'Wohnungsgeberbestätigung'],
    officialSourceUrl: 'https://www.bund.de/DE/themen/verwaltung-in-deutschland/buergerdienste/buergerdienste-node.html',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'Bund.de',
    confidence: 'medium',
    matchKeywords: ['ummeld', 'umzug', 'wohnsitz', 'anmeld', 'melde', 'einwohner'],
  },
  {
    serviceId: 'vc-wohngeld',
    title: 'Wohngeld',
    shortDescription: 'Wohngeld kann bei hohen Wohnkosten und niedrigem Einkommen relevant sein — Antrag bei der Wohngeldstelle.',
    category: 'Wohnen',
    situationType: 'private',
    responsibleAuthority: 'Wohngeldstelle der Kommune',
    regionRequired: true,
    regionHint: 'Die zuständige Stelle hängt von Kommune/Bundesland ab.',
    requiredDocuments: ['Mietvertrag', 'Einkommensnachweise', 'Haushaltsmitglieder'],
    officialSourceUrl: 'https://www.bmwsb.bund.de/SharedDocs/faqs/DE/wohngeld/wohngeld.html',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'BMWSB',
    confidence: 'high',
    matchKeywords: ['wohngeld', 'miete', 'wohnen', 'umzug', 'einkommen'],
  },
  {
    serviceId: 'vc-pflege',
    title: 'Pflegegrad / Pflegeleistungen',
    shortDescription: 'Pflegebedürftigkeit wird durch den Medizinischen Dienst geprüft — Leistungen über die Pflegekasse.',
    category: 'Gesundheit & Pflege',
    situationType: 'private',
    responsibleAuthority: 'Pflegekasse / MD',
    requiredDocuments: ['Antrag auf Pflegeleistungen', 'Atteste', 'Versichertennachweis'],
    officialSourceUrl: 'https://www.bund.de/DE/themen/gesundheit-und-pflege/pflege/pflege-node.html',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'Bund.de',
    confidence: 'high',
    matchKeywords: ['pflege', 'pflegegrad', 'pflegebedürft', 'pflegekasse', 'eltern'],
  },
  {
    serviceId: 'vc-schwerbehinderung',
    title: 'Schwerbehindertenausweis',
    shortDescription: 'Feststellung der Behinderung und Ausstellung eines Ausweises über das Versorgungsamt.',
    category: 'Gesundheit & Pflege',
    situationType: 'private',
    responsibleAuthority: 'Versorgungsamt',
    regionRequired: true,
    regionHint: 'Die zuständige Stelle hängt von Kommune/Bundesland ab.',
    requiredDocuments: ['Ärztliche Gutachten', 'Antrag', 'Personalausweis'],
    officialSourceUrl:
      'https://www.bund.de/DE/themen/verwaltung-in-deutschland/leistungen-fuer-menschen-mit-behinderungen/leistungen-fuer-menschen-mit-behinderungen-node.html',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'Bund.de',
    confidence: 'medium',
    matchKeywords: ['schwerbehinder', 'behinderung', 'ausweis', 'gdb', 'merkzeichen'],
  },
  {
    serviceId: 'vc-arbeitslos',
    title: 'Arbeitslosmeldung / Weiterbildung',
    shortDescription: 'Arbeitslos melden, Leistungen prüfen und Weiterbildungsangebote über die Agentur für Arbeit.',
    category: 'Arbeit & Einkommen',
    situationType: 'private',
    responsibleAuthority: 'Agentur für Arbeit',
    requiredDocuments: ['Personalausweis', 'Arbeitsvertrag / Kündigung', 'Lebenslauf'],
    officialSourceUrl: 'https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld/arbeitslos-melden',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'Bundesagentur für Arbeit',
    confidence: 'high',
    matchKeywords: ['arbeitslos', 'alg', 'weiterbildung', 'qualifizierung', 'agentur'],
  },
  {
    serviceId: 'vc-gewerbe',
    title: 'Gewerbe anmelden',
    shortDescription: 'Gewerbeanmeldung beim zuständigen Gewerbeamt — je nach Tätigkeit weitere Stellen informieren.',
    category: 'Gründung & Gewerbe',
    situationType: 'business',
    responsibleAuthority: 'Gewerbeamt / Ordnungsamt',
    regionRequired: true,
    regionHint: 'Die zuständige Stelle hängt von Kommune/Bundesland ab.',
    requiredDocuments: ['Personalausweis', 'Gewerbeanmeldung', 'Handwerkskarte falls erforderlich'],
    officialSourceUrl:
      'https://www.bund.de/DE/themen/verwaltung-in-deutschland/unternehmensgruendung/gewerbeanmeldung/gewerbeanmeldung-node.html',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'Bund.de',
    confidence: 'high',
    matchKeywords: ['gewerbe', 'anmeld', 'selbstständig', 'freiberuf', 'handwerk'],
  },
  {
    serviceId: 'vc-gruendung',
    title: 'Unternehmen gründen',
    shortDescription: 'Überblick zu Gründungsschritten, Rechtsform und Anlaufstellen für Existenzgründerinnen und -gründer.',
    category: 'Gründung & Gewerbe',
    situationType: 'business',
    responsibleAuthority: 'IHK / HWK / Finanzamt (je nach Fall)',
    officialSourceUrl: 'https://www.existenzgruender.de/DE/Home/home_node.html',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'BMWE / Existenzgründerportal',
    confidence: 'medium',
    matchKeywords: ['gründ', 'unternehmen', 'existenz', 'startup', 'firma', 'gesellschaft'],
  },
  {
    serviceId: 'vc-personal',
    title: 'Mitarbeitende einstellen',
    shortDescription: 'Pflichten bei Erstbeschäftigung: Anmeldung, Sozialversicherung und Meldungen an Behörden.',
    category: 'Gründung & Gewerbe',
    situationType: 'business',
    responsibleAuthority: 'Agentur für Arbeit / Krankenkasse / Finanzamt',
    requiredDocuments: ['Arbeitsvertrag', 'Sozialversicherungsmeldungen', 'Lohnunterlagen'],
    officialSourceUrl: 'https://www.arbeitsagentur.de/unternehmen/unternehmensfuehrung/personal',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'Bundesagentur für Arbeit',
    confidence: 'high',
    matchKeywords: ['mitarbeiter', 'personal', 'einstell', 'sozialversicherung', 'lohn'],
  },
  {
    serviceId: 'vc-bg',
    title: 'Berufsgenossenschaft / Unfallversicherung',
    shortDescription: 'Unternehmen melden sich bei der zuständigen Berufsgenossenschaft zur Unfallversicherung an.',
    category: 'Gründung & Gewerbe',
    situationType: 'business',
    responsibleAuthority: 'Berufsgenossenschaft / DGUV',
    officialSourceUrl: 'https://www.dguv.de/de/BG/index.jsp',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'DGUV',
    confidence: 'medium',
    matchKeywords: ['berufsgenossenschaft', 'unfallversicherung', 'bg', 'dguv', 'arbeitsschutz'],
  },
  {
    serviceId: 'vc-finanzamt',
    title: 'Finanzamt / steuerliche Erfassung',
    shortDescription: 'Steuerliche Erfassung und laufende steuerliche Pflichten über das Finanzamt bzw. ELSTER.',
    category: 'Steuern & Abgaben',
    situationType: 'business',
    responsibleAuthority: 'Finanzamt',
    regionRequired: true,
    regionHint: 'Die zuständige Stelle hängt von Kommune/Bundesland ab.',
    requiredDocuments: ['Fragebogen zur steuerlichen Erfassung', 'Gewerbeanmeldung', 'Identifikationsnachweise'],
    officialSourceUrl: 'https://www.elster.de/eportal/start',
    onlineServiceUrl: 'https://www.elster.de/eportal/start',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'ELSTER / Finanzverwaltung',
    confidence: 'high',
    matchKeywords: ['finanzamt', 'steuer', 'erfassung', 'umsatzsteuer', 'elster'],
  },
  {
    serviceId: 'vc-kammer',
    title: 'IHK / HWK / Kammerpflicht',
    shortDescription: 'Kammerpflichtige Berufe melden sich bei IHK oder Handwerkskammer — Zuständigkeit regional.',
    category: 'Gründung & Gewerbe',
    situationType: 'business',
    responsibleAuthority: 'IHK oder Handwerkskammer',
    regionRequired: true,
    regionHint: 'Die zuständige Stelle hängt von Kommune/Bundesland ab.',
    officialSourceUrl:
      'https://www.bund.de/DE/themen/verwaltung-in-deutschland/unternehmensgruendung/unternehmensgruendung-node.html',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'Bund.de',
    confidence: 'medium',
    matchKeywords: ['ihk', 'hwk', 'handwerkskammer', 'kammer', 'handwerk'],
  },
  {
    serviceId: 'vc-foerderung',
    title: 'Fördermittel prüfen',
    shortDescription: 'Öffentliche Förderprogramme für Unternehmen und Projekte in der Förderdatenbank recherchieren.',
    category: 'Förderung',
    situationType: 'both',
    responsibleAuthority: 'Fördergeber (Bund, Länder, EU)',
    officialSourceUrl: 'https://www.foerderdatenbank.de/',
    sourceSystem: 'VerifiedCatalog',
    sourceLabel: VERIFIED_CATALOG_SOURCE_LABEL,
    sourceVerifiedAt: VERIFIED_CATALOG_REVIEW_DATE,
    sourceOwner: 'BMWE Förderdatenbank',
    confidence: 'medium',
    matchKeywords: ['förder', 'zuschuss', 'kfw', 'invest', 'programm'],
  },
];

export const VERIFIED_OFFICIAL_CATALOG = CATALOG;

export function getVerifiedCatalogByIds(ids: string[]): GovService[] {
  const byId = new Map(CATALOG.map((entry) => [entry.serviceId, entry]));
  return ids.map((id) => byId.get(id)).filter((entry): entry is VerifiedCatalogEntry => Boolean(entry));
}

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function modeMatches(entry: VerifiedCatalogEntry, mode: MatchInput['mode']): boolean {
  if (mode === 'unsure') return true;
  if (entry.situationType === 'both') return true;
  return entry.situationType === mode;
}

function scoreEntry(entry: VerifiedCatalogEntry, text: string): number {
  const t = normalizeText(text);
  let score = 0;
  for (const kw of entry.matchKeywords ?? []) {
    if (t.includes(kw.toLowerCase())) score += 3;
  }
  if (entry.title && t.includes(entry.title.toLowerCase().slice(0, 8))) score += 2;
  if (entry.category && t.includes(entry.category.toLowerCase())) score += 1;
  return score;
}

export function matchVerifiedCatalogServices(input: MatchInput, limit = 8): GovService[] {
  const scored = CATALOG.filter((entry) => modeMatches(entry, input.mode))
    .map((entry) => ({ entry, score: scoreEntry(entry, input.text) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return [];
  }

  return scored.slice(0, limit).map((x) => x.entry);
}
