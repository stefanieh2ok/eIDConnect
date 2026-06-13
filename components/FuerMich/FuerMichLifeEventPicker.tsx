'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import FuerMichInlineBehördenweg from '@/components/FuerMich/FuerMichInlineBehördenweg';
import { InfoHint } from '@/components/ui/InfoHint';
import { FUER_MICH_LIFE_EVENTS } from '@/data/fuerMichLifeEvents';
import {
  FUER_MICH_LIFE_EVENT_CLUSTERS,
  type LifeEventClusterId,
} from '@/data/fuerMichLifeEventClusters';
import type { ResolverResult } from '@/lib/kirkelServiceResolver';
import type { LifeEventId } from '@/types/fuerMich';

type FuerMichLifeEventPickerProps = {
  du: boolean;
  selectedId: LifeEventId | null;
  resolved: ResolverResult | null;
  onSelect: (id: LifeEventId) => void;
  onClearSelection: () => void;
  onShowFullResults: () => void;
};

export default function FuerMichLifeEventPicker({
  du,
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

  useEffect(() => {
    if (!selectedId) return;
    const cluster = FUER_MICH_LIFE_EVENT_CLUSTERS.find((c) => c.eventIds.includes(selectedId));
    if (cluster) setOpenClusterId(cluster.id);
  }, [selectedId]);

  const toggleCluster = (clusterId: LifeEventClusterId) => {
    setOpenClusterId((prev) => (prev === clusterId ? null : clusterId));
  };

  return (
    <section className="lebenslagen-board" aria-labelledby="fuer-mich-life-event-heading">
      {FUER_MICH_LIFE_EVENT_CLUSTERS.map((cluster) => {
        const isOpen = openClusterId === cluster.id;
        const clusterHasSelection = cluster.eventIds.some((id) => id === selectedId);

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
                {cluster.eventIds.map((eventId) => {
                  const event = eventsById.get(eventId);
                  if (!event) return null;
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
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
