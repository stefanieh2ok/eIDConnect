import type { PastVotingResult, VotingCard, VotingData } from '@/types';

export type VotingStatsForYear = {
  total2026: number;
  /** Laufende Karten im Jahr (Frist noch nicht erreicht); abgeschlossene `vergangen` zählen nicht. */
  open2026: number;
};

/** DD.MM.JJJJ (deutsch) */
function parseGermanDayMonthYear(s: string | undefined): { y: number; m: number; d: number } | null {
  if (!s?.trim()) return null;
  const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  if (!Number.isFinite(y) || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, m: mo, d };
}

function inferYearFromRecord(raw: Record<string, unknown>, targetYear: number): number | null {
  if (typeof raw.demoVoteYear === 'number' && Number.isFinite(raw.demoVoteYear)) {
    return raw.demoVoteYear;
  }
  if (typeof raw.year === 'number' && Number.isFinite(raw.year)) {
    return raw.year;
  }
  const pw = raw.participationWindow as Record<string, unknown> | undefined;
  if (pw && typeof pw === 'object') {
    for (const k of ['start', 'end'] as const) {
      const v = pw[k];
      if (typeof v === 'string') {
        const p = parseGermanDayMonthYear(v);
        if (p) return p.y;
      }
    }
  }
  for (const key of ['date', 'startDate', 'endDate', 'deadline', 'datum'] as const) {
    const v = raw[key];
    if (typeof v === 'string') {
      const p = parseGermanDayMonthYear(v);
      if (p) return p.y;
    }
  }
  if (raw.category === 'demo-2026' || raw.type === 'beteiligung-2026') {
    return targetYear;
  }
  return null;
}

function isStillOpenByDeadline(deadline: string | undefined, now: Date): boolean {
  const p = parseGermanDayMonthYear(deadline);
  if (!p) return false;
  const end = new Date(p.y, p.m - 1, p.d, 23, 59, 59, 999);
  return now.getTime() <= end.getTime();
}

/**
 * Zählt Abstimmungs-/Beteiligungskarten (und abgeschlossene Ergebnisse) für ein Kalenderjahr.
 * Nur `VotingData`-Struktur — keine Wahlen- oder Meldungs-Listen.
 */
export function getVotingStatsForYear(
  votingData: Pick<VotingData, 'cards' | 'vergangen'> | undefined,
  year: number,
  opts?: { now?: Date },
): VotingStatsForYear {
  const now = opts?.now ?? new Date();
  const cards = votingData?.cards ?? [];
  const past = votingData?.vergangen ?? [];

  let total2026 = 0;
  let open2026 = 0;

  for (const c of cards) {
    const y = inferYearFromRecord(c as unknown as Record<string, unknown>, year);
    if (y !== year) continue;
    total2026 += 1;
    if (isStillOpenByDeadline(c.deadline, now)) {
      open2026 += 1;
    }
  }

  for (const v of past) {
    const y = inferYearFromRecord(v as unknown as Record<string, unknown>, year);
    if (y !== year) continue;
    total2026 += 1;
  }

  return { total2026, open2026 };
}
