'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import { VoteType, AbstimmungTab } from '@/types';
import VotingCard from '@/components/Voting/VotingCard';
import VotingControls from '@/components/Voting/VotingControls';
import ClaraChat from '@/components/Clara/ClaraChat';
import ClaraVoiceInterface from '@/components/Clara/ClaraVoiceInterface';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { SectionLevelFilterIcon, selectionLabelForSection } from '@/components/Filter/SectionLevelFilterIcon';
import ClaraInfoBox from '@/components/Clara/ClaraInfoBox';

const LiveSection: React.FC = () => {
  const { state, dispatch } = useApp();
  const [abstimmungTab, setAbstimmungTab] = useState<AbstimmungTab>('aktuell');
  const [showClaraChat, setShowClaraChat] = useState(false);
  const [claraPrompt, setClaraPrompt] = useState<string>('');
  const [showClaraVoice, setShowClaraVoice] = useState(false);
  const [activeNow, setActiveNow] = useState(3_847_291);
  const [showStats, setShowStats] = useState(false);

  const loc = state.activeLocation;
  const currentData =
    VOTING_DATA[loc] ??
    VOTING_DATA[loc === 'deutschland' ? 'bundesweit' : loc] ??
    VOTING_DATA.bundesweit;
  const currentCard =
    abstimmungTab === 'aktuell' ? currentData?.cards[state.currentCardIndex] : null;
  const totalCards = currentData?.cards?.length ?? 0;

  useEffect(() => {
    const id = setInterval(() => {
      setActiveNow((p) => p + Math.floor(Math.random() * 800) - 350);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const handleVote = useCallback(
    (voteType: VoteType) => {
      if (!currentCard) return;
      dispatch({ type: 'HANDLE_VOTE', payload: { voteType, card: currentCard, points: currentCard.points } });
      setTimeout(() => {
        dispatch({ type: 'SET_VOTE_RESULT', payload: null });
        dispatch({
          type: 'SET_CURRENT_CARD_INDEX',
          payload: state.currentCardIndex < totalCards - 1 ? state.currentCardIndex + 1 : 0,
        });
        if (state.showKIAnalysis) dispatch({ type: 'TOGGLE_KI_ANALYSIS' });
      }, 2200);
    },
    [currentCard, totalCards, state.currentCardIndex, state.showKIAnalysis, dispatch]
  );

  const handleDragStart = useCallback(
    (clientX: number) => {
      dispatch({ type: 'SET_IS_DRAGGING', payload: true });
      dispatch({ type: 'SET_DRAG_START', payload: clientX });
    },
    [dispatch]
  );
  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!state.isDragging) return;
      dispatch({ type: 'SET_DRAG_OFFSET', payload: clientX - state.dragStart });
    },
    [state.isDragging, state.dragStart, dispatch]
  );
  const handleDragEnd = useCallback(() => {
    dispatch({ type: 'SET_IS_DRAGGING', payload: false });
    if (Math.abs(state.dragOffset) > 100) {
      handleVote(state.dragOffset > 0 ? 'for' : 'against');
    }
    dispatch({ type: 'RESET_DRAG' });
  }, [state.dragOffset, handleVote, dispatch]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Abstimmen</h2>
          <div className="mt-0.5 text-[11px] text-neutral-500">
            {selectionLabelForSection('live', state.activeLocation)}
          </div>
        </div>
        <SectionLevelFilterIcon section="live" />
      </div>
      {/* ── Tab-Leiste: Aktuell / Ergebnisse ── */}
      <div
        className="flex gap-1 p-1 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--gov-border, #D6E0EE)',
          boxShadow: '0 2px 8px rgba(0,40,100,0.06)',
        }}
      >
        {(['aktuell', 'ergebnisse'] as const).map((tab) => {
          const isActive = abstimmungTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setAbstimmungTab(tab)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #002855 0%, #0055A4 100%)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(0,60,150,0.20)',
                    }
                  : { color: 'var(--gov-muted, #6B7A99)' }
              }
            >
              {tab === 'aktuell' ? (
                <>
                  Abstimmungen
                  {totalCards > 1 && (
                    <span
                      className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                      style={
                        isActive
                          ? { background: 'rgba(255,255,255,0.2)' }
                          : { background: 'var(--gov-primary-light)' }
                      }
                    >
                      {state.currentCardIndex + 1}/{totalCards}
                    </span>
                  )}
                </>
              ) : (
                'Ergebnisse'
              )}
            </button>
          );
        })}
      </div>

      {/* ── Aktuelle Abstimmung ── */}
      {abstimmungTab === 'aktuell' && currentCard && (
        <>
          <VotingCard
            card={currentCard}
            canVote={currentData.canVote}
            dragOffset={state.dragOffset}
            isDragging={state.isDragging}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onVote={handleVote}
          />

          {/* Voting-Buttons direkt unter der Karte */}
          <VotingControls canVote={currentData.canVote} onVote={handleVote} />

          {/* ── Live-Stats (einklappbar, sekundär) ── */}
          <div className="mt-1">
            <button
              onClick={() => setShowStats((p) => !p)}
              className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 py-1"
            >
              {showStats ? 'Live-Stats ausblenden' : 'Live-Stats anzeigen'}
            </button>

            {showStats && (
              <div
                className="mt-1 rounded-2xl text-white px-4 py-3 flex items-center justify-between gap-3"
                style={{
                  background: 'linear-gradient(135deg, #002855 0%, #003d80 50%, #0055A4 100%)',
                  boxShadow: '0 4px 16px rgba(0,40,120,0.20)',
                }}
              >
                <div className="text-center flex-1">
                  <div className="text-[9px] font-semibold tracking-widest uppercase opacity-55">Live</div>
                  <div className="text-lg font-extrabold">{activeNow.toLocaleString('de-DE')}</div>
                  <div className="text-[10px] opacity-55">Gerade aktiv</div>
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div className="text-center flex-1">
                  <div className="text-[9px] font-semibold tracking-widest uppercase opacity-55">Heute</div>
                  <div className="text-lg font-extrabold">73,4%</div>
                  <div className="text-[10px] opacity-55">Beteiligung</div>
                </div>
              </div>
            )}
          </div>

          {/* ── Clara / KI Bereich am Ende (unter Karte + Controls) ── */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_KI_ANALYSIS' })}
              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: state.showKIAnalysis
                  ? 'linear-gradient(160deg, #2D0B6B 0%, #5B21B6 45%, #7C3AED 75%, #A78BFA 100%)'
                  : 'linear-gradient(160deg, #4C1D95 0%, #6D28D9 35%, #7C3AED 60%, #8B5CF6 80%, #A78BFA 100%)',
                color: '#fff',
                boxShadow: state.showKIAnalysis
                  ? '0 2px 10px rgba(91,33,182,0.50), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 2px 14px rgba(109,40,217,0.45), inset 0 1px 0 rgba(255,255,255,0.20)',
                border: '1px solid rgba(196,181,253,0.25)',
              }}
            >
              {state.showKIAnalysis ? 'Clara ausblenden' : 'Clara-KI Analyse'}
            </button>

            {state.showKIAnalysis && (
              <div className="mt-3">
                <ClaraInfoBox
                  card={currentCard}
                  onOpenChat={(prompt?: string) => {
                    setClaraPrompt(prompt || '');
                    setShowClaraChat(true);
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Ergebnisse ── */}
      {abstimmungTab === 'ergebnisse' && (
        <div className="space-y-3">
          {currentData.vergangen && currentData.vergangen.length > 0 ? (
            currentData.vergangen.map((ergebnis) => (
              <div
                key={ergebnis.id}
                className="bg-white rounded-2xl p-4 shadow-sm border-l-4"
                style={{ borderLeftColor: ergebnis.ergebnis === 'Angenommen' ? '#22c55e' : '#ef4444' }}
              >
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-gray-400 mb-0.5">Vorlage {ergebnis.nummer}</div>
                    <h3 className="font-bold text-sm text-[#1A2B45] leading-snug">{ergebnis.title}</h3>
                  </div>
                  <span
                    className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ergebnis.ergebnis === 'Angenommen'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {ergebnis.ergebnis}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mb-2">
                  {ergebnis.datum} · {ergebnis.votes.toLocaleString('de-DE')} Stimmen
                </div>
                <div className="flex h-6 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ width: `${ergebnis.yes}%` }}
                  >
                    {ergebnis.yes}%
                  </div>
                  <div
                    className="bg-red-500 flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ width: `${ergebnis.no}%` }}
                  >
                    {ergebnis.no}%
                  </div>
                  {ergebnis.abstain > 0 && (
                    <div
                      className="bg-gray-300 flex items-center justify-center text-gray-600 text-[10px]"
                      style={{ width: `${ergebnis.abstain}%` }}
                    >
                      {ergebnis.abstain}%
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border" style={{ borderColor: 'var(--gov-border)' }}>
              <p className="text-sm">Noch keine abgeschlossenen Abstimmungen</p>
            </div>
          )}
        </div>
      )}

      {/* Clara Chat Modal */}
      {showClaraChat && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
          onClick={() => setShowClaraChat(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[80dvh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--gov-border)' }}>
              <span className="text-sm font-bold text-[#1A2B45]">Clara – KI-Analyse</span>
              <button onClick={() => setShowClaraChat(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <ClaraChat
                level="bund"
                onPointsEarned={() => {}}
                selectedWahl={null}
                initialPrompt={claraPrompt}
                autoSendInitialPrompt={Boolean(claraPrompt)}
              />
            </div>
          </div>
        </div>
      )}

      <ClaraVoiceInterface
        isOpen={showClaraVoice}
        onClose={() => setShowClaraVoice(false)}
        currentCard={currentCard}
      />

      {/* Vote-Bestätigung (Glassmorphism-Overlay) */}
      {state.voteResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,20,60,0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="max-w-xs w-full text-center rounded-3xl p-7"
            style={{
              background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}
          >
            {state.voteResult.vote === 'DAFÜR' && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(34,197,94,0.20)', border: '2px solid rgba(34,197,94,0.5)' }}>
                <ThumbsUp size={28} className="text-green-400" />
              </div>
            )}
            {state.voteResult.vote === 'DAGEGEN' && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(239,68,68,0.20)', border: '2px solid rgba(239,68,68,0.5)' }}>
                <ThumbsDown size={28} className="text-red-400" />
              </div>
            )}
            {state.voteResult.vote === 'ENTHALTEN' && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(148,163,184,0.20)', border: '2px solid rgba(148,163,184,0.4)' }}>
                <span className="text-sm font-bold text-slate-300">ENT</span>
              </div>
            )}
            <h3 className="text-base font-bold text-white mb-1">Position in der Demo markiert</h3>
            <p className="text-xs text-white/60 mb-4">{state.voteResult.vote}</p>
            <div
              className="rounded-xl px-4 py-2.5"
              style={{ background: 'rgba(0,168,107,0.25)', border: '1px solid rgba(0,168,107,0.35)' }}
            >
              <span className="text-lg font-extrabold text-green-300">
                +{state.voteResult.points} Punkte
              </span>
            </div>
            <p className="mt-3 text-[10px] text-white/70">
              Punkte zeigen nur Aktivitaet in der Demo, keine rechtliche Wirkung.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSection;
