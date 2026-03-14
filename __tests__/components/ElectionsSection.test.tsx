'use client';

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import ElectionsSection from '@/components/Elections/ElectionsSection';

describe('ElectionsSection', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('renders section heading', () => {
    render(
      <AppProvider>
        <ElectionsSection currentLocation="deutschland" />
      </AppProvider>
    );
    expect(screen.getByText('Kommende Wahlen')).toBeInTheDocument();
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
    await waitFor(() => {
      expect(screen.getByText('Bereits abgestimmt')).toBeInTheDocument();
    });
    expect(screen.getByText('Stimmzettel erneut ansehen')).toBeInTheDocument();
  });

  it('shows "Stimmzettel ansehen" when not voted', () => {
    render(
      <AppProvider>
        <ElectionsSection currentLocation="deutschland" />
      </AppProvider>
    );
    const buttons = screen.getAllByRole('button', { name: /Stimmzettel/ });
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.some((b) => b.textContent === 'Stimmzettel ansehen')).toBe(true);
  });
});
