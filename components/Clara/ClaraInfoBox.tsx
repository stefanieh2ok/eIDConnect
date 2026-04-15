'use client';

import React, { useState } from 'react';
import { VotingCard } from '@/types';
import { ClaraAI } from '@/services/claraAI';
import { useApp } from '@/context/AppContext';
import { useClaraVoice } from '@/hooks/useClaraVoice';

const LAVENDER = { bg: '#F5F0FF', border: '#E6E6FA', text: '#6B5B95', bubble: '#EDE8F5', accent: '#9370DB' };

interface ClaraInfoBoxProps {
  card: VotingCard;
  onOpenChat: () => void;
}

const ClaraInfoBox: React.FC<ClaraInfoBoxProps> = ({ card, onOpenChat }) => {
  const { state } = useApp();
  const personalizationEnabled = state.consentClaraPersonalization;
  const isFormal = state.anrede === 'sie';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speak, stopSpeaking } = useClaraVoice();
  
  const claraAI = new ClaraAI(state.preferences, state.consentClaraPersonalization);
  const analysis = claraAI.analyzeVotingCard(card);

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

  return (
    <div className="space-y-3 mb-3">
      {/* Main Clara Analysis Box */}
      <div className="rounded-xl p-4 border" style={{ background: LAVENDER.bg, borderColor: LAVENDER.border }}>
        <div className="flex items-center gap-2 mb-3">
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
              onClick={onOpenChat}
              className="px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
              style={{ backgroundColor: LAVENDER.bubble, color: LAVENDER.text }}
              title="Mit Clara chatten"
            >
              Chatten
            </button>
          </div>
        </div>

        {/* Personal Match Score */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {personalizationEnabled ? 'Deine Übereinstimmung' : 'Relevanzscore (neutral)'}
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

        {/* Relevanz (kein Abstimmung-Ratschlag) */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-200 bg-white">
          {personalizationEnabled
            ? isFormal
              ? 'Passung zu Ihren Schwerpunkten'
              : 'Passung zu deinen Schwerpunkten'
            : 'Neutrale Einordnung'}
          <span className="text-xs opacity-75">({analysis.confidence}% Einordnung)</span>
        </div>

        <p className="text-[11px] text-gray-600 mt-2">
          Clara gibt keine Wahlempfehlung. Sie erklärt nur Relevanz und Argumente für eine eigene Entscheidung.
        </p>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 flex items-center justify-center gap-2 text-xs transition-colors"
          style={{ color: LAVENDER.text }}
        >
          {isExpanded ? 'Weniger Details' : 'Tiefenanalyse anzeigen'}
        </button>
      </div>

      {/* Expanded Analysis */}
      {isExpanded && (
        <div className="space-y-3 animate-slide-up">
          {/* Personalized Pros */}
          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 text-sm">
              {personalizationEnabled
                ? isFormal
                  ? 'Für Sie relevant'
                  : 'Für dich relevant'
                : 'Mögliche Vorteile (allgemein)'}
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
                  ? isFormal
                    ? 'Bedenken für Sie'
                    : 'Bedenken für dich'
                  : 'Mögliche Risiken/Nachteile (allgemein)'}
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
                <div key={i} className="text-xs text-gray-800 bg-white rounded-lg p-2">
                  {perspective}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onOpenChat}
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
