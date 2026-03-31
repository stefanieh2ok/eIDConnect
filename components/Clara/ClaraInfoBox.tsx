'use client';

import React, { useMemo, useState } from 'react';
import { VotingCard } from '@/types';
import { ClaraAI } from '@/services/claraAI';
import { useApp } from '@/context/AppContext';
import { useClaraVoice } from '@/hooks/useClaraVoice';

const LAVENDER = { bg: '#F5F0FF', border: '#DDD6FE', text: '#5B21B6', bubble: '#EDE8F5', accent: '#7C3AED' };

interface ClaraInfoBoxProps {
  card: VotingCard;
  onOpenChat: (prompt?: string) => void;
}

const ClaraInfoBox: React.FC<ClaraInfoBoxProps> = ({ card, onOpenChat }) => {
  const { state } = useApp();
  const personalizationEnabled = state.consentClaraPersonalization;
  const isFormal = state.anrede === 'sie';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [deepDiveText, setDeepDiveText] = useState<string | null>(null);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [deepDiveError, setDeepDiveError] = useState<string | null>(null);
  const { speak, stopSpeaking } = useClaraVoice();
  
  const addressMode = state.anrede === 'sie' ? 'sie' : 'du';
  const claraAI = new ClaraAI(state.preferences, state.consentClaraPersonalization, addressMode);
  const analysis = claraAI.analyzeVotingCard(card);

  const deepDiveEnabled = isExpanded;
  const deepDiveTitle = useMemo(() => (isFormal ? 'Tiefenanalyse (KI)' : 'Tiefenanalyse (KI)'), [isFormal]);

  const handleSpeak = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const text = isExpanded 
        ? await claraAI.generateDeepDiveAnalysis(card)
        : `Clara-Analyse (Relevanz & Argumente): ${analysis.reasoning}`;
      speak(text);
      setIsSpeaking(true);
    }
  };

  const handleLoadDeepDive = async () => {
    if (!deepDiveEnabled) return;
    setDeepDiveError(null);
    setDeepDiveLoading(true);
    try {
      const text = await claraAI.generateDeepDiveAnalysis(card);
      setDeepDiveText(text);
    } catch (e: any) {
      setDeepDiveError(isFormal ? 'Tiefenanalyse konnte nicht geladen werden.' : 'Tiefenanalyse konnte nicht geladen werden.');
    } finally {
      setDeepDiveLoading(false);
    }
  };

  return (
    <div className="space-y-3 mb-3">
      {/* Main Clara Analysis Box */}
      <div className="rounded-xl p-4 border" style={{ background: LAVENDER.bg, borderColor: LAVENDER.border }}>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold"
            style={{
              background: 'linear-gradient(160deg, #4C1D95 0%, #6D28D9 50%, #8B5CF6 100%)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(109,40,217,0.35)',
            }}
            aria-hidden
          >
            KI
          </div>
          <div>
              <h4 className="font-semibold text-sm" style={{ color: LAVENDER.text }}>Clara-Analyse</h4>
              <p className="text-xs text-gray-600">
                {personalizationEnabled
                  ? isFormal
                    ? 'Basierend auf Ihrem Politik-Barometer (Einwilligung erforderlich)'
                    : 'Basierend auf deinem Politik-Barometer (Einwilligung erforderlich)'
                  : 'Neutral (ohne personalisierte Politik-Schwerpunkte)'}
              </p>
          </div>
          <div className="ml-auto flex gap-1">
            <button
              onClick={handleSpeak}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                isSpeaking ? 'bg-red-500 text-white' : ''
              }`}
              style={!isSpeaking ? { backgroundColor: LAVENDER.bubble, color: LAVENDER.text } : {}}
              title={isSpeaking ? 'Stoppen' : 'Vorlesen'}
            >
              {isSpeaking ? 'Stopp' : 'Vorlesen'}
            </button>
            <button
              onClick={() => onOpenChat()}
              className="px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
              style={{ backgroundColor: LAVENDER.bubble, color: LAVENDER.text }}
              title="Mit Clara chatten"
            >
              Chatten
            </button>
          </div>
        </div>

        {/* Thematische Relevanz (neutral, keine Empfehlung) */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Thematische Relevanz
            </span>
            <span className="text-lg font-bold" style={{ color: LAVENDER.accent }}>{analysis.personalMatch}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysis.personalMatch}%`, backgroundColor: LAVENDER.accent }}
            ></div>
          </div>
        </div>

        {/* Reasoning */}
        <p className="text-xs text-gray-700 leading-relaxed mb-3">
          {analysis.reasoning}
        </p>

        {/* Thematische Relevanz (keine Abstimmungsempfehlung) */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white" style={{ border: '1px solid #DDD6FE', color: '#5B21B6' }}>
          {personalizationEnabled
            ? isFormal
              ? 'Thematische Nähe zu Ihren Sachthemen'
              : 'Thematische Nähe zu deinen Sachthemen'
            : 'Neutrale Einordnung'}
          <span className="text-xs opacity-75">({analysis.confidence}% Einordnung)</span>
        </div>

        <p className="text-[11px] text-gray-600 mt-2">
          KI-gestützte Zusammenfassung. Clara gibt keine Abstimmungsempfehlung – sie erklärt Sachverhalte und Argumente für eine eigene Entscheidung.
        </p>

        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 rounded-xl border px-3 py-2 text-xs font-semibold"
          style={{
            borderColor: LAVENDER.border,
            background: '#ffffff',
            color: LAVENDER.text,
            boxShadow: '0 2px 10px rgba(91,33,182,0.10)',
          }}
        >
          {isExpanded ? 'Tiefenanalyse schließen' : 'Tiefenanalyse anzeigen'}
        </button>
      </div>

      {/* Expanded Analysis */}
      {isExpanded && (
        <div className="space-y-3 animate-slide-up">
          {/* Deep dive text (voll, nicht abgeschnitten) */}
          <div className="rounded-xl p-3 border" style={{ background: '#ffffff', borderColor: LAVENDER.border }}>
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-sm" style={{ color: LAVENDER.text }}>
                {deepDiveTitle}
              </h4>
              <button
                type="button"
                onClick={handleLoadDeepDive}
                disabled={deepDiveLoading}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60"
                style={{ backgroundColor: LAVENDER.bubble, color: LAVENDER.text }}
              >
                {deepDiveLoading ? 'Lädt…' : deepDiveText ? 'Neu laden' : 'Laden'}
              </button>
            </div>

            {deepDiveError && <div className="mt-2 text-xs text-red-600">{deepDiveError}</div>}

            {deepDiveText ? (
              <div
                className="mt-2 max-h-56 overflow-auto rounded-lg p-2 text-[11px] leading-relaxed text-gray-800"
                style={{ background: 'rgba(245,240,255,0.40)' }}
              >
                <pre className="whitespace-pre-wrap font-sans">{deepDiveText}</pre>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-gray-600">
                {isFormal
                  ? 'Laden Sie die Tiefenanalyse, um eine ausführliche, neutrale Einordnung zu sehen.'
                  : 'Lade die Tiefenanalyse, um eine ausführliche, neutrale Einordnung zu sehen.'}
              </p>
            )}
          </div>

          {/* Personalized Pros */}
          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 text-sm">
              {personalizationEnabled
                ? 'Sachliche Pro-Argumente'
                : 'Sachliche Pro-Argumente (allgemein)'}
            </h4>
            <div className="space-y-1.5">
              {analysis.pros.map((pro, i) => (
                <div key={i} className="text-xs text-gray-800 bg-white rounded-lg p-2">
                  {pro}
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Cons */}
          {analysis.cons.length > 0 && (
            <div className="bg-red-50 rounded-xl p-3 border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2 text-sm flex items-center gap-1.5">
                <span className="text-red-600">⚠</span>
                {personalizationEnabled
                  ? 'Sachliche Contra-Argumente'
                  : 'Sachliche Contra-Argumente (allgemein)'}
              </h4>
              <div className="space-y-1.5">
                {analysis.cons.map((con, i) => (
                  <div key={i} className="text-xs text-gray-800 bg-white rounded-lg p-2">
                    {con}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Perspectives */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Alternative Perspektiven</h4>
            <div className="space-y-1.5">
              {analysis.alternativePerspectives.map((perspective, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onOpenChat(perspective)}
                  className="w-full text-left text-xs text-gray-800 bg-white rounded-lg p-2 border border-blue-100 hover:bg-blue-50 transition-colors"
                >
                  {perspective}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onOpenChat()}
              className="flex-1 text-white py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{ backgroundColor: LAVENDER.accent }}
            >
              Mit Clara chatten
            </button>
            <button
              onClick={handleSpeak}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{ backgroundColor: LAVENDER.bubble, color: LAVENDER.text }}
            >
              Vorlesen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaraInfoBox;
