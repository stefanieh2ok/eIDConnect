'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageCircle, Mic } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import ClaraChat from '@/components/Clara/ClaraChat';
import ClaraVoiceInterface from '@/components/Clara/ClaraVoiceInterface';
import { ClaraBottomSheet, type ClaraSheetSize } from '@/components/Clara/ClaraBottomSheet';
import type { PreLoginVoicePhase } from '@/components/Clara/ClaraVoiceInterface';
import { useClaraVoiceContext } from '@/components/Clara/ClaraVoiceContext';
import { ClaraAI } from '@/services/claraAI';
import {
  getVoiceOpenPromptAndDisplay,
  WALKTHROUGH_VOICE_OPEN_LINE_DU,
  WALKTHROUGH_VOICE_OPEN_LINE_SIE,
} from '@/lib/claraVoiceOpenPrompts';
import {
  civicClaraContextChipLabel,
  type CivicClaraContextPayload,
} from '@/lib/civicClaraContext';

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
  postfach: 'Postfach',
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
  const [sheetSize, setSheetSize] = useState<ClaraSheetSize>('half');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceUiNonce, setVoiceUiNonce] = useState(0);
  const [voiceOpeningSeed, setVoiceOpeningSeed] = useState<string | null>(null);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);
  const [autoSend, setAutoSend] = useState(false);
  const [civicContext, setCivicContext] = useState<CivicClaraContextPayload | null>(null);
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
      const civic =
        detail?.civicContext && typeof detail.civicContext === 'object'
          ? (detail.civicContext as CivicClaraContextPayload)
          : null;
      setExternalPrompt(prompt || null);
      setAutoSend(auto);
      setCivicContext(civic);
      setUseContext(!prompt);
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
      setExternalPrompt(null);
      setAutoSend(false);
      setCivicContext(null);
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
    if (civicContext) {
      return civicClaraContextChipLabel(civicContext);
    }
    if (walkthroughActive && walkthroughStep) {
      return `Einführung · ${walkthroughStep.label}`;
    }
    const sectionLbl = SECTION_LABEL[state.activeSection] ?? 'Vorschau';
    if (currentCard?.title) return `${sectionLbl} · ${currentCard.title}`;
    return sectionLbl;
  }, [civicContext, walkthroughActive, walkthroughStep, state.activeSection, currentCard]);

  const [useContext, setUseContext] = useState(true);

  const initialPrompt = useMemo(() => {
    if (walkthroughActive && walkthroughStep) return '';
    if (!useContext) return '';
    if (currentCard?.title) {
      return `Ich bin gerade bei der Abstimmung "${currentCard.title}". Erkläre mir sachlich und neutral, worum es geht, welche Pro- und Contra-Argumente es gibt, und verweise auf überprüfbare Quellen.`;
    }
    const sectionLbl = SECTION_LABEL[state.activeSection] ?? 'der Vorschau';
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
      'Keine Abstimmungsempfehlung. Markiere ausdrücklich, wenn Zahlen Vorschau- oder Beispielwerte sind.' +
        ctx,
    ].join('\n');
  }, [currentCard]);

  const startDeepDive = () => {
    if (!deepDivePromptForCurrentCard) return;
    setExternalPrompt(deepDivePromptForCurrentCard);
    setAutoSend(true);
    setUseContext(false);
  };

  const handleQuickAction = useCallback(
    (action: string) => {
      const ctx = contextChipLabel;
      const prompts: Record<string, string> = {
        'Schritt erklären': `Erkläre mir den aktuellen Schritt im Kontext „${ctx}“ sachlich und neutral. Keine Abstimmungsempfehlung.`,
        'Unterlagen prüfen': `Welche Unterlagen sind im Kontext „${ctx}“ relevant? Nenne nur überprüfbare Quellen.`,
        'Termin vorbereiten': `Wie bereite ich einen Termin im Kontext „${ctx}“ vor? Gib eine kurze, neutrale Checkliste.`,
        'Quelle anzeigen': `Zeige mir überprüfbare Quellen zum Kontext „${ctx}“. Kennzeichne Demo- und Beispielwerte.`,
      };
      const prompt = prompts[action];
      if (!prompt) return;
      setExternalPrompt(prompt);
      setAutoSend(true);
      setUseContext(false);
    },
    [contextChipLabel],
  );

  /** Kompakte Pille (~halbe visuelle Größe), schmale max-Breite; Anrede-„Weiter“ per extraBottomOffset frei. */
  const pillToolbar = (
    <div
      className="clara-dock-pill pointer-events-auto flex w-auto max-w-[min(9rem,62vw)] shrink-0 items-center gap-0.5 rounded-full border bg-white/95 px-1 py-0.5 shadow-[0_2px_8px_rgba(76,29,149,0.12)] backdrop-blur-md"
      style={{
        borderColor: 'rgba(124, 58, 237, 0.25)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,245,255,0.92) 100%)',
      }}
      role="toolbar"
      aria-label="Clara – KI-Assistentin (neutral, keine Wahlempfehlung)"
    >
      <button
        type="button"
        onClick={() => {
          setSheetSize('half');
          setChatOpen(true);
        }}
        className="clara-dock-pill__btn"
        aria-label="Frag Clara – Chat öffnen"
        title="Frag Clara"
      >
        <MessageCircle size={14} strokeWidth={2.2} aria-hidden="true" />
        <span className="max-w-[4rem] truncate sm:max-w-none">Clara</span>
      </button>
      <span className="h-3.5 w-px shrink-0 bg-[#7C3AED]/25" aria-hidden="true" />
      <button
        type="button"
        onClick={() => openVoiceSession()}
        className="clara-dock-pill__btn clara-dock-pill__btn--icon"
        aria-label="Mit Clara sprechen (Voice)"
        title="Mit Clara sprechen"
      >
        <Mic size={14} strokeWidth={2.2} aria-hidden="true" />
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
          bottom: `calc(var(--clara-dock-pill-bottom, 1rem) + ${extraBottomOffset})`,
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

      {chatOpen && !showCompactMicOnly ? (
        <ClaraBottomSheet
          open={chatOpen}
          size={sheetSize}
          onClose={() => setChatOpen(false)}
          onExpand={() => setSheetSize('full')}
          onCollapse={() => setSheetSize('half')}
          contextLabel={contextChipLabel}
          onQuickAction={handleQuickAction}
        >
          <div className="clara-chat-dock">
            <ClaraChat
              key={walkthroughActive && walkthroughStep ? `wt-${walkthroughStep.id}` : 'clara-dock'}
              level="bund"
              onPointsEarned={() => {}}
              selectedWahl={null}
              initialPrompt={externalPrompt ?? initialPrompt}
              autoSendInitialPrompt={autoSend}
              embedVariant="dockSheet"
              introWalkthrough={
                walkthroughActive && walkthroughStep
                  ? { stepId: walkthroughStep.id, stepLabel: walkthroughStep.label }
                  : null
              }
            />
          </div>
        </ClaraBottomSheet>
      ) : null}

      <ClaraVoiceInterface
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        currentCard={currentCard}
        walkthroughActive={walkthroughActive}
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
