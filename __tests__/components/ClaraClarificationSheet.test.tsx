'use client';

import React from 'react';
import { fireEvent, render, screen, act, waitFor, within } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { ClaraCaseInputProvider, useClaraCaseInputBridge } from '@/context/ClaraCaseInputContext';
import { ClaraWegweiser } from '@/components/civic/ClaraWegweiser';
import { SOURCE_NOTICE_DEMO } from '@/lib/govdata/sourceStatus';

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

  document.body.innerHTML =
    '<main id="main-content"></main><div id="clara-portal-root"></div>';
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
});
