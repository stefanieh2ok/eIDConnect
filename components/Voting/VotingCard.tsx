'use client';

import React, { memo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { VotingCard as VotingCardType } from '@/types';

function enforceFactDetail(text: string): string {
  return text.trim();
}

interface VotingCardProps {
  card: VotingCardType;
  /** Produkt-Intro: kompakter Prozent-Balken ohne Icons/Labels. */
  introBarIcons?: boolean;
  /** Pro- und Contra-Boxen initial geöffnet (Walkthrough und Live-Detail). */
  introProConExpanded?: boolean;
  /** Einführung: weniger Zeilen, damit Karte + Daumen ohne Scroll sichtbar bleiben. */
  introCompact?: boolean;
  /** Intro/Walkthrough: zusätzliche Zeile „Keine echte Abstimmung.“ unter dem Balken. */
  introDemoVoteDisclaimer?: boolean;
  /** Walkthrough-Vorschau: Pro/Contra-Blöcke ausblenden (kompakter „Tinder“-Ausschnitt). */
  introHideProCon?: boolean;
  /** Legacy-Option: exklusives Verhalten von Pro/Contra (Standard: aus). */
  singleOpenProCon?: boolean;
}

const VotingCard: React.FC<VotingCardProps> = memo(
  ({
    card,
    introBarIcons = false,
    introProConExpanded = false,
    introCompact = false,
    introDemoVoteDisclaimer = false,
    introHideProCon = false,
    singleOpenProCon = false,
  }) => {
    const [proOpen, setProOpen] = useState(introProConExpanded);
    const [conOpen, setConOpen] = useState(introProConExpanded);

    const togglePro = () => {
      setProOpen((prev) => {
        const next = !prev;
        if (next && singleOpenProCon) setConOpen(false);
        return next;
      });
    };

    const toggleCon = () => {
      setConOpen((prev) => {
        const next = !prev;
        if (next && singleOpenProCon) setProOpen(false);
        return next;
      });
    };

    return (
      <div
        className="rounded-xl overflow-hidden border border-[#D6E0EE] bg-white"
        style={{ boxShadow: 'none' }}
      >
        <div className={`flex items-center justify-between gap-2 border-b border-[#E8EEF5] px-4 ${introCompact ? 'py-2' : 'py-2.5'}`}>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">
            {card.category}
          </span>
          <span className={`text-[10px] font-semibold ${card.urgent ? 'text-[#b91c1c]' : 'text-[#6B7A99]'}`}>
            Frist {card.deadline}
          </span>
        </div>

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

        {/* ── Live-Abstimmungsbarometer: Verlauf rot → grau → grün (Ablehnen · Enthalten · Zustimmen) ── */}
        <div className={`px-4 ${introCompact ? 'pb-1' : 'pb-2'}`}>
          <div
            className="rounded-full p-[1.5px]"
            style={{
              background: 'linear-gradient(90deg, #dc2626 0%, #94a3b8 50%, #16a34a 100%)',
            }}
            title="Ablehnen · Enthalten · Zustimmen"
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
            <span className="text-[10px] text-[#6B7A99]">
              {card.votes.toLocaleString('de-DE')} Stimmen
            </span>
            <span className="text-[10px] text-[#94a3b8]">Live-Verlauf</span>
          </div>
          {introDemoVoteDisclaimer ? (
            <p className="mt-1 text-[9px] leading-snug text-neutral-600">
              Keine echte Abstimmung.
            </p>
          ) : null}
        </div>

        {/* ── Pro / Contra: einklappbar ── */}
        {!introHideProCon ? (
        <div
          className={`mx-4 items-start ${
            introProConExpanded
              ? 'mb-2 grid min-w-0 grid-cols-2 gap-1'
              : introCompact
                ? 'mb-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2'
                : 'mb-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2'
          }`}
        >
          <div className="voting-pro-block h-full min-w-0 overflow-hidden border-t border-[#E8EEF5] bg-white">
            <button
              type="button"
              className={`flex w-full min-h-[34px] items-center justify-between gap-1 px-2.5 text-left ${introCompact ? 'py-1.5' : 'py-1.5'}`}
              onClick={togglePro}
              aria-expanded={proOpen}
              aria-controls="voting-pro-details"
              id="voting-pro-toggle"
            >
              <span className="text-[10px] font-extrabold text-[#047857]">Pro</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-[#047857] transition-transform ${proOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {proOpen ? (
              <ul
                id="voting-pro-details"
                role="region"
                aria-labelledby="voting-pro-toggle"
                className={`space-y-1 border-t border-[#E8EEF5] px-2.5 pt-1 leading-snug text-[#1A2B45] ${introCompact ? 'pb-1.5 text-[9px]' : 'pb-2.5 text-[10px]'}`}
              >
                {(card.kiAnalysis?.pros ?? []).map((p, i) => (
                  <li key={i} className="flex gap-1">
                    <span className="mt-[2px] text-[#047857]">•</span>
                    <span>{enforceFactDetail(p.text)}</span>
                  </li>
                ))}
                {(card.kiAnalysis?.pros ?? []).length === 0 && (
                  <li className="text-[#5f6b7a]">Sachliche Vorteile werden in der Analyse erläutert.</li>
                )}
              </ul>
            ) : null}
          </div>
          <div className="voting-contra-block h-full min-w-0 overflow-hidden border-t border-[#E8EEF5] bg-white">
            <button
              type="button"
              className={`flex w-full min-h-[34px] items-center justify-between gap-1 px-2.5 text-left ${introCompact ? 'py-1.5' : 'py-1.5'}`}
              onClick={toggleCon}
              aria-expanded={conOpen}
              aria-controls="voting-contra-details"
              id="voting-contra-toggle"
            >
              <span className="text-[10px] font-extrabold text-[#b91c1c]">Contra</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-[#b91c1c] transition-transform ${conOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {conOpen ? (
              <ul
                id="voting-contra-details"
                role="region"
                aria-labelledby="voting-contra-toggle"
                className={`space-y-1 border-t border-[#E8EEF5] px-2.5 pt-1 leading-snug text-[#1A2B45] ${introCompact ? 'pb-1.5 text-[9px]' : 'pb-2.5 text-[10px]'}`}
              >
                {(card.kiAnalysis?.cons ?? []).map((c, i) => (
                  <li key={i} className="flex gap-1">
                    <span className="mt-[2px] text-[#b91c1c]">•</span>
                    <span>{enforceFactDetail(c.text)}</span>
                  </li>
                ))}
                {(card.kiAnalysis?.cons ?? []).length === 0 && (
                  <li className="text-[#5f6b7a]">Sachliche Gegenargumente werden in der Analyse erläutert.</li>
                )}
              </ul>
            ) : null}
          </div>
        </div>
        ) : null}
      </div>
    );
  }
);

VotingCard.displayName = 'VotingCard';
export default VotingCard;
