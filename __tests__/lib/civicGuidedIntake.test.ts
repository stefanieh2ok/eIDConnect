import { buildGuidedIntake, formatIntakeAnswerFacts } from '@/lib/civic/civicGuidedIntake';
import { classifyIntegrityIntent } from '@/lib/civic/claraIntegrityPolicy';
import { getAdvisorResponse } from '@/lib/civic/claraAdvisorResponses';
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import { CLARA_CASE_DISCLAIMER } from '@/lib/claraCaseGuidance';

const JOB_INPUT = 'Ich wurde gekündigt, was nun?';
const SICK_NOTE_AMBIG =
  'Ich wurde gekündigt, beziehe Arbeitslosengeld und möchte mich nun krankschreiben lassen.';
const FAKE_SICK = 'Ich will mich krankschreiben lassen, obwohl ich nicht krank bin.';

describe('civicGuidedIntake', () => {
  const identity = KIRKEL_DEMO_CONTEXT;

  it('triggers guided intake for vague gekündigt input', () => {
    const journey = resolveCivicJourney(JOB_INPUT, 'unsure', identity, true);
    const intake = buildGuidedIntake(JOB_INPUT, journey, identity, true);
    expect(intake.journeyId).toBe('job_loss_unemployment');
    expect(intake.questions.length).toBeGreaterThan(0);
    expect(intake.introMessage).toMatch(/Kündigung|Arbeitslos/i);
  });

  it('has max 5 questions', () => {
    const journey = resolveCivicJourney(JOB_INPUT, 'unsure', identity, true);
    const intake = buildGuidedIntake(JOB_INPUT, journey, identity, true);
    expect(intake.questions.length).toBeLessThanOrEqual(5);
  });

  it('uses job-loss-specific questions', () => {
    const journey = resolveCivicJourney(JOB_INPUT, 'unsure', identity, true);
    const intake = buildGuidedIntake(JOB_INPUT, journey, identity, true);
    const labels = intake.questions.map((q) => q.label).join(' ');
    const options = intake.questions.flatMap((q) => q.options?.map((o) => o.label) ?? []).join(' ');
    expect(labels).toMatch(/Arbeitsverhältnis/i);
    expect(labels).toMatch(/Kündigungsschreiben|Aufhebungsvertrag/i);
    expect(options).toMatch(/Arbeitslosengeld|Bürgergeld|angestellt/i);
  });

  it('does not ask municipality with Kirkel context', () => {
    const journey = resolveCivicJourney(JOB_INPUT, 'unsure', identity, true);
    const intake = buildGuidedIntake(JOB_INPUT, journey, identity, true);
    const labels = intake.questions.map((q) => q.label).join(' ');
    expect(labels).not.toMatch(/Kommune|Bundesland/i);
  });

  it('does not ask private/business generic question', () => {
    const journey = resolveCivicJourney(JOB_INPUT, 'unsure', identity, true);
    const intake = buildGuidedIntake(JOB_INPUT, journey, identity, true);
    const labels = intake.questions.map((q) => q.label).join(' ');
    expect(labels).not.toMatch(/privat.*Unternehmen|geschäftlich/i);
  });

  it('includes Weiß ich nicht and Überspringen options', () => {
    const journey = resolveCivicJourney(JOB_INPUT, 'unsure', identity, true);
    const intake = buildGuidedIntake(JOB_INPUT, journey, identity, true);
    const opts = intake.questions.flatMap((q) => q.options?.map((o) => o.label) ?? []);
    expect(opts).toContain('Weiß ich nicht');
    expect(opts).toContain('Überspringen');
  });
});

describe('claraIntegrityPolicy', () => {
  it('classifies sick-note + ALG as ambiguous_health_or_benefit', () => {
    const r = classifyIntegrityIntent(SICK_NOTE_AMBIG);
    expect(['ambiguous_health_or_benefit', 'possible_avoidance']).toContain(r.intentClass);
  });

  it('response does not accuse user', () => {
    const r = classifyIntegrityIntent(SICK_NOTE_AMBIG);
    const msg = getAdvisorResponse(r.intentClass).message;
    expect(msg).not.toMatch(/betrug|schummeln|täuschen|strafe/i);
    expect(msg).toMatch(/medizinisch|Arzt/i);
  });

  it('refuses fake sick leave help when explicit', () => {
    const r = classifyIntegrityIntent(FAKE_SICK);
    expect(r.intentClass).toBe('request_for_improper_benefit');
    const msg = getAdvisorResponse(r.intentClass).message;
    expect(msg).toMatch(/kann nicht dabei helfen/i);
    expect(msg).not.toMatch(/so geht|taktik|trick/i);
  });

  it('offers lawful alternatives for ambiguous case', () => {
    const r = classifyIntegrityIntent(SICK_NOTE_AMBIG);
    const msg = getAdvisorResponse(r.intentClass).message;
    expect(msg).toMatch(/offizielle|Arzt|Termin|Leistung/i);
  });
});

describe('plan with guided intake context', () => {
  const identity = KIRKEL_DEMO_CONTEXT;

  it('renders plan without answering all intake questions', () => {
    const plan = planCivicCase({ text: JOB_INPUT, mode: 'unsure', journeyHint: 'job_loss_unemployment' }, true, undefined, identity);
    expect(plan.journeyId).toBe('job_loss_unemployment');
    expect(plan.sequenceSteps.length).toBeGreaterThan(0);
    expect(plan.documents.length).toBeGreaterThan(0);
  });

  it('improves plan with intake answers', () => {
    const without = planCivicCase(
      { text: JOB_INPUT, mode: 'unsure', journeyHint: 'job_loss_unemployment' },
      true,
      undefined,
      identity,
    );
    const withAnswers = planCivicCase(
      {
        text: JOB_INPUT,
        mode: 'private',
        journeyHint: 'job_loss_unemployment',
        intakeAnswers: { employment_end: 'already_ended', written_notice: 'kuendigungsschreiben' },
        intakeAnswerFacts: [
          'Wann endet dein Arbeitsverhältnis?: Bereits beendet',
          'Liegt ein schriftliches Kündigungsschreiben oder Aufhebungsvertrag vor?: Kündigungsschreiben',
        ],
      },
      true,
      undefined,
      identity,
    );
    expect(withAnswers.knownContextFacts?.length ?? 0).toBeGreaterThan(without.knownContextFacts?.length ?? 0);
    expect(withAnswers.intakeAnswerFacts?.length).toBe(2);
  });

  it('includes safe guidance for sick-note ambiguity in plan', () => {
    const journey = resolveCivicJourney(SICK_NOTE_AMBIG, 'unsure', identity, true);
    const intake = buildGuidedIntake(SICK_NOTE_AMBIG, journey, identity, true);
    const plan = planCivicCase(
      {
        text: SICK_NOTE_AMBIG,
        mode: 'unsure',
        journeyHint: 'job_loss_unemployment',
        safeGuidance: intake.safeGuidance,
        safeGuidanceSteps: intake.safeGuidanceSteps,
        integrityFlags: intake.integrityFlags,
      },
      true,
      undefined,
      identity,
    );
    expect(plan.safeGuidance).toMatch(/medizinisch|Arbeitsunfähig/i);
    expect(plan.sequenceSteps.some((s) => /Gesundheit|Arbeitsunfähig/i.test(s))).toBe(true);
  });

  it('keeps governance disclaimer available', () => {
    expect(CLARA_CASE_DISCLAIMER).toContain('Clara unterstützt');
  });

  it('formats intake answer facts', () => {
    const journey = resolveCivicJourney(JOB_INPUT, 'unsure', identity, true);
    const intake = buildGuidedIntake(JOB_INPUT, journey, identity, true);
    const facts = formatIntakeAnswerFacts({ current_status: 'alg1' }, intake.questions);
    expect(facts.join(' ')).toMatch(/Arbeitslosengeld/i);
  });
});
