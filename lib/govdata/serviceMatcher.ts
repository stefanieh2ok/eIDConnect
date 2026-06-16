/**
 * Deterministic service matcher — keyword + mode filtering.
 * No legal entitlement decisions; relevance scoring only.
 */
import { MOCK_GOV_SERVICES } from '@/lib/govdata/mockGovServices';
import type { GovService } from '@/lib/govdata/serviceTypes';

export type MatchInput = {
  text: string;
  mode: 'private' | 'business' | 'unsure';
  plz?: string;
  bundesland?: string;
  wohnort?: string;
};

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function modeMatches(service: GovService, mode: MatchInput['mode']): boolean {
  if (mode === 'unsure') return true;
  if (service.situationType === 'both') return true;
  return service.situationType === mode;
}

function scoreService(service: GovService, text: string): number {
  const t = normalizeText(text);
  let score = 0;
  const keywords = service.matchKeywords ?? [];
  for (const kw of keywords) {
    if (t.includes(kw.toLowerCase())) score += 3;
  }
  if (service.lifeSituation && t.includes(service.lifeSituation.toLowerCase().slice(0, 8))) score += 1;
  if (service.businessSituation && t.includes(service.businessSituation.toLowerCase().slice(0, 8))) score += 1;
  if (service.category && t.includes(service.category.toLowerCase())) score += 1;
  return score;
}

export function matchGovServices(input: MatchInput, limit = 8): GovService[] {
  const scored = MOCK_GOV_SERVICES.filter((s) => modeMatches(s, input.mode))
    .map((s) => ({ service: s, score: scoreService(s, input.text) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return MOCK_GOV_SERVICES.filter((s) => modeMatches(s, input.mode)).slice(0, 4);
  }
  return scored.slice(0, limit).map((x) => x.service);
}

/** Deterministic ManualDemo pool for case planning fallbacks. */
export function planCivicCaseServicesFromPool(input: MatchInput, limit = 8): GovService[] {
  return matchGovServices(input, limit);
}

export const TOPIC_CATEGORIES = [
  'Wohnen',
  'Familie',
  'Arbeit & Einkommen',
  'Gesundheit & Pflege',
  'Gründung & Gewerbe',
  'Steuern & Abgaben',
  'Förderung',
  'Genehmigungen',
] as const;

export function detectTopics(text: string, services: GovService[]): string[] {
  const t = normalizeText(text);
  const fromServices = Array.from(new Set(services.map((s) => s.category)));
  const extra: string[] = [];
  if (/kind|baby|familie|eltern|schule|jugend/i.test(t)) extra.push('Familie');
  if (/wohn|miete|umzug|ummeld/i.test(t)) extra.push('Wohnen');
  if (/arbeit|job|einkommen|alg|sozial/i.test(t)) extra.push('Arbeit & Einkommen');
  if (/pflege|gesundheit|krank|behinder/i.test(t)) extra.push('Gesundheit & Pflege');
  if (/gewerbe|gründ|unternehmen|firma|mitarbeiter/i.test(t)) extra.push('Gründung & Gewerbe');
  if (/steuer|finanzamt|abgabe/i.test(t)) extra.push('Steuern & Abgaben');
  if (/förder|zuschuss|kfw/i.test(t)) extra.push('Förderung');
  if (/erlaubnis|genehmigung|gaststätte/i.test(t)) extra.push('Genehmigungen');
  return Array.from(new Set([...fromServices, ...extra])).slice(0, 6);
}
