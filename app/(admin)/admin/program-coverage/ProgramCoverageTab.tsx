'use client';

import { getProgramCoverage, type ProgramEntry } from '@/data/partyProgramRegistry';

type RegionKey = ProgramEntry['region'];

const REGION_LABELS: Record<RegionKey, string> = {
  bund: 'Bund',
  'baden-wuerttemberg': 'Baden-Württemberg',
  bayern: 'Bayern',
  berlin: 'Berlin',
  brandenburg: 'Brandenburg',
  bremen: 'Bremen',
  hamburg: 'Hamburg',
  hessen: 'Hessen',
  'mecklenburg-vorpommern': 'Mecklenburg-Vorpommern',
  niedersachsen: 'Niedersachsen',
  'nordrhein-westfalen': 'Nordrhein-Westfalen',
  'rheinland-pfalz': 'Rheinland-Pfalz',
  saarland: 'Saarland',
  sachsen: 'Sachsen',
  'sachsen-anhalt': 'Sachsen-Anhalt',
  'schleswig-holstein': 'Schleswig-Holstein',
  thueringen: 'Thüringen',
  'saarpfalz-kreis': 'Saarpfalz-Kreis',
  kirkel: 'Kirkel',
};

const ROWS: Array<{ region: RegionKey; year: 2025 | 2026 }> = [
  { region: 'bund', year: 2025 },
  { region: 'saarland', year: 2026 },
  { region: 'saarpfalz-kreis', year: 2026 },
  { region: 'kirkel', year: 2026 },
  { region: 'baden-wuerttemberg', year: 2026 },
  { region: 'bayern', year: 2026 },
  { region: 'berlin', year: 2026 },
  { region: 'brandenburg', year: 2026 },
  { region: 'bremen', year: 2026 },
  { region: 'hamburg', year: 2026 },
  { region: 'hessen', year: 2026 },
  { region: 'mecklenburg-vorpommern', year: 2026 },
  { region: 'niedersachsen', year: 2026 },
  { region: 'nordrhein-westfalen', year: 2026 },
  { region: 'rheinland-pfalz', year: 2026 },
  { region: 'sachsen', year: 2026 },
  { region: 'sachsen-anhalt', year: 2026 },
  { region: 'schleswig-holstein', year: 2026 },
  { region: 'thueringen', year: 2026 },
];

function statusBadge(verified: number, partial: number, missing: number) {
  if (missing === 0 && partial === 0) {
    return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">vollständig</span>;
  }
  if (verified > 0 || partial > 0) {
    return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">teilabgedeckt</span>;
  }
  return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">offen</span>;
}

export default function ProgramCoverageTab() {
  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Programm-Abdeckung 2025/2026</h2>
        <p className="mt-1 text-sm text-slate-600">
          Verfügbarkeit je Region: <strong>verified</strong>, <strong>partial</strong>, <strong>missing</strong>.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Region</th>
              <th className="px-4 py-3 font-semibold">Jahr</th>
              <th className="px-4 py-3 font-semibold">verified</th>
              <th className="px-4 py-3 font-semibold">partial</th>
              <th className="px-4 py-3 font-semibold">missing</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ region, year }) => {
              const c = getProgramCoverage(region, year);
              return (
                <tr key={`${region}-${year}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-900">{REGION_LABELS[region]}</td>
                  <td className="px-4 py-3 text-slate-700">{year}</td>
                  <td className="px-4 py-3 text-slate-700">{c.verified}</td>
                  <td className="px-4 py-3 text-slate-700">{c.partial}</td>
                  <td className="px-4 py-3 text-slate-700">{c.missing}</td>
                  <td className="px-4 py-3">{statusBadge(c.verified, c.partial, c.missing)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

