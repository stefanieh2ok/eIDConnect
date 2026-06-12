/**
 * Profil/Settings-Struktur: Altersgruppe ist aus dem Hauptprofil entfernt,
 * die Vorschau-Perspektive liegt in „Demo & Audit“, Nutzungsrolle bleibt.
 * Läuft in JSDOM.
 */
'use client';

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import AppHeader from '@/components/Header/AppHeader';

function setup() {
  const overlay = document.createElement('div');
  overlay.id = 'app-overlay-root';
  document.body.appendChild(overlay);
  if (typeof window !== 'undefined') {
    window.ResizeObserver =
      window.ResizeObserver ??
      (function () {
        return { observe: () => {}, disconnect: () => {}, unobserve: () => {} };
      } as any);
    Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
  }
  return render(
    <AppProvider>
      <AppHeader />
    </AppProvider>,
  );
}

function openSettings() {
  fireEvent.click(screen.getByLabelText('Einstellungen öffnen'));
}

describe('AppHeader – Profil/Settings', () => {
  beforeEach(() => {
    (globalThis.localStorage as any).clear();
    document.getElementById('app-overlay-root')?.remove();
  });

  it('entfernt die Altersgruppe aus dem Hauptprofil', () => {
    setup();
    openSettings();
    expect(screen.queryByText('Altersgruppe', { exact: true })).not.toBeInTheDocument();
  });

  it('zeigt die Vorschau-Perspektive im Bereich „Demo & Audit“', () => {
    setup();
    openSettings();
    expect(screen.getByText('Demo & Audit')).toBeInTheDocument();
    expect(screen.getByText('Vorschau-Perspektive einstellen')).toBeInTheDocument();
  });

  it('behält die Nutzungsrolle im Hauptprofil', () => {
    setup();
    openSettings();
    expect(screen.getByText('Nutzungsrolle')).toBeInTheDocument();
  });

  it('zeigt die abgeleitete Demo-Zuständigkeit (read-only, kein Eingabefeld)', () => {
    setup();
    openSettings();
    expect(screen.getByText('Abgeleitete Demo-Zuständigkeit')).toBeInTheDocument();
    // Straße ist kein reguläres Eingabefeld mehr.
    expect(screen.queryByLabelText('Straße (Vorschau)')).not.toBeInTheDocument();
  });
});
