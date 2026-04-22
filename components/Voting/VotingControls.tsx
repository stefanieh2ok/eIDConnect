'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VoteType } from '@/types';

interface VotingControlsProps {
  canVote: boolean;
  onVote: (voteType: VoteType) => void;
}

const VotingControls: React.FC<VotingControlsProps> = ({ canVote, onVote }) => {
  if (!canVote) return null;

  return (
    <div
      className="mt-3 rounded-2xl border px-3 py-3"
      style={{
        borderColor: 'var(--gov-border, #D6E0EE)',
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 12px rgba(0,51,102,0.08)',
      }}
    >
      <p className="mb-3 text-center text-[10px] font-semibold leading-snug" style={{ color: 'var(--gov-muted)' }}>
        Tippen oder Karte wischen: rechts Dafür · links Dagegen · hoch Enthalten · runter Rückgängig
      </p>
      <div className="flex items-end justify-center gap-4">
        <button
          type="button"
          onClick={() => onVote('against')}
          className="flex flex-col items-center gap-2 group"
          aria-label="Position dagegen markieren (Demo)"
        >
          <div
            className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border-[3px] border-red-500 bg-white shadow-md transition-all group-hover:bg-red-500 group-active:scale-95"
            style={{ boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}
          >
            <ThumbsDown size={28} strokeWidth={2.25} className="text-red-500 transition-colors group-hover:text-white" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide text-red-600">Dagegen</span>
        </button>

        <button
          type="button"
          onClick={() => onVote('abstain')}
          className="flex flex-col items-center gap-2 group"
          aria-label="Position enthalten markieren (Demo)"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-300 bg-white shadow-sm transition-all group-hover:border-neutral-400 group-hover:bg-neutral-100 group-active:scale-95">
            <span className="text-xs font-bold text-neutral-500">Enth.</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Enthalten</span>
        </button>

        <button
          type="button"
          onClick={() => onVote('for')}
          className="flex flex-col items-center gap-2 group"
          aria-label="Position dafür markieren (Demo)"
        >
          <div
            className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border-[3px] border-emerald-500 bg-white shadow-md transition-all group-hover:bg-emerald-500 group-active:scale-95"
            style={{ boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}
          >
            <ThumbsUp size={28} strokeWidth={2.25} className="text-emerald-600 transition-colors group-hover:text-white" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Dafür</span>
        </button>
      </div>
    </div>
  );
};

export default VotingControls;
