import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import { KIRKEL_DEMO_CONTEXT, resolvePlannerIdentityContext } from '@/lib/civic/demoCivicContext';
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';
import { SOURCE_NOTICE_VERIFIED_CATALOG } from '@/lib/govdata/sourceStatus';
import { getVerifiedCatalogByIds } from '@/lib/govdata/verifiedOfficialSources';
import { resolveExternalLinkStatus } from '@/lib/govdata/externalLinkGate';

const CHILD_INPUT =
  'Ich bekomme ein Kind. An was muss ich alles denken? Welche Formulare und Behördengänge sind nötig?';

describe('civic journey resolver', () => {
  const identity = resolvePlannerIdentityContext();

  it('resolves child input to child_birth_kita', () => {
    const journey = resolveCivicJourney(CHILD_INPUT, 'unsure', identity, true);
    expect(journey?.journeyId).toBe('child_birth_kita');
  });

  it('prevents municipality question when Kirkel demo context exists', () => {
    const journey = resolveCivicJourney(CHILD_INPUT, 'unsure', identity, true);
    expect(journey?.missingQuestions.join(' ')).not.toMatch(/Kommune|Bundesland/i);
  });

  it('includes child-specific missing questions only', () => {
    const journey = resolveCivicJourney(CHILD_INPUT, 'unsure', identity, true);
    expect(journey?.missingQuestions.some((q) => /geboren|erwartest/i.test(q))).toBe(true);
    expect(journey?.missingQuestions.some((q) => /Kita-Platz/i.test(q))).toBe(true);
    expect(journey?.missingQuestions.some((q) => /krankenversichert/i.test(q))).toBe(true);
    expect(journey?.missingQuestions.some((q) => /privat.*Unternehmen|geschäftlich/i.test(q))).toBe(
      false,
    );
  });

  it('resolves moving input to moving_with_children', () => {
    const journey = resolveCivicJourney('Ich ziehe mit Kindern um und brauche Ummeldung und Wohngeld.', 'private', identity, true);
    expect(journey?.journeyId).toBe('moving_with_children');
  });

  it('resolves business input to business_registration', () => {
    const journey = resolveCivicJourney('Ich möchte ein Gewerbe anmelden beim Finanzamt und IHK.', 'business', identity, true);
    expect(journey?.journeyId).toBe('business_registration');
  });
});

describe('planCivicCase with Kirkel journey templates', () => {
  const identity = KIRKEL_DEMO_CONTEXT;

  it('shows known Kirkel context in plan', () => {
    const plan = planCivicCase({ text: CHILD_INPUT, mode: 'unsure' }, true, undefined, identity);
    expect(plan.journeyId).toBe('child_birth_kita');
    expect(plan.knownContextFacts?.join(' ')).toMatch(/Kirkel/i);
    expect(plan.knownContextFacts?.join(' ')).toMatch(/Saarland/i);
  });

  it('uses journey situation summary for child case', () => {
    const plan = planCivicCase({ text: CHILD_INPUT, mode: 'unsure' }, true, undefined, identity);
    expect(plan.situationSummary).toMatch(/Kind/i);
    expect(plan.situationSummary).not.toMatch(/Situation erfasst/i);
  });

  it('lists journey authorities and steps', () => {
    const plan = planCivicCase({ text: CHILD_INPUT, mode: 'unsure' }, true, undefined, identity);
    expect(plan.touchedAuthorities).toContain('Familienkasse');
    expect(plan.sequenceSteps.some((s) => /Kindergeld/i.test(s))).toBe(true);
    expect(plan.followUpQuestions.join(' ')).not.toMatch(/Kommune/i);
  });

  it('assigns child template via journey hint from quick start', () => {
    const plan = planCivicCase(
      { text: CHILD_INPUT, mode: 'unsure', journeyHint: 'child_birth_kita' },
      true,
      undefined,
      identity,
    );
    expect(plan.journeyId).toBe('child_birth_kita');
  });

  it('keeps verified_catalog service labels when resolution provided', () => {
    const catalogServices = getVerifiedCatalogByIds(['vc-kindergeld', 'vc-elterngeld']);
    const plan = planCivicCase(
      { text: CHILD_INPUT, mode: 'private' },
      true,
      {
        services: catalogServices,
        isDemoData: false,
        sourceNotice: SOURCE_NOTICE_VERIFIED_CATALOG,
        mode: 'verified_catalog',
      },
      identity,
    );
    expect(plan.sourceNotice).toBe(SOURCE_NOTICE_VERIFIED_CATALOG);
    for (const service of plan.services) {
      expect(resolveExternalLinkStatus(service)).not.toBe('demo_unverified');
    }
    const serviceText = JSON.stringify(plan.services);
    expect(serviceText).not.toMatch(/Demo-Link/i);
  });

  it('labels uncatalogued journey steps calmly', () => {
    const plan = planCivicCase({ text: CHILD_INPUT, mode: 'unsure' }, true, undefined, identity);
    expect(plan.uncataloguedStepLabels?.some((l) => /Geburtsurkunde|Standesamt/i.test(l))).toBe(true);
  });
});
