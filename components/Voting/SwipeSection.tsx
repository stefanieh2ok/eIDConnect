'use client';

import React, { useCallback, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import { VoteType } from '@/types';
import VotingCard from './VotingCard';
import VotingControls from './VotingControls';
import ClaraChat from '@/components/Clara/ClaraChat';
import ClaraVoiceInterface from '@/components/Clara/ClaraVoiceInterface';

const SwipeSection: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showClaraChat, setShowClaraChat] = useState(false);
  const [showClaraVoice, setShowClaraVoice] = useState(false);
  
  const currentData = VOTING_DATA[state.activeLocation];
  const currentCard = currentData?.cards[state.currentCardIndex];

  const handleVote = useCallback((voteType: VoteType) => {
    if (!currentCard) return;
    
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
        dispatch({ type: 'TOGGLE_KI_ANALYSIS' });
      }
    }, 3000);
  }, [currentCard, currentData, state.currentCardIndex, dispatch]);

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
    if (Math.abs(state.dragOffset) > 100) {
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

  const handleOpenClaraVoice = useCallback(() => {
    setShowClaraVoice(true);
  }, []);

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Keine Abstimmungen verfügbar</p>
      </div>
    );
  }

  return (
    <div>
      {!currentData.canVote && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-3 mb-4 text-center">
          <p className="text-sm font-medium text-slate-800">
            Nur Ansicht • Stimmberechtigt in Saarland & Kirkel
          </p>
        </div>
      )}

      <VotingCard
        card={currentCard}
        canVote={currentData.canVote}
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

      <VotingControls canVote={currentData.canVote} onVote={handleVote} />

      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Wische oder tippe für deine Stimme</p>
      </div>

      {/* Clara Modals */}
      {showClaraChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowClaraChat(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end p-2 border-b">
              <button onClick={() => setShowClaraChat(false)} className="p-2 text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <ClaraChat level="bund" onPointsEarned={() => {}} selectedWahl={null} />
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

export default SwipeSection;
