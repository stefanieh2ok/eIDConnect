'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Mic, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import ClaraChat from '@/components/Clara/ClaraChat';
import ClaraVoiceInterface from '@/components/Clara/ClaraVoiceInterface';

/**
 * Globaler "Clara-Dock": schlanke, glasige Pille am unteren Rand der App.
 * - Immer erreichbar, kein FAB, verdeckt keine Inhalte dauerhaft (Pille ist dezent).
 * - Zwei Eintrittspunkte: Text-Chat (primär) + Voice (sekundär).
 * - Übergibt an Clara den aktuellen Kontext (Bereich + ggf. aktuelle Abstimmungskarte)
 *   als leicht weg­klickbaren Chip – keine erzwungene Personalisierung, kein Tracking.
 */

const SECTION_LABEL: Record<string, string> = {
  live: 'Abstimmen',
  leaderboard: 'Leaderboard',
  wahlen: 'Wahlen',
  kalender: 'Kalender',
  meldungen: 'Meldungen',
  news: 'Meldungen',
};

export default function ClaraDock() {
  const { state } = useApp();
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);
  const [autoSend, setAutoSend] = useState(false);

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
      setVoiceOpen(true);
    };
    window.addEventListener('clara:open-chat', onOpen as EventListener);
    window.addEventListener('clara:open-voice', onVoice as EventListener);
    return () => {
      window.removeEventListener('clara:open-chat', onOpen as EventListener);
      window.removeEventListener('clara:open-voice', onVoice as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!chatOpen) {
      // Beim Schließen zurücksetzen, damit der nächste Aufruf frisch startet.
      setExternalPrompt(null);
      setAutoSend(false);
    }
  }, [chatOpen]);

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
    const sectionLbl = SECTION_LABEL[state.activeSection] ?? 'Demo';
    if (currentCard?.title) return `${sectionLbl} · ${currentCard.title}`;
    return sectionLbl;
  }, [state.activeSection, currentCard]);

  const [useContext, setUseContext] = useState(true);

  const initialPrompt = useMemo(() => {
    if (!useContext) return '';
    if (currentCard?.title) {
      return `Ich bin gerade bei der Abstimmung "${currentCard.title}". Erkläre mir sachlich und neutral, worum es geht, welche Pro- und Contra-Argumente es gibt, und verweise auf überprüfbare Quellen.`;
    }
    const sectionLbl = SECTION_LABEL[state.activeSection] ?? 'der Demo';
    return `Ich bin gerade im Bereich "${sectionLbl}". Gib mir einen kurzen, neutralen Überblick und nenne nur überprüfbare Fakten.`;
  }, [useContext, currentCard, state.activeSection]);

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

  return (
    <>
      <div
        // z-[80]: liegt ueber allem Section-Content (Wahlen/Meldungen/Kalender
        // haben Cards + Badges, die frueher mit z-[40] optisch konkurriert
        // haben), aber unter globalen Modals (Filter z-[90], Chat z-[130],
        // app-overlay-root z-[120], Intro z-[500]).
        className="pointer-events-none absolute inset-x-0 z-[80] flex justify-center"
        style={{
          bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        }}
        aria-hidden={chatOpen || voiceOpen}
      >
        <div
          // Kraeftigerer Schatten + etwas satterer Hintergrund, damit die
          // Pille auf hellem Section-Content (Wahlen-Cards, Meldungen-Liste,
          // Kalender-Kacheln) verlaesslich auffaellt und nicht "verschwindet".
          className="pointer-events-auto flex h-11 items-center gap-1 rounded-full border bg-white px-1.5 shadow-[0_10px_28px_rgba(76,29,149,0.28),0_2px_6px_rgba(15,23,42,0.10)] backdrop-blur-xl"
          style={{
            borderColor: 'rgba(124, 58, 237, 0.35)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(243,232,255,0.90) 100%)',
          }}
          role="toolbar"
          aria-label="Clara – KI-Assistentin (neutral, keine Wahlempfehlung)"
        >
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-[12px] font-semibold text-[#4C1D95] transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
            aria-label="Clara-Chat öffnen"
          >
            <MessageCircle size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>Frag Clara</span>
          </button>
          <span
            className="mx-0.5 h-5 w-px bg-[#7C3AED]/25"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => setVoiceOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#4C1D95] transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED]"
            aria-label="Mit Clara sprechen (Voice)"
            title="Mit Clara sprechen"
          >
            <Mic size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
      </div>

      {chatOpen && (
        <div
          className="absolute inset-0 z-[130] flex items-end justify-center bg-black/45 p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Clara – KI-Assistentin"
          onClick={() => setChatOpen(false)}
        >
          <div
            className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl"
            style={{ maxHeight: '88%' }}
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
                  {deepDivePromptForCurrentCard ? (
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

            <div className="flex-1 overflow-hidden">
              <ClaraChat
                level="bund"
                onPointsEarned={() => {}}
                selectedWahl={null}
                initialPrompt={externalPrompt ?? initialPrompt}
                autoSendInitialPrompt={autoSend}
              />
            </div>
          </div>
        </div>
      )}

      <ClaraVoiceInterface
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        currentCard={currentCard}
        onSwitchToChat={() => {
          setVoiceOpen(false);
          setChatOpen(true);
        }}
      />
    </>
  );
}
