'use client';

import React from 'react';
import { INTRO_GLOBAL_PILL_LABEL } from '@/data/introOverlayMarketing';
import { IntroAudioStatusButton } from '@/components/Intro/IntroOverlay';

type Props = {
  /**
   * @deprecated Wird für Screenreader-Logik außerhalb beibehalten; in der
   * kompakten Leiste nicht mehr angezeigt.
   */
  stepNumber: number | null;
  stepLabel?: string;
  onSkip?: () => void;
  onClose?: () => void;
  /**
   * @deprecated Framing-Texte leben in den eigentlichen Intro-Inhalten, nicht
   * mehr im oberen weißen Streifen.
   */
  metaFramingLine?: string;
};

/**
 * Eine Zeile: Einführung + optional Stimme (Opt-in) + Schließen.
 */
export default function IntroMetaStrip({ onSkip, onClose }: Props) {
  const onExit = onClose ?? onSkip;

  return (
    <div className="intro-meta-strip flex-shrink-0 font-sans antialiased [font-synthesis:none]">
      <div className="flex min-w-0 max-w-full items-center justify-between gap-2">
        <span
          className="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.1em] text-white"
          style={{ background: 'var(--gov-primary, #003366)' }}
        >
          {INTRO_GLOBAL_PILL_LABEL}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <IntroAudioStatusButton theme="dark" />
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              aria-label="Einführung beenden"
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm leading-none text-white hover:bg-white/20"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
