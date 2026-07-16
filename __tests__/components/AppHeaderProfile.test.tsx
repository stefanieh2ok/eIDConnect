/**
 * Profil/Settings-Struktur: Altersgruppe ist aus dem Hauptprofil entfernt,
 * die Vorschau-Perspektive liegt in „Demo & Audit“, Nutzungsrolle bleibt.
 * Läuft in JSDOM.
 */
'use client';

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import AppHeader from '@/components/Header/AppHeader';
import SettingsSection from '@/components/Settings/SettingsSection';

function AppWithSettings() {
  const { state } = useApp();
  return (
    <>
      <AppHeader />
      {state.activeSection === 'settings' ? <SettingsSection /> : null}
    </>
  );
}

function setup() {
  if (typeof window !== 'undefined') {
    window.ResizeObserver =
      window.ResizeObserver ??
      (function () {
        return { observe: () => {}, disconnect: () => {}, unobserve: () => {} };
      } as any);
    Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
    document.getElementById('main-content')?.remove();
    const main = document.createElement('div');
    main.id = 'main-content';
    document.body.appendChild(main);
  }
  return render(
    <AppProvider>
      <AppWithSettings />
    </AppProvider>,
  );
}

function openSettings() {
  fireEvent.click(screen.getByLabelText('Einstellungen öffnen'));
}

describe('AppHeader – Profil/Settings', () => {
  beforeEach(() => {
    (globalThis.localStorage as any).clear();
    document.getElementById('main-content')?.remove();
  });

  it('entfernt die Altersgruppe aus dem Hauptprofil', () => {
    setup();
    openSettings();
    expect(screen.queryByText('Altersgruppe', { exact: true })).not.toBeInTheDocument();
  });

  it('zeigt die Vorschau-Perspektive im Bereich „Demo & Systemstatus“', () => {
    setup();
    openSettings();
    expect(screen.getByText('Demo & Systemstatus')).toBeInTheDocument();
    expect(screen.getByText('Vorschau-Perspektive einstellen')).toBeInTheDocument();
  });

  it('behält Nutzungsrollen im Bereich Profil & Haushalt', () => {
    setup();
    openSettings();
    expect(screen.getByText('Profil & Haushalt')).toBeInTheDocument();
    expect(screen.getByText('Ich nutze die App für mich selbst')).toBeInTheDocument();
  });

  it('zeigt abgeleitete Zuständigkeit ohne Straßenfeld', () => {
    setup();
    openSettings();
    expect(screen.getByText(/Zuständigkeit wird aus PLZ und Ort abgeleitet/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Straße (Vorschau)')).not.toBeInTheDocument();
  });
});
