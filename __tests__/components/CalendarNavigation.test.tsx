import React, { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import CalendarSection from '@/components/Calendar/CalendarSection';

function StateProbe() {
  const { state } = useApp();
  return (
    <div data-testid="state-probe">
      {state.activeSection}|{state.activeLocation}
    </div>
  );
}

function StartInSection({ section }: { section: 'live' | 'wahlen' | 'kalender' }) {
  const { dispatch } = useApp();
  useEffect(() => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  }, [dispatch, section]);
  return null;
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

describe('Calendar event navigation', () => {
  beforeEach(() => {
    (globalThis.localStorage as any).clear();
    localStorage.setItem('eidconnect_residence_location', 'kirkel');
  });

  it('navigates Abstimmung events to live + correct location', async () => {
    const now = new Date();
    const day = Math.min(25, now.getDate() + 1);
    const deadline = `${pad2(day)}.${pad2(now.getMonth() + 1)}.${now.getFullYear()}`;

    const votingData = {
      frankfurt: {
        canVote: true,
        cards: [
          {
            id: 'test-frankfurt-card',
            title: 'TEST Abstimmung Frankfurt',
            deadline,
            emoji: '🗳️',
            category: 'Digitalisierung',
            description: 'Testkarte',
            quickFacts: ['60% Dafür', '30% Dagegen', '10.000 Stimmen'],
            yes: 60,
            no: 30,
            abstain: 10,
            votes: 10000,
            points: 250,
            claraMatch: 80,
            urgent: false,
            kiAnalysis: {
              pros: [{ text: 'Pro', source: 'Test', weight: 1 }],
              cons: [{ text: 'Contra', source: 'Test', weight: 1 }],
              claraEinschätzung: 'Neutral',
              financialImpact: 'Mittel',
              environmentalImpact: 'Mittel',
            },
          },
        ],
      },
    } as any;

    render(
      <AppProvider>
        <StartInSection section="wahlen" />
        <StateProbe />
        <CalendarSection votingData={votingData} />
      </AppProvider>
    );

    const eventButtons = await screen.findAllByRole('button', { name: /TEST Abstimmung Frankfurt/i });
    fireEvent.click(eventButtons[eventButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByTestId('state-probe')).toHaveTextContent('live|frankfurt');
    });
  });

  it('navigates Wahl events to wahlen + event location', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
    try {
      render(
        <AppProvider>
          <StartInSection section="live" />
          <StateProbe />
          <CalendarSection />
        </AppProvider>
      );

      const wahlButton = await screen.findByRole('button', { name: /Gemeinderatswahl Mannheim 2024/i });
      fireEvent.click(wahlButton);

      await waitFor(() => {
        expect(screen.getByTestId('state-probe')).toHaveTextContent('wahlen|mannheim');
      });
    } finally {
      jest.useRealTimers();
    }
  });
});

