'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import { VoteType, AbstimmungTab } from '@/types';
import VotingCard from '@/components/Voting/VotingCard';
import VotingControls from '@/components/Voting/VotingControls';
import ClaraVoiceInterface from '@/components/Clara/ClaraVoiceInterface';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { SectionLevelFilterIcon, selectionLabelForSection } from '@/components/Filter/SectionLevelFilterIcon';
import { getVotingStatsForYear } from '@/lib/getVotingStatsForYear';

const VOTING_STATS_YEAR = 2026;

function voteResultHumanLabel(vote: string): string {
  if (vote === 'DAFÜR') return 'Zustimmung';
  if (vote === 'DAGEGEN') return 'Ablehnung';
  if (vote === 'ENTHALTEN') return 'Enthaltung';
  return vote;
}

const LiveSection: React.FC = () => {
  const { state, dispatch } = useApp();
  const [abstimmungTab, setAbstimmungTab] = useState<AbstimmungTab>('aktuell');
  const [showClaraVoice, setShowClaraVoice] = useState(false);
  const [activeNow, setActiveNow] = useState(3_847_291);
  const [showStats, setShowStats] = useState(false);

  const pendingAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingVoteMetaRef = useRef<{ fromIndex: number; points: number } | null>(null);
  const completedVoteStack = useRef<Array<{ previousIndex: number; points: number }>>([]);

  const loc = state.activeLocation;
  const currentData =
    VOTING_DATA[loc] ??
    VOTING_DATA[loc === 'deutschland' ? 'bundesweit' : loc] ??
    VOTING_DATA.bundesweit;
  const currentCard =
    abstimmungTab === 'aktuell' ? currentData?.cards[state.currentCardIndex] : null;
  const totalCards = currentData?.cards?.length ?? 0;

  const votingStats2026 = useMemo(
    () => getVotingStatsForYear(currentData, VOTING_STATS_YEAR),
    [currentData],
  );

  const du = state.anrede === 'du';

  useEffect(() => {
    const id = setInterval(() => {
      setActiveNow((p) => p + Math.floor(Math.random() * 800) - 350);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
    };
  }, []);

  useEffect(() => {
    completedVoteStack.current = [];
    if (pendingAdvanceRef.current) {
      clearTimeout(pendingAdvanceRef.current);
      pendingAdvanceRef.current = null;
    }
    if (pendingVoteMetaRef.current) {
      const pts = pendingVoteMetaRef.current.points;
      pendingVoteMetaRef.current = null;
      dispatch({ type: 'DEMO_REVERT_VOTE', payload: { points: pts } });
    }
  }, [loc, dispatch]);

  const performUndo = useCallback(() => {
    if (pendingAdvanceRef.current && pendingVoteMetaRef.current) {
      clearTimeout(pendingAdvanceRef.current);
      pendingAdvanceRef.current = null;
      const { points } = pendingVoteMetaRef.current;
      pendingVoteMetaRef.current = null;
      dispatch({ type: 'DEMO_REVERT_VOTE', payload: { points } });
      return;
    }
    const last = completedVoteStack.current.pop();
    if (last) {
      dispatch({ type: 'SET_CURRENT_CARD_INDEX', payload: last.previousIndex });
      dispatch({ type: 'DEMO_REVERT_VOTE', payload: { points: last.points } });
    }
  }, [dispatch]);

  const executeVote = useCallback(
    (voteType: VoteType) => {
      if (!currentData?.canVote || !currentCard) return;
      if (pendingAdvanceRef.current) return;
      const earnedPoints = 0;

      const fromIndex = state.currentCardIndex;
      pendingVoteMetaRef.current = { fromIndex, points: earnedPoints };

      dispatch({
        type: 'HANDLE_VOTE',
        payload: {
          voteType,
          card: currentCard,
          points: currentCard.points,
          earnedPoints,
        },
      });

      pendingAdvanceRef.current = setTimeout(() => {
        dispatch({ type: 'SET_VOTE_RESULT', payload: null });
        const next = fromIndex < totalCards - 1 ? fromIndex + 1 : 0;
        dispatch({ type: 'SET_CURRENT_CARD_INDEX', payload: next });
        if (state.showKIAnalysis) dispatch({ type: 'TOGGLE_KI_ANALYSIS' });
        completedVoteStack.current.push({ previousIndex: fromIndex, points: earnedPoints });
        pendingVoteMetaRef.current = null;
        pendingAdvanceRef.current = null;
      }, 2200);
    },
    [
      currentCard,
      currentData?.canVote,
      totalCards,
      state.currentCardIndex,
      state.showKIAnalysis,
      dispatch,
    ]
  );

  const handleVote = useCallback(
    (voteType: VoteType) => {
      if (!currentData?.canVote || !currentCard) return;
      if (pendingAdvanceRef.current) return;
      executeVote(voteType);
    },
    [currentCard, currentData?.canVote, executeVote]
  );

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

      <div
        className="min-w-0 rounded-xl px-3 py-2 break-words"
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: '1px solid var(--gov-border, #D6E0EE)',
          boxShadow: '0 1px 6px rgba(0,40,100,0.06)',
        }}
      >
        <p className="text-[11px] font-semibold text-[#1A2B45]">Abstimmungen {VOTING_STATS_YEAR}</p>
        <p className="mt-0.5 text-[10px] leading-snug text-neutral-600">
          {votingStats2026.total2026 > 0 ? (
            <>
              {VOTING_STATS_YEAR} · {votingStats2026.total2026} Abstimmungen verfügbar
              {votingStats2026.open2026 > 0 ? ` · ${votingStats2026.open2026} aktuell offen` : null}
            </>
          ) : (
            <>Für {VOTING_STATS_YEAR} sind in dieser Demo-Ansicht keine Abstimmungsdaten hinterlegt.</>
          )}
        </p>
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
          <VotingCard card={currentCard} introProConExpanded />

          {/* Voting-Buttons direkt unter der Karte */}
          <VotingControls canVote={currentData.canVote} onVote={handleVote} du={du} />

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

          {/*
            Hinweis: Clara ist jetzt global ausschliesslich ueber das ClaraDock am
            unteren Rand erreichbar (Text-Chat + Voice). Die ehemals hier platzierte
            ClaraInfoBox + "Clara-KI Analyse"-Toggle wurden entfernt, um doppelte
            Einstiegspunkte zu vermeiden (UX-Direktive: ein Clara-Ort).
          */}
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
                <div
                  className="rounded-full p-[1.5px]"
                  style={{ background: 'linear-gradient(90deg, #dc2626 0%, #94a3b8 50%, #16a34a 100%)' }}
                >
                  <div className="flex h-6 w-full min-w-0 overflow-hidden rounded-full" style={{ background: 'rgba(15, 23, 42, 0.04)' }}>
                    <div
                      className="flex min-w-0 items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        width: `${ergebnis.no}%`,
                        background: 'linear-gradient(180deg, #f87171 0%, #dc2626 45%, #b91c1c 100%)',
                      }}
                    >
                      {ergebnis.no > 0 ? `${ergebnis.no}%` : ''}
                    </div>
                    <div
                      className="flex min-w-0 items-center justify-center text-[10px] font-semibold"
                      style={{
                        width: `${ergebnis.abstain}%`,
                        background: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 50%, #64748b 100%)',
                        color: 'rgba(15, 23, 42, 0.9)',
                      }}
                    >
                      {ergebnis.abstain > 0 ? `${ergebnis.abstain}%` : ''}
                    </div>
                    <div
                      className="flex min-w-0 items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        width: `${ergebnis.yes}%`,
                        background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 45%, #15803d 100%)',
                      }}
                    >
                      {ergebnis.yes > 0 ? `${ergebnis.yes}%` : ''}
                    </div>
                  </div>
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

      {/* Hinweis: Clara-Chat & Voice liegen jetzt global im ClaraDock (unten in der App),
          damit es nur einen einzigen Clara-Gesprächsort gibt. Die Karten-InfoBox triggert
          den Dock-Chat per CustomEvent ("clara:open-chat") – kein zweites Modal mehr. */}
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
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="vote-feedback-title"
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
            <h3 id="vote-feedback-title" className="text-base font-bold text-white mb-1">
              {du ? 'Deine Auswahl wurde in der Demo erfasst.' : 'Ihre Auswahl wurde in der Demo erfasst.'}
            </h3>
            <p className="text-xs text-white/75 mb-4">{voteResultHumanLabel(state.voteResult.vote)}</p>
            <div
              className="rounded-xl px-4 py-2.5 text-sm text-white/90"
              style={{ background: 'rgba(148,163,184,0.2)', border: '1px solid rgba(148,163,184,0.35)' }}
            >
              Demo-Hinweis · keine echte Abstimmung
            </div>
            <p className="mt-3 text-[10px] text-white/70">
              Diese Auswahl dient nur der Demo ohne rechtliche Wirkung.
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-white/25 py-2.5 text-xs font-semibold text-white/90 hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                performUndo();
              }}
            >
              Rückgängig (löscht diese Demo-Abstimmung)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSection;
