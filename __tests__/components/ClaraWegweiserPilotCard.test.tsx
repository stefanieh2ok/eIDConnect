'use client';

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import ClaraWegweiserPilotCard from '@/components/civic/ClaraWegweiserPilotCard';

function ActiveSectionProbe() {
  const { state } = useApp();
  return <div data-testid="active-section">{state.activeSection}</div>;
}

describe('ClaraWegweiserPilotCard', () => {
  it('opens Wegweiser section on CTA click', () => {
    render(
      <AppProvider>
        <ClaraWegweiserPilotCard du />
        <ActiveSectionProbe />
      </AppProvider>,
    );

    expect(screen.getByText('Pilotmodul')).toBeInTheDocument();
    expect(screen.queryByText(/Demo-Daten/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PVOG.*live/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Behördenweg vorbereiten/i }));
    expect(screen.getByTestId('active-section')).toHaveTextContent('fuermich');
  });
});
