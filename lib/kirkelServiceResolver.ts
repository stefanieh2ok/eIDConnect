import katalog from '@/data/kirkel-service-catalog.json';
import type { AgeGroup, LifeEventId } from '@/types/fuerMich';

/**
 * Kirkel-Service-Resolver (V1).
 *
 * Reine, lokale Zuordnung von Lebenslagen zu kuratierten Demo-Leistungen für die
 * Region Kirkel/Saarland. KEINE echte API-Anbindung, KEINE Anspruchsprüfung,
 * KEINE Berechnung, KEINE Rechtsberatung, KEINE externen Requests.
 *
 * Der Resolver verhindert tote Links: Ein externes Ziel gilt nur dann als
 * öffenbar, wenn `source_status === 'verified'` UND eine URL hinterlegt ist.
 * Andernfalls wird die zuständige Stelle samt Fallback-Hinweis angezeigt.
 */

export type SourceStatus = 'verified' | 'demo' | 'needs_verification' | 'unavailable';

export type KirkelServiceBadge = 'wichtig' | 'nachweis' | 'optional' | 'beratung';

export type KirkelService = {
  id: string;
  leistung_key: string;
  titel: string;
  lebenslagen: string[];
  region: string;
  bundesland: string;
  kommune: string;
  zustaendige_stelle: string;
  zustaendigkeitsebene: string;
  kurzbeschreibung: string;
  moegliche_nachweise: string[];
  source_label: string;
  source_status: SourceStatus;
  source_url: string | null;
  online_service_url: string | null;
  form_url: string | null;
  contact_url: string | null;
  fallback_message: string;
  last_checked_at: string | null;
  demo_notice: string;
  badge?: KirkelServiceBadge;
  prioritaet?: number;
};

export type ResolverProfile = {
  region?: string;
  bundesland?: string;
  plz?: string;
  wohnort?: string;
} | null;

export type ResolveParams = {
  selectedLifeEvents: LifeEventId[];
  profile?: ResolverProfile;
};

export type ResolverResult = {
  /** Alle passenden Leistungen, regional priorisiert sortiert. */
  matchedServices: KirkelService[];
  /** Top-3 priorisierte nächste Schritte. */
  nextSteps: KirkelService[];
  /** Weitere mögliche Themen (alles außer den Top-3). */
  furtherServices: KirkelService[];
  /** Deduplizierte mögliche Nachweise. */
  evidenceChips: string[];
  /** Deduplizierte zuständige Stellen. */
  offices: string[];
  /** Leistungen ohne öffenbares externes Ziel (Fallback wird angezeigt). */
  missingLinks: KirkelService[];
  /** Deduplizierte Fallback-Hinweise. */
  fallbackMessages: string[];
};

export const ALL_KIRKEL_SERVICES = katalog.services as KirkelService[];
export const KIRKEL_REGION_LABEL = (katalog.region_label as string) ?? 'Kirkel / Saarland';

const DEFAULT_FALLBACK =
  'Für diese Demo ist kein stabiler Online-Link hinterlegt. Die zuständige Stelle wird angezeigt.';

const EMPTY_RESULT: ResolverResult = {
  matchedServices: [],
  nextSteps: [],
  furtherServices: [],
  evidenceChips: [],
  offices: [],
  missingLinks: [],
  fallbackMessages: [],
};

/** Hat die Leistung überhaupt ein hinterlegtes externes Ziel? */
export function hasUsableExternalLink(service: KirkelService): boolean {
  return Boolean(service.online_service_url || service.form_url || service.source_url);
}

/**
 * Darf ein externes Ziel geöffnet werden? Nur bei geprüfter Quelle MIT URL.
 * Demo / needs_verification / unavailable öffnen NIE extern (kein toter Link).
 */
export function canOpenExternal(service: KirkelService): boolean {
  return service.source_status === 'verified' && hasUsableExternalLink(service);
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = (value ?? '').trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(value);
    }
  }
  return out;
}

function regionMatches(service: KirkelService, profile: ResolverProfile): boolean {
  if (!profile) return false;
  const bundesland = (profile.bundesland ?? '').toLowerCase().trim();
  const wohnort = (profile.wohnort ?? '').toLowerCase().trim();
  const region = (profile.region ?? '').toLowerCase().trim();
  if (bundesland && (bundesland === 'saarland' || service.bundesland.toLowerCase().includes(bundesland))) {
    return true;
  }
  if (wohnort && service.kommune.toLowerCase().includes(wohnort)) return true;
  if (region && service.region.toLowerCase().includes(region)) return true;
  return false;
}

/**
 * Liefert die regional priorisierte, deduplizierte Orientierungsstruktur für die
 * gewählten Lebenslagen. Reine Tag-Filterung + stabile Reihung, keine Bewertung.
 */
export function resolveServicesForSituation({
  selectedLifeEvents,
  profile = null,
}: ResolveParams): ResolverResult {
  if (!selectedLifeEvents || selectedLifeEvents.length === 0) {
    return { ...EMPTY_RESULT };
  }

  const selected = new Set<string>(selectedLifeEvents);
  const matched = ALL_KIRKEL_SERVICES.filter((service) =>
    service.lebenslagen.some((tag) => selected.has(tag)),
  );

  const sorted = matched
    .map((service, index) => ({ service, index }))
    .sort((a, b) => {
      // 1) Region passend zuerst
      const ra = regionMatches(a.service, profile) ? 0 : 1;
      const rb = regionMatches(b.service, profile) ? 0 : 1;
      if (ra !== rb) return ra - rb;
      // 2) Priorität (kleiner zuerst)
      const pa = a.service.prioritaet ?? Number.MAX_SAFE_INTEGER;
      const pb = b.service.prioritaet ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      // 3) stabile Katalogreihenfolge
      return a.index - b.index;
    })
    .map(({ service }) => service);

  const nextSteps = sorted.slice(0, 3);
  const furtherServices = sorted.slice(3);
  const evidenceChips = dedupe(sorted.flatMap((s) => s.moegliche_nachweise));
  const offices = dedupe(sorted.map((s) => s.zustaendige_stelle));
  const missingLinks = sorted.filter((s) => !canOpenExternal(s));
  const fallbackMessages = dedupe(missingLinks.map((s) => s.fallback_message || DEFAULT_FALLBACK));

  return {
    matchedServices: sorted,
    nextSteps,
    furtherServices,
    evidenceChips,
    offices,
    missingLinks,
    fallbackMessages,
  };
}

/** Kurzlabel für den Quellenstatus (Detailpanel-Badge). */
export function sourceStatusLabel(status: SourceStatus): string {
  switch (status) {
    case 'verified':
      return 'Offizielle Quelle hinterlegt';
    case 'demo':
      return 'Demo-Daten';
    case 'needs_verification':
      return 'Noch zu verifizieren';
    case 'unavailable':
      return 'Kein Online-Link';
    default:
      return 'Demo-Daten';
  }
}

export type AgeGuidanceTone = 'minor_under_16' | 'consent_16_17' | 'adult_18_plus';

export type AgeGuidanceNotice = {
  tone: AgeGuidanceTone;
  text: string;
};

/**
 * Liefert einen reinen Orientierungshinweis je Altersgruppe – KEINE
 * Anspruchsprüfung, keine Rechtsfolge. Du/Sie-Form wird berücksichtigt.
 * Gibt `null`, wenn keine Altersgruppe gewählt wurde.
 */
export function getAgeGuidanceNotice(
  ageGroup: AgeGroup | '' | undefined,
  du = false,
): AgeGuidanceNotice | null {
  switch (ageGroup) {
    case 'under_16':
      return {
        tone: 'minor_under_16',
        text:
          'Für viele digitale Leistungen ist ein eigener Online-Ausweis noch nicht verfügbar. Die Orientierung erfolgt hier aus Sicht der Sorgeberechtigten.',
      };
    case '16_17':
      return {
        tone: 'consent_16_17',
        text: 'Einige Leistungen können eine Zustimmung der Sorgeberechtigten erfordern.',
      };
    case '18_plus':
      return {
        tone: 'adult_18_plus',
        text: du
          ? 'Du kannst viele Leistungen grundsätzlich selbst vorbereiten. Verbindlich entscheidet die zuständige Stelle.'
          : 'Sie können viele Leistungen grundsätzlich selbst vorbereiten. Verbindlich entscheidet die zuständige Stelle.',
      };
    default:
      return null;
  }
}

/** Ausführlicher Hinweistext zum Quellenstatus (Detailpanel). */
export function sourceStatusNotice(service: KirkelService): string {
  switch (service.source_status) {
    case 'verified':
      return service.source_label || 'Offizielle Quelle hinterlegt.';
    case 'demo':
      return 'Regionale Demo-Daten für Kirkel/Saarland. Keine Produktivdaten.';
    case 'needs_verification':
      return 'Diese Stelle muss vor Produktivbetrieb anhand offizieller Quellen verifiziert werden.';
    case 'unavailable':
      return 'Für diese Leistung ist in der Demo kein stabiler Online-Link hinterlegt.';
    default:
      return 'Regionale Demo-Daten für Kirkel/Saarland. Keine Produktivdaten.';
  }
}
