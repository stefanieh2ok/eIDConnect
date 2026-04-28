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
  /** Nur Daumen-Leiste (keine Hinweistexte) — z. B. visuelle Kachel im Walkthrough. */
  walkthroughVisualPreview?: boolean;
  /** Scripted Intro-Phase für klar sichtbare Zustimmen-Animation im Walkthrough. */
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

  /** Große Daumen wie im Walkthrough; bei rein visueller Vorschau ohne Langtext. */
  const useIntroSizing = introWalkthrough || walkthroughVisualPreview;
  const useIntro = introWalkthrough;
  const useCompactLayout = compact || useIntroSizing;
  const isScriptedHighlight = introWalkthrough && scriptedIntroPhase === 'highlight';
  const isScriptedPressed = introWalkthrough && scriptedIntroPhase === 'pressed';
  const isScriptedActive = isScriptedHighlight || isScriptedPressed;

  return (
    <div
      className={`rounded-2xl border ${
        walkthroughVisualPreview ? 'mt-0 px-2 py-2' : useCompactLayout ? 'mt-2 px-2 py-2' : 'mt-3 px-3 py-3'
      }`}
      style={{
        borderColor: 'var(--gov-border, #D6E0EE)',
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 12px rgba(0,51,102,0.08)',
      }}
    >
      {walkthroughVisualPreview ? null : useIntroSizing && useIntro ? introKicker : compact ? null : kicker}
      {walkthroughVisualPreview || introWalkthrough ? null : (
        <p className={`text-center text-[9px] text-neutral-500 ${useCompactLayout ? 'mb-2' : 'mb-2.5'}`}>
          {du
            ? 'Prämien, falls aktiviert, sind unabhängig davon, wie du abstimmst.'
            : 'Prämien, falls aktiviert, sind unabhängig davon, wie Sie abstimmen.'}
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
              'flex items-center justify-center rounded-full border-[3px] border-red-500 bg-white shadow-md transition-all group-hover:bg-red-500 group-active:scale-95 ' +
              (useIntroSizing ? 'h-14 w-14' : compact ? 'h-12 w-12' : 'h-[4.25rem] w-[4.25rem]')
            }
            style={{ boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}
          >
            <ThumbsDown
              size={useIntroSizing ? 24 : compact ? 22 : 28}
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
              (useIntroSizing ? 'h-10 w-10' : compact ? 'h-9 w-9' : 'h-12 w-12')
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
              (isScriptedActive
                ? ' ring-4 ring-emerald-300/70 bg-emerald-500 scale-[0.97] shadow-[0_0_0_6px_rgba(16,185,129,0.18)] '
                : '') +
              (useIntroSizing ? 'h-14 w-14' : compact ? 'h-12 w-12' : 'h-[4.25rem] w-[4.25rem]')
            }
            style={{ boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}
          >
            <ThumbsUp
              size={useIntroSizing ? 24 : compact ? 22 : 28}
              strokeWidth={2.25}
              className={
                'transition-colors group-hover:text-white ' +
                (isScriptedActive ? 'text-white' : 'text-emerald-600')
              }
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
