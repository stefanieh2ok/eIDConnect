'use client';

import React, { useState, useEffect } from 'react';
import { useClaraVoice } from '@/hooks/useClaraVoice';
import { ClaraAI } from '@/services/claraAI';
import { useApp } from '@/context/AppContext';

const LAVENDER = { bg: '#F5F0FF', border: '#E6E6FA', text: '#6B5B95', header: '#9370DB', bubble: '#EDE8F5' };

interface ClaraVoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  currentCard?: any;
}

const ClaraVoiceInterface: React.FC<ClaraVoiceInterfaceProps> = ({ isOpen, onClose, currentCard }) => {
  const { state } = useApp();
  const [conversation, setConversation] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { voiceState, startListening, stopListening, speak, stopSpeaking } = useClaraVoice();
  
  const addressMode = state.anrede === 'sie' ? 'sie' : 'du';
  const claraAI = new ClaraAI(state.preferences, state.consentClaraPersonalization, addressMode);

  useEffect(() => {
    if (isOpen && conversation.length === 0) {
      const greeting = claraAI.generateVoiceGreeting();
      setConversation([greeting]);
      speak(greeting);
    }
  }, [isOpen, conversation.length, claraAI, speak]);

  useEffect(() => {
    if (voiceState.transcript) {
      handleVoiceInput(voiceState.transcript);
    }
  }, [voiceState.transcript]);

  const handleVoiceInput = async (transcript: string) => {
    setConversation(prev => [...prev, `Du: ${transcript}`]);
    setIsProcessing(true);

    let response = '';
    try {
      if (currentCard && (transcript.includes('abstimmung') || transcript.includes('empfehlung'))) {
        response = await claraAI.generateDeepDiveAnalysis(currentCard);
      } else {
        response = await claraAI.generateChatResponse(transcript, currentCard);
      }
    } catch {
      response = addressMode === 'sie'
        ? 'Entschuldigung, da ist etwas schiefgelaufen. Bitte versuchen Sie es später erneut.'
        : 'Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es später erneut.';
    }

    // Kurze Verzögerung, dann Anzeige
    setTimeout(() => {
      setConversation(prev => [...prev, `Clara: ${response}`]);
      speak(response);
      setIsProcessing(false);
    }, 500);
  };

  const handleMicToggle = () => {
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
    setConversation([]);
    const greeting = claraAI.generateVoiceGreeting();
    setConversation([greeting]);
    speak(greeting);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md h-[80vh] flex flex-col">
        {/* Header – nur Lavendel, kein Icon */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: LAVENDER.border }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: LAVENDER.header }}>
              C
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: LAVENDER.text }}>Clara Voice</h3>
              <p className="text-sm text-gray-600">Sprachassistentin · KI-Agent (EU AI Act)</p>
              <p className="text-xs text-gray-500 mt-1">Clara gibt keine Wahlempfehlung. Sie erklärt nur Relevanz und Argumente.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-gray-600 font-bold text-lg"
            style={{ backgroundColor: LAVENDER.bubble }}
          >
            ×
          </button>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {conversation.map((message, index) => (
            <div key={index} className={`${message.startsWith('Du:') ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-[80%] p-3 rounded-2xl ${
                message.startsWith('Du:') 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">
                  {message.replace(/^(Du:|Clara:)\s*/, '')}
                </p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 rounded-2xl p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t" style={{ borderColor: LAVENDER.border }}>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleMicToggle}
              className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                voiceState.isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white'
              }`}
              style={!voiceState.isListening ? { backgroundColor: LAVENDER.header } : {}}
            >
              {voiceState.isListening ? 'Stopp' : 'Sprechen'}
            </button>
            {voiceState.isSpeaking && (
              <button
                onClick={handleStopSpeaking}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Stopp
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl font-semibold transition-colors"
              style={{ backgroundColor: LAVENDER.bubble, color: LAVENDER.text }}
            >
              Neu
            </button>
          </div>

          {/* Status */}
          <div className="mt-4 text-center">
            {voiceState.isListening && (
              <p className="text-sm text-red-600 font-medium animate-pulse">
                Höre zu... Spreche jetzt!
              </p>
            )}
            {voiceState.isSpeaking && (
              <p className="text-sm font-medium" style={{ color: LAVENDER.header }}>
                Clara spricht...
              </p>
            )}
            {!voiceState.isListening && !voiceState.isSpeaking && !isProcessing && (
              <p className="text-sm text-gray-600">
                Tippe auf das Mikrofon um zu sprechen
              </p>
            )}
            {isProcessing && (
              <p className="text-sm text-gray-600">
                Clara denkt nach...
              </p>
            )}
            {voiceState.error && (
              <p className="text-sm text-red-600">{voiceState.error}</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleVoiceInput('Erkläre mir die aktuelle Abstimmung')}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
              style={{ backgroundColor: LAVENDER.bubble, color: LAVENDER.text }}
            >
              Abstimmung erklären
            </button>
            <button
              onClick={() => handleVoiceInput('Erkläre mir die Relevanz dieser Abstimmung zu meinen Schwerpunkten')}
              className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors"
            >
              Relevanz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaraVoiceInterface;
