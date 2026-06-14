'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import { VoteType, AbstimmungTab } from '@/types';
import VotingCard from '@/components/Voting/VotingCard';
import VotingControls from '@/components/Voting/VotingControls';
import { CheckCircle, X } from 'lucide-react';
import { SectionLevelFilterIcon, selectionLabelForSection } from '@/components/Filter/SectionLevelFilterIcon';
import { InfoHint } from '@/components/ui/InfoHint';
import { getVotingStatsForYear } from '@/lib/getVotingStatsForYear';

const VOTING_STATS_YEAR = 2026;

function voteResultHumanLabel(vote: string): string {
  if (vote === 'DAFÜR') return 'Zustimmung';
  if (vote === 'DAGEGEN') return 'Ablehnung';
  if (vote === 'ENTHALTEN') return 'Enthaltung';
  return vote;
}

function isOpenDeadline(deadline?: string): boolean {
  if (!deadline) return false;
  const parts = deadline.trim().split('.');
  if (parts.length !== 3) return false;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return false;
  const end = new Date(y, m - 1, d, 23, 59, 59).getTime();
  return Date.now() <= end;
}

const LiveSection: React.FC = () => {
  const { state, dispatch } = useApp();
  const [abstimmungTab, setAbstimmungTab] = useState<AbstimmungTab>('aktuell');
  const [activeNow, setActiveNow] = useState(3_847_291);
  const [showStats, setShowStats] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkVoteState, setBulkVoteState] = useState<Record<string, VoteType>>({});

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
  const openCards = useMemo(
    () => (currentData?.cards || []).filter((c) => isOpenDeadline(c.deadline)),
    [currentData?.cards],
  );
  const bulkSavedCount = useMemo(
    () => Object.values(bulkVoteState).filter(Boolean).length,
    [bulkVoteState],
  );

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

  const handleBulkVote = useCallback(
    (cardId: string, voteType: VoteType) => {
      if (!currentData?.canVote) return;
      const cardIndex = currentData.cards.findIndex((c) => c.id === cardId);
      if (cardIndex < 0) return;
      const card = currentData.cards[cardIndex];
      dispatch({ type: 'SET_CURRENT_CARD_INDEX', payload: cardIndex });
      dispatch({
        type: 'HANDLE_VOTE',
        payload: {
          voteType,
          card,
          points: card.points,
          earnedPoints: 0,
        },
      });
      dispatch({ type: 'SET_VOTE_RESULT', payload: null });
      setBulkVoteState((prev) => ({ ...prev, [cardId]: voteType }));
    },
    [currentData, dispatch],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="t-meta mt-0.5">
          {selectionLabelForSection('live', state.activeLocation)}
        </div>
        <SectionLevelFilterIcon section="live" />
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-[#E8EEF5] pb-2">
        <button
          type="button"
          onClick={() => setBulkOpen(true)}
          className="min-w-0 text-left"
          aria-label="Liste der offenen Abstimmungen öffnen"
        >
          <p className="text-[11px] font-semibold text-[#1A2B45]">
            Abstimmungen {VOTING_STATS_YEAR}
            {totalCards > 1 ? ` · ${state.currentCardIndex + 1}/${totalCards}` : ''}
          </p>
          <p className="mt-0.5 text-[10px] text-[#6B7A99]">
            {votingStats2026.total2026 > 0
              ? `${votingStats2026.total2026} verfügbar${votingStats2026.open2026 > 0 ? ` · ${votingStats2026.open2026} offen` : ''}`
              : 'Keine Daten in der Vorschau'}
          </p>
        </button>
        <InfoHint label="Abstimmungs-Vorschau">
          <p>Kartenansicht mit Demo-Stimmen — keine echte Abstimmung.</p>
        </InfoHint>
      </div>

      <div className="app-segment flex gap-1">
        {(['aktuell', 'ergebnisse'] as const).map((tab) => {
          const isActive = abstimmungTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setAbstimmungTab(tab)}
              className={`app-segment-btn flex-1 py-2 transition-all ${isActive ? 'app-segment-btn--active' : ''}`}
            >
              {tab === 'aktuell' ? 'Abstimmungen' : 'Ergebnisse'}
            </button>
          );
        })}
      </div>

      {/* ── Aktuelle Abstimmung ── */}
      {abstimmungTab === 'aktuell' && currentCard && (
        <>
          <VotingCard card={currentCard} />

          {/* Voting-Buttons direkt unter der Karte */}
          <VotingControls canVote={currentData.canVote} onVote={handleVote} du={du} compact />

          {/* ── Live-Stats (einklappbar, sekundär) ── */}
          <div className="mt-1">
            <button
              onClick={() => setShowStats((p) => !p)}
              className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 py-1"
            >
              {showStats ? 'Live-Stats ausblenden' : 'Live-Stats anzeigen'}
            </button>

            {showStats && (
              <div className="civic-stats-row mt-1 flex items-center justify-between gap-3 text-[#162033]">
                <div className="text-center flex-1">
                  <div className="t-kicker opacity-55">Live</div>
                  <div className="t-card-title">{activeNow.toLocaleString('de-DE')}</div>
                  <div className="t-caption opacity-70">Gerade aktiv</div>
                </div>
                <div className="h-10 w-px bg-neutral-200" />
                <div className="text-center flex-1">
                  <div className="t-kicker opacity-55">Heute</div>
                  <div className="t-card-title">73,4%</div>
                  <div className="t-caption opacity-70">Beteiligung</div>
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
                className="civic-result-row border-l-4"
                style={{ borderLeftColor: ergebnis.ergebnis === 'Angenommen' ? '#34D399' : '#F59E0B' }}
              >
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="t-caption mb-0.5">Vorlage {ergebnis.nummer}</div>
                    <h3 className="t-card-title">{ergebnis.title}</h3>
                  </div>
                  <span
                    className={`status-pill flex-shrink-0 ${
                      ergebnis.ergebnis === 'Angenommen'
                        ? 'status-pill--mint'
                        : 'status-pill--amber'
                    }`}
                  >
                    {ergebnis.ergebnis}
                  </span>
                </div>
                <div className="t-caption mb-2">
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

      {/* Clara-Chat & Voice: global im ClaraDock — kein zweites Modal in dieser Section. */}

      {/* Vote-Bestätigung — neutral, ohne Rot/Grün-Signalfarben */}
      {state.voteResult && (
        <div
          className="civic-vote-feedback-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="vote-feedback-title"
        >
          <div className="civic-vote-feedback-card">
            <div className="civic-vote-feedback-icon" aria-hidden>
              <CheckCircle size={28} className="text-[var(--color-civic-blue)]" />
            </div>
            <h3 id="vote-feedback-title" className="civic-vote-feedback-title">
              {du ? 'Deine Auswahl wurde erfasst.' : 'Ihre Auswahl wurde erfasst.'}
            </h3>
            <p className="civic-vote-feedback-meta">{voteResultHumanLabel(state.voteResult.vote)}</p>
            <p className="civic-vote-feedback-note">
              {du
                ? 'Mitwirkungspunkte sind unabhängig von deiner Entscheidung.'
                : 'Mitwirkungspunkte sind unabhängig von Ihrer Entscheidung.'}
            </p>
            <button
              type="button"
              className="civic-vote-feedback-btn civic-vote-feedback-btn--primary"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'SET_VOTE_RESULT', payload: null });
              }}
            >
              Schließen
            </button>
            <button
              type="button"
              className="civic-vote-feedback-btn"
              onClick={(e) => {
                e.stopPropagation();
                performUndo();
              }}
            >
              Rückgängig
            </button>
          </div>
        </div>
      )}
      {bulkOpen && (
        <div className="civic-bulk-vote-sheet" role="dialog" aria-modal="true" aria-label="Bulk-Abstimmung">
          <button
            type="button"
            className="absolute inset-0 bg-black/22"
            onClick={() => setBulkOpen(false)}
            aria-label="Bulk-Abstimmung schließen"
          />
          <div className="relative z-10 mx-auto w-full max-w-[390px] rounded-t-3xl border border-neutral-200 bg-[#F8FAFD] p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="t-card-title text-[15px]">Offene Abstimmungen {VOTING_STATS_YEAR}</p>
                <p className="t-caption">Schnellabgabe · gleiche Logik wie Kartenansicht</p>
              </div>
              <button
                type="button"
                onClick={() => setBulkOpen(false)}
                className="btn-icon inline-flex min-h-[40px] min-w-[40px] items-center justify-center"
                aria-label="Bulk-Abstimmung schließen"
              >
                <X className="h-4 w-4 text-neutral-600" aria-hidden />
              </button>
            </div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] text-neutral-500">
                Zurück zu den einzelnen Karten jederzeit über <span className="font-semibold">×</span>.
              </p>
              <button
                type="button"
                onClick={() => setBulkOpen(false)}
                className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Zur Kartenansicht
              </button>
            </div>
            {bulkSavedCount > 0 ? (
              <div className="mb-2 rounded-xl border border-[#D6E8E5] bg-[#F2FBF9] px-2.5 py-1.5 text-[11px] font-medium text-[#0F766E]">
                {bulkSavedCount} Auswahl{bulkSavedCount > 1 ? 'en' : ''} gespeichert
              </div>
            ) : null}
            <div className="intro-scroll-visible max-h-[55vh] space-y-2 overflow-y-auto pr-0.5">
              {openCards.length > 0 ? (
                openCards.map((card) => {
                  const selected = bulkVoteState[card.id];
                  return (
                    <div
                      key={card.id}
                      className="app-card p-2.5"
                      style={{
                        borderColor: selected ? '#CFE7E3' : 'var(--gov-border, #D6E0EE)',
                        background: selected ? '#FCFFFE' : 'rgba(255,255,255,0.98)',
                      }}
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="text-[11px] font-semibold text-[#1A2B45]">{card.title}</div>
                        {selected ? (
                          <span className="mt-0.5 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#14B8A6]" aria-label="Auswahl gespeichert" />
                        ) : null}
                      </div>
                      <div className="mb-2 text-[10px] text-neutral-500">Frist {card.deadline}</div>
                      <div className="civic-vote-actions civic-vote-actions--compact">
                        <button
                          type="button"
                          onClick={() => handleBulkVote(card.id, 'against')}
                          className={`civic-vote-action civic-vote-action--reject${selected === 'against' ? ' civic-vote-action--selected' : ''}`}
                          aria-pressed={selected === 'against'}
                          aria-label="Ablehnen"
                        >
                          Ablehnen
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkVote(card.id, 'abstain')}
                          className={`civic-vote-action civic-vote-action--abstain${selected === 'abstain' ? ' civic-vote-action--selected' : ''}`}
                          aria-pressed={selected === 'abstain'}
                          aria-label="Enthalten"
                        >
                          Enthalten
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkVote(card.id, 'for')}
                          className={`civic-vote-action civic-vote-action--accept${selected === 'for' ? ' civic-vote-action--selected' : ''}`}
                          aria-pressed={selected === 'for'}
                          aria-label="Zustimmen"
                        >
                          Zustimmen
                        </button>
                      </div>
                      {selected ? (
                        <p className="mt-1.5 text-[12px] text-[var(--color-text-secondary)]">
                          {voteResultHumanLabel(
                            selected === 'for' ? 'DAFÜR' : selected === 'against' ? 'DAGEGEN' : 'ENTHALTEN',
                          )}
                        </p>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="card-info p-3 text-[11px] text-neutral-600">
                  Aktuell keine offenen Abstimmungen in dieser Auswahl.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSection;
