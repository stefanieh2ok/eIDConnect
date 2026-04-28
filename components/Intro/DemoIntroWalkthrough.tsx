'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useIntroIsSpeaking, useIntroSpeakApi } from '@/components/Intro/IntroOverlay';
import { activeLocationForLevel } from '@/lib/activeLocationForLevel';
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
import PolitikBarometerPanel from '@/components/Intro/PolitikBarometerPanel';
import LiveSection from '@/components/Live/LiveSection';
import LeaderboardSection from '@/components/Leaderboard/LeaderboardSection';
import ElectionsSection from '@/components/Elections/ElectionsSection';
import CalendarSection from '@/components/Calendar/CalendarSection';
import MeldungenSection from '@/components/Meldungen/MeldungenSection';
import type { Location, Section, UserPreferences, VoteType } from '@/types';
import { APP_DISPLAY_NAME, APP_TAGLINE } from '@/lib/branding';
import { DEMO_POINTS_PER_ABSTIMMUNG, VOTING_DATA, WAHLEN_DATA } from '@/data/constants';
import VotingCard from '@/components/Voting/VotingCard';
import VotingControls from '@/components/Voting/VotingControls';
import HookAiCivicLogo from '@/components/ui/HookAiCivicLogo';

const WALKTHROUGH_FOCUS_CAPTIONS: Partial<Record<IntroOverlayStepId, string>> = {
  abstimmen: 'Echte Abstimmungs-Ansicht wie in der App',
  wahlen: 'Wahlen · gleiche Daten wie unter „Wahlen“',
  meldungen: 'Meldungen · gleicher Ablauf wie in der App',
  praemien: 'Prämien / Überblick · wie in der App',
  politikbarometer: 'Politikbarometer · Regler wie in der App (50 % Demo)',
};

const WALKTHROUGH_STEP_SUBTITLE: Partial<Record<IntroOverlayStepId, string>> = {
  // UX/Legal positioning: makes it unmistakable this is a preview, not “I’m voting here”.
  wahlen: 'Wahlvorschau: Kandidierende, Programme und verifizierte Quellen.',
};

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
  /** iPhone-Demo: weniger Innenabstand, Vorschau nutzt die volle Gerätefläche. */
  fillDeviceFrame?: boolean;
};

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

function IntroAbstimmenWalkthroughDemo({
  du,
  onDone,
}: {
  du: boolean;
  onDone: () => void;
}) {
  const { dispatch } = useApp();
  const card = useMemo(() => {
    const list = VOTING_DATA.kirkel?.cards ?? [];
    const base = list.find((c) => c.id === 'kirkel-5') ?? list[0];
    return base;
  }, []);

  const [phase, setPhase] = useState<'idle' | 'highlight' | 'pressed' | 'reward'>('idle');
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    setPhase('idle');
    const t0 = window.setTimeout(() => setPhase('highlight'), 800);
    const t1 = window.setTimeout(() => setPhase('pressed'), 1120);
    const t2 = window.setTimeout(() => {
      // Simulated vote action (no persistence beyond in-memory demo state)
      dispatch({
        type: 'HANDLE_VOTE',
        payload: {
          voteType: 'for' as VoteType,
          card,
          points: card?.points ?? 0,
          earnedPoints: DEMO_POINTS_PER_ABSTIMMUNG,
        },
      });
      setPhase('reward');
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
      // clear vote result after short delay (like app demo)
      window.setTimeout(() => dispatch({ type: 'SET_VOTE_RESULT', payload: null }), 2200);
    }, 1340);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [dispatch, card, onDone]);

  return (
    <div className="relative w-full min-w-0">
      <div className="mx-auto w-full max-w-[420px] space-y-2">
        <div className="rounded-2xl border border-[#D6E0EE] bg-white px-3 py-2 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[#4F6F96]">Abstimmen</div>
          <div className="mt-0.5 text-[13px] font-bold leading-snug text-[#1A2B45]">
            {card?.title ?? 'Digitales Bürgerportal in Kirkel ausbauen'}
          </div>
          <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-neutral-600">
            {(card as any)?.description ?? 'Entscheidungsvorlage mit kurzer Einordnung.'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-2.5 py-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">Pro</div>
            <ul className="mt-1.5 space-y-1 text-[10.5px] leading-snug text-emerald-900">
              <li>Schnellere Verwaltungsprozesse</li>
              <li>Einfacherer Zugang für Bürger</li>
            </ul>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-2.5 py-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-rose-800">Contra</div>
            <ul className="mt-1.5 space-y-1 text-[10.5px] leading-snug text-rose-900">
              <li>Datenschutz muss klar geregelt sein</li>
              <li>Digitale Teilhabe braucht Alternativen</li>
            </ul>
          </div>
        </div>

        <div className="relative">
          <VotingControls
            canVote
            du={du}
            compact
            introWalkthrough
            scriptedIntroPhase={phase}
            onVote={() => {
              // no-op: walkthrough runs scripted animation
            }}
          />
        </div>
      </div>

      {phase === 'reward' ? (
        <div className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2">
          <div className="intro-reward-float inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[12px] font-bold text-emerald-900 shadow-md">
            +{DEMO_POINTS_PER_ABSTIMMUNG} Punkte
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IntroWahlenWalkthroughDemo() {
  const btw = useMemo(() => WAHLEN_DATA.find((w) => w.id === 'btw25'), []);
  const merz = useMemo(
    () => btw?.kandidaten?.find((k) => /Friedrich\s+Merz/i.test(k.name)) ?? btw?.kandidaten?.[0],
    [btw],
  );
  const cdu = useMemo(
    () => btw?.parteien?.find((p) => /CDU/i.test(p.name)) ?? btw?.parteien?.[0],
    [btw],
  );
  const erst = useMemo(() => btw?.kandidaten?.slice(0, 5) ?? [], [btw]);
  const zweit = useMemo(() => btw?.parteien?.slice(0, 6) ?? [], [btw]);

  const [phase, setPhase] = useState<'idle' | 'focus' | 'tick' | 'program' | 'source'>('idle');
  const sourcePrimaryUrl = 'https://www.cdu.de/wahlprogramm-von-cdu-und-csu/';
  const sourcePdfUrl =
    'https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf';

  useEffect(() => {
    setPhase('idle');
    const t0 = window.setTimeout(() => setPhase('focus'), 650);
    const t1 = window.setTimeout(() => setPhase('tick'), 980);
    const t2 = window.setTimeout(() => setPhase('program'), 1380);
    const t3 = window.setTimeout(() => setPhase('source'), 1700);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  if (!btw) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
        Bundestagswahl 2025 (btw25) nicht gefunden.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="rounded-2xl border border-[#D6E0EE] bg-white shadow-sm">
        <div className="border-b border-[#E6EDF7] px-4 pb-2 pt-3">
          <div className="text-[11px] font-bold tracking-tight text-[#003366]">Wahlen</div>
          <div className="mt-0.5 text-[12px] font-bold text-[#1A2B45]">{btw.name}</div>
          <div className="mt-0.5 text-[10px] font-medium text-neutral-500">
            Vorschau · {btw.datum} · {btw.wahlkreis}
          </div>
        </div>

        <div className="px-4 pb-3 pt-3">
          <div className="overflow-hidden rounded-lg border border-neutral-800/40 bg-[#FFF4A8] px-2 pb-1.5 pt-1.5 shadow-sm">
            <p className="text-[7px] font-bold tracking-[0.12em] text-neutral-900">STIMMZETTEL</p>
            <p className="mt-0.5 text-[7.5px] font-bold leading-tight text-neutral-900">{btw.name}</p>
            <p className="text-[6px] font-semibold leading-snug text-neutral-800">
              {btw.datum} · {btw.wahlkreis}
            </p>
            <div className="mt-1.5 border-t border-black/25 pt-1">
              <p className="text-[6px] font-bold uppercase tracking-wide text-neutral-800">Erststimme · Bewerber</p>
              <div className="mt-1 space-y-0.5">
                {erst.map((k) => {
                  const isMerz = /Friedrich\s+Merz/i.test(k.name);
                  return (
                    <div
                      key={`${k.partei}-${k.name}`}
                      className="relative flex min-h-[22px] items-center gap-1.5 rounded border border-black/30 bg-[#FFEB8A] px-1 py-0.5"
                    >
                      <span
                        className={
                          'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border-2 bg-white ' +
                          (isMerz && phase === 'tick' ? 'border-neutral-900 text-neutral-900' : 'border-neutral-900/65 text-transparent')
                        }
                        aria-hidden
                      >
                        ✗
                      </span>
                      <div className="min-w-0 flex-1 leading-tight">
                        <span className="text-[7px] font-bold text-neutral-900">{k.partei}</span>
                        <span className="text-[6.5px] font-semibold text-neutral-800"> — {k.name}</span>
                      </div>
                      {isMerz && phase === 'focus' ? (
                        <span className="pointer-events-none absolute -inset-[1px] rounded-md ring-2 ring-emerald-500/35" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-1.5 border-t border-black/20 pt-1">
              <p className="text-[6px] font-bold uppercase tracking-wide text-neutral-800">Zweitstimme · Partei (Auszug)</p>
              <div className="mt-1 space-y-0.5">
                {zweit.map((p) => (
                  <div
                    key={p.name}
                    className="flex min-h-[20px] items-center gap-1.5 rounded border border-black/25 bg-[#FFEB8A] px-1 py-0.5"
                  >
                    <span
                      className="flex h-3.5 w-3.5 shrink-0 rounded-sm border-2 border-neutral-900/70 bg-white"
                      aria-hidden
                    />
                    <span className="text-[6.5px] font-semibold leading-tight text-neutral-900">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <a
            href={sourcePrimaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              'mt-3 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-[max-height,opacity,transform] duration-500 ease-out ' +
              (phase === 'program' ? 'max-h-[240px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1')
            }
          >
            <div className="px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                Programmauszug · {cdu?.name ?? 'CDU/CSU'}
              </div>
              <div className="mt-1 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">
                Verifizierte Quelle · CDU/CSU
              </div>
              <div className="mt-1 text-[11px] leading-snug text-slate-800 [text-wrap:pretty]">
                {(cdu as any)?.programm ?? 'Programmauszug ist in der Demo hinterlegt.'}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span
                  className={
                    'inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold text-[#003366] ' +
                    (phase === 'source'
                      ? 'border-[#7AA4D8] bg-[#EAF3FF] shadow-[0_0_0_2px_rgba(59,130,246,0.22)]'
                      : 'border-slate-200 bg-white')
                  }
                >
                  Offizielle Quelle öffnen
                </span>
                <a
                  href={sourcePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  PDF (Langfassung)
                </a>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

/** Gleiche Sektionen wie unter der Tab-Leiste — kein separates Mini-Layout. */
function WalkthroughRealSectionEmbed({
  stepId,
  du,
  calendarPriorities,
  onAbstimmenDone,
}: {
  stepId: IntroOverlayStepId;
  du: boolean;
  calendarPriorities: UserPreferences | undefined;
  onAbstimmenDone: () => void;
}) {
  switch (stepId) {
    case 'abstimmen':
      return <IntroAbstimmenWalkthroughDemo du={du} onDone={onAbstimmenDone} />;
    case 'wahlen':
      return <IntroWahlenWalkthroughDemo />;
    case 'kalender':
      return <CalendarSection priorities={calendarPriorities} />;
    case 'meldungen':
      return (
        <MeldungenSection
          embeddedInWalkthrough
          walkthroughDemo={{
            enabled: true,
            descriptionText: 'Auf dem Spielplatz gibt es Ratten.',
            addressText: 'Am Marktplatz 3. 66459 Kirkel',
            imageUrl: '/demo-rat-playground.jpg',
            onSequenceDone: onAbstimmenDone,
          }}
        />
      );
    case 'praemien':
      return <LeaderboardSection />;
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
      return <LiveSection />;
  }
}

export default function DemoIntroWalkthrough({
  du: _du,
  residenceLocation,
  onClose,
  onFinish,
  onBackFromFirstStep,
  onWalkthroughStepChange,
  startStepId = 'abstimmen',
  fillDeviceFrame = false,
}: Props) {
  const { dispatch, state } = useApp();
  const du = _du;
  const [showDemoTooltip, setShowDemoTooltip] = useState(false);
  const [nextPulse, setNextPulse] = useState(false);
  const demoTooltipTimerRef = useRef<number | null>(null);
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
    const subtitle = WALKTHROUGH_STEP_SUBTITLE[step.id as IntroOverlayStepId];
    const calendarPriorities = state.consentClaraPersonalization ? state.preferences : undefined;
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        {caption ? (
          <div className="shrink-0 border-b border-slate-200/80 bg-slate-50/95 px-2 py-1 text-center text-[9px] font-semibold leading-snug text-slate-700">
            {caption}
          </div>
        ) : null}
        <div
          key={step.id}
          className={
            'walkthrough-real-embed min-h-0 flex-1 overflow-x-hidden ' +
            (step.id === 'meldungen' ? 'overflow-y-hidden ' : 'overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] ') +
            (fillDeviceFrame ? 'px-0 pt-0' : 'px-3 pt-2')
          }
          onPointerDown={() => {
            // Subtle safety net: signal demo mode after any interaction.
            setShowDemoTooltip(true);
            if (demoTooltipTimerRef.current) window.clearTimeout(demoTooltipTimerRef.current);
            demoTooltipTimerRef.current = window.setTimeout(() => setShowDemoTooltip(false), 2200);
          }}
        >
          {subtitle ? (
            <div className="mb-2 flex justify-center">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                {subtitle}
              </div>
            </div>
          ) : null}
          <WalkthroughRealSectionEmbed
            stepId={step.id as IntroOverlayStepId}
            du={du}
            calendarPriorities={calendarPriorities}
            onAbstimmenDone={() => setNextPulse(true)}
          />
        </div>
      </div>
    );
  }, [step.id, du, fillDeviceFrame, state.consentClaraPersonalization, state.preferences]);

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

  useEffect(() => {
    return () => {
      if (demoTooltipTimerRef.current) window.clearTimeout(demoTooltipTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    document.querySelectorAll<HTMLElement>('.intro-walkthrough-scroll').forEach((el) => {
      el.scrollTop = 0;
    });
  }, [idx, step.id]);

  useEffect(() => {
    // Reset “Weiter”-pulse whenever the step changes.
    setNextPulse(false);
  }, [step.id]);

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

      <div
        className={`intro-walkthrough-shell flex min-h-0 flex-1 flex-col overflow-hidden ${
          fillDeviceFrame
            ? 'intro-walkthrough--fill-frame px-0 pb-0 pt-0'
            : 'px-2 pb-2 pt-1.5 sm:px-2.5 sm:pb-2.5 sm:pt-2'
        }`}
      >
        <div
          className={
            fillDeviceFrame
              ? 'intro-walkthrough-device flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white'
              : 'intro-walkthrough-device intro-device-chrome-shell intro-dark-body flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.85rem] p-[3px] sm:p-1'
          }
        >
          <div
            className={
              fillDeviceFrame
                ? 'intro-walkthrough-inner flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white'
                : 'intro-walkthrough-inner flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.65rem] border border-neutral-200/95 bg-white'
            }
          >
          <IntroMetaStrip
            surface="light"
            stepNumber={null}
            showClaraVoice
            onSkip={skipIntroOrBackToEid}
            onClose={exitIntroOrBackToEid}
            closeAriaLabel={idx === 0 ? 'Zurück zur eID-Demo' : undefined}
          />

          <div
            className={
              fillDeviceFrame
                ? 'shrink-0 px-2 pb-0.5 pt-0.5 text-left sm:px-2.5'
                : 'shrink-0 px-4 pb-1.5 pt-1 text-left sm:px-4'
            }
          >
            <div className="mb-0.5 flex justify-start">
              <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold tracking-tight text-violet-950">
                Vorschau – Demo-Modus
              </span>
            </div>
            <div className="flex items-center justify-start gap-2">
              <HookAiCivicLogo variant="light" alt={APP_DISPLAY_NAME} className="h-5 w-auto max-w-[130px]" />
              <span className="text-[11px] font-semibold tracking-tight text-[#003366]">HookAI Civic Demo</span>
            </div>
            <span className="text-[10px] font-medium leading-snug text-neutral-500">{APP_TAGLINE}</span>
          </div>

          <div
            className={
              'intro-walkthrough-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden ' +
              (step.id === 'meldungen' ? 'overflow-y-hidden' : 'overflow-y-auto')
            }
          >
            <div className="intro-walkthrough-focus-stage min-h-0 min-w-0 flex-1">
              <div className="intro-walkthrough-focus-card">
                <div
                  className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
                  aria-hidden
                >
                  <span
                    className="absolute left-1/2 top-1/2 block w-[120%] select-none text-center text-[clamp(2rem,11vw,3.25rem)] font-bold uppercase leading-none tracking-[0.22em] text-[#0f172a]/[0.09]"
                    style={{ transform: 'translate(-50%, -50%) rotate(-14deg)' }}
                  >
                    HookAI Demo
                  </span>
                </div>
                <div
                  className={
                    fillDeviceFrame
                      ? 'relative z-[1] flex min-h-0 flex-1 flex-col'
                      : 'relative z-[1] flex min-h-0 flex-col'
                  }
                >
                <div
                  className={
                    fillDeviceFrame
                      ? 'shrink-0 border-b border-neutral-100/90 px-2.5 pb-1.5 pt-2 sm:px-3'
                      : 'shrink-0 border-b border-neutral-100/90 px-4 pb-2.5 pt-3 sm:px-4'
                  }
                >
                  <h2
                    className={
                      'font-bold leading-snug tracking-tight text-[#0f172a] ' +
                      (step.id === 'meldungen' ? 'text-[0.98rem] sm:text-[1rem]' : 'text-[1.0625rem] sm:text-lg')
                    }
                  >
                    {step.title}
                  </h2>
                  <p
                    className={
                      'font-medium leading-snug text-neutral-600 sm:text-[13px] ' +
                      (step.id === 'meldungen' ? 'mt-1 line-clamp-1 text-[11px]' : 'mt-1.5 line-clamp-2 text-[12px]')
                    }
                  >
                    {clara.short}
                  </p>
                </div>
                <div
                  key={step.id}
                  className={
                    fillDeviceFrame
                      ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ' +
                        (step.id === 'meldungen' ? 'px-0.5 pb-0.5 pt-0.5 sm:px-1' : 'px-1 pb-1 pt-1 sm:px-1.5')
                      : 'flex min-h-0 min-w-0 flex-none flex-col overflow-hidden px-3 pb-2 pt-2 sm:px-4'
                  }
                >
                  {preview}
                </div>
                <div
                  className={
                    fillDeviceFrame
                      ? 'shrink-0 border-t border-neutral-100/90 px-2 pb-1.5 pt-1 sm:px-2.5 sm:pb-2 sm:pt-1.5'
                      : 'shrink-0 border-t border-neutral-100/90 px-3 pb-2 pt-1.5 sm:px-4 sm:pb-2 sm:pt-2'
                  }
                >
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
            {showDemoTooltip ? (
              <div className="pointer-events-none absolute left-1/2 top-0 z-[2] -translate-x-1/2 -translate-y-[58%]">
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-md">
                  Demo-Modus – keine Speicherung
                </div>
              </div>
            ) : null}
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
                (nextPulse && (step.id === 'abstimmen' || step.id === 'meldungen') && !isLast ? ' footer-heartbeat' : '') +
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
