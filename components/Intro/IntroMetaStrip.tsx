'use client';

import React from 'react';
import { Mic } from 'lucide-react';
import { useClaraVoiceContext } from '@/components/Clara/ClaraVoiceContext';
import { INTRO_GLOBAL_PILL_LABEL } from '@/data/introOverlayMarketing';
import {
  IntroAudioStatusButton,
  IntroSpeechSpeedToggle,
  INTRO_META_ICON_BUTTON_DARK_CLASS,
  INTRO_META_ICON_BUTTON_DARK_COMPACT_CLASS,
  INTRO_META_ICON_BUTTON_LIGHT_CLASS,
  INTRO_META_ICON_BUTTON_LIGHT_COMPACT_CLASS,
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
  /** Horizontale Innenabstände wie Karteninhalt (px-4 / sm:px-5). */
  inlinePad?: 'none' | 'card';
  /** Schmalere Icons und feste Grid-Zeile — verhindert Überlappung Chip / Lautsprecher (~375px). */
  toolbarDensity?: 'default' | 'compact';
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
  inlinePad = 'none',
  toolbarDensity = 'default',
}: Props) {
  const { tryResumePendingAudioFromUserGesture } = useClaraVoiceContext();
  const onExit = onClose ?? onSkip;
  const exitAria = closeAriaLabel ?? 'Einführung beenden';
  const onLight = surface === 'light';
  const compact = toolbarDensity === 'compact';
  const micBtn = onLight
    ? compact
      ? INTRO_META_ICON_BUTTON_LIGHT_COMPACT_CLASS
      : INTRO_META_ICON_BUTTON_LIGHT_CLASS
    : compact
      ? INTRO_META_ICON_BUTTON_DARK_COMPACT_CLASS
      : INTRO_META_ICON_BUTTON_DARK_CLASS;
  const micIcon = compact ? 'h-4 w-4' : 'h-[18px] w-[18px]';
  const closeBtn = micBtn;

  return (
    <div
      className={
        'intro-meta-strip flex-shrink-0 font-sans antialiased [font-synthesis:none]' +
        (onLight ? ' intro-meta-strip--on-light' : '') +
        (inlinePad === 'card' ? ' intro-meta-strip--pad-card' : '') +
        (compact ? ' intro-meta-strip--compact-toolbar' : '')
      }
      onPointerDownCapture={() => {
        tryResumePendingAudioFromUserGesture();
      }}
    >
      <div className="intro-meta-strip__row flex w-full min-w-0 max-w-full items-center gap-2 sm:gap-2.5">
        <span
          className={
            'intro-meta-strip__pill inline-flex min-w-0 shrink-0 items-center truncate rounded-full font-bold uppercase leading-none tracking-[0.1em] text-white ' +
            (compact
              ? 'h-7 max-w-[min(30vw,7.75rem)] px-2 text-[8px] sm:max-w-[9rem] sm:text-[9px]'
              : 'h-8 max-w-[min(38vw,9.25rem)] px-2 text-[9px] sm:max-w-[11rem] sm:px-2.5 sm:text-[10px]')
          }
          style={{ background: 'var(--gov-primary, #003366)' }}
          title={INTRO_GLOBAL_PILL_LABEL}
        >
          {INTRO_GLOBAL_PILL_LABEL}
        </span>
        <div className="min-h-px min-w-2 flex-1 shrink" aria-hidden />
        <div className="intro-meta-strip__actions flex shrink-0 items-center gap-1 sm:gap-1.5">
          <IntroAudioStatusButton theme={onLight ? 'light' : 'dark'} density={toolbarDensity} />
          <IntroSpeechSpeedToggle theme={onLight ? 'light' : 'dark'} density={toolbarDensity} />
          {showClaraVoice ? (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('clara:open-voice'));
                }
              }}
              className={micBtn}
              aria-label="Mit Clara sprechen (Voice)"
              title="Mit Clara sprechen"
            >
              <Mic className={`${micIcon} shrink-0`} strokeWidth={1.5} aria-hidden />
            </button>
          ) : null}
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              aria-label={exitAria}
              className={closeBtn + ' text-[16px] leading-none'}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
