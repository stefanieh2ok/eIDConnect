import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { buildGuidedIntake } from '@/lib/civic/civicGuidedIntake';
import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { resetWegweiserTransientUiState } from '@/lib/civic/resetWegweiserTransientUiState';
import {
  buildBirthKitaClarificationQuestion,
  countSelectableClarificationOptions,
  isKitaFocusedInput,
  resolveFamilyJourneyFromAnswers,
} from '@/lib/civic/wegweiserFamilyIntake';
import { buildWegweiserActionPlan } from '@/lib/civic/wegweiserActionPlan';
import { InstitutionalReliefPanel } from '@/components/civic/InstitutionalReliefPanel';
import { WegweiserActionPlanCard } from '@/components/civic/WegweiserActionPlanCard';
import { mountCivicAppTestDocument } from '@/lib/test/civicAppTestShell';
import { MASTERCASE_JOURNEY_MATRIX } from '@/lib/civic/mastercaseJourneyMatrix';

const identity = KIRKEL_DEMO_CONTEXT;

function assertQuestionHasValidOptions(question: { options?: { value: string; label: string }[] }) {
  const selectable = (question.options ?? []).filter((o) => o.value !== 'skip');
  expect(selectable.length).toBeGreaterThan(0);
  const nonNotSure = selectable.filter((o) => o.value !== 'not_sure');
  expect(nonNotSure.length).toBeGreaterThan(0);
}

describe('wegweiserFamilyIntake', () => {
  it('birth/kita question includes multiple options beyond Weiß ich nicht', () => {
    const q = buildBirthKitaClarificationQuestion(true, 'Ich bekomme ein Kind.');
    const labels = q.options?.map((o) => o.label) ?? [];
    expect(labels).toEqual(
      expect.arrayContaining([
        'Kind wird erwartet',
        'Kind ist bereits geboren',
        'Kita-Platz suchen',
        'Alles zusammen',
        'Weiß ich nicht',
      ]),
    );
    expect(labels.length).toBeGreaterThan(1);
    assertQuestionHasValidOptions(q);
  });

  it('kita input resolves to childcare journey from answers', () => {
    expect(isKitaFocusedInput('Ich suche einen Kita-Platz für mein Kind in Kirkel.')).toBe(true);
    expect(
      resolveFamilyJourneyFromAnswers({ family_topic: 'kita_search' }, 'child_birth_kita', ''),
    ).toBe('childcare_school');
  });

  it('buildGuidedIntake for child_birth_kita uses family topic question', () => {
    const journey = resolveCivicJourney('Ich bekomme ein Kind.', 'private', identity, true, 'child_birth_kita');
    const intake = buildGuidedIntake('Ich bekomme ein Kind.', journey, identity, true, 'child_birth_kita');
    expect(intake.questions[0]?.id).toBe('family_topic');
    assertQuestionHasValidOptions(intake.questions[0]!);
  });

  it('kita-focused input prioritizes Kita-Platz chip order', () => {
    const q = buildBirthKitaClarificationQuestion(true, 'Ich suche einen Kita-Platz in Kirkel.');
    expect(q.options?.[0]?.value).toBe('kita_search');
  });
});

describe('wegweiser action ordering', () => {
  it('kita plan starts with Kita-Platz action', () => {
    const journey = resolveCivicJourney(
      'Ich suche einen Kita-Platz für mein zweijähriges Kind in Kirkel.',
      'private',
      identity,
      true,
    );
    const plan = planCivicCase(
      {
        text: 'Ich suche einen Kita-Platz für mein zweijähriges Kind in Kirkel.',
        mode: 'private',
        journeyHint: journey?.journeyId,
      },
      true,
      undefined,
      identity,
    );
    const actionPlan = buildWegweiserActionPlan(
      plan,
      true,
      plan.sourceInputText ?? '',
      plan.intakeAnswers,
    );
    expect(actionPlan.primary[0]?.actionId).toBe('kita_reserve');
    expect(actionPlan.primary[0]?.actionId).not.toBe('birth_register');
  });

  it('birth plan can still start with birth register', () => {
    const journey = resolveCivicJourney(
      'Ich bekomme ein Kind und brauche Unterlagen für Elterngeld.',
      'private',
      identity,
      true,
    );
    const plan = planCivicCase(
      {
        text: 'Ich bekomme ein Kind und brauche Unterlagen für Elterngeld.',
        mode: 'private',
        journeyHint: journey?.journeyId,
        intakeAnswers: { family_topic: 'child_expected' },
      },
      true,
      undefined,
      identity,
    );
    const actionPlan = buildWegweiserActionPlan(
      plan,
      true,
      plan.sourceInputText ?? '',
      { family_topic: 'child_expected' },
    );
    expect(actionPlan.primary[0]?.actionId).toBe('birth_register');
  });

  it('kita_search selection produces kita-first plan', () => {
    const plan = planCivicCase(
      {
        text: 'Geburt & Kita',
        mode: 'private',
        journeyHint: 'child_birth_kita',
        intakeAnswers: { family_topic: 'kita_search' },
      },
      true,
      undefined,
      identity,
    );
    const actionPlan = buildWegweiserActionPlan(plan, true, 'Geburt & Kita', { family_topic: 'kita_search' });
    expect(actionPlan.primary[0]?.actionId).toBe('kita_reserve');
  });
});

describe('regional action CTA', () => {
  it('renders clickable Zuständige Stelle suchen for regional lookup', () => {
    render(
      <WegweiserActionPlanCard
        item={{
          stepNumber: 1,
          actionId: 'kita_reserve',
          title: 'Kita-Platz / Kinderbetreuung vormerken',
          timing: 'Regional prüfen',
          authority: 'Kommune / Jugendamt',
          documents: ['Wohnsitznachweis'],
          relevance: 'primary',
          action: {
            actionId: 'kita_reserve',
            title: 'Kita-Platz / Kinderbetreuung vormerken',
            description: 'Test',
            journeyIds: ['childcare_school'],
            triggerKeywords: ['kita'],
            responsibleBodies: ['Kommune / Jugendamt'],
            requiredDocuments: ['Wohnsitznachweis'],
            links: [
              {
                label: 'Kommune / Jugendamt',
                kind: 'appointment',
                sourceOwner: 'Kommune / Jugendamt',
                level: 'municipal',
                status: 'regional_lookup_required',
                regionSpecific: true,
                ctaLabel: 'Zuständige Stelle suchen',
              },
            ],
            relevance: 'primary',
            reason: 'Test',
            availableLinks: [
              {
                label: 'Kommune / Jugendamt',
                kind: 'appointment',
                sourceOwner: 'Kommune / Jugendamt',
                level: 'municipal',
                status: 'regional_lookup_required',
                regionSpecific: true,
                ctaLabel: 'Zuständige Stelle suchen',
              },
            ],
            ctaLabel: 'Zuständige Stelle suchen',
          },
        }}
      />,
    );
    const cta = screen.getByTestId('regional-action-cta-kita_reserve');
    expect(cta.tagName).toBe('BUTTON');
    fireEvent.click(cta);
    expect(screen.getByTestId('regional-action-guide-kita_reserve')).toBeInTheDocument();
    expect(screen.getByText(/Clara reicht keinen Antrag ein/i)).toBeInTheDocument();
    expect(screen.getByText(/Kontext: Kirkel/i)).toBeInTheDocument();
  });

  it('catalog missing uses disabled styling, not fake button', () => {
    render(
      <WegweiserActionPlanCard
        item={{
          stepNumber: 2,
          actionId: 'test_action',
          title: 'Test',
          timing: 'Prüfen',
          authority: 'Kommune',
          documents: [],
          relevance: 'primary',
          action: {
            actionId: 'test_action',
            title: 'Test',
            description: 'Test',
            journeyIds: ['childcare_school'],
            triggerKeywords: [],
            responsibleBodies: ['Kommune'],
            requiredDocuments: [],
            links: [],
            relevance: 'primary',
            reason: 'Test',
            availableLinks: [
              {
                label: 'Kommune',
                kind: 'info',
                sourceOwner: 'Kommune',
                level: 'municipal',
                status: 'catalog_missing',
                regionSpecific: true,
              },
            ],
          },
        }}
      />,
    );
    const cta = screen.getByTestId('catalog-missing-cta-test_action');
    expect(cta.tagName).not.toBe('BUTTON');
    expect(cta).toHaveTextContent(/Noch kein geprüfter Online-Einstieg/i);
  });
});

describe('InstitutionalReliefPanel copy', () => {
  it('uses Was du davon hast instead of Behörden entlastet', () => {
    render(<InstitutionalReliefPanel du />);
    expect(screen.getByText('Was du davon hast')).toBeInTheDocument();
    expect(screen.queryByText(/Warum das Behörden entlastet/i)).not.toBeInTheDocument();
    expect(screen.getByText('Nichts vergessen')).toBeInTheDocument();
    expect(screen.getByText('Richtig starten')).toBeInTheDocument();
    expect(screen.getByText('Besser vorbereitet')).toBeInTheDocument();
  });
});

describe('resetWegweiserTransientUiState', () => {
  it('clears clarification overlay attributes and scroll lock', () => {
    mountCivicAppTestDocument();
    document.documentElement.setAttribute('data-clara-clarification-open', 'true');
    const scrollEl = document.getElementById('main-content');
    if (scrollEl) scrollEl.style.overflow = 'hidden';
    resetWegweiserTransientUiState();
    expect(document.documentElement.hasAttribute('data-clara-clarification-open')).toBe(false);
    expect(scrollEl?.style.overflow).toBe('');
  });
});

describe('resetWegweiserTransientUiState', () => {
  it('mastercase guided intakes never expose zero or not_sure-only options', () => {
    for (const mc of MASTERCASE_JOURNEY_MATRIX) {
      const text = mc.quickStartText;
      const journey = resolveCivicJourney(text, 'private', identity, true, mc.id);
      const intake = buildGuidedIntake(text, journey, identity, true, mc.id);
      for (const q of intake.questions) {
        expect(countSelectableClarificationOptions(q)).toBeGreaterThan(0);
        assertQuestionHasValidOptions(q);
      }
    }
  });
});
