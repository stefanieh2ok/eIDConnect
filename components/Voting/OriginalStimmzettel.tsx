'use client';

import React, { useState } from 'react';
import { ListChecks } from 'lucide-react';

/* Clara-Farben (wie Clara-Chat / Floating-Button) */
const CLARA_BG = '#F5F0FF';
const CLARA_BORDER = '#E6E6FA';
const CLARA_TEXT = '#6B5B95';
const CLARA_GRADIENT = 'linear-gradient(160deg, #4C1D95 0%, #6D28D9 25%, #7C3AED 45%, #8B5CF6 65%, #A78BFA 85%, #C4B5FD 100%)';
/** Stimmzettel-Hilfsbuttons (Info): Behörden-Blau wie Primär-UI */
const GOV_INFO_BTN = {
  background: 'linear-gradient(135deg, var(--gov-primary) 0%, var(--gov-primary-mid) 100%)',
  color: '#fff',
  borderColor: 'rgba(255,255,255,0.35)',
} as const;

// Echte Stimmzettel-Daten (originalgetreu nach BWahlG § 45)
const BUNDESTAG_KANDIDATEN = [
  { 
    name: 'Müller, Andreas', 
    partei: 'CDU', 
    parteiLang: 'Christlich Demokratische Union Deutschlands',
    beruf: 'Wirtschaftspolitischer Sprecher',
    alter: 52,
    wahlkreis: 'Saarbrücken',
    kiInfo: 'Wirtschaftspolitischer Sprecher der CDU/CSU-Fraktion. Schwerpunkte: Mittelstand, Digitalisierung, Steuerentlastungen. Setzt sich für Bürokratieabbau ein.',
    positionen: ['Wirtschaftswachstum', 'Steuerentlastungen', 'Digitalisierung', 'Familienpolitik'],
    matchScore: 72
  },
  { 
    name: 'Klein, Sarah', 
    partei: 'SPD', 
    parteiLang: 'Sozialdemokratische Partei Deutschlands',
    beruf: 'Gewerkschaftssekretärin',
    alter: 45,
    wahlkreis: 'Saarbrücken',
    kiInfo: 'Gewerkschaftssekretärin mit Fokus auf soziale Gerechtigkeit. Schwerpunkte: Mindestlohn 15€, bezahlbares Wohnen, Klimaschutz. Stark in der Arbeitsmarktpolitik.',
    positionen: ['Mindestlohn 15€', 'Bezahlbares Wohnen', 'Klimaschutz', 'Soziale Gerechtigkeit'],
    matchScore: 85
  },
  { 
    name: 'Hoffmann, Lisa', 
    partei: 'GRÜNE', 
    parteiLang: 'BÜNDNIS 90/DIE GRÜNEN',
    beruf: 'Umweltwissenschaftlerin',
    alter: 38,
    wahlkreis: 'Saarbrücken',
    kiInfo: 'Umweltwissenschaftlerin mit Expertise in Klimaschutz. Schwerpunkte: Klimaneutralität 2035, erneuerbare Energien, nachhaltige Mobilität. Setzt auf wissenschaftsbasierte Politik.',
    positionen: ['Klimaneutralität 2035', 'Erneuerbare Energien', 'Nachhaltige Mobilität', 'Wissenschaftsbasierte Politik'],
    matchScore: 91
  },
  { 
    name: 'Weber, Thomas', 
    partei: 'FDP', 
    parteiLang: 'Freie Demokratische Partei',
    beruf: 'Tech-Unternehmer',
    alter: 49,
    wahlkreis: 'Saarbrücken',
    kiInfo: 'Tech-Unternehmer mit Fokus auf Digitalisierung. Schwerpunkte: Wirtschaftsfreiheit, Bildung, Innovation. Setzt sich für Start-up-Förderung und digitale Infrastruktur ein.',
    positionen: ['Wirtschaftsfreiheit', 'Bildung', 'Innovation', 'Digitalisierung'],
    matchScore: 68
  }
];

const BUNDESTAG_PARTEIEN = [
  { 
    kuerzel: 'CDU', 
    name: 'Christlich Demokratische Union Deutschlands',
    kiInfo: 'Konservative Partei mit Fokus auf Wirtschaftswachstum, Familienpolitik und innere Sicherheit. Steuerentlastungen und Bürokratieabbau stehen im Vordergrund.',
    positionen: ['Wirtschaftswachstum', 'Familienpolitik', 'Innere Sicherheit', 'Steuerentlastungen'],
    matchScore: 72
  },
  { 
    kuerzel: 'SPD', 
    name: 'Sozialdemokratische Partei Deutschlands',
    kiInfo: 'Sozialdemokratische Partei mit Schwerpunkt auf soziale Gerechtigkeit. Mindestlohn 15€, bezahlbares Wohnen und Klimaschutz sind Hauptthemen.',
    positionen: ['Soziale Gerechtigkeit', 'Mindestlohn 15€', 'Bezahlbares Wohnen', 'Klimaschutz'],
    matchScore: 85
  },
  { 
    kuerzel: 'GRÜNE', 
    name: 'BÜNDNIS 90/DIE GRÜNEN',
    kiInfo: 'Ökologische Partei mit Fokus auf Klimaschutz und Nachhaltigkeit. Klimaneutralität 2035, Energiewende und soziale Gerechtigkeit sind zentrale Ziele.',
    positionen: ['Klimaschutz', 'Klimaneutralität 2035', 'Energiewende', 'Soziale Gerechtigkeit'],
    matchScore: 91
  },
  { 
    kuerzel: 'FDP', 
    name: 'Freie Demokratische Partei',
    kiInfo: 'Liberale Partei mit Schwerpunkt auf Wirtschaftsfreiheit und Bildung. Digitalisierung, Innovation und Bürokratieabbau stehen im Fokus.',
    positionen: ['Wirtschaftsfreiheit', 'Bildung', 'Digitalisierung', 'Innovation'],
    matchScore: 68
  },
  { 
    kuerzel: 'DIE LINKE', 
    name: 'DIE LINKE',
    kiInfo: 'Linke Partei mit Fokus auf soziale Gerechtigkeit und Umverteilung. Mindestlohn, Mietpreisbremse und Friedenspolitik sind Hauptthemen.',
    positionen: ['Soziale Gerechtigkeit', 'Umverteilung', 'Mietpreisbremse', 'Friedenspolitik'],
    matchScore: 78
  },
  { 
    kuerzel: 'AfD', 
    name: 'Alternative für Deutschland',
    kiInfo: 'Rechtspopulistische Partei mit Fokus auf Migration, nationale Souveränität und EU-Kritik. Setzt sich für strengere Einwanderungspolitik ein.',
    positionen: ['Migration', 'Nationale Souveränität', 'EU-Kritik', 'Einwanderungspolitik'],
    matchScore: 35
  }
];

const LANDTAG_KANDIDATEN = [
  { 
    name: 'Rehlinger, Anke', 
    partei: 'SPD', 
    parteiLang: 'Sozialdemokratische Partei Deutschlands',
    beruf: 'Ministerpräsidentin',
    alter: 48,
    kiInfo: 'Amtierende Ministerpräsidentin des Saarlandes seit 2022. Führte SPD zur absoluten Mehrheit. Schwerpunkte: Digitalisierung, Klimaschutz, soziale Gerechtigkeit.',
    positionen: ['Digitalisierung', 'Klimaschutz', 'Soziale Gerechtigkeit'],
    matchScore: 86
  },
  { 
    name: 'Wirth, Christian', 
    partei: 'CDU', 
    parteiLang: 'Christlich Demokratische Union',
    beruf: 'CDU-Landeschef',
    alter: 52,
    kiInfo: 'CDU-Landeschef und ehemaliger Innenminister. Will Rehlinger bei der nächsten Landtagswahl herausfordern. Schwerpunkte: Wirtschaftsförderung, Familienpolitik, Sicherheit.',
    positionen: ['Wirtschaftsförderung', 'Familienpolitik', 'Sicherheit'],
    matchScore: 71
  },
  { 
    name: 'Becker, Lisa', 
    partei: 'GRÜNE', 
    parteiLang: 'BÜNDNIS 90/DIE GRÜNEN',
    beruf: 'Neue Spitzenkandidatin',
    alter: 35,
    kiInfo: 'Neue Spitzenkandidatin der Grünen im Saarland. Ziel: über 5%-Hürde kommen. Schwerpunkte: Klimaschutz, Bildung, Gleichberechtigung.',
    positionen: ['Klimaschutz', 'Bildung', 'Gleichberechtigung'],
    matchScore: 88
  }
];

// Kommunalwahl Kirkel - Gemeinderat/Verbandsgemeinde
const KOMMUNAL_KANDIDATEN = [
  { 
    name: 'Müller, Klaus', 
    partei: 'SPD', 
    parteiLang: 'Sozialdemokratische Partei Deutschlands',
    beruf: 'Gemeinderat (seit 2019)',
    alter: 54,
    wohnort: 'Kirkel-Neuhäusel',
    kiInfo: 'Erfahrener Gemeinderat mit Fokus auf Infrastruktur und Gemeinschaftsprojekte. Engagiert sich für Mehrzweckhalle, Radwege und Ortskernsanierung.',
    positionen: ['Gemeinschaftsprojekte', 'Infrastruktur', 'Nachhaltigkeit'],
    matchScore: 82
  },
  { 
    name: 'Schmidt, Petra', 
    partei: 'CDU', 
    parteiLang: 'Christlich Demokratische Union',
    beruf: 'Gemeinderätin (seit 2015)',
    alter: 49,
    wohnort: 'Kirkel',
    kiInfo: 'Langjährige Gemeinderätin mit Schwerpunkt auf Finanzen und Haushalt. Setzt auf verantwortungsvolle Haushaltspolitik und Wirtschaftsförderung.',
    positionen: ['Haushaltspolitik', 'Wirtschaftsförderung', 'Familie'],
    matchScore: 75
  },
  { 
    name: 'Hoffmann, Michael', 
    partei: 'GRÜNE', 
    parteiLang: 'BÜNDNIS 90/DIE GRÜNEN',
    beruf: 'Neuer Kandidat',
    alter: 41,
    wohnort: 'Kirkel-Neuhäusel',
    kiInfo: 'Neuer Kandidat mit Fokus auf Klimaschutz und Nachhaltigkeit auf kommunaler Ebene. Engagiert für Radwege, Bürgergärten und LED-Beleuchtung.',
    positionen: ['Klimaschutz', 'Nachhaltigkeit', 'Bürgerbeteiligung'],
    matchScore: 89
  },
  { 
    name: 'Weber, Anna', 
    partei: 'Unabhängige Liste', 
    parteiLang: 'Unabhängige Wählerliste Kirkel',
    beruf: 'Gemeinderätin (seit 2019)',
    alter: 38,
    wohnort: 'Kirkel',
    kiInfo: 'Unabhängige Kandidatin ohne Parteibindung. Fokus auf parteiübergreifende Lösungen, Transparenz und direkte Bürgerbeteiligung.',
    positionen: ['Transparenz', 'Bürgerbeteiligung', 'Parteiübergreifend'],
    matchScore: 78
  },
  { 
    name: 'Klein, Thomas', 
    partei: 'FDP', 
    parteiLang: 'Freie Demokratische Partei',
    beruf: 'Neuer Kandidat',
    alter: 45,
    wohnort: 'Kirkel-Neuhäusel',
    kiInfo: 'Neuer Kandidat mit wirtschaftsliberalem Ansatz. Fokus auf Digitalisierung, Wirtschaftsförderung und Bürokratieabbau auf kommunaler Ebene.',
    positionen: ['Digitalisierung', 'Wirtschaftsförderung', 'Bürokratieabbau'],
    matchScore: 71
  }
];

// Gemeinderat Heidelberg (Demo-Stimmzettel)
const HEIDELBERG_KANDIDATEN = [
  {
    name: 'Würzner, Eckart',
    partei: 'parteilos',
    parteiLang: 'parteilos',
    beruf: 'Oberbürgermeister',
    alter: 64,
    wohnort: 'Heidelberg',
    kiInfo: 'Oberbürgermeister von Heidelberg. Schwerpunkte: Klimaschutz, Wissenschaftsstadt, Stadtentwicklung.',
    positionen: ['Klimaschutz', 'Wissenschaftsstadt', 'Digitalisierung', 'Stadtentwicklung'],
    matchScore: 86,
  },
  {
    name: 'Schäfer, Laura',
    partei: 'GRÜNE',
    parteiLang: 'BÜNDNIS 90/DIE GRÜNEN',
    beruf: 'Gemeinderätin',
    alter: 42,
    wohnort: 'Heidelberg-Weststadt',
    kiInfo: 'Schwerpunkt Verkehrswende, Stadtgrün und soziale Teilhabe in der Kernstadt.',
    positionen: ['Verkehrswende', 'Stadtgrün', 'Soziale Gerechtigkeit'],
    matchScore: 88,
  },
  {
    name: 'König, Martin',
    partei: 'CDU',
    parteiLang: 'Christlich Demokratische Union',
    beruf: 'Unternehmer',
    alter: 51,
    wohnort: 'Heidelberg-Rohrbach',
    kiInfo: 'Mittelstand und Wohnungsbau, Sicherheit und bezahlbares Wohnen.',
    positionen: ['Wirtschaft', 'Wohnungsbau', 'Sicherheit'],
    matchScore: 74,
  },
  {
    name: 'Yilmaz, Emine',
    partei: 'SPD',
    parteiLang: 'Sozialdemokratische Partei Deutschlands',
    beruf: 'Sozialarbeiterin',
    alter: 39,
    wohnort: 'Heidelberg',
    kiInfo: 'Fokus auf Bildung, Kitaplätze und Vereinbarkeit von Familie und Beruf.',
    positionen: ['Bildung', 'Soziales', 'Familie'],
    matchScore: 81,
  },
  {
    name: 'Brandt, Felix',
    partei: 'FDP',
    parteiLang: 'Freie Demokratische Partei',
    beruf: 'Jurist',
    alter: 36,
    wohnort: 'Heidelberg-Altstadt',
    kiInfo: 'Digitalisierung der Verwaltung, Bürokratieabbau und wirtschaftsfreundliche Rahmenbedingungen.',
    positionen: ['Digitalisierung', 'Wirtschaft', 'Verwaltung'],
    matchScore: 69,
  },
];

// Gemeinderat Viernheim (Demo-Stimmzettel, nicht Kirkel)
const VIERNHEIM_KANDIDATEN = [
  {
    name: 'Baaß, Matthias',
    partei: 'SPD',
    parteiLang: 'Sozialdemokratische Partei Deutschlands',
    beruf: 'Bürgermeister',
    alter: 69,
    wohnort: 'Viernheim',
    kiInfo: 'Oberste kommunale Exekutive; Schwerpunkte Stadtentwicklung und Metropolregion Rhein-Neckar (Demo).',
    positionen: ['Stadtentwicklung', 'Infrastruktur', 'Bildung', 'Sport'],
    matchScore: 84,
  },
  {
    name: 'Lang, Sandra',
    partei: 'CDU',
    parteiLang: 'Christlich Demokratische Union',
    beruf: 'Gemeinderätin',
    alter: 47,
    wohnort: 'Viernheim',
    kiInfo: 'Haushalt und Innere Sicherheit, Handel und Gewerbe (Konzeptdemo).',
    positionen: ['Haushalt', 'Sicherheit', 'Wirtschaft'],
    matchScore: 76,
  },
  {
    name: 'Öztürk, Canan',
    partei: 'GRÜNE',
    parteiLang: 'BÜNDNIS 90/DIE GRÜNEN',
    beruf: 'Umweltplanerin',
    alter: 41,
    wohnort: 'Viernheim',
    kiInfo: 'Klima und Mobilität, Grünflächen und Bürgerbeteiligung (Konzeptdemo).',
    positionen: ['Klimaschutz', 'Mobilität', 'Grünflächen'],
    matchScore: 88,
  },
  {
    name: 'Wolf, Stefan',
    partei: 'FDP',
    parteiLang: 'Freie Demokratische Partei',
    beruf: 'IT-Unternehmer',
    alter: 44,
    wohnort: 'Viernheim',
    kiInfo: 'Digitalisierung der Verwaltung und Wirtschaftsförderung (Konzeptdemo).',
    positionen: ['Digitalisierung', 'Wirtschaft', 'Bürokratieabbau'],
    matchScore: 72,
  },
];

interface StimmzettelProps {
  level: 'bund' | 'land' | 'kommune';
  wahlkreis?: string;
  canVote?: boolean;
  /** Kommunal-Stimmzettel: Kirkel (Standard), Heidelberg oder Viernheim */
  kommuneBallot?: 'kirkel' | 'heidelberg' | 'viernheim';
  /** Nur Darstellung (Einführung): keine Info-/Clara-/Abgabe-Buttons */
  introMode?: boolean;
  onVote: (level: string, candidate: string, party: string) => void;
  onKIAnalysis: (type: 'kandidat' | 'partei', data: any) => void;
  onOpenClaraChat?: (context?: string) => void;
}

interface ClaraInfoModalProps {
  data: any;
  type: 'kandidat' | 'partei';
  onClose: () => void;
  onOpenChat: (context?: string) => void;
}

// Clara Info Bottom Sheet Modal – bleibt innerhalb des iPhone-Screens (safe area, scrollbarer Inhalt)
const ClaraInfoModal: React.FC<ClaraInfoModalProps> = ({ data, type, onClose, onOpenChat }) => {
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/50 p-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div
        className="mx-auto flex w-full max-w-[min(100vw,22.5rem)] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl"
        style={{
          maxHeight:
            'min(88dvh, calc(100svh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 0.75rem))',
        }}
      >
        {/* Header – gleiche Farbe wie Clara-Chat; Breite an Mobil / Device-Rahmen gekoppelt */}
        <div
          className="flex flex-shrink-0 items-center justify-between p-4 text-white"
          style={{ background: CLARA_GRADIENT, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              KI
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold leading-tight">Clara erklärt</h3>
              <p className="truncate text-xs opacity-90">{type === 'kandidat' ? data.name : data.kuerzel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
          >
            x
          </button>
        </div>

        {/* Content – scrollbar, bleibt im Rahmen */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4">
          {/* KI Info */}
          <div className="aria-box">
            <div className="aria-label">ARIA EXECUTIVE INTELLIGENCE</div>
            <div className="aria-content">
              <p className="font-semibold mb-2">KEY INSIGHT:</p>
              <p>{data.kiInfo}</p>
            </div>
          </div>

          {/* Positionen */}
          {data.positionen && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Wichtigste Positionen</h4>
              <div className="space-y-2">
                {data.positionen.map((pos: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                    <ListChecks className="h-4 w-4 flex-shrink-0" style={{ color: CLARA_TEXT }} aria-hidden />
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
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Quellen</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• {type === 'kandidat' ? `Wahlprogramm ${data.partei} 2025` : `Wahlprogramm ${data.kuerzel} 2025`}</p>
              <p>• Abstimmungsverhalten 2021-2025</p>
              <p>• Öffentliche Positionen und Aussagen</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 pt-2 border-t border-gray-100">
            <strong>Parteiprogramm und Kandidateninfos</strong> – hier in Clara per Chat, Sprache oder Schreiben erfragen.
          </p>
        </div>

        {/* Footer Actions – fix am unteren Rand, Safe Area */}
        <div className="border-t border-gray-200 p-4 flex gap-3 flex-shrink-0" style={{ backgroundColor: CLARA_BG, borderColor: CLARA_BORDER, paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <button
            onClick={() => {
              onOpenChat(type === 'kandidat' ? `Erkläre mir ${data.name} und das Parteiprogramm` : `Was plant ${data.kuerzel}? Zeig mir das Wahlprogramm.`);
              onClose();
            }}
            className="flex-1 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            style={{ background: CLARA_GRADIENT, boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)' }}
          >
            Mit Clara chatten oder sprechen
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

const OriginalStimmzettel: React.FC<StimmzettelProps> = ({
  level,
  wahlkreis,
  canVote = true,
  kommuneBallot = 'kirkel',
  introMode = false,
  onVote,
  onKIAnalysis,
  onOpenClaraChat,
}) => {
  const [selectedErststimme, setSelectedErststimme] = useState<string | null>(null);
  const [selectedZweitstimme, setSelectedZweitstimme] = useState<string | null>(null);
  const [selectedLandtag, setSelectedLandtag] = useState<string | null>(null);
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
    } else if (level === 'kommune' && selectedKommune) {
      onVote('kommune', selectedKommune, '');
    }
  };

  const handleOpenClaraChat = (context?: string) => {
    if (onOpenClaraChat) {
      onOpenClaraChat(context);
    }
  };

  const showAux = !introMode;
  const kommunalKandidaten =
    kommuneBallot === 'heidelberg'
      ? HEIDELBERG_KANDIDATEN
      : kommuneBallot === 'viernheim'
        ? VIERNHEIM_KANDIDATEN
        : KOMMUNAL_KANDIDATEN;

  const kommuneHead =
    kommuneBallot === 'heidelberg'
      ? { top: 'Stadt Heidelberg', sub: 'Stadt Heidelberg', candLine: '(Gemeinderat)' }
      : kommuneBallot === 'viernheim'
        ? { top: 'Stadt Viernheim', sub: 'Hessen · Kreis Bergstraße', candLine: '(Gemeinderat)' }
        : { top: 'Verbandsgemeinde Kirkel', sub: 'Gemeinde Kirkel', candLine: '(Gemeinderat/Verbandsgemeinderat)' };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Bundestagswahl Stimmzettel */}
      {level === 'bund' && (
        <div className="space-y-6">
          {/* Header mit Bundesadler-Placeholder */}
          <div className="ballot-paper text-center pb-6 border-b-2 border-gray-900">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1
                className={
                  introMode
                    ? 'text-xl font-bold tracking-tight text-gray-900 sm:text-2xl'
                    : 'text-3xl font-bold text-gray-900'
                }
              >
                BUNDESTAGSWAHL
              </h1>
            </div>
            <p className="text-lg text-gray-700 font-semibold">Sonntag, 28. September 2025</p>
            <p className="text-base text-gray-700 mt-1">Wahlkreis {wahlkreis || '—'}</p>
            <div className="mt-4 p-4 bg-blue-100 border-2 border-blue-300">
              <p className="text-base text-blue-900 font-bold">
                Sie haben 2 Stimmen
              </p>
            </div>
          </div>

          {/* Erststimme */}
          <div className="ballot-paper border-2 border-gray-900 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ERSTSTIMME</h2>
              <p className="text-base text-gray-700 mb-4">
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
                    disabled={!canVote}
                      className="ballot-checkbox"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">{index + 1}.</span>
                        <span className="font-bold text-gray-900 text-lg">{kandidat.name}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{kandidat.parteiLang}</div>
                    </div>
                  </label>
                  {showAux ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClaraInfo('kandidat', kandidat);
                      }}
                      className="rounded-lg p-1.5 flex items-center justify-center hover:opacity-90 transition-opacity border"
                      style={GOV_INFO_BTN}
                      aria-label={`Clara Info zu ${kandidat.name}`}
                    >
                      Info
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Zweitstimme */}
          <div className="ballot-paper border-2 border-gray-900 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ZWEITSTIMME</h2>
              <p className="text-base text-gray-700 mb-4">
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
                    disabled={!canVote}
                      className="ballot-checkbox"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-lg">{partei.kuerzel}</div>
                      <div className="text-sm text-gray-700">{partei.name}</div>
                    </div>
                  </label>
                  {showAux ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClaraInfo('partei', partei);
                      }}
                      className="rounded-lg p-1.5 flex items-center justify-center hover:opacity-90 transition-opacity border"
                      style={GOV_INFO_BTN}
                      aria-label={`Clara Info zu ${partei.kuerzel}`}
                    >
                      Info
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {showAux ? (
            <div className="text-center py-4">
              <button
                onClick={() => handleOpenClaraChat('Ich habe Fragen zu dieser Wahl – Parteiprogramme und Kandidaten')}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all border border-white/30"
                style={{ background: CLARA_GRADIENT, boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)' }}
              >
                Frag Clara zu dieser Wahl
              </button>
            </div>
          ) : null}

          <div className="text-center pb-6">
            {introMode ? (
              <p className="text-sm text-gray-600 px-2">
                In der App tippen Sie auf das Kreisfeld neben Ihrer Wahl – Erststimme (Person) und Zweitstimme (Partei).
              </p>
            ) : (
              <button
                onClick={handleVote}
                disabled={!canVote || !selectedErststimme || !selectedZweitstimme}
                className={`px-12 py-4 text-xl font-bold transition-all ${
                  canVote && selectedErststimme && selectedZweitstimme
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg rounded-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg'
                }`}
              >
                {!canVote ? 'Ergebnis ansehen (nicht mehr abstimmbar)' : selectedErststimme && selectedZweitstimme ? 'Teilnahme in Demo bestaetigen' : 'Bitte beide Stimmen auswaehlen'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Landtagswahl Saarland Stimmzettel */}
      {level === 'land' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="ballot-paper text-center pb-6 border-b-2 border-gray-900">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">LANDTAGSWAHL SAARLAND</h1>
            <p className="text-lg text-gray-700 font-semibold">Frühjahr 2027</p>
            <div className="mt-4 p-4 bg-blue-100 border-2 border-blue-300">
              <p className="text-base text-blue-900 font-bold">
                Sie haben 1 Stimme
              </p>
            </div>
          </div>

          {/* Kandidaten */}
          <div className="ballot-paper border-2 border-gray-900 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">KANDIDATEN</h2>
              <p className="text-base text-gray-700 mb-4">
                (Ministerpräsident/in)
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
                      disabled={!canVote}
                      className="ballot-checkbox"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">{index + 1}.</span>
                        <span className="font-bold text-gray-900 text-lg">{kandidat.name}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{kandidat.parteiLang}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {kandidat.beruf} • {kandidat.alter} Jahre
                      </div>
                    </div>
                  </label>
                  {showAux ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClaraInfo('kandidat', kandidat);
                      }}
                      className="rounded-lg p-1.5 flex items-center justify-center hover:opacity-90 transition-opacity border"
                      style={GOV_INFO_BTN}
                      aria-label={`Clara Info zu ${kandidat.name}`}
                    >
                      Info
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {showAux ? (
            <div className="text-center py-4">
              <button
                onClick={() => handleOpenClaraChat('Ich habe Fragen zu dieser Wahl – Parteiprogramme und Kandidaten')}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all border border-white/30"
                style={{ background: CLARA_GRADIENT, boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)' }}
              >
                Frag Clara zu dieser Wahl
              </button>
            </div>
          ) : null}

          <div className="text-center pb-6">
            {introMode ? (
              <p className="text-sm text-gray-600 px-2">
                In der App wählen Sie Ihre Stimme für den Landtag – hier ein Beispiel für das Saarland.
              </p>
            ) : (
              <button
                onClick={handleVote}
                disabled={!canVote || !selectedLandtag}
                className={`px-12 py-4 text-xl font-bold transition-all ${
                  canVote && selectedLandtag
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg rounded-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg'
                }`}
              >
                {!canVote ? 'Ergebnis ansehen (nicht mehr abstimmbar)' : selectedLandtag ? 'Teilnahme in Demo bestaetigen' : 'Bitte Kandidaten auswaehlen'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Kommunalwahl Kirkel Stimmzettel */}
      {level === 'kommune' && (
        <div className="space-y-6 max-w-full overflow-hidden">
          {/* Header */}
          <div className="ballot-paper text-center pb-4 border-b-2 border-gray-900 px-2">
            <h1 className="text-[1.05rem] leading-tight sm:text-2xl sm:leading-snug font-bold text-gray-900 mb-2">
              GEMEINDERATS&shy;WAHL
            </h1>
            <p className="text-base text-gray-700 font-semibold">{kommuneHead.top}</p>
            <p className="text-sm text-gray-700 mt-1">{kommuneHead.sub}</p>
            <div
              className="mt-3 rounded-lg border-2 p-3 text-white"
              style={{
                borderColor: 'rgba(0, 51, 102, 0.35)',
                background: 'linear-gradient(135deg, var(--gov-primary) 0%, var(--gov-primary-mid) 100%)',
                boxShadow: '0 2px 8px rgba(0, 51, 102, 0.2)',
              }}
            >
              <p className="text-sm font-bold">Sie haben 1 Stimme</p>
            </div>
          </div>

          {/* Kandidaten */}
          <div className="ballot-paper border-2 border-gray-900 p-4 max-w-full overflow-hidden">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2 break-words">KANDIDATEN</h2>
              <p className="text-sm text-gray-700 mb-3">{kommuneHead.candLine}</p>
            </div>

            <div className="space-y-2">
              {kommunalKandidaten.map((kandidat, index) => (
                <div key={index} className="ballot-option relative group min-w-0">
                  <label className="flex items-center gap-3 cursor-pointer w-full min-w-0">
                    <input
                      type="radio"
                      name="kommune"
                      value={kandidat.name}
                      checked={selectedKommune === kandidat.name}
                      onChange={(e) => setSelectedKommune(e.target.value)}
                      disabled={!canVote}
                      className="ballot-checkbox flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-base">{index + 1}.</span>
                        <span className="font-bold text-gray-900 text-base break-words">{kandidat.name}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-0.5 break-words">{kandidat.parteiLang}</div>
                      <div className="text-xs text-gray-600 mt-0.5 break-words">
                        {kandidat.beruf} • {kandidat.alter} Jahre • {kandidat.wohnort}
                      </div>
                    </div>
                  </label>
                  {showAux ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClaraInfo('kandidat', kandidat);
                      }}
                      className="rounded-lg p-1.5 flex items-center justify-center hover:opacity-90 transition-opacity border flex-shrink-0"
                      style={GOV_INFO_BTN}
                      aria-label={`Clara Info zu ${kandidat.name}`}
                    >
                      Info
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {showAux ? (
            <div className="text-center py-3">
              <button
                onClick={() => handleOpenClaraChat('Ich habe Fragen zu dieser Kommunalwahl – Parteiprogramme und Kandidaten')}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all border border-white/30"
                style={{ background: CLARA_GRADIENT, boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)' }}
              >
                Frag Clara zu dieser Wahl
              </button>
            </div>
          ) : null}

          <div className="sticky bottom-0 left-0 right-0 pt-4 pb-6 -mb-2 bg-gradient-to-t from-gray-50 to-transparent">
            <div className="text-center">
              {introMode ? (
                <p className="text-sm text-gray-600 px-2">
                  {kommuneBallot === 'viernheim'
                    ? 'In Viernheim wählen Sie z. B. den Gemeinderat – ein Kreuz bei der Person, wie auf dem Papierstimmzettel.'
                    : kommuneBallot === 'heidelberg'
                      ? 'In Heidelberg wählen Sie den Gemeinderat – vergleichbar zum Papierstimmzettel.'
                      : 'In Kirkel wählen Sie z. B. den Gemeinderat – ein Kreuz bei der Liste oder Person, wie auf dem Papierstimmzettel.'}
                </p>
              ) : (
                <button
                  onClick={handleVote}
                  disabled={!canVote || !selectedKommune}
                  className={`px-8 py-3 text-base font-bold transition-all rounded-lg ${
                    canVote && selectedKommune
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!canVote ? 'Ergebnis ansehen (nicht mehr abstimmbar)' : selectedKommune ? 'Teilnahme in Demo bestaetigen' : 'Bitte Kandidaten auswaehlen'}
                </button>
              )}
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
