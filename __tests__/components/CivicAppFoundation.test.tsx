'use client';

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { CivicStepProgress } from '@/components/shell/CivicStepProgress';
import { CivicSegmentedControl } from '@/components/shell/CivicSegmentedControl';
import { ModuleScreenHeader } from '@/components/shell/ModuleScreenHeader';
import { CIVIC_MODULE_SCREEN_TITLES, CIVIC_SETTINGS_SCREEN_TITLE } from '@/lib/civicScreenTitles';
import MeldungenSection from '@/components/Meldungen/MeldungenSection';
import ElectionsSection from '@/components/Elections/ElectionsSection';
import LiveSection from '@/components/Live/LiveSection';
import PostfachSection from '@/components/Postfach/PostfachSection';
import CalendarSection from '@/components/Calendar/CalendarSection';
import LeaderboardSection from '@/components/Leaderboard/LeaderboardSection';
import { ClaraWegweiser } from '@/components/civic/ClaraWegweiser';
import { ClaraCaseInputProvider } from '@/context/ClaraCaseInputContext';
import SettingsSection from '@/components/Settings/SettingsSection';

describe('Civic App Foundation v2', () => {
  it('ModuleScreenHeader H1 has no truncate/ellipsis utility classes', () => {
    render(<ModuleScreenHeader title="Wahlinformationen" id="test-h1" />);
    const h1 = screen.getByRole('heading', { level: 1, name: 'Wahlinformationen' });
    expect(h1).toHaveClass('civic-screen-h1');
    expect(h1.className).not.toMatch(/truncate|ellipsis/);
  });

  it('CivicStepProgress renders Kategorie, Details, Prüfen with aria-current on active step', () => {
    render(
      <CivicStepProgress
        steps={[
          { key: 'kategorie', label: 'Kategorie' },
          { key: 'details', label: 'Details' },
          { key: 'pruefen', label: 'Prüfen' },
        ]}
        currentIndex={0}
        ariaLabel="Meldungsablauf"
      />,
    );
    expect(screen.getByText('Prüfen')).toBeInTheDocument();
    const activeStep = document.querySelector('[aria-current="step"]');
    expect(activeStep).toHaveTextContent('Kategorie');
  });

  it('CivicSegmentedControl uses tablist semantics', () => {
    const onChange = jest.fn();
    render(
      <CivicSegmentedControl
        ariaLabel="Test tabs"
        value="a"
        onChange={onChange}
        options={[
          { value: 'a', label: 'Aktuell' },
          { value: 'b', label: 'Ergebnisse' },
        ]}
      />,
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Aktuell');
    fireEvent.click(screen.getByRole('tab', { name: 'Ergebnisse' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('Melden shows CivicStepProgress without Schritt 1/3', () => {
    render(
      <AppProvider>
        <MeldungenSection />
      </AppProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: CIVIC_MODULE_SCREEN_TITLES.meldungen })).toBeInTheDocument();
    expect(screen.getByText('Prüfen')).toBeInTheDocument();
    expect(screen.queryByText(/Schritt\s+1\/3/i)).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Meldungsablauf' })).toBeInTheDocument();
  });

  it('Wahlen and Beteiligen use CivicSegmentedControl', () => {
    const { unmount: unmountWahlen } = render(
      <AppProvider>
        <ElectionsSection currentLocation="deutschland" />
      </AppProvider>,
    );
    expect(screen.getByRole('tablist', { name: 'Wahlen Ansicht' })).toBeInTheDocument();
    unmountWahlen();

    render(
      <AppProvider>
        <LiveSection />
      </AppProvider>,
    );
    expect(screen.getByRole('tablist', { name: 'Abstimmungen Ansicht' })).toBeInTheDocument();
  });

  it('all eight module H1 titles are defined', () => {
    expect(CIVIC_MODULE_SCREEN_TITLES.fuermich).toBe('Anliegen vorbereiten');
    expect(CIVIC_MODULE_SCREEN_TITLES.meldungen).toBe('Neue Meldung');
    expect(CIVIC_MODULE_SCREEN_TITLES.live).toBe('Abstimmungen');
    expect(CIVIC_MODULE_SCREEN_TITLES.wahlen).toBe('Wahlinformationen');
    expect(CIVIC_MODULE_SCREEN_TITLES.kalender).toBe('Kalender');
    expect(CIVIC_MODULE_SCREEN_TITLES.leaderboard).toBe('Prämien');
    expect(CIVIC_MODULE_SCREEN_TITLES.postfach).toBe('Postfach');
    expect(CIVIC_SETTINGS_SCREEN_TITLE).toBe('Einstellungen');
  });

  it('utility screens render shared H1 system', () => {
    render(
      <AppProvider>
        <PostfachSection />
      </AppProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Postfach' })).toBeInTheDocument();

    const { unmount: u1 } = render(
      <AppProvider>
        <CalendarSection />
      </AppProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Kalender' })).toBeInTheDocument();
    u1();

    render(
      <AppProvider>
        <LeaderboardSection />
      </AppProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Prämien' })).toBeInTheDocument();
  });

  it('Wegweiser does not show Clara · Kirkel · Saarland · Profil line', () => {
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    })) as unknown as typeof IntersectionObserver;

    render(
      <AppProvider>
        <ClaraCaseInputProvider>
          <ClaraWegweiser du />
        </ClaraCaseInputProvider>
      </AppProvider>,
    );
    expect(screen.queryByText(/Clara · Kirkel · Saarland · Profil/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('wegweiser-field-help')).toHaveTextContent(/häufigen Fall/i);
  });

  it('Melden flow hides existing reports list on category step', () => {
    render(
      <AppProvider>
        <MeldungenSection />
      </AppProvider>,
    );
    expect(screen.queryByText(/Aktuelle Meldungen/i)).not.toBeInTheDocument();
  });

  it('settings section uses Einstellungen as H1 in main view', () => {
    render(
      <AppProvider>
        <SettingsSection />
      </AppProvider>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Einstellungen' })).toBeInTheDocument();
    expect(screen.getByText('Profil & Haushalt')).toBeInTheDocument();
    expect(screen.getByText('Datenschutz & Transparenz')).toBeInTheDocument();
    expect(screen.getByText('Barrierefreiheit')).toBeInTheDocument();
    expect(screen.getByText('Sicherheit & Zugang')).toBeInTheDocument();
    expect(screen.getByText('Demo & Systemstatus')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zurück zur App/i })).toBeInTheDocument();
  });
});
