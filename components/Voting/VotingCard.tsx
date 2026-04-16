'use client';

import React, { memo, useState } from 'react';
import { ChevronDown, ListChecks } from 'lucide-react';
import { VotingCard as VotingCardType, VoteType } from '@/types';

function enforceFactDetail(text: string): string {
  const t = text.trim();
  const mentionsCost = /(investitions|kosten|darlehen|finanzier)/i.test(t);
  const hasAmount = /\d[\d\.\s,_]*\s?(€|euro|mio|million)/i.test(t);
  const hasDuration = /\d[\d\.\s,_]*\s?(monat|monate|jahr|jahre|woche|wochen)/i.test(t);
  if (mentionsCost && (!hasAmount || !hasDuration)) {
    return `${t} (Hinweis: Betrag und Laufzeit bitte mit Quelle konkretisieren.)`;
  }
  return t;
}

interface VotingCardProps {
  card: VotingCardType;
  canVote: boolean;
  dragOffset: number;
  isDragging: boolean;
  onDragStart: (clientX: number) => void;
  onDragMove: (clientX: number) => void;
  onDragEnd: () => void;
  onVote: (voteType: VoteType) => void;
  /** Produkt-Intro: kompakter Prozent-Balken ohne Icons/Labels. */
  introBarIcons?: boolean;
}

const VotingCard: React.FC<VotingCardProps> = memo(
  ({
    card,
    canVote,
    dragOffset,
    isDragging,
    onDragStart,
    onDragMove,
    onDragEnd,
    onVote: _onVote,
    introBarIcons = false,
  }) => {
    const [proOpen, setProOpen] = useState(false);
    const [conOpen, setConOpen] = useState(false);

    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--gov-border, #D6E0EE)',
          boxShadow: '0 4px 24px rgba(0,40,100,0.10)',
          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.025}deg)`,
          opacity: isDragging ? 0.93 : 1,
          transition: isDragging ? 'none' : 'transform 0.25s ease, opacity 0.2s',
          cursor: canVote ? 'grab' : 'default',
        }}
        onMouseDown={(e) => canVote && onDragStart(e.clientX)}
        onMouseMove={(e) => canVote && onDragMove(e.clientX)}
        onMouseUp={() => canVote && onDragEnd()}
        onMouseLeave={() => canVote && onDragEnd()}
        onTouchStart={(e) => canVote && onDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => canVote && onDragMove(e.touches[0].clientX)}
        onTouchEnd={() => canVote && onDragEnd()}
      >
        {/* ── Header-Streifen (Governikus Dunkelblau) ── */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: 'linear-gradient(135deg, #002855 0%, #003d80 50%, #0055A4 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.90)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {card.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {card.urgent ? (
              <span
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: 'rgba(217,48,37,0.85)', color: '#fff' }}
              >
                Frist: {card.deadline}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] text-white/50">
                Frist: {card.deadline}
              </span>
            )}
          </div>
        </div>

        {/* ── Inhalt ── */}
        <div className="px-4 pt-3 pb-2">
          <h2 className="text-[15px] font-bold leading-snug mb-1" style={{ color: 'var(--gov-heading, #1A2B45)' }}>
            {card.title}
          </h2>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--gov-muted, #6B7A99)' }}>
            {card.description}
          </p>
        </div>

        {/* ── Live-Balken ── */}
        <div className="px-4 pb-2">
          <div className={`flex rounded-full overflow-hidden ${introBarIcons ? 'h-7' : 'h-6'}`} style={{ background: '#EEF2F8' }}>
            <div
              className="flex items-center justify-center text-white text-[10px] font-bold"
              style={{ width: `${card.yes}%`, background: '#22c55e' }}
            >
              {card.yes}%
            </div>
            <div
              className="flex items-center justify-center text-white text-[10px] font-bold"
              style={{ width: `${card.no}%`, background: '#ef4444' }}
            >
              {card.no}%
            </div>
            {card.abstain > 0 && (
              <div
                className="flex items-center justify-center text-[10px] font-medium"
                style={{ width: `${card.abstain}%`, background: '#CBD5E1', color: '#64748B' }}
              >
                {card.abstain}%
              </div>
            )}
          </div>
          <div className="flex justify-between mt-1">
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--gov-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              {card.votes.toLocaleString('de-DE')} Stimmen
            </span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--gov-primary-mid, #0055A4)' }}>
              +{card.points} Demo-Punkte
            </span>
          </div>
        </div>

        {/* ── Quick Facts ── */}
        <div
          className="mx-4 mb-3 rounded-xl px-3 py-2 grid grid-cols-2 gap-x-3 gap-y-1"
          style={{ background: 'var(--gov-primary-light, #E8F0FB)' }}
        >
          {card.quickFacts.slice(0, 4).map((fact, i) => (
            <div key={i} className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--gov-heading)' }}>
              <ListChecks className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--gov-primary-mid)' }} aria-hidden />
              <span className="truncate">{fact}</span>
            </div>
          ))}
        </div>

        {/* ── Pro / Contra: einklappbar, damit Abstimmungs-Buttons sichtbar bleiben ── */}
        <div className="mx-4 mb-3 grid grid-cols-2 gap-2">
          <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/60">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-1 px-2.5 py-2 text-left"
              onClick={() => setProOpen((o: boolean) => !o)}
              aria-expanded={proOpen}
              aria-controls="voting-pro-details"
              id="voting-pro-toggle"
            >
              <span className="text-[10px] font-extrabold text-emerald-800">Pro</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-emerald-700 transition-transform ${proOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {proOpen ? (
              <ul
                id="voting-pro-details"
                role="region"
                aria-labelledby="voting-pro-toggle"
                className="space-y-1 border-t border-emerald-200/80 px-2.5 pb-2.5 pt-1 text-[10px] leading-snug text-emerald-950"
              >
                {(card.kiAnalysis?.pros ?? []).slice(0, 2).map((p, i) => (
                  <li key={i} className="flex gap-1">
                    <span className="mt-[2px] text-emerald-700">•</span>
                    <span>{enforceFactDetail(p.text)}</span>
                  </li>
                ))}
                {(card.kiAnalysis?.pros ?? []).length === 0 && (
                  <li className="text-emerald-800/80">Sachliche Vorteile werden in der Analyse erläutert.</li>
                )}
              </ul>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50/60">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-1 px-2.5 py-2 text-left"
              onClick={() => setConOpen((o: boolean) => !o)}
              aria-expanded={conOpen}
              aria-controls="voting-contra-details"
              id="voting-contra-toggle"
            >
              <span className="text-[10px] font-extrabold text-rose-800">Contra</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-rose-700 transition-transform ${conOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {conOpen ? (
              <ul
                id="voting-contra-details"
                role="region"
                aria-labelledby="voting-contra-toggle"
                className="space-y-1 border-t border-rose-200/80 px-2.5 pb-2.5 pt-1 text-[10px] leading-snug text-rose-950"
              >
                {(card.kiAnalysis?.cons ?? []).slice(0, 2).map((c, i) => (
                  <li key={i} className="flex gap-1">
                    <span className="mt-[2px] text-rose-700">•</span>
                    <span>{enforceFactDetail(c.text)}</span>
                  </li>
                ))}
                {(card.kiAnalysis?.cons ?? []).length === 0 && (
                  <li className="text-rose-800/80">Sachliche Gegenargumente werden in der Analyse erläutert.</li>
                )}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

VotingCard.displayName = 'VotingCard';
export default VotingCard;
