'use client';

import React from 'react';
import { VoteResult } from '@/types';

interface VoteResultModalProps {
  voteResult: VoteResult | null;
  onClose: () => void;
}

const VoteResultModal: React.FC<VoteResultModalProps> = ({ voteResult, onClose }) => {
  if (!voteResult) return null;

  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case 'DAFÜR': return '✓';
      case 'DAGEGEN': return '✗';
      case 'ENTHALTEN': return '○';
      default: return '○';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-fade-in">
        <div className="text-6xl mb-4">
          {getVoteIcon(voteResult.vote)}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Stimme registriert!
        </h3>
        <p className="text-lg text-gray-700 mb-4">
          Du hast mit <strong>{voteResult.vote}</strong> gestimmt
        </p>
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-600">
            +{voteResult.points} Punkte
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Clara analysiert die Auswirkungen...
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteResultModal;
