'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ClaraVoiceState } from '@/types/clara';

export const useClaraVoice = () => {
  const [voiceState, setVoiceState] = useState<ClaraVoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    error: null
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const playRequestIdRef = useRef(0);
  const [speechRate, setSpeechRateState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.05;
    try {
      const raw = window.sessionStorage.getItem('clara_speech_rate_v1');
      if (raw === '1' || raw === '1.15') return Number(raw);
    } catch {
      // ignore
    }
    return 1.05;
  });

  useEffect(() => {
    // Initialize speech recognition (iOS 14.5+ oft `SpeechRecognition`, Desktop meist `webkitSpeechRecognition`)
    if (typeof window === 'undefined') return;
    const RecognitionCtor =
      'webkitSpeechRecognition' in window
        ? (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition
        : 'SpeechRecognition' in window
          ? (window as unknown as { SpeechRecognition: new () => SpeechRecognition }).SpeechRecognition
          : null;
    if (RecognitionCtor) {
      const recognition = new RecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'de-DE';

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setVoiceState(prev => ({ ...prev, transcript: finalTranscript }));
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setVoiceState(prev => ({
          ...prev,
          isListening: false,
          error: `Spracherkennung Fehler: ${event.error}`
        }));
      };

      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !voiceState.isListening) {
      recognitionRef.current.start();
    }
  }, [voiceState.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  }, [voiceState.isListening]);

  const stopSpeaking = useCallback(() => {
    playRequestIdRef.current += 1;
    const currentAudio = audioRef.current;
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch {
        // ignore
      }
      currentAudio.src = '';
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  const playTts = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;

      stopSpeaking();
      const requestId = ++playRequestIdRef.current;
      setVoiceState((prev) => ({ ...prev, isSpeaking: true, error: null }));

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, speed: speechRate }),
        });

        if (!res.ok) {
          let message = `TTS Fehler (${res.status})`;
          try {
            const json = await res.json();
            if (json?.error) message = json.error;
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        const blob = await res.blob();
        if (requestId !== playRequestIdRef.current) return;

        const objectUrl = URL.createObjectURL(blob);
        audioUrlRef.current = objectUrl;
        const audio = new Audio(objectUrl);
        audio.playbackRate = speechRate;
        audioRef.current = audio;

        audio.onended = () => {
          if (requestId !== playRequestIdRef.current) return;
          setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
        };
        audio.onerror = () => {
          if (requestId !== playRequestIdRef.current) return;
          setVoiceState((prev) => ({
            ...prev,
            isSpeaking: false,
            error: 'Audio konnte nicht abgespielt werden.',
          }));
        };

        await audio.play();
      } catch (e) {
        if (requestId !== playRequestIdRef.current) return;
        setVoiceState((prev) => ({
          ...prev,
          isSpeaking: false,
          error: e instanceof Error ? e.message : 'TTS nicht verfügbar',
        }));
      }
    },
    [stopSpeaking, speechRate],
  );

  const speak = useCallback((text: string) => {
    void playTts(text);
  }, [playTts]);

  /**
   * Mehrere kurze Äußerungen nacheinander (Browser queue), damit Pausen zwischen
   * Sinnabschnitten entstehen — klingt natürlicher als ein langer Monolog.
   */
  const speakParts = useCallback((parts: string[]) => {
    const cleaned = parts
      .map((p) => p.replace(/\s+/g, ' ').replace(/[*#_`]/g, '').trim())
      .filter((p) => p.length >= 2);
    if (!cleaned.length) return;
    void playTts(cleaned.join('\n\n'));
  }, [playTts]);

  /** Nach Verarbeitung leeren, damit `useEffect` bei gleichem Text erneut feuern kann und keine Doppel-Läufe entstehen. */
  const clearTranscript = useCallback(() => {
    setVoiceState((prev) => ({ ...prev, transcript: '' }));
  }, []);

  const setSpeechRate = useCallback((rate: 1 | 1.15) => {
    setSpeechRateState(rate);
    try {
      window.sessionStorage.setItem('clara_speech_rate_v1', String(rate));
    } catch {
      // ignore
    }
  }, []);

  return {
    voiceState,
    startListening,
    stopListening,
    speak,
    speakParts,
    stopSpeaking,
    clearTranscript,
    speechRate,
    setSpeechRate,
  };
};
