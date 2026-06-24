'use client';

import React, { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { WegweiserActionPlanItem } from '@/lib/civic/wegweiserActionPlan';
import { linkCtaLabel, statusBadgeLabel } from '@/lib/civic/officialActionLinkLabels';
import { primarySourceOwnerLabel } from '@/lib/civic/officialActionResolver';

type Props = {
  item: WegweiserActionPlanItem;
  du?: boolean;
  locationContext?: string;
};

export function WegweiserActionPlanCard({ item, du = true, locationContext = 'Kirkel · Saarland' }: Props) {
  const [regionalGuideOpen, setRegionalGuideOpen] = useState(false);
  const action = item.action;
  const primaryLink = action?.availableLinks.find((l) => l.url) ?? action?.availableLinks[0];
  const secondaryLink = action?.availableLinks.find((l) => l.url && l !== primaryLink);
  const hasUrl = Boolean(primaryLink?.url);
  const status = primaryLink?.status ?? 'catalog_missing';
  const ctaLabel = primaryLink ? linkCtaLabel(primaryLink, du) : 'Zuständige Stelle suchen';
  const badge = action ? statusBadgeLabel(status, du) : null;
  const sourceLabel = action ? primarySourceOwnerLabel(action) : null;
  const docPreview =
    item.documents.length > 0
      ? item.documents.slice(0, 4).join(', ') + (item.documents.length > 4 ? ' …' : '')
      : null;

  const isRegionalLookup =
    !hasUrl &&
    (status === 'regional_lookup_required' ||
      status === 'appointment_required' ||
      status === 'counselling_required');
  const isCatalogMissing = !hasUrl && status === 'catalog_missing';

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
        ) : isRegionalLookup ? (
          <button
            type="button"
            className="wegweiser-action-plan-card__cta"
            data-testid={`regional-action-cta-${item.actionId}`}
            aria-expanded={regionalGuideOpen}
            onClick={() => setRegionalGuideOpen((open) => !open)}
          >
            {du ? 'Zuständige Stelle suchen' : 'Zuständige Stelle suchen'}
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform${regionalGuideOpen ? ' rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        ) : isCatalogMissing ? (
          <span
            className="wegweiser-action-plan-card__cta wegweiser-action-plan-card__cta--disabled"
            role="note"
            data-testid={`catalog-missing-cta-${item.actionId}`}
          >
            {du ? 'Noch kein geprüfter Online-Einstieg' : 'Noch kein geprüfter Online-Einstieg'}
          </span>
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

      {isRegionalLookup && regionalGuideOpen ? (
        <div
          className="wegweiser-action-plan-card__regional-guide"
          data-testid={`regional-action-guide-${item.actionId}`}
          role="region"
          aria-label={du ? 'So findest du die Stelle' : 'So finden Sie die Stelle'}
        >
          <p className="wegweiser-action-plan-card__regional-context">
            {du ? `Kontext: ${locationContext}` : `Kontext: ${locationContext}`}
          </p>
          <p>
            {du
              ? `Für ${locationContext.split(' · ')[0]}: Kommune oder Jugendamt prüfen — zuständig nach Wohnort.`
              : `Für ${locationContext.split(' · ')[0]}: Kommune oder Jugendamt prüfen — zuständig nach Wohnort.`}
          </p>
          <ul>
            <li>{du ? 'Adresse und Öffnungszeiten der Kommune prüfen' : 'Adresse und Öffnungszeiten der Kommune prüfen'}</li>
            <li>{du ? 'Unterlagen aus dem Fahrplan vorbereiten' : 'Unterlagen aus dem Fahrplan vorbereiten'}</li>
            <li>{du ? 'Termin oder Online-Einstieg der Stelle nutzen' : 'Termin oder Online-Einstieg der Stelle nutzen'}</li>
          </ul>
          <p className="wegweiser-action-plan-card__regional-note">
            {du ? 'Clara reicht keinen Antrag ein.' : 'Clara reicht keinen Antrag ein.'}
          </p>
        </div>
      ) : null}

      {sourceLabel ? (
        <p className="wegweiser-action-plan-card__source">{sourceLabel}</p>
      ) : null}
    </article>
  );
}
