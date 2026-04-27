'use client';

import React, { useState } from 'react';
import { ListChecks } from 'lucide-react';
import { WAHLEN_DATA } from '@/data/constants';
import { collectSourceLinks, hasVerifiedPrimarySource } from '@/lib/stimmzettelSources';

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
    name: 'Hochlenert, Dominik',
    partei: 'CDU',
    parteiLang: 'Christlich Demokratische Union Deutschlands',
    beruf: 'Bürgermeister',
    wohnort: 'Kirkel',
    kiInfo:
      'Als Bürgermeister von Kirkel benannt (Gemeinderat Kirkel, Niederschrift der öffentlichen Sitzung 30. Januar 2025).',
    quellen: ['[1] https://ratsinfoservice.de/ris/kirkel/file/getfile/64066'],
    matchScore: undefined
  },
  { 
    name: 'Jahnke, Dennis',
    partei: 'SPD',
    parteiLang: 'Sozialdemokratische Partei Deutschlands',
    beruf: 'Gemeinderatsmitglied',
    kiInfo:
      'Als Mitglied der SPD-Fraktion im Gemeinderat Kirkel aufgeführt (Niederschrift der öffentlichen Sitzung 30. Januar 2025).',
    quellen: ['[1] https://ratsinfoservice.de/ris/kirkel/file/getfile/64066'],
    matchScore: undefined
  },
  { 
    name: 'Jahnke, Dirk',
    partei: 'SPD',
    parteiLang: 'Sozialdemokratische Partei Deutschlands',
    beruf: 'Gemeinderatsmitglied',
    kiInfo:
      'Als Mitglied der SPD-Fraktion im Gemeinderat Kirkel aufgeführt (Niederschrift der öffentlichen Sitzung 30. Januar 2025).',
    quellen: ['[1] https://ratsinfoservice.de/ris/kirkel/file/getfile/64066'],
    matchScore: undefined
  },
  { 
    name: 'Leibrock, Axel',
    partei: 'GRÜNE',
    parteiLang: 'BÜNDNIS 90/DIE GRÜNEN',
    beruf: 'Gemeinderatsmitglied',
    kiInfo:
      'Als Mitglied der Fraktion Bündnis 90/Die Grünen im Gemeinderat Kirkel aufgeführt (Niederschrift der öffentlichen Sitzung 30. Januar 2025).',
    quellen: ['[1] https://ratsinfoservice.de/ris/kirkel/file/getfile/64066'],
    matchScore: undefined
  },
  { 
    name: 'Reinhold, Nicole',
    partei: 'DIE LINKE',
    parteiLang: 'DIE LINKE',
    beruf: 'Gemeinderatsmitglied',
    kiInfo:
      'Als Mitglied der Fraktion Die Linke im Gemeinderat Kirkel aufgeführt (Niederschrift der öffentlichen Sitzung 30. Januar 2025).',
    quellen: ['[1] https://ratsinfoservice.de/ris/kirkel/file/getfile/64066'],
    matchScore: undefined
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
  level: 'bund' | 'land' | 'kommune' | 'kreis';
  wahlkreis?: string;
  canVote?: boolean;
  /** Aktuell ausgewählte Wahl aus WAHLEN_DATA (entscheidet über Datum + Status). */
  selectedWahl?: any;
  /** Anrede-Modus aus der App (true = du, false = Sie). */
  du?: boolean;
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
  du: boolean;
  onClose: () => void;
  onOpenChat: (context?: string) => void;
}

function SourceTrustBadge({ data, du }: { data: unknown; du: boolean }) {
  const ok = hasVerifiedPrimarySource(data);
  return (
    <span
      className={`inline-block max-w-full rounded px-1.5 py-0.5 text-[9px] font-semibold leading-tight sm:text-[10px] ${
        ok ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
      }`}
      title={
        ok
          ? du
            ? 'Mindestens eine verifizierbare Primärquelle (Link) hinterlegt'
            : 'Mindestens eine verifizierbare Primärquelle (Link) hinterlegt'
          : du
            ? 'Keine verifizierbare Primärquelle in der Demo – bitte offizielle Stellen prüfen'
            : 'Keine verifizierbare Primärquelle in der Demo – bitte offizielle Stellen prüfen'
      }
    >
      {ok ? 'Primärquelle verfügbar' : 'Demo-Platzhalter'}
    </span>
  );
}

function PrimarySourceMeta({ data, du }: { data: unknown; du: boolean }) {
  const sources = collectSourceLinks(data);
  if (sources.length > 0) {
    const primary = sources[0];
    return (
      <a
        href={primary.url}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-block text-[10px] font-medium text-[#0055A4] underline decoration-[#BFD9FF] underline-offset-2 hover:opacity-90"
        title={primary.url}
      >
        Primärquelle öffnen: {primary.label}
      </a>
    );
  }
  return (
    <p className="mt-1 text-[10px] text-amber-700">
      {du
        ? 'Demo-Platzhalter – externe Programme noch nicht angebunden.'
        : 'Demo-Platzhalter – externe Programme noch nicht angebunden.'}
    </p>
  );
}

// Clara Info Bottom Sheet Modal – bleibt innerhalb des iPhone-Screens (safe area, scrollbarer Inhalt)
const ClaraInfoModal: React.FC<ClaraInfoModalProps> = ({ data, type, du, onClose, onOpenChat }) => {
  const sourceLinks = collectSourceLinks(data);
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
              <p className="truncate text-xs opacity-90">
                {type === 'kandidat' ? data.name : (data.kuerzel ?? data.name ?? data.partei ?? '')}
              </p>
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
              <p>
                {data.kiInfo ?? data.claraInfo ?? data.programm ?? data.klartext ?? '—'}
              </p>
            </div>
          </div>

          {/* Positionen */}
          {data.positionen && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Wichtigste Positionen</h4>
              <div className="space-y-2">
                {data.positionen.slice(0, 3).map((pos: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                    <ListChecks className="h-4 w-4 flex-shrink-0" style={{ color: CLARA_TEXT }} aria-hidden />
                    <span className="text-sm text-gray-700">{pos}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Übereinstimmungswert */}
          {data.matchScore && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">
                  {du ? 'Match mit deinen Prioritäten' : 'Match mit Ihren Prioritäten'}
                </span>
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
            {sourceLinks.length > 0 ? (
              <div className="space-y-1 text-xs text-gray-700">
                {sourceLinks.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[#0055A4] underline decoration-[#BFD9FF] underline-offset-2 hover:opacity-90"
                    title={s.url}
                  >
                    • {s.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600">
                Keine verifizierten Quellen hinterlegt (Konzeptdemo). Bitte offizielle Wahlleitung/Parteiquellen prüfen.
              </p>
            )}
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50"
            aria-label="Fenster schließen"
          >
            ×
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
  selectedWahl,
  du = false,
  kommuneBallot = 'kirkel',
  introMode = false,
  onVote,
  onKIAnalysis,
  onOpenClaraChat,
}) => {
  const t = (duText: string, sieText: string) => (du ? duText : sieText);
  const partyFullName = (short: string | undefined): string => {
    const s = (short || '')
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/\s+/g, ' ')
      .trim();
    if (!s) return '';
    const map: Record<string, string> = {
      cdu: 'Christlich Demokratische Union Deutschlands',
      'cdu/csu': 'Christlich Demokratische Union Deutschlands / Christlich-Soziale Union in Bayern',
      spd: 'Sozialdemokratische Partei Deutschlands',
      gruene: 'BÜNDNIS 90/DIE GRÜNEN',
      fdp: 'Freie Demokratische Partei',
      'die linke': 'DIE LINKE',
      afd: 'Alternative für Deutschland',
      bsw: 'Bündnis Sahra Wagenknecht',
      'dielinke': 'DIE LINKE',
    };
    return map[s] || short || '';
  };

  const formatGermanDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    // expected: DD.MM.YYYY
    const m = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!m) return dateStr;
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d = new Date(yyyy, mm - 1, dd);
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ];
    const weekday = weekdays[d.getDay()] || '';
    const month = months[mm - 1] || '';
    return `${weekday}, ${dd}. ${month} ${yyyy}`;
  };

  const [selectedErststimme, setSelectedErststimme] = useState<string | null>(null);
  const [selectedZweitstimme, setSelectedZweitstimme] = useState<string | null>(null);
  const [selectedLandtag, setSelectedLandtag] = useState<string | null>(null);
  const [selectedKreis, setSelectedKreis] = useState<string | null>(null);
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
    } else if (level === 'kreis' && selectedKreis) {
      onVote('kreis', selectedKreis, '');
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

  // Für Datum/Kandidaten verwenden wir bevorzugt die wirklich ausgewählte Wahl.
  // Fallback: statische Demo-Daten.
  const bundElection =
    level === 'bund' && selectedWahl
      ? selectedWahl
      : WAHLEN_DATA.find((w: any) => w.id === 'btw25' || w.name?.includes('Bundestagswahl'));
  const landElection =
    level === 'land' && selectedWahl
      ? selectedWahl
      : WAHLEN_DATA.find((w: any) => w.id === 'ltw-sl-2022' || w.name?.includes('Landtagswahl Saarland'));
  const kreisElection =
    level === 'kreis' && selectedWahl
      ? selectedWahl
      : WAHLEN_DATA.find((w: any) => w.id === 'kt-saarpfalz-2024' || w.name?.includes('Saarpfalz-Kreis'));

  const bundKandidaten: any[] = bundElection?.kandidaten?.length
    ? bundElection.kandidaten
    : BUNDESTAG_KANDIDATEN;
  const bundParteien: any[] = bundElection?.parteien?.length
    ? bundElection.parteien.map((p: any) => ({
        kuerzel: p.name,
        name: p.name,
        kiInfo: p.programm,
      }))
    : BUNDESTAG_PARTEIEN;

  const landKandidaten: any[] = landElection?.kandidaten?.length ? landElection.kandidaten : LANDTAG_KANDIDATEN;
  const kreisParteien: any[] = kreisElection?.parteien?.length
    ? kreisElection.parteien.map((p: any) => ({
        kuerzel: p.name,
        name: p.name,
        kiInfo: p.programm,
      }))
    : [];
  const kreisKandidaten: any[] = kreisElection?.kandidaten?.length ? kreisElection.kandidaten : [];

  const kommuneHead =
    kommuneBallot === 'heidelberg'
      ? { top: 'Stadt Heidelberg', sub: 'Stadt Heidelberg', candLine: '(Gemeinderat)' }
      : kommuneBallot === 'viernheim'
        ? { top: 'Stadt Viernheim', sub: 'Hessen · Kreis Bergstraße', candLine: '(Gemeinderat)' }
        : { top: 'Verbandsgemeinde Kirkel', sub: 'Gemeinde Kirkel', candLine: '(Gemeinderat/Verbandsgemeinderat)' };

  return (
    <div className={`mx-auto max-w-4xl text-[13px] leading-relaxed text-gray-900 sm:text-[14px] ${introMode ? 'ballot-intro' : ''}`}>
      {/* Bundestagswahl Stimmzettel */}
      {level === 'bund' && (
        <div className={`${introMode ? 'space-y-2.5' : 'space-y-4'}`}>
          {/* Header mit Bundesadler-Placeholder */}
          <div className={`ballot-paper border-b-2 border-gray-900 text-center ${introMode ? 'pb-2.5' : 'pb-4'}`}>
            <div className={`flex items-center justify-center gap-4 ${introMode ? 'mb-1.5' : 'mb-4'}`}>
            <h1
                className={
                  introMode
                    ? 'text-[12px] font-semibold tracking-tight text-gray-900 sm:text-[13px]'
                    : 'text-lg font-bold tracking-tight text-gray-900 sm:text-xl'
                }
              >
                BUNDESTAGSWAHL
              </h1>
            </div>
            <p className={introMode ? 'text-[11px] font-semibold text-gray-700' : 'text-sm font-semibold text-gray-700 sm:text-base'}>
              {formatGermanDate(bundElection?.datum) || '—'}
            </p>
            <p className={introMode ? 'mt-0.5 text-[10px] text-gray-700' : 'mt-1 text-[12px] text-gray-700 sm:text-sm'}>Wahlkreis {wahlkreis || '—'}</p>
            <div className={introMode ? 'mt-2 border-2 border-blue-300 bg-blue-100 p-2' : 'mt-3 border-2 border-blue-300 bg-blue-100 p-2.5 sm:mt-4 sm:p-4'}>
              <p className={introMode ? 'text-[11px] font-bold text-blue-900' : 'text-sm font-bold text-blue-900 sm:text-base'}>
                {t('Du hast 2 Stimmen', 'Sie haben 2 Stimmen')}
              </p>
            </div>
          </div>

          {/* Erststimme */}
          <div className={`ballot-paper border-2 border-gray-900 ${introMode ? 'p-2.5' : 'p-3 sm:p-6'}`}>
            <div className={introMode ? 'mb-2.5' : 'mb-4 sm:mb-6'}>
              <h2 className={introMode ? 'mb-1 text-[12px] font-semibold leading-none text-gray-900 sm:text-[13px]' : 'mb-1.5 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl'}>ERSTSTIMME</h2>
              <p className={introMode ? 'mb-2 text-[10px] text-gray-700' : 'mb-3 text-[12px] text-gray-700 sm:mb-4 sm:text-sm'}>
                (Wahl eines Wahlkreisabgeordneten)
              </p>
            </div>

            <div className="space-y-2">
              {bundKandidaten.map((kandidat, index) => (
                <div key={index} className="ballot-option relative group">
                  <label className="flex items-center gap-3 cursor-pointer w-full">
                    <input
                      type="radio"
                      name="erststimme"
                      value={kandidat.name}
                      checked={selectedErststimme === kandidat.name}
                    onChange={(e) => setSelectedErststimme(e.target.value)}
                    disabled={!canVote}
                      className={`ballot-checkbox ${introMode ? 'ballot-checkbox--intro' : ''}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={introMode ? 'text-[10px] font-bold text-gray-900' : 'text-[14px] font-bold text-gray-900 sm:text-[15px]'}>{index + 1}.</span>
                        <span className={introMode ? 'text-[10px] font-bold text-gray-900' : 'text-[14px] font-bold text-gray-900 sm:text-[15px]'}>{kandidat.name}</span>
                      </div>
                      <div className={introMode ? 'mt-0.5 text-[10px] text-gray-700' : 'mt-0.5 text-xs text-gray-700 sm:mt-1 sm:text-sm'}>
                        {kandidat.parteiLang || partyFullName(kandidat.partei)}
                      </div>
                      <div className="mt-1">
                        <SourceTrustBadge data={kandidat} du={du} />
                        <PrimarySourceMeta data={kandidat} du={du} />
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

          {/* Zweitstimme */}
          <div className={`ballot-paper border-2 border-gray-900 ${introMode ? 'p-2.5' : 'p-3 sm:p-6'}`}>
            <div className={introMode ? 'mb-2.5' : 'mb-4 sm:mb-6'}>
              <h2 className={introMode ? 'mb-1 text-[12px] font-semibold leading-none text-gray-900 sm:text-[13px]' : 'mb-1.5 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl'}>ZWEITSTIMME</h2>
              <p className={introMode ? 'mb-2 text-[10px] text-gray-700' : 'mb-3 text-[12px] text-gray-700 sm:mb-4 sm:text-sm'}>
                (Wahl einer Landesliste - entscheidet über die Sitzverteilung im Bundestag)
              </p>
            </div>

            <div className="space-y-2">
              {bundParteien.map((partei, index) => (
                <div key={index} className="ballot-option relative group">
                  <label className="flex items-center gap-3 cursor-pointer w-full">
                    <input
                      type="radio"
                      name="zweitstimme"
                      value={partei.kuerzel}
                      checked={selectedZweitstimme === partei.kuerzel}
                    onChange={(e) => setSelectedZweitstimme(e.target.value)}
                    disabled={!canVote}
                      className={`ballot-checkbox ${introMode ? 'ballot-checkbox--intro' : ''}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={introMode ? 'text-[10px] font-bold text-gray-900' : 'text-[14px] font-bold text-gray-900 sm:text-[15px]'}>{partei.kuerzel}</div>
                      <div className={introMode ? 'text-[10px] text-gray-700' : 'text-xs text-gray-700 sm:text-sm'}>
                        {partyFullName(partei.kuerzel) || partei.name}
                      </div>
                      <div className="mt-1">
                        <SourceTrustBadge data={partei} du={du} />
                        <PrimarySourceMeta data={partei} du={du} />
                      </div>
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
                {t(
                  'In der App tippst du auf das Kreisfeld neben deiner Wahl – Erststimme (Person) und Zweitstimme (Partei).',
                  'In der App tippen Sie auf das Kreisfeld neben Ihrer Wahl – Erststimme (Person) und Zweitstimme (Partei).',
                )}
              </p>
            ) : (
              <button
                onClick={handleVote}
                disabled={!canVote || !selectedErststimme || !selectedZweitstimme}
                className={`rounded-lg px-6 py-3 text-base font-bold transition-all sm:px-12 sm:py-4 sm:text-xl ${
                  canVote && selectedErststimme && selectedZweitstimme
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
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
        <div className="space-y-4">
          {/* Header */}
          <div className="ballot-paper border-b-2 border-gray-900 pb-4 text-center">
            <h1 className="mb-2 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">LANDTAGSWAHL SAARLAND</h1>
            <p className="text-sm font-semibold text-gray-700 sm:text-base">
              {landElection?.datum === 'aktuell'
                ? 'Frühjahr 2027'
                : formatGermanDate(landElection?.datum) || '—'}
            </p>
            <div className="mt-3 border-2 border-blue-300 bg-blue-100 p-2.5 sm:mt-4 sm:p-4">
              <p className="text-sm font-bold text-blue-900 sm:text-base">
                {t('Du hast 1 Stimme', 'Sie haben 1 Stimme')}
              </p>
            </div>
          </div>

          {/* Kandidaten */}
          <div className="ballot-paper border-2 border-gray-900 p-3 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="mb-1.5 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl">KANDIDATEN</h2>
              <p className="mb-3 text-[12px] text-gray-700 sm:mb-4 sm:text-sm">
                (Ministerpräsident/in)
              </p>
            </div>

            <div className="space-y-2">
              {landKandidaten.map((kandidat, index) => (
                <div key={index} className="ballot-option relative group">
                  <label className="flex items-center gap-3 cursor-pointer w-full">
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
                        <span className="text-[14px] font-bold text-gray-900 sm:text-[15px]">{index + 1}.</span>
                        <span className="text-[14px] font-bold text-gray-900 sm:text-[15px]">{kandidat.name}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-700 sm:mt-1 sm:text-sm">
                        {kandidat.parteiLang || partyFullName(kandidat.partei)}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-600 sm:mt-1">
                        {kandidat.beruf}
                        {typeof kandidat.alter === 'number' ? ` • ${kandidat.alter} Jahre` : ''}
                      </div>
                      <div className="mt-1">
                        <SourceTrustBadge data={kandidat} du={du} />
                        <PrimarySourceMeta data={kandidat} du={du} />
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
                {t(
                  'In der App wählst du deine Stimme für den Landtag – hier ein Beispiel für das Saarland.',
                  'In der App wählen Sie Ihre Stimme für den Landtag – hier ein Beispiel für das Saarland.',
                )}
              </p>
            ) : (
              <button
                onClick={handleVote}
                disabled={!canVote || !selectedLandtag}
                className={`rounded-lg px-6 py-3 text-base font-bold transition-all sm:px-12 sm:py-4 sm:text-xl ${
                  canVote && selectedLandtag
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
              >
                {!canVote ? 'Ergebnis ansehen (nicht mehr abstimmbar)' : selectedLandtag ? 'Teilnahme in Demo bestaetigen' : 'Bitte Kandidaten auswaehlen'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Kreisebene (z. B. Saarpfalz-Kreis) */}
      {level === 'kreis' && (
        <div className="space-y-4">
          <div className="ballot-paper border-b-2 border-gray-900 pb-4 text-center">
            <h1 className="mb-2 text-lg font-bold tracking-tight text-gray-900 sm:text-xl break-words">
              {String(kreisElection?.name || 'KREISWAHL').toUpperCase()}
            </h1>
            <p className="text-sm font-semibold text-gray-700 sm:text-base">
              {formatGermanDate(kreisElection?.datum) || '—'}
            </p>
            <p className="mt-1 text-[12px] text-gray-700 sm:text-sm">{kreisElection?.wahlkreis || wahlkreis || '—'}</p>
            <div className="mt-3 border-2 border-blue-300 bg-blue-100 p-2.5 sm:mt-4 sm:p-4">
              <p className="text-sm font-bold text-blue-900 sm:text-base">
                {t('Du hast 1 Stimme', 'Sie haben 1 Stimme')}
              </p>
            </div>
          </div>

          <div className="ballot-paper border-2 border-gray-900 p-3 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="mb-1.5 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl">LISTEN / PARTEIEN</h2>
              <p className="mb-3 text-[12px] text-gray-700 sm:mb-4 sm:text-sm">(Kreislisten)</p>
            </div>

            {kreisParteien.length ? (
              <div className="space-y-2">
                {kreisParteien.map((partei, index) => (
                  <div key={index} className="ballot-option relative group">
                    <label className="flex items-center gap-3 cursor-pointer w-full">
                      <input
                        type="radio"
                        name="kreis"
                        value={partei.kuerzel}
                        checked={selectedKreis === partei.kuerzel}
                        onChange={(e) => setSelectedKreis(e.target.value)}
                        disabled={!canVote}
                        className="ballot-checkbox"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-gray-900 sm:text-[15px]">{partei.kuerzel}</div>
                        <div className="text-xs text-gray-700 sm:text-sm">{partyFullName(partei.kuerzel) || partei.name}</div>
                        <div className="mt-1">
                          <SourceTrustBadge data={partei} du={du} />
                          <PrimarySourceMeta data={partei} du={du} />
                        </div>
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
            ) : (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                <p className="font-semibold">Demo-Hinweis</p>
                <p>
                  {t(
                    'Für diese Kreiswahl sind in der Demo noch keine Listen mit Primärquellen hinterlegt. In der App würdest du hier die Kreislisten mit offiziellen Verweisen sehen.',
                    'Für diese Kreiswahl sind in der Demo noch keine Listen mit Primärquellen hinterlegt. In der App würden Sie hier die Kreislisten mit offiziellen Verweisen sehen.',
                  )}
                </p>
              </div>
            )}
          </div>

          {kreisKandidaten.length && showAux ? (
            <div className="ballot-paper border-2 border-gray-900 p-3 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="mb-1.5 text-lg font-bold text-gray-900 sm:mb-2 sm:text-xl">AMT / PERSON</h2>
                <p className="mb-3 text-[12px] text-gray-700 sm:mb-4 sm:text-sm">(z. B. Landrat – Informationsbereich)</p>
              </div>
              <div className="space-y-2">
                {kreisKandidaten.map((kandidat, index) => (
                  <div key={index} className="ballot-option relative group">
                    <div className="flex items-center gap-3 w-full">
                      <div className="ballot-checkbox opacity-30" aria-hidden />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-gray-900 sm:text-[15px]">{index + 1}.</span>
                          <span className="text-[14px] font-bold text-gray-900 sm:text-[15px]">{kandidat.name}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-700 sm:mt-1 sm:text-sm">
                          {kandidat.parteiLang || partyFullName(kandidat.partei)}
                        </div>
                        <div className="mt-1">
                          <SourceTrustBadge data={kandidat} du={du} />
                          <PrimarySourceMeta data={kandidat} du={du} />
                        </div>
                      </div>
                    </div>
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
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {showAux ? (
            <div className="text-center py-4">
              <button
                onClick={() => handleOpenClaraChat('Ich habe Fragen zu dieser Kreiswahl – Parteien, Zuständigkeiten, Kandidaten')}
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
                {t(
                  'In der App wählst du bei Kreiswahlen typischerweise eine Liste/Partei – hier als kompakte Demo-Ansicht.',
                  'In der App wählen Sie bei Kreiswahlen typischerweise eine Liste/Partei – hier als kompakte Demo-Ansicht.',
                )}
              </p>
            ) : (
              <button
                onClick={handleVote}
                disabled={!canVote || !selectedKreis}
                className={`rounded-lg px-6 py-3 text-base font-bold transition-all sm:px-12 sm:py-4 sm:text-xl ${
                  canVote && selectedKreis
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
              >
                {!canVote
                  ? 'Ergebnis ansehen (nicht mehr abstimmbar)'
                  : selectedKreis
                    ? 'Teilnahme in Demo bestaetigen'
                    : 'Bitte Liste auswaehlen'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Kommunalwahl Kirkel Stimmzettel */}
      {level === 'kommune' && (
        <div className="space-y-4 max-w-full overflow-hidden">
          {/* Header */}
          <div className="ballot-paper text-center pb-4 border-b-2 border-gray-900 px-2">
            <h1 className="mb-2 text-[1rem] font-bold leading-tight text-gray-900 sm:text-xl sm:leading-snug">
              GEMEINDERATSWAHL
            </h1>
            <p className="text-sm font-semibold text-gray-700">{kommuneHead.top}</p>
            <p className="mt-1 text-[12px] text-gray-700">{kommuneHead.sub}</p>
            <div
              className="mt-3 rounded-lg border-2 p-3 text-white"
              style={{
                borderColor: 'rgba(0, 51, 102, 0.35)',
                background: 'linear-gradient(135deg, var(--gov-primary) 0%, var(--gov-primary-mid) 100%)',
                boxShadow: '0 2px 8px rgba(0, 51, 102, 0.2)',
              }}
            >
              <p className="text-sm font-bold">{t('Du hast 1 Stimme', 'Sie haben 1 Stimme')}</p>
            </div>
          </div>

          {/* Kandidaten */}
          <div className="ballot-paper border-2 border-gray-900 p-3 max-w-full overflow-hidden">
            <div className="mb-3">
              <h2 className="mb-2 break-words text-lg font-bold text-gray-900">KANDIDATEN</h2>
              <p className="mb-3 text-[12px] text-gray-700">{kommuneHead.candLine}</p>
            </div>

            <div className="space-y-1.5">
              {kommunalKandidaten.map((kandidat, index) => (
                <div key={index} className="ballot-option relative group min-w-0">
                  <label className="flex items-start gap-2 cursor-pointer w-full min-w-0">
                    <input
                      type="radio"
                      name="kommune"
                      value={kandidat.name}
                      checked={selectedKommune === kandidat.name}
                      onChange={(e) => setSelectedKommune(e.target.value)}
                      disabled={!canVote}
                      className="ballot-checkbox mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden leading-snug">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-bold text-gray-900">{index + 1}.</span>
                        <span className="break-words text-[14px] font-bold text-gray-900">{kandidat.name}</span>
                      </div>
                      <div className="mt-0.5 text-[12px] font-semibold text-gray-800 break-words">{kandidat.partei}</div>
                      <div className="text-[11px] text-gray-700 break-words">
                        {kandidat.parteiLang || partyFullName(kandidat.partei)}
                      </div>
                      <div className="mt-0.5 text-[11px] text-gray-600 break-words">
                        {[
                          (kandidat as any).beruf,
                          typeof (kandidat as any).alter === 'number' ? `${(kandidat as any).alter} Jahre` : null,
                          (kandidat as any).wohnort,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                      <div className="mt-1">
                        <SourceTrustBadge data={kandidat} du={du} />
                        <PrimarySourceMeta data={kandidat} du={du} />
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
                      className="rounded-lg px-2 py-1 text-[12px] font-semibold flex items-center justify-center hover:opacity-90 transition-opacity border flex-shrink-0"
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
              <p className="mt-2 text-[11px] text-gray-600">
                Parteiprogramme werden hier als Demo-Platzhalter angezeigt und sind derzeit nicht produktiv angebunden.
              </p>
            </div>
          ) : null}

          <div className="sticky bottom-0 left-0 right-0 pt-4 pb-6 -mb-2 bg-gradient-to-t from-gray-50 to-transparent">
            <div className="text-center">
              {introMode ? (
                <p className="text-sm text-gray-600 px-2">
                  {kommuneBallot === 'viernheim'
                    ? t(
                        'In Viernheim wählst du z. B. den Gemeinderat – ein Kreuz bei der Person, wie auf dem Papierstimmzettel.',
                        'In Viernheim wählen Sie z. B. den Gemeinderat – ein Kreuz bei der Person, wie auf dem Papierstimmzettel.',
                      )
                    : kommuneBallot === 'heidelberg'
                      ? t(
                          'In Heidelberg wählst du den Gemeinderat – vergleichbar zum Papierstimmzettel.',
                          'In Heidelberg wählen Sie den Gemeinderat – vergleichbar zum Papierstimmzettel.',
                        )
                      : t(
                          'In Kirkel wählst du z. B. den Gemeinderat – ein Kreuz bei der Liste oder Person, wie auf dem Papierstimmzettel.',
                          'In Kirkel wählen Sie z. B. den Gemeinderat – ein Kreuz bei der Liste oder Person, wie auf dem Papierstimmzettel.',
                        )}
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
          du={du}
          onClose={() => setShowClaraInfo(null)}
          onOpenChat={handleOpenClaraChat}
        />
      )}
    </div>
  );
};

export default OriginalStimmzettel;
