'use client';

import React, { useState, useEffect } from 'react';
import { useClaraVoice } from '@/hooks/useClaraVoice';

/* Lavendel/Violett – spaciger Farbverlauf mit Tiefe */
const SPACY_GRADIENT = 'linear-gradient(160deg, #4C1D95 0%, #6D28D9 25%, #7C3AED 45%, #8B5CF6 65%, #A78BFA 85%, #C4B5FD 100%)';
const SPACY_GLOW = '0 0 24px rgba(139, 92, 246, 0.5), 0 0 48px rgba(124, 58, 237, 0.2), inset 0 1px 0 rgba(255,255,255,0.25)';
const BUBBLE_GRADIENT = 'linear-gradient(165deg, #5B21B6 0%, #7C3AED 30%, #8B5CF6 60%, #A78BFA 100%)';

interface ClaraFloatingButtonProps {
  onOpenClara: () => void;
  /** Wenn "absolute", wird der Button relativ zum Parent positioniert (z. B. im iPhone-Rahmen). */
  position?: 'fixed' | 'absolute';
}

const ClaraFloatingButton: React.FC<ClaraFloatingButtonProps> = ({ onOpenClara, position = 'fixed' }) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const { voiceState, speak } = useClaraVoice();
  const posClass = position === 'absolute' ? 'absolute bottom-0 right-0' : 'fixed bottom-24 right-4';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(true);
      speak("Hallo! Ich bin Clara, deine KI-Assistentin. Chatte oder sprich mit mir – alles in einem.");
    }, 3000);
    return () => clearTimeout(timer);
  }, [speak]);

  useEffect(() => {
    if (showGreeting) {
      const t = setTimeout(() => setShowGreeting(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showGreeting]);

  return (
    <>
      <div className={`${posClass} z-40`}>
        <div className="relative">
          <button
            onClick={onOpenClara}
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              font-semibold text-sm text-white
              transition-all duration-300 hover:scale-105
              border border-white/40
              ${voiceState.isListening ? 'animate-pulse' : ''}
            `}
            style={{
              background: SPACY_GRADIENT,
              boxShadow: SPACY_GLOW,
            }}
            title="Clara – KI-Assistent (Chatten & Sprechen)"
          >
            Clara
          </button>
          {voiceState.isListening && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse border-2 border-white">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          )}
        </div>
      </div>

      {showGreeting && (
        <div className={`${position === 'absolute' ? 'absolute bottom-full right-0 mb-2' : 'fixed bottom-36 right-4'} z-50 animate-slide-up`}>
          <div
            className="rounded-2xl p-4 shadow-2xl max-w-xs text-white border border-white/30"
            style={{
              background: BUBBLE_GRADIENT,
              boxShadow: '0 12px 40px rgba(91, 33, 182, 0.45), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <p className="text-sm font-semibold mb-1">Clara</p>
            <p className="text-xs opacity-95 mb-3">
              KI-Agent (EU AI Act). Chatten und Sprechen – stelle mir deine Fragen.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onOpenClara(); setShowGreeting(false); }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white/25 hover:bg-white/35 border border-white/40 transition-colors backdrop-blur-sm"
              >
                Öffnen
              </button>
              <button
                onClick={() => setShowGreeting(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/40 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-violet-700" />
        </div>
      )}
    </>
  );
};

export default ClaraFloatingButton;
