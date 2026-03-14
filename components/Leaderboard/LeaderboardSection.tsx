'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { LEADERBOARD_DATA } from '@/data/constants';

const LeaderboardSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Trophy size={20} />
        Bundesländer-Rangliste
      </h2>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        {LEADERBOARD_DATA.map(item => (
          <div 
            key={item.rank} 
            className={`flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0 ${
              item.isUser ? 'bg-blue-50 -mx-5 px-5' : ''
            }`}
          >
            <div className={`text-2xl font-bold w-12 ${
              item.medal === 'gold' ? 'text-yellow-500' : 
              item.medal === 'silver' ? 'text-gray-400' : 
              item.medal === 'bronze' ? 'text-orange-600' : 
              'text-gray-600'
            }`}>
              {item.rank}
            </div>
            <div className="flex-1">
              <div className={`font-semibold ${
                item.isUser ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {item.name}
              </div>
            </div>
            <div className="text-xl font-bold text-green-600">
              {item.participation}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardSection;
