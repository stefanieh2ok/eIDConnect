'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  ReactNode,
} from 'react';
import {
  UserPreferences,
  Location,
  Section,
  Anrede,
  VoteResult,
  VoteType,
  RegionResolution,
  AdministrativeScope,
  AbstimmungTab,
} from '@/types';
import {
  resolveRegionFromPlzCity,
  defaultAdministrativeScope,
  locationForAdministrativeScope,
} from '@/lib/resolveRegionFromAddress';
import { ClaraVoiceProvider } from '@/components/Clara/ClaraVoiceContext';
import { DEMO_POINTS_PER_MELDUNG, DEMO_POINTS_PER_WAHL } from '@/data/constants';

export type RegistrationResidence = { plz: string; city: string };

const VOTED_ELECTIONS_KEY = 'eidconnect_voted_elections';
const ANREDE_KEY = 'eidconnect_anrede';
const CONSENT_CLARA_PERSONALIZATION_KEY = 'eidconnect_consent_clara_personalization';
const CONSENT_PRAEMIEN_KEY = 'eidconnect_consent_praemien';
const CONSENT_PARTICIPATION_KEY = 'eidconnect_consent_participation';
const PARTICIPATION_DATA_KEY = 'eidconnect_participation_data';
/** Persistenter Demo-Zähler für den Bereich Beteiligungsstatus (intern, nicht als Motivationsanzeige). */
const DEMO_POINTS_TOTAL_KEY = 'eidconnect_demo_points_total';

function readParticipationSnapshotFromStorage(): {
  points: number;
  votes: number;
  elections: number;
  byLevel: AppState['participationByLevel'];
} {
  const empty = { bund: 0, land: 0, kreis: 0, kommune: 0 };
  if (typeof window === 'undefined') {
    return { points: 0, votes: 0, elections: 0, byLevel: empty };
  }
  try {
    const demoRaw = localStorage.getItem(DEMO_POINTS_TOTAL_KEY);
    const demoPts = demoRaw != null ? parseInt(demoRaw, 10) : NaN;
    const safeDemo = Number.isFinite(demoPts) && demoPts >= 0 ? demoPts : 0;

    type LegacyBlob = {
      points?: number;
      votes?: number;
      elections?: number;
      byLevel?: AppState['participationByLevel'];
    };
    let legacy: LegacyBlob | null = null;
    const data = localStorage.getItem(PARTICIPATION_DATA_KEY);
    if (data) {
      try {
        legacy = JSON.parse(data) as LegacyBlob;
      } catch {
        legacy = null;
      }
    }
    const legacyPts = legacy && typeof legacy.points === 'number' ? legacy.points : 0;
    const points = Math.max(safeDemo, legacyPts);

    return {
      points,
      votes: legacy && typeof legacy.votes === 'number' ? legacy.votes : 0,
      elections: legacy && typeof legacy.elections === 'number' ? legacy.elections : 0,
      byLevel:
        legacy?.byLevel &&
        typeof legacy.byLevel.bund === 'number' &&
        typeof legacy.byLevel.land === 'number' &&
        typeof legacy.byLevel.kreis === 'number' &&
        typeof legacy.byLevel.kommune === 'number'
          ? { ...legacy.byLevel }
          : empty,
    };
  } catch {
    return { points: 0, votes: 0, elections: 0, byLevel: empty };
  }
}

function loadVotedElectionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VOTED_ELECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveVotedElectionIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOTED_ELECTIONS_KEY, JSON.stringify(ids));
  } catch (_) {}
}

interface AppState {
  isLoggedIn: boolean;
  loginStep: number;
  anrede: Anrede | null;
  preferences: UserPreferences;
  activeLocation: Location;
  /** Wohnort des Nutzers (Primärlogik für Filter-Sichtbarkeit) */
  residenceLocation: Location;
  activeSection: Section;
  currentCardIndex: number;
  showKIAnalysis: boolean;
  dragOffset: number;
  isDragging: boolean;
  dragStart: number;
  showStimmzettel: boolean;
  selectedWahl: any;
  voteResult: VoteResult | null;
  votedElectionIds: string[];
  consentClaraPersonalization: boolean;
  /** Zustimmung für optionale Statuszusatzfunktionen (freiwillig, privacy by default). */
  consentPraemien: boolean;
  /** false = Nur-Vorschau (z. B. Adresse ohne Abstimmrecht) */
  canVote: boolean;
  /** Login-Weg: eID vs. Adress-Test */
  loginAuthMethod: 'eid' | 'address' | null;
  registrationResidence: RegistrationResidence | null;
  regionResolution: RegionResolution | null;
  activeAdministrativeScope: AdministrativeScope;
  activeAbstimmungTab: AbstimmungTab;

  /** Beteiligungsnachweis – nur bei ausdrücklicher Einwilligung aktiv */
  consentParticipationTracking: boolean;
  participationPoints: number;
  participationVoteCount: number;
  participationElectionCount: number;
  participationByLevel: {
    bund: number;
    land: number;
    kreis: number;
    kommune: number;
  };
}

type AppAction =
  | { type: 'SET_LOGGED_IN'; payload: boolean }
  | { type: 'SET_LOGIN_STEP'; payload: number }
  | { type: 'SET_ANREDE'; payload: Anrede }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_ACTIVE_LOCATION'; payload: Location }
  | { type: 'SET_RESIDENCE_LOCATION'; payload: Location }
  | { type: 'SET_ACTIVE_SECTION'; payload: Section }
  | { type: 'SET_CURRENT_CARD_INDEX'; payload: number }
  | { type: 'TOGGLE_KI_ANALYSIS' }
  | { type: 'SET_DRAG_OFFSET'; payload: number }
  | { type: 'SET_IS_DRAGGING'; payload: boolean }
  | { type: 'SET_DRAG_START'; payload: number }
  | { type: 'TOGGLE_STIMMZETTEL' }
  | { type: 'SET_SELECTED_WAHL'; payload: any }
  | { type: 'SET_VOTE_RESULT'; payload: VoteResult | null }
  | { type: 'HANDLE_VOTE'; payload: { voteType: VoteType; card: any; points: number; earnedPoints: number } }
  | { type: 'RESET_DRAG' }
  /** Hebt die letzte Demo-Abstimmung für den internen Zähler rückgängig (Karte zurück / vor Advance). */
  | { type: 'DEMO_REVERT_VOTE'; payload: { points: number } }
  | { type: 'RECORD_ELECTION_VOTE'; payload: string }
  | { type: 'HYDRATE_VOTED_ELECTIONS'; payload: string[] }
  | { type: 'SET_CONSENT_CLARA_PERSONALIZATION'; payload: boolean }
  | { type: 'SET_CONSENT_PRAEMIEN'; payload: boolean }
  | { type: 'SET_CAN_VOTE'; payload: boolean }
  | { type: 'SET_LOGIN_AUTH_METHOD'; payload: 'eid' | 'address' | null }
  | { type: 'SET_REGISTRATION_RESIDENCE'; payload: RegistrationResidence | null }
  | { type: 'APPLY_REGION_FROM_ADDRESS'; payload: { plz: string; city: string } }
  | { type: 'SET_ACTIVE_ADMINISTRATIVE_SCOPE'; payload: AdministrativeScope }
  | { type: 'SET_ACTIVE_ABSTIMMUNG_TAB'; payload: AbstimmungTab }
  | { type: 'SET_CONSENT_PARTICIPATION_TRACKING'; payload: boolean }
  | {
      type: 'HYDRATE_PARTICIPATION';
      payload: {
        points: number;
        votes: number;
        elections: number;
        byLevel: { bund: number; land: number; kreis: number; kommune: number };
      };
    }
  | { type: 'RECORD_MELDUNG_SUBMITTED'; payload?: { points?: number } };

function meldenSectionAllowed(s: AppState): boolean {
  // Meldungen ist in der Demo immer nutzbar: wenn die echte Region nicht vollständig
  // unterstützt ist, fällt die UI ohnehin auf eine Demo-Kommune (z. B. Kirkel) zurück.
  // Ein hartes Blocking führt sonst dazu, dass Nutzer die Funktion gar nicht sehen.
  return true;
}

const initialState: AppState = {
  isLoggedIn: false,
  loginStep: 1,
  anrede: null,
  preferences: {
    umwelt: 50,
    finanzen: 50,
    bildung: 50,
    digital: 50,
    soziales: 50,
    sicherheit: 50,
  },
  activeLocation: 'bundesweit',
  residenceLocation: 'kirkel',
  activeSection: 'live',
  currentCardIndex: 0,
  showKIAnalysis: false,
  dragOffset: 0,
  isDragging: false,
  dragStart: 0,
  showStimmzettel: false,
  selectedWahl: null,
  voteResult: null,
  votedElectionIds: [],
  consentClaraPersonalization: false,
  consentPraemien: false,
  canVote: true,
  loginAuthMethod: null,
  registrationResidence: null,
  regionResolution: null,
  activeAdministrativeScope: 'bund',
  activeAbstimmungTab: 'aktuell',

  consentParticipationTracking: false,
  participationPoints: 0,
  participationVoteCount: 0,
  participationElectionCount: 0,
  participationByLevel: { bund: 0, land: 0, kreis: 0, kommune: 0 },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOGGED_IN':
      return {
        ...state,
        isLoggedIn: action.payload,
        registrationResidence: action.payload ? null : state.registrationResidence,
      };
    case 'SET_LOGIN_STEP':
      return { ...state, loginStep: action.payload };
    case 'SET_ANREDE':
      return { ...state, anrede: action.payload };
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'SET_ACTIVE_LOCATION': {
      const nextLoc = action.payload;
      return {
        ...state,
        activeLocation: nextLoc,
        currentCardIndex: 0,
        regionResolution: null,
        activeAdministrativeScope: 'bund',
        activeSection: state.activeSection,
      };
    }
    case 'SET_RESIDENCE_LOCATION':
      return { ...state, residenceLocation: action.payload };
    case 'SET_ACTIVE_SECTION': {
      let next = action.payload;
      return {
        ...state,
        activeSection: next,
        currentCardIndex: next === 'live' ? state.currentCardIndex : 0,
      };
    }
    case 'SET_CURRENT_CARD_INDEX':
      return { ...state, currentCardIndex: action.payload };
    case 'TOGGLE_KI_ANALYSIS':
      return { ...state, showKIAnalysis: !state.showKIAnalysis };
    case 'SET_DRAG_OFFSET':
      return { ...state, dragOffset: action.payload };
    case 'SET_IS_DRAGGING':
      return { ...state, isDragging: action.payload };
    case 'SET_DRAG_START':
      return { ...state, dragStart: action.payload };
    case 'TOGGLE_STIMMZETTEL':
      return { ...state, showStimmzettel: !state.showStimmzettel };
    case 'SET_SELECTED_WAHL':
      return { ...state, selectedWahl: action.payload };
    case 'SET_VOTE_RESULT':
      return { ...state, voteResult: action.payload };
    case 'HANDLE_VOTE': {
      if (!state.canVote) return state;
      const voteLabels: Record<VoteType, VoteResult['vote']> = {
        for: 'DAFÜR',
        against: 'DAGEGEN',
        abstain: 'ENTHALTEN',
      };
      const earnedPts = state.canVote ? Math.max(0, action.payload.earnedPoints) : 0;
      const scopeKey = state.activeAdministrativeScope;
      return {
        ...state,
        voteResult: {
          card: action.payload.card,
          vote: voteLabels[action.payload.voteType],
          points: earnedPts,
        },
        participationPoints: state.participationPoints + earnedPts,
        participationVoteCount: state.participationVoteCount + (state.canVote ? 1 : 0),
        participationByLevel: state.canVote
          ? { ...state.participationByLevel, [scopeKey]: (state.participationByLevel[scopeKey] || 0) + 1 }
          : state.participationByLevel,
      };
    }
    case 'RESET_DRAG':
      return { ...state, dragOffset: 0, isDragging: false };
    case 'DEMO_REVERT_VOTE': {
      if (!state.canVote) {
        return { ...state, voteResult: null };
      }
      const reverted = action.payload.points || 0;
      const scopeKey = state.activeAdministrativeScope;
      return {
        ...state,
        voteResult: null,
        participationPoints: Math.max(0, state.participationPoints - reverted),
        participationVoteCount: Math.max(0, state.participationVoteCount - 1),
        participationByLevel: {
          ...state.participationByLevel,
          [scopeKey]: Math.max(0, (state.participationByLevel[scopeKey] || 0) - 1),
        },
      };
    }
    case 'RECORD_ELECTION_VOTE': {
      if (!state.canVote) return state;
      const id = action.payload;
      if (!id || state.votedElectionIds.includes(id)) return state;
      const next = [...state.votedElectionIds, id];
      saveVotedElectionIds(next);
      const elPts = state.canVote ? DEMO_POINTS_PER_WAHL : 0;
      return {
        ...state,
        votedElectionIds: next,
        participationPoints: state.participationPoints + elPts,
        participationElectionCount: state.participationElectionCount + (state.canVote ? 1 : 0),
      };
    }
    case 'HYDRATE_VOTED_ELECTIONS':
      return { ...state, votedElectionIds: action.payload };
    case 'SET_CONSENT_CLARA_PERSONALIZATION':
      return { ...state, consentClaraPersonalization: action.payload };
    case 'SET_CONSENT_PRAEMIEN':
      return { ...state, consentPraemien: action.payload };
    case 'SET_CAN_VOTE':
      return { ...state, canVote: action.payload };
    case 'SET_LOGIN_AUTH_METHOD':
      return { ...state, loginAuthMethod: action.payload };
    case 'SET_REGISTRATION_RESIDENCE':
      return { ...state, registrationResidence: action.payload };
    case 'APPLY_REGION_FROM_ADDRESS': {
      const { plz, city } = action.payload;
      const r = resolveRegionFromPlzCity(plz, city);
      const scope = defaultAdministrativeScope(r);
      const loc = locationForAdministrativeScope(r, scope);
      return {
        ...state,
        regionResolution: r,
        activeAdministrativeScope: scope,
        activeLocation: loc,
        activeSection: state.activeSection,
      };
    }
    case 'SET_ACTIVE_ADMINISTRATIVE_SCOPE': {
      if (!state.regionResolution) return state;
      const scope = action.payload;
      const loc = locationForAdministrativeScope(state.regionResolution, scope);
      return {
        ...state,
        activeAdministrativeScope: scope,
        activeLocation: loc,
        activeSection: state.activeSection,
      };
    }
    case 'SET_ACTIVE_ABSTIMMUNG_TAB':
      return { ...state, activeAbstimmungTab: action.payload };
    case 'SET_CONSENT_PARTICIPATION_TRACKING':
      return { ...state, consentParticipationTracking: action.payload };
    case 'HYDRATE_PARTICIPATION': {
      const d = action.payload;
      return {
        ...state,
        participationPoints: d.points ?? 0,
        participationVoteCount: d.votes ?? 0,
        participationElectionCount: d.elections ?? 0,
        participationByLevel: d.byLevel ?? { bund: 0, land: 0, kreis: 0, kommune: 0 },
      };
    }
    case 'RECORD_MELDUNG_SUBMITTED': {
      if (!state.canVote) return state;
      const pts = action.payload?.points ?? DEMO_POINTS_PER_MELDUNG;
      return {
        ...state,
        participationPoints: state.participationPoints + pts,
        participationByLevel: {
          ...state.participationByLevel,
          kommune: state.participationByLevel.kommune + 1,
        },
      };
    }
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(ANREDE_KEY);
      if (raw === 'sie' || raw === 'du') {
        dispatch({ type: 'SET_ANREDE', payload: raw });
      }
    } catch {}
  }, []);

  useEffect(() => {
    const ids = loadVotedElectionIds();
    if (ids.length > 0) dispatch({ type: 'HYDRATE_VOTED_ELECTIONS', payload: ids });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_CLARA_PERSONALIZATION_KEY);
      if (raw === 'true' || raw === 'false') {
        dispatch({ type: 'SET_CONSENT_CLARA_PERSONALIZATION', payload: raw === 'true' });
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        CONSENT_CLARA_PERSONALIZATION_KEY,
        state.consentClaraPersonalization ? 'true' : 'false'
      );
    } catch (_) {}
  }, [state.consentClaraPersonalization]);

  useEffect(() => {
    try {
      if (state.anrede == null) return;
      localStorage.setItem(ANREDE_KEY, state.anrede);
    } catch (_) {}
  }, [state.anrede]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_PRAEMIEN_KEY);
      if (raw === 'true' || raw === 'false') {
        dispatch({ type: 'SET_CONSENT_PRAEMIEN', payload: raw === 'true' });
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CONSENT_PRAEMIEN_KEY, state.consentPraemien ? 'true' : 'false');
    } catch (_) {}
  }, [state.consentPraemien]);

  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_PARTICIPATION_KEY);
      if (raw === 'true') {
        dispatch({ type: 'SET_CONSENT_PARTICIPATION_TRACKING', payload: true });
      }
      const snap = readParticipationSnapshotFromStorage();
      dispatch({ type: 'HYDRATE_PARTICIPATION', payload: snap });
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DEMO_POINTS_TOTAL_KEY, String(state.participationPoints));
    } catch (_) {}
  }, [state.participationPoints]);

  useEffect(() => {
    try {
      localStorage.setItem(
        CONSENT_PARTICIPATION_KEY,
        state.consentParticipationTracking ? 'true' : 'false',
      );
      if (state.consentParticipationTracking) {
        localStorage.setItem(
          PARTICIPATION_DATA_KEY,
          JSON.stringify({
            points: state.participationPoints,
            votes: state.participationVoteCount,
            elections: state.participationElectionCount,
            byLevel: state.participationByLevel,
          }),
        );
      }
    } catch (_) {}
  }, [
    state.consentParticipationTracking,
    state.participationPoints,
    state.participationVoteCount,
    state.participationElectionCount,
    state.participationByLevel,
  ]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <ClaraVoiceProvider>{children}</ClaraVoiceProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
