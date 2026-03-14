'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { VoteType } from '@/types';

interface VotingControlsProps {
  canVote: boolean;
  onVote: (voteType: VoteType) => void;
}

const VotingControls: React.FC<VotingControlsProps> = ({ canVote, onVote }) => {
  if (!canVote) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={() => onVote('against')}
        className="flex flex-col items-center gap-2 group"
        aria-label="Dagegen stimmen"
      >
        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Dagegen</div>
        <div className="w-14 h-14 bg-white border-2 border-blue-900 hover:bg-blue-900 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all">
          <ThumbsDown size={24} className="text-blue-900 group-hover:text-white transition-colors" />
        </div>
      </button>

      <button
        onClick={() => onVote('abstain')}
        className="flex flex-col items-center gap-2 group pt-4"
        aria-label="Sich enthalten"
      >
        <div className="w-12 h-12 bg-white border-2 border-gray-400 hover:bg-gray-400 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all">
          <Minus size={20} className="text-gray-400 group-hover:text-white transition-colors" />
        </div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enthalten</div>
      </button>

      <button
        onClick={() => onVote('for')}
        className="flex flex-col items-center gap-2 group"
        aria-label="Dafür stimmen"
      >
        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Dafür</div>
        <div className="w-14 h-14 bg-white border-2 border-blue-900 hover:bg-blue-900 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all">
          <ThumbsUp size={24} className="text-blue-900 group-hover:text-white transition-colors" />
        </div>
      </button>
    </div>
  );
};

export default VotingControls;
