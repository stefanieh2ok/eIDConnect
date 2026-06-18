'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { planCivicCase, getExampleCases } from '@/lib/ai/claraCasePlanner';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import type { ClaraWegweiserMode } from '@/components/civic/ClaraWegweiser';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import { getJourneyTemplateById } from '@/lib/civic/civicJourneyTemplates';
import { resolvePlannerIdentityContext } from '@/lib/civic/demoCivicContext';
import { resolveCivicJourney } from '@/lib/civic/civicJourneyResolver';
import {
  buildGuidedIntake,
  formatIntakeAnswerFacts,
  intakeAnswersToContextText,
  type GuidedIntakeResult,
  type IntakeAnswerMap,
} from '@/lib/civic/civicGuidedIntake';

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
  const [mode, setMode] = useState<ClaraWegweiserMode>('unsure');
  const [journeyHint, setJourneyHint] = useState<CivicJourneyId | undefined>(undefined);
  const [plan, setPlan] = useState<CivicCasePlanResult | null>(null);
  const [guidedIntake, setGuidedIntake] = useState<GuidedIntakeResult | null>(null);
  const [intakeAnswers, setIntakeAnswers] = useState<IntakeAnswerMap>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechListening, setSpeechListening] = useState(false);
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);

  const examples = getExampleCases();

  const syncTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(Math.max(el.scrollHeight, 96), 200);
    el.style.height = `${next}px`;
  }, []);

  useEffect(() => {
    syncTextareaHeight();
  }, [text, syncTextareaHeight]);

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
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
          syncTextareaHeight();
        });
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
    async (
      inputText: string,
      inputMode: ClaraWegweiserMode,
      activeIntake: GuidedIntakeResult | null,
      answers: IntakeAnswerMap,
    ) => {
      const trimmed = inputText.trim();
      if (!trimmed) return;
      setAnalyzing(true);
      const identity = resolvePlannerIdentityContext({ plz, bundesland, wohnort });
      const answerFacts = activeIntake
        ? formatIntakeAnswerFacts(answers, activeIntake.questions)
        : [];
      const enrichedText = `${trimmed} ${intakeAnswersToContextText(answers)}`.trim();
      const effectiveJourneyHint = activeIntake?.journeyId ?? journeyHint;

      const plannerInput = {
        text: enrichedText,
        mode: inputMode,
        plz,
        bundesland,
        wohnort,
        journeyHint: effectiveJourneyHint ?? undefined,
        intakeAnswers: answers,
        intakeAnswerFacts: answerFacts.length ? answerFacts : undefined,
        safeGuidance: activeIntake?.safeGuidance,
        safeGuidanceSteps: activeIntake?.safeGuidanceSteps,
        integrityFlags: activeIntake?.integrityFlags,
      };

      try {
        const response = await fetch('/api/govdata/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: enrichedText,
            mode: inputMode,
            plz,
            bundesland,
            wohnort,
          }),
        });
        const resolution = response.ok ? await response.json() : null;
        const result = planCivicCase(plannerInput, du, resolution ?? undefined, identity);
        setPlan(result);
        setGuidedIntake(null);
        onPlanReady?.(result);
      } catch {
        const result = planCivicCase(plannerInput, du, undefined, identity);
        setPlan(result);
        setGuidedIntake(null);
        onPlanReady?.(result);
      } finally {
        setAnalyzing(false);
      }
    },
    [plz, bundesland, wohnort, du, onPlanReady, journeyHint],
  );

  const startGuidedIntake = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const identity = resolvePlannerIdentityContext({ plz, bundesland, wohnort });
    const journey = resolveCivicJourney(trimmed, mode, identity, du, journeyHint);
    const intake = buildGuidedIntake(trimmed, journey, identity, du, journeyHint);
    setGuidedIntake(intake);
    setIntakeAnswers({});
    setPlan(null);
  }, [text, mode, du, journeyHint, plz, bundesland, wohnort]);

  const submitPlanWithAnswers = useCallback(() => {
    if (!guidedIntake) {
      runAnalysis(text, mode, null, {});
      return;
    }
    runAnalysis(text, mode, guidedIntake, intakeAnswers);
  }, [guidedIntake, intakeAnswers, runAnalysis, text, mode]);

  const submitPlanSkip = useCallback(() => {
    runAnalysis(text, mode, guidedIntake, {});
  }, [guidedIntake, runAnalysis, text, mode]);

  const setIntakeAnswer = useCallback((questionId: string, value: string) => {
    setIntakeAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const selectClassifierJourney = useCallback(
    (journeyId: CivicJourneyId) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setJourneyHint(journeyId);
      const template = getJourneyTemplateById(journeyId);
      if (template) {
        setMode(template.defaultMode === 'business' ? 'business' : 'private');
      }
      const identity = resolvePlannerIdentityContext({ plz, bundesland, wohnort });
      const journey = resolveCivicJourney(trimmed, mode, identity, du, journeyId);
      const intake = buildGuidedIntake(trimmed, journey, identity, du, journeyId);
      setGuidedIntake(intake);
      setIntakeAnswers({});
    },
    [text, mode, du, plz, bundesland, wohnort],
  );

  const loadExample = useCallback(
    (exampleId: string, autoRun = false) => {
      const ex = examples.find((e) => e.id === exampleId);
      if (!ex) return;
      setText(ex.text);
      setMode(ex.mode);
      setJourneyHint('journeyId' in ex ? ex.journeyId : undefined);
      setGuidedIntake(null);
      setIntakeAnswers({});
      if (autoRun) {
        startGuidedIntake();
      }
    },
    [examples, startGuidedIntake],
  );

  const loadJourneyQuickStart = useCallback(
    (journeyId: CivicJourneyId, presetText: string, journeyMode?: ClaraWegweiserMode) => {
      setText(presetText);
      setJourneyHint(journeyId);
      setGuidedIntake(null);
      setIntakeAnswers({});
      const template = getJourneyTemplateById(journeyId);
      if (journeyMode) {
        setMode(journeyMode);
      } else if (template) {
        setMode(template.defaultMode === 'business' ? 'business' : 'private');
      }
      requestAnimationFrame(() => textareaRef.current?.focus());
    },
    [],
  );

  const handleAnalyze = useCallback(() => startGuidedIntake(), [startGuidedIntake]);

  const handleClear = useCallback(() => {
    setPlan(null);
    setGuidedIntake(null);
    setIntakeAnswers({});
    setText('');
    setJourneyHint(undefined);
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
    guidedIntake,
    intakeAnswers,
    setIntakeAnswer,
    selectClassifierJourney,
    submitPlanWithAnswers,
    submitPlanSkip,
    analyzing,
    examples,
    speechSupported,
    speechListening,
    speechMessage,
    runAnalysis,
    loadExample,
    loadJourneyQuickStart,
    journeyHint,
    setJourneyHint,
    handleAnalyze,
    handleClear,
    focusInput,
    appendTranscript,
    startSpeechInput,
    canSubmit: Boolean(text.trim()) && !analyzing,
  };
}

export type ClaraCaseInputController = ReturnType<typeof useClaraCaseInput>;
