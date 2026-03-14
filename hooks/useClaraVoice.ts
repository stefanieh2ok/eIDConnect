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
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition();
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      };

      utterance.onerror = (event) => {
        setVoiceState(prev => ({ 
          ...prev, 
          isSpeaking: false, 
          error: `Sprachsynthese Fehler: ${event.error}` 
        }));
      };

      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
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
    stopSpeaking
  };
};
