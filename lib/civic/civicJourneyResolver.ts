/**
 * Resolves user text to a predefined civic journey template.
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

export type CivicJourneyResolution = {
  journeyId: CivicJourneyId;
  journeyTitle: string;
  template: CivicJourneyTemplate;
  inferredMode: 'private' | 'business' | 'unsure';
  knownContextFacts: string[];
  orderedSteps: string[];
  relevantServiceKeywords: string[];
  catalogServiceIds: string[];
  uncataloguedStepLabels: string[];
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
  return score;
}

function inferModeFromTemplate(
  template: CivicJourneyTemplate,
  userMode: CasePlannerInput['mode'],
): 'private' | 'business' | 'unsure' {
  if (userMode === 'private' || userMode === 'business') return userMode;
  return template.defaultMode === 'business' ? 'business' : 'private';
}

function buildMissingQuestions(
  template: CivicJourneyTemplate,
  text: string,
  identity: CivicIdentityContext,
  du: boolean,
): string[] {
  const questions: string[] = [];
  for (const q of template.missingQuestionTemplates) {
    if (q.skipIfTextMatches?.test(text)) continue;
    questions.push(du ? q.questionDu : q.questionSie);
  }
  return questions.slice(0, 3);
}

function buildKnownContextFacts(identity: CivicIdentityContext, template: CivicJourneyTemplate, du: boolean): string[] {
  const facts: string[] = [];
  const label = formatKnownLocationLabel(identity, du);
  const fact = formatKnownLocationFact(identity, du);
  if (label) facts.push(label);
  if (fact && !facts.includes(fact)) facts.push(fact);
  if (hasMunicipalityContext(identity)) {
    const place = [identity.municipality, identity.federalState].filter(Boolean).join(', ');
    if (place && !facts.some((f) => f.includes(place))) {
      facts.push(du ? `Wohnort im Demo-Kontext: ${place}.` : `Wohnort im Demo-Kontext: ${place}.`);
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
): CivicJourneyResolution {
  const inferredMode = inferModeFromTemplate(template, mode);
  const knownContextFacts = buildKnownContextFacts(identity, template, du);
  const missingQuestions = buildMissingQuestions(template, text, identity, du);

  return {
    journeyId: template.id,
    journeyTitle: template.title,
    template,
    inferredMode,
    knownContextFacts,
    orderedSteps: template.orderedSteps,
    relevantServiceKeywords: template.relevantServiceKeywords,
    catalogServiceIds: template.catalogServiceIds,
    uncataloguedStepLabels: template.uncataloguedStepLabels,
    missingQuestions,
    suggestedAuthorities: template.suggestedAuthorities,
    situationSummary: du ? template.situationSummaryDu : template.situationSummarySie,
    sourceHint:
      'Für diese Demo nutzt Clara vorbereitete Verwaltungswege und kuratierte offizielle Quellen.',
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
    if (hinted) return buildResolution(hinted, text, mode, identity, du);
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
        ? scored.find((x) => x.template.defaultMode === 'business') ?? best
        : mode === 'private'
          ? scored.find((x) => x.template.defaultMode === 'private') ?? best
          : best;
    return buildResolution(modeFiltered.template, text, mode, identity, du);
  }

  return buildResolution(best.template, text, mode, identity, du);
}

export function journeyQuickStartText(journeyId: CivicJourneyId): string {
  return getJourneyTemplateById(journeyId)?.quickStartText ?? '';
}
