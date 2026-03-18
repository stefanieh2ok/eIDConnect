export interface UserPreferences {
  umwelt: number;
  finanzen: number;
  bildung: number;
  digital: number;
  soziales: number;
  sicherheit: number;
}

export interface KIAnalysis {
  pros: Array<{
    text: string;
    source: string;
    weight: number;
  }>;
  cons: Array<{
    text: string;
    source: string;
    weight: number;
  }>;
  claraEinschätzung: string;
  financialImpact: string;
  environmentalImpact: string;
  quellen?: string[];
}

export interface RegionalResult {
  land: string;
  yes: number;
  no: number;
  trend?: string;
}

export interface VotingCard {
  id: string;
  nummer?: string;
  title: string;
  deadline: string;
  emoji: string;
  category: string;
  description: string;
  quickFacts: string[];
  yes: number;
  no: number;
  abstain: number;
  votes: number;
  points: number;
  claraMatch: number;
  urgent?: boolean;
  regionalResults?: RegionalResult[];
  kiAnalysis: KIAnalysis;
}

export interface PastVotingResult {
  id: string;
  nummer: string;
  title: string;
  datum: string;
  ergebnis: 'Angenommen' | 'Abgelehnt';
  yes: number;
  no: number;
  abstain: number;
  votes: number;
  regionalResults?: RegionalResult[];
}

export interface VotingData {
  canVote: boolean;
  cards: VotingCard[];
  vergangen?: PastVotingResult[];
}

export interface SocialMedia {
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  mastodon?: string;
  youtube?: string;
}

export interface PolitikerZitat {
  text: string;
  quelle: string;
  datum: string;
  url?: string;
}

export interface Candidate {
  name: string;
  partei: string;
  emoji?: string;
  alter: number;
  beruf: string;
  positionen: string[];
  claraInfo?: string;
  /** Quellenverweise für claraInfo im Perplexity-Stil [1], [2] */
  quellen?: string[];
  /**
   * Nur freiverfügbare Bilder (Wikimedia Commons CC-Lizenz, offizielle Pressebilder).
   * Keine Bilder von LinkedIn, Xing, Partei-Webseiten ohne Freigabe.
   */
  image?: string;
  /** Bildquelle + Lizenz */
  quelle?: string;
  quelleUrl?: string;
  confirmedByCandidate?: boolean;
  /** Offizielle Social-Media-Accounts des Politikers */
  socialMedia?: SocialMedia;
  wikipediaUrl?: string;
  parlamentUrl?: string;
  abgeordnetenwatchUrl?: string;
  /** Zitate nur mit Quellennachweis renommierter Medien */
  zitate?: PolitikerZitat[];
  /** Datum der letzten Verifizierung */
  standDatum?: string;
}

export interface Election {
  id: string;
  name: string;
  date: string;
  type: 'Bund' | 'Land' | 'Kommune';
  description: string;
  wahlsystem: string;
  kandidaten?: Candidate[];
  parteien?: string[];
}

export interface ElectionResult {
  name: string;
  date: string;
  ergebnis: 'Angenommen' | 'Abgelehnt';
  ja: number;
  nein: number;
  enthaltung: number;
  stimmen: number;
}

export interface ParteiErgebnis {
  partei: string;
  prozent: number;
  sitze?: number;
}

export interface WahlErgebnis {
  wahlbeteiligung: number;
  parteien: ParteiErgebnis[];
  koalition?: string;
  status: 'abgeschlossen' | 'vorläufig';
}

export interface Partei {
  name: string;
  programm: string;
}

export interface Wahl {
  id: string;
  name: string;
  datum: string;
  wahlkreis: string;
  level?: 'bund' | 'land' | 'kreis' | 'kommune';
  location?: string;
  kandidaten: Candidate[];
  parteien: Partei[];
  ergebnis?: WahlErgebnis;
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  date: string;
  snippet: string;
  url: string;
  related: string;
}

export interface CalendarEvent {
  type: 'bundesweit' | 'saarland' | 'saarpfalz' | 'kirkel';
  title: string;
  cardId: string;
  location: string;
}

export interface VoteResult {
  card: VotingCard;
  vote: 'DAFÜR' | 'DAGEGEN' | 'ENTHALTEN';
  points: number;
}

export interface LeaderboardItem {
  rank: number;
  name: string;
  participation: number;
  medal?: 'gold' | 'silver' | 'bronze';
  isUser?: boolean;
}

export type Location = 'bundesweit' | 'saarland' | 'kirkel';
export type Section = 'live' | 'leaderboard' | 'wahlen' | 'news' | 'kalender';
export type AbstimmungTab = 'aktuell' | 'ergebnisse';
export type Anrede = 'sie' | 'du';
export type VoteType = 'for' | 'against' | 'abstain';
