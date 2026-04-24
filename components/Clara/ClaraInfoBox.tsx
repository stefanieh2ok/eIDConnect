'use client';

import React, { useMemo, useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { VotingCard } from '@/types';
import { ClaraAI } from '@/services/claraAI';
import { useApp } from '@/context/AppContext';
import { useClaraVoice } from '@/hooks/useClaraVoice';

const LAVENDER = {
  bg: '#F5F0FF',
  border: '#DDD6FE',
  text: '#5B21B6',
  bubble: '#EDE8F5',
  accent: '#7C3AED',
  accentDark: '#6D28D9',
};

interface ClaraInfoBoxProps {
  card: VotingCard;
  onOpenChat: (prompt?: string) => void;
}

/**
 * Schlanke, neutrale Karten-Einordnung von Clara.
 *
 * Bewusst entschlackt: Keine in-place "Tiefenanalyse" mehr (dupliziert den Dock-Chat).
 * Die ausführliche Analyse passiert im globalen Clara-Chat (unten im Dock) – diese
 * Box triggert ihn mit einem vorgefüllten, neutralen Tiefenanalyse-Prompt inkl.
 * Karteninhalt. So gibt es genau einen Gesprächsort für Clara.
 */
const ClaraInfoBox: React.FC<ClaraInfoBoxProps> = ({ card, onOpenChat }) => {
  const { state } = useApp();
  const personalizationEnabled = state.consentClaraPersonalization;
  const isFormal = state.anrede === 'sie';
  const addressMode = isFormal ? 'sie' : 'du';

  const claraAI = useMemo(
    () => new ClaraAI(state.preferences, state.consentClaraPersonalization, addressMode),
    [state.preferences, state.consentClaraPersonalization, addressMode],
  );
  const analysis = claraAI.analyzeVotingCard(card);

  const { speak, stopSpeaking } = useClaraVoice();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    speak(`Clara-Einordnung: ${analysis.reasoning}`);
    setIsSpeaking(true);
  };

  const deepDivePrompt = useMemo(() => {
    const title = card?.title?.trim() || 'dieser Abstimmung';
    const desc = card?.description?.trim();
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
  }, [card]);

  return (
    <div className="mb-3">
      <div
        className="rounded-xl border p-4"
        style={{ background: LAVENDER.bg, borderColor: LAVENDER.border }}
      >
        {/* Header */}
        <div className="mb-3 flex items-start gap-2">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold"
            style={{
              background: 'linear-gradient(160deg, #4C1D95 0%, #6D28D9 50%, #8B5CF6 100%)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(109,40,217,0.35)',
            }}
            aria-hidden
          >
            KI
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold" style={{ color: LAVENDER.text }}>
              Clara – Digitale Assistentin
            </h4>
            <p className="text-[11px] text-gray-600">
              {personalizationEnabled
                ? isFormal
                  ? 'Basierend auf Ihrem Politik-Barometer (Einwilligung erforderlich)'
                  : 'Basierend auf deinem Politik-Barometer (Einwilligung erforderlich)'
                : 'Neutral (ohne personalisierte Politik-Schwerpunkte)'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSpeak}
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{
              backgroundColor: isSpeaking ? '#ef4444' : LAVENDER.bubble,
              color: isSpeaking ? '#fff' : LAVENDER.text,
            }}
            title={isSpeaking ? 'Wiedergabe beenden' : 'Einordnung anhören'}
            aria-label={isSpeaking ? 'Wiedergabe beenden' : 'Einordnung anhören'}
          >
            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        {/* Thematische Relevanz */}
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Thematische Relevanz</span>
            <span className="text-lg font-bold" style={{ color: LAVENDER.accent }}>
              {analysis.personalMatch}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${analysis.personalMatch}%`,
                backgroundColor: LAVENDER.accent,
              }}
            />
          </div>
        </div>

        {/* Neutrale Kurz-Zusammenfassung */}
        <p className="mb-3 text-xs leading-relaxed text-gray-700">{analysis.reasoning}</p>

        <div
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold"
          style={{ border: `1px solid ${LAVENDER.border}`, color: LAVENDER.text }}
        >
          {personalizationEnabled
            ? isFormal
              ? 'Thematische Nähe zu Ihren Sachthemen'
              : 'Thematische Nähe zu deinen Sachthemen'
            : 'Neutrale Einordnung'}
          <span className="text-xs opacity-75">({analysis.confidence}% Einordnung)</span>
        </div>

        <p className="mt-2 text-[11px] text-gray-600">
          KI-gestützte Zusammenfassung. Clara gibt keine Abstimmungsempfehlung – sie erklärt
          Sachverhalte und Argumente für eine eigene Entscheidung.
        </p>

        {/* Single CTA: Tiefenanalyse → globaler Clara-Chat (Dock unten) */}
        <button
          type="button"
          onClick={() => {
            // Einheitlicher Gesprächsort: Event informiert den globalen ClaraDock,
            // onOpenChat bleibt als Fallback für eingebettete Kontexte (z. B. Modals ohne Dock).
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('clara:open-chat', {
                  detail: { prompt: deepDivePrompt, autoSend: true },
                }),
              );
            } else {
              onOpenChat(deepDivePrompt);
            }
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition"
          style={{
            background: `linear-gradient(135deg, ${LAVENDER.accentDark} 0%, ${LAVENDER.accent} 100%)`,
            boxShadow: '0 4px 14px rgba(124,58,237,0.28)',
          }}
          aria-label={
            isFormal
              ? 'Tiefenanalyse im Clara-Chat öffnen'
              : 'Tiefenanalyse im Clara-Chat öffnen'
          }
        >
          <Sparkles size={15} aria-hidden />
          {isFormal ? 'Mit Clara vertiefen' : 'Mit Clara vertiefen'}
        </button>
        <p className="mt-1.5 text-center text-[10px] text-gray-500">
          {isFormal
            ? 'Öffnet den Clara-Chat mit vorbereiteter Tiefenanalyse zu dieser Karte.'
            : 'Öffnet den Clara-Chat mit vorbereiteter Tiefenanalyse zu dieser Karte.'}
        </p>
      </div>
    </div>
  );
};

export default ClaraInfoBox;
