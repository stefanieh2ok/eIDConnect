'use client';

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';

function TestConsumer() {
  const { state, dispatch } = useApp();
  return (
    <div>
      <span data-testid="voted-ids">{state.votedElectionIds.join(',')}</span>
      <button
        type="button"
        onClick={() => dispatch({ type: 'RECORD_ELECTION_VOTE', payload: 'btw25' })}
      >
        Vote btw25
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'RECORD_ELECTION_VOTE', payload: 'sl25' })}
      >
        Vote sl25
      </button>
    </div>
  );
}

describe('AppContext', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('renders with initial votedElectionIds empty', () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    expect(screen.getByTestId('voted-ids')).toHaveTextContent('');
  });

  it('records election vote and updates state', () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    expect(screen.getByTestId('voted-ids')).toHaveTextContent('');

    act(() => {
      screen.getByText('Vote btw25').click();
    });
    expect(screen.getByTestId('voted-ids')).toHaveTextContent('btw25');

    act(() => {
      screen.getByText('Vote sl25').click();
    });
    expect(screen.getByTestId('voted-ids')).toHaveTextContent('btw25,sl25');
  });

  it('persists voted ids to localStorage', () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    act(() => {
      screen.getByText('Vote btw25').click();
    });
    expect(globalThis.localStorage.getItem('eidconnect_voted_elections')).toBe(
      JSON.stringify(['btw25'])
    );
  });

  it('does not duplicate vote for same election', () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    act(() => {
      screen.getByText('Vote btw25').click();
      screen.getByText('Vote btw25').click();
    });
    expect(screen.getByTestId('voted-ids')).toHaveTextContent('btw25');
  });
});
