'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import { useClaraVoice } from '@/hooks/useClaraVoice';

export type ClaraVoiceApi = ReturnType<typeof useClaraVoice>;

const ClaraVoiceContext = createContext<ClaraVoiceApi | null>(null);

/** Eine gemeinsame TTS-/Mic-Instanz für Dock, Voice-UI und Intro — wichtig für iOS (State, kein Doppel-Hook). */
export function ClaraVoiceProvider({ children }: { children: ReactNode }) {
  const api = useClaraVoice();
  return <ClaraVoiceContext.Provider value={api}>{children}</ClaraVoiceContext.Provider>;
}

export function useClaraVoiceContext(): ClaraVoiceApi {
  const ctx = useContext(ClaraVoiceContext);
  if (!ctx) {
    throw new Error('useClaraVoiceContext requires ClaraVoiceProvider');
  }
  return ctx;
}
