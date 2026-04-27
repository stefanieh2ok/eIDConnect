/**
 * UI-Struktur-Check: Footer, Guided-Tour-Targets, Consent-relevante Texte.
 * Läuft in JSDOM (kein echter Browser). Dev-Server nicht nötig.
 */
'use client';

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import BuergerApp from '@/components/BuergerApp';

const INTRO_DONE_KEY = 'eidconnect_product_intro_done_v4';
const HIGHLIGHTS_SEEN_KEY = 'eidconnect_highlights_seen';
const TOUR_DONE_KEY = 'eidconnect_tour_done';
const PULSE_DONE_KEY = 'eidconnect_pulse_done';

function setupLocalStorageForMainApp() {
  const storage = globalThis.localStorage as Storage & { setItem: (k: string, v: string) => void };
  storage.setItem(INTRO_DONE_KEY, 'true');
  storage.setItem(HIGHLIGHTS_SEEN_KEY, 'true');
  storage.setItem(TOUR_DONE_KEY, 'true');
  storage.setItem(PULSE_DONE_KEY, 'true');
}

function renderApp() {
  return render(
    <AppProvider>
      <BuergerApp />
    </AppProvider>
  );
}

describe('BuergerApp UI (Footer, Tour, Consent)', () => {
  beforeEach(() => {
    (globalThis.localStorage as any).clear();
    setupLocalStorageForMainApp();
    // Mocks für Layout/Scroll
    if (typeof window !== 'undefined') {
      window.ResizeObserver = window.ResizeObserver ?? (function () {
        return { observe: () => {}, disconnect: () => {}, unobserve: () => {} };
      } as any);
      Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
    }
  });

  it('zeigt nach Intro-Skip die Top-Navigation und Prämien (Meldungen nur bei Kommune)', async () => {
    renderApp();
    await waitFor(
      () => {
        const footer = document.getElementById('tour-footer');
        expect(footer).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(document.getElementById('tour-voting-btn')).toHaveTextContent(/Abstimmen/i);
    expect(document.getElementById('tour-rewards-btn')).toHaveTextContent(/Prämien/i);
    // Meldungen-Tab erscheint nur bei Kommune-Ebene; bei Bund/Land/Kreis standardmäßig nicht
    const meldenBtn = document.getElementById('tour-melden-btn');
    if (meldenBtn) expect(meldenBtn).toHaveTextContent(/Meldungen/i);
  });

  it('enthält Tour-Target-IDs für geführte Tour', async () => {
    renderApp();
    await waitFor(
      () => {
        expect(document.getElementById('tour-footer')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(document.getElementById('tour-voting-btn')).toBeInTheDocument();
    // Punkte-Status oben rechts (Button)
    expect(document.getElementById('tour-rewards-btn')).toBeInTheDocument();
    // tour-melden-btn nur bei Kommune-Ebene vorhanden
  });

  it('zeigt keinen Wahlempfehlungs-Button (Clara neutral)', async () => {
    renderApp();
    await waitFor(
      () => {
        expect(document.getElementById('tour-footer')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    const empfehlungButton = screen.queryByRole('button', { name: /Empfehlung/i });
    expect(empfehlungButton).not.toBeInTheDocument();
  });

  // Hinweis: Kein Settings-Button im aktuellen Demo-Flow.
});
