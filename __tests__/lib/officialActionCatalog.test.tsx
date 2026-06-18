import { CIVIC_JOURNEY_TEMPLATES } from '@/lib/civic/civicJourneyTemplates';
import {
  OFFICIAL_ACTION_CATALOG,
  getOfficialActionsForJourney,
  VERIFIED_URLS,
  BA_URLS,
} from '@/lib/civic/officialActionCatalog';
import { linkCtaLabel } from '@/lib/civic/officialActionLinkLabels';
import {
  buildDocumentsFromOfficialActions,
  detectTrainingFundingState,
  resolveOfficialActionsForJourney,
  shouldIncludeHousingDocuments,
} from '@/lib/civic/officialActionResolver';
import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { render, screen } from '@testing-library/react';
import { CivicCasePlan } from '@/components/civic/CivicCasePlan';
import { CLARA_CASE_DISCLAIMER } from '@/lib/claraCaseGuidance';

const PLACEHOLDER_PATTERNS = [/example\.com/i, /placeholder/i, /localhost/i, /lorem\.ipsum/i];

describe('officialActionCatalog', () => {
  it('every journey template has at least one official action', () => {
    for (const template of CIVIC_JOURNEY_TEMPLATES) {
      const actions = getOfficialActionsForJourney(template.id);
      expect(actions.length).toBeGreaterThan(0);
    }
  });

  it('every official action has sourceOwner, level, status and lastVerified on links', () => {
    for (const action of OFFICIAL_ACTION_CATALOG) {
      expect(action.links.length).toBeGreaterThan(0);
      for (const link of action.links) {
        expect(link.sourceOwner).toBeTruthy();
        expect(link.level).toBeTruthy();
        expect(link.status).toBeTruthy();
        expect(link.lastVerified).toBeTruthy();
        expect(link.confidence).toBeTruthy();
      }
    }
  });

  it('no action link uses placeholder URLs', () => {
    for (const action of OFFICIAL_ACTION_CATALOG) {
      for (const link of action.links) {
        if (!link.url) continue;
        for (const pattern of PLACEHOLDER_PATTERNS) {
          expect(link.url).not.toMatch(pattern);
        }
        expect(link.url.startsWith('https://')).toBe(true);
      }
    }
  });

  it('verified URLs match repository catalogue', () => {
    expect(VERIFIED_URLS.kindergeld).toContain('arbeitsagentur.de');
    expect(VERIFIED_URLS.gewerbe).toContain('bund.de');
    expect(VERIFIED_URLS.arbeitslosengeldHub).toBe(BA_URLS.arbeitslosengeldHub);
    expect(VERIFIED_URLS.baEservices).toBe(BA_URLS.eservices);
  });

  it('does not use fragile BA arbeitslos-melden deep link', () => {
    for (const action of OFFICIAL_ACTION_CATALOG) {
      for (const link of action.links) {
        if (!link.url) continue;
        expect(link.url).not.toContain('/arbeitslos-melden');
      }
    }
  });

  it('job-loss actions use stable BA hub or eServices', () => {
    const actions = getOfficialActionsForJourney('job_loss_unemployment');
    const jobseeker = actions.find((a) => a.actionId === 'register_jobseeker');
    const unemployed = actions.find((a) => a.actionId === 'register_unemployed');
    const alg = actions.find((a) => a.actionId === 'alg1_apply');
    expect(jobseeker?.links.some((l) => l.url === BA_URLS.eservices)).toBe(true);
    expect(unemployed?.links.some((l) => l.url === BA_URLS.eservices)).toBe(true);
    expect(alg?.links.some((l) => l.url === BA_URLS.arbeitslosengeldHub)).toBe(true);
  });
});

describe('resolveOfficialActionsForJourney', () => {
  it('child_birth_kita resolves Kindergeld, Elterngeld, Kita actions', () => {
    const groups = resolveOfficialActionsForJourney(
      'child_birth_kita',
      {},
      KIRKEL_DEMO_CONTEXT,
      'Ich bekomme ein Kind und brauche Elterngeld, Kindergeld und Kita.',
    );
    const titles = groups.flatMap((g) => g.actions.map((a) => a.title)).join(' ');
    expect(titles).toMatch(/Kindergeld/i);
    expect(titles).toMatch(/Elterngeld/i);
    expect(titles).toMatch(/Kita|Kinderbetreuung/i);
  });

  it('unemployment_training resolves core job-loss actions and training counselling', () => {
    const groups = resolveOfficialActionsForJourney(
      'unemployment_training',
      { first_need: 'weiterbildung_jobsuche' },
      KIRKEL_DEMO_CONTEXT,
      'Ich wurde gekündigt und interessiere mich für Weiterbildung.',
    );
    const actions = groups.flatMap((g) => g.actions);
    const titles = actions.map((a) => a.title).join(' ');
    expect(titles).toMatch(/Arbeitsuchend/i);
    expect(titles).toMatch(/Arbeitslos melden/i);
    expect(titles).toMatch(/Arbeitslosengeld/i);
    expect(titles).toMatch(/Weiterbildungsinteresse/i);
    const training = actions.find((a) => a.actionId === 'training_counselling');
    expect(training?.availableLinks[0]?.status).toBe('counselling_required');
    expect(training?.availableLinks.some((l) => l.url === BA_URLS.bildungsgutschein)).toBe(true);
    expect(training?.safetyNotes?.join(' ')).toMatch(/keine automatische Leistung/i);
  });

  it('Weiterbildung interest resolves counselling_required, not approved', () => {
    const state = detectTrainingFundingState('Ich möchte mich weiterbilden und einen Bildungsgutschein.');
    expect(state).toBe('training_interest_only');
    const groups = resolveOfficialActionsForJourney(
      'job_loss_unemployment',
      { first_need: 'weiterbildung_jobsuche' },
      undefined,
      'Weiterbildung und Qualifizierung',
    );
    const training = groups.flatMap((g) => g.actions).find((a) => a.actionId === 'training_counselling');
    expect(training?.availableLinks[0]?.status).toBe('counselling_required');
    expect(linkCtaLabel(training!.availableLinks[0])).toBe('Beratung vorbereiten');
  });

  it('training_approved only if explicit approval text exists', () => {
    expect(detectTrainingFundingState('Bildungsgutschein liegt vor')).toBe('training_approved');
    expect(detectTrainingFundingState('Ich interessiere mich für Weiterbildung')).toBe(
      'training_interest_only',
    );
  });

  it('business_registration resolves Gewerbe, Finanzamt, IHK/HWK, Berufsgenossenschaft', () => {
    const groups = resolveOfficialActionsForJourney(
      'business_registration',
      {},
      KIRKEL_DEMO_CONTEXT,
      'Ich möchte ein Gewerbe anmelden.',
    );
    const titles = groups.flatMap((g) => g.actions.map((a) => a.title)).join(' ');
    expect(titles).toMatch(/Gewerbe anmelden/i);
    expect(titles).toMatch(/Steuerliche Erfassung/i);
    expect(titles).toMatch(/IHK|HWK/i);
    expect(titles).toMatch(/Berufsgenossenschaft/i);
  });

  it('employer_onboarding resolves Betriebsnummer, Sozialversicherung, Berufsgenossenschaft', () => {
    const groups = resolveOfficialActionsForJourney(
      'employer_onboarding',
      {},
      KIRKEL_DEMO_CONTEXT,
      'Ich möchte Mitarbeiter einstellen.',
    );
    const titles = groups.flatMap((g) => g.actions.map((a) => a.title)).join(' ');
    expect(titles).toMatch(/Betriebsnummer/i);
    expect(titles).toMatch(/Sozialversicherung/i);
    expect(titles).toMatch(/Lohnsteuer|ELSTER/i);
    expect(titles).toMatch(/Berufsgenossenschaft/i);
  });

  it('id_passport resolves Personalausweis with regional lookup', () => {
    const groups = resolveOfficialActionsForJourney(
      'id_passport',
      {},
      KIRKEL_DEMO_CONTEXT,
      'Ich brauche einen neuen Personalausweis.',
    );
    const idAction = groups.flatMap((g) => g.actions).find((a) => a.actionId === 'id_card_apply');
    expect(idAction).toBeTruthy();
    expect(idAction?.availableLinks[0]?.status).toBe('regional_lookup_required');
    expect(idAction?.availableLinks[0]?.url).toBeUndefined();
  });

  it('job-loss documents exclude housing unless Bürgergeld/Wohnkosten selected', () => {
    expect(shouldIncludeHousingDocuments('job_loss_unemployment', 'Ich wurde gekündigt', {})).toBe(
      false,
    );
    expect(
      shouldIncludeHousingDocuments('job_loss_unemployment', 'Bürgergeld und Wohnkosten', {
        current_status: 'buergergeld',
      }),
    ).toBe(true);

    const groups = resolveOfficialActionsForJourney(
      'job_loss_unemployment',
      {},
      KIRKEL_DEMO_CONTEXT,
      'Ich wurde gekündigt, was nun?',
    );
    const docs = buildDocumentsFromOfficialActions(
      groups,
      'job_loss_unemployment',
      'Ich wurde gekündigt',
      {},
      [],
    );
    const labels = docs.map((d) => d.label).join(' ');
    expect(labels).not.toMatch(/Mietvertrag/i);
  });

  it('document packet includes documents from official actions via planner', () => {
    const plan = planCivicCase(
      { text: 'Ich wurde gekündigt, was nun?', mode: 'unsure' },
      true,
      undefined,
      KIRKEL_DEMO_CONTEXT,
    );
    expect(plan.officialActionGroups?.length).toBeGreaterThan(0);
    expect(plan.documents.length).toBeGreaterThan(0);
    const fromActions = plan.documents.filter((d) => d.actionId);
    expect(fromActions.length).toBeGreaterThan(0);
    const whyTexts = fromActions.map((d) => d.whyNeeded ?? '').join(' ');
    expect(whyTexts).not.toMatch(/Typischer Vorgang/i);
    expect(whyTexts).toMatch(/Arbeitslosmeldung|Arbeitslosengeld|Meldung als arbeitsuchend/i);
  });
});

describe('CivicCasePlan official actions UI', () => {
  it('renders Offizielle Vorgänge & Formulare with correct CTA labels', () => {
    const plan = planCivicCase(
      {
        text: 'Ich bekomme ein Kind und brauche Elterngeld, Kindergeld und Kita.',
        mode: 'private',
      },
      true,
      undefined,
      KIRKEL_DEMO_CONTEXT,
    );
    render(<CivicCasePlan plan={plan} />);
    expect(screen.getByTestId('plan-official-actions')).toBeInTheDocument();
    expect(screen.getByText('Offizielle Vorgänge & Formulare')).toBeInTheDocument();
    expect(screen.getAllByText(/Offizielle Informationen öffnen|Online-Antrag starten|Beratung vorbereiten|Zuständige Stelle suchen/).length).toBeGreaterThan(0);
    expect(screen.getByText(CLARA_CASE_DISCLAIMER)).toBeInTheDocument();
    expect(screen.queryByText(/Demo-Link/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PVOG live/i)).not.toBeInTheDocument();
  });

  it('gewerbe plan has no private family action titles', () => {
    const plan = planCivicCase(
      { text: 'Ich möchte ein Gewerbe anmelden.', mode: 'business' },
      true,
      undefined,
      KIRKEL_DEMO_CONTEXT,
    );
    const titles = (plan.officialActionGroups ?? []).flatMap((g) => g.actions.map((a) => a.title)).join(' ');
    expect(titles).not.toMatch(/Kindergeld|Elterngeld|Kita-Platz/i);
  });
});
