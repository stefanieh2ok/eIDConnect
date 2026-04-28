'use client';

import React, { useCallback, useEffect, useRef } from 'react';
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
import { useIntroSpeakApi } from '@/components/Intro/IntroOverlay';
import { ClaraStepPanel } from '@/components/Intro/ClaraStepPanel';
import ProductIdentityHeader from '@/components/ui/ProductIdentityHeader';

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
  const entryIntroPlayedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      entryIntroPlayedRef.current = false;
    }
  }, [open]);

  const speakEntry = useCallback(() => {
    if (!speakApi) return;
    const parts = du ? [...INTRO_SPOKEN_ENTRY_DU] : [...INTRO_SPOKEN_ENTRY_SIE];
    speakApi.stopIntroSpeech();
    speakApi.speakIntroParts(parts, 'intro-entry-1');
    entryIntroPlayedRef.current = true;
  }, [du, speakApi]);

  /** Früher Start auch auf Mobile, damit Clara direkt einführt. */
  useEffect(() => {
    if (!open || !speakApi) return;
    if (!speakApi.readAloud) {
      speakApi.stopIntroSpeech();
      return;
    }
    if (entryIntroPlayedRef.current) return;
    const t = window.setTimeout(() => {
      if (entryIntroPlayedRef.current) return;
      speakEntry();
    }, 90);
    return () => {
      clearTimeout(t);
    };
  }, [open, speakApi, speakApi?.readAloud, speakEntry]);

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
      <div className="pointer-events-none absolute inset-x-0 top-6 z-[1] flex justify-center">
        <ProductIdentityHeader
          variant="dark"
          align="center"
          className="intro-logo-enter"
        />
      </div>
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
            if (!speakApi?.readAloud) return;
            if (entryIntroPlayedRef.current) return;
            speakEntry();
          }}
        >
          <IntroMetaStrip
            surface="light"
            stepNumber={null}
            showClaraVoice
            onClose={onDirectToApp}
            onSkip={onDirectToApp}
          />
          <div className="border-b border-neutral-200 px-4 pb-3 pt-3 sm:px-6 sm:pt-4 sm:pb-4">
            <ProductIdentityHeader className="mb-2" />
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
              onClick={onStart}
              className="btn-primary t-button w-full min-h-[48px]"
            >
              {INTRO_ENTRY_START}
            </button>
            <button
              type="button"
              onClick={onDirectToApp}
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
