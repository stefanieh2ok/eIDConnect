'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { WegweiserActionPlanItem } from '@/lib/civic/wegweiserActionPlan';
import { linkCtaLabel, statusBadgeLabel } from '@/lib/civic/officialActionLinkLabels';
import { primarySourceOwnerLabel } from '@/lib/civic/officialActionResolver';

type Props = {
  item: WegweiserActionPlanItem;
  du?: boolean;
};

export function WegweiserActionPlanCard({ item, du = true }: Props) {
  const action = item.action;
  const primaryLink = action?.availableLinks.find((l) => l.url) ?? action?.availableLinks[0];
  const secondaryLink = action?.availableLinks.find((l) => l.url && l !== primaryLink);
  const hasUrl = Boolean(primaryLink?.url);
  const status = primaryLink?.status ?? 'catalog_missing';
  const ctaLabel = primaryLink ? linkCtaLabel(primaryLink, du) : item.mutedCta ?? 'Zuständige Stelle prüfen';
  const badge = action ? statusBadgeLabel(status, du) : null;
  const sourceLabel = action ? primarySourceOwnerLabel(action) : null;
  const docPreview =
    item.documents.length > 0
      ? item.documents.slice(0, 4).join(', ') + (item.documents.length > 4 ? ' …' : '')
      : null;

  return (
    <article
      className="wegweiser-action-plan-card"
      data-testid={`action-plan-card-${item.actionId}`}
    >
      <div className="wegweiser-action-plan-card__head">
        <span className="wegweiser-action-plan-card__step" aria-hidden>
          {item.stepNumber}
        </span>
        <div className="wegweiser-action-plan-card__titles">
          <h4 className="wegweiser-action-plan-card__title">{item.title}</h4>
          {badge ? (
            <span className={`wegweiser-action-plan-card__badge wegweiser-action-plan-card__badge--${status}`}>
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <p className="wegweiser-action-plan-card__timing">{item.timing}</p>

      <p className="wegweiser-action-plan-card__meta">
        <span className="wegweiser-action-plan-card__meta-label">Stelle:</span> {item.authority}
      </p>

      {docPreview ? (
        <p className="wegweiser-action-plan-card__docs">
          <span className="wegweiser-action-plan-card__meta-label">Benötigt:</span> {docPreview}
        </p>
      ) : null}

      {item.hint ? (
        <p className="wegweiser-action-plan-card__hint" role="note">
          {item.hint}
        </p>
      ) : null}

      <div className="wegweiser-action-plan-card__cta-row">
        {hasUrl && primaryLink?.url ? (
          <a
            href={primaryLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="wegweiser-action-plan-card__cta"
            data-testid={`official-action-link-${item.actionId}`}
          >
            {ctaLabel}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </a>
        ) : (
          <span className="wegweiser-action-plan-card__cta wegweiser-action-plan-card__cta--muted" role="note">
            {item.mutedCta ?? ctaLabel}
          </span>
        )}
        {secondaryLink?.url ? (
          <a
            href={secondaryLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="wegweiser-action-plan-card__secondary"
          >
            {linkCtaLabel(secondaryLink, du)}
          </a>
        ) : null}
      </div>

      {sourceLabel ? (
        <p className="wegweiser-action-plan-card__source">{sourceLabel}</p>
      ) : null}
    </article>
  );
}
