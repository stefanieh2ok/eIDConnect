'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useIntroIsSpeaking, useIntroSpeakApi } from '@/components/Intro/IntroOverlay';
import { activeLocationForLevel } from '@/lib/activeLocationForLevel';
import { VOTING_DATA, WAHLEN_DATA } from '@/data/constants';
import { ListChecks, Send } from 'lucide-react';
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

const WALKTHROUGH_FOCUS_CAPTIONS: Partial<Record<IntroOverlayStepId, string>> = {
  abstimmen: 'Eine Karte · Pro/Contra · Daumen',
  wahlen: 'Stimmabgabe · Demo',
  kalender: 'Termine · Wahl / Abstimmung erkennbar',
  meldungen: 'Fall · Bearbeitungsstatus',
  praemien: 'Status · Demo',
  politikbarometer: 'Themen-Schwerpunkte',
};
import { claraBlockForStep } from '@/data/introWalkthroughClara';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import PolitikBarometerPanel from '@/components/Intro/PolitikBarometerPanel';
import type { Location, Section } from '@/types';
import { APP_DISPLAY_NAME, APP_TAGLINE } from '@/lib/branding';

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
    <div className="mb-0 w-full min-w-0 space-y-1.5 [text-wrap:balance]">
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
            'inline-flex w-full cursor-pointer list-none items-center justify-between gap-2 py-1.5 pl-2.5 pr-2.5 text-[11px] font-semibold transition [&::-webkit-details-marker]:hidden ' +
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
                'border-t px-2.5 pb-2.5 pt-1.5 text-[11px] leading-relaxed [text-wrap:pretty] whitespace-pre-line ' +
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

function WalkthroughPreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="walkthrough-preview-card flex min-h-0 w-full max-w-[280px] flex-col sm:max-w-[300px]">
      <div className="walkthrough-preview-crop flex min-h-0 flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function WalkthroughFocusVisual({ caption, children }: { caption?: string; children: React.ReactNode }) {
  return (
    <div className="walkthrough-preview-visual min-h-0 w-full flex-none">
      <div className="walkthrough-preview-visual-inner">{children}</div>
      {caption ? <div className="walkthrough-preview-caption">{caption}</div> : null}
    </div>
  );
}

/** Nur Kern-Interaktion: eine Abstimmungskarte mit Daumen — kein Listen-Chrome. */
function IntroAbstimmenSnapshot() {
  return (
    <div className="w-full max-w-[260px] rounded-xl border border-[#D6E0EE] bg-white p-2.5 shadow-sm">
      <p className="text-[8px] font-bold uppercase tracking-wide text-[#0055A4]">Abstimmung · Kirkel</p>
      <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-snug text-[#1A2B45]">Radweg Kirkel – Limbach (Lückenschluss)</p>
      <p className="mt-1 text-[8px] text-neutral-500">Frist 15.04.2026</p>
      <div className="mt-2.5 flex items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-[#F8FAFC] py-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-red-500 text-[16px] leading-none text-red-500">
          👎
        </span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 text-[12px] text-neutral-500">
          —
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-emerald-500 text-[16px] leading-none text-emerald-600">
          👍
        </span>
      </div>
    </div>
  );
}

/** Stimmzettel: nur Wahlvorschlag + 3 Listenzeilen — Fokus auf Kreuzfeld, kein Leerraum. */
function IntroWahlenSnapshot() {
  const rows = ['Partei A', 'Partei B', 'Partei C'] as const;
  return (
    <div className="w-full max-w-[236px] overflow-hidden rounded-xl border border-neutral-500/70 bg-[#FFE066] px-2 pb-1.5 pt-1.5 shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[8px] font-bold tracking-[0.14em] text-neutral-900">STIMMZETTEL</p>
          <p className="mt-0.5 text-[7.5px] font-semibold leading-tight text-neutral-800">Bundestagswahl · Demo</p>
        </div>
        <span className="shrink-0 rounded border border-black/35 bg-[#FFEB8A] px-1 py-0.5 text-[7px] font-bold text-neutral-900">
          1×
        </span>
      </div>
      <div className="mt-1.5 space-y-0.5">
        {rows.map((partei) => (
          <div
            key={partei}
            className="flex min-h-[24px] items-center gap-2 rounded border border-black/28 bg-[#FFEB8A] px-1.5 py-1"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-sm border-2 border-neutral-900/80 bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]"
              aria-hidden
            />
            <span className="text-[9px] font-semibold leading-none text-neutral-900">{partei}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntroKalenderPreview({ communeKey }: { communeKey: string }) {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const previewMonth = 4;
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

  const firstDowSun0 = new Date(previewYear, previewMonth - 1, 1).getDay();
  const startPad = (firstDowSun0 + 6) % 7;
  const daysInMonth = new Date(previewYear, previewMonth, 0).getDate();
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;

  return (
    <div className="w-full max-w-[280px] rounded-xl border border-neutral-200 bg-white p-2 text-left shadow-sm">
      <div className="mb-1.5 flex items-center justify-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-[9px] text-neutral-500">
          ◀
        </span>
        <span className="text-[10px] font-bold text-[#1A2B45]">
          April {previewYear}
        </span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-[9px] text-neutral-500">
          ▶
        </span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[7px] font-semibold text-neutral-500">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-0.5 grid grid-cols-7 gap-0.5 text-[8px] text-neutral-500">
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - startPad + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            return <span key={i} className="flex h-5 items-center justify-center rounded" aria-hidden />;
          }
          const on = highlightDays.has(dayNum);
          return (
            <span
              key={i}
              className={`flex h-5 items-center justify-center rounded ${
                on ? 'bg-[#E8F0FB] font-semibold text-[#003366] ring-1 ring-[#0055A4]/20' : ''
              }`}
            >
              {dayNum}
            </span>
          );
        })}
      </div>
      <p className="mt-1.5 border-t border-neutral-100 pt-1.5 text-center text-[7px] leading-snug text-neutral-500">
        <span className="font-semibold text-[#003366]">●</span> Wahl &nbsp;
        <span className="font-semibold text-[#0055A4]">○</span> Abstimmung · Ebenen farbig
      </p>
    </div>
  );
}

/** Ein konkreter Demo-Fall mit sichtbarem Status — kein Kategorie-Menü. */
function IntroMeldungenSnapshot({ du }: { du: boolean }) {
  return (
    <div className="w-full max-w-[260px] rounded-xl border border-neutral-200 bg-white p-2.5 text-left shadow-sm">
      <p className="text-[8px] font-bold uppercase tracking-wide text-[#0055A4]">
        {du ? 'Dein Anliegen' : 'Ihr Anliegen'}
      </p>
      <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-snug text-[#1A2B45]">
        Straßenlaterne defekt · Hauptstraße 12, Kirkel
      </p>
      <p className="mt-1 text-[8px] text-neutral-600">Kategorie: Straße / Weg</p>
      <div className="mt-2 inline-flex items-center rounded-full border border-amber-300/90 bg-amber-50 px-2.5 py-0.5 text-[9px] font-bold tracking-tight text-amber-950">
        In Prüfung
      </div>
      <p className="mt-1.5 text-[7.5px] leading-snug text-neutral-500">
        {du ? 'Du erhältst eine Rückmeldung, sobald die Gemeinde den Vorgang bearbeitet hat.' : 'Sie erhalten eine Rückmeldung, sobald die Gemeinde den Vorgang bearbeitet hat.'}
      </p>
    </div>
  );
}

/** Prämien: ein klarer Status + optional zweite Zeile — ohne Status-Raster. */
function PraemienIntroPreview({ communeName }: { communeName: string }) {
  return (
    <div className="relative w-full max-w-[260px] shrink-0 [transform:translateZ(0)]">
      <div className="rounded-xl border border-neutral-200 bg-white p-2.5 text-left shadow-sm">
        <div className="flex items-start gap-2 rounded-lg border border-[#0055A4]/20 bg-[#F0F6FF] px-2 py-2">
          <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-[#0055A4]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold leading-snug text-[#1A2B45]">Hinweis · Spielplatz Bürgerpark</p>
            <p className="mt-1 text-[12px] font-bold leading-none text-[#003366]">In Prüfung</p>
            <p className="mt-1 text-[8px] text-neutral-600">{communeName} · Demo</p>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-2 rounded-md border border-neutral-200 bg-[#F8FAFC] px-2 py-1">
          <Send className="h-3.5 w-3.5 shrink-0 text-[#0055A4]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-semibold text-neutral-900">Meldung · Laterne Hauptstraße</p>
            <p className="text-[8.5px] font-bold text-emerald-800">Eingereicht</p>
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
    const caption = WALKTHROUGH_FOCUS_CAPTIONS[step.id as IntroOverlayStepId];
    const inner = (() => {
      switch (step.id) {
        case 'abstimmen':
          return <IntroAbstimmenSnapshot />;
        case 'wahlen':
          return <IntroWahlenSnapshot />;
        case 'kalender':
          return <IntroKalenderPreview communeKey={communeKey} />;
        case 'meldungen':
          return <IntroMeldungenSnapshot du={du} />;
        case 'praemien':
          return <PraemienIntroPreview communeName={communeName} />;
        case 'politikbarometer':
          return (
            <PolitikBarometerPanel
              du={du}
              variant="compact"
              density="tight"
              leadDu=""
              leadSie=""
              heroPreview
            />
          );
        default:
          return null;
      }
    })();
    if (!inner) return null;
    return (
      <WalkthroughFocusVisual caption={caption}>
        <WalkthroughPreviewShell>{inner}</WalkthroughPreviewShell>
      </WalkthroughFocusVisual>
    );
  }, [step.id, communeKey, communeName, du]);

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
    }, 60);
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

  const liveAnnouncement = `Bereich ${clara.label}. ${clara.short} ${framingLine}`.trim();

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

      <div className="intro-walkthrough-shell flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 pt-1.5 sm:px-2.5 sm:pb-2.5 sm:pt-2">
        <div className="intro-walkthrough-device intro-device-chrome-shell intro-dark-body flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.85rem] p-[3px] sm:p-1">
          <div className="intro-walkthrough-inner flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.65rem] border border-neutral-200/95 bg-white">
          <IntroMetaStrip
            surface="light"
            stepNumber={null}
            showClaraVoice
            onSkip={skipIntroOrBackToEid}
            onClose={exitIntroOrBackToEid}
            closeAriaLabel={idx === 0 ? 'Zurück zur eID-Demo' : undefined}
          />

          <div className="shrink-0 px-4 pb-1.5 pt-1 text-center sm:px-4">
            <span className="text-[11px] font-bold tracking-tight text-[#003366]">{APP_DISPLAY_NAME}</span>
            <span className="mx-1.5 text-neutral-300" aria-hidden>
              ·
            </span>
            <span className="text-[10px] font-medium leading-snug text-neutral-500">{APP_TAGLINE}</span>
          </div>

          <div className="intro-walkthrough-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="intro-walkthrough-focus-stage min-h-0 min-w-0 flex-1">
              <div className="intro-walkthrough-focus-card">
                <div
                  className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
                  aria-hidden
                >
                  <span
                    className="absolute left-1/2 top-1/2 block w-[120%] select-none text-center text-[clamp(2rem,11vw,3.25rem)] font-bold uppercase leading-none tracking-[0.22em] text-[#0f172a]/[0.055]"
                    style={{ transform: 'translate(-50%, -50%) rotate(-14deg)' }}
                  >
                    HookAI Demo
                  </span>
                </div>
                <div className="relative z-[1] flex min-h-0 flex-col">
                <div className="shrink-0 border-b border-neutral-100/90 px-4 pb-2.5 pt-3 sm:px-4">
                  <h2 className="text-[1.0625rem] font-bold leading-snug tracking-tight text-[#0f172a] sm:text-lg">
                    {step.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-snug text-neutral-600 sm:text-[13px]">
                    {clara.short}
                  </p>
                </div>
                <div
                  key={step.id}
                  className="flex min-h-0 min-w-0 flex-none flex-col overflow-hidden px-3 pb-2 pt-2 sm:px-4"
                >
                  {preview}
                </div>
                <div className="shrink-0 border-t border-neutral-100/90 px-3 pb-2 pt-1.5 sm:px-4 sm:pb-2 sm:pt-2">
                  <WalkthroughInfoDetails
                    surface="light"
                    primaryLong={clara.long}
                    showOutro={false}
                    outroShort={du ? INTRO_OUTRO_SHORT_DU : INTRO_OUTRO_SHORT_SIE}
                    outroLong={du ? INTRO_OUTRO_DROPDOWN_DU : INTRO_OUTRO_DROPDOWN_SIE}
                  />
                </div>
                </div>
              </div>
            </div>
          </div>

          <div className="intro-walkthrough-cta relative mt-auto flex flex-shrink-0 flex-col gap-2 border-t border-neutral-200/95 bg-white px-4 pt-2.5 intro-action-bar-pad sm:px-4">
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
