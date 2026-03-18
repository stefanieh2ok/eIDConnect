import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Settings, X, ChevronDown, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import StimmzettelModal from '@/components/Modals/StimmzettelModal';
import ElectionsSection from '@/components/Elections/ElectionsSection';
import CalendarSection from '@/components/Calendar/CalendarSection';
import { default as ClaraChat } from '@/components/Clara/ClaraChat';
import ClaraFloatingButton from '@/components/Clara/ClaraFloatingButton';
import { WAHLPROGRAMME_2026 } from '@/data/wahlprogramme2026';
import kreiseData from '@/data/kreise.json';
import { findKreisByCounty, getKreisDisplayName } from '@/data/kreiseLookup';

const KREISE = kreiseData as Array<{ name: string; ags: string; landKey: string }>;
const ANZAHL_KREISE = KREISE.length;
const ANZAHL_KOMMUNEN = 11132; // public/data/gemeinden.json – alle Kommunen Deutschlands

const INTRO_DONE_KEY = 'eidconnect_intro_done';
const CONSENT_PRAEMIEN_KEY = 'eidconnect_consent_praemien';
const MAENGEL_REPORTS_KEY = 'eidconnect_mangel_reports';

/**
 * Standard-Region für Governikus / App wenn keine Adresse eingegeben wird („Nur ansehen“ ohne PLZ/Stadt).
 * Mit Kreis: Saarland → Bund, Land, Saarpfalz-Kreis, Kirkel (volle Demo-Daten für Wahlen/Abstimmungen).
 */
const DEFAULT_STATE_WHEN_NO_ADDRESS = 'saarland';

/**
 * Bezirksebene / Regierungsbezirk (geprüft, Stand: Recherche):
 * - Regierungsbezirk: reine Landesmittelbehörde in NRW (5), Hessen (3), Bayern (7), BW (4).
 *   Quellen: de.wikipedia.org/wiki/Regierungsbezirk
 * - NRW: Regionalrat bei Bezirksregierung wird indirekt besetzt (Proporz aus Kommunalwahlen), keine direkte Bürgerwahl.
 *   Quelle: de.wikipedia.org/wiki/Regionalrat_(Nordrhein-Westfalen)
 * - Bayern: Als Selbstverwaltungskörperschaft existieren 7 Bezirke mit direkt gewählten Bezirkstagen (BezWG).
 *   Quelle: gesetze-bayern.de BayBezWG, wahlrecht.de/kommunal/bayern-bezirkswahlen.html
 * - Hessen/BW: An Regierungsbezirken keine direkten Wahlen/Abstimmungen (reine Verwaltungsebene).
 * - Die App bietet keine Regierungsbezirks-Ebene an. „Kreis“ in der App = Landkreis (Kreistagswahlen, Kommunalwahlen).
 * - Formulierung im Hinweis: soweit auf einer Ebene keine Stimmabgabe stattfindet, nur Statistik, nicht in den Entscheid.
 */
const EBENEN_STATISTIK_HINWEIS = 'Die Zuordnung zu Bund, Land, Kreis und Kommune dient auch der statistischen Auswertung. Soweit auf einer Ebene keine eigene Abstimmung stattfindet, fließt die Anzeige nur in die Statistik ein und nicht in den Entscheid.';
const EBENEN_STATISTIK_KURZ = 'Regionale Zuordnung dient auch der Statistik; soweit keine Abstimmung stattfindet, fließt sie nicht in den Entscheid ein.';

/** Badge-Stufen für Punktestand (neutral, gilt für alle Ebenen) */
const PUNKTE_BADGES: Array<{ min: number; id: string; label: string; short: string; color: string; emoji: string }> = [
  { min: 0, id: 'bronze', label: 'Bronze', short: 'Bronze', color: '#b45309', emoji: '🥉' },
  { min: 1000, id: 'silver', label: 'Silber', short: 'Silber', color: '#6b7280', emoji: '🥈' },
  { min: 2500, id: 'gold', label: 'Gold', short: 'Gold', color: '#ca8a04', emoji: '🥇' },
  { min: 5000, id: 'diamond', label: 'Diamant', short: '◆', color: '#0ea5e9', emoji: '💎' },
].sort((a, b) => b.min - a.min);

function getPunkteBadge(points: number) {
  return PUNKTE_BADGES.find(b => points >= b.min) ?? PUNKTE_BADGES[PUNKTE_BADGES.length - 1];
}

/** Motivationssprüche – rotieren nach (points + votes) für leichte Abwechslung */
const PUNKTE_MOTIVATION: string[] = [
  'Weiter so – jede Stimme zählt!',
  'Du machst mit. Das ist Demokratie.',
  'Dein Engagement lohnt sich.',
  'Bald die nächste Stufe – dranbleiben!',
  'Mit deiner Teilnahme bist du dabei.',
  'Jede Abstimmung bringt dich weiter.',
  'Gut gemacht. Weiter abstimmen!',
  'Deine Stimme hat Gewicht.',
];

function getPunkteMotivation(points: number, votes: number): string {
  const i = (points + votes) % PUNKTE_MOTIVATION.length;
  return PUNKTE_MOTIVATION[i];
}

const STATE_DISPLAY_NAMES: Record<string, string> = {
  'baden-wuerttemberg': 'Baden-Württemberg',
  'bayern': 'Bayern',
  'berlin': 'Berlin',
  'brandenburg': 'Brandenburg',
  'bremen': 'Bremen',
  'hamburg': 'Hamburg',
  'hessen': 'Hessen',
  'mecklenburg-vorpommern': 'Mecklenburg-Vorpommern',
  'niedersachsen': 'Niedersachsen',
  'nordrhein-westfalen': 'Nordrhein-Westfalen',
  'rheinland-pfalz': 'Rheinland-Pfalz',
  'saarland': 'Saarland',
  'sachsen': 'Sachsen',
  'sachsen-anhalt': 'Sachsen-Anhalt',
  'schleswig-holstein': 'Schleswig-Holstein',
  'thueringen': 'Thüringen',
  'deutschland': 'Deutschland'
};

type MangelReport = {
  id: string;
  category: string;
  description: string;
  status: string;
  createdAt: number;
  city?: string;
  district?: string;
  photo?: string;
};

const BuergerApp = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(1);
  const [currentPoints, setCurrentPoints] = useState(2000);
  const [totalVotes, setTotalVotes] = useState(12);
  const [userState, setUserState] = useState(DEFAULT_STATE_WHEN_NO_ADDRESS);
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_STATE_WHEN_NO_ADDRESS);
  const [currentTab, setCurrentTab] = useState('melden');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const locationStripRef = useRef<HTMLDivElement>(null);
  const [locationScroll, setLocationScroll] = useState({ canScrollLeft: false, canScrollRight: false });
  const [votedCards, setVotedCards] = useState<string[]>([]);
  const [ergebnisseZeitraum, setErgebnisseZeitraum] = useState<'3' | '6' | '12'>('12');
  const [showAllErgebnisse, setShowAllErgebnisse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useFormalAddress, setUseFormalAddress] = useState(false);
  const [expandedPolitician, setExpandedPolitician] = useState<string | null>(null);
  const [expandedBallot, setExpandedBallot] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ isDragging: boolean; startX: number; currentX: number; cardId: string | null }>({ isDragging: false, startX: 0, currentX: 0, cardId: null });
  const [selectedMonth, setSelectedMonth] = useState(9);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [viewerMode, setViewerMode] = useState(false);
  const [viewerFirstName, setViewerFirstName] = useState('');
  const [viewerLastName, setViewerLastName] = useState('');
  const [useGoogleAccount, setUseGoogleAccount] = useState(false);
  const [viewerStreet, setViewerStreet] = useState('');
  const [viewerHouseNumber, setViewerHouseNumber] = useState('');
  const [viewerPLZ, setViewerPLZ] = useState('');
  const [viewerCity, setViewerCity] = useState('');
  const [addressErrors, setAddressErrors] = useState<{[key: string]: string}>({});
  const [plzSuggestions, setPlzSuggestions] = useState<string[]>([]);
  const [isPlzSuggesting, setIsPlzSuggesting] = useState(false);
  const [plzSuggestError, setPlzSuggestError] = useState<string | null>(null);
  const [showPlzSuggestions, setShowPlzSuggestions] = useState(false);
  const [resolvedRegion, setResolvedRegion] = useState<{
    country?: string;
    postcode?: string;
    stateName?: string;
    county?: string;
    city?: string;
    municipality?: string;
    suburb?: string;
    displayName?: string;
    lat?: string;
    lon?: string;
  } | null>(null);
  const [isResolvingRegion, setIsResolvingRegion] = useState(false);
  const [regionResolveError, setRegionResolveError] = useState<string | null>(null);
  const [priorities, setPriorities] = useState({
    umwelt: 50,
    wirtschaft: 50,
    bildung: 50,
    digitalisierung: 50,
    soziales: 50,
    sicherheit: 50
  });
  const [consentPraemien, setConsentPraemienState] = useState(false);
  const setConsentPraemien = (value: boolean) => {
    setConsentPraemienState(value);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(CONSENT_PRAEMIEN_KEY, value ? 'true' : 'false'); } catch (_) {}
    }
  };
  const [showTeilnahmebescheinigung, setShowTeilnahmebescheinigung] = useState(false);
  const [showKryptoDummies, setShowKryptoDummies] = useState(false);
  const [showNurAnsehenClosed, setShowNurAnsehenClosed] = useState(false);
  const [showNurAnsehenModal, setShowNurAnsehenModal] = useState(false);
  const [showStimmeAnleitung, setShowStimmeAnleitung] = useState(() => {
    if (typeof window === 'undefined') return true;
    try { return !sessionStorage.getItem('eidconnect_stimme_anleitung_closed'); } catch { return true; }
  });
  const [mangelReports, setMangelReportsState] = useState<MangelReport[]>([]);
  const setMangelReports = (next: MangelReport[] | ((prev: MangelReport[]) => MangelReport[])) => {
    setMangelReportsState(prev => {
      const list = typeof next === 'function' ? next(prev) : next;
      try { if (typeof window !== 'undefined') localStorage.setItem(MAENGEL_REPORTS_KEY, JSON.stringify(list)); } catch (_) {}
      return list;
    });
  };
  const [meldenCategory, setMeldenCategory] = useState('');
  const [meldenDescription, setMeldenDescription] = useState('');
  const [meldenPhoto, setMeldenPhoto] = useState<string | null>(null);
  const [meldenSuccess, setMeldenSuccess] = useState(false);

  const MAENGEL_CATEGORIES = [
    { id: 'beleuchtung', label: 'Beleuchtung' },
    { id: 'schlagloch', label: 'Schlagloch / Straße' },
    { id: 'muell', label: 'Müll' },
    { id: 'gruen', label: 'Grünflächen' },
    { id: 'sonstiges', label: 'Sonstiges' }
  ];
  const MELDEN_MAX_PRO_STUNDE = 5;
  const MELDEN_POINTS = 50; // Punkte pro bestätigte Meldung

  const candidates = {
    deutschland: [
      {
        id: 'b1',
        name: 'Friedrich Merz',
        party: 'CDU',
        age: 68,
        emoji: '👨‍💼',
        tags: ['Wirtschaft', 'Mittelstand']
      },
      {
        id: 'b2',
        name: 'Olaf Scholz',
        party: 'SPD',
        age: 66,
        emoji: '👨‍💼',
        tags: ['Soziale Sicherheit', 'Europa']
      }
    ],
    saarland: [
      {
        id: 'c1',
        name: 'Anke Rehlinger',
        party: 'SPD',
        age: 48,
        emoji: '👩‍💼',
        tags: ['Mindestlohn 15€', 'Klimaschutz']
      },
      {
        id: 'c2',
        name: 'Peter Altmaier',
        party: 'CDU',
        age: 66,
        emoji: '👨‍💼',
        tags: ['Marktwirtschaft', 'Europa']
      }
    ],
    neunkirchen: [
      {
        id: 'nk1',
        name: 'Klaus Müller',
        party: 'SPD',
        age: 52,
        emoji: '👨‍💼',
        tags: ['Gesundheit', 'Infrastruktur']
      },
      {
        id: 'nk2',
        name: 'Andrea Schmidt',
        party: 'CDU',
        age: 47,
        emoji: '👩‍💼',
        tags: ['Wirtschaft', 'Familie']
      }
    ],
    kirkel: [
      {
        id: 'k1',
        name: 'Frank John',
        party: 'CDU',
        age: 54,
        emoji: '👨',
        tags: ['Gemeinde stärken', 'Infrastruktur']
      },
      {
        id: 'k2',
        name: 'Sarah Weber',
        party: 'Grüne',
        age: 42,
        emoji: '👩',
        tags: ['Nachhaltigkeit', 'Familie']
      }
    ]
  };

  const votingData = {
    deutschland: {
      items: [
        {
          id: 'd1',
          theme: 'digitalisierung',
          title: 'Digitalsteuer für Tech-Konzerne',
          desc: '5% Umsatzsteuer für digitale Dienstleistungen ab 2026',
          deadline: '15.10.2025',
          yes: 62,
          no: 33,
          votes: 4287432,
          points: 500,
          urgent: false,
          claraPro: 'Stärkt digitale Souveränität und schafft faire Wettbewerbsbedingungen für europäische Unternehmen.',
          claraCon: 'Könnte zu Preissteigerungen für Verbraucher führen und internationale Handelskonflikte verschärfen.',
          sources: [
            { title: 'Bundesfinanzministerium: Digitalsteuer-Konzept 2025', url: 'bmf.de' },
            { title: 'ifo Institut: Wirtschaftliche Folgen', url: 'ifo.de' }
          ]
        },
        {
          id: 'd2',
          theme: 'umwelt',
          title: 'Tempolimit 130 km/h auf Autobahnen',
          desc: 'Generelles Tempolimit auf allen deutschen Autobahnen',
          deadline: '22.10.2025',
          yes: 58,
          no: 38,
          votes: 5293847,
          points: 500,
          urgent: false,
          claraPro: 'Reduziert CO2-Emissionen um 2,6 Mio. Tonnen jährlich und senkt Unfallzahlen signifikant.',
          claraCon: 'Eingriff in persönliche Freiheit, fraglicher Klimaeffekt bei nur 2% der Gesamtemissionen.',
          sources: [
            { title: 'Umweltbundesamt: Klimaschutz durch Tempolimit', url: 'uba.de' },
            { title: 'ADAC: Verkehrssicherheit-Studie', url: 'adac.de' }
          ]
        },
        {
          id: 'd3',
          theme: 'wirtschaft',
          title: 'Vermögenssteuer ab 2 Millionen Euro',
          desc: '1% Vermögenssteuer ab 2 Millionen Euro Nettovermögen',
          deadline: '28.10.2025',
          yes: 67,
          no: 33,
          votes: 4127891,
          points: 500,
          urgent: false,
          claraPro: 'Umverteilung für Infrastruktur, 15-20 Mrd. € Staatseinnahmen jährlich.',
          claraCon: 'Risiko von Kapitalflucht, mögliche Verlagerung ins Ausland.',
          sources: [
            { title: 'DIW Wochenbericht: Vermögensverteilung 2024', url: 'diw.de' },
            { title: 'BMF: Steuerschätzung 2024', url: 'bmf.de' }
          ]
        },
        {
          id: 'd4',
          theme: 'umwelt',
          title: 'Atomkraft-Ausstieg final',
          desc: 'Finaler Ausstieg aus Atomenergie, Stilllegung aller Meiler bis 2028',
          deadline: '30.10.2025',
          yes: 71,
          no: 24,
          votes: 4567892,
          points: 500,
          urgent: false,
          claraPro: 'Kein Atomrisiko, Fokus auf 100% Erneuerbare Energien.',
          claraCon: 'Energiekosten könnten sich erhöhen, Stromversorgungssicherheit.',
          sources: [
            { title: 'BMU: Atomausstieg-Plan 2024', url: 'bmu.de' },
            { title: 'Agora Energiewende: Stromwende 2024', url: 'agora.de' }
          ]
        },
        {
          id: 'd5',
          theme: 'soziales',
          title: 'Grundrente auf 1.250€ erhöhen',
          desc: 'Grundrente auf 1.250€ erhöhen, automatische Anpassung an Inflation',
          deadline: '05.11.2025',
          yes: 68,
          no: 27,
          votes: 4893176,
          points: 500,
          urgent: false,
          claraPro: 'Altersarmut reduzieren, 5 Mrd. € mehr für Rentner.',
          claraCon: 'Finanzierung unsicher, Belastung für Beitragszahler.',
          sources: [
            { title: 'DIW: Altersarmut-Studie 2024', url: 'diw.de' },
            { title: 'Bundesamt: Rentenstatistik 2024', url: 'destatis.de' }
          ]
        }
      ]
    },
    saarland: {
      items: [
        {
          id: 's1',
          title: '365€ Jugendticket Saarland',
          desc: 'Kostenfreie Nutzung für alle Jugendlichen bis 18',
          deadline: '20.09.2025',
          yes: 76,
          no: 21,
          votes: 187423,
          points: 250,
          urgent: false,
          claraPro: 'Reduziert Bildungsungleichheit, entlastet Familien um 40-60€/Monat, fördert ÖPNV-Nutzung.',
          claraCon: 'Kosten von 12 Mio. €/Jahr, könnte zu Überfüllung in Stoßzeiten führen.',
          sources: [
            { title: 'Ministerium für Bildung SL', url: 'bildung.saarland.de' },
            { title: 'Verkehrsverbund Saar: Kostenkalkulation', url: 'saarVV.de' }
          ],
          result: { approved: true, date: '20.09.2025' }
        },
        {
          id: 's2',
          theme: 'umwelt',
          title: 'Solar-Pflicht Neubauten',
          desc: 'Verpflichtende Solaranlagen ab 2026',
          deadline: '20.10.2025',
          yes: 65,
          no: 30,
          votes: 98234,
          points: 250,
          urgent: false,
          claraPro: 'Beschleunigt Energiewende, amortisiert sich nach 8-10 Jahren, steigert Immobilienwert.',
          claraCon: 'Höhere Baukosten (+10-15k€), Bürokratie, nicht alle Dächer geeignet.',
          sources: [
            { title: 'Umweltministerium SL: Solarpflicht', url: 'umwelt.saarland.de' },
            { title: 'Fraunhofer ISE: Kosten-Nutzen-Analyse', url: 'ise.fraunhofer.de' }
          ]
        },
        {
          id: 's3',
          title: 'Kita-Gebühren abschaffen',
          desc: 'Kostenfreie Kita-Plätze für alle Kinder ab 2026',
          deadline: '25.10.2025',
          yes: 72,
          no: 24,
          votes: 234156,
          points: 300,
          urgent: false,
          claraPro: 'Entlastet Familien finanziell, fördert frühkindliche Bildung, mehr Chancengleichheit.',
          claraCon: 'Kosten 180 Mio. €/Jahr, mögliche Qualitätsprobleme bei mehr Kindern.',
          sources: [
            { title: 'Sozialministerium SL: Kita-Konzept', url: 'soziales.saarland.de' },
            { title: 'Bertelsmann Stiftung: Kita-Studie', url: 'bertelsmann.de' }
          ]
        },
        {
          id: 's4',
          theme: 'bildung',
          title: 'Hochschulzugang erweitern',
          desc: 'Mehr Studienplätze an Universität des Saarlandes',
          deadline: '01.11.2025',
          yes: 58,
          no: 38,
          votes: 156789,
          points: 250,
          urgent: false,
          claraPro: 'Mehr Bildungsgerechtigkeit, mehr Akademiker, stärkt Wirtschaft.',
          claraCon: 'Kosten 25 Mio. €/Jahr, Qualität könnte leiden.',
          sources: [
            { title: 'Bildungsministerium SL: Hochschulkonzept', url: 'bildung.saarland.de' },
            { title: 'Uni Saarland: Kapazitätsplanung', url: 'uni-saarland.de' }
          ]
        },
        {
          id: 's5',
          title: 'Windkraft-Ausbau beschleunigen',
          desc: '100 neue Windräder bis 2030, Flächen bereitstellen',
          deadline: '08.11.2025',
          yes: 63,
          no: 32,
          votes: 198456,
          points: 300,
          urgent: false,
          claraPro: 'Klimaziele erreichen, regionale Wertschöpfung, Energieunabhängigkeit.',
          claraCon: 'Landschaftsbild beeinträchtigt, Lärmbelästigung, Bürgerproteste.',
          sources: [
            { title: 'Umweltministerium SL: Windkraft-Plan', url: 'umwelt.saarland.de' },
            { title: 'BWE: Windenergie Saarland', url: 'wind-energie.de' }
          ]
        }
      ]
    },
    saarpfalz: {
      items: [
        {
          id: 'sp1',
          theme: 'soziales',
          title: 'Kreisklinikum Modernisierung',
          desc: '25 Mio. € für Sanierung und neue Notaufnahme',
          deadline: '12.10.2025',
          yes: 72,
          no: 24,
          votes: 45892,
          points: 200,
          urgent: false,
          claraPro: 'Moderne medizinische Versorgung, kürzere Wartezeiten, 150 neue Arbeitsplätze.',
          claraCon: 'Hohe Investition, Bauzeit 3 Jahre, mögliche Steuererhöhung.',
          sources: [
            { title: 'Landkreis Saarpfalz: Klinikkonzept 2025', url: 'saarpfalz-kreis.de' }
          ]
        },
        {
          id: 'sp2',
          title: 'Radwegenetz Kreisstraßen',
          desc: 'Ausbau Radwege entlang aller Kreisstraßen',
          deadline: '28.10.2025',
          yes: 68,
          no: 28,
          votes: 38421,
          points: 200,
          urgent: false,
          claraPro: 'Sicherer Radverkehr, Klimaschutz, Tourismus-Förderung.',
          claraCon: 'Kosten 8 Mio. €, Bauzeit bis 2028, Verkehrsbehinderungen.',
          sources: [
            { title: 'ADFC Saarland: Radwegekonzept', url: 'adfc-saarland.de' }
          ]
        },
        {
          id: 'sp3',
          theme: 'digitalisierung',
          title: 'Wasserversorgung digitalisieren',
          desc: 'Smart Meter für alle Haushalte, Leckage-Erkennung',
          deadline: '15.11.2025',
          yes: 61,
          no: 35,
          votes: 42356,
          points: 200,
          urgent: false,
          claraPro: 'Wasserverlust reduzieren, Kosten sparen, frühzeitige Schadenserkennung.',
          claraCon: 'Investition 5 Mio. €, Datenschutzbedenken, Technikprobleme.',
          sources: [
            { title: 'Kreiswerke Saarpfalz: Digitalisierung', url: 'kreiswerke-saarpfalz.de' }
          ]
        },
        {
          id: 'sp4',
          title: 'Regionale Wirtschaftsförderung',
          desc: '5 Mio. € Fördertopf für lokale Unternehmen',
          deadline: '22.11.2025',
          yes: 74,
          no: 22,
          votes: 38947,
          points: 200,
          urgent: false,
          claraPro: 'Schafft Arbeitsplätze, stärkt Mittelstand, regionale Wertschöpfung.',
          claraCon: 'Fördergelder könnten ungleich verteilt werden, Bürokratie.',
          sources: [
            { title: 'Wirtschaftsförderung Saarpfalz', url: 'wfg-saarpfalz.de' }
          ]
        },
        {
          id: 'sp5',
          theme: 'bildung',
          title: 'Kreismuseen Jahreskarte',
          desc: 'Kostenlose Jahreskarte für alle Kreisbewohner',
          deadline: '29.11.2025',
          yes: 82,
          no: 15,
          votes: 52134,
          points: 150,
          urgent: false,
          claraPro: 'Kultur für alle zugänglich, steigert Besucherzahlen, Bildungsauftrag.',
          claraCon: 'Kosten 2 Mio. €/Jahr, mögliche Überfüllung an Wochenenden.',
          sources: [
            { title: 'Kreisverwaltung: Kulturkonzept', url: 'saarpfalz-kreis.de' }
          ]
        }
      ]
    },
    neunkirchen: {
      items: [
        {
          id: 'n1',
          title: 'Kreisklinikum Modernisierung',
          desc: '25 Mio. € für Sanierung und neue Notaufnahme',
          deadline: '12.10.2025',
          yes: 72,
          no: 24,
          votes: 45892,
          points: 200,
          urgent: false,
          claraPro: 'Moderne medizinische Versorgung, kürzere Wartezeiten, 150 neue Arbeitsplätze.',
          claraCon: 'Hohe Investition, Bauzeit 3 Jahre, mögliche Steuererhöhung.',
          sources: [
            { title: 'Landkreis Neunkirchen: Klinikkonzept 2025', url: 'landkreis-neunkirchen.de' }
          ]
        },
        {
          id: 'n2',
          theme: 'umwelt',
          title: 'Radwegenetz Kreisstraßen',
          desc: 'Ausbau Radwege entlang aller Kreisstraßen',
          deadline: '28.10.2025',
          yes: 68,
          no: 28,
          votes: 38421,
          points: 200,
          urgent: false,
          claraPro: 'Sicherer Radverkehr, Klimaschutz, Tourismus-Förderung.',
          claraCon: 'Kosten 8 Mio. €, Bauzeit bis 2028, Verkehrsbehinderungen.',
          sources: [
            { title: 'ADFC Saarland: Radwegekonzept', url: 'adfc-saarland.de' }
          ]
        }
      ]
    },
    kirkel: {
      items: [
        {
          id: 'k1',
          theme: 'soziales',
          title: 'Spielplatz Kirchbergstraße',
          desc: '180.000€ für barrierefreien Spielplatz',
          deadline: '05.10.2025',
          yes: 89,
          no: 8,
          votes: 1247,
          points: 100,
          urgent: true,
          claraPro: 'Inklusion, moderne Spielgeräte, Schattenbereiche für Sommertage.',
          claraCon: 'Hohe Investition für kleine Kommune, laufende Wartungskosten.',
          sources: [
            { title: 'Gemeinderat Kirkel: Beschlussvorlage 2025/08', url: 'kirkel.de' }
          ]
        },
        {
          id: 'k2',
          title: 'LED-Straßenbeleuchtung',
          desc: 'Umrüstung mit 85% weniger Stromverbrauch',
          deadline: '18.10.2025',
          yes: 76,
          no: 19,
          votes: 892,
          points: 100,
          urgent: false,
          claraPro: 'Amortisiert nach 4 Jahren, CO2-Reduktion, bessere Lichtqualität.',
          claraCon: 'Investition von 120.000€, mögliche Lichtimmission.',
          sources: [
            { title: 'Gemeinde Kirkel: Energiekonzept', url: 'kirkel.de' }
          ]
        },
        {
          id: 'k3',
          theme: 'soziales',
          title: 'Mehrzweckhalle Kirkel-Neuhäusel',
          desc: 'Moderne Veranstaltungshalle mit 600 Plätzen',
          deadline: '25.10.2025',
          yes: 73,
          no: 22,
          votes: 2847,
          points: 150,
          urgent: false,
          claraPro: 'Zentrale Begegnungsstätte, Sport & Kultur, stärkt Gemeinschaft.',
          claraCon: '4,2 Mio. € Budget, 120k€/Jahr Betriebskosten.',
          sources: [
            { title: 'Gemeinderat Kirkel: Mehrzweckhalle', url: 'kirkel.de' }
          ]
        },
        {
          id: 'k4',
          title: 'Radwege-Erweiterung',
          desc: 'Ausbau Radwege in allen Ortsteilen',
          deadline: '01.11.2025',
          yes: 81,
          no: 16,
          votes: 2134,
          points: 120,
          urgent: false,
          claraPro: 'Klimafreundliche Mobilität, Sicherheit, Gesundheit.',
          claraCon: 'Kosten 450.000€, Bauzeit 1 Jahr, Verkehrsbehinderungen.',
          sources: [
            { title: 'Gemeinde Kirkel: Radwegekonzept', url: 'kirkel.de' }
          ]
        },
        {
          id: 'k5',
          theme: 'umwelt',
          title: 'Bürgergarten-Projekt',
          desc: 'Gemeinschaftsgarten für Anwohner, 50 Parzellen',
          deadline: '08.11.2025',
          yes: 85,
          no: 12,
          votes: 1456,
          points: 100,
          urgent: false,
          claraPro: 'Soziales Miteinander, gesunde Ernährung, Naturerfahrung.',
          claraCon: 'Pflegeaufwand, mögliche Konflikte, Wasserkosten.',
          sources: [
            { title: 'Gemeinde Kirkel: Bürgergarten', url: 'kirkel.de' }
          ]
        }
      ]
    }
  };

  const calendarEvents = [
    { date: new Date(2025, 8, 20), title: '365€ Jugendticket', location: 'saarland', approved: true },
    { date: new Date(2025, 9, 5), title: 'Spielplatz', location: 'kirkel' },
    { date: new Date(2025, 9, 12), title: 'Kreisklinikum', location: 'saarpfalz' },
    { date: new Date(2025, 9, 15), title: 'Digitalsteuer', location: 'deutschland' },
    { date: new Date(2025, 9, 18), title: 'LED-Beleuchtung', location: 'kirkel' },
    { date: new Date(2025, 9, 20), title: 'Solar-Pflicht', location: 'saarland' },
    { date: new Date(2025, 9, 22), title: 'Tempolimit', location: 'deutschland' },
    { date: new Date(2025, 9, 28), title: 'Radwegenetz', location: 'saarpfalz' }
  ];

  const normalizeStateKey = (stateName?: string | null) => {
    const s = (stateName || '').toLowerCase().trim();
    const map: Record<string, string> = {
      'baden-württemberg': 'baden-wuerttemberg',
      'baden wuerttemberg': 'baden-wuerttemberg',
      'baden-wuerttemberg': 'baden-wuerttemberg',
      'bayern': 'bayern',
      'bavaria': 'bayern',
      'berlin': 'berlin',
      'brandenburg': 'brandenburg',
      'bremen': 'bremen',
      'hamburg': 'hamburg',
      'hessen': 'hessen',
      'hesse': 'hessen',
      'mecklenburg-vorpommern': 'mecklenburg-vorpommern',
      'mecklenburg vorpommern': 'mecklenburg-vorpommern',
      'mecklenburg–western pomerania': 'mecklenburg-vorpommern',
      'niedersachsen': 'niedersachsen',
      'lower saxony': 'niedersachsen',
      'nordrhein-westfalen': 'nordrhein-westfalen',
      'nordrhein westfalen': 'nordrhein-westfalen',
      'north rhine-westphalia': 'nordrhein-westfalen',
      'rheinland-pfalz': 'rheinland-pfalz',
      'rheinland pfalz': 'rheinland-pfalz',
      'rhineland-palatinate': 'rheinland-pfalz',
      'saarland': 'saarland',
      'sachsen': 'sachsen',
      'saxony': 'sachsen',
      'sachsen-anhalt': 'sachsen-anhalt',
      'sachsen anhalt': 'sachsen-anhalt',
      'saxony-anhalt': 'sachsen-anhalt',
      'schleswig-holstein': 'schleswig-holstein',
      'schleswig holstein': 'schleswig-holstein',
      'thüringen': 'thueringen',
      'thueringen': 'thueringen',
      'thuringia': 'thueringen'
    };
    return map[s] || (s ? s.replace(/\s+/g, '-') : 'deutschland');
  };

  // Farben für bekannte Ebenen (Fallback für dynamische)
  const LOCATION_COLORS: Record<string, string> = {
    deutschland: '#000000',
    saarland: '#4A90E2',
    saarpfalz: '#95A5A6',
    kirkel: '#BDC3C7'
  };
  const CITY_STATES = ['berlin', 'hamburg', 'bremen'];

  // Menü dynamisch aus Wohnort: nur Ebenen anzeigen, die es für diesen Ort gibt
  const menuItems = useMemo(() => {
    const items: Array<{ id: string; name: string; level: string }> = [];
    const stateKey = normalizeStateKey(userState || resolvedRegion?.stateName);
    const county = (resolvedRegion?.county || '').trim();
    const city = (resolvedRegion?.city || resolvedRegion?.municipality || viewerCity || '').trim().toLowerCase();

    // Immer: Bund
    items.push({ id: 'deutschland', name: 'Deutschland', level: 'Bund' });

    // Land: wenn Wohnort in einem Bundesland (nicht nur Bund)
    if (stateKey && stateKey !== 'deutschland') {
      items.push({
        id: stateKey,
        name: STATE_DISPLAY_NAMES[stateKey] || stateKey,
        level: 'Land'
      });
    }

    // Kreis/Bezirk: nur in Flächenländern und wenn Kreis vorhanden; offizieller Name aus Kreise-Liste
    if (county && !CITY_STATES.includes(stateKey || '')) {
      const kreisDisplayName = getKreisDisplayName(county);
      if (stateKey === 'saarland') {
        items.push({
          id: 'saarpfalz',
          name: kreisDisplayName || 'Saarpfalz-Kreis',
          level: 'Kreis'
        });
      } else {
        items.push({ id: 'kreis', name: kreisDisplayName, level: 'Kreis' });
      }
    }

    // Kommune: Flächenländer – wenn Ort/Kommune bekannt (aus Adresse automatisch alles anzeigen)
    if (city && !CITY_STATES.includes(stateKey || '')) {
      const cityName = (resolvedRegion?.city || resolvedRegion?.municipality || viewerCity || '').trim() || county;
      if (cityName) {
        if (stateKey === 'saarland' && (city.includes('kirkel') || county.toLowerCase().includes('saarpfalz'))) {
          items.push({ id: 'kirkel', name: 'Kirkel', level: 'Kommune' });
        } else {
          items.push({ id: 'kommune', name: cityName, level: 'Kommune' });
        }
      }
    }

    // Stadtstaaten (Bremen, Hamburg, Berlin): Kommune anzeigen, wenn Stadt bekannt (z. B. Bremen vs. Bremerhaven)
    if (CITY_STATES.includes(stateKey || '') && city) {
      const cityName = (resolvedRegion?.city || resolvedRegion?.municipality || viewerCity || '').trim();
      if (cityName) items.push({ id: 'kommune', name: cityName, level: 'Kommune' });
    }
    // Ohne Adresse: bei Stadtstaat trotzdem eine Kommune anzeigen (Standard „alles für Bremen“ etc.)
    if (CITY_STATES.includes(stateKey || '') && !city) {
      const defaultCityName = stateKey === 'bremen' ? 'Bremen (Stadt)' : (STATE_DISPLAY_NAMES[stateKey] || stateKey);
      items.push({ id: 'kommune', name: defaultCityName, level: 'Kommune' });
    }

    // Demo Saarland: wenn nur Land gewählt (ohne Adressauflösung), trotzdem Kreis + Kommune anzeigen
    if (stateKey === 'saarland' && !county && items.findIndex(i => i.id === 'saarpfalz') === -1) {
      items.push({ id: 'saarpfalz', name: 'Saarpfalz-Kreis', level: 'Kreis' });
      items.push({ id: 'kirkel', name: 'Kirkel', level: 'Kommune' });
    }

    return items;
  }, [userState, resolvedRegion?.stateName, resolvedRegion?.county, resolvedRegion?.city, resolvedRegion?.municipality, viewerCity]);

  const locations = useMemo(() => {
    const acc: Record<string, { name: string; level: string; color: string; shortName: string }> = {};
    menuItems.forEach(m => {
      acc[m.id] = {
        name: m.name,
        level: m.level,
        color: LOCATION_COLORS[m.id] ?? '#95A5A6',
        shortName: m.level === 'Bezirk' ? 'Kreis' : m.level
      };
    });
    return acc;
  }, [menuItems]);

  // Validierung der Adressfelder
  const validateAddress = () => {
    const errors: {[key: string]: string} = {};
    
    if (!viewerStreet.trim()) {
      errors.street = 'Straße ist erforderlich';
    }
    if (!viewerHouseNumber.trim()) {
      errors.houseNumber = 'Hausnummer ist erforderlich';
    }
    if (!viewerPLZ.trim()) {
      errors.plz = 'Postleitzahl ist erforderlich';
    } else if (!/^\d{5}$/.test(viewerPLZ.trim())) {
      errors.plz = 'Postleitzahl muss 5-stellig sein';
    }
    if (!viewerCity.trim()) {
      errors.city = 'Stadt ist erforderlich';
    }
    
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validierung der Namensfelder
  const validateName = () => {
    if (useGoogleAccount) {
      return true; // Google Account wird später validiert
    }
    return viewerFirstName.trim() !== '' && viewerLastName.trim() !== '';
  };

  const resolveRegionFromFields = async () => {
    const street = addressQuery.street;
    const city = addressQuery.city;
    const plz = addressQuery.plz;

    if (!city && !plz) return null;

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'de');
    if (street) url.searchParams.set('street', street);
    if (plz) url.searchParams.set('postalcode', plz);
    if (city) url.searchParams.set('city', city);

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
      address?: {
        country?: string;
        postcode?: string;
        state?: string;
        county?: string;
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        suburb?: string;
      };
    }>;

    const hit = data?.[0];
    if (!hit) return null;

    const addr = hit.address || {};
    return {
      country: addr.country,
      postcode: addr.postcode,
      stateName: addr.state,
      county: addr.county,
      city: addr.city || addr.town || addr.village,
      municipality: addr.municipality,
      suburb: addr.suburb,
      displayName: hit.display_name,
      lat: hit.lat,
      lon: hit.lon
    };
  };

  const addressQuery = useMemo(() => {
    const street = viewerStreet.trim();
    const houseNumber = viewerHouseNumber.trim();
    const city = viewerCity.trim();
    const plz = viewerPLZ.trim();
    return {
      street: street ? `${street}${houseNumber ? ` ${houseNumber}` : ''}` : '',
      city,
      plz
    };
  }, [viewerStreet, viewerHouseNumber, viewerCity, viewerPLZ]);

  // Persistenz: Intro, Einwilligung, Mängelmelder aus localStorage laden
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(INTRO_DONE_KEY) === 'true') setShowIntro(false);
      const c = localStorage.getItem(CONSENT_PRAEMIEN_KEY);
      if (c === 'true') setConsentPraemienState(true);
      const raw = localStorage.getItem(MAENGEL_REPORTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MangelReport[];
        if (Array.isArray(parsed)) setMangelReportsState(parsed);
      }
    } catch (_) {}
  }, []);

  // PLZ-Vorschläge (Deutschland) per Geocoding (Nominatim / OSM).
  // Hinweis: Für Produktion sollte ein eigener/kommerzieller Dienst genutzt werden (Rate Limits).
  useEffect(() => {
    const city = addressQuery.city;
    const street = addressQuery.street;
    const plz = addressQuery.plz;

    // Nur vorschlagen, wenn Stadt vorhanden ist und PLZ noch nicht vollständig ist.
    if (!city || (plz && plz.length === 5)) {
      setPlzSuggestions([]);
      setShowPlzSuggestions(false);
      setPlzSuggestError(null);
      return;
    }

    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      try {
        setIsPlzSuggesting(true);
        setPlzSuggestError(null);

        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('format', 'json');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '10');
        url.searchParams.set('countrycodes', 'de');
        if (street) url.searchParams.set('street', street);
        url.searchParams.set('city', city);

        const res = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            // Nominatim Usage Policy: identify your app (best-effort)
            'Accept': 'application/json'
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Array<{ address?: { postcode?: string } }>;

        const found = Array.from(
          new Set(
            (data || [])
              .map((d) => d.address?.postcode)
              .filter((p): p is string => typeof p === 'string' && /^\d{5}$/.test(p))
          )
        );

        // Optionale Filterung nach bereits getippten PLZ-Ziffern
        const filtered = plz ? found.filter((p) => p.startsWith(plz)) : found;

        setPlzSuggestions(filtered);
        setShowPlzSuggestions(filtered.length > 0);

        // UX: wenn nur 1 eindeutige PLZ gefunden und Feld leer → auto-füllen
        if (!plz && filtered.length === 1) {
          setViewerPLZ(filtered[0]);
          setShowPlzSuggestions(false);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setPlzSuggestions([]);
        setShowPlzSuggestions(false);
        setPlzSuggestError('Keine PLZ-Vorschläge verfügbar');
      } finally {
        setIsPlzSuggesting(false);
      }
    }, 450); // debounce

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [addressQuery.city, addressQuery.street, addressQuery.plz]);

  // Sehr vereinfachte, aber nachvollziehbare Logik: aus der Adresse werden Bundesland / Kommune abgeleitet.
  // In einem echten System würde hier ein Geodienst (z. B. amtliches Adressregister) genutzt.
  // PLZ-zu-Bundesland-Mapping für ganz Deutschland
  const getStateFromPLZ = (plz: string): string | null => {
    if (!plz || plz.length < 2) return null;
    const plzNum = parseInt(plz.substring(0, 2));
    
    if (plzNum >= 1 && plzNum <= 4) return 'sachsen';
    if (plzNum === 5 || (plzNum >= 7 && plzNum <= 9)) return 'thueringen';
    if (plzNum === 6) return 'sachsen-anhalt';
    if (plzNum >= 10 && plzNum <= 14) return 'berlin';
    if (plzNum >= 15 && plzNum <= 19) return 'brandenburg';
    if (plzNum >= 20 && plzNum <= 22) return 'hamburg';
    if (plzNum >= 23 && plzNum <= 24) return 'schleswig-holstein';
    if (plzNum >= 25 && plzNum <= 27) return 'niedersachsen';
    if (plzNum >= 28 && plzNum <= 29) return 'bremen';
    if (plzNum >= 30 && plzNum <= 37) return 'niedersachsen';
    if (plzNum >= 40 && plzNum <= 46) return 'nordrhein-westfalen';
    if (plzNum >= 47 && plzNum <= 48) return 'niedersachsen';
    if (plzNum === 49) return 'nordrhein-westfalen';
    if (plzNum >= 50 && plzNum <= 53) return 'nordrhein-westfalen';
    if (plzNum >= 54 && plzNum <= 55) return 'rheinland-pfalz';
    if (plzNum >= 56 && plzNum <= 59) return 'nordrhein-westfalen';
    if (plzNum >= 60 && plzNum <= 64) return 'hessen';
    if (plzNum >= 65 && plzNum <= 65) return 'rheinland-pfalz';
    if (plzNum >= 66 && plzNum <= 66) return 'saarland';
    // 68xxx: teils BW (Mannheim), teils Hessen (Viernheim 68519, Lampertheim 68526) – Präfix prüfen
    if (plzNum === 68 && plz.length >= 3 && plz.startsWith('685')) return 'hessen';
    if (plzNum >= 67 && plzNum <= 68) return 'baden-wuerttemberg';
    if (plzNum === 69) return 'hessen';
    if (plzNum >= 70 && plzNum <= 71) return 'baden-wuerttemberg';
    if (plzNum >= 72 && plzNum <= 74) return 'baden-wuerttemberg';
    if (plzNum >= 75 && plzNum <= 77) return 'baden-wuerttemberg';
    if (plzNum >= 78 && plzNum <= 79) return 'baden-wuerttemberg';
    if (plzNum >= 80 && plzNum <= 81) return 'bayern';
    if (plzNum >= 82 && plzNum <= 83) return 'bayern';
    if (plzNum >= 84 && plzNum <= 85) return 'bayern';
    if (plzNum >= 86 && plzNum <= 87) return 'bayern';
    if (plzNum >= 88 && plzNum <= 89) return 'bayern';
    if (plzNum >= 90 && plzNum <= 92) return 'bayern';
    if (plzNum >= 93 && plzNum <= 94) return 'bayern';
    if (plzNum >= 95 && plzNum <= 96) return 'bayern';
    if (plzNum >= 97 && plzNum <= 98) return 'bayern';
    if (plzNum === 99) return 'thueringen';
    return null;
  };

  // Ortsnamen-zu-Bundesland-Mapping (ganz Deutschland; mit Umlaut-Varianten)
  const getStateFromCity = (city: string): string | null => {
    const cityLower = city.toLowerCase();
    // Saarland
    if (/kirkel|neunkirchen|saarbrücken|saarbruecken|saarland|homburg|saarlouis|dillingen|st\.?\s*wendel|völklingen|voelklingen|merzig|st\.?\s*ingbert|blieskastel|bexbach|ottweiler|wadern|saarwellingen|dillingen\s*\/\s*saar/.test(cityLower)) return 'saarland';
    // Berlin
    if (cityLower.includes('berlin')) return 'berlin';
    // Bayern
    if (/münchen|muenchen|nürnberg|nuernberg|augsburg|regensburg|würzburg|wuerzburg|ingolstadt|erlangen|bamberg|bayreuth|landshut|passau|straubing|kempten|rosenheim|neu-?ulm|freising|schweinfurt|forchheim|ansbach|hof\b|kaufbeuren|memmingen|deggendorf|nordlingen|donauwörth|donauwoerth|gunzenhausen|roth\b|hersbruck|amberg|weiden|schwandorf|deggendorf|traunstein|mühldorf|muehldorf|altötting|altötting|bad reichenhall|garmisch|starnberg|günzburg|guenzburg|dachau|friedberg\s*\/\s*bay|aichach|landsberg|fürstenfeldbruck|fuertenfeldbruck|germering/.test(cityLower)) return 'bayern';
    // Baden-Württemberg
    if (/stuttgart|mannheim|karlsruhe|freiburg|heidelberg|weinheim|ulm\b|heilbronn|pforzheim|reutlingen|konstanz|baden-?baden|esslingen|ludwigsburg|tübingen|tuebingen|villingen|schwenningen|aulendorf|ravensburg|friedrichshafen|biberach|riss|reutlingen|nürtingen|nuertingen|geppingen|göppingen|goeppingen|waiblingen|schorndorf|backnang|schwäbisch\s*(hall|gmünd)|schwaebisch\s*(hall|gmuend)|aalen|schwäbisch\s*gmünd|schwaebisch\s*gmuend|offenburg|lorrach|kehl|rastatt|baden-?baden|bruchsal|heidelberg|mannheim|schwetzingen|sinzheim|achern|bühl|buehl|laufenburg|waldshut|tiengen|emmingen|rottweil|tuttlingen|sigmaringen|balingen|albstadt|calw|nagold|freudenstadt|tauberbischofsheim|wertheim|mosbach|bad\s*mergentheim|schrozberg|crailsheim|schwäbisch\s*hall|schwaebisch\s*hall|leimen|wiesloch|sinsheim|eppelheim|walldorf|hockenheim|ladenburg|schriesheim|edingen-?neckarhausen/.test(cityLower)) return 'baden-wuerttemberg';
    // Nordrhein-Westfalen
    if (/köln|koeln|düsseldorf|duesseldorf|dortmund|essen|duisburg|bochum|wuppertal|bielefeld|bonn|münster|muenster|gelsenkirchen|mönchengladbach|moenchengladbach|krefeld|oberhausen|hagen|hamm|mülheim|muelheim|leverkusen|solingen|herne|neuss|paderborn|bottrop|recklinghausen|remscheid|bergisch\s*gladbach|siegen|gütersloh|guetersloh|iserlohn|düren|dueren|lüdenscheid|luedenscheid|ratingen|lünen|luenen|marl|velbert|minden|troisdorf|viersen|rheine|gladbeck|dorsten|arnsberg|bocholt|herford|bergheim|kerpen|grevenbroich|wesel|kamp-?lintfort|unna|bergkamen|dinslaken|lippstadt|castrop-?rauxel|pulheim|hürth|huerth|kerpen|bergisch\s*gladbach|erftstadt|frechen|hilden|willich|erkrath|sankt\s*augustin|troisdorf|siegburg|hennef|brühl|bruehl\s*rh|wesseling|kerpen|elsdorf|weilerswist/.test(cityLower)) return 'nordrhein-westfalen';
    // Niedersachsen
    if (/hannover|braunschweig|oldenburg|osnabrück|osnabrueck|wolfsburg|göttingen|goettingen|salzgitter|wolfenbüttel|wolfenbuettel|goslar|celle|hameln|peine|alfeld|hildesheim|delmenhorst|wilhelmshaven|lingen|nordhorn|cuxhaven|emden|aurich|leer\b|stade|buxtehude|buchholz\s*in\s*der\s*nordheide|lüneburg|lueneburg|soltau|walsrode|nienburg|diepholz|syke|stade|buxtehude|uchte|melle|bramsche|quakenbrück|quakenbrueck|cloppenburg|vechta|vechta|emden|leer|papenburg|meppen|lingen|nordhorn|nordhorn|bad\s*bentheim|grafschaft\s*bentheim|emsland/.test(cityLower)) return 'niedersachsen';
    // Hessen
    if (/frankfurt|wiesbaden|kassel|darmstadt|offenbach|gießen|giessen|marburg|fulda|hanau|gießen|giessen|wetzlar|limburg\s*\/\s*lahn|bad\s*homburg|bad\s*nauheim|friedberg\s*\/\s*hessen|griesheim|rüsselsheim|ruesselsheim|maintal|hofheim|rodgau|oberursel|bad\s*vilbel|mörfelden|moerfelden|dreieich|bensheim|heppenheim|stadtallendorf|stadt\s*allendorf|borken\s*hessen|schwalmstadt|alsfeld|fritzlar|homberg\s*ef|vogelsberg|lahn-?dill|mittelhessen|wetterau|bergstraße|bergstrasse|odenwald|rhein-?main|viernheim|lampertheim|bürstadt|buerstadt|gernsheim/.test(cityLower)) return 'hessen';
    // Sachsen
    if (/dresden|leipzig|chemnitz|zwickau|plauen|görlitz|goerlitz|freiberg|meißen|meissen|bautzen|pirna|hoyerswerda|riesa|riesa|glauchau|delitzsch|torgau|coswig\s*sachsen|freital|döbeln|doebeln|annaberg|aue|aue-?bad\s*schlema|mittweida|limbach-?oberfrohna|görlitz|bischofswerda|kamenz|löbau|loebau|zittau|bautzen|hoyerswerda|großenhain|grossenhain|dippoldiswalde|sebnitz|schkeuditz|markkleeberg|wurzen|grimma|döbeln|doebeln|torgau|riesa|pirna|freital|meißen|meissen/.test(cityLower)) return 'sachsen';
    // Rheinland-Pfalz
    if (/mainz|ludwigshafen|koblenz|trier|kaiserslautern|worms|neuwied|neustadt\s*\/\s*weinstraße|neustadt\s*weinstrasse|speyer|landau|pirmasens|zweibrücken|zweibruecken|andernach|bad\s*neuenahr|bad\s*kreuznach|idar-?oberstein|bingen|ingelheim|bad\s*dürkheim|bad\s*duerkheim|ramstein|pirmasens|landau|frankenthal|mayen|cochem|bernkastel-?kues|bernkastel\s*kues|wittlich|bitburg|daun|gerolstein|bad\s*ems|lahnstein|montabaur|hachenburg|altenkirchen|bad\s*marienberg|westerburg|simmern|kirn|bad\s*sobernheim|rockenhausen|kusel|pirmasens|zweibrücken|zweibruecken|landau|germersheim|südpfalz|suedpfalz|rhein-?pfalz|eifel|hunsrück|hunsrueck|mosel|nahe|rheinhessen/.test(cityLower)) return 'rheinland-pfalz';
    // Brandenburg (inkl. Brandenburg an der Havel)
    if (/potsdam|cottbus|cottbus|frankfurt\s*\/\s*oder|frankfurt\s*\(?\s*oder|eisenhüttenstadt|eisenhuettenstadt|bernau|brandenburg\s*an\s*der\s*havel|brandenburg\s*havel|königs\s*wusterhausen|koenigs\s*wusterhausen|strausberg|falkensee|rathenow|werder\s*havel|neuruppin|prignitz|oberhavel|teltow-?fläming|teltow\s*flaeming|dahme-?spreewald|spreewald|oder-?spree|elbe-?elster|barnim|uckermark|märkisch-?oderland|maerkisch\s*oderland/.test(cityLower)) return 'brandenburg';
    // Schleswig-Holstein
    if (/kiel|lübeck|luebeck|flensburg|neumünster|neumuenster|norderstedt|elmshorn|pinneberg|wedel|ahrensburg|reinbek|geesthacht|eckernförde|eckernfoerde|heide\b|husum|itzehoe|rendsburg|kiel|schleswig|flensburg|neumünster|neumuenster|lübeck|luebeck|norderstedt|elmshorn|pinneberg|stormarn|segeberg|ostholstein|plön|ploen|rendsburg-?eckernförde|steinburg|dithmarschen|nordfriesland|herzogtum\s*lauenburg/.test(cityLower)) return 'schleswig-holstein';
    // Mecklenburg-Vorpommern
    if (/rostock|schwerin|neubrandenburg|stralsund|greifswald|wismar|güstrow|guestrow|pasewalk|anklam|demmin|neustrelitz|wolgast|bergen\s*auf\s*rügen|bergen\s*ruegen|sassnitz|usedom|binz|heiligenhafen|reutershagen|bad\s*doberan|torgelow|parchim|ludwigslust|gadebusch|mecklenburg|vorpommern/.test(cityLower)) return 'mecklenburg-vorpommern';
    // Sachsen-Anhalt
    if (/magdeburg|halle\b|dessau|wittenberg|wittenberg|halberstadt|stendal|weißenfels|weissenfels|quedlinburg|sangerhausen|wernigerode|naumburg|bitterfeld|merseburg|köthen|koethen|zerbst|aschersleben|stassfurt|bernburg|salzlandkreis|burgenlandkreis|harz|börde|boerde|jerichower\s*land|altmark|anhalt/.test(cityLower)) return 'sachsen-anhalt';
    // Thüringen
    if (/erfurt|jena|weimar|gera|gotha|eisenach|nordhausen|suhl|ilmenau|altenburg|rudolstadt|apolda|sonneberg|meiningen|bad\s*langensalza|heiligenstadt|mühlhausen|muehlhausen|sondershausen|arnstadt|saalfeld|pößneck|poessneck|schmalkalden|altenburg|greiz|eisenberg|bad\s*berka|weimarer\s*land|gotha|unstrut-?hainich|kyffhäuser|kyffhaeuser|wartburgkreis|thüringen|thueringen/.test(cityLower)) return 'thueringen';
    // Hamburg
    if (cityLower.includes('hamburg')) return 'hamburg';
    // Bremen
    if (/bremen|bremerhaven|bremen-?haven/.test(cityLower)) return 'bremen';
    return null;
  };

  // Berechnet state/location aus frisch aufgelöstem API-Ergebnis ODER aus Feldern (für gleiche Logik).
  const getRegionFromResolvedOrFields = (resolved: typeof resolvedRegion) => {
    const plz = viewerPLZ.trim();
    const city = viewerCity.toLowerCase().trim();
    const resolvedStateKey = resolved?.stateName ? normalizeStateKey(resolved.stateName) : null;

    if (resolvedStateKey) {
      if (city.includes('kirkel')) return { state: 'saarland', location: 'kirkel' };
      if (city.includes('neunkirchen')) return { state: 'saarland', location: 'saarpfalz' };
      if (resolvedStateKey === 'saarland' || city.includes('saarland') || city.includes('saarbrücken') || plz.startsWith('664')) {
        return { state: 'saarland', location: 'saarland' };
      }
      return { state: resolvedStateKey, location: 'deutschland' };
    }

    if (!plz && !city) return { state: 'deutschland', location: 'deutschland' };

    let detectedState: string | null = null;
    if (plz && /^\d{5}$/.test(plz)) detectedState = getStateFromPLZ(plz);
    if (!detectedState && city) detectedState = getStateFromCity(city);
    // Fallback: Bundesland aus Kreise-Liste ableiten (alle Kreise Deutschlands zugeordnet)
    if (!detectedState && resolved?.county) {
      const kreis = findKreisByCounty(resolved.county);
      if (kreis) detectedState = kreis.landKey;
    }

    if (city.includes('kirkel')) return { state: 'saarland', location: 'kirkel' };
    if (city.includes('neunkirchen')) return { state: 'saarland', location: 'saarpfalz' };
    if (detectedState === 'saarland' || city.includes('saarland') || city.includes('saarbrücken') || plz.startsWith('664')) {
      return { state: 'saarland', location: 'saarland' };
    }
    if (detectedState && detectedState !== 'saarland') return { state: detectedState, location: 'deutschland' };
    return { state: 'deutschland', location: 'deutschland' };
  };

  const deriveRegionFromAddress = () => getRegionFromResolvedOrFields(resolvedRegion);

  // Wahlkreis aus Adresse/Region ableiten (für Anzeige und Stimmzettel)
  const getWahlkreisForUser = (level: 'bund' | 'land' | 'kreis' | 'kommune'): string => {
    const county = (resolvedRegion?.county || '').trim();
    const city = (resolvedRegion?.city || resolvedRegion?.municipality || viewerCity || '').trim();
    const stateName = (resolvedRegion?.stateName || userState || '').toLowerCase();

    if (level === 'bund') {
      // Bundestag: Wahlkreisnummer nach Kreis (Saarland 296–299; andere Länder Platzhalter)
      if (stateName.includes('saarland') || userState === 'saarland') {
        const c = county.toLowerCase();
        if (c.includes('saarbrücken') || c.includes('regionalverband')) return '296 - Saarbrücken';
        if (c.includes('saarlouis')) return '297 - Saarlouis';
        if (c.includes('st. wendel') || c.includes('st Wendel')) return '298 - St. Wendel';
        if (c.includes('neunkirchen') || c.includes('saarpfalz') || c.includes('merzig')) return '299 - Neunkirchen';
        return '296 - Saarbrücken'; // Fallback Saarland
      }
      if (stateName) return `${(resolvedRegion?.stateName || userState) || county || 'Deutschland'} (Wahlkreis aus Adresse)`;
      return 'Wahlkreis nach Adresse';
    }
    if (level === 'land') {
      return (resolvedRegion?.stateName || userState) || 'Land';
    }
    if (level === 'kreis') {
      return county ? getKreisDisplayName(county) : (currentLocation === 'saarpfalz' ? 'Saarpfalz-Kreis' : 'Kreis');
    }
    if (level === 'kommune') {
      return city || (currentLocation === 'kirkel' ? 'Kirkel' : 'Kommune');
    }
    return '';
  };

  const userWahlkreisByLevel = useMemo(() => ({
    bund: getWahlkreisForUser('bund'),
    land: getWahlkreisForUser('land'),
    kreis: getWahlkreisForUser('kreis'),
    kommune: getWahlkreisForUser('kommune')
  }), [resolvedRegion, userState, currentLocation, viewerCity]);

  const claraLevel = useMemo(() => {
    const loc = currentLocation;
    if (loc === 'deutschland') return 'bund';
    if (loc === 'saarland' || loc === 'saarpfalz') return 'land';
    if (loc === 'kirkel') return 'kommune';
    return 'bund';
  }, [currentLocation]);

  const isEligibleToVote = (loc: string) => {
    // Im Nur-ansehen-Modus (z. B. für jüngere Nutzer:innen) sind keine Stimmen möglich
    if (viewerMode) return false;
    // Bundesebene: alle deutschen Bürger:innen
    if (loc === 'deutschland') return true;
    // Regionale Ebenen: nur, wenn der Wohnort im Saarland liegt
    if (loc === 'saarland' || loc === 'neunkirchen' || loc === 'kirkel' || loc === 'saarpfalz') {
      return userState === 'saarland';
    }
    return false;
  };

  const availableLocationIds = menuItems.map(m => m.id);

  // currentLocation immer auf gültigen Menüeintrag setzen (z. B. nach Wechsel Bremen ↔ Saarland)
  useEffect(() => {
    if (menuItems.length && !menuItems.some(m => m.id === currentLocation)) {
      setCurrentLocation(menuItems[0].id);
    }
  }, [menuItems, currentLocation]);

  const updateLocationStripScroll = () => {
    const el = locationStripRef.current;
    if (!el) return;
    const canScrollLeft = el.scrollLeft > 4;
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
    setLocationScroll(prev => (prev.canScrollLeft === canScrollLeft && prev.canScrollRight === canScrollRight ? prev : { canScrollLeft, canScrollRight }));
  };

  useEffect(() => {
    updateLocationStripScroll();
    const el = locationStripRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateLocationStripScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [currentTab, currentLocation, userState]);

  // Gewählten Tab (z. B. Kirkel) in den sichtbaren Bereich scrollen
  useEffect(() => {
    const tab = document.getElementById(`location-tab-${currentLocation}`);
    if (tab && locationStripRef.current) {
      const t = setTimeout(() => {
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        updateLocationStripScroll();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [currentLocation]);

  const currentData = votingData[currentLocation as keyof typeof votingData] ?? votingData.deutschland ?? { items: [] };
  const canVote = isEligibleToVote(currentLocation);
  /** Stichtag (DD.MM.YYYY) abgelaufen? Dann nicht mehr „aktuell zum Abstimmen“ anzeigen. */
  const isDeadlinePassed = (deadline: string) => {
    const parts = deadline.trim().split(/\./);
    if (parts.length !== 3) return false;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y) return false;
    const deadlineEnd = new Date(y, m - 1, d, 23, 59, 59);
    return Date.now() > deadlineEnd.getTime();
  };
  const activeCards = (currentData?.items || []).filter(
    item => !votedCards.includes(item.id) && !isDeadlinePassed(item.deadline || '')
  );

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleVote = (cardId: string, isYes: boolean | null, points: number) => {
    if (!canVote) {
      showToastMessage('Nicht wahlberechtigt');
      return;
    }
    setCurrentPoints(prev => prev + points);
    setTotalVotes(prev => prev + 1);
    setVotedCards(prev => [...prev, cardId]);
    showToastMessage(`${isYes === null ? 'Enthalten' : isYes ? 'Ja' : 'Nein'}-Stimme! +${points} Punkte`);
  };

  const handleTouchStart = (e: React.TouchEvent, cardId: string) => {
    if (!canVote) return;
    setDragState({ isDragging: true, startX: e.touches[0].clientX, currentX: e.touches[0].clientX, cardId });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.isDragging) return;
    setDragState(prev => ({ ...prev, currentX: e.touches[0].clientX }));
  };

  const handleTouchEnd = (points: number) => {
    if (!dragState.isDragging) return;
    const diff = dragState.currentX - dragState.startX;
    if (Math.abs(diff) > 100 && dragState.cardId) {
      handleVote(dragState.cardId, diff > 0, points);
    }
    setDragState({ isDragging: false, startX: 0, currentX: 0, cardId: null });
  };

  if (showIntro) {
    return (
      <div className="w-full min-h-screen bg-slate-100 flex justify-center items-center p-4" style={{fontFamily: 'Inter, -apple-system, sans-serif'}}>
        <div className="relative" style={{width: '393px', height: '852px'}}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-black rounded-b-3xl z-50" />
          <div className="w-full h-full rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-black relative flex flex-col bg-white">

            {introStep === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-900">
                <h1 className="text-5xl font-black mb-2 text-gray-900" style={{letterSpacing: '-0.02em'}}>eIDConnect</h1>
                <p className="text-lg mb-12 font-normal text-gray-600" style={{letterSpacing: '-0.01em'}}>Mitreden. Mitentscheiden. Mitgestalten.</p>
                
                <div className="w-full max-w-xs space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Anrede</label>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setUseFormalAddress(false)}
                        className={`flex-1 py-3 rounded-xl font-bold ${!useFormalAddress ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        Du
                      </button>
                      <button 
                        onClick={() => setUseFormalAddress(true)}
                        className={`flex-1 py-3 rounded-xl font-bold ${useFormalAddress ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        Sie
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIntroStep(2)}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}

            {introStep === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-900">
                <div className="w-full max-w-xs">
                  <div className="bg-slate-100 rounded-2xl p-6 mb-6 border border-slate-200">
                    <div className="flex items-center justify-center mb-4">
                      <svg className="w-16 h-16 text-blue-600" viewBox="0 0 100 120" fill="currentColor">
                        <path d="M50 10c-5 0-8 3-8 8v5c-3-2-6-3-9-3-4 0-7 2-9 5-2 4-2 8 0 12 1 2 3 4 5 5-2 1-4 3-5 5-2 4-2 8 0 12 2 3 5 5 9 5 3 0 6-1 9-3v5c0 5 3 8 8 8s8-3 8-8v-5c3 2 6 3 9 3 4 0 7-2 9-5 2-4 2-8 0-12-1-2-3-4-5-5 2-1 4-3 5-5 2-4 2-8 0-12-2-3-5-5-9-5-3 0-6 1-9 3v-5c0-5-3-8-8-8zm0 15c3 0 5 2 5 5v20c0 3-2 5-5 5s-5-2-5-5V30c0-3 2-5 5-5z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-center mb-2 text-gray-900">eID-Authentifizierung</h2>
                    <p className="text-sm text-center text-gray-700">
                      {useFormalAddress ? 'Halten Sie Ihren' : 'Halte deinen'} Personalausweis bereit und {useFormalAddress ? 'öffnen Sie' : 'öffne'} die AusweisApp2.
                    </p>
                    <p className="text-xs text-center text-slate-700 mt-2 bg-slate-100 px-2 py-1 rounded">
                      eID-Anbindung in Vorbereitung – aktuell Demo: weiter ohne Ausweis.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setViewerMode(false);
                      setIntroStep(3);
                    }}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg mb-4 hover:bg-blue-700"
                  >
                    Mit eID anmelden (Demo)
                  </button>
                  
                  <div className="mt-1 pt-4 border-t border-slate-200">
                    <p className="text-xs text-center text-gray-600 mb-3">
                      {useFormalAddress
                        ? 'Oder erst einmal nur ansehen: Geben Sie Name und Adresse an und sehen Sie alle aktuellen Wahlen – ohne Wahl- oder Abstimmungsmöglichkeit.'
                        : 'Oder erst einmal nur ansehen: Gib Name und Adresse an und sieh alle aktuellen Wahlen – ohne Wahl- oder Abstimmungsmöglichkeit.'}
                    </p>
                    
                    {/* Name: Google Account oder Vorname/Nachname */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => setUseGoogleAccount(true)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold ${
                            useGoogleAccount 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-100 text-gray-600'
                          }`}
                        >
                          Google Account
                        </button>
                        <button
                          onClick={() => setUseGoogleAccount(false)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold ${
                            !useGoogleAccount 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-100 text-gray-600'
                          }`}
                        >
                          Manuell eingeben
                        </button>
                      </div>
                      
                      {useGoogleAccount ? (
                        <button className="w-full px-3 py-2 rounded-xl bg-slate-100 text-gray-700 text-sm border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Mit Google anmelden
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={viewerFirstName}
                            onChange={(e) => setViewerFirstName(e.target.value)}
                            placeholder={useFormalAddress ? 'Vorname' : 'Vorname'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <input
                            type="text"
                            value={viewerLastName}
                            onChange={(e) => setViewerLastName(e.target.value)}
                            placeholder={useFormalAddress ? 'Nachname' : 'Nachname'}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      )}
                    </div>

                    {/* Adresse: Straße, Hausnummer, PLZ, Stadt */}
                    <div className="space-y-2 mb-3">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={viewerStreet}
                          onChange={(e) => setViewerStreet(e.target.value)}
                          placeholder={useFormalAddress ? 'Straße' : 'Straße'}
                          className={`col-span-2 px-3 py-2 rounded-xl bg-slate-50 border text-gray-900 placeholder-gray-400 text-sm ${
                            addressErrors.street ? 'border-red-400' : 'border-slate-200'
                          } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        />
                        <input
                          type="text"
                          value={viewerHouseNumber}
                          onChange={(e) => setViewerHouseNumber(e.target.value)}
                          placeholder={useFormalAddress ? 'Nr.' : 'Nr.'}
                          className={`px-3 py-2 rounded-xl bg-slate-50 border text-gray-900 placeholder-gray-400 text-sm ${
                            addressErrors.houseNumber ? 'border-red-400' : 'border-slate-200'
                          } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        />
                      </div>
                      {addressErrors.street && (
                        <p className="text-xs text-red-600">{addressErrors.street}</p>
                      )}
                      {addressErrors.houseNumber && (
                        <p className="text-xs text-red-600">{addressErrors.houseNumber}</p>
                      )}
                      
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={viewerPLZ}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                            setViewerPLZ(value);
                            if (value.length < 5) setShowPlzSuggestions(true);
                          }}
                          placeholder={useFormalAddress ? 'PLZ' : 'PLZ'}
                          className={`px-3 py-2 rounded-xl bg-slate-50 border text-gray-900 placeholder-gray-400 text-sm ${
                            addressErrors.plz ? 'border-red-400' : 'border-slate-200'
                          } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                          maxLength={5}
                          onFocus={() => {
                            if (plzSuggestions.length > 0) setShowPlzSuggestions(true);
                          }}
                        />
                        <input
                          type="text"
                          value={viewerCity}
                          onChange={(e) => {
                            setViewerCity(e.target.value);
                            if (plzSuggestions.length > 0) setShowPlzSuggestions(true);
                          }}
                          placeholder={useFormalAddress ? 'Stadt' : 'Stadt'}
                          className={`col-span-2 px-3 py-2 rounded-xl bg-slate-50 border text-gray-900 placeholder-gray-400 text-sm ${
                            addressErrors.city ? 'border-red-400' : 'border-slate-200'
                          } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        />
                      </div>
                      {(isPlzSuggesting || plzSuggestError || (showPlzSuggestions && plzSuggestions.length > 0)) && (
                        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                          {isPlzSuggesting && (
                            <div className="px-3 py-2 text-xs text-gray-600">
                              PLZ wird gesucht…
                            </div>
                          )}
                          {!isPlzSuggesting && plzSuggestError && (
                            <div className="px-3 py-2 text-xs text-gray-600">
                              {plzSuggestError}
                            </div>
                          )}
                          {!isPlzSuggesting && showPlzSuggestions && plzSuggestions.length > 0 && (
                            <div className="max-h-28 overflow-auto">
                              {plzSuggestions.slice(0, 8).map((p) => (
                                <button
                                  key={p}
                                  onClick={() => {
                                    setViewerPLZ(p);
                                    setShowPlzSuggestions(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-slate-200 transition-colors"
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {addressErrors.plz && (
                        <p className="text-xs text-red-600">{addressErrors.plz}</p>
                      )}
                      {addressErrors.city && (
                        <p className="text-xs text-red-600">{addressErrors.city}</p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (!validateName()) {
                          showToastMessage(useFormalAddress ? 'Bitte geben Sie Vor- und Nachname ein' : 'Bitte gib Vor- und Nachname ein');
                          return;
                        }
                        if (!validateAddress()) {
                          showToastMessage(useFormalAddress ? 'Bitte korrigieren Sie die Adressangaben' : 'Bitte korrigiere die Adressangaben');
                          return;
                        }
                        (async () => {
                          try {
                            setIsResolvingRegion(true);
                            setRegionResolveError(null);
                            const resolved = await resolveRegionFromFields();
                            setResolvedRegion(resolved);
                            // Region aus frischem API-Ergebnis berechnen (State wäre noch nicht aktualisiert)
                            const region = getRegionFromResolvedOrFields(resolved);
                            setViewerMode(true);
                            setUserState(region.state);
                            setCurrentLocation(region.location);
                            setIntroStep(3);
                          } catch (e: any) {
                            setRegionResolveError('Region konnte nicht automatisch bestimmt werden');
                            const region = getRegionFromResolvedOrFields(null);
                            setViewerMode(true);
                            setUserState(region.state);
                            setCurrentLocation(region.location);
                            setIntroStep(3);
                          } finally {
                            setIsResolvingRegion(false);
                          }
                        })();
                      }}
                      className="w-full bg-slate-200 text-gray-800 py-3 rounded-xl font-semibold text-sm hover:bg-slate-300 transition-colors"
                    >
                      {isResolvingRegion ? 'Region wird geprüft…' : 'Nur ansehen – Wahlen anzeigen ohne Abstimmen'}
                    </button>
                    {regionResolveError && (
                      <p className="text-xs text-gray-600 mt-2">{regionResolveError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {introStep === 3 && (
              <div className="flex-1 flex flex-col p-6 text-gray-900 overflow-y-auto">
                <div className="text-center mb-6 mt-8">
                  <h1 className="text-3xl font-black mb-2 text-gray-900" style={{letterSpacing: '-0.02em'}}>eIDConnect</h1>
                  <p className="text-base font-normal text-gray-600" style={{letterSpacing: '-0.01em'}}>Mitreden. Mitentscheiden. Mitgestalten.</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-gray-900 mb-6 shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold mb-2" style={{ color: '#374151' }}>{useFormalAddress ? 'Ihr' : 'Dein'} Politik-Barometer</h2>
                  <p className="text-sm text-gray-600 mb-1">Für personalisierte Clara-Empfehlungen</p>
                  <p className="text-sm text-gray-500 mb-4">Diese Priorisierung hebt im Kalender Abstimmungen hervor, die zu Ihren Schwerpunkten passen.</p>
                  
                  <div className="space-y-4">
                    {Object.entries(priorities).map(([key, value]) => {
                      const labels = {
                        umwelt: 'Umwelt & Klima',
                        wirtschaft: 'Finanzen & Wirtschaft',
                        bildung: 'Bildung & Forschung',
                        digitalisierung: 'Digitalisierung',
                        soziales: 'Soziales & Gesundheit',
                        sicherheit: 'Sicherheit & Verteidigung'
                      };
                      return (
                        <div key={key}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-800">{labels[key as keyof typeof labels]}</span>
                            <span className="text-sm font-bold text-blue-600">{value}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={value}
                            onChange={(e) => setPriorities({...priorities, [key]: Number(e.target.value)})}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${value}%, #E5E7EB ${value}%, #E5E7EB 100%)`
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {viewerMode && (resolvedRegion || userState) && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-100 text-slate-800 text-sm">
                      <div className="font-semibold mb-1">{useFormalAddress ? 'Ihre' : 'Deine'} erkannte Region:</div>
                      <div className="space-y-0.5">
                        <div><span className="font-medium">Bund:</span> Deutschland</div>
                        <div><span className="font-medium">Land:</span> {STATE_DISPLAY_NAMES[normalizeStateKey(resolvedRegion?.stateName || userState)] || userState}</div>
                        {resolvedRegion?.county && <div><span className="font-medium">Kreis/Bezirk:</span> {resolvedRegion.county}</div>}
                        <div><span className="font-medium">Kommune:</span> {resolvedRegion?.city || resolvedRegion?.municipality || viewerCity || '—'}</div>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">Im Tab „Programme“ siehst du Wahlprogramme und Links für deine Region.</p>
                    </div>
                  )}

                  <button 
                    onClick={() => setIntroStep(4)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-base mt-6 hover:bg-blue-700"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}

            {introStep === 4 && (
              <div className="flex-1 flex flex-col px-3 py-3 text-gray-900 overflow-hidden flex-nowrap">
                <div className="text-center mb-2 mt-1 flex-shrink-0">
                  <h1 className="text-xl font-black text-gray-900" style={{letterSpacing: '-0.02em'}}>eIDConnect</h1>
                  <p className="text-xs text-gray-600 mt-0.5" style={{letterSpacing: '-0.01em'}}>{useFormalAddress ? 'So bleibt Ihre Stimme anonym' : 'So bleibt deine Stimme anonym'}</p>
                </div>
                
                <div className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm border border-slate-100 flex-1 min-h-0 flex flex-col">
                  <h2 className="text-sm font-bold flex-shrink-0 mb-2" style={{color: 'var(--gov-heading)'}}>Prüfung über eID – Stimmabgabe getrennt von {useFormalAddress ? 'Ihrer' : 'deiner'} Identität</h2>
                  
                  <div className="space-y-2 text-xs text-gray-700 flex-1 min-h-0">
                    <div className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-xs mb-0.5">Personalien werden über eID geprüft</p>
                        <p className="leading-snug">Über den Ausweis (eID) wird nur festgestellt: <strong>wahlberechtigt</strong> und <strong>noch nicht abgestimmt</strong>. Keine Weitergabe {useFormalAddress ? 'Ihrer' : 'deiner'} Identität an die Stimmabgabe.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-xs mb-0.5">Ausgabe eines anonymen Stimmcodes (Token)</p>
                        <p className="leading-snug">{useFormalAddress ? 'Sie erhalten' : 'Du erhältst'} einen <strong>einmaligen Stimmcode</strong> (Token). Er enthält <strong>keine Identitätsdaten</strong> – nur die Bestätigung, dass <strong>einmal abgestimmt werden darf</strong>. Nach der Stimmabgabe wird die Verbindung zwischen Identität und Code getrennt.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-xs mb-0.5">Stimmabgabe zu 100 % anonym</p>
                        <p className="leading-snug">Das System speichert nur <strong>Stimmcode + abgegebene Stimme</strong>. Keine personenbezogenen Daten mit der Stimme verknüpft – Stimmabgabe ist vollständig anonym.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowKryptoDummies(true)}
                    className="w-full py-2 rounded-lg font-semibold text-xs border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0 mt-2"
                  >
                    Wie wir das machen – Kryptographie leicht erklärt
                  </button>

                  <button 
                    onClick={() => {
                      try { if (typeof window !== 'undefined') localStorage.setItem(INTRO_DONE_KEY, 'true'); } catch (_) {}
                      setShowIntro(false);
                      if (viewerMode) setCurrentTab('programme');
                    }}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm mt-2 flex-shrink-0 hover:bg-blue-700"
                  >
                    App starten
                  </button>
                </div>

                {showKryptoDummies && (
                  <div className="absolute inset-0 z-[110] flex flex-col items-stretch p-3 bg-slate-500/40" onClick={() => setShowKryptoDummies(false)}>
                    <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-center p-4 flex-shrink-0 border-b border-gray-100">
                        <h3 className="text-base font-bold" style={{color: 'var(--gov-heading)'}}>Kryptographie leicht erklärt</h3>
                        <button onClick={() => setShowKryptoDummies(false)} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Schließen"><X className="w-5 h-5 text-gray-600" /></button>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                        <p className="text-sm text-gray-600 break-words">Kurze Erklärungen – ohne Formeln. So kann Vertrauen technisch umgesetzt werden.</p>
                        <div className="break-words">
                          <h4 className="font-bold text-gray-900 mb-1 text-sm">1. Blindensignatur</h4>
                          <p className="text-sm text-gray-700 break-words">Jemand unterschreibt etwas, <strong>ohne den Inhalt zu sehen</strong>. Wie ein Amt, das einen undurchsichtigen Umschlag stempelt („berechtigt“) – erst danach wird der Inhalt sichtbar. So wird {useFormalAddress ? 'Ihr' : 'dein'} Stimmcode amtlich anerkannt, ohne dass jemand {useFormalAddress ? 'Ihre' : 'deine'} Stimme sieht.</p>
                        </div>
                        <div className="break-words">
                          <h4 className="font-bold text-gray-900 mb-1 text-sm">2. Zero-Knowledge-Beweis</h4>
                          <p className="text-sm text-gray-700 break-words">{useFormalAddress ? 'Sie' : 'Du'} <strong>beweis{useFormalAddress ? 'en' : 't'}</strong>, dass etwas stimmt (z. B. „wahlberechtigt“), <strong>ohne</strong> {useFormalAddress ? 'Ihr' : 'dein'} Geheimnis zu verraten. Wie in der Höhle: {useFormalAddress ? 'Sie kommen' : 'Du kommst'} immer auf der richtigen Seite raus, wenn {useFormalAddress ? 'Sie das' : 'du das'} Wort kennen – {useFormalAddress ? 'sagen' : 'sagst'} es aber nie. So prüft das System nur die nötige Aussage.</p>
                        </div>
                        <div className="break-words">
                          <h4 className="font-bold text-gray-900 mb-1 text-sm">3. Homomorphe Verschlüsselung</h4>
                          <p className="text-sm text-gray-700 break-words">Man kann <strong>auf verschlüsselten Daten rechnen</strong>. Wie Schachteln, die nie geöffnet werden – die „Maschine“ addiert trotzdem (5 + 3 = 8). So können Stimmen gezählt werden, ohne sie jemals zu entschlüsseln; nur das Endergebnis wird sichtbar.</p>
                        </div>
                      </div>
                      <div className="p-4 flex-shrink-0 border-t border-gray-100">
                        <button onClick={() => setShowKryptoDummies(false)} className="w-full py-2.5 rounded-xl font-semibold text-white hover:opacity-90 text-sm bg-blue-600">Schließen</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderVotingTab = () => {
    const topCard = activeCards[0];
    if (!topCard) {
      const total = currentData?.items.length ?? 0;
      return (
        <div className="px-4 pb-24 pt-3">
          <p className="text-sm text-gray-600 mb-2">
            {total > 0 ? `0 von ${total} Abstimmungen offen.` : 'Keine Abstimmungen in dieser Ebene.'}
          </p>
          <div className="h-96 flex items-center justify-center text-gray-400">
            <p className="font-bold">Alle Abstimmungen erledigt!</p>
          </div>
        </div>
      );
    }

    const diff = dragState.isDragging && dragState.cardId === topCard.id ? dragState.currentX - dragState.startX : 0;

    const anzahlOffen = activeCards.length;
    const anzahlGesamt = currentData?.items.length ?? 0;

    return (
      <div className="px-4 pb-24 pt-3 relative">
        <p className="text-sm text-gray-600 mb-2">
          {anzahlOffen === 0
            ? 'Keine Abstimmungen offen.'
            : `${anzahlOffen} ${anzahlOffen === 1 ? 'Abstimmung' : 'Abstimmungen'} aktuell zum Abstimmen${anzahlGesamt > 0 ? ` (${anzahlOffen} von ${anzahlGesamt})` : ''}`}
        </p>
        {!canVote && (
          <>
            {!showNurAnsehenClosed ? (
              <div className="mb-4 bg-slate-100 border-2 border-slate-300 rounded-xl p-4 text-slate-800 relative">
                <button
                  type="button"
                  onClick={() => setShowNurAnsehenClosed(true)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                  aria-label="Schließen"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
                <p className="font-semibold mb-1 pr-8">Nur ansehen – {useFormalAddress ? 'Sie können' : 'Du kannst'} alles einsehen, aber nicht abstimmen.</p>
                <p className="text-sm">{useFormalAddress ? 'Ihre' : 'Deine'} Region (Bund, Land, Kreis, Kommune) und Wahlprogramme {useFormalAddress ? 'finden Sie' : 'findest du'} im Tab <strong>Wahlen</strong>.</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNurAnsehenModal(true)}
                className="mb-4 text-sm text-slate-600 hover:text-slate-800 underline"
              >
                Info: Nur ansehen
              </button>
            )}
            {showNurAnsehenModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowNurAnsehenModal(false)}>
                <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border-2 border-slate-200" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-slate-900 mb-2">Nur ansehen</h3>
                  <p className="text-sm text-slate-800 mb-2">{useFormalAddress ? 'Sie können' : 'Du kannst'} alles einsehen, aber nicht abstimmen.</p>
                  <p className="text-sm text-slate-700 mb-4">{useFormalAddress ? 'Ihre' : 'Deine'} Region (Bund, Land, Kreis, Kommune) und Wahlprogramme {useFormalAddress ? 'finden Sie' : 'findest du'} im Tab <strong>Wahlen</strong>.</p>
                  <button onClick={() => setShowNurAnsehenModal(false)} className="w-full py-2.5 rounded-xl font-semibold text-white bg-slate-600 hover:bg-slate-700">Schließen</button>
                </div>
              </div>
            )}
          </>
        )}

        {canVote && showStimmeAnleitung && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0.5rem)' }} onClick={() => { setShowStimmeAnleitung(false); try { sessionStorage.setItem('eidconnect_stimme_anleitung_closed', '1'); } catch (_) {} }}>
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border-2 border-slate-200 overflow-hidden flex flex-col max-h-[min(85vh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem))]" onClick={e => e.stopPropagation()}>
              <div className="p-3 sm:p-4 flex-shrink-0">
                <h3 className="text-base font-bold text-gray-900 mb-2">{useFormalAddress ? 'So geben Sie Ihre Stimme ab' : 'So gibst du deine Stimme ab'}</h3>
                <div className="flex justify-center gap-3 sm:gap-4 mb-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-medium text-gray-600 uppercase">Dagegen</span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-blue-900 rounded-full flex items-center justify-center shadow" aria-hidden>
                      <ThumbsDown size={20} className="text-blue-900" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 pt-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center shadow" aria-hidden>
                      <Minus size={18} className="text-gray-400" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500 uppercase">Enthalten</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-medium text-gray-600 uppercase">Dafür</span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-blue-900 rounded-full flex items-center justify-center shadow" aria-hidden>
                      <ThumbsUp size={20} className="text-blue-900" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center">Tippe auf einen Button, um deine Stimme abzugeben.</p>
              </div>
              <div className="p-3 flex-shrink-0 border-t border-gray-100">
                <button onClick={() => { setShowStimmeAnleitung(false); try { sessionStorage.setItem('eidconnect_stimme_anleitung_closed', '1'); } catch (_) {} }} className="w-full py-2 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 text-sm">Verstanden</button>
              </div>
            </div>
          </div>
        )}

        <div className="relative flex flex-col" style={{ minHeight: 'min(520px, calc(100vh - 220px))', maxHeight: 'calc(100vh - 200px)' }}>
          {canVote && (
            <>
              <div 
                className="absolute left-4 top-1/3 text-xl font-bold z-10 pointer-events-none transition-opacity"
                style={{ color: '#059669', opacity: diff > 80 ? 1 : 0 }}
              >
                Ja
              </div>
              <div 
                className="absolute right-4 top-1/3 text-xl font-bold z-10 pointer-events-none transition-opacity"
                style={{ color: '#EF4444', opacity: diff < -80 ? 1 : 0 }}
              >
                Nein
              </div>
            </>
          )}

          <div
            className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-y-auto flex-1 min-h-0"
            style={{
              transform: dragState.isDragging ? `translateX(${diff}px) rotate(${diff / 20}deg)` : 'none',
              transition: dragState.isDragging ? 'none' : 'all 0.3s ease',
              opacity: dragState.isDragging ? Math.max(1 - Math.abs(diff) / 300, 0.5) : 1
            }}
            onTouchStart={(e) => canVote && handleTouchStart(e, topCard.id)}
            onTouchMove={canVote ? handleTouchMove : undefined}
            onTouchEnd={canVote ? () => handleTouchEnd(topCard.points) : undefined}
          >
            {topCard.urgent && (
              <span className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold mb-4">
                DRINGEND
              </span>
            )}

            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--gov-heading)' }}>{topCard.title}</h3>
            <p className="text-base sm:text-xl text-gray-600 mb-4 sm:mb-5 leading-relaxed">{topCard.desc}</p>

            <div className="border-l-4 p-2.5 sm:p-3 mb-2 rounded-r-lg" style={{backgroundColor: '#F3F0FF', borderColor: '#E6E6FA'}}>
              <div className="flex items-start gap-2 mb-1 sm:mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold mb-0.5 sm:mb-1" style={{color: '#6B5B95', fontSize: '10px'}}>Clara Pro:</p>
                  <p className="mb-1.5 sm:mb-2 text-xs" style={{color: '#6B5B95'}}>{topCard.claraPro}</p>
                  <p className="font-bold mb-0.5 sm:mb-1" style={{color: '#6B5B95', fontSize: '10px'}}>Clara Con:</p>
                  <p className="text-xs" style={{color: '#6B5B95'}}>{topCard.claraCon}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-lg text-gray-600 font-semibold mb-2 sm:mb-3">
              <span>⏰ {topCard.deadline}</span>
            </div>

            <div className="mb-2 sm:mb-3">
              <div className="flex justify-between text-sm sm:text-lg font-bold mb-1">
                <span className="text-emerald-700">Ja {topCard.yes}%</span>
                <span className="text-gray-600">{topCard.votes.toLocaleString()} Stimmen</span>
                <span className="text-red-600">Nein {topCard.no}%</span>
              </div>
              <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${topCard.yes}%`,
                    background: 'linear-gradient(90deg, #047857 0%, #059669 50%, #10b981 100%)',
                  }}
                />
                <div
                  style={{
                    width: `${topCard.no}%`,
                    background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)',
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setExpandedBallot(expandedBallot === topCard.id ? null : topCard.id)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 py-2 border-t"
            >
              <span>Quellen anzeigen</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${expandedBallot === topCard.id ? 'rotate-180' : ''}`} />
            </button>

            {expandedBallot === topCard.id && (
              <div className="mt-2 space-y-1">
                {topCard.sources.map((s, i) => (
                  <div key={i} className="text-sm text-blue-600 flex items-start gap-1">
                    <span>•</span>
                    <div>
                      <span className="font-semibold">{s.title}</span>
                      <span className="text-gray-500"> ({s.url})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {canVote && (
              <>
                <div className="flex gap-4 mt-5 justify-center">
                  <button
                    onClick={() => handleVote(topCard.id, false, topCard.points)}
                    className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-all duration-200 hover:scale-110 hover:brightness-110 border border-white/20"
                    style={{
                      background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 40%, #ef4444 100%)',
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleVote(topCard.id, null, Math.floor(topCard.points / 2))}
                    className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-all duration-200 hover:scale-110 hover:brightness-110 border border-white/20"
                    style={{
                      background: 'linear-gradient(135deg, #4b5563 0%, #6b7280 45%, #9ca3af 100%)',
                      boxShadow: '0 4px 14px rgba(75, 85, 99, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    <span className="text-2xl font-bold text-white">—</span>
                  </button>
                  <button
                    onClick={() => handleVote(topCard.id, true, topCard.points)}
                    className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-all duration-200 hover:scale-110 hover:brightness-110 border border-white/20"
                    style={{
                      background: 'linear-gradient(135deg, #047857 0%, #059669 40%, #10b981 100%)',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-around text-sm font-medium mt-1.5 text-gray-600">
                  <span>Nein</span>
                  <span>Enthalten</span>
                  <span>Ja</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWahlenTab = () => {
    const mappedLocation = availableLocationIds.includes(currentLocation) ? currentLocation : 'deutschland';
    const stateKey = normalizeStateKey(resolvedRegion?.stateName || userState);
    const programs =
      WAHLPROGRAMME_2026[stateKey] ||
      WAHLPROGRAMME_2026[userState] ||
      WAHLPROGRAMME_2026['deutschland'] ||
      null;

    const currentLevel = menuItems.find(m => m.id === mappedLocation)?.level?.toLowerCase() ?? 'bund';
    return (
      <div className="px-4 py-4 pb-24">
        <ElectionsSection currentLocation={mappedLocation} currentLevel={currentLevel} userWahlkreisByLevel={userWahlkreisByLevel} />

        <h3 className="text-xl font-bold mt-8 mb-3" style={{ color: 'var(--gov-heading)' }}>Wahlprogramme</h3>
        <p className="text-sm text-gray-600 mb-3">Programme und Quellen zu Wahlen in Ihrer Region.</p>
        {programs ? (
          <div className="glass-panel rounded-xl p-4 mb-6">
            <div className="text-base font-bold mb-2" style={{ color: 'var(--gov-heading)' }}>{programs.regionLabel}</div>
            {programs.notes && programs.notes.length > 0 && (
              <ul className="text-sm text-gray-700 mb-3 list-disc pl-5 space-y-1">
                {programs.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
            <div className="space-y-2">
              {programs.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="block p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <div className="text-sm font-semibold text-blue-700">{s.label}</div>
                  <div className="text-xs text-gray-500 break-all">{s.url}</div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-6">Für diese Region sind noch keine verlinkten Programme hinterlegt.</p>
        )}

        <h3 className="text-xl font-bold mt-6 mb-3" style={{ color: 'var(--gov-heading)' }}>News zu Politik</h3>
        <p className="text-sm text-gray-600 mb-3">Nur verifizierte Meldungen – tatsächlich beschlossene bzw. offiziell bestätigte Vorgänge.</p>
        <div className="space-y-3">
          <div className="glass-panel rounded-xl p-4 border-l-4" style={{ borderColor: 'var(--gov-btn)' }}>
            <h4 className="font-bold text-lg" style={{ color: 'var(--gov-heading)' }}>EU AI Act in Kraft</h4>
            <span className="text-sm text-gray-500">01.08.2024</span>
            <p className="text-sm text-gray-600 mt-1">Verordnung (EU) 2024/1689 regelt Transparenz, Risikoklassifizierung und Verantwortung bei KI-Systemen.</p>
            <span className="text-xs text-gray-500">Quelle: Amtsblatt der EU, EUR-Lex</span>
          </div>
          <div className="glass-panel rounded-xl p-4 border-l-4 border-emerald-400">
            <h4 className="font-bold text-lg" style={{ color: 'var(--gov-heading)' }}>Deutschland-Ticket verlängert</h4>
            <span className="text-sm text-gray-500">2024</span>
            <p className="text-sm text-gray-600 mt-1">49-Euro-Ticket bundesweit eingeführt und fortgeführt. Quelle: BMDV.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderProgrammeTab = () => {
    const stateKey = normalizeStateKey(resolvedRegion?.stateName || userState);
    const programs =
      WAHLPROGRAMME_2026[stateKey] ||
      WAHLPROGRAMME_2026[userState] ||
      WAHLPROGRAMME_2026['deutschland'] ||
      null;

    return (
      <div className="px-4 py-4 pb-24">
        <h2 className="text-4xl font-bold mb-5" style={{ color: 'var(--gov-heading)' }}>Wahlprogramme</h2>

        <div className="bg-white rounded-xl p-4 shadow-md mb-4 min-h-[120px]">
          <div className="text-sm font-bold text-gray-800 mb-2">Erkannte Region</div>
          {resolvedRegion || userState ? (
            <div className="text-sm text-gray-700 space-y-1 break-words">
              <div><span className="font-semibold">Bund:</span> Deutschland</div>
              <div><span className="font-semibold">Land:</span> {STATE_DISPLAY_NAMES[stateKey] || resolvedRegion?.stateName || userState || '—'}</div>
              <div><span className="font-semibold">Kreis/Bezirk:</span> {resolvedRegion?.county || '—'}</div>
              <div><span className="font-semibold">Kommune:</span> {resolvedRegion?.city || resolvedRegion?.municipality || '—'}</div>
              {resolvedRegion?.postcode && (
                <div><span className="font-semibold">PLZ:</span> {resolvedRegion.postcode}</div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Ganz Deutschland: Kommune, Kreis, Land und Bund aus Ihrer Adresse (OpenStreetMap/Nominatim).
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Datenbasis: Alle {ANZAHL_KREISE} Kreise und {ANZAHL_KOMMUNEN.toLocaleString('de-DE')} Kommunen Deutschlands (Gemeindeverzeichnis).
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">Noch keine Adresse eingegeben. Im Intro „Nur ansehen“ wählen und PLZ sowie Stadt eingeben, dann wird hier Kommune, Kreis, Land und Bund angezeigt.</p>
              <div className="mt-2 text-xs text-gray-500">
                Datenbasis: Alle {ANZAHL_KREISE} Kreise und {ANZAHL_KOMMUNEN.toLocaleString('de-DE')} Kommunen Deutschlands (Gemeindeverzeichnis).
              </div>
            </>
          )}
        </div>

        {programs ? (
          <div className="glass-panel rounded-xl p-4">
            <div className="text-base font-bold mb-2" style={{ color: 'var(--gov-heading)' }}>{programs.regionLabel}</div>
            {programs.notes && programs.notes.length > 0 && (
              <ul className="text-sm text-gray-700 mb-3 list-disc pl-5 space-y-1">
                {programs.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            <div className="space-y-2">
              {programs.sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="text-sm font-semibold text-blue-700">{s.label}</div>
                  <div className="text-xs text-gray-500 break-all">{s.url}</div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-4 text-slate-800 font-semibold">
            Für diese Region sind noch keine verlinkten Programme hinterlegt. (State-Key: {stateKey})
          </div>
        )}
      </div>
    );
  };

  const renderNewsTab = () => (
    <div className="px-4 py-4 pb-24">
      <h2 className="text-4xl font-bold mb-5" style={{ color: 'var(--gov-heading)' }}>News</h2>
      <p className="text-[11px] text-gray-700 mb-4 p-3 bg-gray-100 border border-gray-200 rounded-lg">
        <strong>Nur verifizierte Meldungen:</strong> Hier erscheinen ausschließlich tatsächlich beschlossene bzw. offiziell bestätigte Vorgänge. Keine KI-generierten oder spekulativen Inhalte.
      </p>
      <div className="space-y-3">
        <div className="glass-panel rounded-xl p-4 border-l-4" style={{borderColor: 'var(--gov-btn)'}}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-xl" style={{ color: 'var(--gov-heading)' }}>EU AI Act in Kraft</h3>
            <span className="text-sm text-gray-500">01.08.2024</span>
          </div>
          <p className="text-base text-gray-600 mb-2">Die Verordnung (EU) 2024/1689 (KI-Gesetz) ist in Kraft. Sie regelt Transparenz, Risikoklassifizierung und Verantwortung bei KI-Systemen.</p>
          <span className="text-xs font-semibold text-gray-500">Quelle: Amtsblatt der EU, EUR-Lex</span>
        </div>
        <div className="glass-panel rounded-xl p-4 border-l-4 border-emerald-400">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-xl" style={{ color: 'var(--gov-heading)' }}>Deutschland-Ticket verlängert</h3>
            <span className="text-sm text-gray-500">2024</span>
          </div>
          <p className="text-base text-gray-600 mb-2">Das 49-Euro-Ticket wurde bundesweit eingeführt und fortgeführt. Gültig in allen Nahverkehrszügen und -bussen.</p>
          <span className="text-xs font-semibold text-gray-500">Quelle: Bundesministerium für Digitales und Verkehr</span>
        </div>
      </div>
    </div>
  );

  const renderKalenderTab = () => {
    // Nutze CalendarSection Komponente für Kalender
    return (
      <div className="px-4 py-4 pb-24">
        <CalendarSection votingData={votingData} currentLocation={currentLocation} priorities={priorities} menuItems={menuItems} />
      </div>
    );
  };

  type ErgebnisLevel = 'bund' | 'land' | 'kreis' | 'kommune';
  const ergebnisseListe: Array<{ id: string; title: string; date: string; result: 'Angenommen' | 'Abgelehnt'; yes: number; no: number; neutral: number; stimmen: number; level: ErgebnisLevel }> = [
    { id: '0a', title: 'EU-Migrationspaket', date: '2025-11-10', result: 'Angenommen', yes: 58, no: 38, neutral: 4, stimmen: 5100000, level: 'bund' },
    { id: '0b', title: 'Ganztagsschulen-Finanzierung SL', date: '2025-10-28', result: 'Angenommen', yes: 72, no: 24, neutral: 4, stimmen: 89500, level: 'land' },
    { id: '1', title: '365€ Jugendticket Saarland', date: '2025-09-20', result: 'Angenommen', yes: 76, no: 21, neutral: 3, stimmen: 187423, level: 'land' },
    { id: '2', title: 'Solar-Pflicht Neubauten Saarland', date: '2025-08-15', result: 'Angenommen', yes: 65, no: 30, neutral: 5, stimmen: 98234, level: 'land' },
    { id: '3', title: 'Digitalsteuer für Tech-Konzerne', date: '2025-07-10', result: 'Abgelehnt', yes: 45, no: 52, neutral: 3, stimmen: 4287432, level: 'bund' },
    { id: '4', title: 'Tempolimit 130 km/h', date: '2025-06-01', result: 'Abgelehnt', yes: 48, no: 49, neutral: 3, stimmen: 5293847, level: 'bund' },
    { id: '5', title: 'Vermögenssteuer ab 2 Mio. €', date: '2025-05-12', result: 'Angenommen', yes: 67, no: 28, neutral: 5, stimmen: 4127891, level: 'bund' },
    { id: '6', title: 'Grundrente auf 1.250€', date: '2025-04-08', result: 'Angenommen', yes: 71, no: 24, neutral: 5, stimmen: 4893176, level: 'bund' },
    { id: '7', title: 'Mehrzweckhalle Kirkel', date: '2025-03-22', result: 'Angenommen', yes: 82, no: 15, neutral: 3, stimmen: 4521, level: 'kommune' },
    { id: '8', title: 'LED-Straßenbeleuchtung Kirkel', date: '2025-02-14', result: 'Angenommen', yes: 78, no: 18, neutral: 4, stimmen: 3892, level: 'kommune' },
    { id: '9', title: 'Kreisklinikum Modernisierung', date: '2025-01-30', result: 'Abgelehnt', yes: 42, no: 55, neutral: 3, stimmen: 124500, level: 'kreis' },
    { id: '10', title: 'ÖPNV-Ticket 29€ Saarland', date: '2024-12-05', result: 'Angenommen', yes: 69, no: 26, neutral: 5, stimmen: 87500, level: 'land' },
    { id: '11', title: 'Windenergie-Zubau Region', date: '2024-11-18', result: 'Angenommen', yes: 62, no: 33, neutral: 5, stimmen: 92300, level: 'land' },
    { id: '12', title: 'Bürgerpark Jahreskarte Kirkel', date: '2024-10-20', result: 'Angenommen', yes: 85, no: 10, neutral: 5, stimmen: 2847, level: 'kommune' },
  ];

  const renderErgebnisseTab = () => {
    const mappedLocation = availableLocationIds.includes(currentLocation) ? currentLocation : (menuItems[0]?.id ?? 'deutschland');
    const currentLevel = (menuItems.find(m => m.id === mappedLocation)?.level?.toLowerCase() ?? 'bund') as ErgebnisLevel;
    const levelLabel = menuItems.find(m => m.id === mappedLocation)?.level ?? 'Bund';

    const monate = Number(ergebnisseZeitraum);
    const heute = new Date();
    const grenze = new Date(heute.getFullYear(), heute.getMonth() - monate, heute.getDate());
    const gefiltert = ergebnisseListe.filter((e) => {
      const d = new Date(e.date);
      if (d < grenze) return false;
      if (!showAllErgebnisse && e.level !== currentLevel) return false;
      return true;
    });

    return (
      <div className="px-4 py-4 pb-24">
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--gov-heading)' }}>Ergebnisse</h2>
        <p className="text-sm text-gray-600 mb-3">
          {showAllErgebnisse ? 'Alle Ebenen' : `Nur Ebene: ${levelLabel}`}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-sm text-gray-600">Zeitraum:</span>
          {(['3', '6', '12'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setErgebnisseZeitraum(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                ergebnisseZeitraum === m ? 'text-white gov-btn-bg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={ergebnisseZeitraum === m ? { background: 'var(--gov-btn, #0066cc)' } : {}}
            >
              {m} Monate
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setShowAllErgebnisse(!showAllErgebnisse)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            {showAllErgebnisse ? `Nur ${levelLabel}` : 'Zeige alle Ergebnisse'}
          </button>
        </div>
        <div className="space-y-3">
          {gefiltert.map((e) => (
            <div
              key={e.id}
              className={`glass-panel rounded-xl p-4 border-l-4 ${
                e.result === 'Angenommen' ? 'border-emerald-600' : 'border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <h3 className="font-bold text-lg" style={{ color: 'var(--gov-heading)' }}>{e.title}</h3>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full shrink-0 ${
                    e.result === 'Angenommen' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {e.result}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {e.stimmen.toLocaleString('de-DE')} Stimmen
              </p>
              <div className="flex h-2 rounded-full overflow-hidden mb-2">
                <div style={{ width: `${e.yes}%`, background: 'linear-gradient(90deg, #047857 0%, #059669 50%, #10b981 100%)' }} />
                <div style={{ width: `${e.no}%`, background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)' }} />
                <div style={{ width: `${e.neutral}%`, background: 'linear-gradient(90deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)' }} />
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-emerald-700">Ja {e.yes}%</span>
                <span className="text-red-600">Nein {e.no}%</span>
                <span className="text-gray-500">Enth. {e.neutral}%</span>
              </div>
            </div>
          ))}
        </div>
        {gefiltert.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">Keine Ergebnisse im gewählten Zeitraum.</p>
        )}
      </div>
    );
  };

  const renderPraemienTab = () => {
    // Lokale Prämien basierend auf Location
    const localRewards: Record<string, Array<{ id: string; name: string; points: number; emoji?: string; description?: string }>> = {
      kirkel: [
        { id: 'k1', name: 'Naturfreibad Kirkel - Eintritt frei', points: 5000, emoji: '🏊', description: 'Einmaliger kostenfreier Eintritt' },
        { id: 'k2', name: '1 Monat ÖPNV kostenfrei', points: 8000, emoji: '🚌', description: 'SaarVV-Ticket für 1 Monat' },
        { id: 'k3', name: 'Gemeindebücherei Jahreskarte', points: 3000, emoji: '📚', description: 'Kostenlose Jahreskarte' },
        { id: 'k4', name: 'Kirkeler Weihnachtsmarkt Gutschein 20€', points: 6000, emoji: '🎄', description: 'Gutschein für lokale Händler' },
        { id: 'k5', name: 'Bürgerfest VIP-Zugang', points: 4000, emoji: '🎉', description: 'Exklusiver Bereich & Catering' },
        { id: 'k6', name: 'Stadtführung kostenlos', points: 2500, emoji: '👣', description: 'Historische Führung durch Kirkel' },
        { id: 'k7', name: 'Bürgerpark Jahreskarte', points: 2000, emoji: '🌳', description: 'Kostenloser Zugang zum Bürgerpark' },
        { id: 'k8', name: 'Volkshochschule Kurs-Gutschein', points: 4500, emoji: '🎓', description: 'Ein kostenloser VHS-Kurs nach Wahl' },
        { id: 'k9', name: 'Lokaler Bäcker Gutschein 15€', points: 3500, emoji: '🥖', description: 'Unterstützung lokaler Betriebe' },
        { id: 'k10', name: 'Kita-Gebühren Rabatt 1 Monat', points: 7000, emoji: '👶', description: 'Für Familien mit Kindern' },
        { id: 'k11', name: 'Kino Saarbrücken 2x Karte', points: 4500, emoji: '🎬', description: 'CineStar oder UCI – 2 Eintritte' },
        { id: 'k12', name: 'Fitnessstudio 1 Monat ermäßigt', points: 6000, emoji: '💪', description: 'Partner-Gym in der Region (z. B. McFit)' }
      ],
      saarland: [
        { id: 's1', name: 'Saarland-Ticket 1 Monat', points: 6000, emoji: '🎫', description: 'Unbegrenzt ÖPNV im Saarland' },
        { id: 's2', name: 'Saarschleife Bootsfahrt', points: 8000, emoji: '⛵', description: 'Kostenlose Rundfahrt' },
        { id: 's3', name: 'Völklinger Hütte Jahreskarte', points: 6000, emoji: '🏭', description: 'UNESCO-Welterbe' },
        { id: 's4', name: 'Saarländisches Theater Gutschein', points: 7000, emoji: '🎭', description: '2x Karten für Vorstellung' },
        { id: 's5', name: 'Saarländisches Museum Jahreskarte', points: 5000, emoji: '🏛️', description: 'Kostenloser Zugang zu allen Museen' },
        { id: 's6', name: 'Erlebnisbad Calypso Eintritt', points: 4000, emoji: '💧', description: 'Einmaliger kostenfreier Besuch' },
        { id: 's7', name: 'Saarbrücken Zoo Jahreskarte', points: 5500, emoji: '🦁', description: 'Kostenloser Zugang für 1 Jahr' },
        { id: 's8', name: 'Universität des Saarlandes Bibliothek', points: 3000, emoji: '📖', description: 'Kostenloser Zugang zur Unibib' },
        { id: 's9', name: 'Ludwigsparkstadion Ticket', points: 4500, emoji: '⚽', description: '2x Karten für Heimspiel' },
        { id: 's10', name: 'Mettlacher Villeroy & Boch Ausstellung', points: 3500, emoji: '🍽️', description: 'Kostenloser Eintritt' }
      ],
      deutschland: [
        { id: 'd1', name: 'Amazon 25€', points: 25000, emoji: '📦' },
        { id: 'd2', name: 'Spotify 3 Monate', points: 15000, emoji: '🎵' },
        { id: 'd3', name: 'Büchergutschein 15€', points: 10000, emoji: '📖' },
        { id: 'd4', name: 'Deutschland-Ticket 1 Monat', points: 18000, emoji: '🚄', description: '49€ Ticket kostenlos' },
        { id: 'd5', name: 'Bundesmuseen Jahreskarte', points: 12000, emoji: '🎨', description: 'Kostenloser Zugang' }
      ],
      saarpfalz: [
        { id: 'sp1', name: 'Kreis-Netzwerk-Ticket 1 Monat', points: 10000, emoji: '🚍', description: 'ÖPNV im Kreis Saarpfalz' },
        { id: 'sp2', name: 'Wasserspielplatz Homburg Eintritt', points: 3000, emoji: '💦', description: 'Einmaliger kostenfreier Besuch' },
        { id: 'sp3', name: 'Kreismusikschule Schnupperkurs', points: 5000, emoji: '🎼', description: '4 kostenlose Unterrichtsstunden' },
        { id: 'sp4', name: 'Kino Homburg 2x Eintritt', points: 4500, emoji: '🎬', description: 'Kinocenter Homburg' },
        { id: 'sp5', name: 'Theater/Kultur Gutschein', points: 5500, emoji: '🎭', description: 'Kreiskultur oder Stadttheater' },
        { id: 'sp6', name: 'Sportverein / Gym 1 Monat', points: 5000, emoji: '💪', description: 'Vergünstigung bei Partnern im Kreis' }
      ]
    };

    // Kombiniere lokale + allgemeine Prämien
    const allRewards = [
      ...(localRewards[currentLocation] || []),
      // Allgemeine Prämien nur wenn noch Platz oder keine lokalen verfügbar
      ...(localRewards[currentLocation]?.length === 0 ? localRewards['deutschland'] || [] : [])
    ];

    return (
      <div className="px-4 py-4 pb-24">
        {!consentPraemien && (
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 mb-4 text-[11px] text-gray-800">
            <strong>Prämien einlösen?</strong> Für die Nutzung und Einlösung von Prämien ist {useFormalAddress ? 'Ihre' : 'deine'} Einwilligung nötig (Einstellungen → Einwilligung & Datenschutz → „Prämien & Teilnahme“). So bleibt die Verarbeitung {useFormalAddress ? 'Ihrer' : 'deiner'} Teilnahme rechtssicher und transparent.
          </div>
        )}
        <div className="glass-panel rounded-xl p-4 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-700">Deine Punkte</span>
            <span className="inline-block w-8 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getPunkteBadge(currentPoints).color }} title={getPunkteBadge(currentPoints).label} aria-hidden />
            <span className="text-lg font-bold tabular-nums ml-auto" style={{ color: 'var(--gov-heading)' }}>{currentPoints.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {totalVotes}× abgestimmt
          </p>
          <p className="text-xs text-gray-600 mt-2 font-medium">
            {getPunkteMotivation(currentPoints, totalVotes)}
          </p>
          <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">
            Dein Punktestand gilt für <strong>alle Ebenen</strong>. Prämien-Angebot hier: {locations[currentLocation as keyof typeof locations]?.name || currentLocation}.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4 mb-4 border border-gray-200 bg-blue-50/50">
          <h3 className="font-bold mb-2 text-gray-800 text-sm">So sammelst du Punkte</h3>
          <p className="text-[11px] text-gray-700 mb-2">
            Punkte gibt es für <strong>Teilnahme</strong>, unabhängig von deiner Meinung: Bei <strong>Abstimmungen</strong> (Tab „Abstimmen“) erhältst du Punkte, sobald du eine Stimme abgibst – ob dafür, dagegen oder Enthaltung. Zusätzlich: <strong>Wahlen</strong> (Stimmzettel abgeben) und <strong>Meldungen</strong> (z. B. Mängel melden). In dieser Demo werden die Punkte sofort im Punkte-Tab angezeigt.
          </p>
          <h3 className="font-bold mb-2 text-gray-800 text-sm mt-3">Stufen: Bronze, Silber, Gold, Diamant</h3>
          <ul className="text-[11px] text-gray-700 space-y-1">
            <li><strong>Bronze:</strong> 0 – 999 Punkte</li>
            <li><strong>Silber:</strong> 1.000 – 2.499 Punkte</li>
            <li><strong>Gold:</strong> 2.500 – 4.999 Punkte</li>
            <li><strong>Diamant:</strong> ab 5.000 Punkte</li>
          </ul>
          <p className="text-[11px] text-gray-500 mt-2">Die Stufe siehst du an der Farbe des Punktestands (oben und hier). Es reicht die farbige Hinterlegung – kein zusätzliches Icon.</p>
        </div>

        <div className="glass-panel rounded-xl p-4 mb-4 border border-gray-200 bg-gray-100/80">
          <h3 className="font-bold mb-2 text-gray-800 text-xs">Daten & Tracking</h3>
          <p className="text-[11px] text-gray-700 mb-2">
            <strong>Was passiert mit den Daten?</strong> Punktestand und Anzahl der Teilnahmen werden {useFormalAddress ? 'lokal auf Ihrem Gerät' : 'lokal auf deinem Gerät'} gespeichert. Für die Einlösung von Prämien wird nur die Bestätigung „X Punkte eingelöst“ an den Partner übermittelt – keine personenbezogenen Daten.
          </p>
          <p className="text-[11px] text-gray-700">
            <strong>Muss das getrackt werden?</strong> Ein geräteübergreifendes Tracking ist nicht nötig. Die Punkte gelten pro Gerät/App-Installation. {useFormalAddress ? 'Wenn Sie keine Prämien einlösen' : 'Wenn du keine Prämien einlösest'}, werden keine Daten an Dritte weitergegeben. Die Einwilligung „Prämien & Teilnahme“ {useFormalAddress ? 'können Sie' : 'kannst du'} jederzeit in den Einstellungen widerrufen.
          </p>
        </div>
        <div className="glass-panel rounded-xl p-4 mb-5 border border-gray-200/60">
          <h3 className="font-bold mb-2 text-xs" style={{ color: 'var(--gov-heading)' }}>Lokale Anreize</h3>
          <p className="text-[11px] text-gray-700 mb-2">
            <strong>Für was?</strong> Punkte gibt es für <strong>Abstimmungen</strong> (pro abgegebene Stimme), <strong>Wahlen</strong> (Teilnahme) und <strong>Meldungen</strong> (z. B. Mängel melden). {useFormalAddress ? 'So sehen Sie' : 'So siehst du'}, wo {useFormalAddress ? 'Ihre' : 'deine'} Punkte herkommen.
          </p>
          <p className="text-[11px] text-gray-700 mb-2">
            <strong>In welchem Rahmen?</strong> Kommunen, Länder oder anerkannte Partner (Freibad, Kino, Theater, Sport, Kultur) stellen die Vergünstigungen bereit. Die App zeigt sie an und ermöglicht die Einlösung nach Punkten; Finanzierung und Verantwortung liegen bei den Partnern vor Ort. Keine steuerlichen Anreize – nur einlösbare Prämien (nach {useFormalAddress ? 'Ihrer' : 'deiner'} Einwilligung).
          </p>
          <div className="text-[11px] text-gray-700 mb-3 p-3 rounded-lg bg-gray-100 border border-gray-200">
            <strong>Realistisch?</strong> Größere Prämien erfordern viele Teilnahmen (Abstimmungen, Wahlen, Meldungen). <strong>Einlösung:</strong> Beim Abholen der Vergünstigung kann eine einmalige Bestätigung nötig sein (z. B. Ausweis oder Partner-Code) – damit nur Berechtigte die Prämie erhalten. Keine komplizierte Technik {useFormalAddress ? 'für Sie' : 'für dich'}.
          </div>
          <button
            onClick={() => setShowTeilnahmebescheinigung(true)}
            className="w-full py-2.5 rounded-lg font-semibold text-sm bg-slate-700 text-white hover:bg-slate-800 transition-colors"
          >
            Teilnahmebescheinigung anzeigen
          </button>
        </div>

        {showTeilnahmebescheinigung && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTeilnahmebescheinigung(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Teilnahmebescheinigung</h3>
              <p className="text-sm text-gray-700 mb-4">
                Hiermit wird bestätigt, dass {useFormalAddress ? 'die Nutzerin/der Nutzer von eIDConnect' : 'du'} im Jahr 2025 an <strong>{totalVotes} Abstimmungen</strong> {useFormalAddress ? 'teilgenommen hat' : 'teilgenommen hast'}. Die Teilnahme erfolgte über die offizielle eIDConnect-App (Demo). Diese Bescheinigung dient ausschließlich zur Information und für private Unterlagen.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Stand: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}. Kein amtliches Dokument.
              </p>
              <button onClick={() => setShowTeilnahmebescheinigung(false)} className="w-full py-2.5 rounded-lg font-semibold text-white hover:opacity-90" style={{ background: 'var(--gov-btn)' }}>
                Schließen
              </button>
            </div>
          </div>
        )}

        <h2 className="text-4xl font-bold mb-5" style={{ color: 'var(--gov-heading)' }}>Prämien einlösen</h2>
        <div className="space-y-3">
          {allRewards.length > 0 ? (
            allRewards.map(r => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-md border-l-4" style={{borderColor: locations[currentLocation as keyof typeof locations]?.color || '#3B82F6'}}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-1">
                      <h3 className="font-bold text-2xl">{r.name}</h3>
                      <p className="text-base text-gray-600 mt-1">{r.points.toLocaleString()} Punkte</p>
                      {r.description && (
                        <p className="text-sm text-gray-500 mt-1 italic">{r.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  disabled={currentPoints < r.points || !consentPraemien}
                  className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                    currentPoints >= r.points && consentPraemien
                      ? 'text-white hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  style={currentPoints >= r.points && consentPraemien ? { background: 'var(--gov-btn)' } : {}}
                >
                  {!consentPraemien ? 'Einwilligung in Einstellungen nötig' : currentPoints >= r.points ? 'Einlösen' : 'Nicht genug Punkte'}
                </button>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600">Keine Prämien für diese Region verfügbar</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderClaraTab = () => (
    <div className="px-4 py-4 pb-24 flex flex-col min-h-0">
      <h2 className="text-xl font-bold mb-1 flex-shrink-0" style={{ color: 'var(--gov-heading)' }}>Clara – KI-Assistent</h2>
      <p className="text-xs text-gray-600 mb-3 flex-shrink-0">Neutral, nur Information mit Quellenverweis – keine Beratung.</p>
      <div className="flex-1 min-h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg flex flex-col">
        <ClaraChat
          level={claraLevel}
          selectedWahl={null}
          onPointsEarned={() => {}}
        />
      </div>
    </div>
  );

  const renderMeldenTab = () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const reportsLastHour = mangelReports.filter(r => r.createdAt >= oneHourAgo);
    const canSubmit = reportsLastHour.length < MELDEN_MAX_PRO_STUNDE;
    const handleSubmit = () => {
      if (!canSubmit) return;
      if (!meldenCategory.trim() || !meldenDescription.trim()) {
        showToastMessage('Bitte Kategorie und Beschreibung angeben.');
        return;
      }
      const ts = Date.now();
      setMangelReports(prev => [...prev, {
        id: `m-${ts}`,
        category: meldenCategory,
        description: meldenDescription.trim(),
        status: 'gemeldet',
        createdAt: ts,
        city: resolvedRegion?.city || resolvedRegion?.municipality || viewerCity || undefined,
        district: resolvedRegion?.county || undefined,
        photo: meldenPhoto || undefined
      }]);
      setMeldenCategory('');
      setMeldenDescription('');
      setMeldenPhoto(null);
      setMeldenSuccess(true);
      setTimeout(() => setMeldenSuccess(false), 3000);
      setCurrentPoints(prev => prev + MELDEN_POINTS);
      showToastMessage(`Meldung abgesendet. +${MELDEN_POINTS} Punkte`);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxW = 400;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setMeldenPhoto(dataUrl);
        }
      };
      img.src = url;
      e.target.value = '';
    };
    return (
      <div className="px-4 py-4 pb-24">
        <h2 className="text-4xl font-bold mb-5" style={{ color: 'var(--gov-heading)' }}>Mängel melden</h2>
        <p className="text-sm text-gray-600 mb-4">{useFormalAddress ? 'Melden Sie' : 'Melde'} Schäden oder Mängel in {useFormalAddress ? 'Ihrer' : 'deiner'} Umgebung. {useFormalAddress ? 'Ihre' : 'Deine'} Meldung wird {useFormalAddress ? 'Ihrer' : 'deiner'} Kommune angezeigt.</p>

        <div className="glass-panel rounded-xl p-4 mb-5">
          <h3 className="font-bold mb-3" style={{ color: 'var(--gov-heading)' }}>Neue Meldung</h3>
          {!canSubmit && (
            <div className="mb-3 p-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-800 text-[11px]">
              {useFormalAddress ? 'Sie haben' : 'Du hast'} in dieser Stunde bereits {MELDEN_MAX_PRO_STUNDE} Meldungen abgegeben. Bitte später erneut versuchen.
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kategorie</label>
              <div className="grid grid-cols-2 gap-2">
                {MAENGEL_CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setMeldenCategory(c.id)}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-center ${meldenCategory === c.id ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    style={meldenCategory === c.id ? { background: 'var(--gov-btn)' } : {}}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Beschreibung</label>
              <textarea
                value={meldenDescription}
                onChange={(e) => setMeldenDescription(e.target.value)}
                placeholder="z. B. defekte Straßenlaterne an der Ecke Musterstraße / Nebenweg"
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 min-h-[80px]"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Foto (optional)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:text-white file:cursor-pointer"
                style={{ accentColor: 'var(--gov-btn)' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Fotos werden nur der Meldung zugeordnet und nicht mit persönlichen Daten verknüpft gespeichert.
              </p>
              {meldenPhoto && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={meldenPhoto} alt="Vorschau" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => setMeldenPhoto(null)} className="text-sm text-red-600 font-medium">Entfernen</button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">Standort: {resolvedRegion?.city || resolvedRegion?.municipality || viewerCity || '—'} {resolvedRegion?.county ? `(${resolvedRegion.county})` : ''}</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || !meldenCategory.trim() || !meldenDescription.trim()}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: 'var(--gov-btn)' }}
            >
              Meldung absenden
            </button>
          </div>
          {meldenSuccess && (
            <p className="mt-3 text-sm font-semibold text-emerald-700">✓ Meldung erfasst. Die Meldung erscheint unter „Meine Meldungen“.</p>
          )}
        </div>

        <h3 className="font-bold mb-3" style={{ color: 'var(--gov-heading)' }}>Meine Meldungen</h3>
        {mangelReports.length === 0 ? (
          <div className="glass-panel rounded-xl p-6 text-center text-gray-500 text-sm">
            Noch keine Meldungen. {useFormalAddress ? 'Erfassen Sie' : 'Erfasse'} oben eine neue Meldung.
          </div>
        ) : (
          <div className="space-y-3">
            {[...mangelReports].reverse().map(r => {
              const cat = MAENGEL_CATEGORIES.find(c => c.id === r.category);
              const statusLabel = r.status === 'gemeldet' ? 'Gemeldet' : r.status === 'in_bearbeitung' ? 'In Bearbeitung' : 'Erledigt';
              const statusColor = r.status === 'gemeldet' ? 'bg-blue-100 text-blue-800' : r.status === 'in_bearbeitung' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-100 text-emerald-800';
              return (
                <div key={r.id} className="glass-panel rounded-xl p-4 border-l-4" style={{ borderColor: 'var(--gov-btn)' }}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-gray-900">{cat?.label || r.category}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>{statusLabel}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{r.description}</p>
                  {r.photo && <img src={r.photo} alt="Meldung" className="mt-2 h-24 w-auto max-w-full object-cover rounded-lg border border-gray-200" />}
                  <p className="text-xs text-gray-500 mt-1">{new Date(r.createdAt).toLocaleString('de-DE')} {r.city && ` · ${r.city}`}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center items-start sm:items-center p-2 sm:p-4 bg-white" style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      minHeight: 0,
    }}>
      <div className="relative" style={{width: '393px', height: '852px'}}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-black rounded-b-3xl z-50" />

        <div className="w-full h-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-black relative flex flex-col">
          
          <div className={`absolute top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold z-50 text-base ${showToast ? 'opacity-100' : 'opacity-0 -translate-y-20'} transition-all`}>
            {toastMessage}
          </div>

          {showSettings && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl p-5 w-full max-w-xs my-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Einstellungen</h2>
                  <button onClick={() => setShowSettings(false)}><X className="w-5 h-5" /></button>
                </div>
                
                <p className="text-sm font-semibold text-gray-800 mb-2">{useFormalAddress ? 'Ihr' : 'Dein'} Politik-Barometer</p>
                <p className="text-xs text-gray-500 mb-3">Priorisierung für Clara und Kalender-Hervorhebungen.</p>
                <div className="space-y-2 mb-4">
                  {Object.entries(priorities).map(([key, value]) => {
                    const labels: Record<string, string> = { umwelt: 'Umwelt & Klima', wirtschaft: 'Wirtschaft', bildung: 'Bildung', digitalisierung: 'Digitalisierung', soziales: 'Soziales', sicherheit: 'Sicherheit' };
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs w-24 shrink-0 text-gray-700">{labels[key] || key}</span>
                        <input type="range" min="0" max="100" value={value} onChange={(e) => setPriorities({ ...priorities, [key]: Number(e.target.value) })} className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200" style={{ accentColor: 'var(--gov-btn)' }} />
                        <span className="text-xs font-bold w-8 text-right text-gray-600">{value}%</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 mb-4 border-t pt-3">
                  <button 
                    onClick={() => {
                      setShowIntro(true);
                      setIntroStep(1);
                      setShowSettings(false);
                    }}
                    className="w-full py-3 rounded-lg font-bold text-sm text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'var(--gov-btn)' }}
                  >
                    Zurück zum Intro
                  </button>
                  
                  <button 
                    onClick={() => {
                      setShowIntro(true);
                      setIntroStep(3);
                      setShowSettings(false);
                    }}
                    className="w-full py-3 rounded-lg font-bold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Politik-Barometer (ausführlich)
                  </button>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm font-bold text-gray-800 mb-2">Einwilligung & Datenschutz</p>
                  <label className="flex items-start gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={consentPraemien}
                      onChange={(e) => setConsentPraemien(e.target.checked)}
                      className="mt-1 rounded border-gray-300"
                    />
                    <span className="text-xs text-gray-700">
                      <strong>Prämien & Teilnahme:</strong> Ich willige ein, dass meine Teilnahme (Abstimmungen/Wahlen) für die Freischaltung und Einlösung von Prämien genutzt wird. Widerrufbar jederzeit in den Einstellungen.
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Cookies/Speicher:</strong> Es werden nur technisch notwendige Speicher verwendet. Keine Marketing-Cookies. Optionale Analyse-Cookies werden derzeit nicht gesetzt.
                  </p>
                </div>

                <div className="text-center text-xs text-gray-500 pt-3 border-t">
                  <p className="mb-1">Transparenz · Quellen · Datenschutz</p>
                  <p className="font-bold text-gray-800">Quellenbasiert · nachvollziehbar</p>
                  <div className="mt-2 flex gap-2 justify-center text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded font-semibold">DSGVO</span>
                    <span className="bg-gray-100 px-2 py-1 rounded font-semibold">EU-AI-ACT</span>
                    <span className="bg-gray-100 px-2 py-1 rounded font-semibold">eIDAS 2.0</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold">Deutsche KI · Daten in Deutschland</p>
                </div>
              </div>
            </div>
          )}

          {/* Header: Logo immer sichtbar | Punkte + „× abgestimmt“ darunter | Einstellungen */}
          <div className="glass-panel px-3 pt-4 pb-2 flex-shrink-0 flex items-center justify-between gap-2 border-b border-gray-200/80 min-h-0 overflow-hidden max-w-full" style={{ paddingTop: 'max(2.25rem, env(safe-area-inset-top, 0px))' }}>
            <div className="flex-shrink-0 min-w-0 flex justify-start" style={{ minWidth: '6rem' }}>
              <h1 className="text-lg font-bold whitespace-nowrap gov-heading-color" style={{ letterSpacing: '-0.02em', color: 'var(--gov-heading, #374151)' }}>eIDConnect</h1>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('rewards')}
              className="flex flex-col items-center justify-center gap-0 py-1.5 px-2.5 rounded-lg border-0 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ backgroundColor: getPunkteBadge(currentPoints).color }}
              title="Zum Punktestand (Punkte-Tab)"
              aria-label={`${currentPoints.toLocaleString()} Punkte, ${totalVotes} mal abgestimmt. Zum Punktestand wechseln`}
            >
              <span className="text-sm font-bold tabular-nums text-white leading-tight">{currentPoints.toLocaleString()} Punkte</span>
              <span className="text-[10px] sm:text-xs text-white/90 leading-tight">{totalVotes}× abgestimmt</span>
            </button>
            <div className="flex-shrink-0 flex justify-end">
              <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl transition-colors text-white hover:opacity-90 gov-btn-bg" style={{ background: 'var(--gov-btn, #0066cc)' }} aria-label="Einstellungen" title="Einstellungen">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ebenen-Slider: Bund, Land, Kreis, Kommune – wischen bei 4+ Ebenen */}
          <div className="glass-panel flex-shrink-0 min-w-0 border-b border-gray-200/80 max-w-full relative">
            <div
              ref={locationStripRef}
              onScroll={updateLocationStripScroll}
              className="flex gap-1.5 py-1.5 pl-2 pr-2 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth snap-x snap-mandatory justify-evenly"
              style={{ WebkitOverflowScrolling: 'touch' }}
              role="tablist"
              aria-label="Ebenen: Bund, Land, Kreis, Kommune"
            >
              {availableLocationIds.map(loc => {
                const locInfo = locations[loc as keyof typeof locations];
                const levelLabel = locInfo?.level === 'Bezirk' ? 'Kreis' : (locInfo?.level ?? '');
                const nameRaw = locInfo?.name ?? loc;
                const nameForTab = (levelLabel === 'Kreis' && nameRaw && /kreis$/i.test(nameRaw))
                  ? nameRaw.replace(/\s*[-–]\s*Kreis\s*$/i, '').trim() || nameRaw
                  : nameRaw;
                const fullLabel = `${nameForTab} · ${levelLabel}`;
                return (
                <button
                  key={loc}
                  id={`location-tab-${loc}`}
                  role="tab"
                  aria-selected={currentLocation === loc}
                  aria-label={fullLabel}
                  title={fullLabel}
                  onClick={() => { setCurrentLocation(loc); setVotedCards(loc === 'saarland' ? ['s1'] : []); }}
                  className={`flex-shrink-0 min-w-[3.8rem] flex-1 max-w-[6rem] px-2 py-1.5 rounded-lg font-semibold text-[11px] sm:text-sm whitespace-nowrap transition-colors flex flex-col items-center justify-center leading-tight snap-start ${
                    currentLocation === loc
                      ? 'text-white border border-white/30'
                      : 'text-gray-600 bg-gray-100/80 hover:bg-gray-200/80'
                  }`}
                  style={currentLocation === loc ? {
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 35%, #2563eb 65%, #3b82f6 100%)',
                    boxShadow: '0 2px 12px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                  } : {}}
                >
                  <span>{nameForTab}</span>
                  <span className={`text-[10px] sm:text-xs font-medium mt-0.5 ${currentLocation === loc ? 'text-white/90' : 'text-gray-500'}`}>{levelLabel}</span>
                </button>
              ); })}
            </div>
            {/* Fade rechts: zeigt an, dass weiter gewischt werden kann */}
            {locationScroll.canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-white to-transparent border-b border-transparent" aria-hidden />
            )}
            {locationScroll.canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none bg-gradient-to-r from-white to-transparent border-b border-transparent" aria-hidden />
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white max-w-full" style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 16px)', paddingRight: '0.5rem' }}>
            {currentTab === 'voting' && renderVotingTab()}
            {currentTab === 'wahlen' && renderWahlenTab()}
            {currentTab === 'programme' && renderProgrammeTab()}
            {currentTab === 'clara' && renderClaraTab()}
            {currentTab === 'melden' && renderMeldenTab()}
            {currentTab === 'news' && renderNewsTab()}
            {currentTab === 'kalender' && renderKalenderTab()}
            {currentTab === 'ergebnisse' && renderErgebnisseTab()}
            {currentTab === 'rewards' && renderPraemienTab()}
          </div>

          <footer
            className="absolute bottom-0 left-0 right-0 border-t border-gray-200/80 glass-panel flex flex-col items-stretch flex-shrink-0 overflow-hidden max-w-full"
            style={{ paddingTop: '6px', paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))', paddingLeft: '6px', paddingRight: '6px' }}
          >
            <div className="flex justify-between items-center gap-1 min-h-[40px]">
              {[
                { id: 'melden', label: 'Melden' },
                { id: 'voting', label: 'Abstimmen' },
                { id: 'wahlen', label: 'Wahlen' },
                { id: 'kalender', label: 'Kalender' },
                { id: 'ergebnisse', label: 'Ergebnisse' },
                { id: 'rewards', label: 'Punkte' }
              ].map((tab) => {
                const isRewards = tab.id === 'rewards';
                const isActive = currentTab === tab.id;
                return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex-1 min-w-0 py-2 px-1 rounded-lg font-semibold text-[11px] leading-tight transition-colors truncate ${
                    isActive ? 'text-white border border-white/30' : 'text-gray-600 hover:text-gray-900 bg-gray-100/80 hover:bg-gray-200/80'
                  }`}
                  style={isActive ? (isRewards
                    ? { background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)', boxShadow: '0 2px 12px rgba(14, 165, 233, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }
                    : { background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 35%, #2563eb 65%, #3b82f6 100%)', boxShadow: '0 2px 12px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }
                  ) : {}}
                >
                  {tab.label}
                </button>
              ); })}
            </div>
          </footer>

          {/* Clara im iPhone-Rahmen (absolute, nicht fixed) */}
          {!showIntro && (
            <div className="absolute bottom-[4.5rem] right-3 z-40" style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 0.5rem)' }}>
              <ClaraFloatingButton onOpenClara={() => setCurrentTab('clara')} position="absolute" />
            </div>
          )}
        </div>
      </div>
      
      {/* Stimmzettel Modal */}
      <StimmzettelModal />
    </div>
  );
};

export default BuergerApp;