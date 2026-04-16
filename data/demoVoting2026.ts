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

/** Fünf thematisch getrennte Bürgerentscheide / Beteiligungen für Demo (2026). */
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

/** Prämien-Liste für eine beliebige Kommune (Demo, regional formuliert). */
export function regionalPraemienForCity(cityName: string) {
  const c = cityName.trim() || 'Kommune';
  const norm = c.toLowerCase();

  // Kirkel (Demo-Kernkommune): lokal plausibel, ohne konkrete Partner-Namen zu behaupten.
  if (norm === 'kirkel' || norm.includes('kirkel')) {
    return [
      {
        id: 'rk1',
        name: 'Kirkel – Bücherei/Jugendangebot: Jahreskarte',
        points: 2200,
        emoji: '📚',
        description: 'Kommunales Angebot (Demo)',
      },
      {
        id: 'rk2',
        name: 'Kirkel – Schwimmbad/Sport: 10er-Karte',
        points: 3200,
        emoji: '🏊',
        description: 'Freizeitangebot vor Ort (Demo)',
      },
      {
        id: 'rk3',
        name: 'Kirkel – Vereinsleben: Zuschuss für Mitgliedsbeitrag',
        points: 3800,
        emoji: '🤝',
        description: 'Sport/Kultur/Soziales (Demo)',
      },
      {
        id: 'rk4',
        name: 'Kirkel & Saarpfalz-Kreis – ÖPNV: Monatsbonus',
        points: 6200,
        emoji: '🚌',
        description: 'Nahverkehr in der Region (Demo)',
      },
      {
        id: 'rk5',
        name: 'Kirkel – Lokaler Einkauf: Gutschein 10€',
        points: 4200,
        emoji: '🛒',
        description: 'Einlösbar bei lokalen Partnern (Demo)',
      },
      {
        id: 'rk6',
        name: 'Kirkel – Natur & Klima: Baum-/Blühpatenschaft',
        points: 2600,
        emoji: '🌿',
        description: 'Gemeindliches Umweltprojekt (Demo)',
      },
      {
        id: 'rk7',
        name: 'Kirkel – Bürgerabend: Einladung + Getränk',
        points: 1800,
        emoji: '🏛️',
        description: 'Dialogformat vor Ort (Demo)',
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
