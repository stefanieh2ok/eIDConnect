'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import OriginalStimmzettel from '@/components/Voting/OriginalStimmzettel';
import { default as ClaraChat } from '@/components/Clara/ClaraChat';

const StimmzettelModal: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showClaraChat, setShowClaraChat] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const isVotingOpen =
    state.selectedWahl?.demoElectionStatus === 'offen' || state.selectedWahl?.datum === 'aktuell';

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_STIMMZETTEL' });
    setShowClaraChat(false);
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
      setShowClaraChat(false);
      setVoteSuccess(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [voteSuccess, dispatch]);

  const handleKIAnalysis = (type: 'kandidat' | 'partei', data: any) => {
    console.log('KI Analysis:', { type, data });
  };

  const handleOpenClaraChat = (context?: string) => {
    setShowClaraChat(true);
  };

  if (!state.showStimmzettel || !state.selectedWahl) return null;

  // Bestimme Wahlebene basierend auf selectedWahl
  let level: 'bund' | 'land' | 'kommune' | 'kreis' = 'bund';
  
  // Prüfe zuerst das level-Feld direkt
  if (state.selectedWahl.level) {
    level = state.selectedWahl.level as any;
  } else if (state.selectedWahl.id?.includes('sl') || state.selectedWahl.id?.includes('land') || state.selectedWahl.wahlkreis?.includes('Saarland')) {
    level = 'land';
  } else if (state.selectedWahl.id?.includes('kk') || state.selectedWahl.id?.includes('kirkel') || state.selectedWahl.wahlkreis?.includes('Kirkel')) {
    level = 'kommune';
  } else if (state.selectedWahl.id?.includes('btw') || state.selectedWahl.name?.includes('Bundestag')) {
    level = 'bund';
  }

  const wahlLoc = state.selectedWahl?.location;
  const kommuneBallot: 'kirkel' | 'heidelberg' | 'viernheim' =
    wahlLoc === 'heidelberg' ? 'heidelberg' : wahlLoc === 'viernheim' ? 'viernheim' : 'kirkel';

  return (
    <>
      <div className="absolute inset-0 z-[99998] flex flex-col overflow-hidden rounded-b-[1.75rem] bg-[#EEF3F8]">
        <div
          className="flex items-center justify-between px-4 py-2.5 text-white"
          style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)' }}
        >
          <button
            onClick={handleClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white"
            aria-label="Stimmzettel schließen"
          >
            <span className="text-base font-bold leading-none">×</span>
          </button>
          <h2 className="mx-2 truncate text-[15px] font-bold" style={{ letterSpacing: '-0.01em' }}>
            Stimmzettel
          </h2>
          <div className="w-8 flex-shrink-0" />
        </div>

        <div
          className="stimmzettel-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)' }}
        >
          <div className="p-3 max-w-full">
            {voteSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">Auswahl gespeichert</h3>
                <p className="text-gray-600">Nur Teil der Konzeptdemo, ohne rechtliche Wirkung.</p>
              </div>
            ) : (
              <>
                <div className="mb-3 rounded-xl border border-neutral-200 bg-white p-3 text-[12px] text-neutral-700">
                  {isVotingOpen ? 'Status: Laufend (Demo-Teilnahme möglich)' : 'Status: Abgeschlossen / Ergebnisansicht'}
                </div>

                <OriginalStimmzettel
                  level={level as any}
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
          </div>
        </div>
      </div>

      {/* Clara Chat Modal - iPhone Format */}
      {showClaraChat && (
        <div className="intro-safe-overlay z-[99999] flex items-center justify-center p-4" style={{
          background: 'linear-gradient(135deg, #E8F0F8 0%, #D0DCE8 50%, #B8C8D8 100%)'
        }}>
          <div
            className="relative"
            style={{
              width: 'min(393px, calc(100vw - 2rem))',
              height: 'min(852px, calc(100dvh - 2rem))',
              maxHeight: '100dvh',
            }}
          >
            {/* iPhone Notch – gleiche Größe wie Hauptapp */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-black rounded-b-3xl z-50" />

            <div className="w-full h-full bg-gray-50 rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-black relative flex flex-col pt-9">
              {/* iPhone Header – kompakt */}
              <div className="text-white px-4 py-3 flex-shrink-0 flex justify-between items-center" style={{background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)'}}>
                <button
                  onClick={() => setShowClaraChat(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white"
                  aria-label="Clara Chat schließen"
                >
                  <span className="text-base font-bold leading-none">×</span>
                </button>
                <h2 className="text-lg font-black truncate mx-2" style={{letterSpacing: '-0.02em'}}>Clara Chat</h2>
                <div className="w-8 flex-shrink-0"></div>
              </div>
              
              {/* Content Area – Clara füllt Höhe, Chat scrollt innen */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 p-4 flex flex-col">
                  <ClaraChat
                    level={level}
                    selectedWahl={state.selectedWahl}
                    onPointsEarned={(points) => {
                      // Points handling
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StimmzettelModal;
