'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  INTRO_ENTRY_DIRECT,
  INTRO_ENTRY_SHORT_DU,
  INTRO_ENTRY_SHORT_SIE,
  INTRO_ENTRY_START,
  INTRO_ENTRY_UI_TITLE,
  INTRO_SPOKEN_ENTRY_DU,
  INTRO_SPOKEN_ENTRY_SIE,
} from '@/data/introOverlayMarketing';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { useIntroIsSpeaking, useIntroSpeakApi } from '@/components/Intro/IntroOverlay';
import { ClaraStepPanel } from '@/components/Intro/ClaraStepPanel';

type Props = {
  open: boolean;
  du: boolean;
  onStart: () => void;
  onDirectToApp: () => void;
  /**
   * Im `device`-Layout (BuergerApp in IphoneFrame): `absolute`, damit das Overlay
   * im Geräte-Rahmen bleibt. Sonst `fixed` = voller Viewport (überschreibt den Frame).
   */
  position?: 'fixed' | 'absolute';
};

export function IntroEntryBranch({
  open,
  du,
  onStart,
  onDirectToApp,
  position = 'fixed',
}: Props) {
  /** Stabile API — nicht `useOptionalIntroOverlay()` (merged Objekt wechselt bei jedem TTS-Tick → Effect-Sturm). */
  const speakApi = useIntroSpeakApi();
  const speakApiRef = useRef(speakApi);
  speakApiRef.current = speakApi;
  const isIntroSpeaking = useIntroIsSpeaking();
  const entryIntroPlayedRef = useRef(false);
  const wasSpeakingRef = useRef(false);
  const entrySpeechHeardRef = useRef(false);
  const userInteractedRef = useRef(false);
  const [primaryPulse, setPrimaryPulse] = useState(false);
  const autoTimersRef = useRef<number[]>([]);

  const clearAuto = useCallback(() => {
    for (const id of autoTimersRef.current) window.clearTimeout(id);
    autoTimersRef.current = [];
  }, []);

  useEffect(() => {
    if (!open) {
      entryIntroPlayedRef.current = false;
      wasSpeakingRef.current = false;
      entrySpeechHeardRef.current = false;
      userInteractedRef.current = false;
      setPrimaryPulse(false);
      clearAuto();
    }
  }, [open, clearAuto]);

  const speakEntry = useCallback(() => {
    const api = speakApiRef.current;
    if (!api) return;
    const parts = du ? [...INTRO_SPOKEN_ENTRY_DU] : [...INTRO_SPOKEN_ENTRY_SIE];
    api.stopIntroSpeech();
    api.speakIntroParts(parts, 'intro-entry-1');
    entryIntroPlayedRef.current = true;
  }, [du]);

  /** Ein Timer: Clara ~1 s nach Öffnen, ohne Warten auf Geste. */
  useEffect(() => {
    if (!open || !speakApiRef.current) return;
    if (!speakApiRef.current.readAloud) {
      speakApiRef.current.stopIntroSpeech();
      return;
    }
    if (entryIntroPlayedRef.current) return;
    const t = window.setTimeout(() => {
      if (entryIntroPlayedRef.current) return;
      speakEntry();
    }, 1000);
    return () => {
      clearTimeout(t);
    };
  }, [open, speakApi?.readAloud, speakEntry]);

  useEffect(() => {
    if (!open) return;
    const prev = wasSpeakingRef.current;
    wasSpeakingRef.current = isIntroSpeaking;
    if (entryIntroPlayedRef.current && isIntroSpeaking) {
      entrySpeechHeardRef.current = true;
    }
    if (
      !entryIntroPlayedRef.current ||
      userInteractedRef.current ||
      !speakApiRef.current?.readAloud ||
      !prev ||
      isIntroSpeaking
    ) {
      return;
    }
    if (!entrySpeechHeardRef.current) return;
    entrySpeechHeardRef.current = false;
    clearAuto();
    setPrimaryPulse(true);
    autoTimersRef.current.push(
      window.setTimeout(() => {
        setPrimaryPulse(false);
        onStart();
      }, 400),
    );
  }, [isIntroSpeaking, open, speakApi?.readAloud, onStart, clearAuto]);

  if (!open) return null;

  const shellClass =
    position === 'absolute'
      ? 'absolute inset-0 z-[610] flex min-h-0 items-center justify-center overflow-hidden p-3 sm:p-4'
      : 'intro-safe-overlay z-[610] flex items-center justify-center p-3 sm:p-4';

  return (
    <div
      className={shellClass}
      role="dialog"
      aria-modal="true"
      aria-label="Einstieg Einführung"
    >
      <div className="absolute inset-0 bg-[#0B2A3C]" aria-hidden />
      <div
        className="clara-prelogin-shell-pad intro-device-chrome-shell intro-dark-body relative z-[2] w-full max-w-[400px] overflow-hidden rounded-[1.85rem] p-[3px] sm:max-w-[440px] sm:p-1"
        style={{ maxHeight: 'min(calc(100dvh - 1.5rem), 100%)' }}
      >
        <div
          className="flex min-h-0 flex-col overflow-hidden rounded-[1.65rem] border border-neutral-200/95 bg-white"
          style={{ maxHeight: 'min(calc(100dvh - 1.5rem), 100%)' }}
          onPointerDownCapture={(e) => {
            const t = e.target as HTMLElement;
            if (t.closest('.intro-meta-strip')) return;
            if (t.closest('.intro-entry-bottom-room button')) {
              userInteractedRef.current = true;
              clearAuto();
              setPrimaryPulse(false);
              return;
            }
            if (!speakApiRef.current?.readAloud) return;
            if (entryIntroPlayedRef.current) return;
            speakEntry();
          }}
        >
          <IntroMetaStrip
            surface="light"
            stepNumber={null}
            showClaraVoice
            inlinePad="card"
            onClose={onDirectToApp}
            onSkip={onDirectToApp}
          />
          <div className="border-b border-neutral-200 px-4 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4">
            <ClaraStepPanel
              surface="light"
              label={INTRO_ENTRY_UI_TITLE}
              short={du ? INTRO_ENTRY_SHORT_DU : INTRO_ENTRY_SHORT_SIE}
              long=""
              showTopicTitle
            />
          </div>
          <div className="intro-entry-bottom-room flex flex-col gap-2 px-4 pt-2 sm:px-6">
            <button
              type="button"
              onClick={() => {
                userInteractedRef.current = true;
                clearAuto();
                setPrimaryPulse(false);
                speakApiRef.current?.stopIntroSpeech();
                onStart();
              }}
              className={'btn-primary t-button w-full min-h-[48px] ' + (primaryPulse ? 'footer-heartbeat' : '')}
            >
              {INTRO_ENTRY_START}
            </button>
            <button
              type="button"
              onClick={() => {
                userInteractedRef.current = true;
                clearAuto();
                setPrimaryPulse(false);
                speakApiRef.current?.stopIntroSpeech();
                onDirectToApp();
              }}
              className="btn-secondary t-button min-h-[48px] w-full"
            >
              {INTRO_ENTRY_DIRECT}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
