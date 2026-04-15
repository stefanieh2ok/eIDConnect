'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import { HESSEN_CALENDAR_LOCATION_IDS, HESSEN_KREIS_MENU_LABELS } from '@/data/hessenKreis';
import { BW_CALENDAR_LOCATION_IDS, BW_KREIS_MENU_LABELS } from '@/data/badenWuerttembergKreis';

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
  type: string;
  title: string;
  cardId?: string;
  location: string;
}

interface CalendarSectionProps {
  votingData?: Record<string, { items: any[] }>;
  currentLocation?: string;
  priorities?: Record<string, number>;
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

/** Prüft, ob Stichtag (DD.MM.YYYY) bereits abgelaufen ist. */
function isDeadlinePassed(deadline: string): boolean {
  const parts = deadline.trim().split(/\./);
  if (parts.length !== 3) return false;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return false;
  const deadlineEnd = new Date(y, m - 1, d, 23, 59, 59);
  return Date.now() > deadlineEnd.getTime();
}

const LEGEND_CONFIG: Record<string, { label: string; points: string; bg: string }> = {
  bund: { label: 'Bund', points: '+500 Punkte', bg: 'bg-slate-500' },
  land: { label: 'Land', points: '+250-300 Punkte', bg: 'bg-blue-900' },
  kreis: { label: 'Kreis', points: '+200 Punkte', bg: 'bg-blue-500' },
  kommune: { label: 'Kommune', points: '+100-150 Punkte', bg: 'bg-blue-400' }
};
const LEVEL_ORDER = ['bund', 'land', 'kreis', 'kommune'];

function getEventMarkerClasses(type: string) {
  if (type === 'bundesweit' || type === 'bund') {
    return {
      cell: 'bg-slate-500 text-white font-bold hover:bg-slate-600 ring-2 ring-slate-300/70',
      dot: 'bg-white border border-slate-200',
    };
  }
  if (type === 'saarland' || type === 'land') {
    return {
      cell: 'bg-blue-900 text-white font-bold hover:bg-blue-800 ring-2 ring-blue-300/70',
      dot: 'bg-white border border-blue-200',
    };
  }
  if (type === 'saarpfalz' || type === 'kreis') {
    return {
      cell: 'bg-blue-500 text-white font-bold hover:bg-blue-600 ring-2 ring-blue-200/80',
      dot: 'bg-white border border-blue-100',
    };
  }
  return {
    cell: 'bg-blue-400 text-white font-bold hover:bg-blue-500 ring-2 ring-sky-200/80',
    dot: 'bg-white border border-sky-100',
  };
}

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

  const currentMonth = MONTHS[currentMonthIndex];
  
  // Kalender ausschließlich aus echten Abstimmungsdaten ableiten – keine separaten Daten, keine Halluzination
  const calendarDataFromVoting = React.useMemo(() => {
    const data: Record<number, Record<string, Record<number, CalendarEvent>>> = {};
    const voting = propVotingData || VOTING_DATA;
    const locationToType: Record<string, string> = {
      deutschland: 'bundesweit', saarland: 'saarland', saarpfalz: 'saarpfalz', kirkel: 'kirkel',
      hessen: 'saarland', 'rheinland-pfalz': 'saarland', 'baden-wuerttemberg': 'saarland',
      neunkirchen: 'kreis', merzig_wadern: 'kreis', saarlouis: 'kreis', st_wendel: 'kreis', rv_saarbruecken: 'kreis',
      homburg: 'kommune', saarbruecken: 'kommune', voelklingen: 'kommune',
      mannheim: 'kommune', heidelberg: 'kommune', weinheim: 'kommune', viernheim: 'kommune',
      neustadt: 'kommune', bremen: 'kommune', berlin: 'kommune', frankfurt: 'kommune',
      kommune: 'kommune',
      ...HESSEN_CAL_TYPES,
      ...BW_CAL_TYPES,
    };
    const locations = [
      'deutschland', 'saarland', 'hessen', 'rheinland-pfalz', 'baden-wuerttemberg',
      'saarpfalz', 'neunkirchen', 'merzig_wadern', 'saarlouis', 'st_wendel', 'rv_saarbruecken',
      'kirkel', 'homburg', 'saarbruecken', 'voelklingen', 'mannheim', 'heidelberg', 'weinheim', 'viernheim', 'neustadt',
      'bremen', 'berlin', 'frankfurt', 'kommune',
      ...HESSEN_CALENDAR_LOCATION_IDS,
      ...BW_CALENDAR_LOCATION_IDS,
    ];
    for (const loc of locations) {
      const locData = voting[loc];
      const list = locData && 'items' in locData && Array.isArray(locData.items) ? locData.items : (locData && 'cards' in locData && Array.isArray(locData.cards) ? locData.cards : null);
      if (!list) continue;
      for (const item of list) {
        const deadline = (item.deadline || '').trim();
        const parts = deadline.split(/\./);
        if (parts.length !== 3) continue;
        const [d, m, y] = parts.map(Number);
        if (!d || !m || !y || m < 1 || m > 12) continue;
        const year = y;
        const monthKey = MONTHS[m - 1]?.key;
        if (!monthKey) continue;
        const day = Math.min(d, MONTHS[m - 1].days);
        if (!data[year]) data[year] = {};
        if (!data[year][monthKey]) data[year][monthKey] = {};
        if (!data[year][monthKey][day]) {
          data[year][monthKey][day] = {
            type: locationToType[loc] ?? 'bundesweit',
            title: item.title || 'Abstimmung',
            cardId: item.id,
            location: loc
          };
        }
      }
    }
    return data;
  }, [propVotingData]);

  const calendarData = calendarDataFromVoting[currentYear] ?? {};
  const votingDataToUse = propVotingData || VOTING_DATA;

  // Alle Abstimmungen des aktuellen Monats (Bund, Land, Kreis, Kommune) – nur aus votingData, sortiert nach Tag
  const allEventsThisMonth = React.useMemo(() => {
    const out: Array<{ day: number; event: CalendarEvent; card: any }> = [];
    const voting = propVotingData || VOTING_DATA;
    const locationToType: Record<string, string> = {
      deutschland: 'bundesweit', saarland: 'saarland', saarpfalz: 'saarpfalz', kirkel: 'kirkel',
      hessen: 'saarland', 'rheinland-pfalz': 'saarland', 'baden-wuerttemberg': 'saarland',
      neunkirchen: 'kreis', merzig_wadern: 'kreis', saarlouis: 'kreis', st_wendel: 'kreis', rv_saarbruecken: 'kreis',
      homburg: 'kommune', saarbruecken: 'kommune', voelklingen: 'kommune',
      mannheim: 'kommune', heidelberg: 'kommune', weinheim: 'kommune', viernheim: 'kommune',
      neustadt: 'kommune', bremen: 'kommune', berlin: 'kommune', frankfurt: 'kommune',
      kommune: 'kommune',
      ...HESSEN_CAL_TYPES,
      ...BW_CAL_TYPES,
    };
    const monthKey = currentMonth.key;
    const monthNum = currentMonthIndex + 1;
    const locs = [
      'deutschland', 'saarland', 'hessen', 'rheinland-pfalz', 'baden-wuerttemberg',
      'saarpfalz', 'neunkirchen', 'merzig_wadern', 'saarlouis', 'st_wendel', 'rv_saarbruecken',
      'kirkel', 'homburg', 'saarbruecken', 'voelklingen', 'mannheim', 'heidelberg', 'weinheim', 'viernheim', 'neustadt',
      'bremen', 'berlin', 'frankfurt', 'kommune',
      ...HESSEN_CALENDAR_LOCATION_IDS,
      ...BW_CALENDAR_LOCATION_IDS,
    ];
    locs.forEach(loc => {
      const locData = voting[loc];
      const list = locData && 'items' in locData && Array.isArray(locData.items) ? locData.items : (locData && 'cards' in locData && Array.isArray(locData.cards) ? locData.cards : null);
      if (!list) return;
      list.forEach((item: any) => {
        const deadline = (item.deadline || '').trim();
        const parts = deadline.split(/\./);
        if (parts.length !== 3) return;
        const [d, m, y] = parts.map(Number);
        if (!d || !m || !y || m !== monthNum || y !== currentYear) return;
        const day = Math.min(d, currentMonth.days);
        out.push({
          day,
          event: {
            type: locationToType[loc] ?? 'bundesweit',
            title: item.title || 'Abstimmung',
            cardId: item.id,
            location: loc
          },
          card: item
        });
      });
    });
    out.sort((a, b) => a.day - b.day);
    return out;
  }, [propVotingData, currentYear, currentMonthIndex, currentMonth.key, currentMonth.days]);
  
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
  
  const currentLocationKey = propLocation || state.activeLocation || 'deutschland';
  const mappedLocation = locationMap[currentLocationKey] || currentLocationKey;

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick && event.cardId) {
      onEventClick({ location: event.location, cardId: event.cardId });
    }
    dispatch({ type: 'SET_ACTIVE_LOCATION', payload: event.location as any });
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
    const event = calendarData[currentMonth.key]?.[day];
    if (event) handleEventClick(event);
  };

  const nextMonth = () => {
    setCurrentMonthIndex((prev) => (prev + 1) % MONTHS.length);
  };

  const prevMonth = () => {
    setCurrentMonthIndex((prev) => (prev - 1 + MONTHS.length) % MONTHS.length);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (currentMonthIndex === 0) {
              setCurrentYear(prev => prev - 1);
              setCurrentMonthIndex(11);
            } else {
              setCurrentMonthIndex(prev => prev - 1);
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{currentMonth.name} {currentYear}</h2>
          <div className="flex gap-1">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
              <button
                key={y}
                onClick={() => setCurrentYear(y)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                  currentYear === y ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
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
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Nächster Monat"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="bg-white rounded-2xl p-4 shadow-sm">
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
            const event = calendarData[currentMonth.key]?.[day];
            
            return (
              <button
                key={i}
                onClick={() => event && handleCalendarClick(day)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
                  event
                    ? `${getEventMarkerClasses(event.type).cell} cursor-pointer`
                    : 'bg-gray-50 text-gray-700'
                }`}
                aria-label={event ? `${event.title} am ${day}. ${currentMonth.name}` : `Tag ${day}`}
              >
                <div>{day}</div>
                {event ? (
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full ${getEventMarkerClasses(event.type).dot}`} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-base font-bold text-gray-900 mb-3">Legende</h3>
        <div className="space-y-2">
          {showAllLegend
            ? LEVEL_ORDER.map(level => {
                const c = LEGEND_CONFIG[level];
                return (
                  <div key={level} className="flex items-center gap-2">
                    <div className={`w-6 h-6 ${c.bg} rounded flex-shrink-0`}></div>
                    <span className="text-sm font-medium">{c.label} • {c.points}</span>
                  </div>
                );
              })
            : legendLevels.map(({ level, label, points, bg }) => (
                <div key={level} className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${bg} rounded flex-shrink-0`}></div>
                  <span className="text-sm font-medium">{label} • {points}</span>
                </div>
              ))}
        </div>

        <div className="mt-6">
          <h3 className="text-base font-bold text-gray-900 mb-2 mt-4">Abstimmungen im {currentMonth.name} {currentYear}</h3>
          <p className="text-[10px] text-gray-600 mb-4">Nur Einträge aus den Stichtagen der App (Bund, Land, Kreis, Kommune). Einträge mit <span className="inline-block px-1.5 py-0.5 rounded border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-medium">Rahmen</span> wurden basierend auf Ihrem Politik-Barometer priorisiert.</p>
          {allEventsThisMonth.length > 0 ? (
            <div className="space-y-2">
              {allEventsThisMonth.map(({ day, event, card }, idx) => {
                const getTypeInfo = (type: string) => {
                  if (type === 'bundesweit' || type === 'bund') return { label: 'BUND', borderColor: 'border-slate-500', bgColor: 'bg-slate-500', textColor: 'text-white' };
                  if (type === 'saarland' || type === 'land') return { label: 'LAND', borderColor: 'border-blue-900', bgColor: 'bg-blue-900', textColor: 'text-white' };
                  if (type === 'saarpfalz' || type === 'kreis') return { label: 'KREIS', borderColor: 'border-blue-500', bgColor: 'bg-blue-500', textColor: 'text-white' };
                  return { label: 'KOMMUNE', borderColor: 'border-blue-400', bgColor: 'bg-blue-400', textColor: 'text-white' };
                };
                const typeInfo = getTypeInfo(event.type);
                const isPriority = Boolean(priorities && card?.theme && (priorities[card.theme] ?? 0) >= PRIORITY_THRESHOLD);
                return (
                  <button
                    key={`${event.cardId}-${day}-${idx}`}
                    onClick={() => handleEventClick(event)}
                    className={`w-full rounded-lg p-3 border-l-4 text-left hover:shadow-md transition-all ${typeInfo.borderColor} ${
                      isPriority ? 'bg-emerald-50 border-2 border-emerald-500 ring-2 ring-emerald-300 shadow-sm' : 'bg-white border-r border-t border-b border-gray-100'
                    }`}
                  >
                        <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${typeInfo.bgColor} ${typeInfo.textColor}`}>{typeInfo.label}</span>
                          {isPriority && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">Priorisiert</span>}
                          <span className="text-xs text-gray-600">{day}. {currentMonth.name} {currentYear}</span>
                        </div>
                        <div className="text-sm font-bold mb-1">{event.title}</div>
                        {card && (
                          <div className="text-xs text-gray-700 space-y-0.5 mt-1">
                            {(card.description || card.desc) && <p className="line-clamp-2">{(card.description || card.desc)}</p>}
                            {card.deadline && (
                              <p className={isDeadlinePassed(card.deadline) ? 'text-gray-500 font-semibold' : 'text-gray-600 font-semibold'}>
                                📅 {isDeadlinePassed(card.deadline) ? `Stichtag war der ${card.deadline} (abgelaufen)` : `Stichtag: ${card.deadline}`}
                              </p>
                            )}
                            {card.category && <p className="text-gray-600">🏷️ {card.category}</p>}
                            {card.points && <p className="text-gray-600 font-semibold">💰 +{card.points} Punkte</p>}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={24} className="text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-[11px] text-gray-600">Keine Abstimmungen mit Stichtag in {currentMonth.name} {currentYear} (nur Daten aus Bund, Land, Kreis, Kommune).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;
