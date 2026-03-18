'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { WAHLEN_DATA } from '@/data/constants';
import { Wahl } from '@/types';

interface ElectionsSectionProps {
  currentLocation?: string;
  /** Gewählte Ebene: nur Wahlen dieser Ebene anzeigen (Bund → Bundestag, Land → Landtag, Kreis → Kreistag, Kommune → Kommunalwahl) */
  currentLevel?: string;
  userWahlkreisByLevel?: { bund: string; land: string; kreis: string; kommune: string };
  /** Dynamische Wahlen (aus Wikidata), ergänzen die statischen Daten */
  dynamicWahlen?: Wahl[];
}

const LEVEL_NORMALIZE: Record<string, string> = { bund: 'bund', land: 'land', kreis: 'kreis', kommune: 'kommune' };

const ElectionsSection: React.FC<ElectionsSectionProps> = ({ currentLocation: propLocation, currentLevel: propLevel, userWahlkreisByLevel, dynamicWahlen }) => {
  const { state, dispatch } = useApp();
  const votedIds = state.votedElectionIds || [];
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const markImageError = useCallback((key: string) => {
    setImageErrors(prev => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);
  
  const currentLocation = propLocation || state.activeLocation || 'deutschland';
  const currentLevel = propLevel ? LEVEL_NORMALIZE[propLevel.toLowerCase()] || propLevel.toLowerCase() : null;

  const allWahlen = useMemo(() => {
    const base = [...WAHLEN_DATA];
    if (dynamicWahlen) {
      for (const dw of dynamicWahlen) {
        if (!base.some(w => w.id === dw.id)) base.push(dw);
      }
    }
    return base;
  }, [dynamicWahlen]);

  const handleStimmzettelClick = (wahl: Wahl) => {
    const displayWahlkreis = userWahlkreisByLevel && wahl.level ? (userWahlkreisByLevel[wahl.level as keyof typeof userWahlkreisByLevel] || wahl.wahlkreis) : wahl.wahlkreis;
    dispatch({ type: 'SET_SELECTED_WAHL', payload: { ...wahl, wahlkreis: displayWahlkreis } });
    dispatch({ type: 'TOGGLE_STIMMZETTEL' });
  };

  const filteredWahlen = allWahlen.filter(wahl => {
    if (!currentLevel) {
      const locationMap: Record<string, string[]> = {
        'deutschland': ['deutschland'],
        'saarland': ['saarland'],
        'saarpfalz': ['saarpfalz'],
        'kirkel': ['kirkel'],
      };
      const locations = locationMap[currentLocation] ?? [currentLocation];
      return wahl.location && locations.includes(wahl.location);
    }
    if (wahl.level !== currentLevel) return false;
    if (currentLevel === 'land' && currentLocation && currentLocation !== 'deutschland') {
      return wahl.location === currentLocation;
    }
    if (currentLevel === 'kreis' && userWahlkreisByLevel?.kreis) {
      const userKreis = userWahlkreisByLevel.kreis.toLowerCase().replace(/^(kreis|landkreis)\s+/, '').trim();
      const wahlKreis = wahl.wahlkreis.toLowerCase().replace(/^(kreis|landkreis)\s+/, '').trim();
      return userKreis === wahlKreis || userKreis.includes(wahlKreis) || wahlKreis.includes(userKreis);
    }
    if (currentLevel === 'kommune' && userWahlkreisByLevel?.kommune) {
      const userKommune = userWahlkreisByLevel.kommune.toLowerCase().trim();
      const wahlKreis = wahl.wahlkreis.toLowerCase().trim();
      return userKommune === wahlKreis || userKommune.includes(wahlKreis) || wahlKreis.includes(userKommune);
    }
    return true;
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
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">
            Noch keine Wahldaten für diese Ebene
            {userWahlkreisByLevel && (currentLevel === 'kreis' ? userWahlkreisByLevel.kreis : currentLevel === 'kommune' ? userWahlkreisByLevel.kommune : '') && (
              <span className="font-normal"> – {currentLevel === 'kreis' ? userWahlkreisByLevel.kreis : currentLevel === 'kommune' ? userWahlkreisByLevel.kommune : ''}</span>
            )}
          </p>
          <p className="text-xs text-slate-500">
            Für diesen Ort liegen noch keine lokalen Wahl- und Politikerdaten vor. Bundesweite Informationen sind im Tab „Deutschland“ verfügbar.
          </p>
          {userWahlkreisByLevel && (userWahlkreisByLevel.kreis || userWahlkreisByLevel.kommune) && (
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={`https://de.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(currentLevel === 'kreis' ? userWahlkreisByLevel.kreis : userWahlkreisByLevel.kommune)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Wikipedia durchsuchen →
              </a>
              {currentLevel === 'kreis' && (
                <a
                  href="https://de.wikipedia.org/wiki/Liste_der_Landr%C3%A4te_in_Deutschland"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Landräte-Übersicht →
                </a>
              )}
            </div>
          )}
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
                  {wahl.datum !== 'aktuell' && <div className="text-sm text-gray-600 mt-1">{wahl.datum}</div>}
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

              {wahl.kandidaten && wahl.kandidaten.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Amtsträger / Kandidaten:</h4>
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
                        <div className="text-xs text-gray-600">
                          {k.partei}{k.alter ? ` • ${k.alter} Jahre` : ''}{k.beruf ? ` • ${k.beruf}` : ''}
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {k.positionen.map((pos, j) => (
                            <span key={j} className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-xs">
                              {pos}
                            </span>
                          ))}
                        </div>
                        {k.wikipediaUrl && (
                          <a href={k.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline mt-1 inline-block">
                            Wikipedia-Profil
                          </a>
                        )}
                        {(k.quelle || k.quelleUrl) && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {k.quelleUrl ? (
                              <a
                                href={k.quelleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Quelle: {k.quelle || 'Offizielle Seite'}
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
              ) : wahl.id.startsWith('kt-auto-') || wahl.id.startsWith('kw-auto-') ? (
                <p className="text-xs text-gray-500 mt-3 italic">
                  Daten aus Wikidata (CC0). Detaillierte Informationen werden laufend ergänzt.
                </p>
              ) : null}
            </div>
          );
        })
      )}

    </div>
  );
};

export default ElectionsSection;
