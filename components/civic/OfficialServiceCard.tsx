'use client';

import React from 'react';
import type { GovService } from '@/lib/govdata/serviceTypes';
import {
  confidenceLabel,
  EXTERNAL_HANDOVER_NOTICE,
  isDemoSource,
  sourceSystemLabel,
} from '@/lib/govdata/officialSourceFormatter';
import {
  externalLinkBadgeLabel,
  externalLinkButtonLabel,
  isVerifiedOfficialLink,
  resolveExternalLinkStatus,
} from '@/lib/govdata/externalLinkGate';
import { ExternalLink } from 'lucide-react';

type Props = {
  service: GovService;
  du?: boolean;
};

export function OfficialServiceCard({ service, du = true }: Props) {
  const relevance = confidenceLabel(service.confidence);
  const isDemo = isDemoSource(service.sourceSystem);
  const linkStatus = resolveExternalLinkStatus(service);
  const linkBadge = externalLinkBadgeLabel(linkStatus);
  const verified = isVerifiedOfficialLink(linkStatus);

  return (
    <article className="civic-service-card rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-[13px] font-bold leading-snug text-[#003366]">{service.title}</h4>
        <span
          className={
            'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ' +
            (service.confidence === 'high'
              ? 'bg-emerald-50 text-emerald-800'
              : service.confidence === 'medium'
                ? 'bg-amber-50 text-amber-900'
                : 'bg-slate-100 text-slate-600')
          }
        >
          {relevance}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[#5f6b7a]">{service.shortDescription}</p>
      {service.responsibleAuthority ? (
        <p className="mt-1.5 text-[10px] font-medium text-slate-600">
          Zuständig (Orientierung): {service.responsibleAuthority}
        </p>
      ) : null}
      {service.requiredDocuments && service.requiredDocuments.length > 0 ? (
        <p className="mt-1 text-[10px] text-slate-500">
          Unterlagen (Auszug): {service.requiredDocuments.slice(0, 3).join(' · ')}
          {service.requiredDocuments.length > 3 ? ' …' : ''}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={
            'rounded-md border px-2 py-0.5 text-[9px] font-semibold ' +
            (isDemo || !verified
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-sky-200 bg-sky-50 text-sky-900')
          }
        >
          {sourceSystemLabel(service.sourceSystem)}
        </span>
        <span
          className={
            'rounded-md border px-2 py-0.5 text-[9px] font-semibold ' +
            (verified ? 'border-sky-200 bg-sky-50 text-sky-900' : 'border-amber-200 bg-amber-50 text-amber-900')
          }
        >
          {linkBadge}
        </span>
        <span className="text-[9px] font-medium text-slate-500">{EXTERNAL_HANDOVER_NOTICE}</span>
      </div>
      {service.officialSourceUrl ? (
        <a
          href={service.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            'mt-2 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-semibold transition ' +
            (verified
              ? 'border-[#003366]/20 bg-[#FBFDFF] text-[#003366] hover:bg-sky-50'
              : 'border-amber-300/80 bg-amber-50/60 text-amber-950 hover:bg-amber-50')
          }
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          {externalLinkButtonLabel(linkStatus, du)}
        </a>
      ) : (
        <p className="mt-2 text-[10px] italic text-slate-500">
          Kein verifizierter Link — bitte bei der zuständigen Stelle final prüfen.
        </p>
      )}
    </article>
  );
}
