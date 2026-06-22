import {
  MASTERCASE_MATRIX,
  getMastercaseById,
  getMvpMastercases,
  getOfficialCatalogActionIds,
  resolveMastercaseFromText,
  resolveMastercaseViaJourney,
} from '@/lib/civic/mastercaseMatrix';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';

const FORBIDDEN_PATTERNS = [/pvog ist live/i, /demo-link/i, /xzufi.*live/i];

function allActionIds(mc: (typeof MASTERCASE_MATRIX)[number]): string[] {
  const fromActions = mc.orderedActions.map((a) => a.officialActionId).filter(Boolean) as string[];
  return [...new Set([...mc.officialActionIds, ...fromActions])];
}

describe('mastercaseMatrix structure', () => {
  it('defines expected mastercase count', () => {
    expect(MASTERCASE_MATRIX.length).toBeGreaterThanOrEqual(50);
  });

  it('every mastercase has id, title, domain, category, triggerPhrases', () => {
    for (const mc of MASTERCASE_MATRIX) {
      expect(mc.id).toBeTruthy();
      expect(mc.title).toBeTruthy();
      expect(['private', 'business', 'employer', 'mixed']).toContain(mc.domain);
      expect(mc.category).toBeTruthy();
      expect(mc.triggerPhrases.length).toBeGreaterThan(0);
      expect(mc.userIntentExamples.length).toBeGreaterThan(0);
      expect(mc.testInputs.length).toBeGreaterThan(0);
    }
  });

  it('every MVP mastercase has at least one ordered action', () => {
    for (const mc of getMvpMastercases()) {
      expect(mc.orderedActions.length).toBeGreaterThan(0);
    }
  });

  it('every MVP mastercase has required documents or explicit dependency note', () => {
    for (const mc of getMvpMastercases()) {
      const hasDocs =
        mc.requiredDocuments.length > 0 ||
        mc.orderedActions.some((a) => (a.documents?.length ?? 0) > 0) ||
        mc.safetyNotes.some((n) => /abhängig|je nach/i.test(n));
      expect(hasDocs).toBe(true);
    }
  });

  it('every officialActionId used exists in officialActionCatalog', () => {
    const catalog = getOfficialCatalogActionIds();
    for (const mc of MASTERCASE_MATRIX) {
      for (const id of allActionIds(mc)) {
        expect(catalog.has(id)).toBe(true);
      }
    }
  });

  it('no mastercase contains forbidden PVOG live claims or Demo-Link', () => {
    for (const mc of MASTERCASE_MATRIX) {
      const blob = JSON.stringify(mc);
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(blob).not.toMatch(pattern);
      }
    }
  });

  it('no mastercase invents direct municipal form URLs', () => {
    for (const mc of MASTERCASE_MATRIX) {
      const blob = JSON.stringify(mc);
      expect(blob).not.toMatch(/https?:\/\/.*kirkel\.de\/form/i);
      expect(blob).not.toMatch(/gemeinde-kirkel.*\.pdf/i);
    }
  });
});

describe('mastercaseMatrix domain rules', () => {
  it('job_loss_unemployment has no Familienkasse by default', () => {
    const mc = getMastercaseById('job_loss_unemployment')!;
    expect(mc.responsibleAuthorities.join(' ')).not.toMatch(/familienkasse/i);
    expect(mc.orderedActions.map((a) => a.authority).join(' ')).not.toMatch(/familienkasse/i);
  });

  it('child_birth_family_benefits has no Agentur für Arbeit by default', () => {
    const mc = getMastercaseById('child_birth_family_benefits')!;
    const authorities = mc.responsibleAuthorities.join(' ');
    expect(authorities).not.toMatch(/agentur für arbeit/i);
    const actions = mc.orderedActions.map((a) => a.authority).join(' ');
    expect(actions).not.toMatch(/agentur für arbeit/i);
    expect(mc.officialActionIds).not.toContain('register_unemployed');
  });

  it('first_employee_hiring includes Betriebsnummer', () => {
    const mc = getMastercaseById('first_employee_hiring')!;
    const titles = mc.orderedActions.map((a) => a.title).join(' ');
    expect(titles).toMatch(/betriebsnummer/i);
    expect(mc.officialActionIds).toContain('employer_number');
  });

  it('business_registration uses regional lookup when exact municipal source missing', () => {
    const mc = getMastercaseById('business_registration')!;
    expect(mc.regionalLookupRequired).toBe(true);
    expect(mc.sourceStatus).toBe('regional_lookup_required');
    const trade = mc.orderedActions.find((a) => a.officialActionId === 'trade_register');
    expect(trade?.sourceRequirement).toBe('regional');
  });

  it('death_in_family includes Standesamt and sensitive wording', () => {
    const mc = getMastercaseById('death_in_family')!;
    expect(mc.responsibleAuthorities.join(' ')).toMatch(/standesamt/i);
    expect(mc.safetyNotes.join(' ')).toMatch(/behutsam/i);
    expect(mc.orderedActions.some((a) => /sterbeurkunde|standesamt/i.test(a.title))).toBe(true);
  });

  it('care_case_family_member includes Pflegekasse', () => {
    const mc = getMastercaseById('care_case_family_member')!;
    expect(mc.responsibleAuthorities.join(' ')).toMatch(/pflegekasse/i);
    expect(mc.orderedActions.some((a) => /pflegekasse/i.test(a.authority))).toBe(true);
  });

  it('citizen_benefit_basic_security does not promise entitlement', () => {
    const mc = getMastercaseById('citizen_benefit_basic_security')!;
    const blob = [...mc.governanceNotes, ...mc.safetyNotes, ...mc.orderedActions.map((a) => a.notes ?? '')].join(' ');
    expect(blob).toMatch(/kein.*anspruch|keinen leistungsanspruch|kein anspuch versprechen|beratung/i);
  });

  it('further_training_interest requires Bildungsgutschein Beratung clarification', () => {
    const mc = getMastercaseById('further_training_interest')!;
    const notes = [...mc.safetyNotes, ...mc.orderedActions.map((a) => a.notes ?? '')].join(' ');
    expect(notes).toMatch(/bildungsgutschein|beratung|prüfung/i);
  });
});

describe('mastercaseMatrix resolver integration', () => {
  const identity = KIRKEL_DEMO_CONTEXT;

  const resolverCases: { input: string; expectedId: string }[] = [
    {
      input: 'Ich wurde gekündigt. Was muss ich tun?',
      expectedId: 'job_loss_unemployment',
    },
    {
      input: 'Ich bekomme ein Kind. An was muss ich alles denken?',
      expectedId: 'child_birth_family_benefits',
    },
    {
      input: 'Ich möchte ein Gewerbe in Kirkel anmelden.',
      expectedId: 'business_registration',
    },
    {
      input: 'Ich stelle zum ersten Mal Mitarbeitende ein.',
      expectedId: 'first_employee_hiring',
    },
    {
      input: 'Pflegefall in der Familie — welche Leistungen gibt es?',
      expectedId: 'care_case_family_member',
    },
  ];

  it.each(resolverCases)('testInputs resolve via journey for: $expectedId', ({ input, expectedId }) => {
    const mc = resolveMastercaseViaJourney(input, identity);
    expect(mc?.id).toBe(expectedId);
    const journey = resolveCivicJourney(input, 'unsure', identity, true);
    expect(journey?.journeyId).toBe(getMastercaseById(expectedId)?.journeyId);
  });

  it('resolveMastercaseFromText matches trigger phrases', () => {
    const mc = resolveMastercaseFromText('Ich brauche Wohngeld für meine Miete.');
    expect(mc?.id).toBe('housing_benefit');
  });
});
