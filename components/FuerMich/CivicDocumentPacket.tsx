'use client';

import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { MAX_MUSTERMANN } from '@/data/civic/profiles/demoProfiles';
import { buildCivicAuthorityWhyPrompt } from '@/lib/civicClaraPrompt';
import { buildPrefillPacket } from '@/lib/civicPrefillEngine';
import { resolveCivicBundle } from '@/lib/civicRegistryIndex';
import { statusPillClass } from '@/lib/civicStatus';
import type { CivicPrefillPacket } from '@/types/civic';

type Props = {
  leistungKey: string;
  du: boolean;
  onOpenSource?: (url: string) => void;
};

export default function CivicDocumentPacket({ leistungKey, du, onOpenSource }: Props) {
  const bundle = useMemo(() => resolveCivicBundle(leistungKey), [leistungKey]);
  const packet = useMemo(() => {
    if (!bundle) return null;
    return buildPrefillPacket(MAX_MUSTERMANN, bundle.service, bundle.authority, bundle.forms);
  }, [bundle]);

  const [prepared, setPrepared] = useState(false);

  if (!bundle || !packet) return null;

  const authorityAddress = `${bundle.authority.address.street}, ${bundle.authority.address.postalCode} ${bundle.authority.address.city}`;

  const handlePrepare = () => setPrepared(true);

  const handleOpenSource = () => {
    const url = bundle.service.sourceUrl;
    if (onOpenSource) {
      onOpenSource(url);
    } else if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const askWhyThisAuthority = (p: CivicPrefillPacket) => {
    if (typeof window === 'undefined') return;
    const prompt = buildCivicAuthorityWhyPrompt(p, du);
    window.dispatchEvent(
      new CustomEvent('clara:open-chat', {
        detail: {
          prompt,
          autoSend: true,
          civicContext: {
            serviceId: p.serviceId,
            authorityId: p.authorityId,
            prefillPacketSummary: {
              filledCount: p.filledFields.length,
              missingCount: p.missingFields.length,
              appointmentRequired: p.appointmentRequired,
            },
          },
        },
      }),
    );
  };

  return (
    <section
      className="civic-document-packet mt-4 rounded-2xl border border-[#C5D9F0] bg-gradient-to-b from-[#F8FBFF] to-white p-3.5 shadow-[0_4px_18px_rgba(0,51,102,0.07)]"
      aria-labelledby="civic-packet-title"
    >
      <div className="flex items-start gap-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003366] text-white">
          <ListChecks size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">
            Behördenpaket
          </p>
          <h3 id="civic-packet-title" className="text-[15px] font-bold leading-snug text-[#003366]">
            {du ? 'Dein Behördenpaket' : 'Ihr Behördenpaket'}
          </h3>
          <p className="mt-0.5 text-[10px] font-medium text-[#0F766E]">{packet.demoNotice}</p>
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
            </div>
          </div>
        </div>

        {packet.appointmentRequired ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <Calendar size={14} className="shrink-0 text-amber-700" aria-hidden />
            <p className="text-[11px] font-semibold text-amber-900">Termin erforderlich</p>
          </div>
        ) : null}

        <PacketList
          title="Unterlagen"
          icon={<ListChecks size={13} aria-hidden />}
          items={packet.documentsChecklist.map((d) => d.label)}
        />

        <PacketList
          title="Automatisch vorausgefüllt"
          icon={<CheckCircle size={13} className="text-emerald-600" aria-hidden />}
          items={packet.filledFields.map((f) => `${f.label}: ${f.value}`)}
          emptyLabel={du ? 'Noch keine sicheren Felder' : 'Noch keine sicheren Felder'}
        />

        <PacketList
          title="Noch offen"
          icon={<ListChecks size={13} className="text-amber-600" aria-hidden />}
          items={packet.missingFields.map((m) => m.label)}
          tone="warning"
        />

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

        <p className="rounded-xl border border-[#E8EEF5] bg-[#F7F9FC] px-3 py-2 text-[10px] leading-relaxed text-[#5f6b7a]">
          {packet.disclaimer}
        </p>

        {prepared ? (
          <div
            className="rounded-xl border border-dashed border-[#34D399] bg-emerald-50 px-3 py-2.5 text-[11px] text-emerald-900"
            role="status"
          >
            <p className="font-semibold">Demo-Paket lokal vorbereitet</p>
            <p className="mt-0.5">
              {du
                ? 'Das ist nur eine Vorschau auf deinem Gerät — nichts wurde übermittelt.'
                : 'Das ist nur eine Vorschau auf Ihrem Gerät — nichts wurde übermittelt.'}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={handlePrepare}
          className="civic-hit-target inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#003366] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#002244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
        >
          <ListChecks size={14} aria-hidden />
          Paket vorbereiten
        </button>
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
          onClick={() => askWhyThisAuthority(packet)}
          className="civic-hit-target inline-flex w-full min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#DDD6FE] bg-[#F5F0FF] py-2 text-[11px] font-semibold text-[#5B21B6] hover:bg-[#EDE9FE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6]"
        >
          <Sparkles size={13} aria-hidden />
          Warum diese Stelle?
        </button>
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
