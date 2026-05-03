'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Clock, ListChecks } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DEMO_LOCATION_LABEL } from '@/lib/locationLabels';
import { regionalPraemienForCity } from '@/data/demoVoting2026';
import { getLocalBenefitState } from '@/lib/localBenefits';

type StatusRow = {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
};

type LeaderboardSectionProps = {
  embeddedInWalkthrough?: boolean;
  /** Feuert, wenn die Prämien-Demo (Highlight → Gutschein → QR → Wallet-Vorschau) durchlaufen ist — für Walkthrough-Auto-Weiter. */
  onWalkthroughCinematicComplete?: () => void;
};

type PraemieBenefit = {
  id: string;
  name: string;
  points: number;
  emoji: string;
  description: string;
};

type VoucherSheetState = {
  benefit: PraemieBenefit;
  benefitIndex: number;
};

function formatMockVoucherCode(cityName: string, benefitId: string): string {
  const citySlug = cityName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase()
    .slice(0, 12) || 'KOMMUNE';
  const seed = benefitId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const suffix = String(1000 + (seed % 9000)).padStart(4, '0');
  return `HC-${citySlug}-2026-${suffix}`;
}

function providerAndLocation(name: string, description: string, cityName: string): { provider: string; location: string } {
  const parts = name.split(/\s*[–-]\s*/);
  const provider = parts[0]?.trim() || name;
  const rest = parts.slice(1).join(' · ').trim();
  const location = rest || description || cityName;
  return { provider, location };
}

/** Deterministic pseudo-QR grid (decorative only, no encoded payload). */
function QrStylePlaceholder({ seed, variant = 'sheet' }: { seed: string; variant?: 'sheet' | 'walkthroughThumb' }) {
  const n = variant === 'walkthroughThumb' ? 11 : 19;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 1_000_000;
  const cells = new Array<boolean>(n * n).fill(false);
  const paintFinder = (br: number, bc: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const i = (br + r) * n + (bc + c);
        if (i < 0 || i >= cells.length) continue;
        const outer = r === 0 || c === 0 || r === 6 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[i] = outer || inner;
      }
    }
  };
  paintFinder(0, 0);
  paintFinder(0, n - 7);
  paintFinder(n - 7, 0);
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) continue;
    const row = Math.floor(i / n);
    const col = i % n;
    if (row < 7 && col < 7) continue;
    if (row < 7 && col >= n - 7) continue;
    if (row >= n - 7 && col < 7) continue;
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    cells[i] = h % 3 === 0;
  }
  const sizeClass =
    variant === 'walkthroughThumb'
      ? 'mt-1 w-[4.5rem] max-w-[72px] border-neutral-200/90 shadow-sm'
      : 'mt-1.5 w-[min(13rem,min(72vw,220px))] max-w-[220px] border-neutral-300 shadow-md';
  return (
    <div
      className={`mx-auto grid aspect-square gap-px border bg-neutral-300 p-px ${sizeClass}`}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {cells.map((on, i) => (
        <div key={i} className={`aspect-square min-h-0 ${on ? 'bg-[#0f172a]' : 'bg-white'}`} />
      ))}
    </div>
  );
}

function rewardVisual(name: string): {
  label: string;
  className: string;
  imageSrc?: string;
  imageAlt?: string;
  db?: boolean;
  cinestar?: boolean;
} {
  const n = name.toLowerCase();
  if (n.includes('deutsche bahn')) {
    return { label: 'DB', className: 'border-red-200 bg-white text-red-700', db: true };
  }
  if (n.includes('cinestar')) {
    return { label: '', className: 'border-violet-200 bg-gradient-to-b from-violet-50 to-white text-violet-900', cinestar: true };
  }
  if (n.includes('kino')) {
    return { label: 'KINO', className: 'border-violet-100 bg-violet-50 text-violet-700' };
  }
  if (n.includes('museum')) {
    return {
      label: 'RM',
      className: 'border-amber-100 bg-amber-50 text-amber-800',
      imageSrc: '/praemien/saarlandmuseum-moderne-galerie.jpg',
      imageAlt: 'Innenraum Saarlandmuseum Moderne Galerie',
    };
  }
  if (n.includes('freibad') || n.includes('bad')) {
    return {
      label: 'NF',
      className: 'border-cyan-100 bg-cyan-50 text-cyan-800',
      imageSrc: '/praemien/naturfreibad-kirkel.jpg',
      imageAlt: 'Naturfreibad Kirkel',
    };
  }
  return { label: 'PR', className: 'border-slate-200 bg-slate-50 text-slate-700' };
}

type WalkthroughPraemienPhase =
  | 'idle'
  | 'highlight'
  | 'tap_card'
  | 'cta_pulse'
  | 'sheet'
  | 'wallet_emphasis'
  | 'wallet_preview'
  | 'done';

const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  embeddedInWalkthrough = false,
  onWalkthroughCinematicComplete,
}) => {
  const { state, dispatch } = useApp();
  const du = state.anrede === 'du';

  const submitted = Math.max(0, state.participationVoteCount + state.participationElectionCount);
  const inReview = submitted > 0 ? Math.max(1, Math.floor(submitted * 0.35)) : 0;
  const confirmed = submitted > 0 ? Math.max(0, submitted - inReview) : 0;
  const completed = state.participationElectionCount;
  const cityName = DEMO_LOCATION_LABEL[state.activeLocation] ?? 'Kommune';
  const benefits = useMemo(() => regionalPraemienForCity(cityName).slice(0, 4) as PraemieBenefit[], [cityName]);

  const [voucherSheet, setVoucherSheet] = useState<VoucherSheetState | null>(null);
  const [walletPerspektiveAck, setWalletPerspektiveAck] = useState(false);
  const [wtPhase, setWtPhase] = useState<WalkthroughPraemienPhase>('idle');
  const wtTimersRef = useRef<number[]>([]);
  const wtCancelledRef = useRef(false);

  const closeVoucherSheet = useCallback(() => {
    setWalletPerspektiveAck(false);
    setVoucherSheet(null);
  }, []);

  useEffect(() => {
    if (!voucherSheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeVoucherSheet();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [voucherSheet, closeVoucherSheet]);

  const rows = useMemo<StatusRow[]>(
    () => [
      {
        label: 'Eingereicht',
        value: submitted,
        hint: du ? 'Von dir ausgelöste Vorgänge' : 'Von Ihnen ausgelöste Vorgänge',
        icon: ListChecks,
      },
      {
        label: 'In Prüfung',
        value: inReview,
        hint: 'Status: fachliche Sichtung ausstehend',
        icon: Clock,
      },
      {
        label: 'Verfügbar',
        value: confirmed,
        hint: 'Eingang dokumentiert',
        icon: CheckCircle,
      },
      {
        label: 'Eingelöst',
        value: completed,
        hint: 'Vorgang abgeschlossen',
        icon: CheckCircle,
      },
    ],
    [completed, confirmed, du, inReview, submitted],
  );

  const compact = embeddedInWalkthrough;
  const voluntaryNote = du
    ? 'Du kannst diese Funktion jederzeit wieder deaktivieren. Deine konkrete Entscheidung wird nicht ausgewertet.'
    : 'Sie können diese Funktion jederzeit wieder deaktivieren. Ihre konkrete Entscheidung wird nicht ausgewertet.';
  const statusChips = [
    { label: 'Beteiligung abgeschlossen', value: completed > 0 ? 'Ja' : 'Noch offen' },
    ...rows.map((row) => ({ label: row.label, value: row.value.toLocaleString('de-DE') })),
  ];

  const showcaseIdx = useMemo(() => {
    const i = benefits.findIndex((b) => /naturfreibad|freibad/i.test(b.name));
    return i >= 0 ? i : 0;
  }, [benefits]);

  useEffect(() => {
    if (!embeddedInWalkthrough) {
      setWtPhase('idle');
      return;
    }
    setWtPhase('idle');
    setWalletPerspektiveAck(false);
    setVoucherSheet(null);
    wtCancelledRef.current = false;
    const push = (id: number) => {
      wtTimersRef.current.push(id);
    };
    const clearWt = () => {
      wtTimersRef.current.forEach((t) => window.clearTimeout(t));
      wtTimersRef.current = [];
    };

    push(
      window.setTimeout(() => {
        if (wtCancelledRef.current) return;
        dispatch({ type: 'SET_CONSENT_LOCAL_BENEFITS', payload: true });
      }, 350),
    );
    push(
      window.setTimeout(() => {
        if (wtCancelledRef.current) return;
        setWtPhase('highlight');
      }, 900),
    );
    push(
      window.setTimeout(() => {
        if (wtCancelledRef.current) return;
        setWtPhase('tap_card');
      }, 1500),
    );
    push(
      window.setTimeout(() => {
        if (wtCancelledRef.current) return;
        setWtPhase('cta_pulse');
      }, 2400),
    );
    push(
      window.setTimeout(() => {
        if (wtCancelledRef.current) return;
        const b = benefits[showcaseIdx];
        if (!b) return;
        setWalletPerspektiveAck(false);
        setVoucherSheet({ benefit: b, benefitIndex: showcaseIdx });
        setWtPhase('sheet');
      }, 3100),
    );
    push(
      window.setTimeout(() => {
        if (wtCancelledRef.current) return;
        setWtPhase('wallet_emphasis');
      }, 4600),
    );
    push(
      window.setTimeout(() => {
        if (wtCancelledRef.current) return;
        setWalletPerspektiveAck(true);
        setWtPhase('wallet_preview');
      }, 5800),
    );
    push(
      window.setTimeout(() => {
        if (wtCancelledRef.current) return;
        setWtPhase('done');
        onWalkthroughCinematicComplete?.();
      }, 8400),
    );

    return () => {
      wtCancelledRef.current = true;
      clearWt();
    };
  }, [embeddedInWalkthrough, benefits, showcaseIdx, dispatch, onWalkthroughCinematicComplete]);

  const sheetBenefit = voucherSheet?.benefit;
  const sheetIndex = voucherSheet?.benefitIndex ?? 0;
  const sheetLocalStateRaw = sheetBenefit
    ? getLocalBenefitState({
        consentLocalBenefits: state.consentLocalBenefits,
        completedParticipationCount: completed,
        benefitIndex: sheetIndex,
      })
    : null;
  const sheetLocalState =
    sheetBenefit && embeddedInWalkthrough && voucherSheet
      ? {
          consentRequired: false,
          eligibilityReason: 'Beteiligung abgeschlossen' as const,
          independentOfVoteChoice: true as const,
          status: 'available' as const,
        }
      : sheetLocalStateRaw;
  const sheetProvider = sheetBenefit ? providerAndLocation(sheetBenefit.name, sheetBenefit.description, cityName) : null;
  const sheetMockCode = sheetBenefit ? formatMockVoucherCode(cityName, sheetBenefit.id) : '';
  const sheetIsWalkNaturfreibadDemo =
    Boolean(embeddedInWalkthrough && sheetBenefit && /naturfreibad|freibad/i.test(sheetBenefit.name));

  return (
    <div className={compact ? 'relative isolate z-0 space-y-2 pb-3' : 'space-y-3 pb-28'}>
      <div className={compact ? '' : 'card-content py-1.5'}>
        <div
          className={`rounded-xl border border-neutral-100 bg-white ${compact ? 'px-2 py-1.5' : 'px-2.5 py-2'}`}
        >
          <p className={`font-bold text-[#1A2B45] ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
            Prämien freiwillig anzeigen
          </p>
          <label className="mt-1 flex items-start gap-2 text-[11px] text-neutral-800">
            <input
              type="checkbox"
              checked={state.consentLocalBenefits}
              onChange={(e) => {
                dispatch({ type: 'SET_CONSENT_LOCAL_BENEFITS', payload: e.target.checked });
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-[#003366]"
              aria-label="Prämien anzeigen"
            />
            <span>Ich möchte verfügbare Prämien sehen.</span>
          </label>
          <p className={`mt-1 leading-snug text-neutral-500 ${compact ? 'text-[9.5px]' : 'text-[10px]'}`}>
            {voluntaryNote}
          </p>
        </div>
      </div>

      <div className={compact ? 'space-y-2' : 'card-content space-y-2.5'}>
          {benefits.map((b, idx) => {
            const rawBenefit = getLocalBenefitState({
              consentLocalBenefits: state.consentLocalBenefits,
              completedParticipationCount: completed,
              benefitIndex: idx,
            });
            const localBenefit =
              embeddedInWalkthrough && idx === showcaseIdx && state.consentLocalBenefits
                ? { ...rawBenefit, consentRequired: false, status: 'available' as const }
                : rawBenefit;
            const visual = rewardVisual(b.name);
            const openSheet = () => {
              if (embeddedInWalkthrough) return;
              setWalletPerspektiveAck(false);
              setVoucherSheet({ benefit: b, benefitIndex: idx });
            };
            const showcaseHighlight =
              embeddedInWalkthrough &&
              idx === showcaseIdx &&
              (wtPhase === 'highlight' || wtPhase === 'tap_card' || wtPhase === 'cta_pulse');
            const ctaPulse = embeddedInWalkthrough && idx === showcaseIdx && wtPhase === 'cta_pulse';
            const tapFinger = embeddedInWalkthrough && idx === showcaseIdx && wtPhase === 'tap_card';
            return (
              <button
                key={b.id}
                type="button"
                onClick={openSheet}
                className={`relative w-full rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition select-none ${
                  embeddedInWalkthrough
                    ? 'pointer-events-none cursor-default'
                    : 'cursor-pointer hover:border-[#0055A4]/30 hover:shadow-md active:scale-[0.997] active:border-[#0055A4]/40'
                } ${compact ? 'px-2 py-2' : 'px-3 py-3'} ${
                  showcaseHighlight ? 'intro-wt-card-focus z-[1] ring-1 ring-sky-400/45' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border font-black ${visual.className} ${
                      compact ? 'h-16 w-[5.25rem]' : 'h-[5.25rem] w-[6rem]'
                    }`}
                    aria-hidden
                  >
                    {visual.imageSrc ? (
                      <img src={visual.imageSrc} alt={visual.imageAlt ?? ''} className="h-full w-full object-cover" />
                    ) : visual.cinestar ? (
                      <div className="flex flex-col items-center justify-center gap-0.5 px-1.5 text-center leading-tight">
                        <span className={`font-black uppercase tracking-wide text-violet-950 ${compact ? 'text-[11px]' : 'text-[12px]'}`}>
                          CineStar
                        </span>
                        <span className={`font-bold text-violet-800 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>Saarbrücken</span>
                        <span className={`mt-0.5 font-semibold text-violet-700/90 ${compact ? 'text-[7.5px]' : 'text-[8px]'}`}>Kinogutschein</span>
                      </div>
                    ) : (
                      <span
                        className={
                          visual.db
                            ? compact
                              ? 'text-[34px] leading-none tracking-tight'
                              : 'text-[44px] leading-none tracking-tight'
                            : visual.label === 'KINO'
                              ? compact
                                ? 'px-0.5 text-center text-[10px] leading-tight tracking-tight'
                                : 'px-0.5 text-center text-[11px] leading-tight tracking-tight'
                              : compact
                                ? 'text-[16px] leading-none'
                                : 'text-[18px] leading-none'
                        }
                      >
                        {visual.label}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`line-clamp-2 min-h-[2.5rem] font-semibold leading-snug text-neutral-900 ${
                        compact ? 'text-[11.5px]' : 'text-[12.5px]'
                      }`}
                    >
                      {b.name}
                    </p>
                    <p className={`mt-0.5 text-neutral-600 ${compact ? 'line-clamp-2 text-[9.5px]' : 'line-clamp-2 text-[10px]'}`}>
                      {b.description}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-neutral-300 bg-[#F8FAFC] px-1.5 py-0.5 text-[9.5px] font-semibold text-neutral-700">
                        {localBenefit.consentRequired
                          ? 'Einwilligung erforderlich'
                          : localBenefit.status === 'disabled'
                            ? 'Beteiligung abgeschlossen'
                            : localBenefit.status === 'available'
                              ? 'Verfügbar'
                              : 'Eingelöst'}
                      </span>
                      {typeof b.points === 'number' ? (
                        <span className="rounded-full border border-sky-100 bg-sky-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#0055A4]">
                          {b.points.toLocaleString('de-DE')} Punkte
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div
                  className={`mt-2.5 border-t border-neutral-100 pt-2.5 text-center text-[11px] font-semibold text-[#003B73] ${compact ? 'text-[10.5px]' : ''} ${
                    ctaPulse ? 'intro-wt-cta-autotap' : ''
                  }`}
                >
                  {localBenefit.consentRequired ? 'Details anzeigen' : 'Gutschein anzeigen'}
                </div>
                {tapFinger ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-[2] flex items-end justify-center pb-8"
                    aria-hidden
                  >
                    <div className="intro-wt-finger-dot flex h-11 w-11 items-center justify-center rounded-full border-2 border-sky-500/95 bg-white/95 shadow-[0_6px_20px_rgba(15,23,42,0.18)]">
                      <span className="block h-3 w-3 rounded-full bg-sky-500 shadow-inner" />
                    </div>
                  </div>
                ) : null}
              </button>
            );
          })}
      </div>

      <div className={`flex flex-wrap gap-1 ${compact ? 'pt-0.5' : 'pt-1'}`}>
        {statusChips.map((chip) => (
          <span
            key={chip.label}
            className="rounded-full border border-neutral-200/60 bg-neutral-50/80 px-1.5 py-0.5 text-[8px] font-normal text-neutral-400 sm:text-[8.5px]"
          >
            {chip.label}: {chip.value}
          </span>
        ))}
      </div>

      {!compact ? (
        <div className="rounded-lg border border-neutral-200/90 bg-neutral-50/80 px-2.5 py-1.5 text-[9px] leading-snug text-neutral-600">
          Hinweis · Statusansicht zur Nachvollziehbarkeit, keine rechtlich wirksame Bearbeitung.
        </div>
      ) : null}

      {voucherSheet && sheetBenefit && sheetLocalState && sheetProvider ? (
        <div
          className={
            (embeddedInWalkthrough ? 'absolute' : 'fixed') +
            ' inset-0 z-[820] flex items-end justify-center p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 sm:items-center sm:p-4'
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="voucher-sheet-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Schließen"
            onClick={closeVoucherSheet}
          />
          <div
            className={
              'relative z-[1] flex max-h-[min(92dvh,calc(100dvh-4.5rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl ' +
              (embeddedInWalkthrough ? 'intro-wt-sheet-panel' : '')
            }
          >
            <div className="shrink-0 px-3 pb-2 pt-3">
              <h2 id="voucher-sheet-title" className="text-[14px] font-bold leading-snug text-[#1A2B45]">
                {sheetBenefit.name}
              </h2>
              <p className="mt-0.5 text-[10px] font-medium text-neutral-700">{sheetProvider.provider}</p>
              <p className="mt-0.5 text-[9.5px] leading-snug text-neutral-600">{sheetProvider.location}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded-full border border-sky-100 bg-sky-50 px-1.5 py-0.5 text-[9px] font-semibold text-[#0055A4]">
                  {sheetBenefit.points.toLocaleString('de-DE')} Punkte
                </span>
                <span className="rounded-full border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-700">
                  {sheetLocalState.consentRequired
                    ? 'Einwilligung erforderlich'
                    : sheetLocalState.status === 'available'
                      ? 'Verfügbar'
                      : sheetLocalState.status === 'claimed'
                        ? 'Eingelöst'
                        : 'Beteiligung abgeschlossen'}
                </span>
              </div>
              {sheetLocalState.consentRequired ? (
                <p className="mt-1.5 rounded-md border border-amber-100 bg-amber-50/90 px-2 py-1 text-[8.5px] leading-snug text-amber-950">
                  Nach Einwilligung hier sichtbar. Keine Abstimmungsdetails an Partner.
                </p>
              ) : null}
              {sheetIsWalkNaturfreibadDemo ? (
                <div className="mt-2.5 overflow-hidden rounded-xl border border-cyan-100/90 bg-gradient-to-b from-cyan-50/80 to-white">
                  <p className="border-b border-cyan-100/80 bg-white/90 px-2 py-1 text-center text-[8px] font-semibold uppercase tracking-wide text-cyan-950">
                    So in der App (Beispiel · Naturfreibad)
                  </p>
                  <div className="flex max-h-[min(28vh,200px)] min-h-[120px]">
                    <img
                      src="/praemien/naturfreibad-kirkel.jpg"
                      alt="Naturfreibad Kirkel – Beispielmotiv wie in der Prämienkarte"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <p className="px-2 py-1.5 text-center text-[9px] font-medium leading-snug text-neutral-800">
                    {du
                      ? 'Nach Beteiligung erscheint der Gutschein — hier mit QR-Code zum Vorzeigen am Einlass.'
                      : 'Nach Beteiligung erscheint der Gutschein — hier mit QR-Code zum Vorzeigen am Einlass.'}
                  </p>
                </div>
              ) : null}
              <div className="mt-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-2 py-2">
                <p className="text-center text-[8.5px] font-semibold uppercase tracking-wide text-neutral-600">
                  QR-Code Vorschau
                </p>
                <QrStylePlaceholder seed={sheetBenefit.id + sheetMockCode} variant="sheet" />
                <p className="mt-1.5 break-all text-center font-mono text-[12px] font-bold leading-tight tracking-tight text-[#0f172a]">
                  {sheetMockCode}
                </p>
                <p className="mt-0.5 text-center text-[7.5px] font-medium text-neutral-500">Sicherer Gutschein-Code</p>
              </div>
              <p className="mt-2 text-[9px] font-medium text-neutral-800">Gültig bis: 30.09.2026</p>
              <p className="mt-0.5 text-[9px] text-neutral-600">Einlösbar vor Ort per QR-Code</p>
              {!embeddedInWalkthrough ? (
                <p className="mt-1 text-[8.5px] font-medium text-neutral-600">QR-Code in der App. Wallet perspektivisch.</p>
              ) : null}
            </div>
            {embeddedInWalkthrough ? (
              <div className="shrink-0 border-t border-neutral-100/80 px-3 py-1.5">
                <p className="text-[9px] font-semibold leading-snug text-[#1A2B45]">Prämien belohnen Beteiligung, nicht Meinung.</p>
                <p className="mt-0.5 text-[8.5px] leading-snug text-neutral-600">
                  {du
                    ? 'Partner sehen nur die Gültigkeit — nicht dein Abstimmungsverhalten.'
                    : 'Partner sehen nur die Gültigkeit — nicht Ihr Abstimmungsverhalten.'}
                </p>
              </div>
            ) : (
              <div className="max-h-[5.25rem] shrink-0 overflow-y-auto overscroll-contain border-t border-neutral-100/80 px-3 py-1.5">
                <p className="text-[9px] font-semibold leading-snug text-[#1A2B45]">Prämien belohnen Beteiligung, nicht Meinung.</p>
                <p className="mt-0.5 text-[8.5px] leading-snug text-neutral-600">
                  {du
                    ? 'Partner sehen nur, ob ein Gutschein gültig ist – nicht, wie du abgestimmt hast.'
                    : 'Partner sehen nur, ob ein Gutschein gültig ist – nicht, wie Sie abgestimmt haben.'}
                </p>
              </div>
            )}
            <div className="shrink-0 border-t border-neutral-200 bg-[#FAFBFC] px-3 py-2.5">
              {walletPerspektiveAck && embeddedInWalkthrough ? (
                <div
                  className="mb-2 overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-b from-neutral-900 to-neutral-800 px-3 py-2.5 text-white shadow-inner"
                  aria-hidden
                >
                  <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-white/65">Apple Wallet · Vorschau</p>
                  <p className="mt-1 text-[12px] font-bold leading-tight">Zum Wallet hinzugefügt (Vorschau)</p>
                  <p className="mt-0.5 text-[9px] font-medium text-white/85">{sheetBenefit.name}</p>
                  <p className="mt-1 text-[8px] text-white/65">Nur Demonstration — kein echter Pass.</p>
                </div>
              ) : walletPerspektiveAck ? (
                <p className="mb-2 rounded-md bg-white/80 px-2 py-1.5 text-center text-[8.5px] leading-snug text-neutral-700">
                  Wallet-Funktion perspektivisch verfügbar. Der Gutschein bleibt aktuell als QR-Code in der App sichtbar.
                </p>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                <button
                  type="button"
                  onClick={() => setWalletPerspektiveAck(true)}
                  className={
                    'w-full rounded-xl border border-[#0055A4]/35 bg-[#F0F6FC] px-3 py-2 text-[11px] font-semibold text-[#003B73] shadow-sm hover:bg-[#E4EEF8] sm:flex-1 ' +
                    (embeddedInWalkthrough && wtPhase === 'wallet_emphasis' ? 'intro-wt-wallet-emphasis' : '')
                  }
                >
                  In Wallet speichern
                </button>
                <button
                  type="button"
                  onClick={closeVoucherSheet}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 sm:flex-1"
                >
                  Schließen
                </button>
              </div>
              <p className="mt-1.5 text-center text-[7.5px] text-neutral-500">Wallet-Funktion perspektivisch verfügbar</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LeaderboardSection;
