'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { IntroOverlayV2Visual } from '@/components/Intro/IntroOverlayV2Visuals';
import {
  INTRO_OVERLAY_V2_STEPS,
  INTRO_V2_LEITMOTIV,
  introV2PrimaryButton,
  introV2StepBody,
  introV2StepTitle,
} from '@/data/introOverlayV2';

type Props = {
  du: boolean;
  fillDeviceFrame?: boolean;
  onFinish: () => void;
  onClose: () => void;
  onWalkthroughStepChange?: (step: { id: string; label: string }) => void;
};

export default function IntroOverlayV2Walkthrough({
  du,
  fillDeviceFrame = false,
  onFinish,
  onClose,
  onWalkthroughStepChange,
}: Props) {
  const { state, dispatch } = useApp();
  const duActive = state.anrede != null ? state.anrede === 'du' : du;
  const [stepIndex, setStepIndex] = useState(0);
  const step = INTRO_OVERLAY_V2_STEPS[stepIndex];
  const isLast = stepIndex >= INTRO_OVERLAY_V2_STEPS.length - 1;
  const isFirst = stepIndex === 0;

  useEffect(() => {
    if (!step) return;
    onWalkthroughStepChange?.({ id: step.id, label: step.navLabel });
  }, [onWalkthroughStepChange, step]);

  const advance = useCallback(() => {
    if (isLast) {
      onFinish();
      return;
    }
    setStepIndex((i) => Math.min(INTRO_OVERLAY_V2_STEPS.length - 1, i + 1));
  }, [isLast, onFinish]);

  const setAnrede = (nextDu: boolean) => {
    dispatch({ type: 'SET_ANREDE', payload: nextDu ? 'du' : 'sie' });
  };

  if (!step) return null;

  const title = introV2StepTitle(step, duActive);
  const body = introV2StepBody(step, duActive);
  const primaryLabel = introV2PrimaryButton(stepIndex, duActive);

  return (
    <div
      className="intro-v2-walkthrough relative z-10 flex min-h-0 h-full w-full max-w-[100%] min-w-0 flex-col overflow-hidden bg-[#0f1224] font-sans antialiased [font-synthesis:none]"
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
              inlinePad="card"
              toolbarDensity="compact"
              onSkip={onFinish}
              onClose={onClose}
            />

            <div className="intro-v2-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <div
                className="intro-v2-stage flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-3 pt-2 sm:px-5"
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

                {isFirst ? (
                  <p className="intro-v2-leitmotiv" data-testid="intro-v2-leitmotiv">
                    {INTRO_V2_LEITMOTIV}
                  </p>
                ) : null}

                <h2
                  className="intro-v2-title"
                  data-testid={isFirst ? 'intro-v2-claim' : undefined}
                >
                  {title}
                </h2>
                <p className="intro-v2-body">{body}</p>

                <div className="intro-v2-visual-wrap intro-v2-animate-in">
                  <IntroOverlayV2Visual stepId={step.id} du={duActive} />
                </div>

                {stepIndex >= 1 ? (
                  <div className="intro-v2-anrede" data-testid="intro-v2-anrede">
                    <span className="intro-v2-anrede__label">Anrede</span>
                    <button
                      type="button"
                      className={
                        'intro-v2-anrede__btn' + (duActive ? ' intro-v2-anrede__btn--active' : '')
                      }
                      onClick={() => setAnrede(true)}
                      aria-pressed={duActive}
                    >
                      Du
                    </button>
                    <button
                      type="button"
                      className={
                        'intro-v2-anrede__btn' + (!duActive ? ' intro-v2-anrede__btn--active' : '')
                      }
                      onClick={() => setAnrede(false)}
                      aria-pressed={!duActive}
                    >
                      Sie
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

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
