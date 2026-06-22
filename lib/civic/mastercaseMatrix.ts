/**
 * Wegweiser Mastercase Matrix — structured registry for journey detection,
 * action plans, documents, sources, and test coverage.
 */
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';
import type { CivicIdentityContext } from '@/lib/civic/demoCivicContext';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { OFFICIAL_ACTION_CATALOG } from '@/lib/civic/officialActionCatalog';
import { PRIVATE_MASTERCASES } from '@/lib/civic/mastercaseMatrixPrivate';
import { BUSINESS_MASTERCASES } from '@/lib/civic/mastercaseMatrixBusiness';

export type {
  MastercaseAction,
  MastercaseActionStatus,
  MastercaseDefinition,
  MastercaseDomain,
  MastercasePriority,
  MastercaseSourceRequirement,
  MastercaseSourceStatus,
} from '@/lib/civic/mastercaseMatrixCore';

export { action, mastercase, GOVERNANCE_DEFAULT, REGIONAL_NOTE } from '@/lib/civic/mastercaseMatrixCore';

import type { MastercaseDefinition } from '@/lib/civic/mastercaseMatrixCore';

export const MASTERCASE_MATRIX: MastercaseDefinition[] = [
  ...PRIVATE_MASTERCASES,
  ...BUSINESS_MASTERCASES,
];

export function getMastercaseById(id: string): MastercaseDefinition | undefined {
  return MASTERCASE_MATRIX.find((m) => m.id === id);
}

export function getMastercasesByCategory(category: string): MastercaseDefinition[] {
  return MASTERCASE_MATRIX.filter((m) => m.category === category);
}

export function getMvpMastercases(): MastercaseDefinition[] {
  return MASTERCASE_MATRIX.filter((m) => m.priority === 'mvp');
}

export function getRegionalLookupMastercases(): MastercaseDefinition[] {
  return MASTERCASE_MATRIX.filter((m) => m.regionalLookupRequired);
}

export function getOfficialCatalogActionIds(): Set<string> {
  return new Set(OFFICIAL_ACTION_CATALOG.map((a) => a.actionId));
}

export function scoreMastercase(mc: MastercaseDefinition, text: string): number {
  const t = text.toLowerCase();
  let score = 0;
  for (const phrase of mc.triggerPhrases) {
    if (t.includes(phrase.toLowerCase())) score += 3;
  }
  return score;
}

export function resolveMastercaseFromText(text: string): MastercaseDefinition | undefined {
  let best: { mc: MastercaseDefinition; score: number } | undefined;
  for (const mc of MASTERCASE_MATRIX) {
    const score = scoreMastercase(mc, text);
    if (score > 0 && (!best || score > best.score)) best = { mc, score };
  }
  return best && best.score >= 3 ? best.mc : undefined;
}

export function resolveMastercaseViaJourney(
  text: string,
  identity: CivicIdentityContext = KIRKEL_DEMO_CONTEXT,
): MastercaseDefinition | undefined {
  const journey = resolveCivicJourney(text, 'unsure', identity, true);
  if (!journey) return resolveMastercaseFromText(text);
  const byJourney = MASTERCASE_MATRIX.filter((m) => m.journeyId === journey.journeyId);
  if (byJourney.length === 0) return undefined;
  if (byJourney.length === 1) return byJourney[0];
  const scored = byJourney
    .map((mc) => ({ mc, score: scoreMastercase(mc, text) }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score ? scored[0].mc : byJourney[0];
}

export const MASTERCASE_CATEGORIES = [
  'Familie & Kind',
  'Wohnen & Umzug',
  'Arbeit & Einkommen',
  'Gesundheit & Pflege',
  'Tod & Nachlass',
  'Identität & Dokumente',
  'Rente',
  'Gewerbe starten',
  'Arbeitgeberpflichten',
  'Betriebscompliance',
  'Förderung & Beratung',
] as const;
