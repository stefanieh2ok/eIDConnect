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

function setupHeader() {
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

describe('Trust Center — Demo-Stammdaten', () => {
  beforeEach(() => {
    document.getElementById('main-content')?.remove();
  });

  it('zeigt Demo-Stammdaten-Hinweis', () => {
    setupHeader();
    fireEvent.click(screen.getByLabelText('Einstellungen öffnen'));
    expect(screen.getByText('Demo-Stammdaten')).toBeInTheDocument();
    expect(screen.getByText('Max Mustermann · 66459 Kirkel')).toBeInTheDocument();
    expect(screen.getByText('Nur für Demo-Vorschau')).toBeInTheDocument();
  });

  it('Toggle Demo-Stammdaten ist standardmäßig aktiv', () => {
    setupHeader();
    fireEvent.click(screen.getByLabelText('Einstellungen öffnen'));
    const toggle = screen.getByLabelText('Demo-Stammdaten verwenden') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  it('zeigt Demo-Modulstatus und Audit-Hinweis', () => {
    setupHeader();
    fireEvent.click(screen.getByLabelText('Einstellungen öffnen'));
    expect(screen.getByText('Demo- & Modulstatus')).toBeInTheDocument();
    expect(screen.getByText(/keine echten Behördenintegrationen/i)).toBeInTheDocument();
    expect(screen.getByText(/Wahlvorschau — keine echte Stimmabgabe/i)).toBeInTheDocument();
    expect(screen.getAllByText(/nicht persistent/i).length).toBeGreaterThan(0);
  });
});

describe('useDemoStammdaten — Session-Default', () => {
  function Probe() {
    const { state, dispatch } = useApp();
    return (
      <div>
        <span data-testid="demo-flag">{String(state.useDemoStammdaten)}</span>
        <button type="button" onClick={() => dispatch({ type: 'SET_LOGIN_AUTH_METHOD', payload: 'eid' })}>
          eID
        </button>
        <button type="button" onClick={() => dispatch({ type: 'SET_CAN_VOTE', payload: true })}>
          canVote
        </button>
      </div>
    );
  }

  it('deaktiviert Demo-Stammdaten bei eID mit Abstimmrecht', () => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
    fireEvent.click(screen.getByText('eID'));
    fireEvent.click(screen.getByText('canVote'));
    expect(screen.getByTestId('demo-flag').textContent).toBe('false');
  });
});
