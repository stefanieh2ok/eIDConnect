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
export function IntroReadAloudToggle() {
  const ctx = useOptionalIntroOverlay();
  if (!ctx) return null;

  const { readAloud, setReadAloud } = ctx;

  return (
    <div className="mt-2 flex items-center justify-end border-t border-[#0F172A]/10 pt-2">
      <button
        type="button"
        role="switch"
        aria-checked={readAloud}
        aria-label={readAloud ? 'Vorlesen ist aktiv' : 'Vorlesen ist aus'}
        onClick={() => setReadAloud(!readAloud)}
        className="inline-flex max-w-full items-center gap-2 rounded-lg border border-[#0F172A]/12 bg-white/90 px-2.5 py-1.5 text-left text-[10px] font-semibold text-[#1E293B] shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#003366]"
      >
        {readAloud ? (
          <Volume2 className="h-3.5 w-3.5 shrink-0 text-[#003366]" aria-hidden />
        ) : (
          <VolumeX className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
        )}
        <span className="leading-snug">
          Vorlesen aktivieren
          <span className="mt-0.5 block text-[9px] font-normal text-[#64748B]">
            {readAloud ? 'Clara liest die Schritte mit' : 'Aus: nur Anzeige'}
          </span>
        </span>
      </button>
    </div>
  );
}
