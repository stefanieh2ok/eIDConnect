'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import OriginalStimmzettel from '@/components/Voting/OriginalStimmzettel';
import { DocumentViewer } from '@/components/ui/DocumentViewer';

const StimmzettelModal: React.FC = () => {
  const { state, dispatch } = useApp();
  const [voteSuccess, setVoteSuccess] = useState(false);
  const isVotingOpen =
    state.selectedWahl?.demoElectionStatus === 'offen' || state.selectedWahl?.datum === 'aktuell';

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_STIMMZETTEL' });
    setVoteSuccess(false);
  };

  const handleVote = (level: string, candidate: string, party: string) => {
    if (!isVotingOpen) return;
    const wahlId = state.selectedWahl?.id;
    if (wahlId) {
      dispatch({ type: 'RECORD_ELECTION_VOTE', payload: wahlId });
      setVoteSuccess(true);
    }
  };

  useEffect(() => {
    if (!voteSuccess) return;
    const t = setTimeout(() => {
      dispatch({ type: 'TOGGLE_STIMMZETTEL' });
      setVoteSuccess(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [voteSuccess, dispatch]);

  const handleKIAnalysis = (type: 'kandidat' | 'partei', data: unknown) => {
    void type;
    void data;
  };

  const handleOpenClaraChat = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('clara:open-chat'));
  };

  if (!state.showStimmzettel || !state.selectedWahl) return null;

  let level: 'bund' | 'land' | 'kommune' | 'kreis' = 'bund';

  if (state.selectedWahl.level) {
    level = state.selectedWahl.level as typeof level;
  } else if (
    state.selectedWahl.id?.includes('sl') ||
    state.selectedWahl.id?.includes('land') ||
    state.selectedWahl.wahlkreis?.includes('Saarland')
  ) {
    level = 'land';
  } else if (
    state.selectedWahl.id?.includes('kk') ||
    state.selectedWahl.id?.includes('kirkel') ||
    state.selectedWahl.wahlkreis?.includes('Kirkel')
  ) {
    level = 'kommune';
  } else if (
    state.selectedWahl.id?.includes('btw') ||
    state.selectedWahl.name?.includes('Bundestag')
  ) {
    level = 'bund';
  }

  const wahlLoc = state.selectedWahl?.location;
  const kommuneBallot: 'kirkel' | 'heidelberg' | 'viernheim' =
    wahlLoc === 'heidelberg' ? 'heidelberg' : wahlLoc === 'viernheim' ? 'viernheim' : 'kirkel';

  return (
    <DocumentViewer
      open
      title="Stimmzettel"
      subtitle={state.selectedWahl.name}
      sourceLabel="Quelle: Wahlvorschau · Demo-Dokument"
      onClose={handleClose}
      onBack={handleClose}
      onInfo={handleOpenClaraChat}
    >
      {voteSuccess ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <h3 className="mb-2 text-xl font-bold text-[var(--color-text-primary)]">Auswahl gespeichert</h3>
          <p className="text-[var(--color-text-secondary)]">Nur Teil der Konzeptdemo, ohne rechtliche Wirkung.</p>
        </div>
      ) : (
        <>
          <p className="mb-3 rounded-xl border border-[var(--color-border)] bg-white p-3 text-[13px] text-[var(--color-text-secondary)]">
            {isVotingOpen ? 'Status: Laufend (Vorschau)' : 'Status: Abgeschlossen / Ergebnisansicht'}
          </p>
          <OriginalStimmzettel
            level={level as 'bund' | 'land' | 'kommune' | 'kreis'}
            wahlkreis={state.selectedWahl?.wahlkreis}
            selectedWahl={state.selectedWahl}
            du={state.anrede === 'du'}
            canVote={isVotingOpen}
            kommuneBallot={level === 'kommune' ? kommuneBallot : undefined}
            onVote={handleVote}
            onKIAnalysis={handleKIAnalysis}
            onOpenClaraChat={handleOpenClaraChat}
          />
        </>
      )}
    </DocumentViewer>
  );
};

export default StimmzettelModal;
