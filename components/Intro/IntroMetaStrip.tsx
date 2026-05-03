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
      <div className="intro-meta-strip__row grid w-full min-w-0 max-w-full grid-cols-[minmax(0,max-content)_minmax(0,1fr)] items-center gap-x-1.5 sm:gap-2">
        <span
          className={
            'intro-meta-strip__pill inline-flex max-w-[min(46vw,10.5rem)] min-w-0 items-center truncate rounded-full px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.1em] text-white sm:max-w-none sm:px-2.5 sm:text-[10px]'
          }
          style={{ background: 'var(--gov-primary, #003366)' }}
          title={INTRO_GLOBAL_PILL_LABEL}
        >
          {INTRO_GLOBAL_PILL_LABEL}
        </span>
        <div className="intro-meta-strip__actions flex min-w-0 items-center justify-end gap-0.5 sm:gap-1.5">
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
