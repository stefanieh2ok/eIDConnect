'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Section } from '@/types';

const AppNavigation: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleSectionChange = (section: Section) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  };

  const sections = [
    { key: 'live' as Section, label: 'LIVE' },
    { key: 'leaderboard' as Section, label: 'Beteiligungsstatus' },
    { key: 'wahlen' as Section, label: 'Wahlen' },
    { key: 'news' as Section, label: 'News' },
    { key: 'kalender' as Section, label: 'Kalender' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 flex sticky overflow-x-auto" style={{top: '144px', zIndex: 40}}>
      {sections.map((section) => (
        <button
          key={section.key}
          onClick={() => handleSectionChange(section.key)}
          className={`flex-1 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            state.activeSection === section.key 
              ? 'text-blue-900 border-b-2 border-blue-900' 
              : 'text-gray-600 hover:text-blue-900'
          }`}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
};

export default AppNavigation;
