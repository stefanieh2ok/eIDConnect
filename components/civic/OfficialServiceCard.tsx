'use client';

import React from 'react';
import type { GovService } from '@/lib/govdata/serviceTypes';
import {
  confidenceLabel,
  EXTERNAL_HANDOVER_NOTICE,
  sourceSystemLabel,
} from '@/lib/govdata/officialSourceFormatter';
import {
  DEMO_SOURCE_PENDING_LABEL,
  externalLinkBadgeLabel,
  externalLinkButtonLabel,
  isRenderableOfficialLink,
  isVerifiedManualOfficialLink,
  officialLinkDomain,
  resolveExternalLinkStatus,
  shouldRenderExternalLink,
} from '@/lib/govdata/externalLinkGate';
import { ExternalLink } from 'lucide-react';

type Props = {
  service: GovService;
  du?: boolean;
};

export function OfficialServiceCard({ service, du = true }: Props) {
  const relevance = confidenceLabel(service.confidence);
  const linkStatus = resolveExternalLinkStatus(service);
  const linkBadge = externalLinkBadgeLabel(linkStatus);
  const verified = isRenderableOfficialLink(linkStatus);
  const manualVerified = isVerifiedManualOfficialLink(linkStatus);
  const primaryUrl = service.onlineServiceUrl || service.officialSourceUrl || service.formUrl;
  const domain = primaryUrl ? officialLinkDomain(primaryUrl) : null;

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

      {service.regionHint ? (
        <p className="civic-service-card__authority">{service.regionHint}</p>
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
            (verified ? ' civic-service-card__badge--source' : ' civic-service-card__badge--muted')
          }
        >
          {sourceSystemLabel(service.sourceSystem)}
        </span>
        {verified ? (
          <span className="civic-service-card__badge civic-service-card__badge--source">{linkBadge}</span>
        ) : null}
      </div>

      {manualVerified && service.sourceVerifiedAt ? (
        <p className="civic-service-card__authority">
          Quelle zuletzt geprüft am {service.sourceVerifiedAt}
          {domain ? ` · ${domain}` : ''}
        </p>
      ) : null}

      {verified && primaryUrl && shouldRenderExternalLink(linkStatus) ? (
        <a
          href={primaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="civic-service-card__link"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          {externalLinkButtonLabel(linkStatus, du, service.onlineServiceUrl ? 'online' : 'source')}
        </a>
      ) : !verified ? (
        <p className="civic-service-card__pending-link">
          <span className="civic-service-card__pending-link-label">{DEMO_SOURCE_PENDING_LABEL}</span>
          <span className="civic-service-card__pending-link-source">{linkBadge}</span>
        </p>
      ) : (
        <p className="civic-service-card__no-link">
          Kein verifizierter Link — bitte bei der zuständigen Stelle final prüfen.
        </p>
      )}

      <p className="civic-service-card__handover-note">{EXTERNAL_HANDOVER_NOTICE}</p>
    </article>
  );
}
