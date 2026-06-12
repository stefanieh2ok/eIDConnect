'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { WAHLEN_DATA } from '@/data/constants';
import type { Location } from '@/types';
import { Wahl } from '@/types';
import { selectionLabelForSection } from '@/components/Filter/SectionLevelFilterIcon';
import { activeLocationForLevel, levelForResidenceLocation } from '@/lib/activeLocationForLevel';
import { DEMO_LOCATION_LABEL } from '@/lib/locationLabels';
import { candidateInitials, isCandidateImageVerified } from '@/lib/candidateImage';
import { InfoHint } from '@/components/ui/InfoHint';

interface ElectionsSectionProps {
  currentLocation?: string;
  /** Gewählte Ebene: nur Wahlen dieser Ebene anzeigen (Bund → Bundestag, Land → Landtag, Kreis → Kreistag, Kommune → Kommunalwahl) */
  currentLevel?: string;
  userWahlkreisByLevel?: { bund: string; land: string; kreis: string; kommune: string };
  /** Dynamische Wahlen (aus Wikidata), ergänzen die statischen Daten */
  dynamicWahlen?: Wahl[];
}

const LEVEL_NORMALIZE: Record<string, string> = { bund: 'bund', land: 'land', kreis: 'kreis', kommune: 'kommune' };

/** Menü-Ort → erlaubte `wahl.location` (gleiche Logik für alle Ebenen). */
const LOCATION_MENU_MAP: Record<string, string[]> = {
  bundesweit: ['deutschland'],
  deutschland: ['deutschland'],
  saarland: ['saarland'],
  saarpfalz: ['saarpfalz'],
  kirkel: ['kirkel'],
  frankfurt: ['frankfurt'],
  mannheim: ['mannheim'],
  weinheim: ['weinheim'],
  viernheim: ['viernheim'],
  neustadt: ['neustadt'],
  bremen: ['bremen'],
  berlin: ['berlin'],
  bayern: ['bayern'],
  muenchen: ['muenchen'],
};

/** Vergleichsstring für Kreis ↔ Wahlkreis (Demo: Menü-ID an `wahl.location` oder Fuzzy bei `location: 'kreis'`). */
function normalizeKreisCompare(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(kreis|landkreis)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kreistags-Wahl zur aktuellen Region:
 * 1) `wahl.location` ≠ `kreis` → exakt gleiche Menü-ID wie `currentLocation` (Saarland / Hessen / BW).
 * 2) sonst Fuzzy-Abgleich Wahlkreis ↔ angezeigter Kreis aus der Adresse (generische Demos, Wikidata).
 */
function kreiswahlMatchesLocation(
  wahl: Wahl,
  currentLocation: string,
  userKreisLabel: string | undefined
): boolean {
  const bind = wahl.location;
  if (bind && bind !== 'kreis') {
    return bind === currentLocation;
  }
  if (!userKreisLabel) return false;
  const userK = normalizeKreisCompare(userKreisLabel);
  const wk = normalizeKreisCompare(wahl.wahlkreis);
  return userK === wk || userK.includes(wk) || wk.includes(userK);
}

function parseGermanDateToTs(dateStr?: string): number | null {
  if (!dateStr || dateStr === 'aktuell') return null;
  const m = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    return new Date(yyyy, mm - 1, dd).getTime();
  }
  // Fallback: ISO- oder JS-parsebare Datumsformate (z. B. dynamische Quellen)
  const iso = Date.parse(dateStr);
  return Number.isNaN(iso) ? null : iso;
}

/**
 * Entfernt versehentliche Zeilenumbrüche innerhalb von Wörtern
 * (z. B. "Gemeinderatswa\nhl"), damit Titel ruhig und sauber umbrechen.
 */
function normalizeElectionName(name: string): string {
  return name
    .replace(/([A-Za-zÄÖÜäöüß])\s*\n\s*([A-Za-zÄÖÜäöüß])/g, '$1$2')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

type ElectionStatus = 'offen' | 'demnaechst' | 'abgeschlossen' | 'archiviert';

function getElectionStatus(wahl: Wahl, nowTs: number): ElectionStatus {
  if (wahl.ergebnis?.status === 'abgeschlossen') return 'abgeschlossen';
  if (wahl.datum === 'aktuell') return 'offen';
  const ts = parseGermanDateToTs(wahl.datum);
  if (ts == null) return 'archiviert';
  if (ts > nowTs) return 'demnaechst';
  return 'abgeschlossen';
}

const ElectionsSection: React.FC<ElectionsSectionProps> = ({ currentLocation: propLocation, currentLevel: propLevel, userWahlkreisByLevel, dynamicWahlen }) => {
  const { state, dispatch } = useApp();
  const du = state.anrede === 'du';
  const votedIds = state.votedElectionIds || [];
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterDateQuery, setFilterDateQuery] = useState<string>('');
  const [statusUi, setStatusUi] = useState<'all' | 'offen' | 'angekuendigt' | 'laufend' | 'abgeschlossen' | 'ergebnisse'>('all');
  const [typeUi, setTypeUi] = useState<'all' | 'wahl' | 'abstimmung' | 'veranstaltung' | 'frist'>('all');

  // Zeitraum-UI (Zeitraum-Optionen steuern vorrangig filterYear/filterMonth sowie optional einen Datum-Range).
  const [timeframeUi, setTimeframeUi] = useState<'all' | 'this_year' | 'next_year' | 'custom'>('all');
  const [customFromDate, setCustomFromDate] = useState<string>(''); // YYYY-MM-DD
  const [customToDate, setCustomToDate] = useState<string>(''); // YYYY-MM-DD

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  type FilterView = 'main' | 'ebene' | 'zeitraum' | 'typ' | 'region' | 'status' | 'suche';
  const [filterView, setFilterView] = useState<FilterView>('main');
  const [draftLevel, setDraftLevel] = useState<'bund' | 'land' | 'kreis' | 'kommune'>('bund');
  const [draftRegion, setDraftRegion] = useState<Location>('bundesweit' as Location);
  const [draftTimeframe, setDraftTimeframe] = useState<'all' | 'this_year' | 'next_year' | 'custom'>('all');
  const [draftCustomFrom, setDraftCustomFrom] = useState<string>('');
  const [draftCustomTo, setDraftCustomTo] = useState<string>('');
  const [draftStatus, setDraftStatus] = useState<'all' | 'offen' | 'angekuendigt' | 'laufend' | 'abgeschlossen' | 'ergebnisse'>('all');
  const [draftType, setDraftType] = useState<'all' | 'wahl' | 'abstimmung' | 'veranstaltung' | 'frist'>('all');
  const [draftQuery, setDraftQuery] = useState<string>('');

  // Filter: „Aktuell“ (datum === 'aktuell') vs. „Archiv“ (alles andere).
  // Hinweis: In den Daten ist 'aktuell' explizit markiert; andere Einträge sind historische Stände.
  const [showArchiv, setShowArchiv] = useState(false);
  const markImageError = useCallback((key: string) => {
    setImageErrors(prev => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);
  
  const currentLocation = propLocation || state.activeLocation || 'deutschland';
  const currentLevel = propLevel ? LEVEL_NORMALIZE[propLevel.toLowerCase()] || propLevel.toLowerCase() : null;

  const levelForStateActiveLocation = levelForResidenceLocation(state.activeLocation);
  const selectedRegionLabel = DEMO_LOCATION_LABEL[state.activeLocation] ?? state.activeLocation;
  const selectedLevelUiLabel =
    levelForStateActiveLocation === 'bund'
      ? ''
      : levelForStateActiveLocation === 'land'
        ? 'Land'
        : levelForStateActiveLocation === 'kreis'
          ? 'Kreis'
          : 'Kommune';

  const thisYear = new Date().getFullYear().toString();
  const nextYear = (new Date().getFullYear() + 1).toString();

  const timeframeChipLabel =
    timeframeUi === 'custom'
      ? customFromDate || customToDate
        ? 'Benutzerdefiniert'
        : ''
      : timeframeUi === 'this_year' || timeframeUi === 'next_year'
        ? filterYear !== 'all'
          ? filterYear
          : ''
        : '';

  const statusChipLabel =
    statusUi === 'offen'
      ? 'Offen'
      : statusUi === 'laufend'
        ? 'Laufend'
        : statusUi === 'angekuendigt'
          ? 'Angekündigt'
          : statusUi === 'abgeschlossen'
            ? 'Abgeschlossen'
            : statusUi === 'ergebnisse'
              ? 'Ergebnisse verfügbar'
              : '';

  const clearRegionFilter = () => {
    dispatch({
      type: 'SET_ACTIVE_LOCATION',
      payload: activeLocationForLevel(state.residenceLocation, 'bund'),
    });
  };

  const clearTimeframeFilter = () => {
    setTimeframeUi('all');
    setFilterYear('all');
    setFilterMonth('all');
    setCustomFromDate('');
    setCustomToDate('');
  };

  const clearStatusFilter = () => setStatusUi('all');

  const activeFiltersCount =
    (state.activeLocation !== 'bundesweit' ? 1 : 0) +
    ((timeframeUi === 'custom' ? Boolean(customFromDate || customToDate) : timeframeUi !== 'all') ? 1 : 0) +
    (statusUi !== 'all' ? 1 : 0) +
    (typeUi !== 'all' ? 1 : 0) +
    (filterDateQuery.trim() ? 1 : 0);

  const availableLevels = ['bund', 'land', 'kreis', 'kommune'] as const;

  useEffect(() => {
    if (!filterSheetOpen) return;
    const lvl = levelForResidenceLocation(state.activeLocation);
    setFilterView('main');
    setDraftLevel(lvl);
    setDraftRegion(state.activeLocation);
    setDraftTimeframe(timeframeUi);
    setDraftCustomFrom(customFromDate);
    setDraftCustomTo(customToDate);
    setDraftStatus(statusUi);
    setDraftType(typeUi);
    setDraftQuery(filterDateQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSheetOpen]);

  const applyDraftFilters = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_LOCATION', payload: draftRegion });
    setTimeframeUi(draftTimeframe);
    setCustomFromDate(draftCustomFrom);
    setCustomToDate(draftCustomTo);
    setStatusUi(draftStatus);
    setTypeUi(draftType);
    setFilterDateQuery(draftQuery);
    setFilterSheetOpen(false);
  }, [dispatch, draftRegion, draftTimeframe, draftCustomFrom, draftCustomTo, draftStatus, draftType, draftQuery]);

  const resetDraftFilters = useCallback(() => {
    setDraftLevel('bund');
    setDraftRegion(activeLocationForLevel(state.residenceLocation, 'bund'));
    setDraftTimeframe('all');
    setDraftCustomFrom('');
    setDraftCustomTo('');
    setDraftStatus('all');
    setDraftType('all');
    setDraftQuery('');
  }, [state.residenceLocation]);

  const draftRegionLabel = DEMO_LOCATION_LABEL[draftRegion] ?? String(draftRegion);
  const draftLevelLabel = draftLevel === 'bund' ? 'Bund' : draftLevel === 'land' ? 'Land' : draftLevel === 'kreis' ? 'Kreis' : 'Kommune';
  const draftTimeframeLabel =
    draftTimeframe === 'all'
      ? 'Alle'
      : draftTimeframe === 'this_year'
        ? 'Dieses Jahr'
        : draftTimeframe === 'next_year'
          ? 'Nächstes Jahr'
          : draftCustomFrom || draftCustomTo
            ? 'Benutzerdefiniert'
            : 'Benutzerdefiniert';
  const draftTypeLabel =
    draftType === 'all'
      ? 'Alle'
      : draftType === 'wahl'
        ? 'Wahl'
        : draftType === 'abstimmung'
          ? 'Abstimmung'
          : draftType === 'veranstaltung'
            ? 'Veranstaltung'
            : 'Frist';
  const draftStatusLabel =
    draftStatus === 'all'
      ? 'Alle'
      : draftStatus === 'offen'
        ? 'Offen'
        : draftStatus === 'angekuendigt'
          ? 'Angekündigt'
          : draftStatus === 'laufend'
            ? 'Laufend'
            : draftStatus === 'abgeschlossen'
              ? 'Abgeschlossen'
              : 'Ergebnisse verfügbar';

  const allWahlen = useMemo(() => {
    const base = [...WAHLEN_DATA];
    if (dynamicWahlen) {
      for (const dw of dynamicWahlen) {
        if (!base.some(w => w.id === dw.id)) base.push(dw);
      }
    }
    return base;
  }, [dynamicWahlen]);

  const nowTs = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }, []);
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    for (const w of allWahlen) {
      if (!w.datum || w.datum === 'aktuell') continue;
      const status = getElectionStatus(w, nowTs);
      const m = w.datum.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (!m?.[3]) continue;
      if (!showArchiv) {
        if (status === 'offen' || status === 'demnaechst') years.add(m[3]);
      } else {
        if (status === 'abgeschlossen' || status === 'archiviert') years.add(m[3]);
      }
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [allWahlen, showArchiv, nowTs]);

  // Tab-spezifische Jahreslisten: ungueltige Altwerte zuruecksetzen (z. B. 2020 in Aktuell)
  useEffect(() => {
    if (filterYear !== 'all' && !yearOptions.includes(filterYear)) {
      setFilterYear('all');
    }
  }, [filterYear, yearOptions]);

  // Status-UI an Tab-Kontext anpassen (Aktuell vs. Ergebnisse).
  useEffect(() => {
    if (!showArchiv && (statusUi === 'abgeschlossen' || statusUi === 'ergebnisse')) {
      setStatusUi('all');
    }
    if (showArchiv && (statusUi === 'offen' || statusUi === 'laufend' || statusUi === 'angekuendigt')) {
      setStatusUi('all');
    }
  }, [showArchiv, statusUi]);

  // Zeitraum-UI => filterYear/filterMonth + Custom-Range synchronisieren.
  useEffect(() => {
    const nowYear = new Date().getFullYear().toString();
    const nextYear = (new Date().getFullYear() + 1).toString();

    if (timeframeUi === 'all') {
      setFilterYear('all');
      setFilterMonth('all');
      setCustomFromDate('');
      setCustomToDate('');
      return;
    }

    setFilterMonth('all');
    if (timeframeUi === 'this_year') {
      setFilterYear(nowYear);
      setCustomFromDate('');
      setCustomToDate('');
      return;
    }
    if (timeframeUi === 'next_year') {
      setFilterYear(nextYear);
      setCustomFromDate('');
      setCustomToDate('');
      return;
    }

    // custom
    setFilterYear('all');
  }, [timeframeUi]);

  const handleStimmzettelClick = (wahl: Wahl) => {
    const displayWahlkreis = userWahlkreisByLevel && wahl.level ? (userWahlkreisByLevel[wahl.level as keyof typeof userWahlkreisByLevel] || wahl.wahlkreis) : wahl.wahlkreis;
    const status = getElectionStatus(wahl, nowTs);
    dispatch({
      type: 'SET_SELECTED_WAHL',
      payload: {
        ...wahl,
        wahlkreis: displayWahlkreis,
        demoElectionStatus: status,
        demoCanParticipate: status === 'offen',
      },
    });
    dispatch({ type: 'TOGGLE_STIMMZETTEL' });
  };

  const filteredWahlen = allWahlen.filter((wahl) => {
    // 1) Ebene / Location Match
    let matchesLevelAndLocation = true;

    if (!currentLevel) {
      const locations = LOCATION_MENU_MAP[currentLocation] ?? [currentLocation];
      matchesLevelAndLocation = Boolean(wahl.location && locations.includes(wahl.location));
    } else {
      if (wahl.level !== currentLevel) matchesLevelAndLocation = false;
      if (matchesLevelAndLocation && currentLevel === 'land' && currentLocation && currentLocation !== 'deutschland') {
        matchesLevelAndLocation = wahl.location === currentLocation;
      }
      if (matchesLevelAndLocation && currentLevel === 'kreis') {
        matchesLevelAndLocation = kreiswahlMatchesLocation(wahl, currentLocation, userWahlkreisByLevel?.kreis);
      }
      if (matchesLevelAndLocation && currentLevel === 'kommune') {
        const menuLocs = LOCATION_MENU_MAP[currentLocation];
        if (menuLocs?.length && wahl.location && !menuLocs.includes(wahl.location)) {
          matchesLevelAndLocation = false;
        }
      }
      if (matchesLevelAndLocation && currentLevel === 'kommune' && userWahlkreisByLevel?.kommune) {
        const userKommune = userWahlkreisByLevel.kommune.toLowerCase().trim();
        const wahlKreis = wahl.wahlkreis.toLowerCase().trim();
        matchesLevelAndLocation =
          userKommune === wahlKreis || userKommune.includes(wahlKreis) || wahlKreis.includes(userKommune);
      }
    }

    if (!matchesLevelAndLocation) return false;

    // 2) Aktuell vs. Ergebnisse (streng getrennt)
    const status = getElectionStatus(wahl, nowTs);
    if (!showArchiv && !(status === 'offen' || status === 'demnaechst')) return false;
    if (showArchiv && !(status === 'abgeschlossen' || status === 'archiviert')) return false;

    const internalStatusFilter = (() => {
      if (statusUi === 'all') return 'all' as const;
      if (!showArchiv) {
        if (statusUi === 'offen' || statusUi === 'laufend') return 'offen' as const;
        if (statusUi === 'angekuendigt') return 'demnaechst' as const;
        return 'all' as const;
      }
      // showArchiv=true
      if (statusUi === 'abgeschlossen') return 'abgeschlossen' as const;
      // "Ergebnisse verfuegbar" wird unten per `wahl.ergebnis?.parteien` eingeschraenkt
      // (siehe getElectionStatus: nicht `archiviert` mischen).
      return 'all' as const;
    })();

    if (internalStatusFilter !== 'all' && status !== internalStatusFilter) return false;

    if (showArchiv && statusUi === 'ergebnisse' && !wahl.ergebnis?.parteien?.length) return false;

    // 3) Datum-Filter je Tab auf die jeweilige Datenmenge anwenden.
    const rangeActive = Boolean(customFromDate || customToDate);
    const fromTs = customFromDate ? new Date(customFromDate + 'T00:00:00').getTime() : null;
    const toTs = customToDate ? new Date(customToDate + 'T23:59:59.999').getTime() : null;

    if (filterYear !== 'all' || filterMonth !== 'all' || filterDateQuery.trim() || rangeActive) {
      const q = filterDateQuery.trim().toLowerCase();
      const m = (wahl.datum || '').match(/(\d{2})\.(\d{2})\.(\d{4})/);
      const mm = m?.[2];
      const yyyy = m?.[3];

      // Eintrag "aktuell" hat kein Datum im DD.MM.YYYY-Format
      if (!rangeActive) {
        if (filterYear !== 'all' && yyyy !== filterYear) return false;
        if (filterMonth !== 'all' && mm !== filterMonth) return false;
      }

      if (rangeActive) {
        if (wahl.datum === 'aktuell') return false;
        const wTs = parseGermanDateToTs(wahl.datum);
        if (wTs == null) return false;
        if (fromTs != null && wTs < fromTs) return false;
        if (toTs != null && wTs > toTs) return false;
      }

      if (q && !(wahl.datum || '').toLowerCase().includes(q) && !(wahl.name || '').toLowerCase().includes(q))
        return false;
    }

    // 4) „Typ“-Filter (heuristisch anhand der Bezeichnung; Datenset enthält in der Regel Wahl-Einträge)
    if (typeUi !== 'all') {
      const name = (wahl.name || '').toLowerCase();
      const matchesType = (() => {
        if (typeUi === 'wahl') return name.includes('wahl');
        if (typeUi === 'abstimmung') return name.includes('abstimmung') || name.includes('volksabstimmung');
        if (typeUi === 'veranstaltung') return name.includes('veranstaltung');
        if (typeUi === 'frist') return name.includes('frist') || name.includes('termin');
        return true;
      })();
      if (!matchesType) return false;
    }

    return true;
  });

  const wahlenToRender = useMemo(() => {
    if (!showArchiv) {
      // Offene Wahlen zuerst, danach demnaechst.
      return [...filteredWahlen].sort((a, b) => {
        const sa = getElectionStatus(a, nowTs);
        const sb = getElectionStatus(b, nowTs);
        if (sa !== sb) return sa === 'offen' ? -1 : 1;
        const ta = parseGermanDateToTs(a.datum) ?? 0;
        const tb = parseGermanDateToTs(b.datum) ?? 0;
        return ta - tb;
      });
    }
    // Ergebnisse: alle verfuegbaren historischen Wahlen, neueste zuerst.
    const parse = (d: string) => {
      const m = d.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (!m) return 0;
      const dd = Number(m[1]);
      const mm = Number(m[2]);
      const yyyy = Number(m[3]);
      return new Date(yyyy, mm - 1, dd).getTime();
    };
    const past = filteredWahlen.filter((w) => typeof w.datum === 'string' && w.datum !== 'aktuell');
    return [...past].sort((a, b) => parse(b.datum) - parse(a.datum));
  }, [filteredWahlen, showArchiv, nowTs]);

  const hasOpenElections = useMemo(() => {
    return allWahlen.some((wahl) => {
      const status = getElectionStatus(wahl, nowTs);
      if (status !== 'offen') return false;
      let matchesLevelAndLocation = true;
      if (!currentLevel) {
        const locations = LOCATION_MENU_MAP[currentLocation] ?? [currentLocation];
        matchesLevelAndLocation = Boolean(wahl.location && locations.includes(wahl.location));
      } else {
        if (wahl.level !== currentLevel) matchesLevelAndLocation = false;
        if (matchesLevelAndLocation && currentLevel === 'land' && currentLocation && currentLocation !== 'deutschland') {
          matchesLevelAndLocation = wahl.location === currentLocation;
        }
        if (matchesLevelAndLocation && currentLevel === 'kreis') {
          matchesLevelAndLocation = kreiswahlMatchesLocation(wahl, currentLocation, userWahlkreisByLevel?.kreis);
        }
        if (matchesLevelAndLocation && currentLevel === 'kommune') {
          const menuLocs = LOCATION_MENU_MAP[currentLocation];
          if (menuLocs?.length && wahl.location && !menuLocs.includes(wahl.location)) {
            matchesLevelAndLocation = false;
          }
        }
        if (matchesLevelAndLocation && currentLevel === 'kommune' && userWahlkreisByLevel?.kommune) {
          const userKommune = userWahlkreisByLevel.kommune.toLowerCase().trim();
          const wahlKreis = wahl.wahlkreis.toLowerCase().trim();
          matchesLevelAndLocation =
            userKommune === wahlKreis || userKommune.includes(wahlKreis) || wahlKreis.includes(userKommune);
        }
      }
      return matchesLevelAndLocation;
    });
  }, [allWahlen, nowTs, currentLevel, currentLocation, userWahlkreisByLevel]);

  useEffect(() => {
    if (!showArchiv && !hasOpenElections) {
      setShowArchiv(true);
    }
  }, [showArchiv, hasOpenElections]);

  const getLevelBadge = (level?: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'bund': { bg: 'bg-slate-500', text: 'text-white', label: 'Bund' },
      'land': { bg: 'bg-blue-900', text: 'text-white', label: 'Land' },
      'kreis': { bg: 'bg-blue-400', text: 'text-white', label: 'Kreis' },
      'kommune': { bg: 'bg-blue-600', text: 'text-white', label: 'Kommune' }
    };
    
    const badge = badges[level || 'bund'] || badges['bund'];
    return badge;
  };

  const sectionCardClass = 'election-card';

  const selectionLine = (() => {
    const lvl = levelForResidenceLocation(state.activeLocation);
    const lvlLabel = lvl === 'bund' ? 'Bund' : lvl === 'land' ? 'Land' : lvl === 'kreis' ? 'Kreis' : 'Kommune';
    const region = DEMO_LOCATION_LABEL[state.activeLocation] ?? String(state.activeLocation);
    return `${lvlLabel}${region && region !== 'Deutschland' ? ` · ${region}` : ''}`;
  })();

  const activeFilterLabels = [
    state.activeLocation !== 'bundesweit'
      ? `${selectedLevelUiLabel || 'Bund'}${selectedRegionLabel !== 'Deutschland' ? ` · ${selectedRegionLabel}` : ''}`
      : null,
    timeframeChipLabel,
    statusChipLabel,
  ].filter(Boolean) as string[];

  return (
    <div className="civic-module-shell">
      <div className="election-meta-bar">
        <div className="election-meta-bar__row">
          <div className="flex min-w-0 items-center gap-1">
            <span className="election-meta-bar__selection">{selectionLine}</span>
            <InfoHint label="Wahlvorschau Hinweise">
              <p>Wahlvorschau: Kandidierende, Programme und verifizierte Quellen.</p>
              {showArchiv && currentLocation === 'saarland' ? (
                <p className="mt-1">Letzte Landtagswahl Saarland: 27.03.2022</p>
              ) : null}
              {currentLocation === 'hessen' || currentLocation === 'viernheim' ? (
                <p className="mt-1">
                  Hessen: letzte Landtagswahl 08.10.2023
                  {currentLocation === 'viernheim'
                    ? ' · Kommunalwahl Viernheim in der Vorschau als aktuell geführt'
                    : ' · nächster Termin vsl. 2028'}
                </p>
              ) : null}
            </InfoHint>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div className="election-meta-bar__segment">
              <button
                type="button"
                onClick={() => setShowArchiv(false)}
                className={`election-meta-bar__segment-btn${!showArchiv ? ' election-meta-bar__segment-btn--active' : ''}`}
              >
                Aktuell
              </button>
              <button
                type="button"
                onClick={() => setShowArchiv(true)}
                className={`election-meta-bar__segment-btn${showArchiv ? ' election-meta-bar__segment-btn--active' : ''}`}
              >
                Ergebnisse
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFilterSheetOpen(true)}
              aria-label={`Filter öffnen${activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}`}
              className="election-meta-filter-btn"
            >
              Filter{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
            </button>
          </div>
        </div>
        {activeFilterLabels.length > 0 ? (
          <div className="election-meta-bar__filters">
            {activeFilterLabels.map((label, idx) => (
              <span key={label}>
                {idx > 0 ? ' · ' : 'Filter: '}
                <button
                  type="button"
                  className="underline decoration-dotted underline-offset-2"
                  onClick={() => {
                    if (label === timeframeChipLabel) clearTimeframeFilter();
                    else if (label === statusChipLabel) setStatusUi('all');
                    else clearRegionFilter();
                  }}
                >
                  {label}
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {filterSheetOpen && (
        <div
          className="fixed inset-0 z-[90] flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Filter"
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterSheetOpen(false)} />

          <div className="relative z-10 flex w-full justify-center px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="flex w-[min(86vw,300px)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl max-h-[82vh] sm:w-[min(86vw,320px)]">
              <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-4">
                <div>
                  <div className="text-[13px] font-semibold text-neutral-900">Filter</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Wählen & anwenden.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterSheetOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  aria-label="Filter schließen"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3">
                {/* Main list (settings-style) */}
                {filterView === 'main' ? (
                  <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
                    {(
                      [
                        ['Ebene', draftLevelLabel, () => setFilterView('ebene')],
                        ['Zeitraum', draftTimeframeLabel, () => setFilterView('zeitraum')],
                        ['Typ', draftTypeLabel, () => setFilterView('typ')],
                        ['Region', draftRegionLabel, () => setFilterView('region')],
                        ['Status', draftStatusLabel, () => setFilterView('status')],
                        ['Suche', draftQuery.trim() ? 'Aktiv' : '—', () => setFilterView('suche')],
                      ] as const
                    ).map(([label, value, onClick]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={onClick}
                        className="flex w-full items-center gap-3 px-4 py-[11px] text-left"
                      >
                        <span className="text-[11px] font-normal text-neutral-700">{label}</span>
                        <span className="ml-auto min-w-0 truncate text-[12px] font-normal text-neutral-800">{value}</span>
                        <span className="text-neutral-400 text-[15px]" aria-hidden>
                          ›
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {/* Subviews */}
                {filterView !== 'main' ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setFilterView('main')}
                      className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      <span aria-hidden>‹</span> Zurück
                    </button>

                    <div className="text-[14px] font-semibold text-neutral-900">
                      {filterView === 'ebene'
                        ? 'Ebene'
                        : filterView === 'zeitraum'
                          ? 'Zeitraum'
                          : filterView === 'typ'
                            ? 'Typ'
                            : filterView === 'region'
                              ? 'Region'
                              : filterView === 'status'
                                ? 'Status'
                                : 'Suche'}
                    </div>

                    <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
                      {filterView === 'ebene'
                        ? (['bund', 'land', 'kreis', 'kommune'] as const).map((lvl) => {
                            const active = draftLevel === lvl;
                            const text = lvl === 'bund' ? 'Bund' : lvl === 'land' ? 'Land' : lvl === 'kreis' ? 'Kreis' : 'Kommune';
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => {
                                  setDraftLevel(lvl);
                                  setDraftRegion(activeLocationForLevel(state.residenceLocation, lvl));
                                }}
                                className={`flex w-full items-center px-4 py-3 text-left text-[13px] text-neutral-900 ${
                                  active ? 'bg-neutral-50' : ''
                                }`}
                              >
                                <span className="font-normal">{text}</span>
                                <span className="ml-auto text-neutral-500" aria-hidden>
                                  {active ? '✓' : ''}
                                </span>
                              </button>
                            );
                          })
                        : null}

                      {filterView === 'zeitraum'
                        ? (
                            [
                              ['all', 'Alle'],
                              ['this_year', 'Dieses Jahr'],
                              ['next_year', 'Nächstes Jahr'],
                              ['custom', 'Benutzerdefiniert'],
                            ] as const
                          ).map(([key, label]) => {
                            const active = draftTimeframe === key;
                            return (
                              <div key={key}>
                                <button
                                  type="button"
                                  onClick={() => setDraftTimeframe(key)}
                                  className={`flex w-full items-center px-4 py-3 text-left text-[13px] text-neutral-900 ${
                                    active ? 'bg-neutral-50' : ''
                                  }`}
                                >
                                  <span className="font-normal">{label}</span>
                                  <span className="ml-auto text-neutral-500" aria-hidden>
                                    {active ? '✓' : ''}
                                  </span>
                                </button>
                                {key === 'custom' && draftTimeframe === 'custom' ? (
                                  <div className="px-4 pb-3 pt-1">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <div className="mb-1 text-[11px] font-medium text-neutral-600">Von</div>
                                        <input
                                          type="date"
                                          value={draftCustomFrom}
                                          onChange={(e) => setDraftCustomFrom(e.target.value)}
                                          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[12px] font-normal text-neutral-900"
                                        />
                                      </div>
                                      <div>
                                        <div className="mb-1 text-[11px] font-medium text-neutral-600">Bis</div>
                                        <input
                                          type="date"
                                          value={draftCustomTo}
                                          onChange={(e) => setDraftCustomTo(e.target.value)}
                                          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[12px] font-normal text-neutral-900"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })
                        : null}

                      {filterView === 'typ'
                        ? (['all', 'wahl', 'abstimmung', 'veranstaltung', 'frist'] as const).map((t) => {
                            const label =
                              t === 'all'
                                ? 'Alle'
                                : t === 'wahl'
                                  ? 'Wahl'
                                  : t === 'abstimmung'
                                    ? 'Abstimmung'
                                    : t === 'veranstaltung'
                                      ? 'Veranstaltung'
                                      : 'Frist';
                            const active = draftType === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setDraftType(t)}
                                className={`flex w-full items-center px-4 py-3 text-left text-[13px] text-neutral-900 ${
                                  active ? 'bg-neutral-50' : ''
                                }`}
                              >
                                <span className="font-normal">{label}</span>
                                <span className="ml-auto text-neutral-500" aria-hidden>
                                  {active ? '✓' : ''}
                                </span>
                              </button>
                            );
                          })
                        : null}

                      {filterView === 'region'
                        ? availableLevels.map((lvl) => {
                            const loc = activeLocationForLevel(state.residenceLocation, lvl as any);
                            const label = DEMO_LOCATION_LABEL[loc] ?? String(loc);
                            const active = draftRegion === loc;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => {
                                  setDraftLevel(lvl as any);
                                  setDraftRegion(loc);
                                }}
                                className={`flex w-full items-center px-4 py-3 text-left text-[13px] text-neutral-900 ${
                                  active ? 'bg-neutral-50' : ''
                                }`}
                              >
                                <span className="font-normal">{label}</span>
                                <span className="ml-auto text-neutral-500" aria-hidden>
                                  {active ? '✓' : ''}
                                </span>
                              </button>
                            );
                          })
                        : null}

                      {filterView === 'status'
                        ? (!showArchiv
                            ? (['all', 'offen', 'angekuendigt', 'laufend'] as const)
                            : (['all', 'abgeschlossen', 'ergebnisse'] as const)
                          ).map((s) => {
                            const label =
                              s === 'all'
                                ? 'Alle'
                                : s === 'offen'
                                  ? 'Offen'
                                  : s === 'angekuendigt'
                                    ? 'Angekündigt'
                                    : s === 'laufend'
                                      ? 'Laufend'
                                      : s === 'abgeschlossen'
                                        ? 'Abgeschlossen'
                                        : 'Ergebnisse verfügbar';
                            const active = draftStatus === s;
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setDraftStatus(s as any)}
                                className={`flex w-full items-center px-4 py-3 text-left text-[13px] text-neutral-900 ${
                                  active ? 'bg-neutral-50' : ''
                                }`}
                              >
                                <span className="font-normal">{label}</span>
                                <span className="ml-auto text-neutral-500" aria-hidden>
                                  {active ? '✓' : ''}
                                </span>
                              </button>
                            );
                          })
                        : null}

                      {filterView === 'suche' ? (
                        <div className="px-4 py-3">
                          <input
                            value={draftQuery}
                            onChange={(e) => setDraftQuery(e.target.value)}
                            placeholder="Freitext-Suche…"
                            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[13px] font-normal text-neutral-900 placeholder:text-neutral-400"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-neutral-200 bg-white px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetDraftFilters}
                    className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-[13px] font-semibold text-neutral-800 hover:bg-neutral-50"
                  >
                    Zurücksetzen
                  </button>
                  <button
                    type="button"
                    onClick={applyDraftFilters}
                    className="flex-1 rounded-xl bg-[#003d80] px-3 py-3 text-[13px] font-semibold text-white shadow-sm hover:opacity-95"
                  >
                    Anwenden
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {wahlenToRender.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          {!showArchiv ? (
            <>
              <p className="text-[11px] font-medium text-slate-700">
                {state.anrede === 'du'
                  ? 'Aktuell ist keine Wahl geöffnet. Nachfolgend siehst du die letzten verfügbaren Ergebnisse.'
                  : 'Aktuell ist keine Wahl geöffnet. Nachfolgend sehen Sie die letzten verfügbaren Ergebnisse.'}
              </p>
              <button
                type="button"
                onClick={() => setShowArchiv(true)}
                className="mt-1 w-full rounded-xl py-2 text-[11px] font-semibold"
                style={{ background: 'var(--gov-btn)' }}
              >
                Zu Ergebnissen wechseln
              </button>
            </>
          ) : (
            <>
              <p className="text-[11px] font-medium text-slate-700">
                Noch keine Wahldaten fuer diese Ebene
                {userWahlkreisByLevel && (currentLevel === 'kreis' ? userWahlkreisByLevel.kreis : currentLevel === 'kommune' ? userWahlkreisByLevel.kommune : '') && (
                  <span className="font-normal"> – {currentLevel === 'kreis' ? userWahlkreisByLevel.kreis : currentLevel === 'kommune' ? userWahlkreisByLevel.kommune : ''}</span>
                )}
              </p>
              <p className="text-[10px] text-slate-500">
                Fuer diesen Ort liegen noch keine lokalen Wahl- und Politikerdaten vor. Bundesweite Informationen sind im Tab „Deutschland“ verfuegbar.
              </p>
            </>
          )}
          {userWahlkreisByLevel && (userWahlkreisByLevel.kreis || userWahlkreisByLevel.kommune) && (
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={`https://de.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(currentLevel === 'kreis' ? userWahlkreisByLevel.kreis : userWahlkreisByLevel.kommune)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-600 hover:underline"
              >
                Wikipedia durchsuchen →
              </a>
              {currentLevel === 'kreis' && (
                <a
                  href="https://de.wikipedia.org/wiki/Liste_der_Landr%C3%A4te_in_Deutschland"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Landräte-Übersicht →
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        wahlenToRender.map(wahl => {
          const normalizedName = normalizeElectionName(wahl.name);
          const badge = getLevelBadge(wahl.level);
          const hasVoted = votedIds.includes(wahl.id);
          const status = getElectionStatus(wahl, nowTs);
          const statusBadge: Record<ElectionStatus, string> = {
            offen: 'Offen',
            demnaechst: 'Demnaechst',
            abgeschlossen: 'Abgeschlossen',
            archiviert: 'Archiviert',
          };
          const canParticipate = status === 'offen';
          return (
            <div key={wahl.id} className={`${sectionCardClass} mb-4 sm:p-5`}>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="t-body-lg font-semibold leading-tight break-normal hyphens-none" style={{ color: 'var(--gov-heading)' }}>
                    {normalizedName}
                  </h3>
                  {wahl.datum !== 'aktuell' && (
                    <div className="mt-1 text-[11px] text-gray-600">{wahl.datum}</div>
                  )}
                </div>
                <div className="election-card__meta sm:text-right">
                  <span>{badge.label}</span>
                  <span className={`election-card__meta-item--${status}`}>{statusBadge[status]}</span>
                  {hasVoted ? <span className="election-card__meta-item--done">Abgestimmt</span> : null}
                </div>
              </div>

              <p className="text-[11px] text-gray-600 mb-4">Wahlkreis {userWahlkreisByLevel && wahl.level ? (userWahlkreisByLevel[wahl.level as keyof typeof userWahlkreisByLevel] || wahl.wahlkreis) : wahl.wahlkreis}</p>

              <div className="mt-2 space-y-2.5">
                {showArchiv ? (
                  <div className="election-result-panel">
                    <div className="election-result-panel__title">Wahlergebnis</div>
                    {wahl.ergebnis?.parteien && wahl.ergebnis.parteien.length > 0 ? (
                      <div className="mt-1.5 space-y-1.5">
                        {typeof wahl.ergebnis.wahlbeteiligung === 'number' && (
                          <div className="text-[10px] text-[#5f6b7a]">
                            Wahlbeteiligung:{' '}
                            <span className="font-semibold text-[#003366]">{wahl.ergebnis.wahlbeteiligung}%</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          {wahl.ergebnis.parteien.map((p) => (
                            <div
                              key={p.partei}
                              className="flex items-center justify-between gap-3 text-[11px] text-[#1A2B45]"
                            >
                              <span className="min-w-0 truncate">{p.partei}</span>
                              <span className="flex shrink-0 items-center gap-2">
                                <span className="font-semibold">{p.prozent}%</span>
                                {typeof (p as { sitze?: number }).sitze === 'number' ? (
                                  <span className="text-[10px] text-[#6B7A99]">
                                    {(p as { sitze: number }).sitze} Sitze
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          ))}
                        </div>
                        {wahl.ergebnis.koalition ? (
                          <div className="pt-1 text-[10px] text-[#5f6b7a]">
                            Koalition/Mehrheit:{' '}
                            <span className="font-semibold text-[#003366]">{wahl.ergebnis.koalition}</span>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-[#5f6b7a]">
                        Ergebnisdaten sind in der Vorschau für diese Wahl noch nicht hinterlegt.
                        <span className="mt-1 block text-[10px] text-[#6B7A99]">
                          Orientierungsansicht ohne behauptete Prozentwerte.
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-[#6B7A99]">
                    Ergebnisse werden im Bereich „Ergebnisse“ dargestellt.
                  </p>
                )}

                <div className="civic-action-block">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#003366]">
                    Wahlvorschau
                    <InfoHint label="Informationsansicht">
                      <p>
                        {du
                          ? 'Stimmzettel, Kandidierende und Programme einsehen — keine Stimmabgabe in der Vorschau.'
                          : 'Stimmzettel, Kandidierende und Programme einsehen — keine Stimmabgabe in der Vorschau.'}
                      </p>
                      <p className="mt-1">
                        Perspektive eVoting: sichere Identitätsprüfung, Trennung von Identität und Stimme,
                        gesetzliche Freigaben.
                      </p>
                    </InfoHint>
                  </div>
                  <button
                    onClick={() => handleStimmzettelClick(wahl)}
                    className="btn-gov-primary mt-2 w-full rounded-xl py-2.5 text-[12px] font-semibold transition-opacity"
                  >
                    {status === 'demnaechst'
                      ? 'Termin ansehen'
                      : status === 'abgeschlossen'
                        ? 'Stimmzettel anzeigen'
                        : 'Stimmzettel (Vorschau) öffnen'}
                  </button>
                </div>
              </div>

              {wahl.kandidaten && wahl.kandidaten.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-[11px] font-semibold mb-2">Amtsträger / Kandidaten:</h4>
                  {wahl.kandidaten.map((k, i) => {
                    const imgKey = `${wahl.id}-${i}`;
                    const showVerifiedImage =
                      isCandidateImageVerified(k) && Boolean(k.image) && !imageErrors[imgKey];
                    const initials = candidateInitials(k.name);
                    return (
                      <div key={i} className="candidate-card mb-2 flex items-start gap-3">
                        <div className="candidate-avatar" aria-hidden>
                          {showVerifiedImage ? (
                            <img
                              src={k.image}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={() => markImageError(imgKey)}
                            />
                          ) : (
                            <span className="candidate-avatar__initials">{initials || '?'}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-[#1A2B45]">{k.name}</div>
                          <div className="text-[10px] text-[#5f6b7a]">
                            {k.partei}
                            {k.alter ? ` · ${k.alter} Jahre` : ''}
                            {k.beruf ? ` · ${k.beruf}` : ''}
                          </div>
                          {!showVerifiedImage ? (
                            <p className="mt-1 text-[9px] font-medium text-[#6B7A99]">
                              Bild nicht verifiziert · Profilquelle prüfen
                            </p>
                          ) : null}
                          <div className="mt-1 flex flex-wrap gap-1">
                            {k.positionen.map((pos, j) => (
                              <span key={j} className="candidate-position-pill">
                                {pos}
                              </span>
                            ))}
                          </div>
                          {(k.quelle || k.quelleUrl) && (
                            <p className="mt-1 text-[10px] text-[#6B7A99]">
                              {k.quelleUrl ? (
                                <a
                                  href={k.quelleUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0055A4] hover:underline"
                                >
                                  Quelle: {k.quelle || 'Offizielle Seite'}
                                </a>
                              ) : (
                                <>Quelle: {k.quelle}</>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : wahl.id.startsWith('kt-auto-') || wahl.id.startsWith('kw-auto-') ? (
                <p className="text-[10px] text-gray-500 mt-3 italic">
                  Daten aus Wikidata (CC0). Detaillierte Informationen werden laufend ergänzt.
                </p>
              ) : null}
            </div>
          );
        })
      )}

    </div>
  );
};

export default ElectionsSection;
