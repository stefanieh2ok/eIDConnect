'use client';

/**
 * Einführung: eine Clarastimme (opt-in) + geteilte TTS-Engine. Kein paralleles System,
 * doppelter Start wird über einen Narration-Key pro Folie vermieden.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useClaraVoiceContext } from '@/components/Clara/ClaraVoiceContext';

const SESSION_AUDIO = 'eidconnect_intro_audio_v1';

export type IntroOverlayContextValue = {
  /** Standard an (pro Browser-Sitzung), bis Nutzer explizit stumm schaltet (`sessionStorage`). */
  readAloud: boolean;
  setReadAloud: (v: boolean) => void;
  /** TTS (Intro / Claras Stimme) spielt gerade ab — für Audio-Status-UI. */
  isIntroSpeaking: boolean;
  /**
   * @param key optional stabil pro Folie, verhindert doppelte Abgabe trotz Strict Mode/Remount
   */
  speakIntro: (plainText: string, key?: string) => void;
  /**
   * Wie `speakIntro`, aber mit kurzen, getrennten Sätzen für TTS (Pause zwischen Teilen).
   */
  speakIntroParts: (plainParts: string[], key?: string) => void;
  stopIntroSpeech: () => void;
};

const IntroOverlayContext = createContext<IntroOverlayContextValue | null>(null);

/**
 * Nur Sprech-API + readAloud — **stabile Referenz**, solange sich nicht `readAloud`
 * oder die Speak-Callbacks ändern. Wird **nicht** bei jedem TTS-`isSpeaking`-Tick neu erzeugt.
 * Verhindert, dass Walkthrough-`useEffect`-Cleanups die Mehrteil-Wiedergabe abbrechen.
 */
type IntroSpeakApi = Pick<
  IntroOverlayContextValue,
  'readAloud' | 'setReadAloud' | 'speakIntro' | 'speakIntroParts' | 'stopIntroSpeech'
>;
const IntroSpeakApiContext = createContext<IntroSpeakApi | null>(null);
const IntroIsSpeakingContext = createContext<boolean>(false);

export function useIntroSpeakApi(): IntroSpeakApi | null {
  return useContext(IntroSpeakApiContext);
}

export function useIntroIsSpeaking(): boolean {
  return useContext(IntroIsSpeakingContext);
}

export function useOptionalIntroOverlay() {
  const api = useContext(IntroSpeakApiContext);
  const isIntroSpeaking = useContext(IntroIsSpeakingContext);
  if (!api) return null;
  return { ...api, isIntroSpeaking };
}

function IntroOverlayRoot({ children }: { children: React.ReactNode }) {
  const { speak, speakParts, stopSpeaking, tryResumePendingAudioFromUserGesture, voiceState } =
    useClaraVoiceContext();
  const isIntroSpeaking = voiceState.isSpeaking;
  const [readAloud, setReadAloudState] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return sessionStorage.getItem(SESSION_AUDIO) !== '0';
    } catch {
      return true;
    }
  });
  const lastNarrationKeyRef = useRef<string | null>(null);

  const stopIntroSpeech = useCallback(() => {
    try {
      stopSpeaking();
    } catch {
      // ignore
    }
    // Sonst blockiert derselbe `key` ein erneutes `speakIntroParts` (z. B. eID nach vorherigem Stopp).
    lastNarrationKeyRef.current = null;
  }, [stopSpeaking]);

  const speakIntro = useCallback(
    (raw: string, key?: string) => {
      if (!readAloud) return;
      if (key != null && key !== '' && lastNarrationKeyRef.current === key) {
        return;
      }
      if (key != null && key !== '') {
        lastNarrationKeyRef.current = key;
      }
      const text = raw.replace(/\s+/g, ' ').replace(/[*#_`]/g, '').trim();
      if (text.length < 2) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => speak(text));
      });
    },
    [readAloud, speak],
  );

  const speakIntroParts = useCallback(
    (plainParts: string[], key?: string) => {
      if (!readAloud) return;
      if (key != null && key !== '' && lastNarrationKeyRef.current === key) {
        return;
      }
      if (key != null && key !== '') {
        lastNarrationKeyRef.current = key;
      }
      const parts = plainParts
        .map((p) => p.replace(/\s+/g, ' ').replace(/[*#_`]/g, '').trim())
        .filter((p) => p.length >= 2);
      if (parts.length < 1) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (parts.length === 1) {
            speak(parts[0]!);
          } else {
            speakParts(parts);
          }
        });
      });
    },
    [readAloud, speak, speakParts],
  );

  const setReadAloud = useCallback(
    (v: boolean) => {
      if (v) {
        tryResumePendingAudioFromUserGesture();
      }
      setReadAloudState(v);
      try {
        sessionStorage.setItem(SESSION_AUDIO, v ? '1' : '0');
      } catch {
        // ignore
      }
      lastNarrationKeyRef.current = null;
      if (!v) {
        stopIntroSpeech();
      }
    },
    [stopIntroSpeech, tryResumePendingAudioFromUserGesture],
  );

  const speakApi = useMemo(
    () => ({
      readAloud,
      setReadAloud,
      speakIntro,
      speakIntroParts,
      stopIntroSpeech,
    }),
    [readAloud, setReadAloud, speakIntro, speakIntroParts, stopIntroSpeech],
  );

  const merged = useMemo(
    () => ({ ...speakApi, isIntroSpeaking }),
    [speakApi, isIntroSpeaking],
  );

  return (
    <IntroSpeakApiContext.Provider value={speakApi}>
      <IntroIsSpeakingContext.Provider value={isIntroSpeaking}>
        <IntroOverlayContext.Provider value={merged}>{children}</IntroOverlayContext.Provider>
      </IntroIsSpeakingContext.Provider>
    </IntroSpeakApiContext.Provider>
  );
}

export const IntroOverlay = IntroOverlayRoot;
export default IntroOverlayRoot;

type ReadAloudToggleProps = { theme?: 'light' | 'dark' };

/**
 * Fläche und Rand wie `IntroAudioStatusButton` (theme dark) — für z. B. Clara-Mic in derselben Leiste.
 */
export const INTRO_META_ICON_BUTTON_DARK_CLASS =
  'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition border-white/25 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/45';

export const INTRO_META_ICON_BUTTON_LIGHT_CLASS =
  'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition border-slate-300/90 text-slate-600/90 hover:text-slate-900 hover:bg-slate-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-400';

/** Kompaktere Toolbar auf schmalen Phones (Walkthrough), gleiche Fläche wie 7×7-Close. */
export const INTRO_META_ICON_BUTTON_DARK_COMPACT_CLASS =
  'inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition border-white/25 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/45';

export const INTRO_META_ICON_BUTTON_LIGHT_COMPACT_CLASS =
  'inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition border-slate-300/90 text-slate-600/90 hover:text-slate-900 hover:bg-slate-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-400';

/** Kompaktes Text-Label für Vorlesen (Legacy; Header nutzt bevorzugt `IntroAudioStatusButton`). */
export function IntroReadAloudToggle({ theme = 'light' }: ReadAloudToggleProps = {}) {
  const api = useIntroSpeakApi();
  if (!api) return null;

  const { readAloud, setReadAloud } = api;
  const onDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={readAloud}
      aria-label={readAloud ? 'Vorlesen deaktivieren' : 'Vorlesen aktivieren'}
      onClick={() => setReadAloud(!readAloud)}
      className={
        onDark
          ? 'inline-flex min-w-0 max-w-[9.5rem] items-center gap-1.5 rounded-lg border border-white/20 bg-white/12 px-2 py-1 text-left text-[10px] font-semibold text-white/95 shadow-sm transition hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/50 sm:max-w-none sm:text-[11px]'
          : 'inline-flex min-w-0 max-w-[9.5rem] items-center gap-1.5 rounded-lg border border-[#0F172A]/12 bg-white/95 px-2 py-1 text-left text-[10px] font-semibold text-[#1E293B] shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#003366] sm:max-w-none sm:text-[11px]'
      }
    >
      {readAloud ? (
        <Volume2 className={`h-3.5 w-3.5 shrink-0 ${onDark ? 'text-sky-200' : 'text-[#003366]'}`} aria-hidden />
      ) : (
        <VolumeX className={`h-3.5 w-3.5 shrink-0 ${onDark ? 'text-white/50' : 'text-slate-400'}`} aria-hidden />
      )}
      <span className="min-w-0 leading-tight [overflow-wrap:anywhere]">
        {readAloud ? 'Vorlesen deaktivieren' : 'Vorlesen aktivieren'}
      </span>
    </button>
  );
}

type IntroAudioStatusTheme = 'dark' | 'light';

/**
 * Dünnes Lautsprecher-Icon: AN (Volume2) / AUS (VolumeX) — gleiche Session-Logik wie `readAloud`.
 * Kurz aufleuchtender Rand, wenn TTS startet (siehe `.intro-audio-status-pulse` in globals.css).
 */
type IntroToolbarDensity = 'default' | 'compact';

export function IntroAudioStatusButton({
  theme = 'dark',
  density = 'default',
}: { theme?: IntroAudioStatusTheme; density?: IntroToolbarDensity } = {}) {
  const api = useIntroSpeakApi();
  const isIntroSpeaking = useIntroIsSpeaking();
  const [pulse, setPulse] = useState(false);
  const wasSpeakingRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.matchMedia !== 'function') {
      setReducedMotion(false);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const speakingForPulse = isIntroSpeaking;
  useEffect(() => {
    if (!api) return;
    if (speakingForPulse && !wasSpeakingRef.current) {
      wasSpeakingRef.current = true;
      if (!reducedMotion) {
        setPulse(true);
        const t = window.setTimeout(() => setPulse(false), 1200);
        return () => clearTimeout(t);
      }
    }
    if (!speakingForPulse) {
      wasSpeakingRef.current = false;
    }
  }, [api, speakingForPulse, reducedMotion]);

  if (!api) return null;

  const { readAloud, setReadAloud } = api;
  const onDark = theme === 'dark';
  const title = readAloud ? 'Audio ausschalten' : 'Audio einschalten';
  const activeRing =
    readAloud && isIntroSpeaking
      ? onDark
        ? 'ring-1 ring-sky-300/40'
        : 'ring-1 ring-sky-600/35'
      : '';
  const compact = density === 'compact';
  const btnBase = onDark
    ? compact
      ? INTRO_META_ICON_BUTTON_DARK_COMPACT_CLASS
      : INTRO_META_ICON_BUTTON_DARK_CLASS
    : compact
      ? INTRO_META_ICON_BUTTON_LIGHT_COMPACT_CLASS
      : 'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition border-slate-300/90 text-slate-600/90 hover:text-slate-900 hover:bg-slate-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-400';
  const iconSz = compact ? 'h-4 w-4' : 'h-[18px] w-[18px]';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={readAloud}
      aria-label={title}
      title={title}
      onClick={() => setReadAloud(!readAloud)}
      className={[
        btnBase,
        activeRing,
        readAloud && isIntroSpeaking && onDark ? 'text-sky-100/90' : '',
        readAloud && isIntroSpeaking && !onDark ? 'text-sky-700' : '',
        pulse ? 'intro-audio-status-pulse' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {readAloud ? (
        <Volume2 className={`${iconSz} shrink-0 ${onDark ? '' : 'text-slate-700'}`} strokeWidth={1.5} aria-hidden />
      ) : (
        <VolumeX className={`${iconSz} shrink-0 ${onDark ? 'text-white/55' : 'text-slate-400'}`} strokeWidth={1.5} aria-hidden />
      )}
    </button>
  );
}

export function IntroSpeechSpeedToggle({
  theme = 'dark',
  density = 'default',
}: { theme?: IntroAudioStatusTheme; density?: IntroToolbarDensity } = {}) {
  const { speechRate, setSpeechRate } = useClaraVoiceContext();
  const onDark = theme === 'dark';
  const compact = density === 'compact';

  const baseCls = onDark
    ? `inline-flex items-center rounded-full border border-white/20 bg-white/8 font-semibold text-white/85 ${
        compact ? 'h-7 p-0.5 text-[9px]' : 'h-8 p-0.5 text-[10px]'
      }`
    : `inline-flex items-center rounded-full border border-slate-300/90 bg-white font-semibold text-slate-600 ${
        compact ? 'h-7 p-0.5 text-[9px]' : 'h-8 p-0.5 text-[10px]'
      }`;

  const btnCls = (active: boolean) =>
    `inline-flex items-center justify-center rounded-full leading-none transition ${
      compact ? 'min-w-[31px] px-1.5 py-0.5' : 'min-w-[38px] px-2 py-1'
    } ` +
    (active
      ? onDark
        ? 'bg-white text-[#0F172A]'
        : 'bg-[#003366] text-white'
      : onDark
        ? 'text-white/80 hover:bg-white/12'
        : 'text-slate-600 hover:bg-slate-100');

  const active = speechRate >= 1.12 ? 1.15 : 1;

  return (
    <div className={baseCls} role="group" aria-label="Clara Sprechgeschwindigkeit">
      <button
        type="button"
        className={btnCls(active === 1)}
        onClick={() => setSpeechRate(1)}
        aria-pressed={active === 1}
        title="Clara auf 1x"
      >
        1x
      </button>
      <button
        type="button"
        className={btnCls(active === 1.15)}
        onClick={() => setSpeechRate(1.15)}
        aria-pressed={active === 1.15}
        title="Clara auf 1.15x"
      >
        1.15x
      </button>
    </div>
  );
}
