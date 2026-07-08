'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { IntroOverlayV2Visual } from '@/components/Intro/IntroOverlayV2Visuals';
import {
  INTRO_OVERLAY_V2_STEPS,
  introV2PrimaryButton,
  introV2StepBody,
  introV2StepIndexFromParam,
  introV2StepTitle,
} from '@/data/introOverlayV2';

type Props = {
  du: boolean;
  fillDeviceFrame?: boolean;
  onFinish: () => void;
  onClose: () => void;
  onWalkthroughStepChange?: (step: { id: string; label: string }) => void;
};

function readInitialIntroStep(): number {
  if (typeof window === 'undefined') return 0;
  const parsed = introV2StepIndexFromParam(
    new URLSearchParams(window.location.search).get('introStep'),
  );
  return parsed ?? 0;
}

function hasIntroStepParam(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('introStep');
}

export default function IntroOverlayV2Walkthrough({
  du,
  fillDeviceFrame = false,
  onFinish,
  onClose,
  onWalkthroughStepChange,
}: Props) {
  const { state } = useApp();
  const duActive = state.anrede != null ? state.anrede === 'du' : du;
  const [stepIndex, setStepIndex] = useState(readInitialIntroStep);
  const [devNav, setDevNav] = useState(false);
  const step = INTRO_OVERLAY_V2_STEPS[stepIndex];
  const isLast = stepIndex >= INTRO_OVERLAY_V2_STEPS.length - 1;
  const isFirst = stepIndex === 0;

  useEffect(() => {
    setDevNav(process.env.NODE_ENV === 'development' || hasIntroStepParam());
  }, []);

  useEffect(() => {
    if (!step) return;
    onWalkthroughStepChange?.({ id: step.id, label: step.navLabel });
  }, [onWalkthroughStepChange, step]);

  const syncIntroStepUrl = useCallback((nextIndex: number) => {
    if (typeof window === 'undefined') return;
    if (!hasIntroStepParam() && process.env.NODE_ENV !== 'development') return;
    const params = new URLSearchParams(window.location.search);
    params.set('introStep', String(nextIndex + 1));
    const q = params.toString();
    const next = `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', next);
  }, []);

  const goToStep = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(INTRO_OVERLAY_V2_STEPS.length - 1, nextIndex));
      setStepIndex(clamped);
      syncIntroStepUrl(clamped);
    },
    [syncIntroStepUrl],
  );

  const advance = useCallback(() => {
    if (isLast) {
      onFinish();
      return;
    }
    goToStep(stepIndex + 1);
  }, [goToStep, isLast, onFinish, stepIndex]);

  if (!step) return null;

  const title = introV2StepTitle(step, duActive);
  const body = introV2StepBody(step, duActive);
  const primaryLabel = introV2PrimaryButton(stepIndex, duActive);

  return (
    <div
      className={
        'intro-v2-walkthrough relative z-10 flex min-h-0 h-full w-full max-w-[100%] min-w-0 flex-col overflow-hidden bg-[#0f1224] font-sans antialiased [font-synthesis:none]' +
        (fillDeviceFrame ? '' : ' intro-v2-walkthrough--desktop-preview')
      }
      role="dialog"
      aria-modal="true"
      aria-label="Einführung HookAI Civic"
      data-testid="intro-v2-walkthrough"
    >
      <div
        className={`intro-v2-walkthrough-shell flex min-h-0 flex-1 flex-col overflow-hidden ${
          fillDeviceFrame
            ? 'intro-v2-walkthrough--fill-frame px-0 pb-0 pt-0'
            : 'px-2 pb-2 pt-1.5 sm:px-2.5 sm:pb-2.5 sm:pt-2'
        }`}
      >
        <div
          className={
            fillDeviceFrame
              ? 'intro-v2-device flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white'
              : 'intro-v2-device intro-device-chrome-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.85rem] p-[3px] sm:p-1'
          }
        >
          <div
            className={
              fillDeviceFrame
                ? 'intro-v2-inner flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white'
                : 'intro-v2-inner flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.65rem] border border-neutral-200/95 bg-white'
            }
          >
            <IntroMetaStrip
              surface="light"
              stepNumber={null}
              showClaraVoice={false}
              showAudioToolbar={false}
              inlinePad="card"
              toolbarDensity="compact"
              onSkip={onFinish}
              onClose={onClose}
            />

            <div className="intro-v2-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <div
                className="intro-v2-stage intro-v2-stage--trailer flex min-h-0 min-w-0 flex-1 flex-col px-3 pb-2 pt-1.5 sm:px-4"
                data-testid={`intro-v2-step-${step.id}`}
              >
                <div className="intro-v2-progress" aria-hidden>
                  {INTRO_OVERLAY_V2_STEPS.map((s, i) => (
                    <span
                      key={s.id}
                      className={
                        'intro-v2-progress__dot' + (i <= stepIndex ? ' intro-v2-progress__dot--active' : '')
                      }
                    />
                  ))}
                </div>

                <h2
                  className="intro-v2-title"
                  data-testid={isFirst ? 'intro-v2-claim' : undefined}
                >
                  {title}
                </h2>
                <p className="intro-v2-body">{body}</p>

                <div className="intro-v2-visual-wrap intro-v2-visual-wrap--hero intro-v2-animate-in">
                  <IntroOverlayV2Visual key={step.id} stepId={step.id} du={duActive} />
                </div>
              </div>
            </div>

            {devNav ? (
              <div
                className="intro-v3-dev-nav flex flex-shrink-0 items-center justify-between gap-2 border-t border-dashed border-neutral-200 bg-neutral-50 px-3 py-2"
                data-testid="intro-v3-dev-nav"
              >
                <button
                  type="button"
                  className="intro-v3-dev-nav__btn"
                  disabled={stepIndex <= 0}
                  onClick={() => goToStep(stepIndex - 1)}
                >
                  ← Szene
                </button>
                <span className="intro-v3-dev-nav__label">
                  {stepIndex + 1}/{INTRO_OVERLAY_V2_STEPS.length} · {step.id}
                </span>
                <button
                  type="button"
                  className="intro-v3-dev-nav__btn"
                  disabled={isLast}
                  onClick={() => goToStep(stepIndex + 1)}
                >
                  Szene →
                </button>
              </div>
            ) : null}

            <footer className="intro-v2-footer flex-shrink-0 border-t border-neutral-200/90 bg-white px-4 py-3 sm:px-5">
              <button
                type="button"
                className="intro-v2-cta-primary"
                onClick={advance}
                data-testid="intro-v2-primary-cta"
              >
                {primaryLabel}
              </button>
              {!isLast ? (
                <button
                  type="button"
                  className="intro-v2-cta-skip"
                  onClick={onFinish}
                  data-testid="intro-v2-skip"
                >
                  Überspringen
                </button>
              ) : null}
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
