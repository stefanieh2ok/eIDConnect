'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { ResolvedOfficialAction } from '@/lib/civic/officialActionTypes';
import { linkCtaLabel, statusBadgeLabel } from '@/lib/civic/officialActionLinkLabels';
import { primarySourceOwnerLabel } from '@/lib/civic/officialActionResolver';

type Props = {
  action: ResolvedOfficialAction;
  du?: boolean;
};

export function OfficialActionCard({ action, du = true }: Props) {
  const primaryLink = action.availableLinks[0];
  const hasUrl = Boolean(primaryLink?.url);
  const status = primaryLink?.status ?? 'catalog_missing';
  const ctaLabel = primaryLink ? linkCtaLabel(primaryLink, du) : action.ctaLabel;
  const badge = statusBadgeLabel(status, du);
  const sourceLabel = primarySourceOwnerLabel(action);
  const bodies = action.responsibleBodies.join(' · ');
  const docSummary =
    action.requiredDocuments.length > 0
      ? action.requiredDocuments.slice(0, 4).join(', ') +
        (action.requiredDocuments.length > 4 ? ' …' : '')
      : null;

  return (
    <article className="civic-official-action-card" data-testid={`official-action-${action.actionId}`}>
      <div className="civic-official-action-card__head">
        <h4 className="civic-official-action-card__title">{action.title}</h4>
        <span className={`civic-official-action-card__badge civic-official-action-card__badge--${status}`}>
          {badge}
        </span>
      </div>

      <p className="civic-official-action-card__body">{bodies}</p>
      <p className="civic-official-action-card__reason">{action.reason}</p>

      {docSummary ? (
        <p className="civic-official-action-card__docs">
          {du ? 'Unterlagen: ' : 'Unterlagen: '}
          {docSummary}
        </p>
      ) : null}

      {action.safetyNotes?.map((note) => (
        <p key={note} className="civic-official-action-card__safety" role="note">
          {note}
        </p>
      ))}

      <p className="civic-official-action-card__source">{sourceLabel}</p>

      <div className="civic-official-action-card__cta-wrap">
        {hasUrl ? (
          <a
            href={primaryLink!.url}
            target="_blank"
            rel="noopener noreferrer"
            className="civic-official-action-card__cta"
            data-testid={`official-action-link-${action.actionId}`}
          >
            {ctaLabel}
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          </a>
        ) : (
          <span className="civic-official-action-card__cta civic-official-action-card__cta--muted" role="note">
            {action.missingLinkReason ?? ctaLabel}
          </span>
        )}
      </div>
    </article>
  );
}
