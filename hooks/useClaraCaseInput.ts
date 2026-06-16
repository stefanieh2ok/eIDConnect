'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { planCivicCase, getExampleCases } from '@/lib/ai/claraCasePlanner';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import type { ClaraWegweiserMode } from '@/components/civic/ClaraWegweiser';

const SPEECH_UNSUPPORTED =
  'Spracheingabe wird von diesem Browser noch nicht unterstützt.';

type UseClaraCaseInputOptions = {
  du?: boolean;
  plz?: string;
  bundesland?: string;
  wohnort?: string;
  onPlanReady?: (plan: CivicCasePlanResult) => void;
};

export function useClaraCaseInput({
  du = true,
  plz,
  bundesland,
  wohnort,
  onPlanReady,
}: UseClaraCaseInputOptions) {
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [text, setText] = useState('');
  const [mode, setMode] = useState<ClaraWegweiserMode>('private');
  const [plan, setPlan] = useState<CivicCasePlanResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechListening, setSpeechListening] = useState(false);
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);

  const examples = getExampleCases();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const RecognitionCtor =
      'webkitSpeechRecognition' in window
        ? (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition })
            .webkitSpeechRecognition
        : 'SpeechRecognition' in window
          ? (window as unknown as { SpeechRecognition: new () => SpeechRecognition })
              .SpeechRecognition
          : null;
    if (!RecognitionCtor) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'de-DE';

    recognition.onstart = () => {
      setSpeechListening(true);
      setSpeechMessage(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      const trimmed = transcript.trim();
      if (trimmed) {
        setText((prev) => (prev.trim() ? `${prev.trim()} ${trimmed}` : trimmed));
        setSpeechMessage(null);
        requestAnimationFrame(() => textareaRef.current?.focus());
      }
    };

    recognition.onerror = () => {
      setSpeechListening(false);
      setSpeechMessage(SPEECH_UNSUPPORTED);
    };

    recognition.onend = () => {
      setSpeechListening(false);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  const runAnalysis = useCallback(
    async (inputText: string, inputMode: ClaraWegweiserMode) => {
      const trimmed = inputText.trim();
      if (!trimmed) return;
      setAnalyzing(true);
      try {
        const response = await fetch('/api/govdata/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: trimmed,
            mode: inputMode,
            plz,
            bundesland,
            wohnort,
          }),
        });
        const resolution = response.ok ? await response.json() : null;
        const result = planCivicCase(
          {
            text: trimmed,
            mode: inputMode,
            plz,
            bundesland,
            wohnort,
          },
          du,
          resolution ?? undefined,
        );
        setPlan(result);
        onPlanReady?.(result);
      } catch {
        const result = planCivicCase(
          {
            text: trimmed,
            mode: inputMode,
            plz,
            bundesland,
            wohnort,
          },
          du,
        );
        setPlan(result);
        onPlanReady?.(result);
      } finally {
        setAnalyzing(false);
      }
    },
    [plz, bundesland, wohnort, du, onPlanReady],
  );

  const loadExample = useCallback(
    (exampleId: string, autoRun = false) => {
      const ex = examples.find((e) => e.id === exampleId);
      if (!ex) return;
      setText(ex.text);
      setMode(ex.mode);
      if (autoRun) {
        runAnalysis(ex.text, ex.mode);
      }
    },
    [examples, runAnalysis],
  );

  const handleAnalyze = useCallback(() => runAnalysis(text, mode), [runAnalysis, text, mode]);

  const handleClear = useCallback(() => {
    setPlan(null);
    setText('');
  }, []);

  const focusInput = useCallback(() => {
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const appendTranscript = useCallback((chunk: string) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;
    setText((prev) => (prev.trim() ? `${prev.trim()} ${trimmed}` : trimmed));
  }, []);

  const startSpeechInput = useCallback(() => {
    if (!speechSupported || !recognitionRef.current) {
      setSpeechMessage(SPEECH_UNSUPPORTED);
      return;
    }
    if (speechListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      return;
    }
    setSpeechMessage(null);
    try {
      recognitionRef.current.start();
      textareaRef.current?.focus();
    } catch {
      setSpeechMessage(SPEECH_UNSUPPORTED);
      setSpeechListening(false);
    }
  }, [speechListening, speechSupported]);

  return {
    textareaId,
    textareaRef,
    text,
    setText,
    mode,
    setMode,
    plan,
    analyzing,
    examples,
    speechSupported,
    speechListening,
    speechMessage,
    runAnalysis,
    loadExample,
    handleAnalyze,
    handleClear,
    focusInput,
    appendTranscript,
    startSpeechInput,
    canSubmit: Boolean(text.trim()) && !analyzing,
  };
}

export type ClaraCaseInputController = ReturnType<typeof useClaraCaseInput>;
