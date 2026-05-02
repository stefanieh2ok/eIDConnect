'use client';

import React from 'react';
import { Mic } from 'lucide-react';
import { INTRO_GLOBAL_PILL_LABEL } from '@/data/introOverlayMarketing';
import {
  IntroAudioStatusButton,
  IntroSpeechSpeedToggle,
  INTRO_META_ICON_BUTTON_DARK_CLASS,
  INTRO_META_ICON_BUTTON_LIGHT_CLASS,
} from '@/components/Intro/IntroOverlay';

type Props = {
  /**
   * @deprecated Wird für Screenreader-Logik außerhalb beibehalten; in der
   * kompakten Leiste nicht mehr angezeigt.
   */
  stepNumber: number | null;
  stepLabel?: string;
  onSkip?: () => void;
  onClose?: () => void;
  /** Screenreader-Label für × (z. B. wenn Aktion nicht „Einführung beenden“ ist). */
  closeAriaLabel?: string;
  /** Clara Voice: gleiche Button-Fläche wie Lautsprecher, ausgerichtet in der Leiste (kein schwebendes Mic). */
  showClaraVoice?: boolean;
  /** `light` für weiße Intro-Kachel (Kontrast wie Lautsprecher auf hell). */
  surface?: 'dark' | 'light';
  /**
   * @deprecated Framing-Texte leben in den eigentlichen Intro-Inhalten, nicht
   * mehr im oberen weißen Streifen.
   */
  metaFramingLine?: string;
};

/**
 * Eine Zeile: Einführung + optional Stimme (Opt-in) + Schließen.
 */
export default function IntroMetaStrip({
  onSkip,
  onClose,
  closeAriaLabel,
  showClaraVoice = false,
  surface = 'dark',
}: Props) {
  const onExit = onClose ?? onSkip;
  const exitAria = closeAriaLabel ?? 'Einführung beenden';
  const onLight = surface === 'light';

  return (
    <div
      className={
        'intro-meta-strip flex-shrink-0 font-sans antialiased [font-synthesis:none]' +
        (onLight ? ' intro-meta-strip--on-light' : '')
      }
    >
      <div className="flex min-w-0 max-w-full items-center justify-between gap-2">
        <span
          className="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.1em] text-white"
          style={{ background: 'var(--gov-primary, #003366)' }}
        >
          {INTRO_GLOBAL_PILL_LABEL}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <IntroAudioStatusButton theme={onLight ? 'light' : 'dark'} />
          <IntroSpeechSpeedToggle theme={onLight ? 'light' : 'dark'} />
          {showClaraVoice ? (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('clara:open-voice'));
                }
              }}
              className={onLight ? INTRO_META_ICON_BUTTON_LIGHT_CLASS : INTRO_META_ICON_BUTTON_DARK_CLASS}
              aria-label="Mit Clara sprechen (Voice)"
              title="Mit Clara sprechen"
            >
              <Mic className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} aria-hidden />
            </button>
          ) : null}
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              aria-label={exitAria}
              className={
                'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-sm leading-none ' +
                (onLight
                  ? 'border-slate-300/90 bg-white text-slate-600 hover:bg-slate-50'
                  : 'border-white/30 bg-white/10 text-white hover:bg-white/20')
              }
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
