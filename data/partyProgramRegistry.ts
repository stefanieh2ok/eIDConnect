export type ProgramStatus = 'verified' | 'partial' | 'missing';

export type ProgramEntry = {
  region:
    | 'bund'
    | 'baden-wuerttemberg'
    | 'bayern'
    | 'berlin'
    | 'brandenburg'
    | 'bremen'
    | 'hamburg'
    | 'hessen'
    | 'mecklenburg-vorpommern'
    | 'niedersachsen'
    | 'nordrhein-westfalen'
    | 'rheinland-pfalz'
    | 'saarland'
    | 'sachsen'
    | 'sachsen-anhalt'
    | 'schleswig-holstein'
    | 'thueringen'
    | 'saarpfalz-kreis'
    | 'kirkel';
  year: 2025 | 2026;
  party: string;
  status: ProgramStatus;
  /** Partei- oder Listenprogramm */
  scope: 'party-program' | 'list-program';
  sourceLabel?: string;
  sourceUrl?: string;
  note?: string;
};

/**
 * Verfügbarkeit offizieller Programmquellen (Fokus: Bund/Saarland/Saarpfalz/Kirkel).
 * Stand: März 2026
 */
const BUND_PARTIES_2025 = ['SPD', 'CDU', 'GRÜNE', 'FDP', 'AfD', 'DIE LINKE', 'BSW'] as const;
const LAND_PARTIES_2026 = ['SPD', 'CDU', 'GRÜNE', 'FDP', 'AfD', 'DIE LINKE', 'BSW'] as const;
const BUNDESLAENDER = [
  'baden-wuerttemberg',
  'bayern',
  'berlin',
  'brandenburg',
  'bremen',
  'hamburg',
  'hessen',
  'mecklenburg-vorpommern',
  'niedersachsen',
  'nordrhein-westfalen',
  'rheinland-pfalz',
  'saarland',
  'sachsen',
  'sachsen-anhalt',
  'schleswig-holstein',
  'thueringen',
] as const;

const LOCAL_PARTIES_2026 = ['CDU', 'SPD', 'GRÜNE', 'AfD', 'FDP', 'DIE LINKE', 'FWG', 'FAMILIE'] as const;

const autoMissingEntries: ProgramEntry[] = [
  ...BUND_PARTIES_2025.map((party) => ({
    region: 'bund' as const,
    year: 2025 as const,
    party,
    status: 'missing' as const,
    scope: 'party-program' as const,
    note: 'Noch keine verifizierte Quelle in Registry eingetragen.',
  })),
  ...BUNDESLAENDER.flatMap((region) =>
    LAND_PARTIES_2026.map((party) => ({
      region,
      year: 2026 as const,
      party,
      status: 'missing' as const,
      scope: 'party-program' as const,
      note: 'Noch keine verifizierte Landesquelle in Registry eingetragen.',
    })),
  ),
  ...LOCAL_PARTIES_2026.map((party) => ({
    region: 'saarpfalz-kreis' as const,
    year: 2026 as const,
    party,
    status: 'missing' as const,
    scope: 'list-program' as const,
    note: 'Noch keine verifizierte Kreisquelle in Registry eingetragen.',
  })),
  ...LOCAL_PARTIES_2026.map((party) => ({
    region: 'kirkel' as const,
    year: 2026 as const,
    party,
    status: 'missing' as const,
    scope: 'list-program' as const,
    note: 'Noch keine verifizierte Kommunalquelle in Registry eingetragen.',
  })),
];

const overrides: ProgramEntry[] = [
  // Bund 2025
  { region: 'bund', year: 2025, party: 'SPD', status: 'verified', scope: 'party-program', sourceLabel: 'SPD-Bundestagswahlprogramm 2025', sourceUrl: 'https://www.spd.de/' },
  { region: 'bund', year: 2025, party: 'CDU', status: 'verified', scope: 'party-program', sourceLabel: 'CDU/CSU-Bundestagswahlprogramm 2025', sourceUrl: 'https://www.cdu.de/' },
  { region: 'bund', year: 2025, party: 'GRÜNE', status: 'verified', scope: 'party-program', sourceLabel: 'BÜNDNIS 90/DIE GRÜNEN Wahlprogramm 2025', sourceUrl: 'https://www.gruene.de/' },
  { region: 'bund', year: 2025, party: 'FDP', status: 'verified', scope: 'party-program', sourceLabel: 'FDP-Bundestagswahlprogramm 2025', sourceUrl: 'https://www.fdp.de/' },
  { region: 'bund', year: 2025, party: 'AfD', status: 'verified', scope: 'party-program', sourceLabel: 'AfD-Bundestagswahlprogramm 2025', sourceUrl: 'https://www.afd.de/' },
  { region: 'bund', year: 2025, party: 'DIE LINKE', status: 'verified', scope: 'party-program', sourceLabel: 'DIE LINKE Bundestagswahlprogramm 2025', sourceUrl: 'https://www.die-linke.de/' },
  { region: 'bund', year: 2025, party: 'BSW', status: 'verified', scope: 'party-program', sourceLabel: 'BSW Bundestagswahlprogramm 2025', sourceUrl: 'https://bsw-vg.de/' },

  // Saarland 2026 (Prozessstand)
  { region: 'saarland', year: 2026, party: 'SPD', status: 'partial', scope: 'party-program', sourceLabel: 'SPD Saarland', sourceUrl: 'https://www.spd-saar.de/', note: 'Landtagsprogramm 2027 in Arbeit.' },
  { region: 'saarland', year: 2026, party: 'CDU', status: 'partial', scope: 'party-program', sourceLabel: 'CDU Saar', sourceUrl: 'https://www.cdu-saar.de/', note: 'Landtagsprogramm 2027 in Arbeit.' },
  { region: 'saarland', year: 2026, party: 'GRÜNE', status: 'partial', scope: 'party-program', sourceLabel: 'GRÜNE Saar', sourceUrl: 'https://gruene-saar.de/', note: 'Landtagsprogramm 2027 in Arbeit.' },
  { region: 'saarland', year: 2026, party: 'FDP', status: 'partial', scope: 'party-program', sourceLabel: 'FDP Saar', sourceUrl: 'https://www.fdp-saar.de/', note: 'Landtagsprogramm 2027 in Arbeit.' },
  { region: 'saarland', year: 2026, party: 'AfD', status: 'partial', scope: 'party-program', sourceLabel: 'AfD Saarland', sourceUrl: 'https://afd-saarland.de/', note: 'Landtagsprogramm 2027 in Arbeit.' },

  // Saarpfalz-Kreis 2026
  { region: 'saarpfalz-kreis', year: 2026, party: 'CDU', status: 'partial', scope: 'list-program', sourceLabel: 'Kreistagswahl Saarpfalz 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/KTW/ergebnisse_kreis_45.html' },
  { region: 'saarpfalz-kreis', year: 2026, party: 'SPD', status: 'partial', scope: 'list-program', sourceLabel: 'Kreistagswahl Saarpfalz 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/KTW/ergebnisse_kreis_45.html' },
  { region: 'saarpfalz-kreis', year: 2026, party: 'AfD', status: 'partial', scope: 'list-program', sourceLabel: 'Kreistagswahl Saarpfalz 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/KTW/ergebnisse_kreis_45.html' },
  { region: 'saarpfalz-kreis', year: 2026, party: 'GRÜNE', status: 'partial', scope: 'list-program', sourceLabel: 'Kreistagswahl Saarpfalz 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/KTW/ergebnisse_kreis_45.html' },
  { region: 'saarpfalz-kreis', year: 2026, party: 'FDP', status: 'partial', scope: 'list-program', sourceLabel: 'Kreistagswahl Saarpfalz 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/KTW/ergebnisse_kreis_45.html' },
  { region: 'saarpfalz-kreis', year: 2026, party: 'FWG', status: 'partial', scope: 'list-program', sourceLabel: 'Kreistagswahl Saarpfalz 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/KTW/ergebnisse_kreis_45.html' },
  { region: 'saarpfalz-kreis', year: 2026, party: 'FAMILIE', status: 'partial', scope: 'list-program', sourceLabel: 'Kreistagswahl Saarpfalz 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/KTW/ergebnisse_kreis_45.html' },
  { region: 'saarpfalz-kreis', year: 2026, party: 'DIE LINKE', status: 'partial', scope: 'list-program', sourceLabel: 'Kreistagswahl Saarpfalz 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/KTW/ergebnisse_kreis_45.html' },

  // Kirkel 2026
  { region: 'kirkel', year: 2026, party: 'CDU', status: 'partial', scope: 'list-program', sourceLabel: 'Gemeinderatswahl Kirkel 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/GRW/ergebnisse_gemeinde_45115.html' },
  { region: 'kirkel', year: 2026, party: 'SPD', status: 'partial', scope: 'list-program', sourceLabel: 'Gemeinderatswahl Kirkel 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/GRW/ergebnisse_gemeinde_45115.html' },
  { region: 'kirkel', year: 2026, party: 'FDP', status: 'partial', scope: 'list-program', sourceLabel: 'Gemeinderatswahl Kirkel 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/GRW/ergebnisse_gemeinde_45115.html' },
  { region: 'kirkel', year: 2026, party: 'GRÜNE', status: 'partial', scope: 'list-program', sourceLabel: 'Gemeinderatswahl Kirkel 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/GRW/ergebnisse_gemeinde_45115.html' },
  { region: 'kirkel', year: 2026, party: 'DIE LINKE', status: 'partial', scope: 'list-program', sourceLabel: 'Gemeinderatswahl Kirkel 2024 (amtliches Ergebnis)', sourceUrl: 'https://wahlergebnis.saarland.de/GRW/ergebnisse_gemeinde_45115.html' },
];

const keyOf = (entry: Pick<ProgramEntry, 'region' | 'year' | 'party'>) => `${entry.region}::${entry.year}::${normalizeParty(entry.party)}`;

const merged = new Map<string, ProgramEntry>();
for (const row of autoMissingEntries) merged.set(keyOf(row), row);
for (const row of overrides) merged.set(keyOf(row), row);

export const PARTY_PROGRAM_REGISTRY: ProgramEntry[] = Array.from(merged.values());

function normalizeParty(party: string): string {
  const p = party.trim().toUpperCase();
  if (p === 'DIE LINKE' || p === 'LINKE') return 'DIE LINKE';
  if (p === 'CDU/CSU') return 'CDU';
  if (p === 'CSU') return 'CDU';
  if (p === 'GRUENE' || p === 'GRÜNEN' || p === 'BÜNDNIS 90/DIE GRÜNEN') return 'GRÜNE';
  return p;
}

export function getProgramEntry(region: ProgramEntry['region'], year: ProgramEntry['year'], party: string): ProgramEntry | null {
  const normalized = normalizeParty(party);
  return PARTY_PROGRAM_REGISTRY.find((entry) => entry.region === region && entry.year === year && normalizeParty(entry.party) === normalized) ?? null;
}

export function getProgramCoverage(region: ProgramEntry['region'], year: ProgramEntry['year']) {
  const rows = PARTY_PROGRAM_REGISTRY.filter((entry) => entry.region === region && entry.year === year);
  const total = rows.length;
  const verified = rows.filter((r) => r.status === 'verified').length;
  const partial = rows.filter((r) => r.status === 'partial').length;
  const missing = rows.filter((r) => r.status === 'missing').length;
  return { total, verified, partial, missing, rows };
}

