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

  // Bestimme Wahl-Level basierend auf selectedWahl
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
      <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #E8F0F8 0%, #D0DCE8 50%, #B8C8D8 100%)'
      }}>
        <div className="relative" style={{width: '393px', height: '852px'}}>
          {/* iPhone Notch – gleiche Größe wie Hauptapp */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-black rounded-b-3xl z-50" />

          <div className="w-full h-full bg-gray-50 rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-black relative flex flex-col">
            {/* iPhone Header – kompakt */}
            <div className="text-white px-4 py-3 flex-shrink-0 flex justify-between items-center" style={{background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)'}}>
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 text-white min-w-0"
              >
                <span className="text-base font-bold leading-none">x</span>
                <span className="text-sm font-bold truncate">Zurück</span>
              </button>
              <h2 className="text-lg font-black truncate mx-2" style={{letterSpacing: '-0.02em'}}>Stimmzettel</h2>
              <div className="w-14 flex-shrink-0"></div>
            </div>
            
            {/* Content Area – Scrollbar in Akzentfarbe für gute Sichtbarkeit */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden stimmzettel-scroll" style={{paddingBottom: '24px'}}>
              <div className="p-4 max-w-full">
                {voteSuccess ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Auswahl in der Demo gespeichert</h3>
                    <p className="text-gray-600">Die Eingabe ist nur Teil der Konzeptdemo und hat keine rechtliche Wirkung.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 rounded-xl border border-neutral-200 bg-white p-3 text-[11px] text-neutral-700">
                      <span className="font-semibold">Status:</span>{' '}
                      {isVotingOpen ? 'Laeuft aktuell (Demo-Teilnahme moeglich)' : 'Abgeschlossen / Ergebnisansicht (nicht mehr abstimmbar)'}
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
        </div>
      </div>

      {/* Clara Chat Modal - iPhone Format */}
      {showClaraChat && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{
          background: 'linear-gradient(135deg, #E8F0F8 0%, #D0DCE8 50%, #B8C8D8 100%)'
        }}>
          <div className="relative" style={{width: '393px', height: '852px'}}>
            {/* iPhone Notch – gleiche Größe wie Hauptapp */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-black rounded-b-3xl z-50" />

            <div className="w-full h-full bg-gray-50 rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-black relative flex flex-col">
              {/* iPhone Header – kompakt */}
              <div className="text-white px-4 py-3 flex-shrink-0 flex justify-between items-center" style={{background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)'}}>
                <button
                  onClick={() => setShowClaraChat(false)}
                  className="flex items-center gap-1.5 text-white min-w-0"
                >
                  <span className="text-base font-bold leading-none">x</span>
                  <span className="text-sm font-bold truncate">Zurück</span>
                </button>
                <h2 className="text-lg font-black truncate mx-2" style={{letterSpacing: '-0.02em'}}>Clara Chat</h2>
                <div className="w-14 flex-shrink-0"></div>
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
