'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/context/AppContext';
import type { EbeneLevel, Location, Section } from '@/types';
import { activeLocationForLevel, levelForResidenceLocation } from '@/lib/activeLocationForLevel';
import { DEMO_LOCATION_LABEL } from '@/lib/locationLabels';

const LEVEL_CONFIG: Record<EbeneLevel, { label: string }> = {
  bund: { label: 'Bund' },
  land: { label: 'Land' },
  kreis: { label: 'Kreis' },
  kommune: { label: 'Kommune' },
};

export const LOCATION_LABEL: Record<Location, string> = DEMO_LOCATION_LABEL;

const SECTION_LEVELS: Record<Section, EbeneLevel[]> = {
  live: ['bund', 'land', 'kreis', 'kommune'],
  leaderboard: ['bund', 'land', 'kreis', 'kommune'],
  wahlen: ['bund', 'land', 'kreis', 'kommune'],
  news: [],
  kalender: ['bund', 'land', 'kreis', 'kommune'],
  meldungen: ['kommune'],
};

export function levelForLocation(loc: Location): EbeneLevel {
  return levelForResidenceLocation(loc);
}

export function selectionLabelForSection(section: Section, activeLocation: Location, residenceLocation?: Location): string {
  const res = residenceLocation ?? activeLocation;
  const lvl = levelForLocation(activeLocation);
  if (section === 'meldungen' || (section === 'leaderboard' && lvl === 'kommune')) {
    const loc = activeLocationForLevel(res, 'kommune');
    const label = DEMO_LOCATION_LABEL[loc] ?? String(loc);
    return `Kommune: ${label}`;
  }
  return `Auswahl: ${LEVEL_CONFIG[lvl]?.label ?? 'Bund'}`;
}

function residencePathForLocation(loc: Location): EbeneLevel[] {
  const level = levelForLocation(loc);
  switch (level) {
    case 'kommune':
      return ['bund', 'land', 'kreis', 'kommune'];
    case 'kreis':
      return ['bund', 'land', 'kreis'];
    case 'land':
      return ['bund', 'land'];
    default:
      return ['bund'];
  }
}

function defaultLevel(residencePath: EbeneLevel[], section: Section): EbeneLevel {
  const allowed = SECTION_LEVELS[section] ?? [];
  const candidates = residencePath.filter((l) => allowed.includes(l));
  return candidates.length > 0 ? candidates[candidates.length - 1] : 'bund';
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Props = {
  section: Section;
};

const FILTER_HEARTBEAT_SESSION_KEY = 'eidconnect_filter_heartbeat_shown';

export function SectionLevelFilterIcon({ section }: Props) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [anchor, setAnchor] = useState<{ left: number; top: number; width: number } | null>(null);

  // Portal-Target erst nach Mount setzen, damit SSR nicht versucht document.body zu lesen.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    setPortalNode(document.body);
  }, []);
  /** Kurzer CI-„Herzschlag“ nur bei Abstimmen, einmal pro Browser-Sitzung, solange Nutzer den Filter noch nicht geöffnet hat. */
  const [heartbeat, setHeartbeat] = useState(false);

  const residencePath = useMemo(
    () => residencePathForLocation(state.residenceLocation),
    [state.residenceLocation],
  );

  const availableLevels = useMemo(() => {
    const allowed = SECTION_LEVELS[section] ?? [];
    let levels = residencePath.filter((l) => allowed.includes(l));
    if (section === 'meldungen') levels = ['kommune'];
    return levels.length > 0 ? levels : ['bund'];
  }, [residencePath, section]);

  const currentLevel = levelForLocation(state.activeLocation);

  useEffect(() => {
    const desired = defaultLevel(residencePath, section);
    const next = (availableLevels.includes(desired) ? desired : availableLevels[availableLevels.length - 1]) as EbeneLevel;
    if (!availableLevels.includes(currentLevel)) {
      dispatch({
        type: 'SET_ACTIVE_LOCATION',
        payload: activeLocationForLevel(state.residenceLocation, next),
      });
    }
  }, [section, state.residenceLocation, availableLevels, currentLevel, dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Wenn geöffnet: bei Scroll/Resize Position nachführen, damit Menü am Button bleibt.
  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      setAnchor({ left: r.left, top: r.bottom, width: r.width });
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const enabled = availableLevels.length > 1;

  const markHeartbeatDone = useCallback(() => {
    setHeartbeat(false);
    try {
      sessionStorage.setItem(FILTER_HEARTBEAT_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (section !== 'live' || !enabled) return;
    try {
      if (sessionStorage.getItem(FILTER_HEARTBEAT_SESSION_KEY) === '1') return;
    } catch {
      /* ignore */
    }
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      try {
        sessionStorage.setItem(FILTER_HEARTBEAT_SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
      return;
    }
    setHeartbeat(true);
  }, [section, enabled]);

  useEffect(() => {
    if (!heartbeat) return;
    const ms = 1.75 * 2 * 1000 + 120;
    const t = window.setTimeout(() => markHeartbeatDone(), ms);
    return () => window.clearTimeout(t);
  }, [heartbeat, markHeartbeatDone]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Filter"
        aria-haspopup="menu"
        aria-expanded={open}
        onAnimationEnd={(e) => {
          const n = e.animationName;
          if (n !== 'eid-filter-heartbeat' && !n.endsWith('eid-filter-heartbeat')) return;
          markHeartbeatDone();
        }}
        onClick={() => {
          markHeartbeatDone();
          const r = btnRef.current?.getBoundingClientRect();
          if (r) setAnchor({ left: r.left, top: r.bottom, width: r.width });
          setOpen((p) => !p);
        }}
        className={`btn-filter-ebenen inline-flex h-8 items-center justify-center rounded-full px-3 text-[11px] backdrop-blur-sm ${
          heartbeat ? 'btn-filter-ebenen--pulse' : ''
        }`}
      >
        Filter
      </button>

      {enabled && open && anchor && portalNode
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[1000]"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <div
                className="fixed z-[1001] rounded-xl border border-neutral-200 bg-white py-1 shadow-xl"
                style={{
                  top: anchor.top + 6,
                  left: clamp(anchor.left + anchor.width - 180, 8, window.innerWidth - 188),
                  width: 180,
                }}
                role="menu"
                aria-label="Ebenen auswählen"
              >
                {availableLevels.map((level) => {
                  const cfg = LEVEL_CONFIG[level as EbeneLevel];
                  const isSelected = currentLevel === level;
                  const disabled = !availableLevels.includes(level as EbeneLevel);
                  return (
                    <button
                      key={level}
                      type="button"
                      role="menuitem"
                      disabled={disabled}
                      onClick={() => {
                        dispatch({
                          type: 'SET_ACTIVE_LOCATION',
                          payload: activeLocationForLevel(state.residenceLocation, level as EbeneLevel),
                        });
                        setOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[12px] text-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
                      style={{
                        fontWeight: isSelected ? 700 : 600,
                      }}
                    >
                      <span className="flex items-center justify-between">
                        <span>{cfg.label}</span>
                        {isSelected ? <span className="text-neutral-500">✓</span> : <span className="w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>,
            portalNode,
          )
        : null}
    </>
  );
}
