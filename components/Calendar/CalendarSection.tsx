'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { VOTING_DATA } from '@/data/constants';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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

const CalendarSection: React.FC<CalendarSectionProps> = ({ votingData: propVotingData, currentLocation: propLocation, priorities, menuItems }) => {
  const legendLevels = React.useMemo(() => {
    const levels = new Set((menuItems || []).map(m => m.level));
    return LEVEL_ORDER.filter(l => levels.has(l)).map(level => ({ level, ...LEGEND_CONFIG[level] }));
  }, [menuItems]);
  const showAllLegend = legendLevels.length === 0;
  const { state, dispatch } = useApp();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // Start bei Oktober (Index 9)
  const [currentYear, setCurrentYear] = useState(2025);

  const currentMonth = MONTHS[currentMonthIndex];
  
  // Kalender ausschließlich aus echten Abstimmungsdaten ableiten – keine separaten Daten, keine Halluzination
  const calendarDataFromVoting = React.useMemo(() => {
    const data: Record<number, Record<string, Record<number, CalendarEvent>>> = {};
    const voting = propVotingData || VOTING_DATA;
    const locationToType: Record<string, 'bundesweit' | 'saarland' | 'saarpfalz' | 'kirkel'> = {
      deutschland: 'bundesweit',
      saarland: 'saarland',
      saarpfalz: 'saarpfalz',
      kirkel: 'kirkel'
    };
    const locations = ['deutschland', 'saarland', 'saarpfalz', 'kirkel'] as const;
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
    const locationToType: Record<string, 'bundesweit' | 'saarland' | 'saarpfalz' | 'kirkel'> = {
      deutschland: 'bundesweit', saarland: 'saarland', saarpfalz: 'saarpfalz', kirkel: 'kirkel'
    };
    const monthKey = currentMonth.key;
    const monthNum = currentMonthIndex + 1;
    (['deutschland', 'saarland', 'saarpfalz', 'kirkel'] as const).forEach(loc => {
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
    'deutschland': 'deutschland',
    'bundesweit': 'deutschland',
    'bund': 'deutschland',
    'saarland': 'saarland',
    'land': 'saarland',
    'saarpfalz': 'saarpfalz',
    'kreis': 'saarpfalz',
    'kirkel': 'kirkel',
    'kommune': 'kirkel'
  };
  
  const currentLocationKey = propLocation || state.activeLocation || 'deutschland';
  const mappedLocation = locationMap[currentLocationKey] || currentLocationKey;

  const handleEventClick = (event: CalendarEvent) => {
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
            <button
              onClick={() => setCurrentYear(2025)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                currentYear === 2025 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              2025
            </button>
            <button
              onClick={() => setCurrentYear(2026)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                currentYear === 2026 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              2026
            </button>
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
            <div key={day} className="text-center text-xs font-semibold text-gray-600 pb-2">
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
                    ? event.type === 'bundesweit'
                      ? 'bg-slate-500 text-white font-bold hover:bg-slate-600 cursor-pointer'
                      : event.type === 'saarland'
                      ? 'bg-blue-900 text-white font-bold hover:bg-blue-800 cursor-pointer'
                      : 'bg-blue-400 text-white font-bold hover:bg-blue-500 cursor-pointer'
                    : 'bg-gray-50 text-gray-700'
                }`}
                aria-label={event ? `${event.title} am ${day}. ${currentMonth.name}` : `Tag ${day}`}
              >
                <div>{day}</div>
                {event && <div className="text-xs mt-0.5">🗳️</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Legende</h3>
        <div className="space-y-3">
          {showAllLegend
            ? LEVEL_ORDER.map(level => {
                const c = LEGEND_CONFIG[level];
                return (
                  <div key={level} className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${c.bg} rounded`}></div>
                    <span className="text-lg font-semibold">{c.label} • {c.points}</span>
                  </div>
                );
              })
            : legendLevels.map(({ level, label, points, bg }) => (
                <div key={level} className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${bg} rounded`}></div>
                  <span className="text-lg font-semibold">{label} • {points}</span>
                </div>
              ))}
        </div>

        <div className="mt-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-6">Abstimmungen im {currentMonth.name} {currentYear}</h3>
          <p className="text-xs text-gray-600 mb-4">Nur Einträge aus den Stichtagen der App (Bund, Land, Kreis, Kommune). Einträge mit <span className="inline-block px-1.5 py-0.5 rounded border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-medium">Rahmen</span> wurden basierend auf Ihrem Politik-Barometer priorisiert.</p>
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
                    className={`w-full rounded-xl p-4 border-l-4 text-left hover:shadow-md transition-all ${typeInfo.borderColor} ${
                      isPriority ? 'bg-emerald-50 border-2 border-emerald-500 ring-2 ring-emerald-300 shadow-sm' : 'bg-white border-r border-t border-b border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-sm font-bold px-3 py-1 rounded ${typeInfo.bgColor} ${typeInfo.textColor}`}>{typeInfo.label}</span>
                          {isPriority && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-200 text-emerald-900">Basierend auf Ihrem Politik-Barometer priorisiert</span>}
                          <span className="text-sm text-gray-600">{day}. {currentMonth.name} {currentYear}</span>
                        </div>
                        <div className="text-xl font-bold mb-2">{event.title}</div>
                        {card && (
                          <div className="text-base text-gray-700 space-y-1 mt-2">
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
              <p className="text-sm text-gray-600">Keine Abstimmungen mit Stichtag in {currentMonth.name} {currentYear} (nur Daten aus Bund, Land, Kreis, Kommune).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;
