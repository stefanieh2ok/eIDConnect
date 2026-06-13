'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink as ExternalLinkIcon,
  ChevronDown,
} from 'lucide-react';
import { useExternalLink } from '@/components/ExternalLink';
import { matchLeistungen } from '@/lib/fuerMichMatch';
import {
  canOpenExternal,
  getAgeGuidanceNotice,
  sourceStatusLabel,
  sourceStatusNotice,
  type KirkelService,
  type KirkelServiceBadge,
  type ResolverResult,
  type SourceStatus,
} from '@/lib/kirkelServiceResolver';
import {
  buildFuerMichClaraPrompt,
  isSensitiveLifeEvent,
} from '@/lib/fuerMichClaraPrompt';
import FuerMichDocumentPrep from '@/components/FuerMich/FuerMichDocumentPrep';
import FuerMichTerminweg from '@/components/FuerMich/FuerMichTerminweg';
import CivicDocumentPacket from '@/components/FuerMich/CivicDocumentPacket';
import type { FuerMichProfileState, LifeEventId } from '@/types/fuerMich';
import {
  evidenceListStatusTone,
  sourceStatusTone,
  statusPillClass,
} from '@/lib/civicStatus';

type FuerMichResultsProps = {
  du: boolean;
  resolved: ResolverResult;
  lifeEvents: LifeEventId[];
  profile: FuerMichProfileState;
  selectedLifeEventLabel?: string | null;
  onChangeSituation?: () => void;
};

const FOOTER_TEXT_SIE =
  'Diese Übersicht informiert über mögliche Themen. Sie ist keine Prüfung Ihres individuellen Anspruchs. Verbindlich entscheidet die zuständige Stelle.';
const FOOTER_TEXT_DU =
  'Diese Übersicht informiert über mögliche Themen. Sie ist keine Prüfung deines individuellen Anspruchs. Verbindlich entscheidet die zuständige Stelle.';

const NACHWEISE_VISIBLE = 8;

const STEPS_DU = ['Thema prüfen', 'Unterlagen vorbereiten', 'Terminweg klären', 'Übergabe prüfen'] as const;
const STEPS_SIE = ['Thema prüfen', 'Unterlagen vorbereiten', 'Terminweg klären', 'Übergabe prüfen'] as const;

const EVIDENCE_STATUS_LABELS = ['vorbereiten', 'Hinweis', 'optional'] as const;

const BADGE_STYLES: Record<KirkelServiceBadge, { label: string; cls: string }> = {
  wichtig: { label: 'Wichtig', cls: 'border-[#9DBDE6] bg-[#EAF2FB] text-[#003366]' },
  nachweis: { label: 'Unterlagen', cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  optional: { label: 'Optional', cls: 'border-[#D6E0EE] bg-[#F7F9FC] text-[#334155]' },
  beratung: { label: 'Beratung', cls: 'border-[#BBE7E0] bg-[#ECFEFC] text-[#0F766E]' },
};

function Badge({ badge }: { badge?: KirkelServiceBadge }) {
  if (!badge) return null;
  const style = BADGE_STYLES[badge];
  if (!style) return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${style.cls}`}
    >
      {style.label}
    </span>
  );
}

function evidenceStatusLabel(index: number): string {
  return EVIDENCE_STATUS_LABELS[index % EVIDENCE_STATUS_LABELS.length];
}

function UnterlagenRow({ index, title, status }: { index: number; title: string; status: string }) {
  const tone = evidenceListStatusTone(status);
  return (
    <li className="flex items-start gap-2 border-b border-[#E8EEF5] py-2 last:border-b-0">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#003366] text-[10px] font-bold text-white">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12px] font-semibold leading-snug text-[#1A2B45]">{title}</p>
          <span className={statusPillClass(tone)}>{status}</span>
        </div>
      </div>
    </li>
  );
}

export default function FuerMichResults({
  du,
  resolved,
  lifeEvents,
  profile,
  selectedLifeEventLabel,
  onChangeSituation,
}: FuerMichResultsProps) {
  const externalLink = useExternalLink();
  const [detail, setDetail] = useState<KirkelService | null>(null);
  const [showAllNachweise, setShowAllNachweise] = useState(false);
  const lastFocusedBeforeDetailRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (detail) {
      document.documentElement.setAttribute('data-overlay-detail-open', 'true');
    } else {
      document.documentElement.removeAttribute('data-overlay-detail-open');
    }
    return () => document.documentElement.removeAttribute('data-overlay-detail-open');
  }, [detail]);

  const ersteSchritteRef = useRef<HTMLHeadingElement | null>(null);
  const nachweiseRef = useRef<HTMLHeadingElement | null>(null);

  const { matchedServices, nextSteps, furtherServices, evidenceChips, offices } = resolved;

  const ergebnisseForClara = useMemo(() => matchLeistungen(lifeEvents), [lifeEvents]);

  if (matchedServices.length === 0) return null;

  const footerText = du ? FOOTER_TEXT_DU : FOOTER_TEXT_SIE;
  const steps = du ? STEPS_DU : STEPS_SIE;
  const pathTitle = du ? 'Dein Behördenweg' : 'Ihr Behördenweg';
  const pathSubtitle = du
    ? 'Die nächsten Schritte aus deiner Auswahl.'
    : 'Die nächsten Schritte aus Ihrer Auswahl.';
  const metaLine = du
    ? `${matchedServices.length} Themen · ${evidenceChips.length} Unterlagen · ${offices.length} zuständige Stellen`
    : `${matchedServices.length} Themen · ${evidenceChips.length} Unterlagen · ${offices.length} zuständige Stellen`;

  const hasSensitive = lifeEvents.some((id) => isSensitiveLifeEvent(id));
  const claraAvailable = !hasSensitive && lifeEvents.length > 0;

  const ageRelevant = lifeEvents.some((id) => id === 'mobility' || id === 'coming_of_age');
  const ageNotice = ageRelevant ? getAgeGuidanceNotice(profile.altersgruppe, du) : null;

  const visibleNachweise = showAllNachweise
    ? evidenceChips
    : evidenceChips.slice(0, NACHWEISE_VISIBLE);

  const openDetail = (service: KirkelService) => {
    if (typeof document !== 'undefined') {
      lastFocusedBeforeDetailRef.current = document.activeElement as HTMLElement;
    }
    setDetail(service);
  };

  const closeDetail = () => {
    setDetail(null);
    requestAnimationFrame(() => {
      lastFocusedBeforeDetailRef.current?.focus?.();
    });
  };

  const backToBehördenweg = () => {
    closeDetail();
    requestAnimationFrame(() => {
      document.getElementById('fuer-mich-results-heading')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const changeSituationFromDetail = () => {
    closeDetail();
    onChangeSituation?.();
  };

  const openOfficial = (service: KirkelService) => {
    const url = service.online_service_url || service.form_url || service.source_url;
    if (!canOpenExternal(service) || !url) return;
    if (externalLink) {
      externalLink.openExternal(url, service.titel);
    } else if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const askClara = (contextLabel?: string) => {
    if (typeof window === 'undefined') return;
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents,
      profile,
      ergebnisse: ergebnisseForClara,
      addressMode: du ? 'du' : 'sie',
    });
    const detailSuffix = contextLabel ? `\n\nKontext: ${contextLabel}` : '';
    window.dispatchEvent(
      new CustomEvent('clara:open-chat', {
        detail: { prompt: prompt + detailSuffix, autoSend: true },
      }),
    );
  };

  const renderRichCard = (service: KirkelService, variant: 'primary' | 'secondary' = 'primary') => {
    const isPriority = service.badge === 'wichtig';
    const hasDocHint = service.badge === 'nachweis';
    const leftAccent = isPriority ? '4px' : hasDocHint ? '3px' : '2px';
    const leftColor = isPriority ? '#003366' : hasDocHint ? '#34D399' : '#D6E0EE';
    const shadow =
      variant === 'primary'
        ? '0 6px 20px rgba(0,40,100,0.09)'
        : '0 2px 10px rgba(0,40,100,0.05)';

    return (
      <article
        key={service.id}
        className="rounded-xl border bg-white p-3"
        style={{
          borderColor: 'var(--gov-border, #D6E0EE)',
          borderLeftWidth: leftAccent,
          borderLeftColor: leftColor,
          boxShadow: variant === 'primary' ? '0 2px 10px rgba(0,40,100,0.05)' : shadow,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <h5 className="text-[15px] font-bold leading-tight text-[#1A2B45]">{service.titel}</h5>
          <Badge badge={service.badge} />
        </div>
        <p
          className="mt-1.5 text-[12px] leading-relaxed text-[#374151]"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {service.kurzbeschreibung}
        </p>

        <p className="mt-2.5 text-[11px] font-semibold text-[#1A2B45]">{service.zustaendige_stelle}</p>
        <p className="mt-0.5 text-[10px] text-[#6B7A99]">{service.region}</p>

        <button
          type="button"
          onClick={() => openDetail(service)}
          className="mt-3 inline-flex w-full min-h-[44px] items-center justify-center gap-1 rounded-xl border border-[#003366] bg-[#003366] py-2.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
        >
          Details ansehen
          <ChevronRight size={14} aria-hidden />
        </button>
      </article>
    );
  };

  const renderCompactCard = (service: KirkelService) => (
    <button
      key={service.id}
      type="button"
      onClick={() => openDetail(service)}
      className="flex w-full min-h-[44px] items-center justify-between gap-2 rounded-xl border border-[#D6E0EE] bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-[#FBFDFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-[13px] font-bold text-[#1A2B45]">{service.titel}</span>
          <Badge badge={service.badge} />
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[#6B7A99]">
          {service.zustaendige_stelle}
        </span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-[#003366]" aria-hidden />
    </button>
  );

  const changeSituationLabel = du ? 'Andere Situation wählen' : 'Andere Situation wählen';

  return (
    <section className="mt-3 pb-3" aria-labelledby="fuer-mich-results-heading">
      {selectedLifeEventLabel && onChangeSituation ? (
        <div className="wegweiser-selection-bar mb-2" role="status" aria-live="polite">
          <p className="min-w-0 text-[11px] text-[#5f6b7a]">
            <span className="font-semibold text-[#003366]">Ausgewählt:</span>{' '}
            <span className="font-bold text-[#1A2B45]">{selectedLifeEventLabel}</span>
          </p>
          <button type="button" onClick={onChangeSituation} className="wegweiser-change-capsule shrink-0">
            {changeSituationLabel}
          </button>
        </div>
      ) : null}

      <div className="behoerdenweg-card">
        <h3 id="fuer-mich-results-heading" className="text-[15px] font-bold tracking-tight text-[#003366]">
          {pathTitle}
        </h3>
        <p className="mt-0.5 text-[11px] leading-snug text-[#5f6b7a]">{pathSubtitle}</p>

        <ol
          className="behoerdenweg-stepper mt-2"
          aria-label={du ? 'Schritte im Behördenweg' : 'Schritte im Behördenweg'}
        >
          {steps.map((label, idx) => (
            <li key={label} className="behoerdenweg-stepper__step">
              <span className="behoerdenweg-stepper__marker" aria-hidden>
                {idx + 1}
              </span>
              <span className="behoerdenweg-stepper__label">{label}</span>
            </li>
          ))}
        </ol>

        <p className="mt-2 text-[10px] font-semibold text-[#003366]">{metaLine}</p>
        <p className="mt-0.5 text-[10px] text-[#6B7A99]">Orientierung · keine Anspruchsprüfung</p>
      </div>

      {ageNotice ? (
        <div
          className="mt-3 flex items-start gap-2 rounded-xl border border-[#9DBDE6] bg-[#EAF2FB] px-3 py-2.5"
          role="note"
          aria-label="Hinweis zur Altersgruppe"
        >
          <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#003366] text-[10px] font-bold text-white">
            i
          </span>
          <p className="text-[11px] leading-relaxed text-[#1A2B45]">{ageNotice.text}</p>
        </div>
      ) : null}

      <h4
        ref={ersteSchritteRef}
        className="mt-3 text-[13px] font-bold text-[#1A2B45]"
        style={{ scrollMarginTop: '8px' }}
      >
        Erste Schritte
      </h4>
      <div className="mt-1.5 space-y-2">{nextSteps.map((s) => renderRichCard(s, 'primary'))}</div>

      {evidenceChips.length > 0 ? (
        <>
          <h4
            ref={nachweiseRef}
            className="mt-3 text-[13px] font-bold text-[#1A2B45]"
            style={{ scrollMarginTop: '8px' }}
          >
            Unterlagen vorbereiten
          </h4>
          <div className="mt-1.5 rounded-xl border border-[#D6E0EE] bg-white px-2.5 py-0.5">
            <ul>
              {visibleNachweise.map((n, idx) => (
                <UnterlagenRow
                  key={`${n}-${idx}`}
                  index={idx + 1}
                  title={n}
                  status={evidenceStatusLabel(idx)}
                />
              ))}
            </ul>
          </div>
          {evidenceChips.length > NACHWEISE_VISIBLE ? (
            <button
              type="button"
              onClick={() => setShowAllNachweise((v) => !v)}
              className="mt-2 text-[11px] font-semibold text-[#003366] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
            >
              {showAllNachweise
                ? 'Weniger anzeigen'
                : `Weitere Unterlagen (${evidenceChips.length - NACHWEISE_VISIBLE})`}
            </button>
          ) : null}
        </>
      ) : null}

      {furtherServices.length > 0 ? (
        <>
          <h4 className="mt-3 text-[13px] font-bold text-[#1A2B45]">Weitere Themen</h4>
          <div className="mt-1.5 space-y-1.5">{furtherServices.map(renderCompactCard)}</div>
        </>
      ) : null}

      {claraAvailable ? (
        <button
          type="button"
          onClick={() => askClara()}
          className="mt-3 inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#DDD6FE] bg-[#F5F0FF] py-2 text-[11px] font-semibold text-[#5B21B6] transition-colors hover:bg-[#EDE9FE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6]"
        >
          <Sparkles size={15} aria-hidden />
          {du ? 'Diesen Weg erklären' : 'Diesen Weg erklären'}
        </button>
      ) : null}

      <p className="mt-2 rounded-lg border border-[#E8EEF5] bg-[#F7F9FC] px-2.5 py-2 text-[10px] leading-relaxed text-[#5f6b7a]">
        {footerText}
      </p>

      {detail ? (
        <FuerMichDetailPanel
          service={detail}
          du={du}
          footerText={footerText}
          canOpen={canOpenExternal(detail)}
          claraAvailable={claraAvailable}
          onClose={closeDetail}
          onBackToResults={backToBehördenweg}
          onChangeSituation={onChangeSituation ? changeSituationFromDetail : undefined}
          onOpenOfficial={() => openOfficial(detail)}
          onAskClara={() => askClara(detail.titel)}
          onOpenExternalUrl={(url) => {
            if (externalLink) {
              externalLink.openExternal(url, detail.titel);
            } else if (typeof window !== 'undefined') {
              window.open(url, '_blank', 'noopener,noreferrer');
            }
          }}
        />
      ) : null}
    </section>
  );
}

function FuerMichDetailPanel({
  service,
  du,
  footerText,
  canOpen,
  claraAvailable,
  onClose,
  onBackToResults,
  onChangeSituation,
  onOpenOfficial,
  onAskClara,
  onOpenExternalUrl,
}: {
  service: KirkelService;
  du: boolean;
  footerText: string;
  canOpen: boolean;
  claraAvailable: boolean;
  onClose: () => void;
  onBackToResults: () => void;
  onChangeSituation?: () => void;
  onOpenOfficial: () => void;
  onAskClara: () => void;
  onOpenExternalUrl: (url: string) => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const backLabelLong = 'Zurück zum Wegweiser';

  useEffect(() => {
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fuer-mich-detail-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fuer-mich-detail-title"
    >
      <div className="fuer-mich-detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="fuer-mich-detail-panel__header">
          <button
            type="button"
            onClick={onClose}
            className="civic-hit-target inline-flex min-w-0 flex-1 items-center gap-1 rounded-lg px-2 text-left text-[13px] font-semibold text-[var(--color-civic-navy)] hover:bg-[var(--color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-civic-navy)]"
          >
            <ChevronLeft size={15} className="shrink-0" aria-hidden />
            <span className="sm:hidden">Zurück</span>
            <span className="hidden sm:inline">{backLabelLong}</span>
          </button>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="civic-hit-target shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-civic-navy)]"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="fuer-mich-detail-panel__scroll">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">Überblick</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge badge={service.badge} />
            </div>
            <h2 id="fuer-mich-detail-title" className="mt-1 text-[18px] font-bold leading-tight text-[#003366]">
              {service.titel}
            </h2>
          </div>

          <p className="mt-2.5 text-[13px] leading-relaxed text-[#374151]">{service.kurzbeschreibung}</p>
          <p className="mt-2 text-[12px] font-semibold text-[#1A2B45]">{service.zustaendige_stelle}</p>
          <p className="mt-0.5 text-[10px] text-[#6B7A99]">{service.region}</p>

          {claraAvailable ? (
            <button
              type="button"
              onClick={onAskClara}
              className="mt-3 inline-flex w-full min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#DDD6FE] bg-[#F5F0FF] py-2 text-[11px] font-semibold text-[#5B21B6] hover:bg-[#EDE9FE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6]"
            >
              <Sparkles size={13} aria-hidden />
              {du ? 'Diesen Schritt erklären' : 'Diesen Schritt erklären'}
            </button>
          ) : null}

          {service.leistung_key === 'personalausweis-eid' ? (
            <CivicDocumentPacket
              leistungKey={service.leistung_key}
              du={du}
              onOpenSource={onOpenExternalUrl}
            />
          ) : null}

          <FuerMichDocumentPrep
            leistungKey={service.leistung_key}
            sourceStatus={service.source_status}
            du={du}
          />

          <FuerMichTerminweg
            service={service}
            du={du}
            onBackToResults={onBackToResults}
            onChangeSituation={onChangeSituation}
          />

          <details className="mt-4 rounded-xl border border-[#D6E0EE] surface-mist-blue">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-[12px] font-semibold text-[#003366] hover:bg-[var(--mist-blue-alt)] [&::-webkit-details-marker]:hidden">
              Quelle &amp; Prüfung
              <ChevronDown size={14} className="shrink-0 opacity-70" aria-hidden />
            </summary>
            <div className="border-t border-[#E8EEF5] px-3 py-2.5">
            {service.moegliche_nachweise.length > 0 ? (
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">Unterlagen</p>
                <ol className="mt-1.5 space-y-1">
                  {service.moegliche_nachweise.map((n, idx) => (
                    <li key={idx} className="flex gap-2 text-[11px] text-[#374151]">
                      <span className="font-bold text-[#003366]">{idx + 1}.</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">Quellenstatus</p>
            <span className={`mt-1 ${statusPillClass(sourceStatusTone(service.source_status as SourceStatus))}`}>
              {sourceStatusLabel(service.source_status)}
            </span>
            <p className="mt-2 text-[10px] leading-relaxed text-[#6B7A99]">{sourceStatusNotice(service)}</p>
            {service.last_checked_at ? (
              <p className="mt-1 text-[10px] text-[#6B7A99]">Letzter Prüfstand: {service.last_checked_at}</p>
            ) : null}
          </div>
        </details>

          <p className="mt-3 rounded-xl border border-[#E8EEF5] surface-mist-blue px-3 py-2 text-[10px] leading-relaxed text-[#5f6b7a]">
            {footerText}
          </p>

          {canOpen ? (
            <button
              type="button"
              onClick={onOpenOfficial}
              className="mt-3 inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#003366] bg-white py-2.5 text-[12px] font-semibold text-[#003366] transition-colors hover:bg-[var(--mist-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
            >
              <ExternalLinkIcon size={14} aria-hidden />
              Offizielle Stelle öffnen
            </button>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-[#D6E0EE] surface-mist-blue px-3 py-2.5 text-center text-[11px] font-medium text-[#374151]">
              {service.fallback_message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
