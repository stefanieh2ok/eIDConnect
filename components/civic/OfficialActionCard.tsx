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
  const linksWithUrl = action.availableLinks.filter((l) => l.url);
  const primaryLink = linksWithUrl[0] ?? action.availableLinks[0];
  const secondaryLinks = linksWithUrl.slice(1);
  const hasUrl = Boolean(primaryLink?.url);
  const status = primaryLink?.status ?? 'catalog_missing';
  const ctaLabel = primaryLink ? linkCtaLabel(primaryLink, du) : action.ctaLabel;
  const badge = statusBadgeLabel(status, du);
  const docSummary =
    action.requiredDocuments.length > 0
      ? action.requiredDocuments.slice(0, 2).join(', ') +
        (action.requiredDocuments.length > 2 ? ' …' : '')
      : null;
  const showReason =
    action.reason &&
    !action.reason.startsWith('Nächster Schritt:') &&
    action.reason.length < 120;

  return (
    <article className="civic-official-action-card" data-testid={`official-action-${action.actionId}`}>
      <div className="civic-official-action-card__head">
        <h4 className="civic-official-action-card__title">{action.title}</h4>
        <span className={`civic-official-action-card__badge civic-official-action-card__badge--${status}`}>
          {badge}
        </span>
      </div>

      {showReason ? <p className="civic-official-action-card__reason">{action.reason}</p> : null}

      {docSummary ? (
        <p className="civic-official-action-card__docs">
          {du ? 'Unterlagen: ' : 'Unterlagen: '}
          {docSummary}
        </p>
      ) : null}

      {action.safetyNotes?.slice(0, 1).map((note) => (
        <p key={note} className="civic-official-action-card__safety" role="note">
          {note}
        </p>
      ))}

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
        {secondaryLinks.length > 0 ? (
          <div className="civic-official-action-card__secondary-links">
            {secondaryLinks.map((link) => (
              <a
                key={`${link.url}-${link.label}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="civic-official-action-card__secondary-link"
              >
                {linkCtaLabel(link, du)}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
