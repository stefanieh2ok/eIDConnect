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
  DEMO_LINK_LABEL,
  EXTERNAL_HANDOVER_MICROCOPY,
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
    <article className="civic-service-card">
      <div className="civic-service-card__header">
        <h4 className="civic-service-card__title">{service.title}</h4>
        <span
          className={
            'civic-service-card__confidence' +
            (service.confidence === 'high'
              ? ' civic-service-card__confidence--high'
              : service.confidence === 'medium'
                ? ' civic-service-card__confidence--medium'
                : ' civic-service-card__confidence--low')
          }
        >
          {relevance}
        </span>
      </div>

      <p className="civic-service-card__desc">{service.shortDescription}</p>

      {service.responsibleAuthority ? (
        <p className="civic-service-card__authority">
          Zuständig (Orientierung): {service.responsibleAuthority}
        </p>
      ) : null}

      {service.requiredDocuments && service.requiredDocuments.length > 0 ? (
        <p className="civic-service-card__docs">
          Unterlagen (Auszug): {service.requiredDocuments.slice(0, 3).join(' · ')}
          {service.requiredDocuments.length > 3 ? ' …' : ''}
        </p>
      ) : null}

      <div className="civic-service-card__badges">
        <span
          className={
            'civic-service-card__badge' +
            (isDemo || !verified ? ' civic-service-card__badge--demo' : ' civic-service-card__badge--source')
          }
        >
          {sourceSystemLabel(service.sourceSystem)}
        </span>
        <span
          className={
            'civic-service-card__badge' +
            (verified ? ' civic-service-card__badge--source' : ' civic-service-card__badge--demo')
          }
        >
          {linkBadge}
        </span>
      </div>

      <p className="civic-service-card__handover-note">
        {EXTERNAL_HANDOVER_MICROCOPY} {EXTERNAL_HANDOVER_NOTICE}
      </p>

      {service.officialSourceUrl ? (
        <a
          href={service.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            'civic-service-card__link' + (verified ? '' : ' civic-service-card__link--demo')
          }
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          {externalLinkButtonLabel(linkStatus, du, 'source')}
        </a>
      ) : (
        <p className="civic-service-card__no-link">
          Kein verifizierter Link — bitte bei der zuständigen Stelle final prüfen.
          {!verified ? ` ${DEMO_LINK_LABEL}` : ''}
        </p>
      )}
    </article>
  );
}
