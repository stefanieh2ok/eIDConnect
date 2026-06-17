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

  it('shows Wegweiser pilot zone and core modules when flag is enabled', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    render(
      <AppProvider>
        <AppBottomNav />
        <ActiveSectionProbe />
      </AppProvider>,
    );

    expect(screen.getByRole('button', { name: 'Clara Wegweiser' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clara Wegweiser' })).toHaveClass(
      'app-bottom-nav__item--pilot',
    );
    expect(screen.getByTestId('bottom-nav-zone-separator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Melden' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Beteiligen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wahlen' })).toBeInTheDocument();
    expect(screen.queryByText('Pilot')).not.toBeInTheDocument();
    expect(screen.queryByText('PILOT')).not.toBeInTheDocument();
  });

  it('hides Wegweiser and separator when flag is false', () => {
    process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = 'false';
    render(
      <AppProvider>
        <AppBottomNav />
        <ActiveSectionProbe />
      </AppProvider>,
    );

    expect(screen.queryByRole('button', { name: 'Clara Wegweiser' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-nav-zone-separator')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Melden' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Beteiligen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wahlen' })).toBeInTheDocument();
  });

  it('opens Wegweiser section from pilot zone', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    render(
      <AppProvider>
        <AppBottomNav />
        <ActiveSectionProbe />
      </AppProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clara Wegweiser' }));
    expect(screen.getByTestId('active-section')).toHaveTextContent('fuermich');
    expect(screen.getByRole('button', { name: 'Clara Wegweiser' })).toHaveClass(
      'app-bottom-nav__item--pilot-active',
    );
  });

  it('uses mint active state for core modules', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    render(
      <AppProvider>
        <AppBottomNav />
        <ActiveSectionProbe />
      </AppProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Beteiligen' }));
    const beteiligen = screen.getByRole('button', { name: 'Beteiligen' });
    expect(beteiligen).toHaveClass('app-bottom-nav__item--active');
    expect(beteiligen).not.toHaveClass('app-bottom-nav__item--pilot-active');
    expect(screen.getByTestId('active-section')).toHaveTextContent('live');
  });

  it('wechselt die aktive Section über Bottom Navigation', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
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

  it('does not render pilot card on core sections', async () => {
    render(
      <AppProvider>
        <BuergerApp />
      </AppProvider>,
    );
    await screen.findByRole('button', { name: 'Beteiligen' });
    expect(screen.queryByTestId('clara-wegweiser-pilot-card')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clara Wegweiser' })).toBeInTheDocument();
  });

  it('hides Wegweiser nav when flag is false', async () => {
    process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = 'false';
    render(
      <AppProvider>
        <BuergerApp />
      </AppProvider>,
    );
    await screen.findByRole('button', { name: 'Beteiligen' });
    expect(screen.queryByTestId('clara-wegweiser-pilot-card')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clara Wegweiser' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-nav-zone-separator')).not.toBeInTheDocument();
  });
});
