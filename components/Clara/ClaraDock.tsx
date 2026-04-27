'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageCircle, Mic, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import ClaraChat from '@/components/Clara/ClaraChat';
import ClaraVoiceInterface from '@/components/Clara/ClaraVoiceInterface';
import type { PreLoginVoicePhase } from '@/components/Clara/ClaraVoiceInterface';
import { useClaraVoiceContext } from '@/components/Clara/ClaraVoiceContext';
import { ClaraAI } from '@/services/claraAI';
import {
  getVoiceOpenPromptAndDisplay,
  WALKTHROUGH_VOICE_OPEN_LINE_DU,
  WALKTHROUGH_VOICE_OPEN_LINE_SIE,
} from '@/lib/claraVoiceOpenPrompts';

/**
 * Globaler "Clara-Dock": schlanke, glasige Pille am unteren Rand der App.
 * - Immer erreichbar, kein FAB, verdeckt keine Inhalte dauerhaft (Pille ist dezent).
 * - Zwei Eintrittspunkte: Text-Chat (primär) + Voice (sekundär).
 * - Übergibt an Clara den aktuellen Kontext (Bereich + ggf. aktuelle Abstimmungskarte)
 *   als leicht weg­klickbaren Chip – keine erzwungene Personalisierung, kein Tracking.
 */

const SECTION_LABEL: Record<string, string> = {
  live: 'Abstimmen',
  leaderboard: 'Prämien',
  wahlen: 'Wahlen',
  kalender: 'Kalender',
  meldungen: 'Meldungen',
  news: 'Meldungen',
};

type ClaraDockProps = {
  /**
   * Toolbar: über Intro-Overlays (z. B. Anrede z-[600]) — im eingeloggten Screen z-[80].
   */
  toolbarZClassName?: string;
  /**
   * Wenn gesetzt, steuert diese Flag **explizit** Kompakt-Mic vs. untere Pille (eingeloggt).
   * Verhindert, dass die Pille fälschlich über die Walkthrough-Fußleiste liegt.
   */
  compactMicOnlyMode?: boolean;
  /**
   * Zusätzlicher Abstand für das kompakte Mic (rem), z. B. im Geräterahmen neben Intro-Meta.
   */
  compactMicExtraInsetRem?: { top?: number; right?: number };
  /** z-index Kompakt-Mic (Walkthrough: über `app-body z-[650]`, Standard: über Pille). */
  compactMicZClassName?: string;
  /**
   * Post-Login-Produkt-Walkthrough: kompaktes Mic oben rechts (wie Pre-Login); Chat per Event / Voice-UI.
   */
  walkthroughActive?: boolean;
  /** Aktueller Walkthrough-Schritt (Kontext für Chat + Voice). */
  walkthroughStep?: { id: string; label: string } | null;
  /**
   * Zusatzabstand nach oben, z. B. über der Walkthrough-Fußleiste (Zurück/Weiter),
   * damit die Pille nicht mit den Steuerknöpfen kollidiert.
   */
  extraBottomOffset?: string;
  /**
   * Pre-Login: kein `generateVoiceGreeting` — nur schritt-spezifische Prompts.
   * `null` = eingeloggte App: normale Begrüßung.
   */
  preLoginVoicePhase?: PreLoginVoicePhase;
  onAnredeVoiceChoice?: (choice: 'du' | 'sie') => void;
  onIntroEntryVoiceChoice?: (choice: 'start' | 'direct') => void;
  /**
   * Chat- und Voice-Backdrop: `fixed` am Viewport (oft weniger Scroll-/Layout-Sprung mit Tastatur,
   * z. B. Post-Login-Walkthrough im Vollbild). `absolute` = am nächsten `relative`-Vorfahren (Device-Frame).
   */
  overlayPosition?: 'absolute' | 'fixed';
  /**
   * Intro/Walkthrough: Mic sitzt in `IntroMetaStrip` (wie Lautsprecher) — kein zweites schwebendes Mic.
   */
  suppressCompactMic?: boolean;
};

export default function ClaraDock({
  toolbarZClassName = 'z-[80]',
  compactMicOnlyMode,
  compactMicExtraInsetRem,
  compactMicZClassName = 'z-[625]',
  walkthroughActive = false,
  walkthroughStep = null,
  extraBottomOffset = '0px',
  preLoginVoicePhase = null,
  onAnredeVoiceChoice,
  onIntroEntryVoiceChoice,
  overlayPosition = 'absolute',
  suppressCompactMic = false,
}: ClaraDockProps) {
  const { state } = useApp();
  const { speak: speakVoice } = useClaraVoiceContext();
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceUiNonce, setVoiceUiNonce] = useState(0);
  const [voiceOpeningSeed, setVoiceOpeningSeed] = useState<string | null>(null);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);
  const [autoSend, setAutoSend] = useState(false);
  const [autoOpenedFromNda, setAutoOpenedFromNda] = useState(false);

  /** Pre-Login oder Walkthrough: nur Mic oben rechts — volle Pille nur in der normalen App. */
  const showCompactMicOnly =
    compactMicOnlyMode !== undefined
      ? compactMicOnlyMode
      : walkthroughActive || preLoginVoicePhase !== null;

  const micExtraTop = compactMicExtraInsetRem?.top ?? 0;
  const micExtraRight = compactMicExtraInsetRem?.right ?? 0;

  const claraAiForVoice = useMemo(
    () =>
      new ClaraAI(
        state.preferences,
        state.consentClaraPersonalization,
        state.anrede === 'sie' ? 'sie' : 'du',
      ),
    [state.preferences, state.consentClaraPersonalization, state.anrede],
  );

  /**
   * Einführung (Pre-Login) + Walkthrough: Mic öffnet nur die Session — **kein** sofortiges TTS
   * (Hinweis steht im Panel; sonst würde Clara doppelt zur laufenden Vorlese-Führung reden).
   * iOS: Normale App weiterhin: `speak` im selben Tap wie die Pille, damit TTS startet.
   */
  const openVoiceSession = useCallback(() => {
    const loggedInGreeting =
      preLoginVoicePhase == null && !walkthroughActive ? claraAiForVoice.generateVoiceGreeting() : '';
    const { speakText, conversationLine } = getVoiceOpenPromptAndDisplay({
      preLoginVoicePhase,
      addressMode: state.anrede === 'sie' ? 'sie' : 'du',
      loggedInGreetingPlain: loggedInGreeting,
    });
    const skipOpeningTts = preLoginVoicePhase !== null || walkthroughActive;
    if (!skipOpeningTts && speakText.trim()) {
      speakVoice(speakText);
    }
    const isSie = state.anrede === 'sie';
    const seedForWalkthroughOnly =
      walkthroughActive && preLoginVoicePhase == null
        ? `Clara: ${isSie ? WALKTHROUGH_VOICE_OPEN_LINE_SIE : WALKTHROUGH_VOICE_OPEN_LINE_DU}`
        : null;
    setVoiceOpeningSeed(seedForWalkthroughOnly ?? conversationLine);
    setVoiceUiNonce((n) => n + 1);
    setVoiceOpen(true);
  }, [speakVoice, preLoginVoicePhase, walkthroughActive, state.anrede, claraAiForVoice]);

  /**
   * NDA-Zugangsflow (mobil/redirect): Clara-Voice einmalig automatisch öffnen,
   * damit die Begrüßung direkt sichtbar ist.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (autoOpenedFromNda) return;
    if (preLoginVoicePhase == null) return;
    try {
      const shouldAutostart = window.sessionStorage.getItem('eidconnect_intro_autostart_once') === '1';
      if (!shouldAutostart) return;
      window.sessionStorage.removeItem('eidconnect_intro_autostart_once');
    } catch {
      return;
    }
    setAutoOpenedFromNda(true);
    openVoiceSession();
  }, [autoOpenedFromNda, openVoiceSession, preLoginVoicePhase]);

  useEffect(() => {
    if (!voiceOpen) setVoiceOpeningSeed(null);
  }, [voiceOpen]);

  // Globale Schnittstelle: andere Komponenten (z. B. ClaraInfoBox am Stimmzettel)
  // öffnen über ein CustomEvent den einen Clara-Chat – kein zweites Modal, kein Duplikat.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      const prompt: string = typeof detail?.prompt === 'string' ? detail.prompt : '';
      const auto: boolean = Boolean(detail?.autoSend ?? Boolean(prompt));
      setExternalPrompt(prompt || null);
      setAutoSend(auto);
      setUseContext(!prompt); // wenn expliziter Prompt kommt, Karten-Kontext-Chip aus
      setChatOpen(true);
    };
    const onVoice = () => {
      openVoiceSession();
    };
    window.addEventListener('clara:open-chat', onOpen as EventListener);
    window.addEventListener('clara:open-voice', onVoice as EventListener);
    return () => {
      window.removeEventListener('clara:open-chat', onOpen as EventListener);
      window.removeEventListener('clara:open-voice', onVoice as EventListener);
    };
  }, [openVoiceSession]);

  useEffect(() => {
    if (!chatOpen) {
      // Beim Schließen zurücksetzen, damit der nächste Aufruf frisch startet.
      setExternalPrompt(null);
      setAutoSend(false);
    }
  }, [chatOpen]);

  /** Walkthrough: Hintergrund-Scroll sperren, damit das Overlay keinen „Sprung“ auslöst. */
  useEffect(() => {
    if (!walkthroughActive) return;
    if (!chatOpen && !voiceOpen) return;
    const nodes = document.querySelectorAll<HTMLElement>('.intro-walkthrough-scroll');
    const prev = nodes.length
      ? Array.from(nodes).map((el) => ({ el, overflow: el.style.overflow }))
      : [];
    nodes.forEach((el) => {
      el.style.overflow = 'hidden';
    });
    return () => {
      prev.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
    };
  }, [walkthroughActive, chatOpen, voiceOpen]);

  const currentCard = useMemo(() => {
    if (state.activeSection !== 'live') return null;
    const loc = state.activeLocation;
    const data =
      VOTING_DATA[loc] ??
      VOTING_DATA[loc === 'deutschland' ? 'bundesweit' : loc] ??
      VOTING_DATA.bundesweit;
    return data?.cards?.[state.currentCardIndex] ?? null;
  }, [state.activeSection, state.activeLocation, state.currentCardIndex]);

  const contextChipLabel = useMemo(() => {
    if (walkthroughActive && walkthroughStep) {
      return `Einführung · ${walkthroughStep.label}`;
    }
    const sectionLbl = SECTION_LABEL[state.activeSection] ?? 'Demo';
    if (currentCard?.title) return `${sectionLbl} · ${currentCard.title}`;
    return sectionLbl;
  }, [walkthroughActive, walkthroughStep, state.activeSection, currentCard]);

  const [useContext, setUseContext] = useState(true);

  const initialPrompt = useMemo(() => {
    if (walkthroughActive && walkthroughStep) return '';
    if (!useContext) return '';
    if (currentCard?.title) {
      return `Ich bin gerade bei der Abstimmung "${currentCard.title}". Erkläre mir sachlich und neutral, worum es geht, welche Pro- und Contra-Argumente es gibt, und verweise auf überprüfbare Quellen.`;
    }
    const sectionLbl = SECTION_LABEL[state.activeSection] ?? 'der Demo';
    return `Ich bin gerade im Bereich "${sectionLbl}". Gib mir einen kurzen, neutralen Überblick und nenne nur überprüfbare Fakten.`;
  }, [walkthroughActive, walkthroughStep, useContext, currentCard, state.activeSection]);

  // Vorbereiteter Tiefenanalyse-Prompt zur aktuellen Abstimmungskarte (nur wenn eine Karte aktiv ist).
  const deepDivePromptForCurrentCard = useMemo(() => {
    if (!currentCard?.title) return null;
    const title = currentCard.title.trim();
    const desc = (currentCard as { description?: string })?.description?.trim();
    const ctx = desc ? `\nKontext aus der Karte: ${desc}` : '';
    return [
      `Bitte führe eine neutrale Tiefenanalyse zur Abstimmung „${title}" durch.`,
      'Strukturiere deine Antwort in vier kurze Blöcke:',
      '1) Sachstand & Hintergrund (knapp, faktenbasiert)',
      '2) Belegbare Pro-Argumente',
      '3) Belegbare Contra-Argumente',
      '4) Überprüfbare Quellen (amtliche Dokumente, Gesetzestexte, seriöse Medien).',
      'Keine Abstimmungsempfehlung. Markiere ausdrücklich, wenn Zahlen Demo- oder Beispielwerte sind.' +
        ctx,
    ].join('\n');
  }, [currentCard]);

  const startDeepDive = () => {
    if (!deepDivePromptForCurrentCard) return;
    setExternalPrompt(deepDivePromptForCurrentCard);
    setAutoSend(true);
    setUseContext(false);
  };

  /** Kompakte Pille (~halbe visuelle Größe), schmale max-Breite; Anrede-„Weiter“ per extraBottomOffset frei. */
  const pillToolbar = (
    <div
      className="pointer-events-auto flex w-auto max-w-[min(11rem,76vw)] shrink-0 items-center gap-0.5 rounded-full border bg-white px-1 py-0.5 shadow-[0_4px_14px_rgba(76,29,149,0.2),0_1px_3px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      style={{
        borderColor: 'rgba(124, 58, 237, 0.35)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(243,232,255,0.90) 100%)',
      }}
      role="toolbar"
      aria-label="Clara – KI-Assistentin (neutral, keine Wahlempfehlung)"
    >
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-[9px] font-semibold leading-none text-[#4C1D95] transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
        aria-label="Frag Clara – Chat öffnen"
        title="Frag Clara"
      >
        <MessageCircle size={11} strokeWidth={2.2} aria-hidden="true" />
        <span className="max-w-[5.5rem] truncate sm:max-w-none">Clara</span>
      </button>
      <span className="h-3.5 w-px shrink-0 bg-[#7C3AED]/25" aria-hidden="true" />
      <button
        type="button"
        onClick={() => openVoiceSession()}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#4C1D95] transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
        aria-label="Mit Clara sprechen (Voice)"
        title="Mit Clara sprechen"
      >
        <Mic size={11} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </div>
  );

  const compactMicPositionClass = overlayPosition === 'fixed' ? 'fixed' : 'absolute';

  const compactMicOnlyControl =
    !suppressCompactMic && showCompactMicOnly && !voiceOpen && !chatOpen ? (
      <div
        className={`pointer-events-auto ${compactMicPositionClass} ${compactMicZClassName}`}
        style={{
          top: `max(0.5rem, calc(env(safe-area-inset-top, 0px) + 0.35rem + ${micExtraTop}rem))`,
          right: `max(0.5rem, calc(env(safe-area-inset-right, 0px) + ${micExtraRight}rem))`,
        }}
      >
        <button
          type="button"
          onClick={() => openVoiceSession()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/95 shadow-[0_4px_14px_rgba(76,29,149,0.22)] backdrop-blur-xl transition hover:brightness-[1.03] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
          style={{
            borderColor: 'rgba(124, 58, 237, 0.4)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(245,240,255,0.94) 100%)',
          }}
          aria-label="Clara Voice — Mikrofon"
          title="Mit Clara sprechen"
        >
          <Mic className="text-[#4C1D95]" size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    ) : null;

  /** Normale App (ohne Walkthrough, nach Login-Flow): volle Pille unten. */
  const pillFloating = !showCompactMicOnly ? (
      <div
        className={`pointer-events-none absolute inset-x-0 flex justify-center ${toolbarZClassName}`}
        style={{
          bottom: `calc(1rem + ${extraBottomOffset} + env(safe-area-inset-bottom, 0px))`,
        }}
        aria-hidden={chatOpen || voiceOpen}
      >
        {pillToolbar}
      </div>
    ) : null;

  return (
    <>
      {compactMicOnlyControl}
      {pillFloating}

      {chatOpen && (
        <div
          className={`${overlayPosition === 'fixed' ? 'fixed' : 'absolute'} inset-0 z-[800] flex items-end justify-center overscroll-contain bg-black/45 p-2 sm:p-4`}
          role="dialog"
          aria-modal="true"
          aria-label="Clara – KI-Assistentin"
          onClick={() => setChatOpen(false)}
        >
          <div
            className="flex h-full min-h-0 max-h-[min(92dvh,100%)] w-full max-w-[420px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[88%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-4 py-3"
              style={{ borderColor: 'rgba(124, 58, 237, 0.18)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-[#1A2B45]">Clara – Digitale Assistentin</div>
                <p className="mt-0.5 text-[10px] leading-snug text-neutral-500">
                  KI-gestützt, neutral. Keine Wahlempfehlung. Antworten sind Demonstration –
                  bitte über amtliche Quellen verifizieren.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
                aria-label="Clara schließen"
              >
                <X size={16} />
              </button>
            </div>

            {externalPrompt ? (
              <div
                className="flex items-center gap-2 border-b px-4 py-2"
                style={{ borderColor: 'rgba(124, 58, 237, 0.12)', background: 'rgba(245,240,255,0.6)' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#6D28D9]">
                    Tiefenanalyse
                  </div>
                  <div className="truncate text-[11px] text-[#4C1D95]">{contextChipLabel}</div>
                </div>
              </div>
            ) : useContext && initialPrompt ? (
              <div
                className="flex items-center gap-2 border-b px-4 py-2"
                style={{
                  borderColor: 'rgba(124, 58, 237, 0.12)',
                  background: 'rgba(245,240,255,0.6)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#6D28D9]">
                    Kontext
                  </div>
                  <div className="truncate text-[11px] text-[#4C1D95]">{contextChipLabel}</div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {deepDivePromptForCurrentCard && !walkthroughActive ? (
                    <button
                      type="button"
                      onClick={startDeepDive}
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm transition hover:brightness-110"
                      style={{
                        background:
                          'linear-gradient(135deg, #6D28D9 0%, #7C3AED 60%, #8B5CF6 100%)',
                        boxShadow: '0 2px 8px rgba(124,58,237,0.35)',
                      }}
                      aria-label="Tiefenanalyse zur aktuellen Abstimmung starten"
                    >
                      Tiefenanalyse
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setUseContext(false)}
                    className="rounded-full border border-[#7C3AED]/25 px-2 py-0.5 text-[10px] font-semibold text-[#6D28D9] hover:bg-white"
                  >
                    Ohne Kontext
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ClaraChat
                key={walkthroughActive && walkthroughStep ? `wt-${walkthroughStep.id}` : 'clara-dock'}
                level="bund"
                onPointsEarned={() => {}}
                selectedWahl={null}
                initialPrompt={externalPrompt ?? initialPrompt}
                autoSendInitialPrompt={autoSend}
                embedVariant={walkthroughActive ? 'dockSheet' : 'default'}
                introWalkthrough={
                  walkthroughActive && walkthroughStep
                    ? { stepId: walkthroughStep.id, stepLabel: walkthroughStep.label }
                    : null
                }
              />
            </div>
          </div>
        </div>
      )}

      <ClaraVoiceInterface
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        currentCard={currentCard}
        preLoginVoicePhase={preLoginVoicePhase}
        onAnredeVoiceChoice={onAnredeVoiceChoice}
        onIntroEntryVoiceChoice={onIntroEntryVoiceChoice}
        backdropPosition={overlayPosition}
        voiceOpenNonce={voiceUiNonce}
        openingSeedLine={voiceOpeningSeed}
        voiceOnlyMode={walkthroughActive || preLoginVoicePhase !== null}
        onSwitchToChat={() => {
          if (walkthroughActive || preLoginVoicePhase !== null) return;
          setVoiceOpen(false);
          setChatOpen(true);
        }}
      />
    </>
  );
}
