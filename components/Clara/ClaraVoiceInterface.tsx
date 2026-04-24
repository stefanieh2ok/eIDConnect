'use client';

import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Mic, MicOff, MessageCircle, X } from 'lucide-react';
import { useClaraVoice } from '@/hooks/useClaraVoice';
import { ClaraAI } from '@/services/claraAI';
import { useApp } from '@/context/AppContext';
import {
  anredeVoiceUnrecognizedLine,
  introEntryVoiceUnrecognizedLine,
  matchAnredeFromSpeech,
  matchIntroEntryBranchFromSpeech,
} from '@/lib/introVoiceIntents';
import {
  ANREDE_VOICE_PROMPT,
  EID_VOICE_PROMPT_DU,
  EID_VOICE_PROMPT_SIE,
  ENTRY_VOICE_PROMPT_DU,
  ENTRY_VOICE_PROMPT_SIE,
} from '@/lib/claraVoiceOpenPrompts';

const LAVENDER = { bg: '#F5F0FF', border: '#E6E6FA', text: '#6B5B95', header: '#9370DB', bubble: '#EDE8F5' };

/** Pre-Login: kein App-Standard-Gruß; Werte siehe ClaraDock / BuergerApp. */
export type PreLoginVoicePhase = 'anrede' | 'entry' | 'eid' | null;

interface ClaraVoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  currentCard?: any;
  /** Pre-Login: Phasen-Prompt statt `generateVoiceGreeting`; `null` = eingeloggte App. */
  preLoginVoicePhase?: PreLoginVoicePhase;
  onAnredeVoiceChoice?: (choice: 'du' | 'sie') => void;
  onIntroEntryVoiceChoice?: (choice: 'start' | 'direct') => void;
  /** Optionaler Fallback: wenn Voice nicht funktioniert, in den Text-Chat wechseln. */
  onSwitchToChat?: () => void;
  /**
   * Begrüßung wird in ClaraDock per User-Geste gesprochen (iOS); hier nur Chat-Zeile setzen.
   * `voiceOpenNonce` pro Öffnung erhöhen, damit der Effekt zuverlässig feuert.
   */
  voiceOpenNonce?: number;
  openingSeedLine?: string | null;
  /**
   * `absolute`: Overlay an den nächsten `relative`-Vorfahren (z. B. App-/Device-Frame) — vermeidet
   * Viewport-Sprünge im Walkthrough. `fixed`: volles Browser-Fenster (z. B. LiveSection).
   */
  backdropPosition?: 'fixed' | 'absolute';
}

function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return (
    'webkitSpeechRecognition' in window ||
    'SpeechRecognition' in window
  );
}

const ClaraVoiceInterface: React.FC<ClaraVoiceInterfaceProps> = ({
  isOpen,
  onClose,
  currentCard,
  preLoginVoicePhase = null,
  onAnredeVoiceChoice,
  onIntroEntryVoiceChoice,
  onSwitchToChat,
  backdropPosition = 'fixed',
  voiceOpenNonce = 0,
  openingSeedLine = null,
}) => {
  const { state } = useApp();
  const [conversation, setConversation] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { voiceState, startListening, stopListening, speak, stopSpeaking } = useClaraVoice();

  const addressMode = state.anrede === 'sie' ? 'sie' : 'du';
  const eidVoicePrompt = useMemo(
    () => (addressMode === 'sie' ? EID_VOICE_PROMPT_SIE : EID_VOICE_PROMPT_DU),
    [addressMode],
  );
  const claraAI = useMemo(
    () => new ClaraAI(state.preferences, state.consentClaraPersonalization, addressMode),
    [state.preferences, state.consentClaraPersonalization, addressMode],
  );

  const speechSupported = useMemo(() => isSpeechRecognitionSupported(), []);
  const micBlocked =
    typeof voiceState.error === 'string' &&
    /not-allowed|denied|service-not-allowed/i.test(voiceState.error);
  const isAppVoiceGreeting = preLoginVoicePhase == null;

  useLayoutEffect(() => {
    if (isOpen) {
      setConversation([]);
    }
  }, [isOpen, preLoginVoicePhase]);

  /** Erste Zeile aus Parent (Dock): TTS läuft dort synchron zur Mic-Geste — wichtig für iOS Safari. */
  useLayoutEffect(() => {
    if (!isOpen || voiceOpenNonce < 1) return;
    if (openingSeedLine != null && openingSeedLine.trim() !== '') {
      setConversation([openingSeedLine]);
    }
  }, [isOpen, voiceOpenNonce, openingSeedLine]);

  useEffect(() => {
    if (voiceState.transcript) {
      handleVoiceInput(voiceState.transcript);
    }
  }, [voiceState.transcript]);

  // Beim Schliessen Sprachausgabe + Mic stoppen, damit nichts im Hintergrund weiter redet.
  useEffect(() => {
    if (!isOpen) {
      try {
        stopSpeaking();
      } catch {
        // ignore
      }
    }
  }, [isOpen, stopSpeaking]);

  const handleVoiceInput = async (transcript: string) => {
    setConversation((prev) => [...prev, `Du: ${transcript}`]);
    setIsProcessing(true);

    if (preLoginVoicePhase === 'anrede') {
      const pick = matchAnredeFromSpeech(transcript);
      if (pick && onAnredeVoiceChoice) {
        onAnredeVoiceChoice(pick);
        const conf =
          pick === 'du'
            ? 'Alles klar, ich nutze ab jetzt die Du-Form für dich.'
            : 'Gern, ich formuliere in der Sie-Form.';
        setTimeout(() => {
          setConversation((prev) => [...prev, `Clara: ${conf}`]);
          speak(conf);
          setIsProcessing(false);
        }, 200);
        return;
      }
      const hint = anredeVoiceUnrecognizedLine();
      setTimeout(() => {
        setConversation((prev) => [...prev, `Clara: ${hint}`]);
        speak(hint);
        setIsProcessing(false);
      }, 200);
      return;
    }

    if (preLoginVoicePhase === 'entry') {
      const pick = matchIntroEntryBranchFromSpeech(transcript);
      if (pick && onIntroEntryVoiceChoice) {
        onIntroEntryVoiceChoice(pick);
        const conf =
          pick === 'start'
            ? addressMode === 'sie'
              ? 'Gut, ich übernehme. Bitte bestätigen Sie mit dem Button „Einführung starten“.'
              : 'Gut, ich übernehme. Bitte bestätig mit dem Button „Einführung starten“.'
            : addressMode === 'sie'
              ? 'Gut, ich übernehme. Bitte bestätigen Sie mit „Direkt zur App“.'
              : 'Gut, ich übernehme. Bitte bestätig mit „Direkt zur App“.';
        setTimeout(() => {
          setConversation((prev) => [...prev, `Clara: ${conf}`]);
          speak(conf);
          setIsProcessing(false);
        }, 200);
        return;
      }
      const hint = introEntryVoiceUnrecognizedLine(addressMode !== 'sie');
      setTimeout(() => {
        setConversation((prev) => [...prev, `Clara: ${hint}`]);
        speak(hint);
        setIsProcessing(false);
      }, 200);
      return;
    }

    if (preLoginVoicePhase === 'eid') {
      let response = '';
      try {
        response = await claraAI.generateChatResponse(transcript, currentCard);
      } catch {
        response =
          addressMode === 'sie'
            ? 'Entschuldigung, bitte versuchen Sie es erneut.'
            : 'Entschuldigung, bitte versuch es erneut.';
      }
      setTimeout(() => {
        setConversation((prev) => [...prev, `Clara: ${response}`]);
        speak(response);
        setIsProcessing(false);
      }, 500);
      return;
    }

    let response = '';
    try {
      if (currentCard && (transcript.includes('abstimmung') || transcript.includes('empfehlung'))) {
        response = await claraAI.generateDeepDiveAnalysis(currentCard);
      } else {
        response = await claraAI.generateChatResponse(transcript, currentCard);
      }
    } catch {
      response =
        addressMode === 'sie'
          ? 'Entschuldigung, da ist etwas schiefgelaufen. Bitte versuchen Sie es später erneut.'
          : 'Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es später erneut.';
    }

    setTimeout(() => {
      setConversation((prev) => [...prev, `Clara: ${response}`]);
      speak(response);
      setIsProcessing(false);
    }, 500);
  };

  const handleMicToggle = () => {
    if (!speechSupported) return;
    if (voiceState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
  };

  const handleReset = () => {
    if (preLoginVoicePhase === 'anrede') {
      setConversation([`Clara: ${ANREDE_VOICE_PROMPT}`]);
      speak(ANREDE_VOICE_PROMPT);
      return;
    }
    if (preLoginVoicePhase === 'entry') {
      const p = addressMode === 'sie' ? ENTRY_VOICE_PROMPT_SIE : ENTRY_VOICE_PROMPT_DU;
      setConversation([`Clara: ${p}`]);
      speak(p);
      return;
    }
    if (preLoginVoicePhase === 'eid') {
      setConversation([`Clara: ${eidVoicePrompt}`]);
      speak(eidVoicePrompt);
      return;
    }
    const greeting = claraAI.generateVoiceGreeting();
    setConversation([greeting]);
    speak(greeting);
  };

  const handleSwitchToChat = () => {
    try {
      stopSpeaking();
    } catch {
      // ignore
    }
    onSwitchToChat?.();
    onClose();
  };

  if (!isOpen) return null;

  const errorBanner = !speechSupported || micBlocked;
  const errorTitle = !speechSupported
    ? addressMode === 'sie'
      ? 'Sprach­erkennung nicht verfügbar'
      : 'Sprach­erkennung nicht verfügbar'
    : addressMode === 'sie'
      ? 'Mikrofon­zugriff blockiert'
      : 'Mikrofon­zugriff blockiert';
  const errorBody = !speechSupported
    ? addressMode === 'sie'
      ? 'Ihr Browser unterstützt die Spracherkennung nicht (z. B. Firefox, mancher Privat-Modus). Sie können Clara stattdessen im Text-Chat fragen.'
      : 'Dein Browser unterstützt die Spracherkennung nicht (z. B. Firefox, mancher Privat-Modus). Du kannst Clara stattdessen im Text-Chat fragen.'
    : addressMode === 'sie'
      ? 'Bitte erlauben Sie in der Browser-Adressleiste den Mikrofon­zugriff für diese Seite und versuchen Sie es erneut – oder wechseln Sie in den Text-Chat.'
      : 'Bitte erlaube in der Browser-Adressleiste den Mikrofon­zugriff für diese Seite und versuche es erneut – oder wechsle in den Text-Chat.';

  const backdropCls =
    backdropPosition === 'absolute'
      ? 'absolute inset-0 z-[800] flex items-end justify-center overscroll-contain bg-black/45 p-2 sm:p-4'
      : 'fixed inset-0 z-[800] flex items-end justify-center overscroll-contain bg-black/45 p-2 sm:p-4';

  return (
    <div
      className={backdropCls}
      style={{ touchAction: 'none' }}
      role="dialog"
      aria-modal="true"
      aria-label="Clara Voice – KI-Assistentin"
    >
      <div
        className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl"
        style={{ maxHeight: '88%' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 border-b p-4"
          style={{ borderColor: LAVENDER.border }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: LAVENDER.header }}
              aria-hidden
            >
              C
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold" style={{ color: LAVENDER.text }}>
                Clara Voice
              </h3>
              <p className="text-[11px] text-gray-600 leading-snug">
                Sprach­assistentin · KI-Agent (EU AI Act)
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                Keine Wahlempfehlung. Clara erklärt Relevanz und Argumente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-600 hover:bg-neutral-100"
            style={{ backgroundColor: LAVENDER.bubble }}
            aria-label="Voice-Fenster schließen"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`${message.startsWith('Du:') ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-[80%] p-2.5 rounded-2xl ${
                  message.startsWith('Du:')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {message.replace(/^(Du:|Clara:)\s*/, '')}
                </p>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 rounded-2xl p-2.5">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fehler-/Support-Banner */}
        {errorBanner && (
          <div
            className="mx-4 mb-2 rounded-xl border px-3 py-2.5 text-[11px]"
            style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#991B1B' }}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <MicOff size={14} className="mt-0.5 flex-shrink-0" aria-hidden />
              <div className="min-w-0">
                <div className="font-semibold">{errorTitle}</div>
                <p className="mt-0.5 leading-snug">{errorBody}</p>
                {onSwitchToChat ? (
                  <button
                    type="button"
                    onClick={handleSwitchToChat}
                    className="mt-1.5 inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                  >
                    <MessageCircle size={12} />
                    {addressMode === 'sie' ? 'Stattdessen schreiben' : 'Stattdessen schreiben'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t" style={{ borderColor: LAVENDER.border }}>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={!speechSupported}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                voiceState.isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white'
              }`}
              style={!voiceState.isListening ? { backgroundColor: LAVENDER.header } : {}}
              aria-label={voiceState.isListening ? 'Aufnahme stoppen' : 'Aufnahme starten'}
            >
              {voiceState.isListening ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{voiceState.isListening ? 'Stopp' : 'Sprechen'}</span>
            </button>

            {voiceState.isSpeaking && (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="px-3 py-2 bg-red-500 text-white rounded-xl font-semibold text-[12px] hover:bg-red-600 transition-colors"
              >
                Clara stoppen
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl font-semibold text-[12px] transition-colors"
              style={{ backgroundColor: LAVENDER.bubble, color: LAVENDER.text }}
            >
              Neu
            </button>

            {onSwitchToChat ? (
              <button
                type="button"
                onClick={handleSwitchToChat}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-[12px] font-semibold text-neutral-700 hover:bg-neutral-50"
                aria-label="In den Text-Chat wechseln"
              >
                <MessageCircle size={14} />
                Schreiben
              </button>
            ) : null}
          </div>

          {/* Status */}
          <div className="mt-3 text-center min-h-[1.25rem]">
            {voiceState.isListening && (
              <p className="text-[12px] text-red-600 font-medium animate-pulse">
                Höre zu… jetzt sprechen.
              </p>
            )}
            {voiceState.isSpeaking && (
              <p className="text-[12px] font-medium" style={{ color: LAVENDER.header }}>
                Clara spricht…
              </p>
            )}
            {!voiceState.isListening &&
              !voiceState.isSpeaking &&
              !isProcessing &&
              !errorBanner && (
                <p className="text-[11px] text-gray-600">
                  {preLoginVoicePhase === 'anrede'
                    ? 'Sag „Du" oder „Sie" — oder wähle die Buttons im anderen Fenster.'
                    : preLoginVoicePhase === 'entry'
                      ? 'Sag „Einführung starten" oder „Direkt zur App" — oder nutze die Tasten im Fenster.'
                      : preLoginVoicePhase === 'eid'
                        ? 'Kurze Frage stellen, oder eID-Button im Fenster nutzen.'
                        : addressMode === 'sie'
                          ? 'Tippen Sie auf das Mikrofon, um zu sprechen.'
                          : 'Tippe auf das Mikrofon, um zu sprechen.'}
                </p>
              )}
            {isProcessing && (
              <p className="text-[11px] text-gray-600">Clara denkt nach…</p>
            )}
          </div>

          {/* Quick Actions (nur eingeloggte App, kein Einführungs-Gruß-Modus) */}
          {isAppVoiceGreeting && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleVoiceInput('Erkläre mir die aktuelle Abstimmung')}
                className="flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold transition-colors"
                style={{ backgroundColor: LAVENDER.bubble, color: LAVENDER.text }}
              >
                Abstimmung erklären
              </button>
              <button
                type="button"
                onClick={() =>
                  handleVoiceInput('Erkläre mir die Relevanz dieser Abstimmung zu meinen Schwerpunkten')
                }
                className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-lg text-[11px] font-semibold hover:bg-green-200 transition-colors"
              >
                Relevanz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaraVoiceInterface;
