'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import { WAHLEN_DATA } from '@/data/constants';
import { HESSEN_CALENDAR_LOCATION_IDS, HESSEN_KREIS_MENU_LABELS } from '@/data/hessenKreis';
import { BW_CALENDAR_LOCATION_IDS, BW_KREIS_MENU_LABELS } from '@/data/badenWuerttembergKreis';
import { CalendarScopeFilter, type CalendarGeoScope } from '@/components/Filter/CalendarScopeFilter';
import { activeLocationForLevel, levelForResidenceLocation } from '@/lib/activeLocationForLevel';
import type { EbeneLevel, UserPreferences } from '@/types';

function buildHessenCalendarLocationTypes(): Record<string, string> {
  const o: Record<string, string> = { hessen: 'saarland' };
  for (const id of Object.keys(HESSEN_KREIS_MENU_LABELS)) {
    o[id] = 'kreis';
  }
  for (const id of HESSEN_CALENDAR_LOCATION_IDS) {
    if (id === 'hessen' || id.startsWith('he_')) continue;
    o[id] = 'kommune';
  }
  return o;
}

function buildBadenWuerttembergCalendarLocationTypes(): Record<string, string> {
  const o: Record<string, string> = { 'baden-wuerttemberg': 'saarland' };
  for (const id of Object.keys(BW_KREIS_MENU_LABELS)) {
    o[id] = 'kreis';
  }
  for (const id of BW_CALENDAR_LOCATION_IDS) {
    if (id === 'baden-wuerttemberg' || id.startsWith('bw_')) continue;
    o[id] = 'kommune';
  }
  return o;
}

const HESSEN_CAL_TYPES = buildHessenCalendarLocationTypes();
const BW_CAL_TYPES = buildBadenWuerttembergCalendarLocationTypes();

interface MenuItem { id: string; name: string; level: string }

interface CalendarEvent {
  kind: 'wahl' | 'abstimmung';
  level: EbeneLevel;
  title: string;
  cardId?: string;
  location: string;
  /** Interne Sortierreihenfolge (ohne sichtbare Bewertungswerte in der UI). */
  points?: number;
}

interface CalendarSectionProps {
  votingData?: Record<string, { items: any[] }>;
  currentLocation?: string;
  priorities?: UserPreferences;
  /** Nur Ebenen anzeigen, die der Nutzer hat (Bund, Land, Kreis, Kommune) */
  menuItems?: MenuItem[];
  /** Callback bei Klick auf Kalender-Eintrag: wechselt zu Abstimmen-Tab und zeigt die Karte */
  onEventClick?: (event: { location: string; cardId: string }) => void;
}

const MONTHS = [
  { key: 'januar', name: 'Januar', days: 31 },
  { key: 'februar', name: 'Februar', days: 28 },
  { key: 'märz', name: 'März', days: 31 },
  { key: 'april', name: 'April', days: 30 },
  { key: 'mai', name: 'Mai', days: 31 },
  { key: 'juni', name: 'Juni', days: 30 },
  { key: 'juli', name: 'Juli', days: 31 },
  { key: 'august', name: 'August', days: 31 },
  { key: 'september', name: 'September', days: 30 },
  { key: 'oktober', name: 'Oktober', days: 31 },
  { key: 'november', name: 'November', days: 30 },
  { key: 'dezember', name: 'Dezember', days: 31 }
];

const PRIORITY_THRESHOLD = 60;
type PreferenceKey = 'umwelt' | 'finanzen' | 'bildung' | 'digital' | 'soziales' | 'sicherheit';

const PREFERENCE_LABEL: Record<PreferenceKey, string> = {
  digital: 'Digitalisierung',
  umwelt: 'Umwelt & Energie',
  bildung: 'Bildung',
  finanzen: 'Finanzen & Wirtschaft',
  soziales: 'Soziales',
  sicherheit: 'Sicherheit',
};

const TOPIC_KEYWORDS: Array<{ key: PreferenceKey; words: string[] }> = [
  { key: 'digital', words: ['digital', 'digitalisierung', 'eid', 'online', 'verwaltung', 'bürgerportal', 'buergerportal', 'smart city'] },
  { key: 'umwelt', words: ['umwelt', 'klima', 'energie', 'solar', 'nachhaltig', 'wind', 'waerm', 'wärm', 'hitzeschutz'] },
  { key: 'bildung', words: ['bildung', 'schule', 'kita', 'lernen', 'lern', 'ausstattung', 'jugendhilfe'] },
  { key: 'finanzen', words: ['finanz', 'wirtschaft', 'haushalt', 'gebühr', 'gebuehr', 'steuer', 'gebühren', 'foerder', 'förder'] },
  { key: 'soziales', words: ['sozial', 'familie', 'pflege', 'integration', 'jugend', 'teilhabe', 'wohnen', 'kita-beitrag'] },
  { key: 'sicherheit', words: ['sicherheit', 'ordnung', 'katastrophenschutz', 'polizei', 'warnsystem', 'warn', 'notfall', 'winterdienst'] },
];

function normalizeTopicText(v: unknown): string {
  return String(v ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function detectPreferenceKeys(card: any): PreferenceKey[] {
  if (!card) return [];
  const text = normalizeTopicText(
    [
      card.theme,
      card.category,
      card.title,
      card.description,
      ...(Array.isArray(card.quickFacts) ? card.quickFacts : []),
    ]
      .filter(Boolean)
      .join(' '),
  );
  if (!text) return [];
  const out = new Set<PreferenceKey>();
  for (const entry of TOPIC_KEYWORDS) {
    if (entry.words.some((w) => text.includes(normalizeTopicText(w)))) {
      out.add(entry.key);
    }
  }
  return Array.from(out);
}

function getMatchedPreferenceKeys(
  card: any,
  priorities?: UserPreferences,
): PreferenceKey[] {
  if (!priorities) return [];
  const keys = detectPreferenceKeys(card);
  return keys.filter((k) => (priorities[k] ?? 0) >= PRIORITY_THRESHOLD);
}

function getRelevanceReason(keys: PreferenceKey[], du: boolean): string {
  const labels = keys.slice(0, 2).map((k) => PREFERENCE_LABEL[k]);
  if (labels.length === 0) return '';
  if (labels.length === 1) {
    return du
      ? `Hervorgehoben wegen deines Interessenschwerpunkts: ${labels[0]}.`
      : `Hervorgehoben wegen Ihres Interessenschwerpunkts: ${labels[0]}.`;
  }
  return du
    ? `Hervorgehoben wegen deiner Interessenschwerpunkte: ${labels.join(', ')}.`
    : `Hervorgehoben wegen Ihrer Interessenschwerpunkte: ${labels.join(', ')}.`;
}

/** Prüft, ob Stichtag (DD.MM.YYYY) bereits abgelaufen ist. */
function isDeadlinePassed(deadline: string): boolean {
  const parts = deadline.trim().split(/\./);
  if (parts.length !== 3) return false;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return false;
  const deadlineEnd = new Date(y, m - 1, d, 23, 59, 59);
  return Date.now() > deadlineEnd.getTime();
}

const LEGEND_CONFIG: Record<string, { label: string; bg: string }> = {
  bund: { label: 'Bund', bg: 'bg-slate-500' },
  land: { label: 'Land', bg: 'bg-blue-900' },
  kreis: { label: 'Kreis', bg: 'bg-blue-500' },
  kommune: { label: 'Kommune', bg: 'bg-blue-400' },
};
const LEVEL_ORDER = ['bund', 'land', 'kreis', 'kommune'];

const CalendarSection: React.FC<CalendarSectionProps> = ({ votingData: propVotingData, currentLocation: propLocation, priorities, menuItems, onEventClick }) => {
  const legendLevels = React.useMemo(() => {
    const levels = new Set((menuItems || []).map(m => m.level));
    return LEVEL_ORDER.filter(l => levels.has(l)).map(level => ({ level, ...LEGEND_CONFIG[level] }));
  }, [menuItems]);
  const showAllLegend = legendLevels.length === 0;
  const { state, dispatch } = useApp();
  const now = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [geoScope, setGeoScope] = useState<CalendarGeoScope>('all');

  const currentMonth = MONTHS[currentMonthIndex];

  const residencePath = React.useMemo(() => {
    const lvl = levelForResidenceLocation(state.residenceLocation);
    if (lvl === 'kommune') return ['bund', 'land', 'kreis', 'kommune'] as EbeneLevel[];
    if (lvl === 'kreis') return ['bund', 'land', 'kreis'] as EbeneLevel[];
    if (lvl === 'land') return ['bund', 'land'] as EbeneLevel[];
    return ['bund'] as EbeneLevel[];
  }, [state.residenceLocation]);

  const availableLevels = React.useMemo(() => residencePath, [residencePath]);

  const LOCATION_LABEL: Record<string, string> = {
    bundesweit: 'Deutschland',
    deutschland: 'Deutschland',
    saarland: 'Saarland',
    saarpfalz: 'Saarpfalz-Kreis',
    kirkel: 'Kirkel',
    frankfurt: 'Frankfurt a. Main',
    mannheim: 'Mannheim',
    heidelberg: 'Heidelberg',
    weinheim: 'Weinheim',
    viernheim: 'Viernheim',
    neustadt: 'Neustadt a. d. Weinstraße',
    bremen: 'Bremen',
    berlin: 'Berlin',
    bayern: 'Bayern',
    muenchen: 'München',
  };

  const LEVEL_LABEL: Record<EbeneLevel, string> = {
    bund: 'Bund',
    land: 'Land',
    kreis: 'Kreis',
    kommune: 'Kommune',
  };

  const LEVEL_COLOR: Record<EbeneLevel, { solid: string; border: string; text: string }> = {
    bund: { solid: '#64748b', border: '#64748b', text: '#ffffff' }, // slate-500
    land: { solid: '#1e3a8a', border: '#1e3a8a', text: '#ffffff' }, // blue-900
    kreis: { solid: '#3b82f6', border: '#3b82f6', text: '#ffffff' }, // blue-500
    kommune: { solid: '#60a5fa', border: '#60a5fa', text: '#ffffff' }, // blue-400
  };

  const selectionLabel = React.useMemo(() => {
    if (geoScope === 'all') return 'Auswahl: Alle Ebenen';
    const labelByLevel: Record<EbeneLevel, string> = {
      bund: 'Bund',
      land: 'Land',
      kreis: 'Kreis',
      kommune: 'Kommune',
    };
    const locName = LOCATION_LABEL[state.activeLocation] ? ` · ${LOCATION_LABEL[state.activeLocation]}` : '';
    return `Auswahl: ${labelByLevel[geoScope]}${locName}`;
  }, [geoScope, state.activeLocation]);
  const duMode = state.anrede === 'du';
  
  function parseGermanDate(dateStr: string): { d: number; m: number; y: number } | null {
    const parts = (dateStr || '').trim().split(/\./);
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y) return null;
    if (m < 1 || m > 12) return null;
    return { d, m, y };
  }

  // Kalender aus echten Daten ableiten:
  // - Abstimmungen: aus VOTING_DATA deadlines
  // - Wahlen: aus WAHLEN_DATA datum
  const calendarDataFromVoting = React.useMemo(() => {
    const data: Record<number, Record<string, Record<number, CalendarEvent[]>>> = {};
    const voting = propVotingData || VOTING_DATA;
    const locationToLevel: Record<string, EbeneLevel> = {
      deutschland: 'bund',
      saarland: 'land',
      saarpfalz: 'kreis',
      kirkel: 'kommune',
      bayern: 'land',
      muenchen: 'kreis',
      hessen: 'land',
      'rheinland-pfalz': 'land',
      'baden-wuerttemberg': 'land',
      neunkirchen: 'kreis',
      merzig_wadern: 'kreis',
      saarlouis: 'kreis',
      st_wendel: 'kreis',
      rv_saarbruecken: 'kreis',
      homburg: 'kommune',
      saarbruecken: 'kommune',
      voelklingen: 'kommune',
      mannheim: 'kommune',
      heidelberg: 'kommune',
      weinheim: 'kommune',
      viernheim: 'kommune',
      neustadt: 'kommune',
      bremen: 'kommune',
      berlin: 'kommune',
      frankfurt: 'kommune',
      kommune: 'kommune',
      ...Object.fromEntries(Object.entries(HESSEN_CAL_TYPES).map(([k, v]) => [k, (v === 'kreis' ? 'kreis' : v === 'kommune' ? 'kommune' : 'land') as EbeneLevel])),
      ...Object.fromEntries(Object.entries(BW_CAL_TYPES).map(([k, v]) => [k, (v === 'kreis' ? 'kreis' : v === 'kommune' ? 'kommune' : 'land') as EbeneLevel])),
    };
    const locations = [
      'deutschland', 'saarland', 'hessen', 'rheinland-pfalz', 'baden-wuerttemberg',
      'saarpfalz', 'neunkirchen', 'merzig_wadern', 'saarlouis', 'st_wendel', 'rv_saarbruecken',
      'kirkel', 'homburg', 'saarbruecken', 'voelklingen', 'mannheim', 'heidelberg', 'weinheim', 'viernheim', 'neustadt',
      'bremen', 'berlin', 'frankfurt', 'bayern', 'muenchen', 'kommune',
      ...HESSEN_CALENDAR_LOCATION_IDS,
      ...BW_CALENDAR_LOCATION_IDS,
    ];
    for (const loc of locations) {
      const locData = voting[loc];
      const list = locData && 'items' in locData && Array.isArray(locData.items) ? locData.items : (locData && 'cards' in locData && Array.isArray(locData.cards) ? locData.cards : null);
      if (!list) continue;
      for (const item of list) {
        const parsed = parseGermanDate(item.deadline || '');
        if (!parsed) continue;
        const { d, m, y } = parsed;
        const year = y;
        const monthKey = MONTHS[m - 1]?.key;
        if (!monthKey) continue;
        const day = Math.min(d, MONTHS[m - 1].days);
        if (!data[year]) data[year] = {};
        if (!data[year][monthKey]) data[year][monthKey] = {};
        if (!data[year][monthKey][day]) data[year][monthKey][day] = [];
        data[year][monthKey][day].push({
          kind: 'abstimmung',
          level: locationToLevel[loc] ?? 'bund',
          title: item.title || 'Abstimmung',
          cardId: item.id,
          location: loc,
          points: typeof item.points === 'number' ? item.points : undefined,
        });
      }
    }

    // Wahlen hinzufügen (datum)
    for (const w of WAHLEN_DATA) {
      if (!w?.datum || w.datum === 'aktuell') continue;
      const parsed = parseGermanDate(w.datum);
      if (!parsed) continue;
      const { d, m, y } = parsed;
      const monthKey = MONTHS[m - 1]?.key;
      if (!monthKey) continue;
      const day = Math.min(d, MONTHS[m - 1].days);
      const level: EbeneLevel = (w.level as EbeneLevel) || 'bund';
      const location = w.location || (level === 'bund' ? 'deutschland' : level === 'land' ? 'saarland' : level === 'kreis' ? 'saarpfalz' : 'kirkel');
      if (!data[y]) data[y] = {};
      if (!data[y][monthKey]) data[y][monthKey] = {};
      if (!data[y][monthKey][day]) data[y][monthKey][day] = [];
      data[y][monthKey][day].push({
        kind: 'wahl',
        level,
        title: w.name || 'Wahl',
        location,
      });
    }

    return data;
  }, [propVotingData]);

  const calendarData = calendarDataFromVoting[currentYear] ?? {};
  const votingDataToUse = propVotingData || VOTING_DATA;

  const availableYears = React.useMemo(() => {
    const years = Object.keys(calendarDataFromVoting)
      .map((y) => Number(y))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => b - a);
    return years.length > 0 ? years : [now.getFullYear()];
  }, [calendarDataFromVoting, now]);

  // Alle Abstimmungen des aktuellen Monats (Bund, Land, Kreis, Kommune) – nur aus votingData, sortiert nach Tag
  const allEventsThisMonth = React.useMemo(() => {
    const out: Array<{ day: number; event: CalendarEvent; card: any }> = [];
    const voting = propVotingData || VOTING_DATA;
    const locationToLevel: Record<string, EbeneLevel> = {
      deutschland: 'bund',
      saarland: 'land',
      saarpfalz: 'kreis',
      kirkel: 'kommune',
      bayern: 'land',
      muenchen: 'kreis',
      hessen: 'land',
      'rheinland-pfalz': 'land',
      'baden-wuerttemberg': 'land',
      neunkirchen: 'kreis',
      merzig_wadern: 'kreis',
      saarlouis: 'kreis',
      st_wendel: 'kreis',
      rv_saarbruecken: 'kreis',
      homburg: 'kommune',
      saarbruecken: 'kommune',
      voelklingen: 'kommune',
      mannheim: 'kommune',
      heidelberg: 'kommune',
      weinheim: 'kommune',
      viernheim: 'kommune',
      neustadt: 'kommune',
      bremen: 'kommune',
      berlin: 'kommune',
      frankfurt: 'kommune',
      kommune: 'kommune',
      ...Object.fromEntries(Object.entries(HESSEN_CAL_TYPES).map(([k, v]) => [k, (v === 'kreis' ? 'kreis' : v === 'kommune' ? 'kommune' : 'land') as EbeneLevel])),
      ...Object.fromEntries(Object.entries(BW_CAL_TYPES).map(([k, v]) => [k, (v === 'kreis' ? 'kreis' : v === 'kommune' ? 'kommune' : 'land') as EbeneLevel])),
    };
    const monthKey = currentMonth.key;
    const monthNum = currentMonthIndex + 1;
    const locs = [
      'deutschland', 'saarland', 'hessen', 'rheinland-pfalz', 'baden-wuerttemberg',
      'saarpfalz', 'neunkirchen', 'merzig_wadern', 'saarlouis', 'st_wendel', 'rv_saarbruecken',
      'kirkel', 'homburg', 'saarbruecken', 'voelklingen', 'mannheim', 'heidelberg', 'weinheim', 'viernheim', 'neustadt',
      'bremen', 'berlin', 'frankfurt', 'bayern', 'muenchen', 'kommune',
      ...HESSEN_CALENDAR_LOCATION_IDS,
      ...BW_CALENDAR_LOCATION_IDS,
    ];
    locs.forEach(loc => {
      const locData = voting[loc];
      const list = locData && 'items' in locData && Array.isArray(locData.items) ? locData.items : (locData && 'cards' in locData && Array.isArray(locData.cards) ? locData.cards : null);
      if (!list) return;
      list.forEach((item: any) => {
        const parsed = parseGermanDate(item.deadline || '');
        if (!parsed) return;
        const { d, m, y } = parsed;
        if (m !== monthNum || y !== currentYear) return;
        const day = Math.min(d, currentMonth.days);
        out.push({
          day,
          event: {
            kind: 'abstimmung',
            level: locationToLevel[loc] ?? 'bund',
            title: item.title || 'Abstimmung',
            cardId: item.id,
            location: loc,
            points: typeof item.points === 'number' ? item.points : undefined,
          },
          card: item
        });
      });
    });

    // Wahlen dieses Monats ergänzen (ohne card)
    for (const w of WAHLEN_DATA) {
      if (!w?.datum || w.datum === 'aktuell') continue;
      const parsed = parseGermanDate(w.datum);
      if (!parsed) continue;
      const { d, m, y } = parsed;
      if (m !== monthNum || y !== currentYear) continue;
      const level: EbeneLevel = (w.level as EbeneLevel) || 'bund';
      const location = w.location || (level === 'bund' ? 'deutschland' : level === 'land' ? 'saarland' : level === 'kreis' ? 'saarpfalz' : 'kirkel');
      out.push({
        day: Math.min(d, currentMonth.days),
        event: { kind: 'wahl', level, title: w.name || 'Wahl', location },
        card: null,
      });
    }

    out.sort((a, b) => a.day - b.day);
    return out;
  }, [propVotingData, currentYear, currentMonthIndex, currentMonth.key, currentMonth.days]);

  const currentLocationKey = propLocation || state.activeLocation || 'deutschland';
  const normalizeEventLocation = (loc: string): string => {
    if (loc === 'bundesweit' || loc === 'bund') return 'deutschland';
    if (loc === 'land') return 'saarland';
    if (loc === 'kreis') return 'saarpfalz';
    return loc;
  };
  const mappedLocation = normalizeEventLocation(currentLocationKey);
  const regionScopeByLocation: Record<string, string[]> = {
    bundesweit: ['deutschland'],
    deutschland: ['deutschland'],
    saarland: ['deutschland', 'saarland'],
    saarpfalz: ['deutschland', 'saarland', 'saarpfalz'],
    kirkel: ['deutschland', 'saarland', 'saarpfalz', 'kirkel'],
    frankfurt: ['deutschland', 'hessen', 'frankfurt'],
    hessen: ['deutschland', 'hessen'],
    mannheim: ['deutschland', 'baden-wuerttemberg', 'mannheim'],
    heidelberg: ['deutschland', 'baden-wuerttemberg', 'heidelberg'],
    weinheim: ['deutschland', 'baden-wuerttemberg', 'weinheim'],
    viernheim: ['deutschland', 'hessen', 'viernheim'],
    neustadt: ['deutschland', 'rheinland-pfalz', 'neustadt'],
    bremen: ['deutschland', 'bremen'],
    berlin: ['deutschland', 'berlin'],
    bayern: ['deutschland', 'bayern'],
    muenchen: ['deutschland', 'bayern', 'muenchen'],
  };
  const isEventInSelectedRegion = (eventLocation: string) => {
    if (mappedLocation === 'deutschland' || mappedLocation === 'bundesweit') return true;
    const normalized = normalizeEventLocation(eventLocation);
    const allowed = regionScopeByLocation[mappedLocation] ?? ['deutschland', mappedLocation];
    return allowed.includes(normalized);
  };

  const filteredEventsThisMonth = React.useMemo(() => {
    const allowed = new Set(availableLevels);
    return allEventsThisMonth
      .filter(({ event }) => isEventInSelectedRegion(event.location))
      .filter(({ event }) => allowed.has(event.level))
      .filter(({ event }) => (geoScope === 'all' ? true : event.level === geoScope));
  }, [allEventsThisMonth, availableLevels, geoScope, mappedLocation]);

  const sortedEventsForList = React.useMemo(() => {
    const copy = [...filteredEventsThisMonth];
    copy.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      if (a.event.kind !== b.event.kind) return a.event.kind === 'wahl' ? -1 : 1;
      return a.event.title.localeCompare(b.event.title, 'de');
    });
    return copy;
  }, [filteredEventsThisMonth]);
  const hasTopicHighlighting = Boolean(priorities && Object.keys(priorities).length > 0);
  const hasAnyHighlightedInList = React.useMemo(
    () => sortedEventsForList.some(({ card }) => getMatchedPreferenceKeys(card, priorities).length > 0),
    [sortedEventsForList, priorities],
  );
  
  // Location-Mapping
  const locationMap: Record<string, string> = {
    'deutschland': 'deutschland', 'bundesweit': 'deutschland', 'bund': 'deutschland',
    'saarland': 'saarland', 'land': 'saarland', 'hessen': 'hessen', 'rheinland-pfalz': 'rheinland-pfalz', 'baden-wuerttemberg': 'baden-wuerttemberg',
    'saarpfalz': 'saarpfalz',
    'neunkirchen': 'neunkirchen',
    'merzig_wadern': 'merzig_wadern',
    'saarlouis': 'saarlouis',
    'st_wendel': 'st_wendel',
    'rv_saarbruecken': 'rv_saarbruecken',
    'kirkel': 'kirkel', 'homburg': 'homburg', 'saarbruecken': 'saarbruecken', 'voelklingen': 'voelklingen',
    'mannheim': 'mannheim', 'heidelberg': 'heidelberg', 'weinheim': 'weinheim',
    'viernheim': 'viernheim', 'neustadt': 'neustadt', 'bremen': 'bremen', 'berlin': 'berlin', 'frankfurt': 'frankfurt',
    'kommune': 'kommune',
    'kreis': 'saarpfalz',
    ...Object.fromEntries(HESSEN_CALENDAR_LOCATION_IDS.map((id) => [id, id])),
    ...Object.fromEntries(BW_CALENDAR_LOCATION_IDS.map((id) => [id, id])),
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick && event.cardId) {
      onEventClick({ location: event.location, cardId: event.cardId });
    }
    dispatch({ type: 'SET_ACTIVE_LOCATION', payload: event.location as any });
    // Navigation je nach Eventtyp
    if (event.kind === 'wahl') {
      dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'wahlen' });
      return;
    }
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'live' });
    const locationKey = locationMap[event.location] || event.location;
    const locationData = votingDataToUse[locationKey];
    if (locationData) {
      if ('items' in locationData && Array.isArray(locationData.items)) {
        const cardIndex = locationData.items.findIndex((c: any) => c.id === event.cardId);
        if (cardIndex >= 0) dispatch({ type: 'SET_CURRENT_CARD_INDEX', payload: cardIndex });
      } else if ('cards' in locationData && Array.isArray(locationData.cards)) {
        const cardIndex = locationData.cards.findIndex((c: any) => c.id === event.cardId);
        if (cardIndex >= 0) dispatch({ type: 'SET_CURRENT_CARD_INDEX', payload: cardIndex });
      }
    }
  };

  const handleCalendarClick = (day: number) => {
    const events = calendarData[currentMonth.key]?.[day] ?? [];
    const allowed = new Set(availableLevels);
    const visible = events
      .filter((e) => isEventInSelectedRegion(e.location))
      .filter((e) => allowed.has(e.level))
      .filter((e) => (geoScope === 'all' ? true : e.level === geoScope));
    if (visible.length > 0) {
      // Wahl hat Priorität beim Klick, danach Abstimmung
      const sorted = [...visible].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'wahl' ? -1 : 1));
      handleEventClick(sorted[0]);
    }
  };

  const nextMonth = () => {
    setCurrentMonthIndex((prev) => (prev + 1) % MONTHS.length);
  };

  const prevMonth = () => {
    setCurrentMonthIndex((prev) => (prev - 1 + MONTHS.length) % MONTHS.length);
  };

  return (
    <div className="card-section p-2.5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="t-h2">Kalender</h2>
            <div className="t-meta mt-0.5">
              Jahr: <span className="font-semibold text-neutral-700">{currentYear}</span> · <span>{selectionLabel}</span>
            </div>
          </div>
          <CalendarScopeFilter
            value={geoScope}
            availableLevels={availableLevels}
            onChange={(next) => {
              setGeoScope(next);
              const level = next === 'all' ? 'bund' : next;
              const loc = activeLocationForLevel(state.residenceLocation, level);
              dispatch({ type: 'SET_ACTIVE_LOCATION', payload: loc });
            }}
          />
      </div>
      <div className="card-content mb-3 p-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (currentMonthIndex === 0) {
              setCurrentYear(prev => prev - 1);
              setCurrentMonthIndex(11);
            } else {
              setCurrentMonthIndex(prev => prev - 1);
            }
          }}
          className="app-filter-btn px-3 py-1.5 transition-colors hover:bg-neutral-50"
          aria-label="Vorheriger Monat"
        >
          <span className="t-meta font-semibold">Zurück</span>
        </button>
        <div className="flex items-center gap-3">
          <h2 className="t-card-title">{currentMonth.name}</h2>
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold text-neutral-800"
            aria-label="Jahr auswählen"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            if (currentMonthIndex === 11) {
              setCurrentYear(prev => prev + 1);
              setCurrentMonthIndex(0);
            } else {
              setCurrentMonthIndex(prev => prev + 1);
            }
          }}
          className="app-filter-btn px-3 py-1.5 transition-colors hover:bg-neutral-50"
          aria-label="Nächster Monat"
        >
          <span className="t-meta font-semibold">Weiter</span>
        </button>
      </div>
      </div>
      
      <div className="card-content p-4">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="text-center text-[10px] font-semibold text-gray-600 pb-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {[...Array(currentMonth.days)].map((_, i) => {
            const day = i + 1;
            const events = calendarData[currentMonth.key]?.[day] ?? [];
            const allowed = new Set(availableLevels);
            const visible = events
              .filter((e) => isEventInSelectedRegion(e.location))
              .filter((e) => allowed.has(e.level))
              .filter((e) => (geoScope === 'all' ? true : e.level === geoScope));

            const wahlLevels = Array.from(
              new Set(
                visible
                  .filter((e) => e.kind === 'wahl')
                  .map((e) => e.level)
              )
            );
            const abstLevels = Array.from(
              new Set(
                visible
                  .filter((e) => e.kind === 'abstimmung')
                  .map((e) => e.level)
              )
            );

            return (
              <button
                key={i}
                onClick={() => visible.length > 0 && handleCalendarClick(day)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all border ${
                  visible.length > 0
                    ? 'bg-white text-gray-900 hover:bg-gray-50 cursor-pointer border-neutral-200'
                    : 'bg-gray-50 text-gray-700 border-transparent'
                }`}
                aria-label={
                  visible.length > 0
                    ? `${visible[0]?.title} am ${day}. ${currentMonth.name} (${visible.some((e) => e.kind === 'wahl') ? 'Wahl' : 'Abstimmung'})`
                    : `Tag ${day}`
                }
              >
                <div>{day}</div>

                {/* Marker-Logik:
                    1) Event-Typ (primär): Wahl = gefüllt, Abstimmung = Outline
                    2) Ebene (sekundär): Farbe */}
                {(wahlLevels.length > 0 || abstLevels.length > 0) && (
                  <div className="mt-1 flex flex-col items-center gap-0.5" aria-hidden>
                    {wahlLevels.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        {wahlLevels.slice(0, 2).map((lvl) => (
                          <span
                            key={`w-${lvl}`}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: LEVEL_COLOR[lvl].solid }}
                            title={`Wahl · ${LEVEL_LABEL[lvl]}`}
                          />
                        ))}
                        {wahlLevels.length > 2 && <span className="text-[9px] text-neutral-400">+</span>}
                      </div>
                    )}
                    {abstLevels.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        {abstLevels.slice(0, 2).map((lvl) => (
                          <span
                            key={`a-${lvl}`}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ border: `1px solid ${LEVEL_COLOR[lvl].border}`, background: 'transparent' }}
                            title={`Abstimmung · ${LEVEL_LABEL[lvl]}`}
                          />
                        ))}
                        {abstLevels.length > 2 && <span className="text-[9px] text-neutral-400">+</span>}
                      </div>
                    )}
                  </div>
                )}

              </button>
            );
          })}
        </div>
      </div>

      <div className="card-content mt-4 p-3">
        <h3 className="text-xs font-bold text-gray-700 mb-2">Legende</h3>
        <div className="space-y-2">
          {/* 1) Typ (Fill/Outline) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#334155' }} aria-hidden />
              <span className="text-[11px] text-gray-700">Fill = Wahl</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ border: '1px solid #334155', background: 'transparent' }} aria-hidden />
              <span className="text-[11px] text-gray-700">Outline = Abstimmung</span>
            </div>
          </div>

          {/* 2) Farben (Ebene) */}
          <div className="grid grid-cols-2 gap-y-1">
            {(showAllLegend ? (LEVEL_ORDER as EbeneLevel[]) : (legendLevels.map((l) => l.level) as EbeneLevel[])).map((lvl) => (
              <div key={lvl} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_COLOR[lvl].solid }} aria-hidden />
                <span className="text-[11px] text-gray-700">{LEVEL_LABEL[lvl]}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-gray-500">
            Farben zeigen die Verwaltungsebene (Bund, Land, Kreis, Kommune).
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-xs font-bold text-gray-700 mb-2 mt-4">
            Termine im {currentMonth.name} {currentYear}
          </h3>
          <p className="text-[10px] text-gray-500 mb-2">
            Kompaktliste (Filter wirkt auf Kalender + Legende + Liste).
          </p>
          {hasTopicHighlighting && hasAnyHighlightedInList ? (
            <p className="mb-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] leading-snug text-slate-700">
              {duMode
                ? 'Einige Termine werden hervorgehoben, weil sie zu deinen ausgewählten Interessenschwerpunkten passen. Das ist keine politische Empfehlung.'
                : 'Einige Termine werden hervorgehoben, weil sie zu Ihren ausgewählten Interessenschwerpunkten passen. Dies ist keine politische Empfehlung.'}
            </p>
          ) : null}
          {!hasTopicHighlighting ? (
            <p className="mb-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] leading-snug text-slate-700">
              {duMode
                ? 'Du kannst Interessenschwerpunkte im Politikbarometer setzen, um passende Termine im Kalender hervorzuheben.'
                : 'Sie können Interessenschwerpunkte im Politikbarometer setzen, um passende Termine im Kalender hervorzuheben.'}
            </p>
          ) : null}
          {sortedEventsForList.length > 0 ? (
            <div className="space-y-1">
              {sortedEventsForList.map(({ day, event, card }, idx) => {
                const matchedPreferenceKeys = getMatchedPreferenceKeys(card, priorities);
                const isPriority = matchedPreferenceKeys.length > 0;
                const relevanceReason = getRelevanceReason(matchedPreferenceKeys, duMode);
                const typeLabel = event.kind === 'wahl' ? 'Wahl' : 'Abstimmung';
                return (
                  <button
                    key={`${event.cardId}-${day}-${idx}`}
                    onClick={() => handleEventClick(event)}
                    className={`w-full rounded-lg px-3 py-2 text-left hover:bg-gray-50 transition border border-neutral-200 ${
                      isPriority ? 'ring-1 ring-emerald-300' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {/* Typ (primär): Fill vs Outline */}
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={
                              event.kind === 'wahl'
                                ? { background: LEVEL_COLOR[event.level].solid }
                                : { border: `1px solid ${LEVEL_COLOR[event.level].border}`, background: 'transparent' }
                            }
                            aria-hidden
                          />
                          <span className="text-[10px] font-bold text-neutral-700">{typeLabel}</span>
                          {/* Ebene (sekundär): Label */}
                          <span className="text-[10px] font-semibold text-neutral-600">{LEVEL_LABEL[event.level]}</span>
                          <span className="text-[10px] text-neutral-500">
                            {day}. {currentMonth.name}
                          </span>
                          {isPriority && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              Thematisch relevant
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-neutral-900 line-clamp-1">
                          {event.title}
                        </div>
                        {isPriority ? (
                          <p className="mt-1 text-[10px] leading-snug text-slate-700">
                            {relevanceReason} Keine Empfehlung · nur thematische Relevanz.
                          </p>
                        ) : null}
                      </div>
                      <span className="text-[10px] font-semibold text-neutral-400 mt-1 flex-shrink-0">Details</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-[11px] text-gray-600">Keine Termine in {currentMonth.name} {currentYear}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;
