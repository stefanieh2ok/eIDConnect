'use client';

import React, { memo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
  /** Horizontaler Wisch-Offset (Dafür/Dagegen). */
  dragOffsetX: number;
  /** Vertikaler Wisch-Offset (Enthalten / Rückgängig). */
  dragOffsetY: number;
  isDragging: boolean;
  onDragStart: (clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: () => void;
  onVote: (voteType: VoteType) => void;
  /** Produkt-Intro: kompakter Prozent-Balken ohne Icons/Labels. */
  introBarIcons?: boolean;
  /** Einführungs-Walkthrough: Pro- und Contra-Boxen sofort geöffnet. */
  introProConExpanded?: boolean;
  /** Einführung: weniger Zeilen, damit Karte + Daumen ohne Scroll sichtbar bleiben. */
  introCompact?: boolean;
}

const VotingCard: React.FC<VotingCardProps> = memo(
  ({
    card,
    canVote,
    dragOffsetX,
    dragOffsetY,
    isDragging,
    onDragStart,
    onDragMove,
    onDragEnd,
    onVote: _onVote,
    introBarIcons = false,
    introProConExpanded = false,
    introCompact = false,
  }) => {
    const [proOpen, setProOpen] = useState(introProConExpanded);
    const [conOpen, setConOpen] = useState(introProConExpanded);
    const proConLimit = introCompact ? 1 : 2;

    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--gov-border, #D6E0EE)',
          boxShadow: '0 4px 24px rgba(0,40,100,0.10)',
          transform: `translate(${dragOffsetX}px, ${dragOffsetY}px) rotate(${dragOffsetX * 0.025}deg)`,
          opacity: isDragging
            ? Math.max(0.55, 1 - (Math.abs(dragOffsetX) + Math.abs(dragOffsetY)) / 500)
            : 1,
          transition: isDragging ? 'none' : 'transform 0.25s ease, opacity 0.2s',
          cursor: canVote ? 'grab' : 'default',
        }}
        onMouseDown={(e) => canVote && onDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => canVote && onDragMove(e.clientX, e.clientY)}
        onMouseUp={() => canVote && onDragEnd()}
        onMouseLeave={() => canVote && onDragEnd()}
        onTouchStart={(e) => canVote && onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => canVote && onDragMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={() => canVote && onDragEnd()}
      >
        {/* ── Header-Streifen (Governikus Dunkelblau) ── */}
        <div
          className={`flex items-center justify-between px-4 ${introCompact ? 'py-2' : 'py-3'}`}
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
        <div className={`px-4 ${introCompact ? 'pt-2 pb-1' : 'pt-3 pb-2'}`}>
          <h2
            className={`font-bold leading-snug mb-0.5 ${introCompact ? 'text-[13px] line-clamp-2' : 'text-[15px] mb-1'}`}
            style={{ color: 'var(--gov-heading, #1A2B45)' }}
          >
            {card.title}
          </h2>
          <p
            className={`text-xs leading-relaxed ${introCompact ? 'line-clamp-1' : 'line-clamp-2'}`}
            style={{ color: 'var(--gov-muted, #6B7A99)' }}
          >
            {card.description}
          </p>
        </div>

        {/* ── Live-Abstimmungsbarometer: Verlauf rot → grau → grün (wie Daumen: Dagegen · Enthalten · Dafür) ── */}
        <div className={`px-4 ${introCompact ? 'pb-1' : 'pb-2'}`}>
          <div
            className="rounded-full p-[1.5px]"
            style={{
              background: 'linear-gradient(90deg, #dc2626 0%, #94a3b8 50%, #16a34a 100%)',
            }}
            title="Dagegen · Enthalten · Dafür"
          >
            <div
              className={`flex w-full min-w-0 overflow-hidden rounded-full ${introBarIcons ? 'h-7' : 'h-6'}`}
              style={{ background: 'rgba(15, 23, 42, 0.04)' }}
            >
              <div
                className="flex min-w-0 items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{
                  width: `${card.no}%`,
                  background: 'linear-gradient(180deg, #f87171 0%, #dc2626 45%, #b91c1c 100%)',
                }}
              >
                {card.no > 0 ? `${card.no}%` : ''}
              </div>
              <div
                className="flex min-w-0 items-center justify-center text-[10px] font-semibold"
                style={{
                  width: `${card.abstain}%`,
                  background: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 50%, #64748b 100%)',
                  color: 'rgba(15, 23, 42, 0.9)',
                }}
              >
                {card.abstain > 0 ? `${card.abstain}%` : ''}
              </div>
              <div
                className="flex min-w-0 items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{
                  width: `${card.yes}%`,
                  background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 45%, #15803d 100%)',
                }}
              >
                {card.yes > 0 ? `${card.yes}%` : ''}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="flex min-w-0 items-center gap-1.5 text-[10px]" style={{ color: 'var(--gov-muted)' }}>
              {!introBarIcons && (
                <>
                  <span
                    className="h-1 w-5 shrink-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #ef4444, #94a3b8, #10b981)',
                    }}
                    aria-hidden
                    title="Dagegen · Enthalten · Dafür"
                  />
                  <span className="inline-flex items-center gap-0.5" aria-hidden>
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </span>
                </>
              )}
              <span>
                {card.votes.toLocaleString('de-DE')} Stimmen
                {!introBarIcons && (
                  <span className="ml-0.5 text-[9px] opacity-85">(dagegen · enthalten · dafür)</span>
                )}
              </span>
            </span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--gov-primary-mid, #0055A4)' }}>
              +{card.points} Demo-Punkte
            </span>
          </div>
        </div>

        {/* ── Pro / Contra: einklappbar, damit Abstimmungs-Buttons sichtbar bleiben ── */}
        <div className={`mx-4 ${introCompact ? 'mb-2 grid grid-cols-2 gap-1.5' : 'mb-3 grid grid-cols-2 gap-2'}`}>
          <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/60">
            <button
              type="button"
              className={`flex w-full items-center justify-between gap-1 px-2.5 text-left ${introCompact ? 'py-1.5' : 'py-2'}`}
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
                className={`space-y-1 border-t border-emerald-200/80 px-2.5 pt-1 leading-snug text-emerald-950 ${introCompact ? 'pb-1.5 text-[9px]' : 'pb-2.5 text-[10px]'}`}
              >
                {(card.kiAnalysis?.pros ?? []).slice(0, proConLimit).map((p, i) => (
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
              className={`flex w-full items-center justify-between gap-1 px-2.5 text-left ${introCompact ? 'py-1.5' : 'py-2'}`}
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
                className={`space-y-1 border-t border-rose-200/80 px-2.5 pt-1 leading-snug text-rose-950 ${introCompact ? 'pb-1.5 text-[9px]' : 'pb-2.5 text-[10px]'}`}
              >
                {(card.kiAnalysis?.cons ?? []).slice(0, proConLimit).map((c, i) => (
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
