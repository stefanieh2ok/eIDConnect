'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useClaraVoiceContext } from '@/components/Clara/ClaraVoiceContext';
import { useIntroIsSpeaking, useIntroSpeakApi } from '@/components/Intro/IntroOverlay';
import { activeLocationForLevel } from '@/lib/activeLocationForLevel';
import {
  INTRO_OUTRO_DROPDOWN_DU,
  INTRO_OUTRO_DROPDOWN_SIE,
  INTRO_OUTRO_LABEL,
  INTRO_OUTRO_SHORT_DU,
  INTRO_OUTRO_SHORT_SIE,
  introOverlayFramingLine,
  INTRO_OVERLAY_STEPS,
} from '@/data/introOverlayMarketing';
import type { IntroOverlayStepId } from '@/data/introOverlayMarketing';
import {
  machineContinueLabel,
  machineNarrationPlain,
  machineShort,
  machineSpeakParts,
  machineStepId,
  machineTitle,
  overlayIndexForMachineIndex,
  WALKTHROUGH_MACHINE_STEPS,
} from '@/lib/walkthroughOrchestration';
import { claraAudioDebugEnabled, claraAudioDevLog, claraAudioPreview } from '@/lib/claraAudioDevLog';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { ClaraStepPanel } from '@/components/Intro/ClaraStepPanel';
import PolitikBarometerPanel from '@/components/Intro/PolitikBarometerPanel';
import LiveSection from '@/components/Live/LiveSection';
import LeaderboardSection from '@/components/Leaderboard/LeaderboardSection';
import ElectionsSection from '@/components/Elections/ElectionsSection';
import CalendarSection from '@/components/Calendar/CalendarSection';
import MeldungenSection from '@/components/Meldungen/MeldungenSection';
import type { Location, Section, UserPreferences, VoteType } from '@/types';
import { DEMO_POINTS_PER_ABSTIMMUNG, VOTING_DATA, WAHLEN_DATA } from '@/data/constants';
import VotingCard from '@/components/Voting/VotingCard';
import VotingControls from '@/components/Voting/VotingControls';

const WALKTHROUGH_FOCUS_CAPTIONS: Partial<Record<IntroOverlayStepId, string>> = {
  abstimmen: 'Echte Abstimmungs-Ansicht wie in der App',
  wahlen: 'Wahlen · gleiche Daten wie unter „Wahlen“',
  meldungen: 'Meldungen · gleicher Ablauf wie in der App',
  praemien: 'Prämien · Kurz-Demo: Karte → Gutschein → QR → Wallet',
  politikbarometer: 'Politikbarometer · Regler wie in der App (Beispielwert 50 %)',
};

const WALKTHROUGH_STEP_SUBTITLE: Partial<Record<IntroOverlayStepId, string>> = {
  // UX/Legal positioning: makes it unmistakable this is a preview, not “I’m voting here”.
  wahlen: 'Wahlvorschau: Kandidierende, Programme und verifizierte Quellen.',
  praemien: 'Freiwillig · nur mit Einwilligung · lokaler Partnervorteil als Beispiel.',
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
  /** Optional: Einstieg in der State-Machine (0 = Auth). Standard 0. */
  startMachineIndex?: number;
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
  const { dispatch, state } = useApp();
  const card = useMemo(() => {
    const list = VOTING_DATA.kirkel?.cards ?? [];
    const base = list.find((c) => c.id === 'kirkel-5') ?? list[0];
    return base;
  }, []);

  const [phase, setPhase] = useState<'idle' | 'highlight' | 'pressed' | 'reward'>('idle');
  const doneRef = useRef(false);
  /** Vermeidet Effect-Neustart wenn nach dem Demo-Vote `canVote` umspringt (sonst bricht die Animation ab). */
  const canVoteRef = useRef(state.canVote);
  canVoteRef.current = state.canVote;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    doneRef.current = false;
    setPhase('idle');
    const t0 = window.setTimeout(() => setPhase('highlight'), 600);
    const t1 = window.setTimeout(() => setPhase('pressed'), 1100);
    const t2 = window.setTimeout(() => {
      // Simulated vote action (no persistence beyond in-memory demo state)
      const restoreCanVote = !canVoteRef.current;
      if (restoreCanVote) {
        dispatch({ type: 'SET_CAN_VOTE', payload: true });
      }
      dispatch({
        type: 'HANDLE_VOTE',
        payload: {
          voteType: 'for' as VoteType,
          card,
          points: card?.points ?? 0,
          earnedPoints: DEMO_POINTS_PER_ABSTIMMUNG,
        },
      });
      dispatch({ type: 'SET_VOTE_RESULT', payload: null });
      if (restoreCanVote) {
        dispatch({ type: 'SET_CAN_VOTE', payload: false });
      }
      setPhase('reward');
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current();
      }
    }, 1400);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [dispatch, card]);

  return (
    <div className="relative w-full min-w-0">
      <div className="mx-auto w-full max-w-[420px] space-y-2">
        {card ? (
          <VotingCard
            card={card as any}
            introCompact
            introProConExpanded
          />
        ) : null}

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
        <div className="pointer-events-none absolute left-1/2 top-[42%] z-20 -translate-x-1/2">
          <div className="intro-reward-float inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[12px] font-bold text-emerald-900 shadow-[0_10px_28px_rgba(16,185,129,0.32)]">
            +{DEMO_POINTS_PER_ABSTIMMUNG} Punkte
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IntroWahlenWalkthroughDemo({ onDone }: { onDone: () => void }) {
  const btw = useMemo(() => WAHLEN_DATA.find((w) => w.id === 'btw25'), []);
  const cdu = useMemo(
    () => btw?.parteien?.find((p) => /CDU/i.test(p.name)) ?? btw?.parteien?.[0],
    [btw],
  );
  const erst = useMemo(() => btw?.kandidaten?.slice(0, 5) ?? [], [btw]);
  const zweit = useMemo(() => btw?.parteien?.slice(0, 6) ?? [], [btw]);

  const [phase, setPhase] = useState<'idle' | 'focus' | 'tick' | 'program' | 'source'>('idle');
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const sourcePrimaryUrl = 'https://www.cdu.de/wahlprogramm-von-cdu-und-csu/';
  const sourcePdfUrl =
    'https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf';

  /** Cross-Zeichnung 480 ms, danach Pause, dann Programm, dann Quellen-Hervorhebung, dann visual-ready. */
  const CROSS_ANIM_MS = 480;
  const PAUSE_AFTER_CROSS_MS = 200;
  const PAUSE_BEFORE_SOURCE_MS = 420;
  const HOLD_SOURCE_MS = 400;

  useEffect(() => {
    doneRef.current = false;
    setPhase('idle');
    const t0 = window.setTimeout(() => setPhase('focus'), 380);
    const t1 = window.setTimeout(() => setPhase('tick'), 820);
    const tProgram = 820 + CROSS_ANIM_MS + PAUSE_AFTER_CROSS_MS;
    const t2 = window.setTimeout(() => setPhase('program'), tProgram);
    const t3 = window.setTimeout(() => setPhase('source'), tProgram + PAUSE_BEFORE_SOURCE_MS);
    const t4 = window.setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDoneRef.current();
    }, tProgram + PAUSE_BEFORE_SOURCE_MS + HOLD_SOURCE_MS);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
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
    <div className="mx-auto w-full max-w-full min-w-0">
      <div className="rounded-xl border border-[#D6E0EE] bg-white shadow-sm sm:rounded-2xl">
        <div className="border-b border-[#E6EDF7] px-3 pb-1.5 pt-2 sm:px-3.5 sm:pt-2.5">
          <div className="text-[12px] font-bold tracking-tight text-[#003366]">Wahlen</div>
          <div className="mt-0.5 text-[13px] font-bold leading-snug text-[#1A2B45] sm:text-[14px]">{btw.name}</div>
          <div className="mt-0.5 text-[11px] font-medium leading-snug text-neutral-600">
            Vorschau · {btw.datum} · {btw.wahlkreis}
          </div>
        </div>

        <div className="px-2.5 pb-2 pt-2 sm:px-3 sm:pb-2.5 sm:pt-2.5">
          <div className="rounded-lg border border-neutral-800/45 bg-[#FFF4A8] px-2 py-2 shadow-sm sm:px-2.5 sm:py-2.5">
            <p className="text-[9px] font-bold tracking-[0.1em] text-neutral-900 sm:text-[10px]">STIMMZETTEL</p>
            <p className="mt-0.5 text-[11px] font-bold leading-tight text-neutral-900 sm:text-[12px]">{btw.name}</p>
            <p className="text-[9px] font-semibold leading-snug text-neutral-800 sm:text-[10px]">
              {btw.datum} · {btw.wahlkreis}
            </p>
            <div className="mt-2 border-t border-black/25 pt-1.5">
              <p className="text-[9px] font-bold uppercase tracking-wide text-neutral-800 sm:text-[10px]">
                Erststimme · Bewerber
              </p>
              <div className="mt-1.5 space-y-1">
                {erst.map((k) => {
                  const isMerz = /Friedrich\s+Merz/i.test(k.name);
                  const showMerzMark = isMerz && (phase === 'tick' || phase === 'program' || phase === 'source');
                  return (
                    <div
                      key={`${k.partei}-${k.name}`}
                      className={
                        'relative flex min-h-[30px] items-center gap-2 rounded border border-black/35 bg-[#FFEB8A] px-1.5 py-1 sm:min-h-[32px] ' +
                        (isMerz && (phase === 'focus' || phase === 'tick')
                          ? 'ring-2 ring-[#003366]/30 intro-login-heartbeat'
                          : '')
                      }
                    >
                      <span
                        className={
                          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm border-2 bg-white sm:h-5 sm:w-5 ' +
                          (isMerz ? 'border-neutral-900' : 'border-neutral-900/70')
                        }
                        aria-hidden
                      >
                        {showMerzMark ? (
                          <span
                            key="merz-stimme-mark"
                            className="intro-wahlen-mark-draw text-[13px] font-black leading-none text-[#003366] sm:text-[14px]"
                          >
                            ✗
                          </span>
                        ) : null}
                      </span>
                      <div className="min-w-0 flex-1 leading-snug">
                        <span className="text-[10px] font-bold text-neutral-900 sm:text-[11px]">{k.partei}</span>
                        <span className="text-[9.5px] font-semibold text-neutral-800 sm:text-[10.5px]"> — {k.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 border-t border-black/20 pt-1.5">
              <p className="text-[9px] font-bold uppercase tracking-wide text-neutral-800 sm:text-[10px]">
                Zweitstimme · Partei (Auszug)
              </p>
              <div className="mt-1.5 space-y-1">
                {zweit.map((p) => (
                  <div
                    key={p.name}
                    className="flex min-h-[28px] items-center gap-2 rounded border border-black/28 bg-[#FFEB8A] px-1.5 py-1 sm:min-h-[30px]"
                  >
                    <span
                      className="flex h-[16px] w-[16px] shrink-0 rounded-sm border-2 border-neutral-900/70 bg-white sm:h-[18px] sm:w-[18px]"
                      aria-hidden
                    />
                    <span className="text-[9.5px] font-semibold leading-snug text-neutral-900 sm:text-[10.5px]">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <a
            href={sourcePrimaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            className={
              'pointer-events-none mt-2.5 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-[max-height,opacity,transform] duration-500 ease-out sm:mt-3 ' +
              (phase === 'program' || phase === 'source'
                ? 'max-h-[280px] opacity-100 translate-y-0'
                : 'max-h-0 opacity-0 -translate-y-1')
            }
          >
            <div className="px-2.5 py-2 sm:px-3 sm:py-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:text-[12px]">
                Programmauszug · {cdu?.name ?? 'CDU/CSU'}
              </div>
              <div className="mt-1.5 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                Verifizierte Quelle · CDU/CSU
              </div>
              <div className="mt-1.5 text-[12px] leading-snug text-slate-800 [text-wrap:pretty] sm:text-[13px]">
                {(cdu as any)?.programm ?? 'Programmauszug ist in der Vorschau hinterlegt.'}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span
                  className={
                    'inline-flex scale-100 items-center rounded-md border px-2 py-1.5 text-[11px] font-semibold text-[#003366] transition-[box-shadow,transform,background-color,border-color] duration-300 sm:py-2 sm:text-[12px] ' +
                    (phase === 'source'
                      ? 'footer-heartbeat scale-[1.02] border-[#2563eb] bg-[#E8F1FF] shadow-[0_0_0_3px_rgba(37,99,235,0.22)]'
                      : 'border-slate-200 bg-white')
                  }
                >
                  Offizielle Quelle öffnen
                </span>
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-600 sm:text-[11px]">
                  PDF (Langfassung)
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Auth-Schritt im Walkthrough: Clara-Bubble + funktionale Tabs (eID / EU Wallet)
 * + immer sichtbare Demo-Box. Der Schritt bleibt kompakt — kein eigener
 * Inner-Scroll, keine künstlichen Spacer.
 */
function WalkthroughAuthContent({ du }: { du: boolean }) {
  const [activeTab, setActiveTab] = useState<'eid' | 'wallet'>('eid');
  /** In-Tab-Vorschau (per Tab) — schaltet einen kleinen Info-Block innerhalb des AKTIVEN Tabs ein. */
  const [eidPreviewOpen, setEidPreviewOpen] = useState(false);
  const [walletPreviewOpen, setWalletPreviewOpen] = useState(false);

  const claraText = machineNarrationPlain(0, du);

  const tabBtnBase =
    'inline-flex min-h-[40px] flex-1 items-center justify-center rounded-md px-3 text-[12.5px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7AA4D8]';
  const tabBtnActive = 'bg-[#003D80] text-white shadow-sm';
  const tabBtnInactive = 'bg-transparent text-slate-500 hover:text-[#003D80]';

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-2.5 px-3 pb-2 pt-1.5 sm:gap-3 sm:px-4 sm:pt-2">
      <ClaraStepPanel
        surface="light"
        label="Zugang zur Demo"
        short={claraText}
        long=""
        showTopicTitle={false}
      />

      <div
        role="tablist"
        aria-label="Zugangsperspektiven"
        className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"
      >
        <button
          id="walkthrough-auth-tab-eid"
          type="button"
          role="tab"
          aria-selected={activeTab === 'eid'}
          aria-controls="walkthrough-auth-tabpanel-eid"
          tabIndex={activeTab === 'eid' ? 0 : -1}
          onClick={() => setActiveTab('eid')}
          className={`${tabBtnBase} ${activeTab === 'eid' ? tabBtnActive : tabBtnInactive}`}
        >
          eID
        </button>
        <button
          id="walkthrough-auth-tab-wallet"
          type="button"
          role="tab"
          aria-selected={activeTab === 'wallet'}
          aria-controls="walkthrough-auth-tabpanel-wallet"
          tabIndex={activeTab === 'wallet' ? 0 : -1}
          onClick={() => setActiveTab('wallet')}
          className={`${tabBtnBase} ${activeTab === 'wallet' ? tabBtnActive : tabBtnInactive}`}
        >
          EU Wallet
        </button>
      </div>

      {activeTab === 'eid' ? (
        <div
          id="walkthrough-auth-tabpanel-eid"
          role="tabpanel"
          aria-labelledby="walkthrough-auth-tab-eid"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
        >
          <h3 className="text-[13px] font-bold leading-snug text-[#1A2B45]">Mit eID anmelden</h3>
          <p className="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
            Perspektive · heute als Vorschau
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-neutral-700 [text-wrap:pretty]">
            In der Demo wird der sichere Zugang beispielhaft über die Online-Ausweisfunktion erklärt. Eine echte Identifikation findet hier noch nicht statt.
          </p>
          <button
            type="button"
            aria-expanded={eidPreviewOpen}
            aria-controls="walkthrough-auth-eid-preview"
            onClick={() => setEidPreviewOpen((open) => !open)}
            className="mt-2.5 inline-flex min-h-[40px] w-full items-center justify-center rounded-lg border border-[#CFE0F7] bg-white px-3 text-[11.5px] font-semibold text-[#1F4F8A] shadow-sm transition hover:bg-[#F4F8FE] active:scale-[0.99]"
          >
            {eidPreviewOpen ? 'eID-Vorschau einklappen' : 'eID-Perspektive ansehen'}
          </button>
          {eidPreviewOpen ? (
            <div
              id="walkthrough-auth-eid-preview"
              className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10.5px] leading-relaxed text-emerald-900"
            >
              <p className="font-semibold">eID-Perspektive · Vorschau</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>Online-Ausweisfunktion mit PIN</li>
                <li>Berechtigung und Zuständigkeit prüfen</li>
                <li>Datensparsam · nur das Nötige freigeben</li>
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          id="walkthrough-auth-tabpanel-wallet"
          role="tabpanel"
          aria-labelledby="walkthrough-auth-tab-wallet"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
        >
          <h3 className="text-[13px] font-bold leading-snug text-[#1A2B45]">EU Digital Identity Wallet</h3>
          <p className="mt-1 inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#003366]">
            Konzept · künftige Integration
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-neutral-700 [text-wrap:pretty]">
            Die EU Digital Identity Wallet kann künftig als zusätzlicher Zugang dienen – zum Beispiel für Identität, Nachweise oder Berechtigungen.
          </p>
          <button
            type="button"
            aria-expanded={walletPreviewOpen}
            aria-controls="walkthrough-auth-wallet-preview"
            onClick={() => setWalletPreviewOpen((open) => !open)}
            className="mt-2.5 inline-flex min-h-[40px] w-full items-center justify-center rounded-lg border border-[#CFE0F7] bg-white px-3 text-[11.5px] font-semibold text-[#1F4F8A] shadow-sm transition hover:bg-[#F4F8FE] active:scale-[0.99]"
          >
            {walletPreviewOpen ? 'Wallet-Vorschau einklappen' : 'Wallet-Perspektive ansehen'}
          </button>
          {walletPreviewOpen ? (
            <div
              id="walkthrough-auth-wallet-preview"
              className="mt-2 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-2 text-[10.5px] leading-relaxed text-[#0F2A4A]"
            >
              <p className="font-semibold">Wallet-Perspektive · Konzept</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>Identität & Nachweise im Smartphone</li>
                <li>Selektive Freigabe einzelner Attribute</li>
                <li>EU-weit anschlussfähig (EUDI Wallet)</li>
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <div className="rounded-lg border border-[#CFE0F7] bg-[#F4F8FE] px-2.5 py-2 shadow-sm sm:px-3 sm:py-2.5">
        <h3 className="text-[11.5px] font-bold leading-snug text-[#1A2B45] sm:text-[12px]">
          Demo ohne echte Identifikation
        </h3>
        <p className="mt-0.5 text-[10.5px] leading-snug text-neutral-700 [text-wrap:pretty] sm:mt-1 sm:text-[11px] sm:leading-relaxed">
          Für die Präsentation nutzen wir eine Beispielidentität und Beispieldaten — Start über „Weiter“ unten.
        </p>
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
  onPolitikbarometerVisualDone,
  onPraemienCinematicComplete,
}: {
  stepId: IntroOverlayStepId;
  du: boolean;
  calendarPriorities: UserPreferences | undefined;
  onAbstimmenDone: () => void;
  onPolitikbarometerVisualDone: () => void;
  onPraemienCinematicComplete: () => void;
}) {
  switch (stepId) {
    case 'abstimmen':
      return <IntroAbstimmenWalkthroughDemo du={du} onDone={onAbstimmenDone} />;
    case 'wahlen':
      return <IntroWahlenWalkthroughDemo onDone={onAbstimmenDone} />;
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
      return (
        <LeaderboardSection
          embeddedInWalkthrough
          onWalkthroughCinematicComplete={onPraemienCinematicComplete}
        />
      );
    case 'politikbarometer':
      return (
        <PolitikBarometerPanel
          du={du}
          variant="compact"
          density="tight"
          leadDu=""
          leadSie=""
          heroPreview
          onHeroPreviewVisualDone={onPolitikbarometerVisualDone}
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
  startMachineIndex: startMachineIndexProp = 0,
  fillDeviceFrame = false,
}: Props) {
  const { dispatch, state } = useApp();
  const du = _du;
  const [showDemoTooltip, setShowDemoTooltip] = useState(false);
  const [nextPulse, setNextPulse] = useState(false);
  const [continuePulse, setContinuePulse] = useState(false);
  const [praemienCinematicDone, setPraemienCinematicDone] = useState(false);
  const [claraReadyToContinue, setClaraReadyToContinue] = useState(false);
  const demoTooltipTimerRef = useRef<number | null>(null);
  const overlaySteps = INTRO_OVERLAY_STEPS;
  const machineCount = WALKTHROUGH_MACHINE_STEPS.length;
  const initialMachine = useMemo(() => {
    const n = Math.max(0, Math.min(machineCount - 1, Math.floor(startMachineIndexProp)));
    return n;
  }, [startMachineIndexProp, machineCount]);
  const [machineIndex, setMachineIndex] = useState(initialMachine);
  useEffect(() => {
    setMachineIndex(initialMachine);
  }, [initialMachine]);

  const overlayIdx = overlayIndexForMachineIndex(machineIndex);
  const overlayStepId = overlayIdx !== null ? overlaySteps[overlayIdx]!.id : null;
  const machineId = machineStepId(machineIndex);
  const isLast = machineIndex >= machineCount - 1;

  const framingLine =
    overlayStepId != null ? introOverlayFramingLine(overlayStepId, du) : '';

  const speakParts = useMemo(() => machineSpeakParts(machineIndex, du), [machineIndex, du]);

  const speakApi = useIntroSpeakApi();
  const { tryResumePendingAudioFromUserGesture } = useClaraVoiceContext();
  const isIntroSpeaking = useIntroIsSpeaking();
  const onPolitikbarometerVisualDone = useCallback(() => {
    setNextPulse(true);
  }, []);

  const onPraemienCinematicComplete = useCallback(() => {
    setPraemienCinematicDone(true);
  }, []);

  /**
   * Gemeinsame "Weiter"-Logik: Pulse leeren, nächsten Schritt auslösen.
   * `stopIntroSpeech` hier weglassen (außer letzter Schritt): sonst wird
   * `playRequestId` im selben Tap vor `tryResume`/`pending` erhöht — iOS
   * Pending-TTS wird verworfen (`requestId mismatch`).
   */
  const advanceWalkthrough = useCallback(() => {
    speechCancelledRef.current = true;
    setContinuePulse(false);
    if (pulseTimerRef.current != null) {
      window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
    if (isLast) {
      speakApi?.stopIntroSpeech();
      onFinish();
    } else {
      setMachineIndex((p) => Math.min(machineCount - 1, p + 1));
    }
  }, [speakApi, isLast, onFinish, machineCount]);

  const prevMachineRef = useRef(machineIndex);
  useEffect(() => {
    if (prevMachineRef.current !== machineIndex) {
      prevMachineRef.current = machineIndex;
      if (machineStepId(machineIndex) === 'praemien') setPraemienCinematicDone(false);
    }
  }, [machineIndex]);

  const preview = useMemo(() => {
    const mid = machineStepId(machineIndex);
    if (mid === 'auth') {
      return <WalkthroughAuthContent du={du} />;
    }
    if (mid === 'outro') {
      return (
        <div className="mx-auto w-full max-w-md px-1 pb-0 pt-0">
          <div className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/80 to-white px-3 py-2.5 shadow-sm">
            <p className="text-[11px] leading-snug text-neutral-800">
              {du
                ? 'Du hast die wichtigsten Bereiche gesehen: Abstimmen, Wahlen, Kalender, Meldungen und Prämien.'
                : 'Sie haben die wichtigsten Bereiche gesehen: Abstimmen, Wahlen, Kalender, Meldungen und Prämien.'}
            </p>
          </div>
        </div>
      );
    }
    if (!overlayStepId) return null;
    const caption = WALKTHROUGH_FOCUS_CAPTIONS[overlayStepId];
    const subtitle = WALKTHROUGH_STEP_SUBTITLE[overlayStepId];
    const calendarPriorities = state.consentClaraPersonalization ? state.preferences : undefined;
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        {caption ? (
          <div className="shrink-0 border-b border-slate-200/80 bg-slate-50/95 px-2 py-1 text-center text-[9px] font-semibold leading-snug text-slate-700">
            {caption}
          </div>
        ) : null}
        <div
          key={overlayStepId}
          className={
            'walkthrough-real-embed min-h-0 flex-1 overflow-x-hidden ' +
            (overlayStepId === 'meldungen' ? 'overflow-y-hidden ' : 'overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] ') +
            (fillDeviceFrame ? 'px-0 pt-0' : 'px-3 pt-2')
          }
          onPointerDown={() => {
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
            stepId={overlayStepId}
            du={du}
            calendarPriorities={calendarPriorities}
            onAbstimmenDone={() => setNextPulse(true)}
            onPolitikbarometerVisualDone={onPolitikbarometerVisualDone}
            onPraemienCinematicComplete={onPraemienCinematicComplete}
          />
        </div>
      </div>
    );
  }, [
    machineIndex,
    du,
    fillDeviceFrame,
    overlayStepId,
    state.consentClaraPersonalization,
    state.preferences,
    onPolitikbarometerVisualDone,
    onPraemienCinematicComplete,
  ]);

  const primaryLong = useMemo(() => machineNarrationPlain(machineIndex, du), [machineIndex, du]);

  const speechStepKeyRef = useRef<string>('');
  const speechStartedRef = useRef(false);
  const speechCancelledRef = useRef(false);
  const pulseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const section = overlayStepId ? walkthroughSectionForStep(overlayStepId) : 'live';
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
    if (section === 'meldungen') {
      dispatch({
        type: 'SET_ACTIVE_LOCATION',
        payload: activeLocationForLevel(residenceLocation, 'kommune'),
      });
    }
  }, [overlayStepId, dispatch, residenceLocation]);

  useEffect(() => {
    return () => {
      if (demoTooltipTimerRef.current) window.clearTimeout(demoTooltipTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    document.querySelectorAll<HTMLElement>('.intro-walkthrough-scroll').forEach((el) => {
      el.scrollTop = 0;
    });
  }, [machineIndex, overlayStepId]);

  useLayoutEffect(() => {
    setNextPulse(false);
    setContinuePulse(false);
    if (machineId === 'auth' || machineId === 'outro' || overlayStepId === 'kalender') {
      setNextPulse(true);
    }
    if (pulseTimerRef.current != null) {
      window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = null;
    }
  }, [machineId, overlayStepId]);

  useEffect(() => {
    const gated: IntroOverlayStepId[] = ['abstimmen', 'meldungen', 'wahlen', 'politikbarometer'];
    if (!overlayStepId || !gated.includes(overlayStepId)) return;
    const t = window.setTimeout(() => setNextPulse(true), 4500);
    return () => window.clearTimeout(t);
  }, [overlayStepId, machineIndex]);

  useEffect(() => {
    onWalkthroughStepChange?.({ id: machineId, label: machineTitle(machineIndex) });
  }, [machineIndex, machineId, onWalkthroughStepChange]);

  useEffect(() => {
    setClaraReadyToContinue(false);
    if (!speakApi?.readAloud) {
      const t = window.setTimeout(() => setClaraReadyToContinue(true), 160);
      return () => window.clearTimeout(t);
    }
    /**
     * Sicherheits-Fallback: Wenn TTS innerhalb von 1.5 s nicht angefangen hat
     * (z. B. Backend langsam, iOS Audio-Gate noch nicht freigegeben), aktiviert
     * sich „Weiter" trotzdem — der Nutzer wird nie >1,5 s blockiert.
     */
    const fail = window.setTimeout(() => setClaraReadyToContinue(true), 1500);
    return () => window.clearTimeout(fail);
  }, [machineIndex, speakApi?.readAloud]);

  useEffect(() => {
    if (speakApi?.readAloud && isIntroSpeaking) setClaraReadyToContinue(true);
  }, [isIntroSpeaking, speakApi?.readAloud]);

  /**
   * DEV-only Step-Timing: misst Step-Wechsel → sichtbarer Clara-Text →
   * `isSpeaking` (TTS-Pipeline beginnt, inkl. Fetch) → hörbare Wiedergabe
   * (`playing` auf dem Audio-Element, siehe `useClaraVoice`).
   * Wird im Production-Build vollständig wegoptimiert (process.env-Guard).
   */
  const stepTimingRef = useRef<{
    stepId: string;
    startedAt: number;
    pipelineLogged: boolean;
    audibleLogged: boolean;
  }>({ stepId: '', startedAt: 0, pipelineLogged: false, audibleLogged: false });

  useLayoutEffect(() => {
    if (!claraAudioDebugEnabled()) return;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    stepTimingRef.current = {
      stepId: machineId,
      startedAt: now,
      pipelineLogged: false,
      audibleLogged: false,
    };
    // eslint-disable-next-line no-console
    console.log(`[WalkthroughTiming] step=${machineId} stepChanged=0ms`);
    /* Clara-Text liegt mit dem Commit im DOM — auf das nächste Paint warten. */
    let raf = 0;
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      raf = window.requestAnimationFrame(() => {
        const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - now;
        // eslint-disable-next-line no-console
        console.log(
          `[WalkthroughTiming] step=${machineId} claraTextVisibleAfter=${Math.round(elapsed)}ms`,
        );
      });
    }
    return () => {
      if (raf && typeof window !== 'undefined') window.cancelAnimationFrame(raf);
    };
  }, [machineIndex, machineId]);

  /** `isSpeaking` springt in `playTts` direkt nach `stopSpeaking` an — noch vor `fetch`/`play()`. */
  useEffect(() => {
    if (!claraAudioDebugEnabled()) return;
    if (!isIntroSpeaking) return;
    const t = stepTimingRef.current;
    if (t.stepId !== machineId || t.pipelineLogged || t.startedAt <= 0) return;
    t.pipelineLogged = true;
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t.startedAt;
    // eslint-disable-next-line no-console
    console.log(
      `[WalkthroughTiming] step=${machineId} claraTtsPipelineStartedAfter=${Math.round(elapsed)}ms`,
    );
  }, [isIntroSpeaking, machineId]);

  /** Hörbare Ausgabe: `playing` auf dem Audio-Element (siehe `useClaraVoice.attachClaraAudibleDevLog`). */
  useEffect(() => {
    if (!claraAudioDebugEnabled()) return;
    const onAudible = (e: Event) => {
      const ce = e as CustomEvent<{ at?: number }>;
      const at = ce.detail?.at;
      if (typeof at !== 'number') return;
      const t = stepTimingRef.current;
      if (t.startedAt <= 0 || t.audibleLogged) return;
      t.audibleLogged = true;
      const elapsed = at - t.startedAt;
      // eslint-disable-next-line no-console
      console.log(
        `[WalkthroughTiming] step=${t.stepId} claraAudiblePlaybackAfter=${Math.round(elapsed)}ms`,
      );
    };
    window.addEventListener('eidconnect:clara-audible-start', onAudible as EventListener);
    return () => window.removeEventListener('eidconnect:clara-audible-start', onAudible as EventListener);
  }, []);

  useEffect(() => {
    if (!speakApi) return;
    const joinedPreview = speakParts.join('\n\n');
    claraAudioDevLog('step entered=', machineId);
    claraAudioDevLog('step speakParts=', speakParts.length, 'text preview=', claraAudioPreview(joinedPreview));
    claraAudioDevLog('readAloud=', speakApi.readAloud);
    if (!speakApi.readAloud) {
      claraAudioDevLog('walkthrough speech skipped: readAloud false');
      speechStepKeyRef.current = '';
      speechStartedRef.current = false;
      speechCancelledRef.current = true;
      setContinuePulse(false);
      if (pulseTimerRef.current != null) {
        window.clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
      return;
    }
    const speechKey = `walkthrough-m${machineIndex}-${machineId}`;
    speechStepKeyRef.current = speechKey;
    speechStartedRef.current = false;
    speechCancelledRef.current = false;
    speakApi.stopIntroSpeech();
    /**
     * Klein gehaltenes Delay (≤ 100 ms) — nur damit der Stop der vorherigen
     * Wiedergabe sicher gelandet ist, bevor wir das nächste Segment anstoßen.
     * Liegt deutlich unter dem 300-ms-Budget für sichtbaren Clara-Text und ist
     * weit unter dem 1500-ms-Budget für Audio-Start.
     */
    const t = window.setTimeout(() => {
      speechStartedRef.current = true;
      claraAudioDevLog('speakIntroParts scheduled for', machineId, 'key=', speechKey);
      speakApi.speakIntroParts(speakParts, speechKey);
    }, 80);
    return () => {
      window.clearTimeout(t);
      if (pulseTimerRef.current != null) {
        window.clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
      speakApi.stopIntroSpeech();
    };
  }, [speakApi, speakApi?.readAloud, machineIndex, machineId, speakParts]);

  useEffect(() => {
    if (!speakApi?.readAloud) return;
    const activeSpeechKey = `walkthrough-m${machineIndex}-${machineId}`;
    if (speechStepKeyRef.current !== activeSpeechKey) return;
    if (isIntroSpeaking) {
      speechStartedRef.current = true;
      return;
    }
    if (!speechStartedRef.current) return;
    if (speechCancelledRef.current) return;
    const needsEmbedPulse =
      !!overlayStepId &&
      (['abstimmen', 'meldungen', 'wahlen', 'politikbarometer'] as string[]).includes(overlayStepId);
    if (needsEmbedPulse && !nextPulse) return;
    if (machineId === 'praemien' && !praemienCinematicDone) return;

    pulseTimerRef.current = window.setTimeout(() => {
      pulseTimerRef.current = null;
      if (speechCancelledRef.current) return;
      if (!speakApi?.readAloud) return;
      setContinuePulse(true);
      window.setTimeout(() => setContinuePulse(false), 900);
    }, 200);

    return () => {
      if (pulseTimerRef.current != null) {
        window.clearTimeout(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, [
    isIntroSpeaking,
    machineIndex,
    machineId,
    overlayStepId,
    nextPulse,
    praemienCinematicDone,
    speakApi?.readAloud,
  ]);

  const needsEmbedPulse =
    !!overlayStepId &&
    (['abstimmen', 'meldungen', 'wahlen', 'politikbarometer'] as string[]).includes(overlayStepId);
  const weiterDisabled =
    !claraReadyToContinue ||
    (needsEmbedPulse && !nextPulse) ||
    (machineId === 'praemien' && !praemienCinematicDone);

  const liveAnnouncement =
    `Bereich ${machineTitle(machineIndex)}. ${machineShort(machineIndex, du)} ${framingLine}`.trim();

  const exitIntroOrBackToEid = machineIndex === 0 ? (onBackFromFirstStep ?? onClose) : onClose;
  const skipIntroOrBackToEid = machineIndex === 0 ? (onBackFromFirstStep ?? onFinish) : onFinish;

  return (
    <div
      className="relative z-10 flex min-h-0 h-full w-full max-w-[100%] min-w-0 flex-col overflow-hidden bg-[#020712] font-sans antialiased [font-synthesis:none]"
      role="dialog"
      aria-modal="true"
      aria-label="Einführung"
      onPointerDownCapture={() => {
        tryResumePendingAudioFromUserGesture();
      }}
      onTouchStartCapture={() => {
        tryResumePendingAudioFromUserGesture();
      }}
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
            inlinePad="card"
            toolbarDensity="compact"
            onSkip={skipIntroOrBackToEid}
            onClose={exitIntroOrBackToEid}
            closeAriaLabel={machineIndex === 0 ? 'Zurück zur eID-Vorschau' : undefined}
          />

          <div
            className={
              'intro-walkthrough-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden ' +
              (machineId === 'meldungen' ? 'overflow-y-hidden' : 'overflow-y-auto')
            }
          >
            <div className="intro-walkthrough-focus-stage min-h-0 min-w-0 flex-1">
              <div className="intro-walkthrough-focus-card">
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
                      (machineId === 'meldungen' ? 'text-[0.98rem] sm:text-[1rem]' : 'text-[1.0625rem] sm:text-lg')
                    }
                  >
                    {machineTitle(machineIndex)}
                  </h2>
                  {machineId !== 'auth' && machineId !== 'outro' ? (
                    <p
                      className={
                        'font-medium leading-snug text-neutral-600 sm:text-[13px] ' +
                        (machineId === 'meldungen' ? 'mt-1 line-clamp-1 text-[11px]' : 'mt-1.5 line-clamp-2 text-[12px]')
                      }
                    >
                      {machineShort(machineIndex, du)}
                    </p>
                  ) : null}
                </div>
                <div
                  key={`${machineIndex}-${overlayStepId ?? machineId}`}
                  className={
                    fillDeviceFrame
                      ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ' +
                        (machineId === 'meldungen' ? 'px-0.5 pb-0.5 pt-0.5 sm:px-1' : 'px-1 pb-1 pt-1 sm:px-1.5')
                      : 'flex min-h-0 min-w-0 flex-none flex-col overflow-hidden px-3 pb-2 pt-2 sm:px-4'
                  }
                >
                  {preview}
                </div>
                {machineId !== 'auth' ? (
                  <div
                    className={
                      fillDeviceFrame
                        ? 'shrink-0 border-t border-neutral-100/90 px-2 pb-1.5 pt-1 sm:px-2.5 sm:pb-2 sm:pt-1.5'
                        : 'shrink-0 border-t border-neutral-100/90 px-3 pb-2 pt-1.5 sm:px-4 sm:pb-2 sm:pt-2'
                    }
                  >
                    <WalkthroughInfoDetails
                      surface="light"
                      primaryLong={primaryLong}
                      showOutro={false}
                      outroShort={du ? INTRO_OUTRO_SHORT_DU : INTRO_OUTRO_SHORT_SIE}
                      outroLong={du ? INTRO_OUTRO_DROPDOWN_DU : INTRO_OUTRO_DROPDOWN_SIE}
                    />
                  </div>
                ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="intro-walkthrough-cta relative mt-auto flex flex-shrink-0 flex-col gap-2 border-t border-neutral-200/95 bg-white px-4 pt-2.5 intro-action-bar-pad sm:px-4">
            {showDemoTooltip ? (
              <div className="pointer-events-none absolute left-1/2 top-0 z-[2] -translate-x-1/2 -translate-y-[58%]">
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-md">
                  Vorschau – keine Speicherung
                </div>
              </div>
            ) : null}
            <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                speechCancelledRef.current = true;
                setContinuePulse(false);
                if (pulseTimerRef.current != null) {
                  window.clearTimeout(pulseTimerRef.current);
                  pulseTimerRef.current = null;
                }
                if (machineIndex === 0) {
                  speakApi?.stopIntroSpeech();
                  if (onBackFromFirstStep) onBackFromFirstStep();
                  return;
                }
                setMachineIndex((p) => Math.max(0, p - 1));
              }}
              className="btn-ghost t-button inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center px-3"
            >
              Zurück
            </button>
            <button
              type="button"
              disabled={weiterDisabled}
              onClick={advanceWalkthrough}
              className={
                'btn-primary t-button min-h-[44px] min-w-0 flex-1 text-[15px] font-bold ' +
                (continuePulse ? ' footer-heartbeat' : '') +
                (isLast ? 'whitespace-nowrap' : '') +
                (weiterDisabled ? ' opacity-45 pointer-events-none' : '')
              }
            >
              {machineContinueLabel(machineIndex)}
            </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
