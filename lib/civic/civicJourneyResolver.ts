/**
 * Resolves user text to a predefined civic journey template (mastercase matrix).
 */
import type { CasePlannerInput } from '@/lib/ai/claraCasePlanner';
import {
  formatKnownLocationFact,
  formatKnownLocationLabel,
  hasMunicipalityContext,
  type CivicIdentityContext,
} from '@/lib/civic/demoCivicContext';
import {
  CIVIC_JOURNEY_TEMPLATES,
  getJourneyTemplateById,
  type CivicJourneyId,
  type CivicJourneyTemplate,
} from '@/lib/civic/civicJourneyTemplates';

export type JourneyMatchConfidence = 'high' | 'medium' | 'low';

export type CivicJourneyResolution = {
  journeyId: CivicJourneyId;
  journeyTitle: string;
  matchedTemplate: CivicJourneyTemplate;
  template: CivicJourneyTemplate;
  confidence: JourneyMatchConfidence;
  inferredMode: 'private' | 'business' | 'unsure';
  inferredDomain: 'private' | 'business' | 'both';
  knownContextFacts: string[];
  orderedSteps: string[];
  relevantServiceKeywords: string[];
  sourceKeywords: string[];
  catalogServiceIds: string[];
  uncataloguedStepLabels: string[];
  requiredDocuments: string[];
  missingQuestions: string[];
  suggestedAuthorities: string[];
  situationSummary: string;
  sourceHint: string;
};

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function scoreTemplate(template: CivicJourneyTemplate, text: string): number {
  const t = normalizeText(text);
  let score = 0;
  for (const phrase of template.triggerPhrases) {
    if (t.includes(phrase.toLowerCase())) score += 3;
  }
  for (const kw of template.sourceKeywords) {
    if (t.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

function confidenceFromScore(score: number, fromQuickStart: boolean): JourneyMatchConfidence {
  if (fromQuickStart) return 'high';
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

function inferModeFromTemplate(
  template: CivicJourneyTemplate,
  userMode: CasePlannerInput['mode'],
): 'private' | 'business' | 'unsure' {
  if (userMode === 'private' || userMode === 'business') return userMode;
  if (template.domain === 'business') return 'business';
  if (template.domain === 'private') return 'private';
  return 'unsure';
}

function buildMissingQuestions(template: CivicJourneyTemplate, text: string, du: boolean): string[] {
  const questions: string[] = [];
  for (const q of template.missingQuestionTemplates) {
    if (q.skipIfTextMatches?.test(text)) continue;
    questions.push(du ? q.questionDu : q.questionSie);
  }
  return questions.slice(0, 4);
}

function buildKnownContextFacts(identity: CivicIdentityContext, du: boolean): string[] {
  const facts: string[] = [];
  const label = formatKnownLocationLabel(identity, du);
  const fact = formatKnownLocationFact(identity, du);
  if (label) facts.push(label);
  if (fact && !facts.includes(fact)) facts.push(fact);
  if (identity.knownFrom === 'demo_profile') {
    facts.push(du ? 'Demo-Profil: identifizierter Demo-Kontext.' : 'Demo-Profil: identifizierter Demo-Kontext.');
  }
  if (hasMunicipalityContext(identity)) {
    const place = [identity.municipality, identity.federalState].filter(Boolean).join(', ');
    if (place && !facts.some((f) => f.includes(place))) {
      facts.push(du ? `Bekannter Wohnort: ${place}.` : `Bekannter Wohnort: ${place}.`);
    }
  }
  return facts;
}

function buildResolution(
  template: CivicJourneyTemplate,
  text: string,
  mode: CasePlannerInput['mode'],
  identity: CivicIdentityContext,
  du: boolean,
  fromQuickStart: boolean,
  score: number,
): CivicJourneyResolution {
  const inferredMode = inferModeFromTemplate(template, mode);
  const knownContextFacts = buildKnownContextFacts(identity, du);
  const missingQuestions = buildMissingQuestions(template, text, du);

  return {
    journeyId: template.id,
    journeyTitle: template.title,
    matchedTemplate: template,
    template,
    confidence: confidenceFromScore(score, fromQuickStart),
    inferredMode,
    inferredDomain: template.domain,
    knownContextFacts,
    orderedSteps: template.orderedSteps,
    relevantServiceKeywords: template.relevantServiceKeywords,
    sourceKeywords: template.sourceKeywords,
    catalogServiceIds: template.catalogServiceIds,
    uncataloguedStepLabels: template.uncataloguedStepLabels,
    requiredDocuments: template.requiredDocuments,
    missingQuestions,
    suggestedAuthorities: template.suggestedAuthorities,
    situationSummary: du ? template.situationSummaryDu : template.situationSummarySie,
    sourceHint:
      'Clara nutzt für diese Demo den Kontext Kirkel, Saarland und vorbereitete offizielle Quellen.',
  };
}

export function resolveCivicJourney(
  text: string,
  mode: CasePlannerInput['mode'],
  identity: CivicIdentityContext,
  du = true,
  journeyHint?: CivicJourneyId,
): CivicJourneyResolution | null {
  if (journeyHint) {
    const hinted = getJourneyTemplateById(journeyHint);
    if (hinted) {
      return buildResolution(hinted, text, mode, identity, du, true, 99);
    }
  }

  const scored = CIVIC_JOURNEY_TEMPLATES.map((template) => ({
    template,
    score: scoreTemplate(template, text),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const best = scored[0];
  if (scored.length > 1 && best.score === scored[1].score) {
    const modeFiltered =
      mode === 'business'
        ? scored.find((x) => x.template.domain === 'business' || x.template.defaultMode === 'business') ?? best
        : mode === 'private'
          ? scored.find((x) => x.template.domain === 'private' || x.template.defaultMode === 'private') ?? best
          : best;
    return buildResolution(modeFiltered.template, text, mode, identity, du, false, modeFiltered.score);
  }

  return buildResolution(best.template, text, mode, identity, du, false, best.score);
}

export function journeyQuickStartText(journeyId: CivicJourneyId): string {
  return getJourneyTemplateById(journeyId)?.quickStartText ?? '';
}
