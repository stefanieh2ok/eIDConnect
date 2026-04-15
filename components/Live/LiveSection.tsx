'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import { VoteType, AbstimmungTab } from '@/types';
import VotingCard from '@/components/Voting/VotingCard';
import VotingControls from '@/components/Voting/VotingControls';
import ClaraChat from '@/components/Clara/ClaraChat';
import ClaraVoiceInterface from '@/components/Clara/ClaraVoiceInterface';

const LiveSection: React.FC = () => {
  const { state, dispatch } = useApp();
  const [abstimmungTab, setAbstimmungTab] = useState<AbstimmungTab>('aktuell');
  const [showClaraChat, setShowClaraChat] = useState(false);
  const [showClaraVoice, setShowClaraVoice] = useState(false);
  const [activeNow, setActiveNow] = useState(3847291);
  
  const loc = state.activeLocation;
  const currentData = VOTING_DATA[loc] ?? VOTING_DATA[loc === 'deutschland' ? 'bundesweit' : loc] ?? VOTING_DATA.bundesweit;
  const currentCard = abstimmungTab === 'aktuell' ? currentData?.cards[state.currentCardIndex] : null;
  const effectiveCanVote = state.canVote && currentData.canVote;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNow(prev => prev + Math.floor(Math.random() * 1000) - 400);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = useCallback((voteType: VoteType) => {
    if (!currentCard || !state.canVote) return;

    dispatch({ 
      type: 'HANDLE_VOTE', 
      payload: { 
        voteType, 
        card: currentCard, 
        points: currentCard.points 
      } 
    });

    setTimeout(() => {
      dispatch({ type: 'SET_VOTE_RESULT', payload: null });
      if (state.currentCardIndex < currentData.cards.length - 1) {
        dispatch({ type: 'SET_CURRENT_CARD_INDEX', payload: state.currentCardIndex + 1 });
      } else {
        dispatch({ type: 'SET_CURRENT_CARD_INDEX', payload: 0 });
      }
      dispatch({ type: 'TOGGLE_KI_ANALYSIS' });
    }, 2500);
  }, [currentCard, currentData, state.currentCardIndex, state.canVote, dispatch]);

  const handleDragStart = useCallback((clientX: number) => {
    dispatch({ type: 'SET_IS_DRAGGING', payload: true });
    dispatch({ type: 'SET_DRAG_START', payload: clientX });
  }, [dispatch]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!state.isDragging) return;
    dispatch({ type: 'SET_DRAG_OFFSET', payload: clientX - state.dragStart });
  }, [state.isDragging, state.dragStart, dispatch]);

  const handleDragEnd = useCallback(() => {
    dispatch({ type: 'SET_IS_DRAGGING', payload: false });
    if (Math.abs(state.dragOffset) > 120) {
      if (state.dragOffset > 0) handleVote('for');
      else handleVote('against');
    }
    dispatch({ type: 'RESET_DRAG' });
  }, [state.dragOffset, handleVote, dispatch]);

  const handleToggleKIAnalysis = useCallback(() => {
    dispatch({ type: 'TOGGLE_KI_ANALYSIS' });
  }, [dispatch]);

  const handleOpenClaraChat = useCallback(() => {
    setShowClaraChat(true);
  }, []);

  const claraLevel =
    state.regionResolution != null
      ? state.activeAdministrativeScope === 'kommune'
        ? 'kommune'
        : state.activeAdministrativeScope === 'land'
          ? 'land'
          : 'bund'
      : state.activeLocation === 'kirkel' || state.activeLocation === 'saarpfalz'
        ? 'kommune'
        : state.activeLocation === 'saarland'
          ? 'land'
          : 'bund';

  return (
    <div>
      {!state.canVote && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Vorschau ohne Abstimmung:</strong> Inhalte und Clara sind nutzbar; Stimmabgaben sind in diesem
          Modus deaktiviert.
        </div>
      )}

      {/* Live Status Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-white rounded-2xl p-6 mb-4 text-center">
        <div className="text-2xl font-bold mb-4">DIGITALE DEMOKRATIE LIVE</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <div className="text-2xl font-bold">{activeNow.toLocaleString('de-DE')}</div>
            <div className="text-xs opacity-90">Gerade Aktiv</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <div className="text-2xl font-bold">73,4%</div>
            <div className="text-xs opacity-90">Beteiligung</div>
          </div>
        </div>
      </div>

      {/* Tabs für Aktuell/Ergebnisse */}
      <div className="flex gap-2 mb-4 bg-white rounded-xl p-1 shadow-sm">
        <button 
          onClick={() => setAbstimmungTab('aktuell')} 
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            abstimmungTab === 'aktuell' ? 'bg-blue-900 text-white' : 'text-gray-600'
          }`}
        >
          Aktuelle Abstimmungen
        </button>
        <button 
          onClick={() => setAbstimmungTab('ergebnisse')} 
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            abstimmungTab === 'ergebnisse' ? 'bg-blue-900 text-white' : 'text-gray-600'
          }`}
        >
          Ergebnisse
        </button>
      </div>

      {/* Aktuelle Abstimmungen */}
      {abstimmungTab === 'aktuell' && currentCard && (
        <div>
          <VotingCard
            card={currentCard}
            canVote={effectiveCanVote}
            dragOffset={state.dragOffset}
            isDragging={state.isDragging}
            showKIAnalysis={state.showKIAnalysis}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onVote={handleVote}
            onToggleKIAnalysis={handleToggleKIAnalysis}
            onOpenClaraChat={handleOpenClaraChat}
          />

          <VotingControls canVote={effectiveCanVote} onVote={handleVote} />
        </div>
      )}

      {/* Ergebnisse vergangener Abstimmungen */}
      {abstimmungTab === 'ergebnisse' && (
        <div>
          {currentData.vergangen && currentData.vergangen.length > 0 ? (
            currentData.vergangen.map(ergebnis => (
              <div key={ergebnis.id} className="bg-white rounded-2xl p-5 mb-4 shadow-sm border-l-4 border-green-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Vorlage {ergebnis.nummer}</div>
                    <h3 className="font-bold text-lg">{ergebnis.title}</h3>
                  </div>
                  <span className="bg-green-100 text-green-900 px-3 py-1 rounded-full text-xs font-bold">
                    {ergebnis.ergebnis}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  {ergebnis.datum} • {ergebnis.votes.toLocaleString('de-DE')} Stimmen
                </div>
                
                <div className="flex h-10 rounded-full overflow-hidden mb-3">
                  <div 
                    className="bg-green-600 flex items-center justify-center text-white text-xs font-bold" 
                    style={{width: `${ergebnis.yes}%`}}
                  >
                    {ergebnis.yes}%
                  </div>
                  <div 
                    className="bg-red-600 flex items-center justify-center text-white text-xs font-bold" 
                    style={{width: `${ergebnis.no}%`}}
                  >
                    {ergebnis.no}%
                  </div>
                  {ergebnis.abstain > 0 && (
                    <div 
                      className="bg-gray-400 flex items-center justify-center text-white text-xs font-bold" 
                      style={{width: `${ergebnis.abstain}%`}}
                    >
                      {ergebnis.abstain}%
                    </div>
                  )}
                </div>

                {ergebnis.regionalResults && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h4 className="font-semibold text-xs mb-2">Regionale Ergebnisse</h4>
                    {ergebnis.regionalResults.map((region, i) => (
                      <div key={i} className="flex justify-between py-1 text-xs">
                        <span>{region.land}</span>
                        <div className="flex gap-2">
                          <span className="text-green-700 font-bold">{region.yes}%</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-red-700 font-bold">{region.no}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
              <p>Noch keine abgeschlossenen Abstimmungen.</p>
            </div>
          )}
        </div>
      )}

      {/* Clara Chat Modal */}
      {showClaraChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowClaraChat(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end p-2 border-b">
              <button onClick={() => setShowClaraChat(false)} className="p-2 text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="flex-1 min-h-0 p-4">
              <ClaraChat level={claraLevel} onPointsEarned={() => {}} selectedWahl={state.selectedWahl} />
            </div>
          </div>
        </div>
      )}
      <ClaraVoiceInterface 
        isOpen={showClaraVoice} 
        onClose={() => setShowClaraVoice(false)} 
        currentCard={currentCard}
      />
    </div>
  );
};

export default LiveSection;
