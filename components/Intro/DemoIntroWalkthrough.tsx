'use client';

import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useIntroSpeakApi } from '@/components/Intro/IntroOverlay';
import { activeLocationForLevel } from '@/lib/activeLocationForLevel';
import MeldungenSection from '@/components/Meldungen/MeldungenSection';
import OriginalStimmzettel from '@/components/Voting/OriginalStimmzettel';
import VotingCard from '@/components/Voting/VotingCard';
import VotingControls from '@/components/Voting/VotingControls';
import { VOTING_DATA, WAHLEN_DATA } from '@/data/constants';
import { regionalPraemienForCity } from '@/data/demoVoting2026';
import {
  INTRO_CLOSING_SPOKEN_SEGMENTS_DU,
  INTRO_CLOSING_SPOKEN_SEGMENTS_SIE,
  INTRO_FINISH_CTA_LABEL,
  INTRO_OUTRO_DROPDOWN_DU,
  INTRO_OUTRO_DROPDOWN_SIE,
  INTRO_OUTRO_LABEL,
  INTRO_OUTRO_SHORT_DU,
  INTRO_OUTRO_SHORT_SIE,
  introOverlayFramingLine,
  INTRO_OVERLAY_STEPS,
} from '@/data/introOverlayMarketing';
import { claraBlockForStep } from '@/data/introWalkthroughClara';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { INTRO_SCREENSHOTS } from '@/data/introScreenshots';
import PolitikBarometerPanel from '@/components/Intro/PolitikBarometerPanel';
import type { Location, Section, VotingCard as VotingCardModel } from '@/types';

function walkthroughSectionForStep(stepId: string): Section {
  switch (stepId) {
    case 'abstimmen':
      return 'live';
    case 'wahlen':
      return 'wahlen';
    case 'kalender':
      return 'kalender';
    case 'meldungen':
      return 'meldungen';
    case 'praemien':
      return 'leaderboard';
    case 'politikbarometer':
      return 'live';
    default:
      return 'live';
  }
}

type Props = {
  du: boolean;
  /** Wohnort aus der App; steuert Beispielkarten (Abstimmen, Meldungen, Gemeinderat). */
  residenceLocation: Location;
  onClose: () => void;
  onFinish: () => void;
  /** Aktueller Walkthrough-Schritt für Clara-Kontext (Dock/Chat). */
  onWalkthroughStepChange?: (step: { id: string; label: string }) => void;
};

const INTRO_KOMMUNE_VOTE_KEYS = new Set<string>([
  'kirkel',
  'viernheim',
  'frankfurt',
  'mannheim',
  'heidelberg',
  'weinheim',
  'neustadt',
  'bremen',
  'berlin',
  'muenchen',
]);

function introCommuneVoteKey(loc: Location): string {
  if (INTRO_KOMMUNE_VOTE_KEYS.has(loc)) return loc;
  return 'kirkel';
}

const COMMUNE_DISPLAY: Record<string, string> = {
  kirkel: 'Kirkel',
  viernheim: 'Viernheim',
  frankfurt: 'Frankfurt am Main',
  mannheim: 'Mannheim',
  heidelberg: 'Heidelberg',
  weinheim: 'Weinheim',
  neustadt: 'Neustadt an der Weinstraße',
  bremen: 'Bremen',
  berlin: 'Berlin',
  muenchen: 'München',
};

const noopVote = () => {};
const noopKi = () => {};
const noopDrag = (_x?: number, _y?: number) => {};

function parseDeDeadline(s: string): { d: number; m: number; y: number } | null {
  const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  return { d: Number(m[1]), m: Number(m[2]), y: Number(m[3]) };
}

type IntroCalRow = {
  level: 'bund' | 'land' | 'kreis' | 'kommune';
  kind: 'abstimmung' | 'wahl' | 'beteiligung';
  title: string;
  dateStr: string;
};

function communeLabel(key: string): string {
  return (
    {
      kirkel: 'Kirkel',
      viernheim: 'Viernheim',
      frankfurt: 'Frankfurt am Main',
      mannheim: 'Mannheim',
      heidelberg: 'Heidelberg',
      weinheim: 'Weinheim',
      neustadt: 'Neustadt an der Weinstraße',
      bremen: 'Bremen',
      berlin: 'Berlin',
      muenchen: 'München',
    } as Record<string, string>
  )[key] ?? key;
}

/** Termine aus VOTING_DATA / WAHLEN_DATA — gleiche inhaltliche Basis wie der Kalender der App. */
function introCalendarRowsFromFixtures(communeKey: string): IntroCalRow[] {
  const rows: IntroCalRow[] = [];
  const komName = communeLabel(communeKey);
  /* Sichtbare, app-nahe Beispiele (gleiche Logik wie Meldungen-Demo). */
  rows.push({
    level: 'kommune',
    kind: 'beteiligung',
    title: `Beteiligung · Meldung Spielplatz Bürgerpark (${komName})`,
    dateStr: '22.03.2026',
  });
  const communeData = VOTING_DATA[communeKey];
  if (communeData && 'cards' in communeData) {
    for (const c of communeData.cards.slice(0, 4)) {
      const hall = /kirkel-halle|halle kirkel/i.test(c.title) || c.title.includes('Kirkel-Halle');
      rows.push({
        level: 'kommune',
        kind: hall ? 'beteiligung' : 'abstimmung',
        title: hall ? `Bürgerbeteiligung · ${c.title}` : `${c.title} · ${komName}`,
        dateStr: c.deadline,
      });
    }
  }
  const pushAbst = (level: IntroCalRow['level'], card: { title: string; deadline: string } | undefined) => {
    if (!card) return;
    rows.push({
      level,
      kind: 'abstimmung',
      title:
        level === 'bund'
          ? `${card.title} · Bund`
          : level === 'land'
            ? `${card.title} · Saarland`
            : `${card.title} · Saarpfalz-Kreis`,
      dateStr: card.deadline,
    });
  };
  pushAbst('bund', VOTING_DATA.deutschland?.cards?.[0]);
  pushAbst('bund', VOTING_DATA.deutschland?.cards?.[1]);
  pushAbst('land', VOTING_DATA.saarland?.cards?.[0]);
  pushAbst('land', VOTING_DATA.saarland?.cards?.[1]);
  pushAbst('kreis', VOTING_DATA.saarpfalz?.cards?.[0]);
  pushAbst('kreis', VOTING_DATA.saarpfalz?.cards?.[1]);

  const pickWahl = (id: string) => WAHLEN_DATA.find((w) => w.id === id);
  const btw = pickWahl('btw25');
  if (btw?.datum) {
    rows.push({ level: 'bund', kind: 'wahl', title: `Bundestagswahl · ${btw.name}`, dateStr: btw.datum });
  }
  const ltwSl = pickWahl('ltw-sl-2022');
  if (ltwSl?.datum) {
    rows.push({ level: 'land', kind: 'wahl', title: `Landtagswahl Saarland · ${ltwSl.name}`, dateStr: ltwSl.datum });
  }
  const ktSp = pickWahl('kt-saarpfalz-2024');
  if (ktSp?.datum) {
    rows.push({ level: 'kreis', kind: 'wahl', title: `Kreistag · ${ktSp.name}`, dateStr: ktSp.datum });
  }
  if (communeKey === 'kirkel') {
    const kw = pickWahl('kw-kirkel-2024');
    if (kw?.datum) {
      rows.push({ level: 'kommune', kind: 'wahl', title: `Kommunalwahl · Kirkel · ${kw.name}`, dateStr: kw.datum });
    }
  }

  const seen = new Set<string>();
  const uniq = rows.filter((r) => {
    const k = `${r.kind}|${r.title}|${r.dateStr}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  uniq.sort((a, b) => {
    const pa = parseDeDeadline(a.dateStr);
    const pb = parseDeDeadline(b.dateStr);
    if (!pa || !pb) return 0;
    if (pa.y !== pb.y) return pa.y - pb.y;
    if (pa.m !== pb.m) return pa.m - pb.m;
    return pa.d - pb.d;
  });
  return uniq;
}

function WalkthroughInfoDetails({
  primaryLong,
  showOutro,
  outroShort,
  outroLong,
}: {
  primaryLong: string;
  showOutro: boolean;
  outroShort: string;
  outroLong: string;
}) {
  return (
    <div className="mb-1.5 w-full min-w-0 space-y-1.5 [text-wrap:balance]">
      <details className="group overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] open:border-sky-400/25">
        <summary className="cursor-pointer list-none select-none py-1.5 pl-2.5 pr-2.5 text-[10.5px] font-semibold text-sky-100/95 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex w-full items-center justify-between gap-2">
            <span>Mehr zu dieser Ansicht</span>
            <span
              className="text-white/50 transition group-open:rotate-180"
              aria-hidden
            >
              ▾
            </span>
          </span>
        </summary>
        <p className="border-t border-white/10 px-2.5 pb-2.5 pt-1.5 text-[10.5px] leading-relaxed text-white/[0.86] [text-wrap:pretty] whitespace-pre-line">
          {primaryLong}
        </p>
      </details>
      {showOutro ? (
        <details className="group overflow-hidden rounded-xl border border-white/15 bg-[rgba(6,20,40,0.45)] open:border-violet-300/25">
          <summary className="cursor-pointer list-none select-none py-1.5 pl-2.5 pr-2.5 text-[10.5px] font-semibold text-white/95 [&::-webkit-details-marker]:hidden">
            <span className="inline-flex w-full items-center justify-between gap-2">
              <span>{INTRO_OUTRO_LABEL}</span>
              <span
                className="text-white/50 transition group-open:rotate-180"
                aria-hidden
              >
                ▾
              </span>
            </span>
          </summary>
          <div className="space-y-1.5 border-t border-white/10 px-2.5 pb-2.5 pt-1.5 text-[10.5px] leading-relaxed text-white/85 [text-wrap:pretty]">
            <p className="font-medium text-white/90">{outroShort}</p>
            <p className="whitespace-pre-line text-white/78">{outroLong}</p>
          </div>
        </details>
      ) : null}
    </div>
  );
}

/** PNG unter public/intro/ optional; sonst eingebaute Vorschau (siehe data/introScreenshots.ts). */
function IntroScreenshotOrPreview({
  src,
  alt,
  children,
  useScreenshot = true,
  noClip = false,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
  useScreenshot?: boolean;
  /** Wenn true: kein overflow:hidden (z. B. Abstimmen-Intro mit Skalierung, Daumen sichtbar). */
  noClip?: boolean;
}) {
  const [showShot, setShowShot] = useState(false);
  const effectiveShowShot = useScreenshot && showShot;
  return (
    <div
      className={
        'relative w-full shrink-0 rounded-xl ' + (noClip ? 'overflow-visible' : 'overflow-hidden')
      }
    >
      <div className={effectiveShowShot ? 'hidden' : 'block'}>{children}</div>
      <img
        src={src}
        alt={alt}
        className={
          effectiveShowShot
            ? 'mx-auto w-full rounded-xl border border-white/35 shadow-none'
            : 'pointer-events-none absolute h-0 w-0 opacity-0'
        }
        loading="eager"
        decoding="async"
        onLoad={() => setShowShot(true)}
        onError={() => setShowShot(false)}
      />
    </div>
  );
}

function BallotScroll({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="hide-scrollbar max-h-[min(72dvh,36rem)] min-h-[16rem] overflow-y-auto overflow-x-hidden rounded-xl border border-white/30 bg-white shadow-md"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="p-2 text-gray-900">{children}</div>
    </div>
  );
}

/**
 * Abstimmungskarte wie in der App. Daumen-Buttons in der Führung ohne reales
 * Stimmverhalten, damit der Screen ruhig und lesbar bleibt.
 */
function IntroAbstimmenPreview({ card }: { card: VotingCardModel }) {
  return (
    <div className="relative w-full min-w-0 max-w-full shrink-0 [transform:translateZ(0)]">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-none">
        <div className="p-1 sm:p-1.5 pb-2">
          <VotingCard
            card={card}
            canVote
            dragOffsetX={0}
            dragOffsetY={0}
            isDragging={false}
            onDragStart={noopDrag}
            onDragMove={noopDrag}
            onDragEnd={noopDrag}
            onVote={noopVote}
            introBarIcons
            introProConExpanded={false}
            introCompact
          />
          <VotingControls canVote onVote={noopVote} introWalkthrough />
        </div>
      </div>
    </div>
  );
}

function IntroKalenderPreview({ communeKey }: { communeKey: string }) {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const previewMonth = 3;
  const previewYear = 2026;
  const rows = useMemo(() => introCalendarRowsFromFixtures(communeKey), [communeKey]);
  const highlightDays = useMemo(() => {
    const s = new Set<number>();
    for (const r of rows) {
      const p = parseDeDeadline(r.dateStr);
      if (p && p.m === previewMonth && p.y === previewYear) s.add(p.d);
    }
    return s;
  }, [rows]);

  const levelBadge = (level: IntroCalRow['level']) => {
    const map = {
      bund: 'bg-slate-600 text-white',
      land: 'bg-[#0c2d5c] text-white',
      kreis: 'bg-[#0055A4] text-white',
      kommune: 'bg-[#38bdf8] text-[#0c2d5c]',
    } as const;
    const label = { bund: 'Bund', land: 'Land', kreis: 'Kreis', kommune: 'Kommune' }[level];
    return (
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-bold ${map[level]}`}>{label}</span>
    );
  };

  const kindLabel = (r: IntroCalRow) =>
    r.kind === 'wahl' ? 'Wahl' : r.kind === 'beteiligung' ? 'Beteiligung' : 'Abstimmung';

  const firstDowSun0 = new Date(previewYear, previewMonth - 1, 1).getDay();
  const startPad = (firstDowSun0 + 6) % 7;
  const daysInMonth = new Date(previewYear, previewMonth, 0).getDate();
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white text-left shadow-md">
      <div
        className="flex items-center justify-between rounded-t-xl px-3 py-2.5 text-white"
        style={{ background: 'linear-gradient(135deg, #002855 0%, #0055A4 100%)' }}
      >
        <span className="text-[12px] font-bold">Kalender</span>
        <span className="text-[10px] opacity-90">
          März {previewYear} · Kirkel, Saarland, Saarpfalz & Bund
        </span>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-semibold text-neutral-500">
          {days.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-0.5 text-[9px] text-neutral-500">
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - startPad + 1;
            if (dayNum < 1 || dayNum > daysInMonth) {
              return <span key={i} className="flex h-6 items-center justify-center rounded" aria-hidden />;
            }
            const on = highlightDays.has(dayNum);
            return (
              <span
                key={i}
                className={`flex h-6 items-center justify-center rounded ${
                  on ? 'bg-[#E8F0FB] font-semibold text-[#003366] ring-1 ring-[#0055A4]/25' : ''
                }`}
              >
                {dayNum}
              </span>
            );
          })}
        </div>
        <div className="mt-2 space-y-1 border-t border-neutral-100 pt-2">
          <p className="text-[9px] font-semibold text-[#1A2B45]">Auszug · gebündelt nach Ebene</p>
          <div
            className="min-h-[11rem] max-h-[min(22rem,52dvh)] space-y-1 overflow-y-auto pr-0.5"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {rows.slice(0, 10).map((r) => (
              <div
                key={`${r.kind}-${r.title}-${r.dateStr}`}
                className="flex items-start gap-1.5 rounded-lg border border-neutral-200/90 bg-neutral-50/90 px-2 py-1.5 text-[9px] text-neutral-800"
              >
                {levelBadge(r.level)}
                <div className="min-w-0 flex-1 leading-snug">
                  <span className="font-semibold text-[#1A2B45]">
                    {kindLabel(r)} · {r.title}
                  </span>
                  <span className="mt-0.5 block text-[8.5px] text-neutral-600">Frist / Termin · {r.dateStr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PraemienIntroPreview({ communeName }: { communeName: string }) {
  const [checkFlash, setCheckFlash] = useState(false);
  const praemienAuszug = useMemo(() => regionalPraemienForCity(communeName).slice(0, 5), [communeName]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setCheckFlash(true);
    const id = window.setTimeout(() => setCheckFlash(false), 1800);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white text-left shadow-md">
      <div
        className="rounded-t-xl p-3 text-white"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
      >
        <div className="text-sm font-bold leading-snug">Prämien</div>
        <div className="text-[10px] opacity-90">Teilnahme freiwillig · Auszug {communeName} & Region</div>
      </div>
      <div className="space-y-2 p-3">
        <label
          className="relative flex cursor-default items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-[10px] text-neutral-800 onboarding-heartbeat"
          onAnimationEnd={(e) => {
            if (e.target !== e.currentTarget) return;
            const name = e.animationName || '';
            if (!name.includes('eid-filter-heartbeat')) return;
            (e.currentTarget as HTMLElement).classList.remove('onboarding-heartbeat');
          }}
        >
          <input type="checkbox" readOnly tabIndex={-1} className="pointer-events-none mt-0.5" aria-hidden />
          {checkFlash ? (
            <span className="absolute left-2.5 top-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-sm">
              ok
            </span>
          ) : null}
          <span>Ich möchte am freiwilligen Punkte- und Prämienprogramm teilnehmen.</span>
        </label>
        <p className="text-[10px] text-neutral-600">
          Nach Zustimmung sind Einlösen und Details wie in der App freigeschaltet — hier ein regionaler Vorgeschmack.
        </p>
        <div className="max-h-[11.5rem] space-y-1.5 overflow-y-auto pr-0.5" style={{ WebkitOverflowScrolling: 'touch' }}>
          <p className="text-[9px] font-bold uppercase tracking-wide text-[#1A2B45]">Lokale Prämien · Auszug</p>
          {praemienAuszug.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-neutral-200/90 bg-[#F7F9FC] px-2 py-1.5 text-[10px]"
            >
              <div className="min-w-0 flex-1 leading-snug">
                <div className="font-semibold text-neutral-900">{p.name}</div>
                <div className="mt-0.5 text-[9px] text-neutral-600">
                  {p.description} · {p.points.toLocaleString('de-DE')} Punkte
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-dashed border-[#BFD9FF] bg-[#F0F6FF] px-2.5 py-2 text-[9px] text-[#003366]">
          Vorschau: Freibad, Mobilität, Kino, Museum, Nahverkehr und lokale Partner — gebündelt wie im Prämien-Bereich der App.
        </div>
        <button
          type="button"
          disabled
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 text-[10px] font-semibold text-neutral-400"
        >
          Einlösen (nach Aktivierung in der App)
        </button>
      </div>
    </div>
  );
}

export default function DemoIntroWalkthrough({
  du: _du,
  residenceLocation,
  onClose,
  onFinish,
  onWalkthroughStepChange,
}: Props) {
  const { dispatch } = useApp();
  const communeKey = introCommuneVoteKey(residenceLocation);
  const communeName = COMMUNE_DISPLAY[communeKey] ?? communeKey;
  const previewCard = VOTING_DATA[communeKey]?.cards?.[0] ?? VOTING_DATA.kirkel.cards[0];
  const du = _du;
  const steps = INTRO_OVERLAY_STEPS;

  const [idx, setIdx] = useState(0);
  const step = steps[idx];
  const isLast = idx >= steps.length - 1;
  const isAbstimmenStep = step.id === 'abstimmen';

  const framingLine = introOverlayFramingLine(step.id, du);
  const clara = useMemo(() => claraBlockForStep(step.id, du), [step.id, du]);

  const speakParts = useMemo(() => {
    const base: string[] = [clara.line10s, ...clara.speakSegments];
    if (isLast) {
      return [
        ...base,
        ...(du ? INTRO_CLOSING_SPOKEN_SEGMENTS_DU : INTRO_CLOSING_SPOKEN_SEGMENTS_SIE),
      ];
    }
    return base;
  }, [clara.line10s, clara.speakSegments, isLast, du]);

  const preview = useMemo(() => {
    switch (step.id) {
      case 'abstimmen':
        return (
          <IntroScreenshotOrPreview
            src={INTRO_SCREENSHOTS.beteiligung}
            alt="Bereich Abstimmen"
            useScreenshot={false}
            noClip
          >
            <IntroAbstimmenPreview card={previewCard} />
          </IntroScreenshotOrPreview>
        );
      case 'wahlen':
        return (
          <IntroScreenshotOrPreview src={INTRO_SCREENSHOTS.wahlen} alt="Bereich Wahlen – Stimmzettel" useScreenshot>
            <BallotScroll>
              <OriginalStimmzettel
                level="bund"
                wahlkreis="Saarbrücken"
                canVote
                introMode
                du={du}
                onVote={noopVote}
                onKIAnalysis={noopKi}
              />
            </BallotScroll>
          </IntroScreenshotOrPreview>
        );
      case 'kalender':
        return (
          <IntroScreenshotOrPreview
            src={INTRO_SCREENSHOTS.kalender}
            alt="Bereich Kalender"
            useScreenshot={false}
          >
            <IntroKalenderPreview communeKey={communeKey} />
          </IntroScreenshotOrPreview>
        );
      case 'meldungen':
        return (
          <div className="min-h-0 w-full min-w-0 overflow-hidden rounded-xl border border-white/20 bg-[#F7F9FC]">
            <div
              className="max-h-[min(68dvh,34rem)] min-h-[14rem] overflow-y-auto overscroll-contain p-2 sm:p-2.5"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <MeldungenSection embeddedInWalkthrough />
            </div>
          </div>
        );
      case 'praemien':
        return <PraemienIntroPreview communeName={communeName} />;
      case 'politikbarometer':
        return <PolitikBarometerPanel du={du} variant="compact" />;
      default:
        return null;
    }
  }, [step.id, previewCard, communeName, du, communeKey]);

  const speakApi = useIntroSpeakApi();

  useEffect(() => {
    const section = walkthroughSectionForStep(step.id);
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
    if (section === 'meldungen') {
      dispatch({
        type: 'SET_ACTIVE_LOCATION',
        payload: activeLocationForLevel(residenceLocation, 'kommune'),
      });
    }
  }, [step.id, dispatch, residenceLocation]);

  useLayoutEffect(() => {
    document.querySelectorAll<HTMLElement>('.intro-walkthrough-scroll').forEach((el) => {
      el.scrollTop = 0;
    });
  }, [idx, step.id]);

  useEffect(() => {
    onWalkthroughStepChange?.({ id: step.id, label: clara.label });
  }, [step.id, clara.label, onWalkthroughStepChange]);

  useEffect(() => {
    if (!speakApi) return;
    if (!speakApi.readAloud) return;
    const speechKey = `walkthrough-${idx}-${step.id}`;
    const t = window.setTimeout(() => {
      speakApi.speakIntroParts(speakParts, speechKey);
    }, 120);
    return () => {
      window.clearTimeout(t);
      speakApi.stopIntroSpeech();
    };
  }, [speakApi, speakApi?.readAloud, idx, step.id, speakParts]);

  const liveAnnouncement = `Bereich ${clara.label}. ${clara.line10s} ${framingLine || clara.short}`.trim();

  return (
    <div
      className="intro-dark-body relative z-10 flex min-h-0 h-full w-full max-w-[100%] min-w-0 flex-col overflow-hidden font-sans antialiased [font-synthesis:none] shadow-none"
      role="dialog"
      aria-modal="true"
      aria-label="Einführung"
    >
      {/* Versteckte Live-Region für Screenreader: Statuswechsel werden bei jedem
          Schritt-Wechsel angekündigt, ohne dass etwas UI-seitig sichtbar wird. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      <IntroMetaStrip stepNumber={null} onSkip={onFinish} onClose={onClose} />

      <div
        className={`flex-shrink-0 px-3 sm:px-4 ${isAbstimmenStep ? 'pb-0.5 pt-1.5' : 'pb-1 pt-2.5'}`}
      >
        <h2 className="text-[15px] font-extrabold leading-tight tracking-tight text-white sm:text-[16px]">
          Im Überblick · {clara.label}
        </h2>
        <p
          className={`font-medium text-sky-100/88 [text-wrap:pretty] ${
            isAbstimmenStep ? 'mt-1 line-clamp-2 text-[10px] leading-snug' : 'mt-1.5 text-[11px] leading-snug'
          }`}
        >
          {clara.line10s}
        </p>
        {!isAbstimmenStep ? (
          <div className="mt-1.5">
            <WalkthroughInfoDetails
              primaryLong={clara.long}
              showOutro={isLast}
              outroShort={du ? INTRO_OUTRO_SHORT_DU : INTRO_OUTRO_SHORT_SIE}
              outroLong={du ? INTRO_OUTRO_DROPDOWN_DU : INTRO_OUTRO_DROPDOWN_SIE}
            />
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3 pb-1 sm:px-4">
        <div className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div
            className={`relative min-h-0 w-full min-w-0 flex-1 rounded-2xl border border-white/12 bg-white p-1 shadow-none sm:p-1.5 ${
              isAbstimmenStep
                ? 'intro-walkthrough-scroll flex flex-col overflow-y-auto overflow-x-hidden overscroll-contain'
                : 'overflow-hidden'
            }`}
            style={
              isAbstimmenStep
                ? {
                    minHeight: 0,
                    /* Großzügiges Cap (Desktop); effektive Höhe begrenzt weiterhin das Flex-Layout unter Meta/Titel/Footer. */
                    maxHeight: 'min(calc(100svh - 5rem), calc(100dvh - 5rem), 56rem)',
                  }
                : { minHeight: 'min(78dvh, 40rem)' }
            }
          >
            <div
              className={
                isAbstimmenStep
                  ? 'flex w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pb-2'
                  : 'intro-walkthrough-scroll hide-scrollbar flex h-full min-h-[min(70dvh,32rem)] w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pb-2 sm:min-h-[min(72dvh,36rem)]'
              }
            >
              <div
                key={step.id}
                className={
                  isAbstimmenStep
                    ? 'flex w-full min-w-0 flex-col'
                    : 'flex w-full min-w-0 flex-1 flex-col'
                }
              >
                {preview}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Reservierter Streifen für Clara-Pille — Inhalt per Portal aus ClaraDock, nicht über die Vorschau gelegt. */}
      <div
        id="walkthrough-clara-slot"
        className="relative z-20 flex min-h-[3.25rem] w-full shrink-0 items-center justify-center border-t border-white/10 bg-[rgba(12,18,32,0.92)] px-3 py-1 sm:px-4"
        aria-hidden={false}
      />

      <div className="relative z-30 flex flex-shrink-0 gap-2 border-t border-white/10 bg-[rgba(12,18,32,0.96)] px-3 pt-2.5 intro-action-bar-pad sm:px-4">
        <button
          type="button"
          onClick={() => {
            if (idx === 0) onClose();
            else setIdx((p) => Math.max(0, p - 1));
          }}
          className="inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-black/80 bg-black px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-neutral-900 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
        >
          Zurück
        </button>
        <button
          type="button"
          onClick={() => (isLast ? onFinish() : setIdx((p) => Math.min(steps.length - 1, p + 1)))}
          className={
            'btn-gov-primary btn-gov-primary--flex min-h-[44px] min-w-0 flex-1 text-[11px] font-extrabold ' +
            (isLast ? 'whitespace-nowrap' : '')
          }
        >
          {isLast ? INTRO_FINISH_CTA_LABEL : 'Weiter'}
        </button>
      </div>
    </div>
  );
}
