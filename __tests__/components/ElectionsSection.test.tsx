'use client';

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import ElectionsSection from '@/components/Elections/ElectionsSection';

describe('ElectionsSection', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('renders preview heading', () => {
    render(
      <AppProvider>
        <ElectionsSection currentLocation="deutschland" />
      </AppProvider>
    );
    expect(screen.getByText('Wahlvorschau: Kandidierende, Programme und verifizierte Quellen.')).toBeInTheDocument();
  });

  it('shows "Bereits abgestimmt" for voted election after vote is recorded', async () => {
    const { useApp: useAppContext } = require('@/context/AppContext');
    function Inner() {
      const { dispatch } = useAppContext();
      React.useEffect(() => {
        dispatch({ type: 'RECORD_ELECTION_VOTE', payload: 'btw25' });
      }, []);
      return (
        <ElectionsSection
          currentLocation="deutschland"
          userWahlkreisByLevel={{ bund: 'Saarbrücken', land: 'Saarland', kreis: '', kommune: '' }}
        />
      );
    }
    render(
      <AppProvider>
        <Inner />
      </AppProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ergebnisse' }));
    await waitFor(() => {
      expect(screen.getByText('Bereits abgestimmt')).toBeInTheDocument();
    });
    expect(screen.getByText('Stimmzettel anzeigen')).toBeInTheDocument();
  });

  it('shows Stimmzettel-Aktion unter Ergebnisse when not voted', () => {
    render(
      <AppProvider>
        <ElectionsSection currentLocation="deutschland" />
      </AppProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ergebnisse' }));
    const buttons = screen.getAllByRole('button', { name: /Stimmzettel/ });
    expect(buttons.length).toBeGreaterThan(0);
    expect(
      buttons.some(
        (b) =>
          b.textContent === 'Stimmzettel anzeigen' || b.textContent === 'Stimmzettel (Vorschau) öffnen',
      ),
    ).toBe(true);
  });

  it('kreis tab Saarland: nur Kreistag zum gewählten Menü (saarpfalz)', () => {
    render(
      <AppProvider>
        <ElectionsSection
          currentLocation="saarpfalz"
          currentLevel="kreis"
          userWahlkreisByLevel={{ bund: '', land: '', kreis: 'Saarpfalz-Kreis', kommune: '' }}
        />
      </AppProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ergebnisse' }));
    expect(screen.getByText('Kreistag Saarpfalz-Kreis')).toBeInTheDocument();
    expect(screen.queryByText('Kreistag Landkreis Neunkirchen')).not.toBeInTheDocument();
  });

  it('kreis tab Hessen: nur Kreistag zum Menü he_bergstrasse', () => {
    render(
      <AppProvider>
        <ElectionsSection
          currentLocation="he_bergstrasse"
          currentLevel="kreis"
          userWahlkreisByLevel={{ bund: '', land: '', kreis: 'Kreis Bergstraße', kommune: '' }}
        />
      </AppProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ergebnisse' }));
    expect(screen.getByText('Kreistag Bergstraße')).toBeInTheDocument();
    expect(screen.queryByText('Kreistag Pinneberg')).not.toBeInTheDocument();
  });

  it('kreis tab Baden-Württemberg: nur Kreistag zum Menü bw_rhein_neckar', () => {
    render(
      <AppProvider>
        <ElectionsSection
          currentLocation="bw_rhein_neckar"
          currentLevel="kreis"
          userWahlkreisByLevel={{ bund: '', land: '', kreis: 'Rhein-Neckar-Kreis', kommune: '' }}
        />
      </AppProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ergebnisse' }));
    expect(screen.getByText('Kreistag Rhein-Neckar-Kreis')).toBeInTheDocument();
    expect(screen.queryByText('Kreistag Esslingen')).not.toBeInTheDocument();
  });

  it('kreis tab Hessen: generierter Demo-Kreistag für he_wetterau', () => {
    render(
      <AppProvider>
        <ElectionsSection
          currentLocation="he_wetterau"
          currentLevel="kreis"
          userWahlkreisByLevel={{ bund: '', land: '', kreis: 'Wetteraukreis', kommune: '' }}
        />
      </AppProvider>
    );
    expect(screen.getByText('Kreistag Wetteraukreis')).toBeInTheDocument();
    expect(screen.getByText('Jan Weckler')).toBeInTheDocument();
    expect(screen.queryByText('Kreistag Pinneberg')).not.toBeInTheDocument();
  });

  it('kreis tab BW: generierter Demo-Kreistag für bw_calw', () => {
    render(
      <AppProvider>
        <ElectionsSection
          currentLocation="bw_calw"
          currentLevel="kreis"
          userWahlkreisByLevel={{ bund: '', land: '', kreis: 'Calw', kommune: '' }}
        />
      </AppProvider>
    );
    expect(screen.getByText('Kreistag Landkreis Calw')).toBeInTheDocument();
    expect(screen.getByText('Helmut Riegger')).toBeInTheDocument();
    expect(screen.queryByText('Kreistag Landkreis München')).not.toBeInTheDocument();
  });
});
