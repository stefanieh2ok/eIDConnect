import { getVotingStatsForYear } from '@/lib/getVotingStatsForYear';
import { VOTING_DATA } from '@/data/constants';
import type { PastVotingResult, VotingCard, VotingData } from '@/types';

function minimalCard(partial: Partial<VotingCard> & Pick<VotingCard, 'id' | 'title' | 'deadline'>): VotingCard {
  return {
    ...partial,
    id: partial.id,
    title: partial.title,
    deadline: partial.deadline,
    emoji: '🗳️',
    category: partial.category ?? 'Test',
    description: partial.description ?? 'd',
    quickFacts: [],
    yes: 50,
    no: 30,
    abstain: 20,
    votes: 1000,
    points: 0,
    claraMatch: 70,
    kiAnalysis: {
      pros: [],
      cons: [],
      claraEinschätzung: '',
      financialImpact: '',
      environmentalImpact: '',
    },
  };
}

describe('getVotingStatsForYear', () => {
  const refJan2026 = new Date(2026, 0, 15, 12, 0, 0);

  it('zählt Karten mit Frist in 2026 und offene nach Deadline', () => {
    const data: Pick<VotingData, 'cards' | 'vergangen'> = {
      cards: [
        minimalCard({ id: 'a', title: 'A', deadline: '31.03.2026' }),
        minimalCard({ id: 'b', title: 'B', deadline: '01.01.2025' }),
        minimalCard({ id: 'c', title: 'C', deadline: '10.01.2026' }),
      ],
      vergangen: [],
    };
    const s = getVotingStatsForYear(data, 2026, { now: refJan2026 });
    expect(s.total2026).toBe(2);
    // 10.01.2026 liegt vor dem Referenzdatum, 31.03.2026 danach
    expect(s.open2026).toBe(1);
  });

  it('zählt abgeschlossene Fristen in 2026 nicht als offen', () => {
    const data: Pick<VotingData, 'cards' | 'vergangen'> = {
      cards: [minimalCard({ id: 'a', title: 'A', deadline: '05.01.2026' })],
      vergangen: [],
    };
    const s = getVotingStatsForYear(data, 2026, { now: refJan2026 });
    expect(s.total2026).toBe(1);
    expect(s.open2026).toBe(0);
  });

  it('zählt vergangen mit Datum in 2026 zur Gesamtzahl', () => {
    const past: PastVotingResult = {
      id: 'p1',
      nummer: 'X-1',
      title: 'Alt',
      datum: '20.06.2026',
      ergebnis: 'Angenommen',
      yes: 60,
      no: 30,
      abstain: 10,
      votes: 100,
    };
    const data: Pick<VotingData, 'cards' | 'vergangen'> = {
      cards: [minimalCard({ id: 'a', title: 'A', deadline: '31.03.2026' })],
      vergangen: [past],
    };
    const s = getVotingStatsForYear(data, 2026, { now: refJan2026 });
    expect(s.total2026).toBe(2);
    expect(s.open2026).toBe(1);
  });

  it('liefert 0 ohne passende Daten', () => {
    expect(getVotingStatsForYear(undefined, 2026, { now: refJan2026 })).toEqual({
      total2026: 0,
      open2026: 0,
    });
  });

  it('Bund-Demo-Daten enthalten mehrere Abstimmungen mit Bezug zu 2026', () => {
    const s = getVotingStatsForYear(VOTING_DATA.bundesweit, 2026, { now: refJan2026 });
    expect(s.total2026).toBeGreaterThanOrEqual(3);
  });
});
