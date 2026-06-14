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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Auswahl erfasst</h3>
        <p className="text-lg text-gray-700 mb-4">
          Ihre Auswahl: <strong>{voteResult.vote}</strong>
        </p>
        <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4">
          <div className="text-sm font-semibold text-slate-800">Hinweis · keine echte Abstimmung</div>
          <div className="text-sm text-slate-600 mt-1">Die Erfassung dient nur der Veranschaulichung.</div>
        </div>
      </div>
    </div>
  );
};

export default VoteResultModal;
