'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useIntroIsSpeaking, useIntroSpeakApi } from '@/components/Intro/IntroOverlay';
import { activeLocationForLevel } from '@/lib/activeLocationForLevel';
import MeldungenSection from '@/components/Meldungen/MeldungenSection';
import OriginalStimmzettel from '@/components/Voting/OriginalStimmzettel';
import VotingCard from '@/components/Voting/VotingCard';
import VotingControls from '@/components/Voting/VotingControls';
import { VOTING_DATA, WAHLEN_DATA } from '@/data/constants';
import { CheckCircle, Clock, Info, ListChecks, Send } from 'lucide-react';
import {
  INTRO_CLOSING_SPOKEN_SEGMENTS_DU,
  INTRO_CLOSING_SPOKEN_SEGMENTS_SIE,
  INTRO_OUTRO_DROPDOWN_DU,
  INTRO_OUTRO_DROPDOWN_SIE,
  INTRO_OUTRO_LABEL,
  INTRO_OUTRO_SHORT_DU,
  INTRO_OUTRO_SHORT_SIE,
  introOverlayFramingLine,
  INTRO_OVERLAY_STEPS,
} from '@/data/introOverlayMarketing';
import type { IntroOverlayStepId } from '@/data/introOverlayMarketing';
import { claraBlockForStep } from '@/data/introWalkthroughClara';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { INTRO_SCREENSHOTS } from '@/data/introScreenshots';
import PolitikBarometerPanel from '@/components/Intro/PolitikBarometerPanel';
import type { Location, Section, VotingCard as VotingCardModel } from '@/types';
import ProductIdentityHeader from '@/components/ui/ProductIdentityHeader';

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
  /** Schritt 1 · Zurück: zur eID-Demo (Logout), nicht „Einführung erledigt“. */
  onBackFromFirstStep?: () => void;
  /** Aktueller Walkthrough-Schritt für Clara-Kontext (Dock/Chat). */
  onWalkthroughStepChange?: (step: { id: string; label: string }) => void;
  /** Gewünschter Einstiegsschritt (Standard: Abstimmen). */
  startStepId?: IntroOverlayStepId;
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
    for (const c of communeData.cards) {
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
  surface = 'dark',
}: {
  primaryLong: string;
  showOutro: boolean;
  outroShort: string;
  outroLong: string;
  surface?: 'dark' | 'light';
}) {
  const [openMain, setOpenMain] = useState(false);
  const [openOutro, setOpenOutro] = useState(false);
  const onLight = surface === 'light';
  return (
    <div className="mb-1.5 w-full min-w-0 space-y-1.5 [text-wrap:balance]">
      <div
        className={
          'group overflow-hidden rounded-xl border ' +
          (onLight
            ? 'border-slate-200 bg-slate-50/80'
            : 'border-white/15 bg-white/[0.04]')
        }
      >
        <button
          type="button"
          onClick={() => setOpenMain((v) => !v)}
          className={
            'inline-flex w-full cursor-pointer list-none items-center justify-between gap-2 py-1.5 pl-2.5 pr-2.5 text-[10.5px] font-semibold transition [&::-webkit-details-marker]:hidden ' +
            (onLight ? 'text-[#003366] hover:bg-slate-100/80' : 'text-sky-100/95 hover:bg-white/5')
          }
          aria-expanded={openMain}
        >
          <span>{openMain ? 'Weniger anzeigen' : 'Mehr anzeigen'}</span>
          <span className={(onLight ? 'text-slate-400' : 'text-white/50') + ` transition ${openMain ? 'rotate-180' : ''}`} aria-hidden>
            ▾
          </span>
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
            openMain ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <p
              className={
                'border-t px-2.5 pb-2.5 pt-1.5 text-[10.5px] leading-relaxed [text-wrap:pretty] whitespace-pre-line ' +
                (onLight
                  ? 'border-slate-200 text-neutral-700'
                  : 'border-white/10 text-white/[0.86]')
              }
            >
              {primaryLong}
            </p>
          </div>
        </div>
      </div>
      {showOutro ? (
        <div
          className={
            'group overflow-hidden rounded-xl border ' +
            (onLight
              ? 'border-violet-200 bg-violet-50/60'
              : 'border-white/15 bg-[rgba(6,20,40,0.45)]')
          }
        >
          <button
            type="button"
            onClick={() => setOpenOutro((v) => !v)}
            className={
              'inline-flex w-full cursor-pointer list-none items-center justify-between gap-2 py-1.5 pl-2.5 pr-2.5 text-[10.5px] font-semibold transition [&::-webkit-details-marker]:hidden ' +
              (onLight ? 'text-[#4C1D95] hover:bg-violet-100/70' : 'text-white/95 hover:bg-white/5')
            }
            aria-expanded={openOutro}
          >
            <span>{openOutro ? 'Weniger anzeigen' : INTRO_OUTRO_LABEL}</span>
            <span className={(onLight ? 'text-violet-400' : 'text-white/50') + ` transition ${openOutro ? 'rotate-180' : ''}`} aria-hidden>
              ▾
            </span>
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
              openOutro ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={
                  'space-y-1.5 border-t px-2.5 pb-2.5 pt-1.5 text-[10.5px] leading-relaxed [text-wrap:pretty] ' +
                  (onLight ? 'border-violet-100 text-neutral-700' : 'border-white/10 text-white/85')
                }
              >
                <p className={'font-medium ' + (onLight ? 'text-[#1A2B45]' : 'text-white/90')}>{outroShort}</p>
                <p className={'whitespace-pre-line ' + (onLight ? 'text-neutral-600' : 'text-white/78')}>{outroLong}</p>
              </div>
            </div>
          </div>
        </div>
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
      className="intro-scroll-visible max-h-[min(100%,36rem)] min-h-[16rem] overflow-y-auto overflow-x-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="p-2 text-gray-900">{children}</div>
    </div>
  );
}

function WalkthroughPreviewShell({ children }: { children: React.ReactNode }) {
  return <div className="card-content min-h-0 w-full min-w-0 overflow-hidden rounded-xl p-2">{children}</div>;
}

/**
 * Abstimmungskarte wie in der App. Daumen-Buttons in der Führung ohne reales
 * Stimmverhalten, damit der Screen ruhig und lesbar bleibt.
 */
function IntroAbstimmenPreview({ card, du }: { card: VotingCardModel; du: boolean }) {
  return (
    <div className="relative w-full min-w-0 max-w-full shrink-0 [transform:translateZ(0)]">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-none">
        <div className="p-1 sm:p-1.5 pb-2">
          <VotingCard
            card={card}
            introBarIcons
            introCompact
            introDemoVoteDisclaimer
          />
          <VotingControls canVote onVote={noopVote} introWalkthrough du={du} />
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
    <div className="card-content rounded-xl p-0 text-left">
      <div
        className="flex items-center justify-between rounded-t-xl px-2.5 py-2 text-white"
        style={{ background: 'linear-gradient(135deg, #002855 0%, #0055A4 100%)' }}
      >
        <span className="text-[11px] font-semibold">Kalender</span>
        <span className="text-[9px] opacity-90">
          März {previewYear} · Kirkel, Saarland, Saarpfalz & Bund
        </span>
      </div>
      <div className="p-2">
        <div className="card-compact mb-2 flex items-center justify-between px-2 py-1.5">
          <button type="button" className="btn-secondary btn-pill min-h-[32px] px-2.5 py-1 text-[8px]">
            Zurück
          </button>
          <span className="text-[9px] font-semibold text-[#1A2B45]">März {previewYear}</span>
          <button type="button" className="btn-secondary btn-pill min-h-[32px] px-2.5 py-1 text-[8px]">
            Weiter
          </button>
        </div>
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
            className="min-h-[11rem] max-h-60 space-y-1 overflow-y-auto pr-0.5"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {rows.slice(0, 10).map((r) => (
              <div key={`${r.kind}-${r.title}-${r.dateStr}`} className="app-card-subtle flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-[9px] text-neutral-800">
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
  const rows = useMemo(
    () =>
      [
        {
          icon: Send,
          title: 'Meldung · defekte Straßenlaterne',
          status: 'Eingereicht',
          hint: `${communeName} · Demo`,
        },
        {
          icon: CheckCircle,
          title: 'Hinweis · Spielplatz Bürgerpark',
          status: 'In Prüfung',
          hint: 'Bearbeitung durch Fachbereich',
        },
        {
          icon: CheckCircle,
          title: 'Rückmeldung · Bürgerdialog Haushalt',
          status: 'Bestätigt',
          hint: 'Eingang dokumentiert',
        },
        {
          icon: ListChecks,
          title: 'Beteiligung · digitales Bürgerportal',
          status: 'Abgeschlossen',
          hint: 'Nur Demo-Daten',
        },
      ] as const,
    [communeName],
  );

  return (
    <div className="relative w-full min-w-0 max-w-full shrink-0 [transform:translateZ(0)]">
      <div className="card-content flex min-h-0 max-h-full flex-col overflow-hidden rounded-xl p-0 text-left">
      <div
        className="shrink-0 rounded-t-xl px-2.5 py-2 text-white"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
      >
        <div className="text-[11px] font-semibold leading-snug">Prämien</div>
        <div className="text-[9px] opacity-90">Freiwillige Anerkennung · {communeName}</div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden p-2.5">
        <div className="shrink-0 grid grid-cols-2 gap-1">
          {[
            'Einwilligung erforderlich',
            'Beteiligung abgeschlossen',
            'Prämie verfügbar',
            'Eingelöst / abgeschlossen',
          ].map((label, idx) => {
            const Icon = idx === 0 ? Info : idx === 1 ? ListChecks : idx === 2 ? Clock : CheckCircle;
            return (
              <div
                key={label}
                className="flex items-center gap-1 rounded-md border border-neutral-200 bg-[#F7F9FC] px-1.5 py-1 text-[8.5px] text-neutral-700"
              >
                <Icon className="h-3 w-3 shrink-0 text-[#0055A4]" aria-hidden />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
        <div
          className="intro-scroll-visible min-h-0 max-h-[12rem] flex-1 space-y-1.5 overflow-y-auto pr-0.5"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="flex items-start gap-2 rounded-lg border border-neutral-200/90 bg-[#F7F9FC] px-2 py-1.5 text-[10px]"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0055A4]" aria-hidden />
                <div className="min-w-0 flex-1 leading-snug">
                  <div className="font-semibold text-neutral-900">{r.title}</div>
                  <div className="mt-0.5 text-[9px] font-semibold text-[#003366]">{r.status}</div>
                  <div className="mt-0.5 text-[9px] text-neutral-600">{r.hint}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

export default function DemoIntroWalkthrough({
  du: _du,
  residenceLocation,
  onClose,
  onFinish,
  onBackFromFirstStep,
  onWalkthroughStepChange,
  startStepId = 'abstimmen',
}: Props) {
  const { dispatch } = useApp();
  const communeKey = introCommuneVoteKey(residenceLocation);
  const communeName = COMMUNE_DISPLAY[communeKey] ?? communeKey;
  const previewCard = VOTING_DATA[communeKey]?.cards?.[0] ?? VOTING_DATA.kirkel.cards[0];
  const du = _du;
  const steps = INTRO_OVERLAY_STEPS;
  const initialIdx = useMemo(() => {
    const i = steps.findIndex((s) => s.id === startStepId);
    return i >= 0 ? i : 0;
  }, [startStepId, steps]);
  const [idx, setIdx] = useState(initialIdx);
  useEffect(() => {
    setIdx(initialIdx);
  }, [initialIdx]);
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
            <IntroAbstimmenPreview card={previewCard} du={_du} />
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
            <WalkthroughPreviewShell>
              <IntroKalenderPreview communeKey={communeKey} />
            </WalkthroughPreviewShell>
          </IntroScreenshotOrPreview>
        );
      case 'meldungen':
        return (
          <div className="app-section-shell min-h-0 w-full min-w-0 overflow-hidden rounded-xl bg-[#F8FAFD]">
            <div
              className="p-2 sm:p-2.5"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <MeldungenSection embeddedInWalkthrough />
            </div>
          </div>
        );
      case 'praemien':
        return (
          <WalkthroughPreviewShell>
            <PraemienIntroPreview communeName={communeName} />
          </WalkthroughPreviewShell>
        );
      case 'politikbarometer':
        return (
          <WalkthroughPreviewShell>
            <PolitikBarometerPanel du={du} variant="compact" density="tight" />
          </WalkthroughPreviewShell>
        );
      default:
        return null;
    }
  }, [step.id, previewCard, communeName, du, communeKey]);

  const speakApi = useIntroSpeakApi();
  const isIntroSpeaking = useIntroIsSpeaking();
  const speechStartedRef = useRef(false);
  const speechAutoAdvancedRef = useRef(false);
  const speechStepKeyRef = useRef<string>('');

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
    if (!speakApi.readAloud) {
      speechStartedRef.current = false;
      speechAutoAdvancedRef.current = false;
      speechStepKeyRef.current = '';
      return;
    }
    const speechKey = `walkthrough-${idx}-${step.id}`;
    speechStepKeyRef.current = speechKey;
    speechStartedRef.current = false;
    speechAutoAdvancedRef.current = false;
    const t = window.setTimeout(() => {
      speakApi.speakIntroParts(speakParts, speechKey);
    }, 120);
    return () => {
      window.clearTimeout(t);
      speakApi.stopIntroSpeech();
    };
  }, [speakApi, speakApi?.readAloud, idx, step.id, speakParts]);

  useEffect(() => {
    if (!speakApi?.readAloud) return;
    const activeSpeechKey = `walkthrough-${idx}-${step.id}`;
    if (speechStepKeyRef.current !== activeSpeechKey) return;

    if (isIntroSpeaking) {
      speechStartedRef.current = true;
      return;
    }
    if (!speechStartedRef.current || speechAutoAdvancedRef.current) return;
    if (isLast) return;

    speechAutoAdvancedRef.current = true;
    setIdx((p) => Math.min(steps.length - 1, p + 1));
  }, [isIntroSpeaking, idx, step.id, isLast, onFinish, speakApi?.readAloud, steps.length]);

  const liveAnnouncement = `Bereich ${clara.label}. ${clara.line10s} ${framingLine || clara.short}`.trim();

  const exitIntroOrBackToEid = idx === 0 ? (onBackFromFirstStep ?? onClose) : onClose;
  const skipIntroOrBackToEid = idx === 0 ? (onBackFromFirstStep ?? onFinish) : onFinish;

  return (
    <div
      className="relative z-10 flex min-h-0 h-full w-full max-w-[100%] min-w-0 flex-col overflow-hidden bg-[#020712] font-sans antialiased [font-synthesis:none]"
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-1 pb-1 pt-1 sm:px-2">
        <div className="intro-device-chrome-shell intro-dark-body flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.85rem] p-[3px] sm:p-1">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.65rem] border border-neutral-200/95 bg-white">
          <IntroMetaStrip
            surface="light"
            stepNumber={null}
            showClaraVoice
            onSkip={skipIntroOrBackToEid}
            onClose={exitIntroOrBackToEid}
            closeAriaLabel={idx === 0 ? 'Zurück zur eID-Demo' : undefined}
          />

          <div
            className={`flex-shrink-0 px-3 sm:px-4 ${isAbstimmenStep ? 'pb-0.5 pt-1.5' : 'pb-1 pt-2.5'}`}
          >
            <ProductIdentityHeader />
            <h2 className="mt-1 t-card-title leading-tight">
              {clara.label}
            </h2>
            <p
              className={`font-medium text-[#374151] [text-wrap:pretty] ${
                isAbstimmenStep ? 'mt-1 line-clamp-2 text-[9.5px] leading-snug' : 'mt-1 text-[10px] leading-snug'
              }`}
            >
              {clara.line10s}
            </p>
            <div className="mt-1.5">
              <WalkthroughInfoDetails
                surface="light"
                primaryLong={clara.long}
                showOutro={false}
                outroShort={du ? INTRO_OUTRO_SHORT_DU : INTRO_OUTRO_SHORT_SIE}
                outroLong={du ? INTRO_OUTRO_DROPDOWN_DU : INTRO_OUTRO_DROPDOWN_SIE}
              />
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3 pb-1 sm:px-4">
            <div className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div
                className={`relative flex min-h-0 w-full min-w-0 flex-1 flex-col rounded-2xl border border-neutral-200/90 bg-[#F7F9FC] p-1 shadow-none sm:p-1.5 ${
                  isAbstimmenStep
                    ? 'intro-walkthrough-scroll overflow-x-hidden overflow-y-auto overscroll-contain'
                    : 'min-h-0 overflow-hidden'
                }`}
                style={
                  isAbstimmenStep
                    ? {
                        minHeight: 0,
                        /* Im Geräterahmen: an Elternhöhe koppeln, nicht an Viewport (dvh). */
                        maxHeight: 'min(100%, 56rem)',
                      }
                    : { minHeight: 0, maxHeight: '100%' }
                }
              >
                <div
                  className={
                    isAbstimmenStep
                      ? 'flex w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pb-2'
                      : 'intro-walkthrough-scroll intro-scroll-visible flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pb-2'
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

          <div className="relative z-[45] flex flex-shrink-0 flex-col gap-2 border-t border-neutral-200 bg-[#F7F9FC] px-3 pt-2.5 intro-action-bar-pad sm:px-4">
            {isLast ? (
              <p className="t-body-sm text-center text-neutral-600">
                Demo startet jetzt mit einem kurzen Übergang.
              </p>
            ) : null}
            <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                speechAutoAdvancedRef.current = true;
                speechStartedRef.current = false;
                speakApi?.stopIntroSpeech();
                if (idx === 0) {
                  if (onBackFromFirstStep) onBackFromFirstStep();
                  return;
                }
                setIdx((p) => Math.max(0, p - 1));
              }}
              className="btn-ghost t-button inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center px-3"
            >
              Zurück
            </button>
            <button
              type="button"
              onClick={() => {
                speechAutoAdvancedRef.current = true;
                speechStartedRef.current = false;
                speakApi?.stopIntroSpeech();
                if (isLast) onFinish();
                else setIdx((p) => Math.min(steps.length - 1, p + 1));
              }}
              className={
                'btn-primary t-button min-h-[44px] min-w-0 flex-1 text-[15px] font-bold ' +
                (isLast ? 'whitespace-nowrap' : '')
              }
            >
              {isLast ? 'App starten' : 'Weiter'}
            </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
