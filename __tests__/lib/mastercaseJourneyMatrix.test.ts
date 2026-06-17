import { planCivicCase, CLARA_CASE_DISCLAIMER } from '@/lib/ai/claraCasePlanner';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { CIVIC_JOURNEY_TEMPLATES } from '@/lib/civic/civicJourneyTemplates';
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';

const CHILD_INPUT =
  'Ich bekomme ein Kind. An was muss ich alles denken? Welche Formulare und Behördengänge sind nötig?';

describe('mastercase journey matrix', () => {
  it('defines 24 MVP templates', () => {
    expect(CIVIC_JOURNEY_TEMPLATES).toHaveLength(25);
    expect(CIVIC_JOURNEY_TEMPLATES.every((t) => t.priority === 'mvp')).toBe(true);
  });

  it('each template has required fields populated', () => {
    for (const template of CIVIC_JOURNEY_TEMPLATES) {
      expect(template.triggerPhrases.length).toBeGreaterThan(0);
      expect(template.missingQuestionTemplates.length).toBeGreaterThan(0);
      expect(template.suggestedAuthorities.length).toBeGreaterThan(0);
      expect(template.orderedSteps.length).toBeGreaterThan(0);
      expect(template.requiredDocuments.length).toBeGreaterThan(0);
      expect(template.sourceKeywords.length).toBeGreaterThan(0);
    }
  });
});

describe('mastercase resolver and planner integration', () => {
  const identity = KIRKEL_DEMO_CONTEXT;

  it('does not ask generic privat/geschäftlich in resolved template output', () => {
    const journey = resolveCivicJourney(CHILD_INPUT, 'unsure', identity, true);
    expect(journey?.missingQuestions.join(' ')).not.toMatch(/privat.*Unternehmen|geschäftlich/i);
  });

  it('shows Kirkel Saarland known context in plan', () => {
    const plan = planCivicCase({ text: CHILD_INPUT, mode: 'unsure' }, true, undefined, identity);
    const context = (plan.knownContextFacts ?? []).join(' ');
    expect(context).toMatch(/Kirkel/i);
    expect(context).toMatch(/Saarland/i);
  });

  it('renders plan from quick-start journey hint text', () => {
    const plan = planCivicCase(
      {
        text: 'Ich erwarte ein Kind und brauche Orientierung zu Kita und Elterngeld in Kirkel.',
        mode: 'unsure',
        journeyHint: 'child_birth_kita',
      },
      true,
      undefined,
      identity,
    );
    expect(plan.journeyId).toBe('child_birth_kita');
    expect(plan.sequenceSteps.length).toBeGreaterThan(3);
    expect(plan.documents.length).toBeGreaterThan(0);
  });

  it('keeps governance disclaimer on plan result', () => {
    const plan = planCivicCase({ text: CHILD_INPUT, mode: 'unsure' }, true, undefined, identity);
    expect(plan.identityContextDisclaimer).toBeTruthy();
    expect(CLARA_CASE_DISCLAIMER.length).toBeGreaterThan(20);
  });
});
