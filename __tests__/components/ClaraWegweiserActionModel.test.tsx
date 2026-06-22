'use client';

import React from 'react';
import { fireEvent, render, screen, act, waitFor, within } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { ClaraCaseInputProvider } from '@/context/ClaraCaseInputContext';
import { ClaraWegweiser } from '@/components/civic/ClaraWegweiser';
import { CivicCasePlan } from '@/components/civic/CivicCasePlan';
import { SOURCE_NOTICE_DEMO, SOURCE_NOTICE_VERIFIED_CATALOG } from '@/lib/govdata/sourceStatus';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import { planCivicCase } from '@/lib/ai/claraCasePlanner';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';
import { mountCivicAppTestDocument } from '@/lib/test/civicAppTestShell';

let intersectionCallback: IntersectionObserverCallback | null = null;

beforeEach(() => {
  intersectionCallback = null;
  global.IntersectionObserver = jest.fn((cb: IntersectionObserverCallback) => {
    intersectionCallback = cb;
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    };
  }) as unknown as typeof IntersectionObserver;

  mountCivicAppTestDocument();
  delete document.documentElement.dataset.claraWegweiserActive;
  delete document.documentElement.dataset.claraWegweiserInputOnly;

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      mode: 'demo',
      status: 'demo',
      services: [],
      isDemoData: true,
      sourceNotice: SOURCE_NOTICE_DEMO,
    }),
  }) as typeof fetch;

  Element.prototype.scrollIntoView = jest.fn();
});

function setup() {
  return render(
    <AppProvider>
      <ClaraCaseInputProvider>
        <ClaraWegweiser du />
      </ClaraCaseInputProvider>
    </AppProvider>,
  );
}

function isBefore(a: Element, b: Element) {
  return Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
}

const verifiedCatalogPlan: CivicCasePlanResult = {
  situationSummary: 'Kindergeld und Familienleistungen',
  topics: ['Familie'],
  services: [
    {
      serviceId: 'kindergeld',
      title: 'Kindergeld',
      shortDescription: 'Finanzielle Unterstützung für Kinder',
      category: 'Familie',
      situationType: 'private',
      officialSourceUrl: 'https://www.arbeitsagentur.de/familie-und-kinder/kindergeld',
      sourceSystem: 'VerifiedCatalog',
      sourceVerifiedAt: '2026-06-01',
      sourceLabel: 'Manuell verifizierte offizielle Quelle',
      confidence: 'high',
    },
  ],
  touchedAuthorities: ['Familienkasse'],
  missingCriticalInfo: [],
  followUpQuestions: [],
  documents: [],
  sequenceSteps: ['Unterlagen sammeln'],
  risks: [],
  handoverLinks: [],
  mode: 'unsure',
  isDemoData: false,
  sourceNotice: SOURCE_NOTICE_VERIFIED_CATALOG,
  sourceMode: 'verified_catalog',
};

describe('ClaraWegweiser Kirkel journey start screen', () => {
  it('renders start screen hierarchy in correct order', () => {
    setup();
    expect(screen.getByText('Clara Wegweiser')).toHaveClass('clara-wegweiser__micro-label--lavender');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Behördenweg strukturiert vorbereiten/i);
    expect(screen.getByTestId('wegweiser-context-row')).toBeInTheDocument();
    expect(screen.getByText(/Demo-Kontext: Kirkel · Saarland · Profil/i)).toBeInTheDocument();
    const card = screen.getByTestId('wegweiser-input-card');
    expect(within(card).getByText('Deine Situation')).toBeInTheDocument();
    expect(within(card).getByRole('textbox')).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: /Behördenfahrplan erstellen/i })).toBeInTheDocument();
    expect(screen.getByTestId('wegweiser-quick-starts')).toBeInTheDocument();
  });

  it('groups textarea and submit CTA in the same input card', () => {
    setup();
    const card = screen.getByTestId('wegweiser-input-card');
    expect(within(card).getByRole('textbox')).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: /Behördenfahrplan erstellen/i }),
    ).toBeInTheDocument();
  });

  it('renders quick starts after input card, not domain selector', () => {
    setup();
    const card = screen.getByTestId('wegweiser-input-card');
    const quickStarts = screen.getByTestId('wegweiser-quick-starts');
    const submit = within(card).getByRole('button', { name: /Behördenfahrplan erstellen/i });

    expect(isBefore(submit, quickStarts)).toBe(true);
    expect(screen.queryByTestId('wegweiser-domain-fieldset')).not.toBeInTheDocument();
  });

  it('renders Kirkel quick starts', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Geburt & Kita' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Umzug mit Kindern' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wohngeld & Unterstützung' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kündigung & Arbeit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gewerbe anmelden' })).toBeInTheDocument();
  });

  it('disables CTA for empty input and enables after typing', () => {
    setup();
    const submit = screen.getByRole('button', { name: /Behördenfahrplan erstellen/i });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich ziehe um.' },
    });
    expect(submit).toBeEnabled();
    expect(submit).toHaveClass('clara-wegweiser__cta-primary--ready');
  });

  it('fills textarea on quick-start click without auto-submit', () => {
    setup();
    const submit = screen.getByRole('button', { name: /Behördenfahrplan erstellen/i });
    fireEvent.click(screen.getByRole('button', { name: 'Umzug mit Kindern' }));

    expect(screen.getByRole('textbox').value.length).toBeGreaterThan(0);
    expect(submit).toBeEnabled();
    expect(screen.queryByRole('heading', { name: /^Dein Fahrplan$/i })).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('auto-classifies domain from quick start without visible domain UI', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Gewerbe anmelden' }));
    expect(screen.getByRole('textbox').value.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i })).toBeEnabled();
  });

  it('preserves textarea when typing after quick start', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Pflegefall' }));
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Pflegefall in der Familie — ergänzt' } });
    expect(textarea).toHaveValue('Pflegefall in der Familie — ergänzt');
    expect(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i })).toBeEnabled();
  });

  it('opens clarification dialog after submit before plan', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt, was nun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-clarification-sheet')).toBeInTheDocument();
    });
    expect(screen.getByText(/Kündigung|Arbeitslos/i)).toBeInTheDocument();
    expect(screen.queryByTestId('clara-guided-intake')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Dein Fahrplan$/i })).not.toBeInTheDocument();
  });

  it('renders structured plan after submit without generic municipality question', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich bekomme ein Kind. An was muss ich alles denken?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-clarification-sheet')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-submit-skip-btn'));
    });
    await waitFor(() => {
      expect(screen.getByText(/Dein Fahrplan/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Deine nächsten Schritte/i)).toBeInTheDocument();
    expect(screen.queryByText(/Kommune oder welchem Bundesland/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo-Link/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PVOG ist live/i)).not.toBeInTheDocument();
  });
});

describe('Kirkel demo planner without journey match', () => {
  it('does not ask municipality question when Kirkel context is known', () => {
    const plan = planCivicCase(
      { text: 'Ich brauche Hilfe bei einem unklaren Verwaltungsthema.', mode: 'unsure' },
      true,
      undefined,
      KIRKEL_DEMO_CONTEXT,
    );
    expect(plan.followUpQuestions.join(' ')).not.toMatch(/Kommune|Bundesland/i);
    expect(plan.followUpQuestions.join(' ')).not.toMatch(/privat.*Unternehmen/i);
  });
});

describe('verified_catalog source labels in CivicCasePlan', () => {
  it('shows compact verified source notice and no Demo-Link wording', () => {
    const plan = planCivicCase(
      { text: 'Ich bekomme ein Kind und brauche Kindergeld.', mode: 'private' },
      true,
      undefined,
      KIRKEL_DEMO_CONTEXT,
    );
    render(<CivicCasePlan du plan={plan} />);
    expect(screen.getByText(/Offizielle Einstiege|kuratiertem Quellenkatalog|Wegweiser-Template/i)).toBeInTheDocument();
    expect(screen.queryByText(/Demo-Link/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PVOG ist live/i)).not.toBeInTheDocument();
  });

  it('uses compact action-plan section titles', () => {
    const plan = planCivicCase(
      { text: 'Ich bekomme ein Kind und brauche Kindergeld.', mode: 'private' },
      true,
      undefined,
      KIRKEL_DEMO_CONTEXT,
    );
    render(<CivicCasePlan du plan={plan} />);
    expect(screen.getByText(/erkannt/i)).toBeInTheDocument();
    expect(screen.getByText(/Deine nächsten Schritte/i)).toBeInTheDocument();
    expect(screen.getByText(/Unterlagen bereitlegen/i)).toBeInTheDocument();
  });
});
