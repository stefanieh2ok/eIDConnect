/**
 * Wegweiser action model — textarea/CTA grouping, order, lavender accent, submit flow.
 */
'use client';

import React from 'react';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { ClaraCaseInputProvider } from '@/context/ClaraCaseInputContext';
import { ClaraWegweiser } from '@/components/civic/ClaraWegweiser';
import { CivicCasePlan } from '@/components/civic/CivicCasePlan';
import { SOURCE_NOTICE_DEMO, SOURCE_NOTICE_VERIFIED_CATALOG } from '@/lib/govdata/sourceStatus';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';

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

describe('ClaraWegweiser action model', () => {
  it('groups textarea and submit CTA in the same input card', () => {
    setup();
    const card = screen.getByTestId('wegweiser-input-card');
    expect(within(card).getByRole('textbox')).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: /Behördenfahrplan erstellen/i }),
    ).toBeInTheDocument();
  });

  it('renders context selector after quick starts, not between textarea and CTA', () => {
    setup();
    const card = screen.getByTestId('wegweiser-input-card');
    const quickStarts = screen.getByTestId('wegweiser-quick-starts');
    const context = screen.getByTestId('wegweiser-context-fieldset');
    const submit = within(card).getByRole('button', { name: /Behördenfahrplan erstellen/i });

    expect(isBefore(submit, quickStarts)).toBe(true);
    expect(isBefore(quickStarts, context)).toBe(true);
    expect(within(card).queryByRole('button', { name: /Privat/i })).not.toBeInTheDocument();
  });

  it('uses lavender accent class on Clara label', () => {
    setup();
    expect(screen.getByText('Clara Wegweiser')).toHaveClass('clara-wegweiser__micro-label--lavender');
  });

  it('defaults context to Ich bin unsicher', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Ich bin unsicher' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('disables CTA for empty input and enables after typing', () => {
    setup();
    const submit = screen.getByRole('button', { name: /Behördenfahrplan erstellen/i });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich ziehe mit Kindern um.' },
    });
    expect(submit).toBeEnabled();
    expect(submit).toHaveClass('clara-wegweiser__cta-primary--ready');
  });

  it('fills textarea and enables CTA on quick-start click without auto-submit', async () => {
    setup();
    const submit = screen.getByRole('button', { name: /Behördenfahrplan erstellen/i });
    fireEvent.click(screen.getByRole('button', { name: 'Umzug mit Kindern' }));

    expect(screen.getByRole('textbox').value.length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox').value).toMatch(/Kindern/i);
    expect(submit).toBeEnabled();
    expect(screen.queryByText(/Dein Behördenfahrplan/i)).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('preserves textarea when context changes', () => {
    setup();
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Pflegefall in der Familie' } });
    fireEvent.click(screen.getByRole('button', { name: 'Geschäftlich' }));
    expect(textarea).toHaveValue('Pflegefall in der Familie');
    expect(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i })).toBeEnabled();
  });

  it('renders case plan after submit without Demo-Link wording', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich ziehe mit Kindern um und brauche Unterstützung.' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/Dein Behördenfahrplan/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Demo-Link/i)).not.toBeInTheDocument();
  });
});

describe('verified_catalog source labels in CivicCasePlan', () => {
  it('shows manual verified label and no Demo-Link wording', () => {
    render(<CivicCasePlan du plan={verifiedCatalogPlan} />);
    expect(screen.getByText(/Manuell verifizierte offizielle Quelle/i)).toBeInTheDocument();
    expect(screen.queryByText(/Demo-Link/i)).not.toBeInTheDocument();
  });
});
