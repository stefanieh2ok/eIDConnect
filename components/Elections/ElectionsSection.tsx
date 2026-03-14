'use client';

import React, { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { WAHLEN_DATA } from '@/data/constants';
import { ChevronRight } from 'lucide-react';

interface ElectionsSectionProps {
  currentLocation?: string;
  /** Gewählte Ebene: nur Wahlen dieser Ebene anzeigen (Bund → Bundestag, Land → Landtag, Kreis → Kreistag, Kommune → Kommunalwahl) */
  currentLevel?: string;
  userWahlkreisByLevel?: { bund: string; land: string; kreis: string; kommune: string };
}

const LEVEL_NORMALIZE: Record<string, string> = { bund: 'bund', land: 'land', kreis: 'kreis', kommune: 'kommune' };

const ElectionsSection: React.FC<ElectionsSectionProps> = ({ currentLocation: propLocation, currentLevel: propLevel, userWahlkreisByLevel }) => {
  const { state, dispatch } = useApp();
  const votedIds = state.votedElectionIds || [];
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const markImageError = useCallback((key: string) => {
    setImageErrors(prev => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);
  
  const currentLocation = propLocation || state.activeLocation || 'deutschland';
  const currentLevel = propLevel ? LEVEL_NORMALIZE[propLevel.toLowerCase()] || propLevel.toLowerCase() : null;

  const handleStimmzettelClick = (wahl: any) => {
    const displayWahlkreis = userWahlkreisByLevel && wahl.level ? (userWahlkreisByLevel[wahl.level as keyof typeof userWahlkreisByLevel] || wahl.wahlkreis) : wahl.wahlkreis;
    dispatch({ type: 'SET_SELECTED_WAHL', payload: { ...wahl, wahlkreis: displayWahlkreis } });
    dispatch({ type: 'TOGGLE_STIMMZETTEL' });
  };

  // Nur Wahlen der ausgewählten Ebene anzeigen: Bund → Bundestagswahlen (+ Kandidaten/Programm), Land → Landtag, Kreis → Kreistag, Kommune → Kommunalwahl
  const filteredWahlen = WAHLEN_DATA.filter(wahl => {
    if (currentLevel) return wahl.level === currentLevel;
    const locationMap: Record<string, string[]> = {
      'deutschland': ['deutschland', 'bund'],
      'saarland': ['saarland', 'land'],
      'saarpfalz': ['saarpfalz', 'kreis'],
      'kirkel': ['kirkel', 'kommune']
    };
    const locations = locationMap[currentLocation] ?? ['deutschland', 'bund', currentLocation];
    return (wahl.location && locations.includes(wahl.location)) ||
           (wahl.level && locations.includes(wahl.level));
  });

  const getLevelBadge = (level?: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'bund': { bg: 'bg-slate-500', text: 'text-white', label: 'Bund' },
      'land': { bg: 'bg-blue-900', text: 'text-white', label: 'Land' },
      'kreis': { bg: 'bg-blue-400', text: 'text-white', label: 'Kreis' },
      'kommune': { bg: 'bg-blue-600', text: 'text-white', label: 'Kommune' }
    };
    
    const badge = badges[level || 'bund'] || badges['bund'];
    return badge;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--gov-heading)' }}>Kommende Wahlen</h2>
      
      {filteredWahlen.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">Keine Wahlen für diese Ebene verfügbar</p>
        </div>
      ) : (
        filteredWahlen.map(wahl => {
          const badge = getLevelBadge(wahl.level);
          const hasVoted = votedIds.includes(wahl.id);
          return (
            <div key={wahl.id} className="glass-panel rounded-2xl p-5 mb-4 border border-gray-200/60">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--gov-heading)' }}>{wahl.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">{wahl.datum}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasVoted && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      Bereits abgestimmt
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">Wahlkreis {userWahlkreisByLevel && wahl.level ? (userWahlkreisByLevel[wahl.level as keyof typeof userWahlkreisByLevel] || wahl.wahlkreis) : wahl.wahlkreis}</p>

              <button
                onClick={() => handleStimmzettelClick(wahl)}
                className="w-full text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                style={{ background: 'var(--gov-btn)' }}
              >
                {hasVoted ? 'Stimmzettel erneut ansehen' : 'Stimmzettel ansehen'}
              </button>

              {wahl.kandidaten && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Kandidaten (Auszug):</h4>
                  {wahl.kandidaten.map((k, i) => {
                    const imgKey = `${wahl.id}-${i}`;
                    const avatarKey = `${wahl.id}-${i}-avatar`;
                    const avatarFailed = imageErrors[avatarKey];
                    const useRealImage = k.image && !imageErrors[imgKey];
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(k.name.replace(/,/g, ' '))}&size=128&background=1e3a8a&color=fff`;
                    const imageSrc = useRealImage ? k.image! : avatarUrl;
                    const showEmoji = avatarFailed;
                    return (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 mb-2 flex items-center gap-3">
                      <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {showEmoji ? (
                          <span className="text-2xl">{k.emoji || '👤'}</span>
                        ) : (
                          <img
                            src={imageSrc}
                            alt={k.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => markImageError(useRealImage ? imgKey : avatarKey)}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{k.name}</div>
                        <div className="text-xs text-gray-600">{k.partei} • {k.alter} Jahre</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {k.positionen.map((pos, j) => (
                            <span key={j} className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-xs">
                              {pos}
                            </span>
                          ))}
                        </div>
                        {(k.quelle || k.quelleUrl) && (
                          <p className="text-[10px] text-gray-500 mt-1">
                            {k.quelleUrl ? (
                              <a
                                href={k.quelleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Quelle: {k.quelle || 'kirkel.de'}
                              </a>
                            ) : (
                              <>Quelle: {k.quelle}</>
                            )}
                          </p>
                        )}
                        {(k as { confirmedByCandidate?: boolean }).confirmedByCandidate && (
                          <p className="text-[10px] text-emerald-600 mt-1 font-medium">Von Kandidat*in bestätigt</p>
                        )}
                      </div>
                    </div>
                  ); })}
                </div>
              )}
            </div>
          );
        })
      )}

    </div>
  );
};

export default ElectionsSection;
