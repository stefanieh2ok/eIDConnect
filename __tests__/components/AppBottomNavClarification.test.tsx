'use client';

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';

const dismissClarification = jest.fn();
const resetTransientUi = jest.fn();

jest.mock('@/context/ClaraCaseInputContext', () => ({
  useClaraCaseInputBridge: () => ({
    isActive: true,
    dismissClarification,
    resetTransientUi,
    showFloatingDock: false,
    isClarifying: true,
    focusInput: jest.fn(),
    appendTranscript: jest.fn(),
    submitPlan: jest.fn(),
    canSubmit: false,
    speechSupported: false,
    startSpeechInput: jest.fn(),
    speechListening: false,
    speechMessage: null,
  }),
  ClaraCaseInputProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import AppBottomNav from '@/components/Header/AppBottomNav';

describe('AppBottomNav during Clara clarification', () => {
  beforeEach(() => {
    dismissClarification.mockClear();
    resetTransientUi.mockClear();
  });

  it('dismisses clarification and clears transient UI when nav item is clicked', () => {
    render(
      <AppProvider>
        <AppBottomNav />
      </AppProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Melden' }));
    expect(dismissClarification).toHaveBeenCalled();
    expect(resetTransientUi).toHaveBeenCalled();
  });

  it('clears Wegweiser transient UI when leaving fuermich without clarification open (UX-003)', () => {
    render(
      <AppProvider>
        <AppBottomNav />
      </AppProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clara Wegweiser' }));
    dismissClarification.mockClear();
    resetTransientUi.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Melden' }));
    expect(dismissClarification).toHaveBeenCalled();
    expect(resetTransientUi).toHaveBeenCalled();
  });
});
