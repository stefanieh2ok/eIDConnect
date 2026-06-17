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

  document.body.innerHTML = '<main id="main-content"></main>';
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
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Kirkel/i);
    expect(screen.getByText(/Keine Rechtsberatung/i)).toBeInTheDocument();
    expect(screen.getByTestId('wegweiser-context-chips')).toBeInTheDocument();
    expect(screen.getByText('Kirkel')).toBeInTheDocument();
    expect(screen.getByText('Identifiziert')).toBeInTheDocument();
    const card = screen.getByTestId('wegweiser-input-card');
    expect(within(card).getByText('Deine Situation')).toBeInTheDocument();
    expect(within(card).getByRole('textbox')).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: /Behördenfahrplan erstellen/i })).toBeInTheDocument();
    expect(screen.getByTestId('wegweiser-quick-starts')).toBeInTheDocument();
    expect(screen.getByTestId('wegweiser-domain-fieldset')).toBeInTheDocument();
  });

  it('groups textarea and submit CTA in the same input card', () => {
    setup();
    const card = screen.getByTestId('wegweiser-input-card');
    expect(within(card).getByRole('textbox')).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: /Behördenfahrplan erstellen/i }),
    ).toBeInTheDocument();
  });

  it('renders domain selector after quick starts, not between textarea and CTA', () => {
    setup();
    const card = screen.getByTestId('wegweiser-input-card');
    const quickStarts = screen.getByTestId('wegweiser-quick-starts');
    const domain = screen.getByTestId('wegweiser-domain-fieldset');
    const submit = within(card).getByRole('button', { name: /Behördenfahrplan erstellen/i });

    expect(isBefore(submit, quickStarts)).toBe(true);
    expect(isBefore(quickStarts, domain)).toBe(true);
    expect(within(card).queryByRole('button', { name: /Privat/i })).not.toBeInTheDocument();
  });

  it('renders Kirkel quick starts', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Geburt & Kita' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Umzug' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wohngeld & Unterstützung' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Arbeitgeber werden' })).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: 'Umzug' }));

    expect(screen.getByRole('textbox').value.length).toBeGreaterThan(0);
    expect(submit).toBeEnabled();
    expect(screen.queryByText(/Dein Behördenfahrplan/i)).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('auto-classifies domain from quick start', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Gewerbe anmelden' }));
    expect(screen.getByText('Unternehmen')).toBeInTheDocument();
  });

  it('preserves textarea when domain changes', () => {
    setup();
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Pflegefall in der Familie' } });
    fireEvent.click(screen.getByRole('button', { name: 'Selbstständig / Unternehmen' }));
    expect(textarea).toHaveValue('Pflegefall in der Familie');
    expect(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i })).toBeEnabled();
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
      expect(screen.getByText(/Dein Behördenfahrplan/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Lage erkannt/i)).toBeInTheDocument();
    expect(screen.getByText(/Nächste Schritte in Kirkel/i)).toBeInTheDocument();
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
  it('shows manual verified label and no Demo-Link wording', () => {
    render(<CivicCasePlan du plan={verifiedCatalogPlan} />);
    expect(screen.getByText(/Manuell verifizierte offizielle Quelle/i)).toBeInTheDocument();
    expect(screen.queryByText(/Demo-Link/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PVOG ist live/i)).not.toBeInTheDocument();
  });

  it('uses structured Kirkel section titles', () => {
    render(<CivicCasePlan du plan={verifiedCatalogPlan} />);
    expect(screen.getByText(/Lage erkannt/i)).toBeInTheDocument();
    expect(screen.getByText(/Nächste Schritte in Kirkel/i)).toBeInTheDocument();
    expect(screen.getByText(/Benötigte Unterlagen/i)).toBeInTheDocument();
  });
});
