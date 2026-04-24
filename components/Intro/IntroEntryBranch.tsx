'use client';

import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (!open || !speakApi || !speakApi.readAloud) return;
    const parts = du ? [...INTRO_SPOKEN_ENTRY_DU] : [...INTRO_SPOKEN_ENTRY_SIE];
    const t = window.setTimeout(() => {
      speakApi.speakIntroParts(parts, 'intro-entry-1');
    }, 200);
    return () => {
      clearTimeout(t);
      speakApi.stopIntroSpeech();
    };
  }, [open, speakApi, speakApi?.readAloud, du]);

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
      <div className="absolute inset-0 bg-[#020712]" aria-hidden />
      <div
        className="clara-prelogin-shell-pad intro-dark-body relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-white/10 shadow-none sm:max-w-[440px]"
        style={{ maxHeight: 'min(calc(100dvh - 1.5rem), 100%)' }}
      >
        <IntroMetaStrip stepNumber={null} onClose={onDirectToApp} onSkip={onDirectToApp} />
        <div className="border-b border-white/10 px-4 pb-3 pt-3 sm:px-6 sm:pt-4 sm:pb-4">
          <ClaraStepPanel
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
            className="btn-gov-primary w-full min-h-[48px] text-[13px] font-extrabold"
          >
            {INTRO_ENTRY_START}
          </button>
          <button
            type="button"
            onClick={onDirectToApp}
            className="min-h-[48px] w-full rounded-xl border border-white/20 bg-white/10 py-2.5 text-[12px] font-semibold text-white/95 transition hover:bg-white/15"
          >
            {INTRO_ENTRY_DIRECT}
          </button>
        </div>
      </div>
    </div>
  );
}
