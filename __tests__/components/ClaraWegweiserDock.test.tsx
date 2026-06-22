/**
 * Wegweiser Clara dock visibility — must not cover CTA while input block is visible.
 */
'use client';

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { ClaraCaseInputProvider, useClaraCaseInputBridge } from '@/context/ClaraCaseInputContext';
import { ClaraWegweiser } from '@/components/civic/ClaraWegweiser';
import { SOURCE_NOTICE_DEMO } from '@/lib/govdata/sourceStatus';
import { mountCivicAppTestDocument } from '@/lib/test/civicAppTestShell';

let intersectionCallback: IntersectionObserverCallback | null = null;

beforeEach(() => {
  intersectionCallback = null;
  global.IntersectionObserver = jest.fn((cb: IntersectionObserverCallback) => {
    intersectionCallback = cb;
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    };
  }) as unknown as typeof IntersectionObserver;

  mountCivicAppTestDocument();
  delete document.documentElement.dataset.claraWegweiserActive;
  delete document.documentElement.dataset.claraWegweiserInputOnly;

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      mode: 'demo',
      status: 'demo',
      services: [],
      isDemoData: true,
      sourceNotice: SOURCE_NOTICE_DEMO,
    }),
  }) as typeof fetch;

  Element.prototype.scrollIntoView = jest.fn();
});

function BridgeProbe() {
  const bridge = useClaraCaseInputBridge();
  return (
    <div
      data-testid="dock-visible"
      data-show-floating-dock={String(bridge.showFloatingDock)}
    />
  );
}

function setup() {
  return render(
    <AppProvider>
      <ClaraCaseInputProvider>
        <BridgeProbe />
        <ClaraWegweiser du />
      </ClaraCaseInputProvider>
    </AppProvider>,
  );
}

function emitIntersection(isIntersecting: boolean) {
  act(() => {
    intersectionCallback?.(
      [{ isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

describe('ClaraWegweiser dock visibility', () => {
  it('keeps dock hidden while input guard is visible (empty input)', () => {
    setup();
    emitIntersection(true);
    expect(screen.getByTestId('dock-visible')).toHaveAttribute('data-show-floating-dock', 'false');
    expect(document.documentElement.dataset.claraWegweiserInputOnly).toBe('true');
  });

  it('keeps dock hidden when text is filled but guard still visible', () => {
    setup();
    emitIntersection(true);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich ziehe mit Kindern um.' },
    });
    expect(screen.getByTestId('dock-visible')).toHaveAttribute('data-show-floating-dock', 'false');
  });

  it('shows dock after input guard scrolls out of view', () => {
    setup();
    emitIntersection(true);
    emitIntersection(false);
    expect(screen.getByTestId('dock-visible')).toHaveAttribute('data-show-floating-dock', 'true');
    expect(document.documentElement.dataset.claraWegweiserInputOnly).toBeUndefined();
  });

  it('shows dock when plan is visible so Clara stays reachable', async () => {
    setup();
    emitIntersection(true);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Ich ziehe mit Kindern um und brauche Unterstützung.' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Behördenfahrplan erstellen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId('clara-wegweiser-chat-flow')).toBeInTheDocument();
    });
    expect(screen.getByTestId('dock-visible')).toHaveAttribute('data-show-floating-dock', 'false');
    await act(async () => {
      fireEvent.click(screen.getByTestId('clarification-submit-skip-btn'));
    });
    await waitFor(() => {
      expect(screen.getByText(/Dein Fahrplan/i)).toBeInTheDocument();
    });
    expect(screen.getByTestId('dock-visible')).toHaveAttribute('data-show-floating-dock', 'true');
    expect(document.documentElement.dataset.claraWegweiserPlan).toBe('true');
  });
});
