'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ClaraVoiceState } from '@/types/clara';

/**
 * de-DE bevorzugen (Hedda, etc.); optional explicit Google/Microsoft-Namen in Kleinbuchstaben.
 * Wichtig: Ohne Stimmauswahl spricht manche Browser-Engine (Safari) nicht zuverlässig.
 */
function pickGermanVoice(
  list: ReadonlyArray<SpeechSynthesisVoice>,
): SpeechSynthesisVoice | null {
  if (!list.length) return null;
  const de = (lang: string) => lang.toLowerCase().replace('_', '-').startsWith('de');
  return (
    list.find((v) => de(v.lang) && /hedda|katja|yannick|amala|conrad|zira|google\s*de|microsoft.*de/gi.test(v.name)) ??
    list.find((v) => de(v.lang)) ??
    null
  );
}

/**
 * Stimmen synchron holen (wichtig für iOS Safari: `speak` muss in derselben
 * User-Geste wie `getVoices`/Queue laufen — `voiceschanged` + Timeout kommt zu spät).
 */
function voicesForUtteranceNow(synth: SpeechSynthesis): SpeechSynthesisVoice[] {
  let v = synth.getVoices();
  if (v.length) return [...v];
  try {
    void synth.getVoices();
  } catch {
    /* ignore */
  }
  v = synth.getVoices();
  return [...v];
}

export const useClaraVoice = () => {
  const [voiceState, setVoiceState] = useState<ClaraVoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    error: null
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) {
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();

    const go = (voices: SpeechSynthesisVoice[]) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      /** Eher ruhig und freundlich, nicht „Aktions-News“. */
      /** Etwas ruhiger für bessere Satzgrenzen bei TTS. */
      utterance.rate = 0.86;
      utterance.pitch = 1.02;
      utterance.volume = 0.92;
      const de = pickGermanVoice(voices);
      if (de) {
        utterance.voice = de;
        utterance.lang = de.lang || 'de-DE';
      }

      utterance.onstart = () => {
        try {
          if (synth.paused) synth.resume();
        } catch {
          /* iOS/Chrome: nötig, damit die Ausgabe startet */
        }
        setVoiceState((prev) => ({ ...prev, isSpeaking: true, error: null }));
      };

      utterance.onend = () => {
        setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
      };

      utterance.onerror = (event) => {
        setVoiceState((prev) => ({
          ...prev,
          isSpeaking: false,
          error: `Sprachsynthese: ${event.error}`,
        }));
      };

      synthesisRef.current = utterance;
      try {
        synth.speak(utterance);
        try {
          if (synth.paused) synth.resume();
        } catch {
          /* iOS/WKWebView */
        }
      } catch (e) {
        setVoiceState((prev) => ({
          ...prev,
          isSpeaking: false,
          error: e instanceof Error ? e.message : 'Sprachsynthese nicht verfügbar',
        }));
      }
    };

    go(voicesForUtteranceNow(synth));
  }, []);

  /**
   * Mehrere kurze Äußerungen nacheinander (Browser queue), damit Pausen zwischen
   * Sinnabschnitten entstehen — klingt natürlicher als ein langer Monolog.
   */
  const speakParts = useCallback((parts: string[]) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    const cleaned = parts
      .map((p) => p.replace(/\s+/g, ' ').replace(/[*#_`]/g, '').trim())
      .filter((p) => p.length >= 2);
    if (!cleaned.length) {
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();

    const voices = voicesForUtteranceNow(synth);
    const de = pickGermanVoice(voices);
    cleaned.forEach((text, idx) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = 0.86;
        utterance.pitch = 1.02;
        utterance.volume = 0.92;
        if (de) {
          utterance.voice = de;
          utterance.lang = de.lang || 'de-DE';
        }

        utterance.onstart = () => {
          try {
            if (synth.paused) synth.resume();
          } catch {
            /* ignore */
          }
          if (idx === 0) {
            setVoiceState((prev) => ({ ...prev, isSpeaking: true, error: null }));
          }
        };

        utterance.onend = () => {
          if (idx === cleaned.length - 1) {
            setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
          }
        };

        utterance.onerror = (event) => {
          setVoiceState((prev) => ({
            ...prev,
            isSpeaking: false,
            error: `Sprachsynthese: ${event.error}`,
          }));
        };

        try {
          synth.speak(utterance);
        } catch (e) {
          setVoiceState((prev) => ({
            ...prev,
            isSpeaking: false,
            error: e instanceof Error ? e.message : 'Sprachsynthese nicht verfügbar',
          }));
        }
      });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  return {
    voiceState,
    startListening,
    stopListening,
    speak,
    speakParts,
    stopSpeaking
  };
};
