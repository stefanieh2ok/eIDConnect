'use client';

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { ClaraCaseInputProvider } from '@/context/ClaraCaseInputContext';
import { ClaraWegweiser } from '@/components/civic/ClaraWegweiser';
import { mountCivicAppTestDocument } from '@/lib/test/civicAppTestShell';

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
});

function setup(du = true) {
  return render(
    <AppProvider>
      <ClaraCaseInputProvider>
        <ClaraWegweiser du={du} />
      </ClaraCaseInputProvider>
    </AppProvider>,
  );
}

describe('ClaraWegweiser compact input UX', () => {
  it('does not render long source/demo explanation in hero', () => {
    setup();
    expect(screen.queryByText(/vorbereitete offizielle Quellen/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PVOG/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/XZuFi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo-Daten/i)).not.toBeInTheDocument();
  });

  it('renders compact context row instead of large chips', () => {
    setup();
    expect(screen.getByTestId('wegweiser-context-row')).toBeInTheDocument();
    expect(screen.getByText(/Demo-Kontext: Kirkel · Saarland · Profil/i)).toBeInTheDocument();
    expect(screen.queryByTestId('wegweiser-context-chips')).not.toBeInTheDocument();
    expect(screen.queryByText('Demo-Profil')).not.toBeInTheDocument();
  });

  it('renders Hinweis inline, not as prominent Hinweis zu Clara block', () => {
    setup();
    expect(screen.queryByText('Hinweis zu Clara')).not.toBeInTheDocument();
    expect(screen.getByText('Hinweis')).toBeInTheDocument();
    expect(screen.getByText(/Keine Rechtsberatung/i)).toBeInTheDocument();
  });

  it('textarea uses compact class without default scroll rows', () => {
    setup();
    const textarea = screen.getByTestId('wegweiser-textarea');
    expect(textarea).toHaveClass('clara-wegweiser__textarea');
    expect(textarea).toHaveAttribute('rows', '1');
  });

  it('groups textarea and CTA in the same input card', () => {
    setup();
    const card = screen.getByTestId('wegweiser-input-card');
    expect(within(card).getByTestId('wegweiser-textarea')).toBeInTheDocument();
    expect(
      within(card).getByRole('button', { name: /Behördenfahrplan erstellen/i }),
    ).toBeInTheDocument();
  });

  it('shows concise disabled helper text', () => {
    setup();
    expect(screen.getByTestId('wegweiser-submit-hint')).toHaveTextContent(
      /Beschreibe kurz deine Situation oder wähle unten einen Startpunkt/i,
    );
  });

  it('shows ready helper when CTA enabled', () => {
    setup();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich wurde gekündigt, was nun?' },
    });
    expect(screen.getByTestId('wegweiser-submit-hint')).toHaveTextContent(
      /Bereit — Clara erstellt deinen Fahrplan für Kirkel/i,
    );
  });

  it('startpoint click fills textarea and enables CTA without auto-submit', () => {
    setup();
    const submit = screen.getByRole('button', { name: /Behördenfahrplan erstellen/i });
    fireEvent.click(screen.getByRole('button', { name: 'Kündigung & Arbeit' }));
    expect(screen.getByRole('textbox').value.length).toBeGreaterThan(0);
    expect(submit).toBeEnabled();
    expect(screen.queryByText(/Dein Fahrplan/i)).not.toBeInTheDocument();
  });

  it('renders Startpunkt wählen section with six common cases', () => {
    setup();
    expect(screen.getByText('Startpunkt wählen')).toBeInTheDocument();
    expect(screen.getByText(/Häufige Fälle — Clara füllt die Beschreibung vor/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kündigung & Arbeit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Geburt & Kita' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gewerbe anmelden' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Arbeitgeber werden' })).not.toBeInTheDocument();
  });

  it('does not render prominent domain fieldset', () => {
    setup();
    expect(screen.queryByTestId('wegweiser-domain-fieldset')).not.toBeInTheDocument();
  });

  it('shows dictate button when speech is supported', () => {
    const OriginalRecognition = (window as unknown as { webkitSpeechRecognition?: unknown })
      .webkitSpeechRecognition;
    class MockRecognition {
      lang = 'de-DE';
      continuous = false;
      interimResults = false;
      onstart: (() => void) | null = null;
      onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
      onerror: (() => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        this.onstart?.();
      }
      stop() {
        this.onend?.();
      }
    }
    (window as unknown as { webkitSpeechRecognition: typeof MockRecognition }).webkitSpeechRecognition =
      MockRecognition;

    setup();
    expect(screen.getByTestId('wegweiser-dictate-btn')).toBeInTheDocument();

    if (OriginalRecognition) {
      (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition =
        OriginalRecognition;
    } else {
      delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    }
  });

  it('hides dictate button when speech API is unsupported', () => {
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    setup();
    expect(screen.queryByTestId('wegweiser-dictate-btn')).not.toBeInTheDocument();
  });
});
