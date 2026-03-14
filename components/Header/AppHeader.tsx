'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Location } from '@/types';

const AppHeader: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleLocationChange = (location: Location) => {
    dispatch({ type: 'SET_ACTIVE_LOCATION', payload: location });
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-4 sticky top-0 z-50 shadow-lg" style={{paddingTop: '48px'}}>
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-light tracking-widest">BÜRGER APP</h1>
        <div className="flex gap-3 text-sm">
          <div className="text-center">
            <div className="font-semibold">24.750</div>
            <div className="text-xs opacity-80">Punkte</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">847</div>
            <div className="text-xs opacity-80">Stimmen</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 bg-white bg-opacity-10 p-1.5 rounded-xl">
        {(['bundesweit', 'saarland', 'kirkel'] as Location[]).map((location) => (
          <button
            key={location}
            onClick={() => handleLocationChange(location)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              state.activeLocation === location 
                ? 'bg-white text-gray-900' 
                : 'text-white hover:bg-white hover:bg-opacity-20'
            }`}
          >
            {location.charAt(0).toUpperCase() + location.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs opacity-70">
        <span>Offizielle Informationen • Transparenz • Datenschutz</span>
      </div>
    </header>
  );
};

export default AppHeader;
