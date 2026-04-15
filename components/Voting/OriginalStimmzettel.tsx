'use client';

import React, { useState } from 'react';
import { Info, Sparkles, X, MessageCircle, BookOpen, TrendingUp } from 'lucide-react';
import { isTrustedEvidenceUrl } from '@/lib/clara-evidence';

/* Clara-Farben (wie Clara-Chat / Floating-Button) */
const CLARA_BG = '#F5F0FF';
const CLARA_BORDER = '#E6E6FA';
const CLARA_TEXT = '#6B5B95';
const CLARA_GRADIENT = 'linear-gradient(160deg, #4C1D95 0%, #6D28D9 25%, #7C3AED 45%, #8B5CF6 65%, #A78BFA 85%, #C4B5FD 100%)';

// Demonstrations-Stimmzettel (vereinfachte Darstellung; keine amtliche Wahlvorlage).
// Faktenbasis: zugelassene Landeslisten/Ergebnisse (Bundeswahlleiterin, Landeswahlleitung Saarland, Stand 2024/2025).
const BUNDESTAG_KANDIDATEN = [
  {
    name: 'Josephine Ortleb',
    partei: 'SPD',
    parteiLang: 'Sozialdemokratische Partei Deutschlands',
    beruf: 'Direktkandidatin / MdB',
    alter: 38,
    wahlkreis: 'Saarbrücken',
    kiInfo: 'Direktmandat Saarbrücken (Bundestagswahl 2025, Saarland).',
    positionen: ['Arbeit', 'Soziales', 'Demokratie'],
    matchScore: 76,
  },
  {
    name: 'Philip Hoffmann',
    partei: 'CDU',
    parteiLang: 'Christlich Demokratische Union Deutschlands',
    beruf: 'Direktkandidat / MdB',
    alter: 34,
    wahlkreis: 'Saarlouis',
    kiInfo: 'Direktmandat Saarlouis (Bundestagswahl 2025, Saarland).',
    positionen: ['Wirtschaft', 'Sicherheit', 'Familie'],
    matchScore: 71,
  },
  {
    name: 'Roland Theis',
    partei: 'CDU',
    parteiLang: 'Christlich Demokratische Union Deutschlands',
    beruf: 'Direktkandidat / MdB',
    alter: 45,
    wahlkreis: 'St. Wendel',
    kiInfo: 'Direktmandat St. Wendel (Bundestagswahl 2025, Saarland).',
    positionen: ['Wirtschaft', 'Europa', 'Digitalisierung'],
    matchScore: 70,
  },
  {
    name: 'Esra Limbacher',
    partei: 'SPD',
    parteiLang: 'Sozialdemokratische Partei Deutschlands',
    beruf: 'Direktkandidat / MdB',
    alter: 36,
    wahlkreis: 'Homburg',
    kiInfo: 'Direktmandat Homburg (Bundestagswahl 2025, Saarland).',
    positionen: ['Arbeit', 'Recht', 'Sozialstaat'],
    matchScore: 77,
  },
];

const BUNDESTAG_PARTEIEN = [
  { kuerzel: 'BSW', name: 'Bündnis Sahra Wagenknecht', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Soziales', 'Frieden'], matchScore: 70 },
  { kuerzel: 'GRÜNE', name: 'BÜNDNIS 90/DIE GRÜNEN', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Klima', 'Energie'], matchScore: 86 },
  { kuerzel: 'BÜD', name: 'Bündnis Deutschland', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Wirtschaft', 'Sicherheit'], matchScore: 50 },
  { kuerzel: 'MLPD', name: 'Marxistisch-Leninistische Partei Deutschlands', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Soziales'], matchScore: 45 },
  { kuerzel: 'PIRATEN', name: 'Piratenpartei Deutschland', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Digitalisierung'], matchScore: 58 },
  { kuerzel: 'VOLT', name: 'Volt Deutschland', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Europa', 'Digitalisierung'], matchScore: 66 },
  { kuerzel: 'FW', name: 'FREIE WÄHLER', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Kommunen'], matchScore: 62 },
  { kuerzel: 'TIER', name: 'Tierschutzpartei', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Tierschutz'], matchScore: 57 },
  { kuerzel: 'LINKE', name: 'DIE LINKE', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Soziales'], matchScore: 73 },
  { kuerzel: 'AfD', name: 'Alternative für Deutschland', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Migration', 'Sicherheit'], matchScore: 35 },
  { kuerzel: 'FDP', name: 'Freie Demokratische Partei', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Wirtschaft', 'Digitalisierung'], matchScore: 65 },
  { kuerzel: 'CDU', name: 'Christlich Demokratische Union Deutschlands', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Wirtschaft', 'Familie'], matchScore: 71 },
  { kuerzel: 'SPD', name: 'Sozialdemokratische Partei Deutschlands', kiInfo: 'Zugelassene Landesliste Saarland (2025).', positionen: ['Arbeit', 'Soziales'], matchScore: 78 },
];

const LANDTAG_KANDIDATEN = [
  { name: 'SPD-Landesliste', partei: 'SPD', parteiLang: 'Sozialdemokratische Partei Deutschlands', beruf: 'Parteiliste', alter: 0, kiInfo: 'Landtagswahl Saarland: relevante Parteiliste (amtliche Wahlergebnisse 2022 / laufende Vorbereitung neuer Wahl).', positionen: ['Soziales', 'Arbeit'], matchScore: 78 },
  { name: 'CDU-Landesliste', partei: 'CDU', parteiLang: 'Christlich Demokratische Union Deutschlands', beruf: 'Parteiliste', alter: 0, kiInfo: 'Landtagswahl Saarland: relevante Parteiliste (amtliche Wahlergebnisse 2022 / laufende Vorbereitung neuer Wahl).', positionen: ['Wirtschaft', 'Sicherheit'], matchScore: 71 },
  { name: 'AfD-Landesliste', partei: 'AfD', parteiLang: 'Alternative für Deutschland', beruf: 'Parteiliste', alter: 0, kiInfo: 'Landtagswahl Saarland: relevante Parteiliste (amtliche Wahlergebnisse 2022 / laufende Vorbereitung neuer Wahl).', positionen: ['Migration', 'Sicherheit'], matchScore: 35 },
  { name: 'GRÜNE-Landesliste', partei: 'GRÜNE', parteiLang: 'BÜNDNIS 90/DIE GRÜNEN', beruf: 'Parteiliste', alter: 0, kiInfo: 'Landtagswahl Saarland: Parteiliste (nicht im Landtag 2022 vertreten).', positionen: ['Klima', 'Energie'], matchScore: 84 },
  { name: 'FDP-Landesliste', partei: 'FDP', parteiLang: 'Freie Demokratische Partei', beruf: 'Parteiliste', alter: 0, kiInfo: 'Landtagswahl Saarland: Parteiliste (nicht im Landtag 2022 vertreten).', positionen: ['Wirtschaft', 'Digitalisierung'], matchScore: 64 },
];

/** Kreistag Saarpfalz-Kreis – demonstrative Namensliste (Spitzenämter / Listen). */
const KREISTAG_SAARPFALZ_KANDIDATEN = [
  { name: 'CDU-Liste Saarpfalz', partei: 'CDU', parteiLang: 'Christlich Demokratische Union Deutschlands', beruf: 'Kreistagsliste', alter: 0, kiInfo: 'Kreistagswahl Saarpfalz-Kreis 2024: zugelassene Liste.', positionen: ['Wirtschaft', 'Sicherheit'], matchScore: 72 },
  { name: 'SPD-Liste Saarpfalz', partei: 'SPD', parteiLang: 'Sozialdemokratische Partei Deutschlands', beruf: 'Kreistagsliste', alter: 0, kiInfo: 'Kreistagswahl Saarpfalz-Kreis 2024: zugelassene Liste.', positionen: ['Soziales', 'Bildung'], matchScore: 79 },
  { name: 'AfD-Liste Saarpfalz', partei: 'AfD', parteiLang: 'Alternative für Deutschland', beruf: 'Kreistagsliste', alter: 0, kiInfo: 'Kreistagswahl Saarpfalz-Kreis 2024: zugelassene Liste.', positionen: ['Sicherheit', 'Haushalt'], matchScore: 35 },
  { name: 'GRÜNE-Liste Saarpfalz', partei: 'GRÜNE', parteiLang: 'BÜNDNIS 90/DIE GRÜNEN', beruf: 'Kreistagsliste', alter: 0, kiInfo: 'Kreistagswahl Saarpfalz-Kreis 2024: zugelassene Liste.', positionen: ['Klima', 'Mobilität'], matchScore: 84 },
  { name: 'FWG-Liste Saarpfalz', partei: 'FWG', parteiLang: 'Freie Wählergemeinschaft Saarpfalz-Kreis', beruf: 'Kreistagsliste', alter: 0, kiInfo: 'Kreistagswahl Saarpfalz-Kreis 2024: zugelassene Liste.', positionen: ['Kommunen', 'Pragmatik'], matchScore: 63 },
  { name: 'FAMILIE-Liste Saarpfalz', partei: 'FAMILIE', parteiLang: 'Familien-Partei Deutschland', beruf: 'Kreistagsliste', alter: 0, kiInfo: 'Kreistagswahl Saarpfalz-Kreis 2024: zugelassene Liste.', positionen: ['Familie', 'Soziales'], matchScore: 58 },
  { name: 'LINKE-Liste Saarpfalz', partei: 'DIE LINKE', parteiLang: 'DIE LINKE', beruf: 'Kreistagsliste', alter: 0, kiInfo: 'Kreistagswahl Saarpfalz-Kreis 2024: zugelassene Liste.', positionen: ['Soziales', 'Umverteilung'], matchScore: 71 },
  { name: 'FDP-Liste Saarpfalz', partei: 'FDP', parteiLang: 'Freie Demokratische Partei', beruf: 'Kreistagsliste', alter: 0, kiInfo: 'Kreistagswahl Saarpfalz-Kreis 2024: zugelassene Liste.', positionen: ['Wirtschaft', 'Digitalisierung'], matchScore: 64 },
];

// Kommunalwahl Kirkel - Gemeinderat/Verbandsgemeinde
const KOMMUNAL_KANDIDATEN = [
  { name: 'CDU-Liste Kirkel', partei: 'CDU', parteiLang: 'Christlich Demokratische Union Deutschlands', beruf: 'Gemeinderatsliste', alter: 0, wohnort: 'Kirkel', kiInfo: 'Gemeinderatswahl Kirkel 2024: zugelassene Liste.', positionen: ['Kommunalhaushalt', 'Infrastruktur'], matchScore: 72 },
  { name: 'SPD-Liste Kirkel', partei: 'SPD', parteiLang: 'Sozialdemokratische Partei Deutschlands', beruf: 'Gemeinderatsliste', alter: 0, wohnort: 'Kirkel', kiInfo: 'Gemeinderatswahl Kirkel 2024: zugelassene Liste.', positionen: ['Soziales', 'Kommune'], matchScore: 78 },
  { name: 'FDP-Liste Kirkel', partei: 'FDP', parteiLang: 'Freie Demokratische Partei', beruf: 'Gemeinderatsliste', alter: 0, wohnort: 'Kirkel', kiInfo: 'Gemeinderatswahl Kirkel 2024: zugelassene Liste.', positionen: ['Wirtschaft', 'Digitalisierung'], matchScore: 64 },
  { name: 'GRÜNE-Liste Kirkel', partei: 'GRÜNE', parteiLang: 'BÜNDNIS 90/DIE GRÜNEN', beruf: 'Gemeinderatsliste', alter: 0, wohnort: 'Kirkel', kiInfo: 'Gemeinderatswahl Kirkel 2024: zugelassene Liste.', positionen: ['Klima', 'Nachhaltigkeit'], matchScore: 84 },
  { name: 'LINKE-Liste Kirkel', partei: 'DIE LINKE', parteiLang: 'DIE LINKE', beruf: 'Gemeinderatsliste', alter: 0, wohnort: 'Kirkel', kiInfo: 'Gemeinderatswahl Kirkel 2024: zugelassene Liste.', positionen: ['Soziales', 'Teilhabe'], matchScore: 70 },
];

interface StimmzettelProps {
  level: 'bund' | 'land' | 'kreis' | 'kommune';
  wahlkreis?: string;
  onVote: (level: string, candidate: string, party: string) => void;
  onKIAnalysis: (type: 'kandidat' | 'partei', data: any) => void;
  onOpenClaraChat?: (context?: string) => void;
}
type BallotViewMode = 'originalnah' | 'kompakt';

interface ClaraInfoModalProps {
  data: any;
  type: 'kandidat' | 'partei';
  onClose: () => void;
  onOpenChat: (context?: string) => void;
}

function inferDataStatus(data: any): 'verified' | 'partial' | 'missing' {
  const text = String(data?.kiInfo || '').toLowerCase();
  if (/(direktmandat|zugelassene|amtliche|bundeswahlleiterin|landeswahlleitung)/i.test(text)) return 'verified';
  if (text.length > 0) return 'partial';
  return 'missing';
}

function dataStatusBadge(status: 'verified' | 'partial' | 'missing') {
  if (status === 'verified') return { label: 'Datenstatus: verifiziert', tone: 'bg-emerald-100 text-emerald-900' };
  if (status === 'partial') return { label: 'Datenstatus: teilverifiziert', tone: 'bg-amber-100 text-amber-900' };
  return { label: 'Datenstatus: offen', tone: 'bg-rose-100 text-rose-900' };
}

function buildStrictSources(type: 'kandidat' | 'partei', data: any): Array<{ label: string; url: string }> {
  const base = [
    { label: 'Bundeswahlleiterin', url: 'https://www.bundeswahlleiterin.de' },
    { label: 'Landeswahlleitung Saarland', url: 'https://www.saarland.de' },
  ];
  if (type === 'kandidat' && data?.wikipediaUrl) base.push({ label: 'Wikipedia (Sekundärquelle)', url: data.wikipediaUrl });
  return base.filter((s) => isTrustedEvidenceUrl(s.url));
}

// Clara Info Bottom Sheet Modal – bleibt innerhalb des iPhone-Screens (safe area, scrollbarer Inhalt)
const ClaraInfoModal: React.FC<ClaraInfoModalProps> = ({ data, type, onClose, onOpenChat }) => {
  const status = inferDataStatus(data);
  const statusBadge = dataStatusBadge(status);
  const strictSources = buildStrictSources(type, data);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[99999] p-0 md:p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
      <div
        className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ maxHeight: 'min(90dvh, calc(100svh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 48px))' }}
      >
        {/* Header – gleiche Farbe wie Clara-Chat */}
        <div className="text-white p-3 sm:p-5 flex justify-between items-center gap-2 flex-shrink-0" style={{ background: CLARA_GRADIENT, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold">Clara erklärt</h3>
              <p className="text-[11px] sm:text-xs opacity-90 truncate min-w-0">
                {type === 'kandidat' ? data.name : data.kuerzel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content – scrollbar, bleibt im Rahmen */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-5 space-y-3 sm:space-y-5">
          {/* KI Info */}
          <div className="aria-box">
            <div className="aria-label">ARIA EXECUTIVE INTELLIGENCE</div>
            <div className="aria-content">
              <p className="font-semibold mb-2">KEY INSIGHT:</p>
              <p>{data.kiInfo}</p>
              <div className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusBadge.tone}`}>
                {statusBadge.label}
              </div>
            </div>
          </div>

          {/* Positionen */}
          {data.positionen && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp size={18} style={{ color: CLARA_TEXT }} />
                Wichtigste Positionen
              </h4>
              <div className="space-y-2">
                {data.positionen.map((pos: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: CLARA_BG }}>
                      <span className="text-xs font-bold" style={{ color: CLARA_TEXT }}>{i + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700">{pos}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match Score */}
          {data.matchScore && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Match mit deinen Prioritäten</span>
                <span className="text-2xl font-bold" style={{ color: CLARA_TEXT }}>{data.matchScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ background: CLARA_GRADIENT, width: `${data.matchScore}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Quellen */}
          <div className="pt-3 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BookOpen size={16} className="text-gray-600" />
              Quellen
            </h4>
            {strictSources.length > 0 ? (
              <div className="space-y-1 text-xs text-gray-600">
                {strictSources.map((s) => (
                  <p key={s.url}>
                    •{' '}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {s.label}
                    </a>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-rose-700">Keine verifizierte Primärquelle hinterlegt (Strict-Evidence).</p>
            )}
          </div>

          <p className="text-xs text-gray-600 pt-2 border-t border-gray-100">
            <strong>Parteiprogramm und Kandidateninfos</strong> – hier in Clara per Chat, Sprache oder Schreiben erfragen.
          </p>
        </div>

        {/* Footer Actions – fix am unteren Rand, Safe Area */}
        <div className="border-t border-gray-200 p-3 sm:p-4 flex gap-2 sm:gap-3 flex-shrink-0" style={{ backgroundColor: CLARA_BG, borderColor: CLARA_BORDER, paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
          <button
            onClick={() => {
              onOpenChat(type === 'kandidat' ? `Erkläre mir ${data.name} und das Parteiprogramm` : `Was plant ${data.kuerzel}? Zeig mir das Wahlprogramm.`);
              onClose();
            }}
            className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            style={{ background: CLARA_GRADIENT, boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)' }}
          >
            <MessageCircle size={18} />
            Mit Clara chatten
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

const OriginalStimmzettel: React.FC<StimmzettelProps> = ({ level, wahlkreis, onVote, onKIAnalysis, onOpenClaraChat }) => {
  const [viewMode, setViewMode] = useState<BallotViewMode>('kompakt');
  const [selectedErststimme, setSelectedErststimme] = useState<string | null>(null);
  const [selectedZweitstimme, setSelectedZweitstimme] = useState<string | null>(null);
  const [selectedLandtag, setSelectedLandtag] = useState<string | null>(null);
  const [selectedKreistag, setSelectedKreistag] = useState<string | null>(null);
  const [selectedKommune, setSelectedKommune] = useState<string | null>(null);
  const [showClaraInfo, setShowClaraInfo] = useState<{ type: 'kandidat' | 'partei'; data: any } | null>(null);

  const handleClaraInfo = (type: 'kandidat' | 'partei', data: any) => {
    setShowClaraInfo({ type, data });
    onKIAnalysis(type, data);
  };

  const handleVote = () => {
    if (level === 'bund' && selectedErststimme && selectedZweitstimme) {
      onVote('bund', selectedErststimme, selectedZweitstimme);
    } else if (level === 'land' && selectedLandtag) {
      onVote('land', selectedLandtag, '');
    } else if (level === 'kreis' && selectedKreistag) {
      onVote('kreis', selectedKreistag, '');
    } else if (level === 'kommune' && selectedKommune) {
      onVote('kommune', selectedKommune, '');
    }
  };

  const handleOpenClaraChat = (context?: string) => {
    if (onOpenClaraChat) {
      onOpenClaraChat(context);
    }
  };

  const compact = viewMode === 'kompakt';
  const panelPad = compact ? 'p-4 sm:p-5' : 'p-6';
  const sectionTitleClass = compact ? 'mb-1 text-base font-bold text-gray-900 sm:text-lg' : 'mb-2 text-2xl font-bold text-gray-900';
  const sectionHintClass = compact ? 'mb-3 text-xs text-gray-700 sm:text-sm' : 'mb-4 text-base text-gray-700';
  const candidateNameClass = compact ? 'text-xs font-bold text-gray-900 sm:text-sm truncate' : 'text-lg font-bold text-gray-900';
  const voteButtonClass = compact
    ? 'px-5 py-2.5 text-sm font-bold transition-all sm:px-7 sm:py-3'
    : 'px-12 py-4 text-xl font-bold transition-all';
  const useStickyVoteAction = level === 'kommune' && compact && KOMMUNAL_KANDIDATEN.length >= 5;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
        <strong>Demonstration:</strong> Keine amtliche Wahlvorlage. Parteien wurden auf Basis offizieller Ergebnisse/
        zugelassener Listen (Bundeswahlleiterin, Landeswahlleitung Saarland; Stand 2024/2025) komprimiert dargestellt.
      </div>
      <div className="mb-4 flex items-center justify-end gap-2">
        <span className="text-xs font-semibold text-gray-700">Ansicht:</span>
        <button
          type="button"
          onClick={() => setViewMode('originalnah')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            viewMode === 'originalnah' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Originalnah
        </button>
        <button
          type="button"
          onClick={() => setViewMode('kompakt')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            viewMode === 'kompakt' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Kompakt
        </button>
      </div>
      {/* Bundestagswahl Stimmzettel */}
      {level === 'bund' && (
        <div className="space-y-6">
          {/* Header mit Bundesadler-Placeholder */}
          <div className="ballot-paper text-center pb-6 border-b-2 border-gray-900">
            <div className="mb-3 flex items-center justify-center gap-3">
              {/* Bundesadler SVG Placeholder */}
              <svg width="48" height="48" viewBox="0 0 48 48" className="text-gray-900">
                <path d="M24 8L28 16H36L29 21L32 30L24 25L16 30L19 21L12 16H20L24 8Z" fill="currentColor" />
              </svg>
              <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">BUNDESTAGSWAHL</h1>
            </div>
            <p className="text-xs font-semibold text-gray-700 sm:text-base">Bundestagswahl 2025 (Demonstration)</p>
            <p className="mt-1 text-xs text-gray-700 sm:text-sm">Wahlkreis {wahlkreis || '—'}</p>
            <div className="mt-3 border-2 border-blue-300 bg-blue-100 p-3">
              <p className="text-sm font-bold text-blue-900">
                Sie haben 2 Stimmen
              </p>
            </div>
          </div>

          {/* Erststimme */}
          <div className={`ballot-paper border-2 border-gray-900 ${panelPad}`}>
            <div className="mb-4">
              <h2 className={sectionTitleClass}>ERSTSTIMME</h2>
              <p className={sectionHintClass}>
                (Wahl eines Wahlkreisabgeordneten)
              </p>
            </div>

            <div className="space-y-2">
              {BUNDESTAG_KANDIDATEN.map((kandidat, index) => (
                <div key={index} className="ballot-option relative group">
                  <label className="flex items-center gap-4 cursor-pointer w-full">
                    <input
                      type="radio"
                      name="erststimme"
                      value={kandidat.name}
                      checked={selectedErststimme === kandidat.name}
                      onChange={(e) => setSelectedErststimme(e.target.value)}
                      className="ballot-checkbox"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{index + 1}.</span>
                        <span className={candidateNameClass} title={kandidat.name}>{kandidat.name}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-700 sm:text-sm">{kandidat.parteiLang}</div>
                    </div>
                  </label>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClaraInfo('kandidat', kandidat);
                    }}
                    className="rounded-lg p-1.5 flex items-center justify-center hover:opacity-90 transition-opacity border"
                    style={{ backgroundColor: CLARA_BG, color: CLARA_TEXT, borderColor: CLARA_BORDER }}
                    aria-label={`Clara Info zu ${kandidat.name}`}
                  >
                    <Info size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Zweitstimme */}
          <div className={`ballot-paper border-2 border-gray-900 ${panelPad}`}>
            <div className="mb-4">
              <h2 className={sectionTitleClass}>ZWEITSTIMME</h2>
              <p className={sectionHintClass}>
                (Wahl einer Landesliste - entscheidet über die Sitzverteilung im Bundestag)
              </p>
            </div>

            <div className="space-y-2">
              {BUNDESTAG_PARTEIEN.map((partei, index) => (
                <div key={index} className="ballot-option relative group">
                  <label className="flex items-center gap-4 cursor-pointer w-full">
                    <input
                      type="radio"
                      name="zweitstimme"
                      value={partei.kuerzel}
                      checked={selectedZweitstimme === partei.kuerzel}
                      onChange={(e) => setSelectedZweitstimme(e.target.value)}
                      className="ballot-checkbox"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={candidateNameClass} title={partei.kuerzel}>{partei.kuerzel}</div>
                      <div className="text-xs text-gray-700 sm:text-sm">{partei.name}</div>
                    </div>
                  </label>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClaraInfo('partei', partei);
                    }}
                    className="rounded-lg p-1.5 flex items-center justify-center hover:opacity-90 transition-opacity border"
                    style={{ backgroundColor: CLARA_BG, color: CLARA_TEXT, borderColor: CLARA_BORDER }}
                    aria-label={`Clara Info zu ${partei.kuerzel}`}
                  >
                    <Info size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Clara Chat Button */}
          <div className="text-center py-4">
            <button
              onClick={() => handleOpenClaraChat('Ich habe Fragen zu dieser Wahl – Parteiprogramme und Kandidaten')}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all border border-white/30"
              style={{ background: CLARA_GRADIENT, boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)' }}
            >
              <MessageCircle size={18} />
              💬 Frag Clara zu dieser Wahl
            </button>
          </div>

          {/* Vote Button */}
          <div className="text-center pb-6">
            <button
              onClick={handleVote}
              disabled={!selectedErststimme || !selectedZweitstimme}
              className={`${voteButtonClass} ${
                selectedErststimme && selectedZweitstimme
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg rounded-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg'
              }`}
            >
              {selectedErststimme && selectedZweitstimme ? 'Stimme abgeben' : 'Bitte beide Stimmen auswählen'}
            </button>
          </div>
        </div>
      )}

      {/* Landtagswahl Saarland Stimmzettel */}
      {level === 'land' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="ballot-paper border-b-2 border-gray-900 pb-5 text-center">
            <h1 className="mb-1 text-lg font-bold text-gray-900 sm:text-2xl">LANDTAGSWAHL SAARLAND</h1>
            <p className="text-sm font-semibold text-gray-700 sm:text-base">Frühjahr 2027</p>
            <div className="mt-3 border-2 border-blue-300 bg-blue-100 p-3">
              <p className="text-sm font-bold text-blue-900">
                Sie haben 1 Stimme
              </p>
            </div>
          </div>

          {/* Kandidaten */}
          <div className={`ballot-paper border-2 border-gray-900 ${panelPad}`}>
            <div className="mb-4">
              <h2 className={sectionTitleClass}>KANDIDATEN</h2>
              <p className={sectionHintClass}>
                (Demonstrationsliste – Spitzenkandidat:innen / wichtige Ämter)
              </p>
            </div>

            <div className="space-y-2">
              {LANDTAG_KANDIDATEN.map((kandidat, index) => (
                <div key={index} className="ballot-option relative group">
                  <label className="flex items-center gap-4 cursor-pointer w-full">
                    <input
                      type="radio"
                      name="landtag"
                      value={kandidat.name}
                      checked={selectedLandtag === kandidat.name}
                      onChange={(e) => setSelectedLandtag(e.target.value)}
                      className="ballot-checkbox"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{index + 1}.</span>
                        <span className={candidateNameClass} title={kandidat.name}>{kandidat.name}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-700 sm:text-sm">{kandidat.parteiLang}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {kandidat.beruf}
                        {kandidat.alter > 0 ? ` • ${kandidat.alter} Jahre` : ''}
                      </div>
                    </div>
                  </label>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClaraInfo('kandidat', kandidat);
                    }}
                    className="rounded-lg p-1.5 flex items-center justify-center hover:opacity-90 transition-opacity border"
                    style={{ backgroundColor: CLARA_BG, color: CLARA_TEXT, borderColor: CLARA_BORDER }}
                    aria-label={`Clara Info zu ${kandidat.name}`}
                  >
                    <Info size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Clara Chat Button */}
          <div className="text-center py-4">
            <button
              onClick={() => handleOpenClaraChat('Ich habe Fragen zu dieser Wahl – Parteiprogramme und Kandidaten')}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all border border-white/30"
              style={{ background: CLARA_GRADIENT, boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)' }}
            >
              <MessageCircle size={18} />
              💬 Frag Clara zu dieser Wahl
            </button>
          </div>

          {/* Vote Button */}
          <div className="text-center pb-6">
            <button
              onClick={handleVote}
              disabled={!selectedLandtag}
              className={`${voteButtonClass} ${
                selectedLandtag
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg rounded-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg'
              }`}
            >
              {selectedLandtag ? 'Stimme abgeben' : 'Bitte Kandidaten auswählen'}
            </button>
          </div>
        </div>
      )}

      {/* Kreistag Saarpfalz-Kreis */}
      {level === 'kreis' && (
        <div className="space-y-6">
          <div className="ballot-paper text-center pb-6 border-b-2 border-gray-900">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">KREISTAG</h1>
            <p className="text-lg text-gray-700 font-semibold">Saarpfalz-Kreis</p>
            <p className="text-sm text-gray-600 mt-1">Wahlkreis: {wahlkreis || 'Saarpfalz-Kreis'}</p>
            <div className="mt-4 p-4 bg-blue-100 border-2 border-blue-300">
              <p className="text-base text-blue-900 font-bold">Sie haben 1 Stimme (Demonstration)</p>
            </div>
          </div>

          <div className={`ballot-paper border-2 border-gray-900 ${panelPad}`}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">KANDIDATEN</h2>
              <p className="text-base text-gray-700 mb-4">(Auswahl demonstrativ – u. a. Landrat, Fraktionen)</p>
            </div>

            <div className="space-y-2">
              {KREISTAG_SAARPFALZ_KANDIDATEN.map((kandidat, index) => (
                <div key={index} className="ballot-option relative group">
                  <label className="flex cursor-pointer items-center gap-4">
                    <input
                      type="radio"
                      name="kreistag"
                      value={kandidat.name}
                      checked={selectedKreistag === kandidat.name}
                      onChange={(e) => setSelectedKreistag(e.target.value)}
                      className="ballot-checkbox"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{index + 1}.</span>
                        <span className={candidateNameClass} title={kandidat.name}>{kandidat.name}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-700">{kandidat.parteiLang}</div>
                      <div className="mt-1 text-xs text-gray-600">
                        {kandidat.beruf}
                        {kandidat.alter > 0 ? ` • ${kandidat.alter} Jahre` : ''}
                      </div>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClaraInfo('kandidat', kandidat);
                    }}
                    className="rounded-lg border p-1.5 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: CLARA_BG, color: CLARA_TEXT, borderColor: CLARA_BORDER }}
                    aria-label={`Clara Info zu ${kandidat.name}`}
                  >
                    <Info size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center py-4">
            <button
              type="button"
              onClick={() =>
                handleOpenClaraChat('Ich habe Fragen zum Kreistag Saarpfalz – Kandidaten und Kreispolitik')
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
              style={{ background: CLARA_GRADIENT, boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)' }}
            >
              <MessageCircle size={18} />
              Frag Clara zu dieser Wahl
            </button>
          </div>

          <div className="pb-6 text-center">
            <button
              type="button"
              onClick={handleVote}
              disabled={!selectedKreistag}
                className={`rounded-lg ${voteButtonClass} ${
                selectedKreistag
                  ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
            >
              {selectedKreistag ? 'Stimme abgeben' : 'Bitte Kandidaten auswählen'}
            </button>
          </div>
        </div>
      )}

      {/* Kommunalwahl Kirkel Stimmzettel */}
      {level === 'kommune' && (
        <div className="space-y-6 max-w-full overflow-hidden">
          {/* Header */}
          <div className="ballot-paper text-center pb-4 border-b-2 border-gray-900 px-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">GEMEINDERATSWAHL</h1>
            <p className="text-base text-gray-700 font-semibold">Verbandsgemeinde Kirkel</p>
            <p className="text-sm text-gray-700 mt-1">Gemeinde Kirkel</p>
            <div className="mt-3 p-3 bg-blue-100 border-2 border-blue-300 rounded-lg">
              <p className="text-sm text-blue-900 font-bold">
                Sie haben 1 Stimme
              </p>
            </div>
          </div>

          {/* Kandidaten */}
          <div className={`ballot-paper border-2 border-gray-900 max-w-full overflow-hidden ${panelPad}`}>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2 break-words">KANDIDATEN</h2>
              <p className="text-sm text-gray-700 mb-3">
                (Gemeinderat/Verbandsgemeinderat)
              </p>
            </div>

            <div className="space-y-2">
              {KOMMUNAL_KANDIDATEN.map((kandidat, index) => (
                <div key={index} className="ballot-option relative group min-w-0">
                  <label className="flex items-center gap-3 cursor-pointer w-full min-w-0">
                    <input
                      type="radio"
                      name="kommune"
                      value={kandidat.name}
                      checked={selectedKommune === kandidat.name}
                      onChange={(e) => setSelectedKommune(e.target.value)}
                      className="ballot-checkbox flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-base">{index + 1}.</span>
                        <span className={`${candidateNameClass} break-words`} title={kandidat.name}>{kandidat.name}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-0.5 break-words">{kandidat.parteiLang}</div>
                      <div className="text-xs text-gray-600 mt-0.5 break-words">
                        {kandidat.beruf}
                        {kandidat.alter > 0 ? ` • ${kandidat.alter} Jahre` : ''}
                        {kandidat.wohnort ? ` • ${kandidat.wohnort}` : ''}
                      </div>
                    </div>
                  </label>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClaraInfo('kandidat', kandidat);
                    }}
                    className="rounded-lg p-1.5 flex items-center justify-center hover:opacity-90 transition-opacity border flex-shrink-0"
                    style={{ backgroundColor: CLARA_BG, color: CLARA_TEXT, borderColor: CLARA_BORDER }}
                    aria-label={`Clara Info zu ${kandidat.name}`}
                  >
                    <Info size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Clara Chat Button */}
          <div className="text-center py-3">
            <button
              onClick={() => handleOpenClaraChat('Ich habe Fragen zu dieser Kommunalwahl – Parteiprogramme und Kandidaten')}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all border border-white/30"
              style={{ background: CLARA_GRADIENT, boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)' }}
            >
              <MessageCircle size={18} />
              💬 Frag Clara zu dieser Wahl
            </button>
          </div>

          {/* Vote Button – sticky am unteren Rand, immer sichtbar */}
          <div className={`${useStickyVoteAction ? 'sticky bottom-0 left-0 right-0 -mb-2 bg-gradient-to-t from-gray-50 to-transparent' : ''} pt-4 pb-6`}>
            <div className="text-center">
              <button
                onClick={handleVote}
                disabled={!selectedKommune}
                className={`${voteButtonClass} rounded-lg ${
                  selectedKommune
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedKommune ? 'Stimme abgeben' : 'Bitte Kandidaten auswählen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clara Info Modal */}
      {showClaraInfo && (
        <ClaraInfoModal
          data={showClaraInfo.data}
          type={showClaraInfo.type}
          onClose={() => setShowClaraInfo(null)}
          onOpenChat={handleOpenClaraChat}
        />
      )}
    </div>
  );
};

export default OriginalStimmzettel;
