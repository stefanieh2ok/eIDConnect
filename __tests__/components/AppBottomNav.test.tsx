'use client';

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';
import AppBottomNav from '@/components/Header/AppBottomNav';
import BuergerApp from '@/components/BuergerApp';

function ActiveSectionProbe() {
  const { state } = useApp();
  return <div data-testid="active-section">{state.activeSection}</div>;
}

describe('AppBottomNav', () => {
  const prevFlag = process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;

  afterEach(() => {
    if (prevFlag === undefined) delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    else process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = prevFlag;
  });

  it('renders core modules without Wegweiser as equal nav item', () => {
    render(
      <AppProvider>
        <AppBottomNav />
        <ActiveSectionProbe />
      </AppProvider>,
    );

    expect(screen.queryByRole('button', { name: 'Wegweiser' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Melden' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Beteiligen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wahlen' })).toBeInTheDocument();
  });

  it('wechselt die aktive Section über Bottom Navigation', () => {
    render(
      <AppProvider>
        <AppBottomNav />
        <ActiveSectionProbe />
      </AppProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Beteiligen' }));
    expect(screen.getByTestId('active-section')).toHaveTextContent('live');
  });
});

describe('Clara Wegweiser pilot entry in app shell', () => {
  const prevFlag = process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
  const INTRO_DONE_KEY = 'eidconnect_product_intro_done_v4';
  const HIGHLIGHTS_SEEN_KEY = 'eidconnect_highlights_seen';
  const TOUR_DONE_KEY = 'eidconnect_tour_done';
  const PULSE_DONE_KEY = 'eidconnect_pulse_done';

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    (globalThis.localStorage as Storage).clear();
    const storage = globalThis.localStorage as Storage;
    storage.setItem(INTRO_DONE_KEY, 'true');
    storage.setItem(HIGHLIGHTS_SEEN_KEY, 'true');
    storage.setItem(TOUR_DONE_KEY, 'true');
    storage.setItem(PULSE_DONE_KEY, 'true');
    if (typeof window !== 'undefined') {
      window.ResizeObserver =
        window.ResizeObserver ??
        (function () {
          return { observe: () => {}, disconnect: () => {}, unobserve: () => {} };
        } as typeof ResizeObserver);
      Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
    }
  });

  afterEach(() => {
    if (prevFlag === undefined) delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    else process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = prevFlag;
  });

  it('shows pilot card when flag is true on core section', async () => {
    render(
      <AppProvider>
        <BuergerApp />
      </AppProvider>,
    );
    expect(await screen.findByTestId('clara-wegweiser-pilot-card')).toBeInTheDocument();
  });

  it('hides pilot card when flag is false', async () => {
    process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = 'false';
    render(
      <AppProvider>
        <BuergerApp />
      </AppProvider>,
    );
    await screen.findByRole('button', { name: 'Beteiligen' });
    expect(screen.queryByTestId('clara-wegweiser-pilot-card')).not.toBeInTheDocument();
  });
});
