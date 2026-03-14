export type ProgramSource = {
  label: string;
  url: string;
  kind?: 'official' | 'aggregator' | 'news' | 'process';
};

export type RegionPrograms = {
  regionLabel: string;
  notes?: string[];
  sources: ProgramSource[];
};

// Ziel: Quellenbasierte Verlinkung statt „ausgedachte“ Inhalte.
// Stand: 2026 – Links können sich ändern, daher möglichst offizielle Seiten/Portale.
export const WAHLPROGRAMME_2026: Record<string, RegionPrograms> = {
  berlin: {
    regionLabel: 'Berlin – Abgeordnetenhauswahl 20. September 2026',
    sources: [
      {
        label: 'SPD Berlin: Wahlprogramm „Mit Mut für Berlin“',
        url: 'https://spd.berlin/wahlprogramm/',
        kind: 'official'
      },
      {
        label: 'GRÜNE Berlin: Wahlprogramm 2026 „Politik ändern, Berlin bleiben“',
        url: 'https://gruene.berlin/wahlprogramm',
        kind: 'official'
      },
      {
        label: 'CDU Berlin: Wofür wir stehen / Positionen',
        url: 'https://www.cdu.berlin/wofuer-wir-stehen',
        kind: 'official'
      },
      {
        label: 'CDU Berlin: Berlin-Plan',
        url: 'https://www.cdu.berlin/berlinplan',
        kind: 'official'
      },
      {
        label: 'FDP Berlin: Wahlprogramm / Landtagswahl 2026',
        url: 'https://www.fdp-berlin.de/wahlprogramm',
        kind: 'official'
      }
    ],
    notes: [
      'Weitere Parteien (LINKE, AfD etc.): offizielle Landesverbände prüfen.'
    ]
  },
  'baden-wuerttemberg': {
    regionLabel: 'Baden-Württemberg – Landtagswahl 8. März 2026',
    sources: [
      {
        label: 'Übersicht aller Wahlprogramme 2026 (Landeszentrale für politische Bildung)',
        url: 'https://www.landtagswahl-bw.de/parteien-ltw0/wahlprogramme-2026',
        kind: 'aggregator'
      },
      {
        label: 'CDU BW: Regierungsprogramm „Agenda der Zuversicht“',
        url: 'https://www.cdu-bw.de/regierungsprogramm/',
        kind: 'official'
      },
      {
        label: 'SPD BW: Wahlprogramm „Weil es um Dich geht“',
        url: 'https://www.spd-bw.de/landtagswahl-2026/',
        kind: 'official'
      },
      {
        label: 'Grüne BW: Wahlprogramm „Stabil in bewegten Zeiten“',
        url: 'https://www.gruene-bw.de/wahlen/wahlprogramm-landtagswahl-2026/',
        kind: 'official'
      },
      {
        label: 'Wahlprogramm SPD (Übersicht landtagswahl-bw.de)',
        url: 'https://www.landtagswahl-bw.de/parteien-uebersicht/wahlprogramm-spd',
        kind: 'aggregator'
      }
    ]
  },
  bremen: {
    regionLabel: 'Bremen – Bürgerschaftswahl (nächste: 2027)',
    notes: [
      'Die nächste Bürgerschaftswahl in Bremen ist für 2027 vorgesehen. Hier finden Sie Programmseiten und laufende Prozesse (Stand 2026).'
    ],
    sources: [
      {
        label: 'SPD Bremen: Zukunftsprogramme zur Bürgerschaftswahl',
        url: 'https://www.spd-land-bremen.de/Zukunftsprogramme-zur-Buergerschaftswahl.html',
        kind: 'official'
      },
      {
        label: 'GRÜNE Bremen: Wahlprogrammprozess Bürgerschaftswahl 2027',
        url: 'https://gruene-bremen.de/2026/02/13/start-des-wahlprogrammprozesses-zur-buergerschaftswahl-2027/',
        kind: 'process'
      },
      {
        label: 'Friedrich-Ebert-Stiftung: SPD Bremen Wahlprogramme (Archiv)',
        url: 'https://www.fes.de/bibliothek/spd-bremen-wahlprogramme',
        kind: 'aggregator'
      }
    ]
  },
  hessen: {
    regionLabel: 'Hessen – Landtagswahl (nächste: 2027)',
    notes: ['Landtagswahl Hessen voraussichtlich 2027. Hier finden Sie Landesebene und Bund.'],
    sources: [
      { label: 'Landtag Hessen – Wahlen & Bürgerbeteiligung', url: 'https://hessischer-landtag.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung Hessen – Wahlen', url: 'https://hlz.hessen.de/politik/wahlen', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  bayern: {
    regionLabel: 'Bayern – Landtagswahl (nächste: 2028)',
    notes: ['Landtag Bayern voraussichtlich 2028. Landesebene und Bund.'],
    sources: [
      { label: 'Bayerischer Landtag – Wahlen', url: 'https://www.bayern.landtag.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung Bayern – Wahlen', url: 'https://www.blz.bayern.de/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  brandenburg: {
    regionLabel: 'Brandenburg – Landtagswahl (nächste: 2029)',
    notes: ['Landtag Brandenburg. Landesebene und Bund.'],
    sources: [
      { label: 'Landtag Brandenburg – Wahlen & Bürgerbeteiligung', url: 'https://www.landtag.brandenburg.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung Brandenburg', url: 'https://www.politische-bildung-brandenburg.de/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  hamburg: {
    regionLabel: 'Hamburg – Bürgerschaftswahl (nächste: 2030)',
    notes: ['Bürgerschaft Hamburg. Landesebene und Bund.'],
    sources: [
      { label: 'Hamburgische Bürgerschaft – Wahlen', url: 'https://www.hamburgische-buergerschaft.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung Hamburg – Wahlen', url: 'https://www.hamburg.de/politische-bildung/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  'mecklenburg-vorpommern': {
    regionLabel: 'Mecklenburg-Vorpommern – Landtagswahl (nächste: 2026)',
    notes: ['Landtag MV. Landesebene und Bund.'],
    sources: [
      { label: 'Landtag Mecklenburg-Vorpommern – Wahlen', url: 'https://www.landtag-mv.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung MV', url: 'https://www.lpb-mv.de/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  niedersachsen: {
    regionLabel: 'Niedersachsen – Landtagswahl (nächste: 2027)',
    notes: ['Landtag Niedersachsen voraussichtlich 2027. Landesebene und Bund.'],
    sources: [
      { label: 'Niedersächsischer Landtag – Wahlen', url: 'https://www.landtag-niedersachsen.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung Niedersachsen – Wahlen', url: 'https://www.demokratie-niedersachsen.de/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  'nordrhein-westfalen': {
    regionLabel: 'Nordrhein-Westfalen – Landtagswahl (nächste: 2027)',
    notes: ['Landtag NRW voraussichtlich 2027. Landesebene und Bund.'],
    sources: [
      { label: 'Landtag NRW – Wahlen & Bürgerbeteiligung', url: 'https://www.landtag.nrw.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung NRW – Wahlen', url: 'https://www.politische-bildung.nrw/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  'rheinland-pfalz': {
    regionLabel: 'Rheinland-Pfalz – Landtagswahl (nächste: 2026)',
    notes: ['Landtag R-P. Landesebene und Bund.'],
    sources: [
      { label: 'Landtag Rheinland-Pfalz – Wahlen', url: 'https://www.landtag.rlp.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung R-P – Wahlen', url: 'https://politische-bildung-rlp.de/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  sachsen: {
    regionLabel: 'Sachsen – Landtagswahl (nächste: 2029)',
    notes: ['Landtag Sachsen. Landesebene und Bund.'],
    sources: [
      { label: 'Sächsischer Landtag – Wahlen', url: 'https://www.landtag.sachsen.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung Sachsen – Wahlen', url: 'https://www.slpb.de/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  'sachsen-anhalt': {
    regionLabel: 'Sachsen-Anhalt – Landtagswahl (nächste: 2026)',
    notes: ['Landtag Sachsen-Anhalt. Landesebene und Bund.'],
    sources: [
      { label: 'Landtag Sachsen-Anhalt – Wahlen', url: 'https://www.landtag.sachsen-anhalt.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung Sachsen-Anhalt', url: 'https://lpb.sachsen-anhalt.de/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  'schleswig-holstein': {
    regionLabel: 'Schleswig-Holstein – Landtagswahl (nächste: 2027)',
    notes: ['Landtag SH voraussichtlich 2027. Landesebene und Bund.'],
    sources: [
      { label: 'Landtag Schleswig-Holstein – Wahlen', url: 'https://www.landtag.ltsh.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung SH – Wahlen', url: 'https://www.schleswig-holstein.de/DE/Landesregierung/LPB/lpb_node.html', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  thueringen: {
    regionLabel: 'Thüringen – Landtagswahl (nächste: 2029)',
    notes: ['Landtag Thüringen. Landesebene und Bund.'],
    sources: [
      { label: 'Thüringer Landtag – Wahlen', url: 'https://www.thueringer-landtag.de/', kind: 'official' },
      { label: 'Landeszentrale für politische Bildung Thüringen – Wahlen', url: 'https://www.thlpd.de/', kind: 'aggregator' },
      { label: 'Wahl-O-Mat (Bund & Länder)', url: 'https://www.wahl-o-mat.de/', kind: 'aggregator' }
    ]
  },
  saarland: {
    regionLabel: 'Saarland – Landtagswahl (nächste: Frühjahr 2027)',
    notes: [
      'Die nächste Landtagswahl im Saarland ist für 2027 vorgesehen. Programmprozesse laufen (Stand 2026).'
    ],
    sources: [
      {
        label: 'Landtag Saarland – Wahlen & Bürgerbeteiligung',
        url: 'https://www.landtag-saar.de/',
        kind: 'official'
      },
      {
        label: 'Übersicht Landtagswahl Saarland 2027',
        url: 'https://vlmd.de/aktuelles/landtagswahl-saarland-2027/',
        kind: 'aggregator'
      }
    ]
  },
  // Fallback: Nutzer ohne erkennbares Bundesland (nur Bund)
  deutschland: {
    regionLabel: 'Bundesweite Informationen',
    notes: ['Geben Sie Straße, PLZ und Stadt ein, um regionale Wahlprogramme (Land/Kommune) zu sehen.'],
    sources: [
      {
        label: 'Bundeszentrale für politische Bildung – Wahlen',
        url: 'https://www.bpb.de/themen/wahlen/',
        kind: 'aggregator'
      },
      {
        label: 'Wahl-O-Mat (Bund & Länder)',
        url: 'https://www.wahl-o-mat.de/',
        kind: 'aggregator'
      }
    ]
  }
};

