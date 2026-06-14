'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { buildCivicClaraPrompt } from '@/lib/civicClaraPrompt';
import {
  buildCivicClaraContext,
  dispatchCivicClaraOpen,
  type CivicClaraContextAction,
} from '@/lib/civicClaraContext';
import {
  CIVIC_DEMO_NOTICE,
  CIVIC_NO_TRANSMISSION,
  CIVIC_PREPARED_LOCAL_NOTICE,
} from '@/lib/civicCompliance';
import { buildPacketFromLeistungKey } from '@/lib/civicPacketSummary';
import { resolveCivicBundleByServiceId } from '@/lib/civicRegistryIndex';
import { resolveCivicProfileForPacket } from '@/lib/civicProfileResolver';
import { buildPrefillPacket } from '@/lib/civicPrefillEngine';
import { resolveServiceIdFromLeistungKey } from '@/lib/civicRegistryIndex';
import { statusPillClass } from '@/lib/civicStatus';
import type { CivicPrefillPacket } from '@/types/civic';
import CivicPacketBadge from '@/components/FuerMich/CivicPacketBadge';
import { buildPacketSummary } from '@/lib/civicPacketSummary';

export type CivicDocumentPacketMode = 'compact' | 'card' | 'full';

type Props = {
  /** Primärer Schlüssel — Civic Trust serviceId. */
  serviceId?: string;
  /** Alternativ: Kirkel leistung_key (wird zu serviceId aufgelöst). */
  leistungKey?: string;
  mode?: CivicDocumentPacketMode;
  du: boolean;
  useDemoProfile?: boolean;
  onOpenSource?: (url: string) => void;
};

function resolveServiceId(serviceId?: string, leistungKey?: string): string | null {
  if (serviceId) return serviceId;
  if (leistungKey) return resolveServiceIdFromLeistungKey(leistungKey);
  return null;
}

export default function CivicDocumentPacket({
  serviceId: serviceIdProp,
  leistungKey,
  mode = 'card',
  du,
  useDemoProfile,
  onOpenSource,
}: Props) {
  const { state } = useApp();
  const useDemo = useDemoProfile ?? state.useDemoStammdaten;
  const resolvedServiceId = resolveServiceId(serviceIdProp, leistungKey);

  const packet = useMemo(() => {
    if (!resolvedServiceId) return null;
    if (leistungKey && !serviceIdProp) {
      return buildPacketFromLeistungKey(leistungKey, useDemo);
    }
    const bundle = resolveCivicBundleByServiceId(resolvedServiceId);
    if (!bundle) return null;
    const profile = resolveCivicProfileForPacket(useDemo, state.buergerProfil);
    return buildPrefillPacket(profile, bundle.service, bundle.authority, bundle.forms);
  }, [resolvedServiceId, leistungKey, serviceIdProp, useDemo, state.buergerProfil]);

  const sourceUrl = useMemo(() => {
    if (!resolvedServiceId) return null;
    const bundle = resolveCivicBundleByServiceId(resolvedServiceId);
    return bundle?.service.sourceUrl ?? null;
  }, [resolvedServiceId]);

  const [prepared, setPrepared] = useState(false);
  const reviewRef = useRef<HTMLDivElement>(null);

  if (!packet || !resolvedServiceId) return null;

  if (mode === 'compact') {
    const summary = leistungKey
      ? buildPacketSummary(leistungKey, useDemo)
      : null;
    if (!summary) return null;
    return <CivicPacketBadge summary={summary} />;
  }

  const authorityAddress = `${packet.authority.address.street}, ${packet.authority.address.postalCode} ${packet.authority.address.city}`;

  const openClara = (action: CivicClaraContextAction) => {
    const prompt = buildCivicClaraPrompt(packet, du, action);
    dispatchCivicClaraOpen({
      prompt,
      civicContext: buildCivicClaraContext(packet, action),
    });
  };

  const handleOpenSource = () => {
    const url = sourceUrl ?? packet.sourceRefs[0]?.url;
    if (!url) return;
    if (onOpenSource) {
      onOpenSource(url);
    } else if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    openClara('show-source');
  };

  const handlePrepare = () => {
    setPrepared(true);
  };

  const handleReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const showFullSections = mode === 'full';
  const showSecondaryClara = mode === 'full';

  return (
    <section
      className="civic-document-packet mt-4 rounded-2xl border border-[#C5D9F0] bg-gradient-to-b from-[#F8FBFF] to-white p-3.5 shadow-[0_4px_18px_rgba(0,51,102,0.07)]"
      aria-labelledby={`civic-packet-title-${resolvedServiceId}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003366] text-white">
          <ListChecks size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">
            Behördenpaket
          </p>
          <h3
            id={`civic-packet-title-${resolvedServiceId}`}
            className="text-[15px] font-bold leading-snug text-[#003366]"
          >
            {du ? 'Dein Behördenpaket' : 'Ihr Behördenpaket'}
          </h3>
          <p className="mt-0.5 text-[10px] font-medium text-[#0F766E]">{CIVIC_DEMO_NOTICE}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="rounded-xl border border-[#E8EEF5] bg-white px-3 py-2.5">
          <div className="flex items-start gap-2">
            <BookOpen size={14} className="mt-0.5 shrink-0 text-[#003366]" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">
                Zuständige Stelle
              </p>
              <p className="text-[12px] font-semibold text-[#1A2B45]">{packet.authority.name}</p>
              <p className="text-[11px] text-[#5f6b7a]">{authorityAddress}</p>
              {packet.contextNotes?.length ? (
                <ul className="mt-1.5 space-y-0.5">
                  {packet.contextNotes.map((note) => (
                    <li key={note} className="text-[10px] leading-relaxed text-[#5f6b7a]">
                      {note}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        {packet.appointmentRequired ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <Calendar size={14} className="shrink-0 text-amber-700" aria-hidden />
            <p className="text-[11px] font-semibold text-amber-900">Termin erforderlich</p>
          </div>
        ) : null}

        {(showFullSections || mode === 'card') && (
          <>
            <PacketList
              title="Unterlagen"
              icon={<ListChecks size={13} aria-hidden />}
              items={packet.documentsChecklist.map((d) => d.label)}
            />

            <PacketList
              title="Automatisch vorausgefüllt"
              icon={<CheckCircle size={13} className="text-emerald-600" aria-hidden />}
              items={packet.filledFields.map((f) => `${f.label}: ${f.value}`)}
              emptyLabel={
                useDemo
                  ? du
                    ? 'Noch keine sicheren Felder'
                    : 'Noch keine sicheren Felder'
                  : du
                    ? 'Demo-Stammdaten aktivieren für Vorausfüllung'
                    : 'Demo-Stammdaten aktivieren für Vorausfüllung'
              }
            />

            <div ref={reviewRef}>
              <PacketList
                title="Noch offen"
                icon={<ListChecks size={13} className="text-amber-600" aria-hidden />}
                items={packet.missingFields.map((m) => m.label)}
                tone="warning"
              />
            </div>

            {packet.reviewFields.length > 0 ? (
              <PacketList
                title="Angaben prüfen"
                icon={<CheckCircle size={13} className="text-[#003366]" aria-hidden />}
                items={packet.reviewFields.map((r) => `${r.label}: ${r.note}`)}
              />
            ) : null}
          </>
        )}

        {showFullSections ? (
          <details className="rounded-xl border border-[#D6E0EE] surface-mist-blue">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-[11px] font-semibold text-[#003366] hover:bg-[var(--mist-blue-alt)] [&::-webkit-details-marker]:hidden">
              Quelle &amp; Prüfung
              <ChevronDown size={14} className="shrink-0 opacity-70" aria-hidden />
            </summary>
            <div className="space-y-2 border-t border-[#E8EEF5] px-3 py-2.5">
              {packet.sourceRefs.map((ref) => (
                <div key={ref.url} className="text-[10px] leading-relaxed text-[#5f6b7a]">
                  <p className="font-semibold text-[#1A2B45]">{ref.label}</p>
                  <p>Prüfstand: {ref.lastVerifiedAt}</p>
                  <span className={statusPillClass('neutral')}>{ref.confidenceLevel}</span>
                </div>
              ))}
            </div>
          </details>
        ) : null}

        <p className="rounded-xl border border-[#E8EEF5] bg-[#F7F9FC] px-3 py-2 text-[10px] leading-relaxed text-[#5f6b7a]">
          {packet.disclaimer}
        </p>

        {prepared ? (
          <div
            className="rounded-xl border border-dashed border-[#34D399] bg-emerald-50 px-3 py-2.5 text-[11px] text-emerald-900"
            role="status"
          >
            <p className="font-semibold">{CIVIC_PREPARED_LOCAL_NOTICE}</p>
            <p className="mt-0.5">{CIVIC_NO_TRANSMISSION}</p>
            <div className="mt-2 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleReview}
                className="civic-hit-target inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#003366] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#002244]"
              >
                Angaben prüfen
              </button>
              <button
                type="button"
                onClick={handleOpenSource}
                className="civic-hit-target inline-flex min-h-[36px] items-center justify-center gap-1 rounded-lg border border-[#003366] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#003366]"
              >
                <ExternalLink size={12} aria-hidden />
                Quelle anzeigen
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {!prepared ? (
          <button
            type="button"
            onClick={handlePrepare}
            className="civic-hit-target inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#003366] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#002244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
          >
            <ListChecks size={14} aria-hidden />
            Paket vorbereiten
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleOpenSource}
          className="civic-hit-target inline-flex w-full min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#003366] bg-white py-2 text-[11px] font-semibold text-[#003366] hover:bg-[var(--mist-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
        >
          <ExternalLink size={13} aria-hidden />
          Quelle anzeigen
        </button>
        <button
          type="button"
          onClick={() => openClara('why-authority')}
          className="civic-hit-target inline-flex w-full min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#DDD6FE] bg-[#F5F0FF] py-2 text-[11px] font-semibold text-[#5B21B6] hover:bg-[#EDE9FE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6]"
        >
          <Sparkles size={13} aria-hidden />
          Warum diese Stelle?
        </button>
        {showSecondaryClara ? (
          <>
            <button
              type="button"
              onClick={() => openClara('missing-docs')}
              className="civic-hit-target inline-flex w-full min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#DDD6FE] bg-[#F5F0FF] py-2 text-[11px] font-semibold text-[#5B21B6] hover:bg-[#EDE9FE]"
            >
              <Sparkles size={13} aria-hidden />
              Welche Unterlagen fehlen?
            </button>
            <button
              type="button"
              onClick={() => openClara('prefill-summary')}
              className="civic-hit-target inline-flex w-full min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#DDD6FE] bg-[#F5F0FF] py-2 text-[11px] font-semibold text-[#5B21B6] hover:bg-[#EDE9FE]"
            >
              <Sparkles size={13} aria-hidden />
              Was wurde vorausgefüllt?
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}

function PacketList({
  title,
  icon,
  items,
  emptyLabel = 'Keine Einträge',
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  emptyLabel?: string;
  tone?: 'warning';
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        tone === 'warning' ? 'border-amber-200 bg-amber-50/50' : 'border-[#E8EEF5] bg-white'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">{title}</p>
      </div>
      {items.length > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {items.map((item) => (
            <li key={item} className="text-[11px] leading-snug text-[#374151]">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[11px] text-[#6B7A99]">{emptyLabel}</p>
      )}
    </div>
  );
}
