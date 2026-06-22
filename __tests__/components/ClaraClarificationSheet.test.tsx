'use client';

import React from 'react';
import { fireEvent, render, screen, act, waitFor, within } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { ClaraCaseInputProvider, useClaraCaseInputBridge } from '@/context/ClaraCaseInputContext';
import { ClaraWegweiser } from '@/components/civic/ClaraWegweiser';
import { SOURCE_NOTICE_DEMO } from '@/lib/govdata/sourceStatus';
import { mountCivicAppTestDocument, getCivicAppModalRootEl } from '@/lib/test/civicAppTestShell';

beforeEach(() => {
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  })) as unknown as typeof IntersectionObserver;

  mountCivicAppTestDocument();
  delete document.documentElement.dataset.claraWegweiserClarifying;

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

function BridgeProbe() {
  const bridge = useClaraCaseInputBridge();
  return (
    <div
      data-testid="bridge-state"
      data-clarifying={String(bridge.isClarifying)}
      data-show-floating-dock={String(bridge.showFloatingDock)}
    />
  );
}

function setup() {
  return render(
    <AppProvider>
      <ClaraCaseInputProvider>
        <BridgeProbe />
        <ClaraWegweiser du />
      </ClaraCaseInputProvider>
    </AppProvider>,
  );
}

describe('Clara Wegweiser clarification dialog', () => {
  it('does not render inline Clara stellt kurz nach block in page body', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-clarification-sheet')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('clara-guided-intake')).not.toBeInTheDocument();
    const main = document.getElementById('main-content')!;
    expect(within(main).queryByText(/Clara stellt kurz nach/i)).not.toBeInTheDocument();
  });

  it('opens clarification sheet with first question only', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-clarification-sheet')).toBeInTheDocument();
    });
    expect(screen.getByText('Clara fragt kurz nach')).toBeInTheDocument();
    expect(screen.getByTestId('clarification-progress')).toHaveTextContent(/Frage 1 von/i);
    expect(screen.getByTestId('intake-q-employment_end')).toBeInTheDocument();
    expect(screen.queryByTestId('intake-q-written_notice')).not.toBeInTheDocument();
  });

  it('stores answer and advances on Weiter', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('intake-q-employment_end')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Bereits beendet' }));
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-advance-btn'));
    });
    expect(screen.getByTestId('intake-q-written_notice')).toBeInTheDocument();
    expect(screen.getByTestId('clarification-progress')).toHaveTextContent(/Frage 2 von/i);
  });

  it('skips current question and advances', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('intake-q-employment_end')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-skip-btn'));
    });
    expect(screen.getByTestId('intake-q-written_notice')).toBeInTheDocument();
  });

  it('generates plan via Fahrplan trotzdem erstellen', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
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
    expect(screen.queryByTestId('clara-clarification-sheet')).not.toBeInTheDocument();
  });

  it('hides Clara dock while clarification is open', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('bridge-state')).toHaveAttribute('data-clarifying', 'true');
    });
    expect(document.documentElement.dataset.claraWegweiserClarifying).toBe('true');
  });

  it('hides Diktieren when speech API is unsupported', () => {
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    setup();
    expect(screen.queryByTestId('wegweiser-dictate-btn')).not.toBeInTheDocument();
    expect(screen.queryByText(/Spracheingabe wird von diesem Browser/i)).not.toBeInTheDocument();
  });

  it('does not show governance disclaimer removal or PVOG claims', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-clarification-sheet')).toBeInTheDocument();
    });
    const sheet = screen.getByTestId('clara-clarification-sheet');
    expect(within(sheet).getByText(/Keine Rechtsberatung/i)).toBeInTheDocument();
    expect(screen.queryByText(/PVOG ist live/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo-Link/i)).not.toBeInTheDocument();
  });

  it('renders inside civic app modal root, not clara-portal-root', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-clarification-sheet')).toBeInTheDocument();
    });
    const modalRoot = getCivicAppModalRootEl();
    const legacyPortal = document.getElementById('clara-portal-root')!;
    const sheet = screen.getByTestId('clara-clarification-sheet');
    const overlay = screen.getByTestId('clara-clarification-overlay');
    expect(modalRoot).toContainElement(sheet);
    expect(modalRoot).toContainElement(overlay);
    expect(legacyPortal).not.toContainElement(sheet);
    expect(sheet).toHaveAttribute('data-app-contained', 'true');
    expect(overlay).toHaveAttribute('data-app-contained', 'true');
    expect(overlay).toHaveClass('clara-clarification-sheet-overlay--app-contained');
  });

  it('marks civic app shell while dialog is open and restores bottom nav after close', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-clarification-sheet')).toBeInTheDocument();
    });
    const shell = screen.getByTestId('civic-app-shell');
    expect(shell).toHaveAttribute('data-clara-clarification-open', 'true');
    expect(screen.getByTestId('clarification-submit-skip-btn')).toBeInTheDocument();
    expect(screen.getByTestId('app-bottom-nav')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-submit-skip-btn'));
    });
    await waitFor(() => {
      expect(screen.queryByTestId('clara-clarification-sheet')).not.toBeInTheDocument();
    });
    expect(shell).not.toHaveAttribute('data-clara-clarification-open');
    expect(screen.getByTestId('app-bottom-nav')).toBeInTheDocument();
  });

  it('locks main-content scroll while dialog is open', async () => {
    setup();
    const main = document.getElementById('main-content')!;
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-clarification-sheet')).toBeInTheDocument();
    });
    expect(main.style.overflow).toBe('hidden');
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-submit-skip-btn'));
    });
    await waitFor(() => {
      expect(screen.queryByTestId('clara-clarification-sheet')).not.toBeInTheDocument();
    });
    expect(main.style.overflow).toBe('');
  });
});
