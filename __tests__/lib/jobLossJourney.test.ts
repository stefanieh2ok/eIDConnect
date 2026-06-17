import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';
import { SOURCE_NOTICE_TEMPLATE_ONLY } from '@/lib/govdata/sourceStatus';

const JOB_LOSS_INPUT = 'Ich wurde gekündigt, was nun?';
const identity = KIRKEL_DEMO_CONTEXT;

describe('job_loss_unemployment journey', () => {
  it('resolves gekündigt input to job_loss_unemployment', () => {
    const journey = resolveCivicJourney(JOB_LOSS_INPUT, 'unsure', identity, true);
    expect(journey?.journeyId).toBe('job_loss_unemployment');
  });

  it('includes Agentur für Arbeit in authorities', () => {
    const plan = planCivicCase({ text: JOB_LOSS_INPUT, mode: 'unsure' }, true, undefined, identity);
    expect(plan.journeyId).toBe('job_loss_unemployment');
    expect(plan.touchedAuthorities.join(' ')).toMatch(/Agentur für Arbeit/i);
  });

  it('includes required documents from template', () => {
    const plan = planCivicCase({ text: JOB_LOSS_INPUT, mode: 'unsure' }, true, undefined, identity);
    const labels = plan.documents.map((d) => d.label).join(' ');
    expect(labels).toMatch(/Kündigungsschreiben|Aufhebungsvertrag/i);
    expect(labels).toMatch(/Arbeitsvertrag/i);
    expect(plan.documents.length).toBeGreaterThanOrEqual(6);
  });

  it('does not ask municipality when Kirkel context exists', () => {
    const plan = planCivicCase({ text: JOB_LOSS_INPUT, mode: 'unsure' }, true, undefined, identity);
    expect(plan.followUpQuestions.join(' ')).not.toMatch(/Kommune|Bundesland/i);
  });

  it('does not ask private/business generic question', () => {
    const plan = planCivicCase({ text: JOB_LOSS_INPUT, mode: 'unsure' }, true, undefined, identity);
    expect(plan.followUpQuestions.join(' ')).not.toMatch(/privat.*Unternehmen|geschäftlich/i);
  });

  it('does not show Wohnort / Kommune klären as first step', () => {
    const plan = planCivicCase({ text: JOB_LOSS_INPUT, mode: 'unsure' }, true, undefined, identity);
    expect(plan.sequenceSteps[0]).not.toMatch(/Kommune|Wohnort/i);
    expect(plan.sequenceSteps[0]).toMatch(/Kündigung/i);
  });

  it('shows Kirkel Saarland known context', () => {
    const plan = planCivicCase({ text: JOB_LOSS_INPUT, mode: 'unsure' }, true, undefined, identity);
    const ctx = (plan.knownContextFacts ?? []).join(' ');
    expect(ctx).toMatch(/Kirkel/i);
    expect(ctx).toMatch(/Saarland/i);
  });

  it('renders template documents and steps when gov resolution returns no services', () => {
    const plan = planCivicCase(
      { text: JOB_LOSS_INPUT, mode: 'unsure' },
      true,
      { services: [], isDemoData: true, sourceNotice: null, mode: 'demo' },
      identity,
    );
    expect(plan.sequenceSteps.length).toBeGreaterThanOrEqual(5);
    expect(plan.documents.length).toBeGreaterThan(0);
    expect(plan.touchedAuthorities.join(' ')).toMatch(/Agentur für Arbeit/i);
  });

  it('quick-start hint resolves with high confidence', () => {
    const journey = resolveCivicJourney(
      'Ich wurde gekündigt und möchte wissen, welche Schritte wichtig sind.',
      'private',
      identity,
      true,
      'job_loss_unemployment',
    );
    expect(journey?.journeyId).toBe('job_loss_unemployment');
    expect(journey?.confidence).toBe('high');
  });

  it('uses calm template source notice when no verified catalog match', () => {
    const plan = planCivicCase(
      { text: 'Ich brauche Orientierung zu Heirat und Namensänderung in Kirkel.', mode: 'private' },
      true,
      { services: [], isDemoData: true, sourceNotice: null, mode: 'demo' },
      identity,
    );
    expect(plan.journeyId).toBe('marriage_name_change');
    expect(plan.sourceNotice).toBe(SOURCE_NOTICE_TEMPLATE_ONLY);
  });
});

describe('existing journeys still work', () => {
  it('child_birth_kita still resolves', () => {
    const plan = planCivicCase(
      { text: 'Ich bekomme ein Kind. An was muss ich denken?', mode: 'unsure' },
      true,
      undefined,
      identity,
    );
    expect(plan.journeyId).toBe('child_birth_kita');
  });

  it('business_registration still resolves', () => {
    const plan = planCivicCase(
      { text: 'Ich möchte ein Gewerbe anmelden beim Finanzamt.', mode: 'business' },
      true,
      undefined,
      identity,
    );
    expect(plan.journeyId).toBe('business_registration');
  });

  it('moving_with_children still resolves', () => {
    const plan = planCivicCase(
      { text: 'Ich ziehe mit Kindern um und brauche Ummeldung.', mode: 'private' },
      true,
      undefined,
      identity,
    );
    expect(plan.journeyId).toBe('moving_with_children');
  });
});
