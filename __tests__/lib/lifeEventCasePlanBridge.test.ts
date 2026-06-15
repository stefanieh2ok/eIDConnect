import { planCivicCaseFromLifeEvent } from '@/lib/ai/lifeEventCasePlanBridge';
import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import {
  CLARA_CASE_DISCLAIMER,
  CLARA_DEMO_DATA_NOTICE,
  containsForbiddenClaraLanguage,
} from '@/lib/claraCaseGuidance';

describe('lifeEventCasePlanBridge', () => {
  it('returns same CivicCasePlanResult shape as claraCasePlanner', () => {
    const fromLifeEvent = planCivicCaseFromLifeEvent('moving', { wohnort: 'Kirkel' });
    const fromPlanner = planCivicCase({
      text: 'Lebenslage: Umzug. Umzug, Ummeldung, neue Wohnung. Region Kirkel/Saarland.',
      mode: 'private',
      wohnort: 'Kirkel',
    });

    expect(fromLifeEvent).toMatchObject({
      situationSummary: expect.any(String),
      topics: expect.any(Array),
      services: expect.any(Array),
      touchedAuthorities: expect.any(Array),
      documents: expect.any(Array),
      sequenceSteps: expect.any(Array),
      risks: expect.any(Array),
      handoverLinks: expect.any(Array),
      mode: 'private',
      isDemoData: true,
    });
    expect(fromLifeEvent.isDemoData).toBe(fromPlanner.isDemoData);
    expect(fromLifeEvent.followUpQuestions.length).toBeLessThanOrEqual(3);
  });

  it('produces plan without forbidden entitlement language', () => {
    const plan = planCivicCaseFromLifeEvent('job_search');
    expect(containsForbiddenClaraLanguage(plan.situationSummary)).toBeNull();
    expect(plan.risks.every((r) => containsForbiddenClaraLanguage(r.text) === null)).toBe(true);
  });
});

describe('clara v7 plan compliance', () => {
  it('includes mandatory notices in planner output context', () => {
    expect(CLARA_CASE_DISCLAIMER).toContain('Clara unterstützt bei Orientierung');
    expect(CLARA_DEMO_DATA_NOTICE).toContain('PVOG/XZuFi');
  });

  it('orchestrates multi-authority private cases', () => {
    const plan = planCivicCase({
      text: 'Umzug mit Kindern, Wohngeld, Kindergeld, Jobcenter',
      mode: 'private',
    });
    expect(plan.touchedAuthorities.length).toBeGreaterThan(1);
  });
});
