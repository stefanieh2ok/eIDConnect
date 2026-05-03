/**
 * Demo-Abstimmungen 2026 für jede Kommune / generischen Kommune-Tab.
 * Einheitliche Struktur wie in BuergerApp votingData-Items.
 */

export type DemoVoteItem = {
  id: string;
  theme?: string;
  title: string;
  desc: string;
  deadline: string;
  yes: number;
  no: number;
  votes: number;
  points: number;
  urgent: boolean;
  claraPro: string;
  claraCon: string;
  sources: { title: string; url: string }[];
};

/** Zehn thematisch getrennte Bürgerentscheide / Beteiligungen für Demo (2026, inkl. Fristen H2). */
export function communalVotes2026ForCity(stadtName: string): DemoVoteItem[] {
  const s = stadtName.trim() || 'Kommune';
  return [
    {
      id: 'demo-k1',
      theme: 'soziales',
      title: `Kita- und Schulsozialarbeit ${s}`,
      desc: 'Ausbau Ganztags- und Sozialarbeit an Grundschulen ab Schuljahr 2026/27',
      deadline: '15.03.2026',
      yes: 78,
      no: 14,
      votes: 8420,
      points: 120,
      urgent: true,
      claraPro: 'Entlastung Familien, Chancengleichheit, frühzeitige Förderung.',
      claraCon: 'Personalkosten, Raumbedarf, Haushaltsbelastung.',
      sources: [{ title: `Stadt ${s}: Bildungsplan`, url: 'demo.local' }],
    },
    {
      id: 'demo-k2',
      theme: 'umwelt',
      title: `Klimapakt ${s} – Maßnahmenpaket 2026`,
      desc: 'Beschluss über kommunales Maßnahmenpaket (Mobilität, Grün, Energie)',
      deadline: '22.04.2026',
      yes: 71,
      no: 22,
      votes: 12100,
      points: 150,
      urgent: false,
      claraPro: 'Klimaschutz vor Ort, Fördermittel, Lebensqualität.',
      claraCon: 'Investitionen, Umsetzungsdauer, Priorisierung gegenüber anderen Projekten.',
      sources: [{ title: `Stadt ${s}: Klimakonzept`, url: 'demo.local' }],
    },
    {
      id: 'demo-k3',
      theme: 'digitalisierung',
      title: `Digitale Bürgerservices ${s}`,
      desc: 'Online-Dienste für Meldewesen, Termine und Mängelmeldung ausbauen',
      deadline: '10.05.2026',
      yes: 69,
      no: 24,
      votes: 6800,
      points: 100,
      urgent: false,
      claraPro: 'Weniger Wege, 24/7-Erreichbarkeit, moderne Verwaltung.',
      claraCon: 'IT-Sicherheit, Barrierefreiheit, Schulungsbedarf.',
      sources: [{ title: `Stadt ${s}: E-Government`, url: 'demo.local' }],
    },
    {
      id: 'demo-k4',
      theme: 'soziales',
      title: `Wohnen und Quartiersentwicklung ${s}`,
      desc: 'Förderprogramm für bezahlbares Wohnen und Nachverdichtung in Innenstadtquartieren',
      deadline: '18.06.2026',
      yes: 64,
      no: 28,
      votes: 9560,
      points: 130,
      urgent: false,
      claraPro: 'Mehr bezahlbare Wohnungen, lebendige Quartiere.',
      claraCon: 'Verdichtung, Parkplatzsituation, Eingriff in bestehende Nachbarschaft.',
      sources: [{ title: `Stadt ${s}: Wohnungsbau`, url: 'demo.local' }],
    },
    {
      id: 'demo-k5',
      theme: 'wirtschaft',
      title: `Lokale Wirtschaft & Märkte ${s}`,
      desc: 'Jahresbudget für Wochenmärkte, Innenstadtförderung und regionale Lieferketten 2026',
      deadline: '30.06.2026',
      yes: 81,
      no: 12,
      votes: 5400,
      points: 110,
      urgent: false,
      claraPro: 'Stärkung Einzelhandel, regionale Wertschöpfung.',
      claraCon: 'Haushaltsmittel, mögliche Konkurrenz zu Großflächen am Stadtrand.',
      sources: [{ title: `Stadt ${s}: Wirtschaftsförderung`, url: 'demo.local' }],
    },
    {
      id: 'demo-k6',
      theme: 'umwelt',
      title: `Hitzeschutz & Grünflächen ${s}`,
      desc: 'Maßnahmenpaket Schattenplätze, Bäume und Entsiegelung in Schul- und Spielwegen',
      deadline: '20.07.2026',
      yes: 74,
      no: 18,
      votes: 6100,
      points: 125,
      urgent: true,
      claraPro: 'Gesundheitsschutz, weniger Asphalt, mehr Aufenthaltsqualität.',
      claraCon: 'Pflegekosten, Bewässerung, Priorisierung zwischen Quartieren.',
      sources: [{ title: `Stadt ${s}: Klimaanpassung`, url: 'demo.local' }],
    },
    {
      id: 'demo-k7',
      theme: 'digitalisierung',
      title: `Open-Data-Portal ${s}`,
      desc: 'Veröffentlichung von Haushalts- und Vergabedaten maschinenlesbar',
      deadline: '15.08.2026',
      yes: 68,
      no: 22,
      votes: 4900,
      points: 105,
      urgent: false,
      claraPro: 'Transparenz, Forschung, Kontrolle durch Bürger:innen.',
      claraCon: 'Anonymisierung, IT-Sicherheit, redaktioneller Aufwand.',
      sources: [{ title: `Stadt ${s}: Transparenz`, url: 'demo.local' }],
    },
    {
      id: 'demo-k8',
      theme: 'soziales',
      title: `Teilhabe barrierefrei ${s}`,
      desc: 'Sanierung Rathauszugang, Lift und Service-Schalter nach BITV 2.0',
      deadline: '30.09.2026',
      yes: 77,
      no: 15,
      votes: 7200,
      points: 115,
      urgent: false,
      claraPro: 'Zugänglichkeit für alle, gesetzliche Vorgaben erfüllen.',
      claraCon: 'Baukosten, Ersatzräume während der Bauphase.',
      sources: [{ title: `Stadt ${s}: Teilhabe`, url: 'demo.local' }],
    },
    {
      id: 'demo-k9',
      theme: 'sicherheit',
      title: `Bürgeralarm & Warn-App ${s}`,
      desc: 'Opt-in für Gefahren- und Unwetterwarnungen aufs Mobiltelefon',
      deadline: '08.11.2026',
      yes: 66,
      no: 26,
      votes: 5800,
      points: 100,
      urgent: false,
      claraPro: 'Schnellere Information, bessere Koordination mit Rettungsdienst.',
      claraCon: 'Datenschutz, falsche Alarme, Akzeptanz bei älteren Bürger:innen.',
      sources: [{ title: `Stadt ${s}: Sicherheit`, url: 'demo.local' }],
    },
    {
      id: 'demo-k10',
      theme: 'finanzen',
      title: `Haushalt 2027 – Bürgerhaushalt ${s}`,
      desc: 'Online-Abstimmung über Projektvorschläge aus dem Bürgerhaushalt (Beispiel)',
      deadline: '18.12.2026',
      yes: 72,
      no: 20,
      votes: 6400,
      points: 120,
      urgent: false,
      claraPro: 'Direkte Mitwirkung, sichtbare Projekte, Vertrauen in die Kommune.',
      claraCon: 'Rechtliche Zulässigkeit, Finanzierbarkeit, Erwartungsmanagement.',
      sources: [{ title: `Stadt ${s}: Bürgerhaushalt`, url: 'demo.local' }],
    },
  ];
}

/** Ergänzt vorhandene Kommune-Items auf mindestens minCount Einträge (ohne Duplikate nach title). */
export function mergeCommunalVotes2026(
  existing: DemoVoteItem[],
  stadtName: string,
  minCount = 5
): DemoVoteItem[] {
  const have = [...(existing || [])];
  if (have.length >= minCount) return have;
  const extra = communalVotes2026ForCity(stadtName);
  const titles = new Set(have.map((h) => h.title.toLowerCase()));
  for (const e of extra) {
    if (have.length >= minCount) break;
    if (!titles.has(e.title.toLowerCase())) {
      have.push(e);
      titles.add(e.title.toLowerCase());
    }
  }
  return have;
}

/** Statusangebote für eine beliebige Kommune (Demo, regional formuliert). */
export function regionalPraemienForCity(cityName: string) {
  const c = cityName.trim() || 'Kommune';
  const norm = c.toLowerCase();

  // Kirkel (Demo-Kernkommune): regionaler Auszug — gleiche Quelle wie Beteiligungsstatus.
  if (norm === 'kirkel' || norm.includes('kirkel')) {
    return [
      {
        id: 'rk1',
        name: 'Naturfreibad Kirkel – Saison-Eintritt reduziert',
        points: 2800,
        emoji: '🏊',
        description: 'Freibad & Naturbad vor Ort',
      },
      {
        id: 'rk2',
        name: 'Deutsche Bahn – Ticketzuschuss Regional (z. B. Saarbrücken)',
        points: 7500,
        emoji: '🚆',
        description: 'Zuschuss zum Zugticket (Beispielmodell)',
      },
      {
        id: 'rk3',
        name: 'CineStar Saarbrücken – Kinogutschein 2 Personen',
        points: 4200,
        emoji: '🎬',
        description: 'Kinogutschein für CineStar Saarbrücken',
      },
      {
        id: 'rk4',
        name: 'Museum regional – Familien-Tageskarte',
        points: 3600,
        emoji: '🖼️',
        description: 'Kultur & Museum in der Umgebung',
      },
      {
        id: 'rk5',
        name: 'Kirkel – Bücherei / Medien: Jahresausleihe',
        points: 2200,
        emoji: '📚',
        description: 'Kommunales Angebot',
      },
      {
        id: 'rk6',
        name: 'ÖPNV Saarland – Monatsbonus / Nahverkehr',
        points: 6200,
        emoji: '🚌',
        description: 'Bus & Bahn in der Region',
      },
      {
        id: 'rk7',
        name: 'Kirkel – Lokaler Einkauf & Gastronomie: Gutschein 15 €',
        points: 4500,
        emoji: '🛒',
        description: 'Partner im Ort und Umland',
      },
      {
        id: 'rk8',
        name: 'Vereine Kirkel – Zuschuss Mitgliedsbeitrag',
        points: 3800,
        emoji: '🤝',
        description: 'Sport, Kultur, Soziales',
      },
    ];
  }
  return [
    { id: 'rp1', name: `Stadtbibliothek / Bücherei ${c} – Jahreskarte`, points: 2500, emoji: '📚', description: 'Kostenlose Jahreskarte' },
    { id: 'rp2', name: `Laden- & Gastronomie-Gutschein ${c} 15€`, points: 4000, emoji: '🛒', description: 'Lokale Partner' },
    { id: 'rp3', name: `Sport- oder Hallenbad ${c} – Mehrfachkarte`, points: 3500, emoji: '🏊', description: 'Kostenlose Eintritte' },
    { id: 'rp4', name: `Museum ${c} – Familien-Tageskarte`, points: 3200, emoji: '🖼️', description: 'Eintrittsgutscheine' },
    { id: 'rp5', name: `VHS / Weiterbildung ${c} – Kursgutschein`, points: 5000, emoji: '🎓', description: 'Ein Kurs nach Wahl' },
    { id: 'rp6', name: `Stadtfest / Markt ${c} – VIP-Bereich`, points: 3000, emoji: '🎉', description: 'Exklusiver Zugang' },
    { id: 'rp7', name: `ÖPNV-Partner-Region ${c} – Monatsticket`, points: 7000, emoji: '🚌', description: 'ÖPNV im Nahverkehrsverbund' },
  ];
}
