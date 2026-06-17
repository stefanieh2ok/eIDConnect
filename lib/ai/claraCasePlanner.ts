/**
 * Deterministic Clara case planner — no live LLM required.
 * Converts free-text situation into structured Behördenfahrplan via journey templates.
 *
 * Compliance: no legal advice, no entitlement, no submission claims.
 */
import { detectTopics, matchGovServices } from '@/lib/govdata/serviceMatcher';
import { formatOfficialHandover } from '@/lib/govdata/officialSourceFormatter';
import type {
  CasePlanRisk,
  CivicCasePlanResult,
  DocumentReadinessItem,
  GovService,
} from '@/lib/govdata/serviceTypes';
import { CLARA_CASE_DISCLAIMER } from '@/lib/claraCaseGuidance';
import { SOURCE_NOTICE_DEMO, type GovDataResolution } from '@/lib/govdata/sourceStatus';
import {
  resolvePlannerIdentityContext,
  type CivicIdentityContext,
} from '@/lib/civic/demoCivicContext';
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import { getVerifiedCatalogByIds } from '@/lib/govdata/verifiedOfficialSources';

export type CasePlannerInput = {
  text: string;
  mode: 'private' | 'business' | 'unsure';
  plz?: string;
  bundesland?: string;
  wohnort?: string;
  urgency?: boolean;
  journeyHint?: CivicJourneyId;
};

const EXAMPLE_CASES = [
  {
    id: 'move-kids',
    label: 'Ich ziehe mit zwei Kindern um und brauche Unterstützung.',
    text: 'Ich ziehe mit zwei Kindern in eine neue Stadt um. Mein Einkommen ist niedrig. Die Kinder wechseln die Schule. Ich brauche Unterstützung für Miete und Schulbedarf.',
    mode: 'private' as const,
    journeyId: 'moving_with_children' as const,
  },
  {
    id: 'pflege-parent',
    label: 'Ein Elternteil wird pflegebedürftig und ich weiß nicht, welche Leistungen relevant sind.',
    text: 'Mein Elternteil wird pflegebedürftig. Ich weiß nicht, welche Leistungen und Stellen relevant sind.',
    mode: 'private' as const,
    journeyId: 'care_family' as const,
  },
  {
    id: 'gewerbe-start',
    label: 'Ich möchte ein Gewerbe anmelden und bin unsicher, welche Stellen ich informieren muss.',
    text: 'Ich möchte ein Gewerbe anmelden und bin unsicher, welche Stellen ich informieren muss — Finanzamt, IHK, Gewerbeamt.',
    mode: 'business' as const,
    journeyId: 'business_registration' as const,
  },
  {
    id: 'first-employee',
    label: 'Ich stelle zum ersten Mal Mitarbeitende ein und brauche einen Überblick über Pflichten und Meldungen.',
    text: 'Ich stelle zum ersten Mal Mitarbeitende ein und brauche einen Überblick über Pflichten, Meldungen und Sozialversicherung.',
    mode: 'business' as const,
    journeyId: 'business_registration' as const,
  },
] as const;

export function getExampleCases() {
  return EXAMPLE_CASES;
}

function withRegion(input: CasePlannerInput, identity: CivicIdentityContext): CasePlannerInput {
  return {
    ...input,
    wohnort: input.wohnort?.trim() || identity.municipality,
    bundesland: input.bundesland?.trim() || identity.federalState,
    plz: input.plz?.trim() || identity.plz,
  };
}

function buildSituationSummary(text: string, mode: CasePlannerInput['mode'], du: boolean): string {
  const trimmed = text.trim().slice(0, 280);
  if (du) {
    return `Clara hat deine Situation erfasst${mode !== 'unsure' ? ` (${mode === 'private' ? 'privat' : 'geschäftlich'})` : ''}: „${trimmed}${text.length > 280 ? '…' : ''}"`;
  }
  return `Clara hat Ihre Situation erfasst${mode !== 'unsure' ? ` (${mode === 'private' ? 'privat' : 'geschäftlich'})` : ''}: „${trimmed}${text.length > 280 ? '…' : ''}"`;
}

function buildMissingInfo(
  input: CasePlannerInput,
  identity: CivicIdentityContext,
  hasJourney: boolean,
): string[] {
  if (hasJourney) return [];
  const missing: string[] = [];
  if (!identity.municipality && !input.plz && !identity.federalState) {
    missing.push('Kommune oder Bundesland noch nicht angegeben');
  }
  if (input.mode === 'unsure') {
    missing.push('Kontext privat vs. geschäftlich noch offen');
  }
  if (/frist|schreiben|bescheid|deadline/i.test(input.text) === false && input.urgency) {
    missing.push('Konkrete Frist noch unklar');
  }
  return missing;
}

function buildGenericFollowUpQuestions(
  input: CasePlannerInput,
  identity: CivicIdentityContext,
): string[] {
  const questions: string[] = [];
  if (!identity.municipality && !input.plz && !identity.federalState) {
    questions.push('In welcher Kommune oder welchem Bundesland findet der Fall statt?');
  }
  if (input.mode === 'unsure') {
    questions.push('Geht es um dich privat, dein Unternehmen oder beides?');
  }
  if (/frist|schreiben|bescheid/i.test(input.text) === false) {
    questions.push('Gibt es eine Frist oder ein offizielles Schreiben?');
  }
  if (!/unterlagen|dokument|ausweis|vertrag/i.test(input.text)) {
    questions.push('Liegen bereits wichtige Unterlagen vor (z. B. Verträge, Bescheide)?');
  }
  return questions.slice(0, 3);
}

function buildDocuments(services: GovService[]): DocumentReadinessItem[] {
  const seen = new Set<string>();
  const docs: DocumentReadinessItem[] = [];
  for (const s of services) {
    for (const d of s.requiredDocuments ?? []) {
      if (seen.has(d)) continue;
      seen.add(d);
      docs.push({
        id: `doc-${docs.length}`,
        label: d,
        readiness: s.confidence === 'high' ? 'likely' : s.regionRequired ? 'regional' : 'possible',
        checked: false,
      });
    }
  }
  return docs.slice(0, 12);
}

function buildSequence(mode: CasePlannerInput['mode'], hasRegion: boolean): string[] {
  const steps = [
    hasRegion ? 'Wohnort / Kommune klären' : 'Region und zuständige Kommune klären',
    'Unterlagen sammeln und prüfen',
    'Zuständige Stellen und offizielle Quellen vergleichen',
    'Offiziellen Antrag oder Online-Dienst bei der zuständigen Stelle starten',
    'Nachweise nachreichen und Fristen im Blick behalten',
  ];
  if (mode === 'business') {
    steps.splice(2, 0, 'Privat- und Geschäftskontext trennen');
  }
  return steps;
}

function buildRisks(input: CasePlannerInput, mode: CasePlannerInput['mode'], hasJourney: boolean): CasePlanRisk[] {
  const risks: CasePlanRisk[] = [
    { id: 'r1', text: 'Fristen übersehen — offizielle Schreiben und Termine früh prüfen.' },
    { id: 'r2', text: 'Unvollständige Unterlagen — Checkliste vor dem Antrag abarbeiten.' },
    { id: 'r3', text: 'Falsche Zuständigkeit — Region und Leistung können die Stelle ändern.' },
  ];
  if (
    !hasJourney &&
    (mode === 'unsure' || (mode === 'private' && /gewerbe|unternehmen|firma/i.test(input.text)))
  ) {
    risks.push({ id: 'r4', text: 'Privat- und Geschäftskontext vermischt — getrennt vorbereiten.' });
  }
  if (/anspruch|garantiert|muss bewilligt/i.test(input.text)) {
    risks.push({ id: 'r5', text: 'Keine Anspruchszusage — nur die zuständige Stelle entscheidet verbindlich.' });
  }
  return risks.slice(0, 5);
}

function mergeJourneyServices(
  catalogIds: string[],
  resolvedServices: GovService[],
  matchInput: CasePlannerInput,
): GovService[] {
  const catalogServices = getVerifiedCatalogByIds(catalogIds);
  const byId = new Map<string, GovService>();
  for (const s of catalogServices) byId.set(s.serviceId, s);
  for (const s of resolvedServices) {
    if (!byId.has(s.serviceId)) byId.set(s.serviceId, s);
  }
  if (byId.size > 0) {
    const ordered: GovService[] = [];
    for (const id of catalogIds) {
      const svc = byId.get(id);
      if (svc) ordered.push(svc);
    }
    for (const s of Array.from(byId.values())) {
      if (!ordered.some((o) => o.serviceId === s.serviceId)) ordered.push(s);
    }
    return ordered.slice(0, 10);
  }
  return matchGovServices(matchInput).slice(0, 8);
}

export function planCivicCase(
  input: CasePlannerInput,
  du = true,
  resolution?: Pick<GovDataResolution, 'services' | 'isDemoData' | 'sourceNotice' | 'mode'>,
  identityOverride?: CivicIdentityContext,
): CivicCasePlanResult {
  const identity = identityOverride ?? resolvePlannerIdentityContext(input);
  const regionInput = withRegion(input, identity);
  const journey = resolveCivicJourney(
    regionInput.text,
    regionInput.mode,
    identity,
    du,
    regionInput.journeyHint,
  );

  const effectiveMode = journey?.inferredMode ?? regionInput.mode;
  const matchInput: CasePlannerInput = { ...regionInput, mode: effectiveMode };

  const resolvedServices =
    resolution?.services ??
    matchGovServices({
      text: matchInput.text,
      mode: matchInput.mode,
      plz: matchInput.plz,
      bundesland: matchInput.bundesland,
      wohnort: matchInput.wohnort,
    });

  const services = journey
    ? mergeJourneyServices(journey.catalogServiceIds, resolvedServices, matchInput)
    : resolvedServices;

  const topics = journey ? journey.template.topicLabels : detectTopics(matchInput.text, services);
  const hasRegion = Boolean(identity.municipality || matchInput.plz || identity.federalState);
  const handoverLinks = services.flatMap((s) => formatOfficialHandover(s)).slice(0, 6);

  const serviceAuthorities = Array.from(
    new Set(services.map((s) => s.responsibleAuthority).filter((a): a is string => Boolean(a))),
  );

  const touchedAuthorities = journey
    ? Array.from(new Set([...journey.suggestedAuthorities, ...serviceAuthorities])).slice(0, 10)
    : serviceAuthorities.slice(0, 8);

  return {
    situationSummary: journey ? journey.situationSummary : buildSituationSummary(matchInput.text, matchInput.mode, du),
    topics,
    services,
    touchedAuthorities,
    missingCriticalInfo: buildMissingInfo(matchInput, identity, Boolean(journey)),
    followUpQuestions: journey
      ? journey.missingQuestions
      : buildGenericFollowUpQuestions(matchInput, identity),
    documents: buildDocuments(services),
    sequenceSteps: journey ? journey.orderedSteps : buildSequence(matchInput.mode, hasRegion),
    risks: buildRisks(matchInput, matchInput.mode, Boolean(journey)),
    handoverLinks,
    mode: effectiveMode,
    isDemoData: resolution?.isDemoData ?? true,
    sourceNotice: resolution ? (resolution.sourceNotice ?? null) : SOURCE_NOTICE_DEMO,
    sourceMode: resolution?.mode ?? 'demo',
    journeyId: journey?.journeyId,
    journeyTitle: journey?.journeyTitle,
    knownContextFacts: journey?.knownContextFacts,
    identityContextDisclaimer: identity.disclaimer,
    uncataloguedStepLabels: journey?.uncataloguedStepLabels,
  };
}

/** Re-export disclaimer for UI */
export { CLARA_CASE_DISCLAIMER };
