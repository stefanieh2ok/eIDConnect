/**
 * UI-Struktur-Check: Footer, Guided-Tour-Targets, Consent-relevante Texte.
 * Läuft in JSDOM (kein echter Browser). Dev-Server nicht nötig.
 */
'use client';

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import BuergerApp from '@/components/BuergerApp';
import { DEMO_CONNECT_OVERVIEW_STORAGE_KEY } from '@/components/onboarding/DemoConnectOverview';

const INTRO_DONE_KEY = 'eidconnect_intro_done';
const HIGHLIGHTS_SEEN_KEY = 'eidconnect_highlights_seen';
const TOUR_DONE_KEY = 'eidconnect_tour_done';
const PULSE_DONE_KEY = 'eidconnect_pulse_done';

function setupLocalStorageForMainApp() {
  const storage = globalThis.localStorage as Storage & { setItem: (k: string, v: string) => void };
  storage.setItem(INTRO_DONE_KEY, 'true');
  storage.setItem(HIGHLIGHTS_SEEN_KEY, 'true');
  storage.setItem(TOUR_DONE_KEY, 'true');
  storage.setItem(PULSE_DONE_KEY, 'true');
  storage.setItem(DEMO_CONNECT_OVERVIEW_STORAGE_KEY, '1');
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
    if (typeof window !== 'undefined') {
      window.ResizeObserver = window.ResizeObserver ?? (function () {
        return { observe: () => {}, disconnect: () => {}, unobserve: () => {} };
      } as any);
      Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
    }
  });

  it('zeigt nach Intro-Skip die Footer-Navigation mit Abstimmen, Punkte (Melden nur bei Kommune)', async () => {
    renderApp();
    await waitFor(
      () => {
        const footer = document.getElementById('tour-footer');
        expect(footer).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(document.getElementById('tour-voting-btn')).toHaveTextContent(/Abstimmen/i);
    expect(document.getElementById('tour-rewards-btn')).toHaveTextContent(/Punkte/i);
    const meldenBtn = document.getElementById('tour-melden-btn');
    if (meldenBtn) expect(meldenBtn).toHaveTextContent(/Melden/i);
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
    expect(document.getElementById('tour-rewards-btn')).toBeInTheDocument();
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

  it('enthält Einstellungen (dort: Einwilligung & Datenschutz)', async () => {
    renderApp();
    await waitFor(
      () => {
        expect(document.getElementById('tour-footer')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    const settingsBtn = screen.getByRole('button', { name: /Einstellungen/i });
    expect(settingsBtn).toBeInTheDocument();
  });
});
