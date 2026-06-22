'use client';

import React from 'react';
import { fireEvent, render, screen, act, waitFor, within } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { ClaraCaseInputProvider, useClaraCaseInputBridge } from '@/context/ClaraCaseInputContext';
import { ClaraWegweiser } from '@/components/civic/ClaraWegweiser';
import { SOURCE_NOTICE_DEMO } from '@/lib/govdata/sourceStatus';
import { mountCivicAppTestDocument } from '@/lib/test/civicAppTestShell';
import { illnessGuidanceText } from '@/lib/civic/wegweiserChatFlow';

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

async function openJobLossClarification() {
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Ich wurde gekündigt. Was muss ich tun?' },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
  });
  await waitFor(() => {
    expect(screen.getByTestId('clara-wegweiser-chat-flow')).toBeInTheDocument();
  });
}

describe('Clara Wegweiser in-app chat clarification', () => {
  it('renders embedded chat flow instead of modal sheet', async () => {
    setup();
    await openJobLossClarification();
    expect(screen.getByTestId('clara-wegweiser-chat-flow')).toBeInTheDocument();
    expect(screen.queryByTestId('clara-clarification-sheet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('clara-clarification-overlay')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not render inline Clara stellt kurz nach block in page body', async () => {
    setup();
    await openJobLossClarification();
    expect(screen.queryByTestId('clara-guided-intake')).not.toBeInTheDocument();
    const main = document.getElementById('main-content')!;
    expect(within(main).queryByText(/Clara stellt kurz nach/i)).not.toBeInTheDocument();
  });

  it('shows first Clara message and only the active question', async () => {
    setup();
    await openJobLossClarification();
    expect(screen.getByText('Clara fragt kurz nach')).toBeInTheDocument();
    expect(screen.getByTestId('clara-chat-intro')).toHaveTextContent(
      /Kündigung & Arbeitslosigkeit/i,
    );
    expect(screen.getByTestId('clarification-progress')).toHaveTextContent(/Frage 1 von/i);
    expect(screen.getByTestId('intake-q-employment_end')).toBeInTheDocument();
    expect(screen.queryByTestId('intake-q-written_notice')).not.toBeInTheDocument();
    expect(screen.queryByTestId('wegweiser-input-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('wegweiser-quick-starts')).not.toBeInTheDocument();
  });

  it('disables Weiter until a chip is selected, then enables after selection', async () => {
    setup();
    await openJobLossClarification();
    const weiter = screen.getByTestId('clarification-advance-btn');
    expect(weiter).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Bereits beendet' }));
    expect(screen.getByRole('button', { name: 'Bereits beendet' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(weiter).toBeEnabled();
  });

  it('stores answer and advances on Weiter', async () => {
    setup();
    await openJobLossClarification();
    fireEvent.click(screen.getByRole('button', { name: 'Bereits beendet' }));
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-advance-btn'));
    });
    expect(screen.getByTestId('intake-q-written_notice')).toBeInTheDocument();
    expect(screen.getByTestId('clarification-progress')).toHaveTextContent(/Frage 2 von/i);
    expect(screen.getByTestId('clara-chat-answered-summary')).toHaveTextContent(/Bereits beendet/i);
  });

  it('skips current question and advances', async () => {
    setup();
    await openJobLossClarification();
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-skip-btn'));
    });
    expect(screen.getByTestId('intake-q-written_notice')).toBeInTheDocument();
  });

  it('generates plan via Fahrplan trotzdem erstellen', async () => {
    setup();
    await openJobLossClarification();
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-submit-skip-btn'));
    });
    await waitFor(() => {
      expect(screen.getByText(/Dein Fahrplan/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('clara-wegweiser-chat-flow')).not.toBeInTheDocument();
  });

  it('passes answers into compact plan summary', async () => {
    setup();
    await openJobLossClarification();
    fireEvent.click(screen.getByRole('button', { name: 'Bereits beendet' }));
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-advance-btn'));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kündigungsschreiben' }));
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-submit-skip-btn'));
    });
    await waitFor(() => {
      expect(screen.getByText(/Dein Fahrplan/i)).toBeInTheDocument();
    });
    expect(screen.getByTestId('wegweiser-compact-summary')).toHaveTextContent(/2 Angaben ergänzt/i);
    expect(screen.getByTestId('wegweiser-compact-summary')).toHaveTextContent(/Kirkel · Saarland/i);
    expect(screen.queryByTestId('wegweiser-known-context-chips')).not.toBeInTheDocument();
  });

  it('hides Clara dock while clarifying', async () => {
    setup();
    await openJobLossClarification();
    expect(screen.getByTestId('bridge-state')).toHaveAttribute('data-clarifying', 'true');
    expect(screen.getByTestId('bridge-state')).toHaveAttribute('data-show-floating-dock', 'false');
    expect(document.documentElement.dataset.claraWegweiserClarifying).toBe('true');
  });

  it('marks civic app shell while chat flow is open and restores after close', async () => {
    setup();
    await openJobLossClarification();
    const shell = screen.getByTestId('civic-app-shell');
    expect(shell).toHaveAttribute('data-clara-clarification-open', 'true');
    expect(screen.getByTestId('app-bottom-nav')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-submit-skip-btn'));
    });
    await waitFor(() => {
      expect(screen.queryByTestId('clara-wegweiser-chat-flow')).not.toBeInTheDocument();
    });
    expect(shell).not.toHaveAttribute('data-clara-clarification-open');
  });

  it('locks main-content scroll while chat flow is open', async () => {
    setup();
    const main = document.getElementById('main-content')!;
    await openJobLossClarification();
    expect(main.style.overflow).toBe('hidden');
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-submit-skip-btn'));
    });
    await waitFor(() => {
      expect(screen.queryByTestId('clara-wegweiser-chat-flow')).not.toBeInTheDocument();
    });
    expect(main.style.overflow).toBe('');
  });

  it('hides Diktieren when speech API is unsupported', () => {
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    setup();
    expect(screen.queryByTestId('wegweiser-dictate-btn')).not.toBeInTheDocument();
    expect(screen.queryByText(/Spracheingabe wird von diesem Browser/i)).not.toBeInTheDocument();
  });

  it('shows neutral illness guidance without misuse advice', async () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'Ich wurde gekündigt und bin krankgeschrieben. Was muss ich tun?',
      },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-wegweiser-chat-flow')).toBeInTheDocument();
    });

    const advanceThrough = async (chipLabel: string) => {
      fireEvent.click(screen.getByRole('button', { name: chipLabel }));
      await act(async () => {
        fireEvent.click(screen.getByTestId('clarification-advance-btn'));
      });
    };

    await advanceThrough('Bereits beendet');
    await advanceThrough('Kündigungsschreiben');
    await advanceThrough('Noch nicht');
    fireEvent.click(screen.getByRole('button', { name: 'Ja, ich bin krank' }));
    const guidance = screen.getByTestId('clara-chat-illness-guidance');
    expect(guidance).toHaveTextContent(illnessGuidanceText(true));
    expect(guidance).not.toHaveTextContent(/betrug|schummeln|täuschen|trick|taktik/i);
    expect(guidance).toHaveTextContent(/Arbeitgeber|Krankenkasse|Agentur für Arbeit/i);
  });

  it('reopens chat flow via Angaben bearbeiten', async () => {
    setup();
    await openJobLossClarification();
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-submit-skip-btn'));
    });
    await waitFor(() => {
      expect(screen.getByText(/Dein Fahrplan/i)).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Angaben bearbeiten/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-wegweiser-chat-flow')).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: /^Dein Fahrplan$/i })).not.toBeInTheDocument();
  });

  it('does not show governance disclaimer removal or PVOG claims', async () => {
    setup();
    await openJobLossClarification();
    const chat = screen.getByTestId('clara-wegweiser-chat-flow');
    expect(within(chat).getByText(/Keine Rechtsberatung/i)).toBeInTheDocument();
    expect(screen.queryByText(/PVOG ist live/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo-Link/i)).not.toBeInTheDocument();
  });
});
