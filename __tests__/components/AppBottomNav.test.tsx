'use client';

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import AppBottomNav from '@/components/Header/AppBottomNav';

function ActiveSectionProbe() {
  const { state } = useApp();
  return <div data-testid="active-section">{state.activeSection}</div>;
}

describe('AppBottomNav', () => {
  it('rendert die vier Hauptbereiche vollständig lesbar', () => {
    render(
      <AppProvider>
        <AppBottomNav />
        <ActiveSectionProbe />
      </AppProvider>,
    );

    expect(screen.getByRole('button', { name: 'Wegweiser' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Meldungen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abstimmen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wahlen' })).toBeInTheDocument();
  });

  it('wechselt die aktive Section über Bottom Navigation', () => {
    render(
      <AppProvider>
        <AppBottomNav />
        <ActiveSectionProbe />
      </AppProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abstimmen' }));
    expect(screen.getByTestId('active-section')).toHaveTextContent('live');
  });
});
