import { planCivicCase, getExampleCases } from '@/lib/ai/claraCasePlanner';
import { matchGovServices } from '@/lib/govdata/serviceMatcher';
import { MOCK_GOV_SERVICES } from '@/lib/govdata/mockGovServices';
import {
  CLARA_CASE_DISCLAIMER,
  CLARA_DEMO_DATA_NOTICE,
  CLARA_CONFIDENCE_LABELS,
  containsForbiddenClaraLanguage,
} from '@/lib/claraCaseGuidance';
import { confidenceLabel } from '@/lib/govdata/officialSourceFormatter';

describe('claraCasePlanner', () => {
  it('returns structured case plan for multi-topic private situation', () => {
    const plan = planCivicCase({
      text: 'Ich ziehe mit zwei Kindern um, Einkommen ist niedrig, brauche Wohngeld und Schulwechsel.',
      mode: 'private',
    });
    expect(plan.situationSummary).toMatch(/Umzug|Kind/i);
    expect(plan.topics.length).toBeGreaterThan(0);
    expect(plan.services.length).toBeGreaterThan(0);
    expect(plan.sequenceSteps.length).toBeGreaterThanOrEqual(4);
    expect(plan.isDemoData).toBe(true);
    expect(plan.sourceNotice).toMatch(/Offizielle Datenquelle|kuratierten|Wegweiser-Template/i);
    expect(plan.followUpQuestions.length).toBeLessThanOrEqual(3);
  });

  it('matches business gewerbe scenario', () => {
    const plan = planCivicCase({
      text: 'Ich möchte ein Gewerbe anmelden und Mitarbeiter einstellen.',
      mode: 'business',
    });
    const titles = plan.services.map((s) => s.title);
    expect(titles.some((t) => /Gewerbe|Mitarbeiter|Steuer/i.test(t))).toBe(true);
  });

  it('never claims submission capability in disclaimer fields', () => {
    const plan = planCivicCase({ text: 'Test', mode: 'private' });
    expect(plan.risks.every((r) => !/wir reichen|anspruch auf/i.test(r.text))).toBe(true);
    expect(containsForbiddenClaraLanguage(plan.situationSummary)).toBeNull();
  });

  it('flags demo data and respects mode-specific matching', () => {
    const privatePlan = planCivicCase({ text: 'Umzug mit Kindern', mode: 'private' });
    const businessPlan = planCivicCase({
      text: 'Gewerbe anmelden und Mitarbeiter einstellen',
      mode: 'business',
    });
    const unsurePlan = planCivicCase({ text: 'Ich weiß nicht ob privat oder Firma', mode: 'unsure' });

    expect(privatePlan.isDemoData).toBe(true);
    expect(businessPlan.isDemoData).toBe(true);
    expect(unsurePlan.isDemoData).toBe(true);
    expect(privatePlan.mode).toBe('private');
    expect(businessPlan.mode).toBe('business');
    expect(unsurePlan.mode).toBe('unsure');
  });

  it('orchestrates multi-authority cases', () => {
    const plan = planCivicCase({
      text: 'Ich ziehe mit zwei Kindern um, Einkommen niedrig, brauche Wohngeld, Kindergeld und Jobcenter.',
      mode: 'private',
    });
    expect(plan.touchedAuthorities.length).toBeGreaterThan(1);
    expect(plan.services.length).toBeGreaterThan(1);
  });

  it('uses confidence labels aligned with Clara guidance', () => {
    const matched = matchGovServices({ text: 'Wohngeld und Ummeldung', mode: 'private' });
    for (const service of matched) {
      const label = confidenceLabel(service.confidence);
      expect(Object.values(CLARA_CONFIDENCE_LABELS)).toContain(label);
    }
  });

  it('exports disclaimer constant for UI', () => {
    const plan = planCivicCase({ text: 'Test', mode: 'private' });
    expect(CLARA_CASE_DISCLAIMER).toContain('Clara unterstützt bei Orientierung und Vorbereitung');
    expect(CLARA_DEMO_DATA_NOTICE).toContain('Demo-Daten');
    expect(plan.followUpQuestions.length).toBeLessThanOrEqual(3);
  });

  it('supports live resolution metadata without demo notice', () => {
    const services = matchGovServices({ text: 'Wohngeld und Ummeldung', mode: 'private' });
    const plan = planCivicCase(
      { text: 'Wohngeld und Ummeldung', mode: 'private' },
      true,
      {
        services,
        isDemoData: false,
        sourceNotice: null,
        mode: 'pvog_search',
      },
    );
    expect(plan.isDemoData).toBe(false);
    expect(plan.sourceNotice).toBeNull();
    expect(plan.sourceMode).toBe('pvog_search');
  });

  it('exposes four example cases', () => {
    expect(getExampleCases()).toHaveLength(4);
  });
});

describe('serviceMatcher', () => {
  it('labels all mock services as ManualDemo', () => {
    expect(MOCK_GOV_SERVICES.every((s) => s.sourceSystem === 'ManualDemo')).toBe(true);
  });

  it('returns services for ummeldung keywords', () => {
    const matched = matchGovServices({ text: 'Ich ziehe um und muss mich ummelden', mode: 'private' });
    expect(matched.some((s) => s.serviceId === 'demo-ummeldung')).toBe(true);
  });
});
