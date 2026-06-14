'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VoteType } from '@/types';

interface VotingControlsProps {
  canVote: boolean;
  onVote: (voteType: VoteType) => void;
  compact?: boolean;
  introWalkthrough?: boolean;
  walkthroughVisualPreview?: boolean;
  scriptedIntroPhase?: 'idle' | 'highlight' | 'pressed' | 'reward';
  du?: boolean;
}

const VotingControls: React.FC<VotingControlsProps> = ({
  canVote,
  onVote,
  compact = false,
  introWalkthrough = false,
  walkthroughVisualPreview = false,
  scriptedIntroPhase = 'idle',
  du = false,
}) => {
  if (!canVote) return null;

  const useWalkthroughUi = introWalkthrough || walkthroughVisualPreview;

  if (!useWalkthroughUi) {
    return (
      <div className="civic-vote-panel">
        <div className="civic-vote-actions" role="group" aria-label="Abstimmung">
          <button
            type="button"
            onClick={() => onVote('against')}
            className="civic-vote-action civic-vote-action--reject"
            aria-label="Ablehnen"
          >
            Ablehnen
          </button>
          <button
            type="button"
            onClick={() => onVote('abstain')}
            className="civic-vote-action civic-vote-action--abstain"
            aria-label="Enthalten"
          >
            Enthalten
          </button>
          <button
            type="button"
            onClick={() => onVote('for')}
            className="civic-vote-action civic-vote-action--accept"
            aria-label="Zustimmen"
          >
            Zustimmen
          </button>
        </div>
        <p className="civic-vote-action__hint">
          {du
            ? 'Mitwirkungspunkte sind unabhängig von deiner Entscheidung.'
            : 'Mitwirkungspunkte sind unabhängig von Ihrer Entscheidung.'}
        </p>
      </div>
    );
  }

  const hintSie =
    'Wählen Sie über die Buttons. Entscheiden Sie bewusst nach Sichtung der Informationen.';
  const hintDu =
    'Wähle über die Buttons. Entscheide bewusst nach Sichtung der Informationen.';

  const useIntroSizing = introWalkthrough || walkthroughVisualPreview;
  const useCompactLayout = compact || useIntroSizing;
  const isScriptedHighlight = introWalkthrough && scriptedIntroPhase === 'highlight';
  const isScriptedPressed = introWalkthrough && scriptedIntroPhase === 'pressed';

  return (
    <div
      className={`rounded-2xl border ${
        walkthroughVisualPreview ? 'mt-0 px-2 py-2' : useCompactLayout ? 'mt-2 px-2 py-2' : 'mt-3 px-3 py-3'
      }`}
      style={{
        borderColor: 'var(--color-border, #D6E0EE)',
        background: 'var(--color-surface, #fff)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {walkthroughVisualPreview || introWalkthrough ? null : (
        <p
          className={`text-center text-[13px] font-medium leading-snug ${compact ? 'mb-1.5' : 'mb-3'}`}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {du ? hintDu : hintSie}
        </p>
      )}
      <div className={`flex items-end justify-center ${useCompactLayout ? 'gap-3' : 'gap-4'}`}>
        <button
          type="button"
          onClick={() => onVote('against')}
          className={`flex flex-col items-center group ${useCompactLayout ? 'gap-1' : 'gap-2'}`}
          aria-label="Ablehnen"
        >
          <div
            className={
              'flex items-center justify-center rounded-full border-2 border-slate-300 bg-white transition-all group-active:scale-95 ' +
              (useIntroSizing ? 'h-12 w-12' : compact ? 'h-11 w-11' : 'h-12 w-12')
            }
          >
            <ThumbsDown
              size={useIntroSizing ? 22 : compact ? 20 : 24}
              strokeWidth={2}
              className="text-slate-600"
              aria-hidden
            />
          </div>
          <span className={`font-semibold text-slate-700 ${useCompactLayout ? 'text-[11px]' : 'text-xs'}`}>
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
              'flex items-center justify-center rounded-full border-2 border-neutral-300 bg-white transition-all group-active:scale-95 ' +
              (useIntroSizing ? 'h-10 w-10' : compact ? 'h-9 w-9' : 'h-10 w-10')
            }
          >
            <span className={`font-bold text-neutral-500 ${useCompactLayout ? 'text-[10px]' : 'text-xs'}`}>
              —
            </span>
          </div>
          <span className={`font-semibold text-neutral-600 ${useCompactLayout ? 'text-[11px]' : 'text-xs'}`}>
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
              'flex items-center justify-center rounded-full border-2 border-slate-300 bg-white transition-all group-active:scale-95 ' +
              (useIntroSizing ? 'h-12 w-12' : compact ? 'h-11 w-11' : 'h-12 w-12') +
              (isScriptedHighlight || isScriptedPressed ? ' ring-2 ring-[#003366]/30' : '')
            }
          >
            <ThumbsUp
              size={useIntroSizing ? 22 : compact ? 20 : 24}
              strokeWidth={2}
              className="text-slate-700"
              aria-hidden
            />
          </div>
          <span className={`font-semibold text-slate-700 ${useCompactLayout ? 'text-[11px]' : 'text-xs'}`}>
            Zustimmen
          </span>
        </button>
      </div>
    </div>
  );
};

export default VotingControls;
