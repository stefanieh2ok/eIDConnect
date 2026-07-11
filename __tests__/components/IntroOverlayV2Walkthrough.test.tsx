'use client';

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import IntroOverlayV2Walkthrough from '@/components/Intro/IntroOverlayV2Walkthrough';
import { INTRO_V2_CLAIM_DU } from '@/data/introOverlayV2';

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
  it('zeigt ruhigen Einstieg mit Claim (Intro v3)', () => {
    renderWalkthrough();
    expect(screen.getByTestId('intro-v2-walkthrough')).toBeInTheDocument();
    expect(screen.getByTestId('intro-v2-claim')).toHaveTextContent(INTRO_V2_CLAIM_DU);
    expect(screen.getByTestId('intro-v2-primary-cta')).toHaveTextContent('Zeig mir, wie');
    expect(screen.getByTestId('intro-v2-step-ruhiger-einstieg')).toBeInTheDocument();
  });

  it('navigiert mit Weiter durch alle 9 Screens bis Direkt zur App', () => {
    const { onFinish } = renderWalkthrough();
    fireEvent.click(screen.getByTestId('intro-v2-primary-cta'));

    for (let i = 0; i < 7; i += 1) {
      expect(screen.getByTestId('intro-v2-primary-cta')).toHaveTextContent('Weiter');
      fireEvent.click(screen.getByTestId('intro-v2-primary-cta'));
    }

    expect(screen.getByTestId('intro-v2-primary-cta')).toHaveTextContent('Direkt zur App');
    fireEvent.click(screen.getByTestId('intro-v2-primary-cta'));
    expect(onFinish).toHaveBeenCalled();
  });

  it('zeigt keine Anrede-Auswahl im Melden-Screen', () => {
    renderWalkthrough(true);
    fireEvent.click(screen.getByTestId('intro-v2-primary-cta'));
    expect(screen.getByTestId('intro-v2-step-melden-foto')).toBeInTheDocument();
    expect(screen.queryByTestId('intro-v2-anrede')).not.toBeInTheDocument();
  });

  it('bietet Überspringen vor dem letzten Screen', () => {
    const { onFinish } = renderWalkthrough();
    expect(screen.getByTestId('intro-v2-skip')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('intro-v2-skip'));
    expect(onFinish).toHaveBeenCalled();
  });
});
