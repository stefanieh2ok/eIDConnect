'use client';

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import IntroOverlayV2Walkthrough from '@/components/Intro/IntroOverlayV2Walkthrough';
import { INTRO_V2_CLAIM_DU, INTRO_V2_LEITMOTIV } from '@/data/introOverlayV2';

function renderWalkthrough(du = true) {
  const onFinish = jest.fn();
  render(
    <AppProvider>
      <IntroOverlayV2Walkthrough du={du} onFinish={onFinish} onClose={onFinish} />
    </AppProvider>,
  );
  return { onFinish };
}

describe('IntroOverlayV2Walkthrough', () => {
  it('zeigt Cold Open mit Claim und Leitmotiv', () => {
    renderWalkthrough();
    expect(screen.getByTestId('intro-v2-walkthrough')).toBeInTheDocument();
    expect(screen.getByTestId('intro-v2-claim')).toHaveTextContent(INTRO_V2_CLAIM_DU);
    expect(screen.getByTestId('intro-v2-leitmotiv')).toHaveTextContent(INTRO_V2_LEITMOTIV);
    expect(screen.getByTestId('intro-v2-primary-cta')).toHaveTextContent('Zeig mir, wie');
  });

  it('navigiert mit Weiter durch alle Screens bis Direkt zur App', () => {
    const { onFinish } = renderWalkthrough();
    fireEvent.click(screen.getByTestId('intro-v2-primary-cta'));

    for (let i = 0; i < 5; i += 1) {
      expect(screen.getByTestId('intro-v2-primary-cta')).toHaveTextContent('Weiter');
      fireEvent.click(screen.getByTestId('intro-v2-primary-cta'));
    }

    expect(screen.getByTestId('intro-v2-primary-cta')).toHaveTextContent('Direkt zur App');
    fireEvent.click(screen.getByTestId('intro-v2-primary-cta'));
    expect(onFinish).toHaveBeenCalled();
  });

  it('erlaubt Anrede-Umschaltung ab Screen 1', () => {
    renderWalkthrough(true);
    fireEvent.click(screen.getByTestId('intro-v2-primary-cta'));
    expect(screen.getByTestId('intro-v2-anrede')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sie' }));
    expect(screen.getByRole('button', { name: 'Sie' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('bietet Überspringen vor dem letzten Screen', () => {
    const { onFinish } = renderWalkthrough();
    expect(screen.getByTestId('intro-v2-skip')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('intro-v2-skip'));
    expect(onFinish).toHaveBeenCalled();
  });
});
