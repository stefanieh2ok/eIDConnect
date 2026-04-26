'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VoteType } from '@/types';

interface VotingControlsProps {
  canVote: boolean;
  onVote: (voteType: VoteType) => void;
  /** Einführung: kompaktere Daumen, damit alles ohne Scroll sichtbar ist. */
  compact?: boolean;
  /** Produkt-Walkthrough „Abstimmen“: Daumen gut sichtbar, gleicher Hinweis wie Live (nur Button-Abstimmung). */
  introWalkthrough?: boolean;
  du?: boolean;
}

const VotingControls: React.FC<VotingControlsProps> = ({
  canVote,
  onVote,
  compact = false,
  introWalkthrough = false,
  du = false,
}) => {
  if (!canVote) return null;

  const hintSie =
    'Wählen Sie über die Buttons. Entscheiden Sie bewusst nach Sichtung der Informationen. Pro und Contra helfen bei der Einordnung.';
  const hintDu =
    'Wähle über die Buttons. Entscheide bewusst nach Sichtung der Informationen. Pro und Contra helfen dir bei der Einordnung.';

  const kicker = (
    <p
      className={`text-center text-[10px] font-semibold leading-snug ${compact ? 'mb-1.5' : 'mb-3'}`}
      style={{ color: 'var(--gov-muted)' }}
    >
      {du ? hintDu : hintSie}
    </p>
  );

  const introKicker = (
    <p className="mb-2 text-center text-[9px] font-semibold leading-tight" style={{ color: 'var(--gov-muted)' }}>
      {du ? hintDu : hintSie}
    </p>
  );

  const useIntro = introWalkthrough;
  const useCompactLayout = compact || useIntro;

  return (
    <div
      className={`rounded-2xl border ${useCompactLayout ? 'mt-2 px-2 py-2' : 'mt-3 px-3 py-3'}`}
      style={{
        borderColor: 'var(--gov-border, #D6E0EE)',
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 12px rgba(0,51,102,0.08)',
      }}
    >
      {useIntro ? introKicker : compact ? null : kicker}
      <p className={`text-center text-[9px] text-neutral-500 ${useCompactLayout ? 'mb-2' : 'mb-2.5'}`}>
        Demo-Hinweis · keine echte Abstimmung
      </p>
      <div className={`flex items-end justify-center ${useCompactLayout ? 'gap-3' : 'gap-4'}`}>
        <button
          type="button"
          onClick={() => onVote('against')}
          className={`flex flex-col items-center group ${useCompactLayout ? 'gap-1' : 'gap-2'}`}
          aria-label="Ablehnen"
        >
          <div
            className={
              'flex items-center justify-center rounded-full border-[3px] border-red-500 bg-white shadow-md transition-all group-hover:bg-red-500 group-active:scale-95 ' +
              (useIntro ? 'h-14 w-14' : compact ? 'h-12 w-12' : 'h-[4.25rem] w-[4.25rem]')
            }
            style={{ boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}
          >
            <ThumbsDown
              size={useIntro ? 24 : compact ? 22 : 28}
              strokeWidth={2.25}
              className="text-red-500 transition-colors group-hover:text-white"
              aria-hidden
            />
          </div>
          <span
            className={`font-bold uppercase tracking-wide text-red-600 ${useCompactLayout ? 'text-[9px]' : 'text-[11px]'}`}
          >
            Ablehnen
          </span>
        </button>

        <button
          type="button"
          onClick={() => onVote('abstain')}
          className={`flex flex-col items-center group ${useCompactLayout ? 'gap-1' : 'gap-2'}`}
          aria-label="Enthalten"
        >
          <div
            className={
              'flex items-center justify-center rounded-full border-2 border-neutral-300 bg-white shadow-sm transition-all group-hover:border-neutral-400 group-hover:bg-neutral-100 group-active:scale-95 ' +
              (useIntro ? 'h-10 w-10' : compact ? 'h-9 w-9' : 'h-12 w-12')
            }
          >
            <span
              className={`font-bold text-neutral-500 ${useCompactLayout ? 'text-[9px]' : 'text-xs'}`}
              aria-hidden
            >
              —
            </span>
          </div>
          <span
            className={`font-semibold uppercase tracking-wide text-neutral-500 ${useCompactLayout ? 'text-[8px]' : 'text-[10px]'}`}
          >
            Enthalten
          </span>
        </button>

        <button
          type="button"
          onClick={() => onVote('for')}
          className={`flex flex-col items-center group ${useCompactLayout ? 'gap-1' : 'gap-2'}`}
          aria-label="Zustimmen"
        >
          <div
            className={
              'flex items-center justify-center rounded-full border-[3px] border-emerald-500 bg-white shadow-md transition-all group-hover:bg-emerald-500 group-active:scale-95 ' +
              (useIntro ? 'h-14 w-14' : compact ? 'h-12 w-12' : 'h-[4.25rem] w-[4.25rem]')
            }
            style={{ boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}
          >
            <ThumbsUp
              size={useIntro ? 24 : compact ? 22 : 28}
              strokeWidth={2.25}
              className="text-emerald-600 transition-colors group-hover:text-white"
              aria-hidden
            />
          </div>
          <span
            className={`font-bold uppercase tracking-wide text-emerald-700 ${useCompactLayout ? 'text-[9px]' : 'text-[11px]'}`}
          >
            Zustimmen
          </span>
        </button>
      </div>
    </div>
  );
};

export default VotingControls;
