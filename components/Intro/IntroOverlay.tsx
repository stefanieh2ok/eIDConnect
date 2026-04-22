'use client';

/**
 * Single Source of Truth für die Produkteinführung (Kanal + Vorlesen).
 *
 * – Eine Intro-Logik: visuelle Schritte; optional dieselbe Führung per Vorlesen
 *   (Browser-Sprachsynthese über useClaraVoice, dieselbe Stimme wie im Clara-Dock).
 * – Kein separater „Clara-Intro-Modus“: nur der Schalter „Vorlesen aktivieren“.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useClaraVoice } from '@/hooks/useClaraVoice';

const SESSION_READ_ALOUD_KEY = 'eidconnect_intro_vorlesen_v1';

export type IntroOverlayContextValue = {
  /** „Vorlesen aktivieren“ – Standard AUS. */
  readAloud: boolean;
  setReadAloud: (v: boolean) => void;
  /** Spricht Fließtext (nur wenn readAloud true). */
  speakIntro: (plainText: string) => void;
  stopIntroSpeech: () => void;
};

const IntroOverlayContext = createContext<IntroOverlayContextValue | null>(null);

export function useOptionalIntroOverlay() {
  return useContext(IntroOverlayContext);
}

function IntroOverlayRoot({ children }: { children: React.ReactNode }) {
  const { speak, stopSpeaking } = useClaraVoice();
  const [readAloud, setReadAloudState] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem(SESSION_READ_ALOUD_KEY) === '1') {
        setReadAloudState(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const stopIntroSpeech = useCallback(() => {
    try {
      stopSpeaking();
    } catch {
      // ignore
    }
  }, [stopSpeaking]);

  const speakIntro = useCallback(
    (raw: string) => {
      if (!readAloud) return;
      const text = raw.replace(/\s+/g, ' ').replace(/[*#_`]/g, '').trim();
      if (text.length < 2) return;
      speak(text);
    },
    [readAloud, speak],
  );

  const setReadAloud = useCallback(
    (v: boolean) => {
      setReadAloudState(v);
      try {
        sessionStorage.setItem(SESSION_READ_ALOUD_KEY, v ? '1' : '0');
      } catch {
        // ignore
      }
      if (!v) stopIntroSpeech();
    },
    [stopIntroSpeech],
  );

  const value = useMemo(
    () => ({ readAloud, setReadAloud, speakIntro, stopIntroSpeech }),
    [readAloud, setReadAloud, speakIntro, stopIntroSpeech],
  );

  return <IntroOverlayContext.Provider value={value}>{children}</IntroOverlayContext.Provider>;
}

export const IntroOverlay = IntroOverlayRoot;
export default IntroOverlayRoot;

/** Optional: nur sichtbar, wenn <IntroOverlay> den Baum umschließt. */
type ReadAloudToggleProps = { /** Auf dunklem Intro-Hintergrund (z. B. oberer Balken) */ theme?: 'light' | 'dark' };

export function IntroReadAloudToggle({ theme = 'light' }: ReadAloudToggleProps = {}) {
  const ctx = useOptionalIntroOverlay();
  if (!ctx) return null;

  const { readAloud, setReadAloud } = ctx;
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
          ? 'inline-flex min-w-0 max-w-[10.5rem] items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-left text-[10px] font-semibold text-white/95 shadow-sm backdrop-blur-sm transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/50 sm:max-w-none sm:text-[11px]'
          : 'inline-flex min-w-0 max-w-[10.5rem] items-center gap-1.5 rounded-lg border border-[#0F172A]/12 bg-white/95 px-2 py-1 text-left text-[10px] font-semibold text-[#1E293B] shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#003366] sm:max-w-none sm:text-[11px]'
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
