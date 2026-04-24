'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VoteType } from '@/types';

interface VotingControlsProps {
  canVote: boolean;
  onVote: (voteType: VoteType) => void;
  /** Einführung: kompaktere Daumen, damit alles ohne Scroll sichtbar ist. */
  compact?: boolean;
}

const VotingControls: React.FC<VotingControlsProps> = ({ canVote, onVote, compact = false }) => {
  if (!canVote) return null;

  const kicker = (
    <p
      className={`text-center text-[10px] font-semibold leading-snug ${compact ? 'mb-1.5' : 'mb-3'}`}
      style={{ color: 'var(--gov-muted)' }}
    >
      Tippen oder Karte wischen: rechts Dafür · links Dagegen · hoch Enthalten · runter Rückgängig
    </p>
  );

  return (
    <div
      className={`rounded-2xl border ${compact ? 'mt-2 px-2 py-2' : 'mt-3 px-3 py-3'}`}
      style={{
        borderColor: 'var(--gov-border, #D6E0EE)',
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 12px rgba(0,51,102,0.08)',
      }}
    >
      {compact ? null : kicker}
      <div className={`flex items-end justify-center ${compact ? 'gap-2' : 'gap-4'}`}>
        <button
          type="button"
          onClick={() => onVote('against')}
          className={`flex flex-col items-center group ${compact ? 'gap-1' : 'gap-2'}`}
          aria-label="Position dagegen markieren (Demo)"
        >
          <div
            className={
              'flex items-center justify-center rounded-full border-[3px] border-red-500 bg-white shadow-md transition-all group-hover:bg-red-500 group-active:scale-95 ' +
              (compact ? 'h-12 w-12' : 'h-[4.25rem] w-[4.25rem]')
            }
            style={{ boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}
          >
            <ThumbsDown
              size={compact ? 22 : 28}
              strokeWidth={2.25}
              className="text-red-500 transition-colors group-hover:text-white"
            />
          </div>
          <span
            className={`font-bold uppercase tracking-wide text-red-600 ${compact ? 'text-[9px]' : 'text-[11px]'}`}
          >
            Dagegen
          </span>
        </button>

        <button
          type="button"
          onClick={() => onVote('abstain')}
          className={`flex flex-col items-center group ${compact ? 'gap-1' : 'gap-2'}`}
          aria-label="Position enthalten markieren (Demo)"
        >
          <div
            className={
              'flex items-center justify-center rounded-full border-2 border-neutral-300 bg-white shadow-sm transition-all group-hover:border-neutral-400 group-hover:bg-neutral-100 group-active:scale-95 ' +
              (compact ? 'h-9 w-9' : 'h-12 w-12')
            }
          >
            <span
              className={`font-bold text-neutral-500 ${compact ? 'text-[9px]' : 'text-xs'}`}
            >
              Enth.
            </span>
          </div>
          <span
            className={`font-semibold uppercase tracking-wide text-neutral-500 ${compact ? 'text-[8px]' : 'text-[10px]'}`}
          >
            Enthalten
          </span>
        </button>

        <button
          type="button"
          onClick={() => onVote('for')}
          className={`flex flex-col items-center group ${compact ? 'gap-1' : 'gap-2'}`}
          aria-label="Position dafür markieren (Demo)"
        >
          <div
            className={
              'flex items-center justify-center rounded-full border-[3px] border-emerald-500 bg-white shadow-md transition-all group-hover:bg-emerald-500 group-active:scale-95 ' +
              (compact ? 'h-12 w-12' : 'h-[4.25rem] w-[4.25rem]')
            }
            style={{ boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}
          >
            <ThumbsUp
              size={compact ? 22 : 28}
              strokeWidth={2.25}
              className="text-emerald-600 transition-colors group-hover:text-white"
            />
          </div>
          <span
            className={`font-bold uppercase tracking-wide text-emerald-700 ${compact ? 'text-[9px]' : 'text-[11px]'}`}
          >
            Dafür
          </span>
        </button>
      </div>
    </div>
  );
};

export default VotingControls;
