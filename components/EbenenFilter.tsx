'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import { EbeneLevel, Location, Section } from '@/types';
import { activeLocationForLevel, levelForResidenceLocation } from '@/lib/activeLocationForLevel';
import { DEMO_LOCATION_LABEL } from '@/lib/locationLabels';

interface LevelConfig {
  label: string;
  sublabel: string;
  location: Location;
}

const LEVEL_CONFIG: Record<EbeneLevel, LevelConfig> = {
  bund:    { label: 'Bund',    sublabel: 'Deutschland',      location: 'bundesweit' },
  land:    { label: 'Land',    sublabel: 'Saarland',         location: 'saarland' },
  kreis:   { label: 'Kreis',   sublabel: 'Saarpfalz',        location: 'saarpfalz' },
  kommune: { label: 'Kommune', sublabel: 'Kommune',          location: 'kirkel' },
};

/** Which levels are possible per section */
const SECTION_LEVELS: Record<Section, EbeneLevel[]> = {
  live:        ['bund', 'land', 'kreis', 'kommune'],
  leaderboard: ['bund', 'land', 'kreis', 'kommune'],
  wahlen:      ['bund', 'land', 'kreis', 'kommune'],
  news:        [],
  kalender:    ['bund', 'land', 'kreis', 'kommune'],
  meldungen:   ['kommune'],
};

/** Only return levels that actually have voting cards (for live) or wahlen entries */
function hasData(level: EbeneLevel, section: Section, residence: Location): boolean {
  const loc = activeLocationForLevel(residence, level);
  if (section === 'live') {
    return (VOTING_DATA[loc]?.cards?.length ?? 0) > 0;
  }
  return true;
}

export default function EbenenFilter() {
  const { state, dispatch } = useApp();

  const availableLevels = (SECTION_LEVELS[state.activeSection] ?? []).filter((l) =>
    hasData(l, state.activeSection, state.residenceLocation),
  );

  if (availableLevels.length <= 1) return null;

  const currentLevel = levelForResidenceLocation(state.activeLocation);
  // If current level isn't in available list, reset to first available
  const activeLevel = availableLevels.includes(currentLevel) ? currentLevel : availableLevels[0];

  return (
    <div
      className="flex gap-1.5 px-3 py-2 bg-white border-b overflow-x-auto hide-scrollbar"
      style={{ borderColor: 'var(--gov-border, #D6E0EE)' }}
    >
      {availableLevels.map((level) => {
        const cfg = LEVEL_CONFIG[level];
        const isActive = activeLevel === level;
        const targetLoc = activeLocationForLevel(state.residenceLocation, level);
        return (
          <button
            key={level}
            onClick={() => dispatch({ type: 'SET_ACTIVE_LOCATION', payload: targetLoc })}
            className={`flex items-baseline gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              isActive
                ? 'text-white border-transparent shadow-sm'
                : 'bg-transparent border-gray-200 text-gray-500 hover:border-[#0055A4] hover:text-[#0055A4]'
            }`}
            style={isActive ? { background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' } : undefined}
          >
            {cfg.label}
            <span
              className={`text-[10px] font-normal ${isActive ? 'opacity-70' : 'opacity-60'}`}
            >
              {level === 'kommune' ? DEMO_LOCATION_LABEL[targetLoc] ?? targetLoc : cfg.sublabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
