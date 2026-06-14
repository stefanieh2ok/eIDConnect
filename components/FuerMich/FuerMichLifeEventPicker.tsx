'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import FuerMichInlineBehördenweg from '@/components/FuerMich/FuerMichInlineBehördenweg';
import { InfoHint } from '@/components/ui/InfoHint';
import { FUER_MICH_LIFE_EVENTS } from '@/data/fuerMichLifeEvents';
import {
  FUER_MICH_LIFE_EVENT_CLUSTERS,
  type LifeEventCluster,
  type LifeEventClusterId,
} from '@/data/fuerMichLifeEventClusters';
import { resolveServicesForSituation, type ResolverResult } from '@/lib/kirkelServiceResolver';
import { hasCivicBundle } from '@/lib/civicRegistryIndex';
import type { FuerMichProfileState, LifeEventId } from '@/types/fuerMich';

const CLUSTER_EMPTY_MESSAGE =
  'Für diese Kategorie sind noch keine Demo-Behördenpakete hinterlegt.';

type FuerMichLifeEventPickerProps = {
  du: boolean;
  profile: FuerMichProfileState;
  selectedId: LifeEventId | null;
  resolved: ResolverResult | null;
  onSelect: (id: LifeEventId) => void;
  onClearSelection: () => void;
  onShowFullResults: () => void;
};

function clusterHasCatalogContent(
  cluster: LifeEventCluster,
  profile: FuerMichProfileState,
): boolean {
  return cluster.eventIds.some((eventId) => {
    const result = resolveServicesForSituation({
      selectedLifeEvents: [eventId],
      profile: {
        bundesland: profile.bundesland,
        plz: profile.plz,
        wohnort: profile.wohnort,
      },
    });
    return result.matchedServices.length > 0;
  });
}

function clusterHasCivicDemoPackets(
  cluster: LifeEventCluster,
  profile: FuerMichProfileState,
): boolean {
  return cluster.eventIds.some((eventId) => {
    const result = resolveServicesForSituation({
      selectedLifeEvents: [eventId],
      profile: {
        bundesland: profile.bundesland,
        plz: profile.plz,
        wohnort: profile.wohnort,
      },
    });
    return result.matchedServices.some((service) => hasCivicBundle(service.leistung_key));
  });
}

export default function FuerMichLifeEventPicker({
  du,
  profile,
  selectedId,
  resolved,
  onSelect,
  onClearSelection,
  onShowFullResults,
}: FuerMichLifeEventPickerProps) {
  const eventsById = useMemo(
    () => new Map(FUER_MICH_LIFE_EVENTS.map((e) => [e.id, e])),
    [],
  );

  const [openClusterId, setOpenClusterId] = useState<LifeEventClusterId | null>(null);

  const clusterMeta = useMemo(
    () =>
      new Map(
        FUER_MICH_LIFE_EVENT_CLUSTERS.map((cluster) => [
          cluster.id,
          {
            hasCatalog: clusterHasCatalogContent(cluster, profile),
            hasCivicDemo: clusterHasCivicDemoPackets(cluster, profile),
          },
        ]),
      ),
    [profile],
  );

  useEffect(() => {
    if (!selectedId) return;
    const cluster = FUER_MICH_LIFE_EVENT_CLUSTERS.find((c) => c.eventIds.includes(selectedId));
    if (cluster) setOpenClusterId(cluster.id);
  }, [selectedId]);

  const preserveMainScroll = useCallback(() => {
    const scrollEl = document.getElementById('main-content');
    if (!scrollEl) return;
    const top = scrollEl.scrollTop;
    requestAnimationFrame(() => {
      scrollEl.scrollTop = top;
    });
  }, []);

  const toggleCluster = (clusterId: LifeEventClusterId) => {
    preserveMainScroll();
    setOpenClusterId((prev) => (prev === clusterId ? null : clusterId));
    requestAnimationFrame(preserveMainScroll);
  };

  return (
    <section className="lebenslagen-board" aria-labelledby="fuer-mich-life-event-heading">
      {FUER_MICH_LIFE_EVENT_CLUSTERS.map((cluster) => {
        const isOpen = openClusterId === cluster.id;
        const clusterHasSelection = cluster.eventIds.some((id) => id === selectedId);
        const meta = clusterMeta.get(cluster.id);
        const hasCatalog = meta?.hasCatalog ?? true;
        const hasCivicDemo = meta?.hasCivicDemo ?? false;
        const visibleEvents = cluster.eventIds
          .map((eventId) => eventsById.get(eventId))
          .filter((event): event is NonNullable<typeof event> => Boolean(event));

        return (
          <div
            key={cluster.id}
            className={`lebenslagen-board__group${isOpen ? ' lebenslagen-board__group--open' : ''}`}
          >
            <button
              type="button"
              onClick={() => toggleCluster(cluster.id)}
              aria-expanded={isOpen}
              className={`lebenslagen-board__row${isOpen ? ' lebenslagen-board__row--open' : ''}${
                clusterHasSelection ? ' lebenslagen-board__row--has-selection' : ''
              }`}
            >
              <span className="lebenslagen-board__title">{cluster.title}</span>
              <span className="lebenslagen-board__meta">
                <span className="lebenslagen-board__count-chip">{cluster.eventIds.length}</span>
                <ChevronRight
                  className={`lebenslagen-board__chevron${isOpen ? ' lebenslagen-board__chevron--open' : ''}`}
                  size={14}
                  aria-hidden
                />
              </span>
            </button>

            {isOpen ? (
              <div className="lebenslagen-board__situations">
                {!hasCatalog || visibleEvents.length === 0 ? (
                  <p className="lebenslagen-board__empty" role="status">
                    {CLUSTER_EMPTY_MESSAGE}
                  </p>
                ) : (
                  <>
                    {!hasCivicDemo ? (
                      <p className="lebenslagen-board__empty lebenslagen-board__empty--banner" role="status">
                        {CLUSTER_EMPTY_MESSAGE}
                      </p>
                    ) : null}
                    {visibleEvents.map((event) => {
                  const isSelected = selectedId === event.id;
                  const isSensitive = event.sensitive === true;
                  const label = du ? event.labelDu : event.labelSie;
                  const hint = du ? event.hintDu : event.hintSie;
                  const showInline =
                    isSelected && resolved && resolved.matchedServices.length > 0;

                  return (
                    <React.Fragment key={event.id}>
                      <div
                        className={`lebenslagen-situation-row${
                          isSelected
                            ? isSensitive
                              ? ' lebenslagen-situation-row--selected-neutral'
                              : ' lebenslagen-situation-row--selected'
                            : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelect(event.id)}
                          aria-pressed={isSelected}
                          aria-label={isSelected ? `${label} — Auswahl entfernen` : label}
                          className="lebenslagen-situation"
                        >
                          <span
                            className={`min-w-0 flex-1 text-[13px] font-semibold leading-snug ${
                              isSensitive ? 'text-[#334155]' : 'text-[#1A2B45]'
                            }`}
                          >
                            {label}
                          </span>
                          <ChevronRight
                            className={`shrink-0 text-[#94a3b8] transition-transform ${
                              isSelected ? 'rotate-90 text-[#047857]' : ''
                            }`}
                            size={14}
                            aria-hidden
                          />
                        </button>
                        {hint ? (
                          <InfoHint label={`Hinweis zu ${label}`} className="lebenslagen-situation-row__hint">
                            <p>{hint}</p>
                          </InfoHint>
                        ) : null}
                      </div>

                      {showInline ? (
                        <FuerMichInlineBehördenweg
                          du={du}
                          resolved={resolved}
                          onShowFullResults={onShowFullResults}
                          onClearSelection={onClearSelection}
                        />
                      ) : null}
                    </React.Fragment>
                  );
                })}
                  </>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
