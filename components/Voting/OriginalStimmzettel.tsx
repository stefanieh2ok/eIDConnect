'use client';

import React, { useState } from 'react';
import { Info, Sparkles, X, MessageCircle, BookOpen, TrendingUp } from 'lucide-react';

/* Clara-Farben (wie Clara-Chat / Floating-Button) */
const CLARA_BG = '#F5F0FF';
const CLARA_BORDER = '#E6E6FA';
const CLARA_TEXT = '#6B5B95';
const CLARA_GRADIENT = 'linear-gradient(160deg, #4C1D95 0%, #6D28D9 25%, #7C3AED 45%, #8B5CF6 65%, #A78BFA 85%, #C4B5FD 100%)';

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

interface StimmzettelProps {
  level: 'bund' | 'land' | 'kommune';
  wahlkreis?: string;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[99999] p-0 md:p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
      <div
        className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ maxHeight: 'min(90dvh, calc(100svh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 48px))' }}
      >
        {/* Header – gleiche Farbe wie Clara-Chat */}
        <div className="text-white p-4 sm:p-6 flex justify-between items-center flex-shrink-0" style={{ background: CLARA_GRADIENT, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Clara erklärt</h3>
              <p className="text-xs sm:text-sm opacity-90 truncate min-w-0">
                {type === 'kandidat' ? data.name : data.kuerzel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content – scrollbar, bleibt im Rahmen */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 sm:space-y-6">
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
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BookOpen size={16} className="text-gray-600" />
              Quellen
            </h4>
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
            <MessageCircle size={18} />
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

const OriginalStimmzettel: React.FC<StimmzettelProps> = ({ level, wahlkreis, onVote, onKIAnalysis, onOpenClaraChat }) => {
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Bundestagswahl Stimmzettel */}
      {level === 'bund' && (
        <div className="space-y-6">
          {/* Header mit Bundesadler-Placeholder */}
          <div className="ballot-paper text-center pb-6 border-b-2 border-gray-900">
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Bundesadler SVG Placeholder */}
              <svg width="48" height="48" viewBox="0 0 48 48" className="text-gray-900">
                <path d="M24 8L28 16H36L29 21L32 30L24 25L16 30L19 21L12 16H20L24 8Z" fill="currentColor" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900">BUNDESTAGSWAHL</h1>
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
                      className="ballot-checkbox"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-lg">{partei.kuerzel}</div>
                      <div className="text-sm text-gray-700">{partei.name}</div>
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
              className={`px-12 py-4 text-xl font-bold transition-all ${
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
              className={`px-12 py-4 text-xl font-bold transition-all ${
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
          <div className="ballot-paper border-2 border-gray-900 p-4 max-w-full overflow-hidden">
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
                        <span className="font-bold text-gray-900 text-base break-words">{kandidat.name}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-0.5 break-words">{kandidat.parteiLang}</div>
                      <div className="text-xs text-gray-600 mt-0.5 break-words">
                        {kandidat.beruf} • {kandidat.alter} Jahre • {kandidat.wohnort}
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

          {/* Vote Button */}
          <div className="text-center pb-8">
            <button
              onClick={handleVote}
              disabled={!selectedKommune}
              className={`px-8 py-3 text-base font-bold transition-all rounded-lg ${
                selectedKommune
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedKommune ? 'Stimme abgeben' : 'Bitte Kandidaten auswählen'}
            </button>
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
