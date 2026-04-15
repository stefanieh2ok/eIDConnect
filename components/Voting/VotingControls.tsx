'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { VoteType } from '@/types';

interface VotingControlsProps {
  canVote: boolean;
  onVote: (voteType: VoteType) => void;
}

const VotingControls: React.FC<VotingControlsProps> = ({ canVote, onVote }) => {
  const interactive = canVote;

  const circleDafuerDagegen = interactive
    ? 'border-blue-900 bg-white hover:bg-blue-900'
    : 'cursor-not-allowed border-gray-300 bg-gray-100';
  const iconDafuerDagegen = interactive ? 'text-blue-900 group-hover:text-white' : 'text-gray-400';

  const circleEnthalten = interactive
    ? 'border-gray-400 bg-white hover:bg-gray-400'
    : 'cursor-not-allowed border-gray-300 bg-gray-100';
  const iconEnthalten = interactive ? 'text-gray-400 group-hover:text-white' : 'text-gray-400';

  return (
    <div
      className={`mt-6 flex items-center justify-center gap-4 ${interactive ? '' : 'opacity-70'}`}
      role="group"
      aria-label="Abstimmung: Dafür, Enthalten oder Dagegen"
    >
      <button
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onVote('against')}
        className={`group flex flex-col items-center gap-2 ${interactive ? '' : 'cursor-not-allowed'}`}
        aria-label="Dagegen stimmen"
      >
        <div className="text-xs font-medium uppercase tracking-wide text-gray-600">Dagegen</div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md transition-colors ${circleDafuerDagegen}`}
        >
          <ThumbsDown size={24} className={`transition-colors ${iconDafuerDagegen}`} />
        </div>
      </button>

      <button
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onVote('abstain')}
        className={`group flex flex-col items-center gap-2 pt-4 ${interactive ? '' : 'cursor-not-allowed'}`}
        aria-label="Sich enthalten"
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-md transition-colors ${circleEnthalten}`}
        >
          <Minus size={20} className={`transition-colors ${iconEnthalten}`} />
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Enthalten</div>
      </button>

      <button
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onVote('for')}
        className={`group flex flex-col items-center gap-2 ${interactive ? '' : 'cursor-not-allowed'}`}
        aria-label="Dafür stimmen"
      >
        <div className="text-xs font-medium uppercase tracking-wide text-gray-600">Dafür</div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md transition-colors ${circleDafuerDagegen}`}
        >
          <ThumbsUp size={24} className={`transition-colors ${iconDafuerDagegen}`} />
        </div>
      </button>
    </div>
  );
};

export default VotingControls;
