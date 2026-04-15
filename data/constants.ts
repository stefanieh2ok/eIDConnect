/**
 * App-Konstanten: Wahlen, Abstimmungen, Themen, Rangliste, News
 */
import { WAHLEN_DEUTSCHLAND } from './wahlen-deutschland';
import { communalVotes2026ForCity } from './demoVoting2026';
import type { VotingCard, VotingData, LeaderboardItem, NewsItem } from '@/types';

export const WAHLEN_DATA = WAHLEN_DEUTSCHLAND;

export const THEME_NAMES: Record<string, string> = {
  umwelt: 'Umwelt & Klima',
  finanzen: 'Finanzen & Steuern',
  bildung: 'Bildung',
  digital: 'Digitalisierung',
  soziales: 'Soziales',
  sicherheit: 'Sicherheit',
};

function demoItemToVotingCard(item: {
  id: string;
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
  theme?: string;
}): VotingCard {
  const abstain = Math.round(item.votes * 0.08);
  return {
    id: item.id,
    title: item.title,
    deadline: item.deadline,
    emoji: '🗳️',
    category: item.theme || 'Bürgerbeteiligung',
    description: item.desc,
    quickFacts: [
      `${item.yes}% Dafür`,
      `${item.no}% Dagegen`,
      `${item.votes.toLocaleString('de-DE')} Stimmen`,
    ],
    yes: item.yes,
    no: item.no,
    abstain,
    votes: item.votes,
    points: item.points,
    claraMatch: 72,
    urgent: item.urgent,
    kiAnalysis: {
      pros: [{ text: item.claraPro, source: 'Clara', weight: 1 }],
      cons: [{ text: item.claraCon, source: 'Clara', weight: 1 }],
      claraEinschätzung: 'Abwägung zwischen Nutzen und Aufwand.',
      financialImpact: 'Moderate Haushaltsauswirkungen.',
      environmentalImpact: 'Je nach Thema relevant.',
    },
  };
}

const kommunalCards = communalVotes2026ForCity('Kirkel').map(demoItemToVotingCard);
const bundCards: VotingCard[] = [
  demoItemToVotingCard({
    id: 'bund-1',
    title: 'Bundesweite Klima-Investitionen 2026',
    desc: 'Zusätzliche Mittel für erneuerbare Energien und Gebäudesanierung',
    deadline: '31.03.2026',
    yes: 68,
    no: 22,
    votes: 1240000,
    points: 500,
    urgent: true,
    claraPro: 'Klimaschutz, Arbeitsplätze, Unabhängigkeit.',
    claraCon: 'Haushaltsbelastung, Verteilung.',
    theme: 'Umwelt',
  }),
  demoItemToVotingCard({
    id: 'bund-2',
    title: 'Digitalisierung der Verwaltung',
    desc: 'Bundesprogramm für E-Government und Online-Dienste',
    deadline: '15.05.2026',
    yes: 74,
    no: 18,
    votes: 980000,
    points: 400,
    urgent: false,
    claraPro: 'Effizienz, Bürgernähe.',
    claraCon: 'Datenschutz, Umsetzungsrisiken.',
    theme: 'Digitalisierung',
  }),
];

const landCards: VotingCard[] = [
  demoItemToVotingCard({
    id: 'land-1',
    title: 'Landesweite Bildungsreform',
    desc: 'Mehr Mittel für Schulen und Kitas',
    deadline: '20.04.2026',
    yes: 71,
    no: 21,
    votes: 420000,
    points: 250,
    urgent: false,
    claraPro: 'Chancengleichheit, Qualität.',
    claraCon: 'Kosten, Personal.',
    theme: 'Bildung',
  }),
];

export const VOTING_DATA: Record<string, VotingData> = {
  deutschland: { canVote: true, cards: bundCards },
  bundesweit: { canVote: true, cards: bundCards },
  saarland: { canVote: true, cards: landCards },
  kirkel: { canVote: true, cards: kommunalCards },
  saarpfalz: { canVote: true, cards: kommunalCards },
};

export const LEADERBOARD_DATA: LeaderboardItem[] = [
  { rank: 1, name: 'Baden-Württemberg', participation: 94, medal: 'gold' },
  { rank: 2, name: 'Bayern', participation: 91, medal: 'silver' },
  { rank: 3, name: 'Hessen', participation: 88, medal: 'bronze' },
  { rank: 4, name: 'Nordrhein-Westfalen', participation: 85 },
  { rank: 5, name: 'Niedersachsen', participation: 82 },
  { rank: 6, name: 'Sie (Demo)', participation: 78, isUser: true },
];

export const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    title: 'Bürgerbeteiligung nimmt zu',
    source: 'Tagesschau',
    date: '24.01.2026',
    snippet: 'Die digitale Beteiligung an kommunalen Entscheidungen steigt bundesweit.',
    url: 'https://example.com/news/1',
    related: 'Abstimmungen',
  },
  {
    id: 2,
    title: 'Neue eID-Funktionen',
    source: 'Bundesregierung',
    date: '20.01.2026',
    snippet: 'Erweiterte Nutzung des Personalausweises für Online-Dienste.',
    url: 'https://example.com/news/2',
    related: 'eID',
  },
  {
    id: 3,
    title: 'Kommunalwahlen 2026',
    source: 'Kommunalverband',
    date: '15.01.2026',
    snippet: 'Überblick über anstehende Wahlen in den Kreisen und Gemeinden.',
    url: 'https://example.com/news/3',
    related: 'Wahlen',
  },
];
