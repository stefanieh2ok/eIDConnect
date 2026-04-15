'use client';

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
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
import { migrateLegacyLocalStorageKeysOnce } from '@/lib/migrate-legacy-storage';

export type RegistrationResidence = { plz: string; city: string };

const VOTED_ELECTIONS_KEY = 'eidconnect_voted_elections';
const CONSENT_CLARA_PERSONALIZATION_KEY = 'eidconnect_consent_clara_personalization';
const CONSENT_PARTICIPATION_KEY = 'eidconnect_consent_participation';
const PARTICIPATION_DATA_KEY = 'eidconnect_participation_data';

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
  | { type: 'SET_ACTIVE_SECTION'; payload: Section }
  | { type: 'SET_CURRENT_CARD_INDEX'; payload: number }
  | { type: 'TOGGLE_KI_ANALYSIS' }
  | { type: 'SET_DRAG_OFFSET'; payload: number }
  | { type: 'SET_IS_DRAGGING'; payload: boolean }
  | { type: 'SET_DRAG_START'; payload: number }
  | { type: 'TOGGLE_STIMMZETTEL' }
  | { type: 'SET_SELECTED_WAHL'; payload: any }
  | { type: 'SET_VOTE_RESULT'; payload: VoteResult | null }
  | { type: 'HANDLE_VOTE'; payload: { voteType: VoteType; card: any; points: number } }
  | { type: 'RESET_DRAG' }
  | { type: 'RECORD_ELECTION_VOTE'; payload: string }
  | { type: 'HYDRATE_VOTED_ELECTIONS'; payload: string[] }
  | { type: 'SET_CONSENT_CLARA_PERSONALIZATION'; payload: boolean }
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
    };

function meldenSectionAllowed(s: AppState): boolean {
  if (s.regionResolution) {
    return s.activeAdministrativeScope === 'kommune';
  }
  return s.activeLocation === 'kirkel' || s.activeLocation === 'saarpfalz';
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
        activeSection:
          state.activeSection === 'melden' &&
          !meldenSectionAllowed({ ...state, activeLocation: nextLoc, regionResolution: null })
            ? 'live'
            : state.activeSection,
      };
    }
    case 'SET_ACTIVE_SECTION': {
      let next = action.payload;
      if (next === 'melden' && !meldenSectionAllowed(state)) {
        next = 'live';
      }
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
      const earnedPts = state.consentParticipationTracking ? (action.payload.points || 0) : 0;
      const scopeKey = state.activeAdministrativeScope;
      return {
        ...state,
        voteResult: {
          card: action.payload.card,
          vote: voteLabels[action.payload.voteType],
          points: action.payload.points,
        },
        participationPoints: state.participationPoints + earnedPts,
        participationVoteCount: state.participationVoteCount + (state.consentParticipationTracking ? 1 : 0),
        participationByLevel: state.consentParticipationTracking
          ? { ...state.participationByLevel, [scopeKey]: (state.participationByLevel[scopeKey] || 0) + 1 }
          : state.participationByLevel,
      };
    }
    case 'RESET_DRAG':
      return { ...state, dragOffset: 0, isDragging: false };
    case 'RECORD_ELECTION_VOTE': {
      if (!state.canVote) return state;
      const id = action.payload;
      if (!id || state.votedElectionIds.includes(id)) return state;
      const next = [...state.votedElectionIds, id];
      saveVotedElectionIds(next);
      const elPts = state.consentParticipationTracking ? 200 : 0;
      return {
        ...state,
        votedElectionIds: next,
        participationPoints: state.participationPoints + elPts,
        participationElectionCount: state.participationElectionCount + (state.consentParticipationTracking ? 1 : 0),
      };
    }
    case 'HYDRATE_VOTED_ELECTIONS':
      return { ...state, votedElectionIds: action.payload };
    case 'SET_CONSENT_CLARA_PERSONALIZATION':
      return { ...state, consentClaraPersonalization: action.payload };
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
      let section = state.activeSection;
      if (section === 'melden' && scope !== 'kommune') section = 'live';
      return {
        ...state,
        regionResolution: r,
        activeAdministrativeScope: scope,
        activeLocation: loc,
        activeSection: section,
      };
    }
    case 'SET_ACTIVE_ADMINISTRATIVE_SCOPE': {
      if (!state.regionResolution) return state;
      const scope = action.payload;
      const loc = locationForAdministrativeScope(state.regionResolution, scope);
      let section = state.activeSection;
      if (section === 'melden' && scope !== 'kommune') section = 'live';
      return {
        ...state,
        activeAdministrativeScope: scope,
        activeLocation: loc,
        activeSection: section,
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
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined') migrateLegacyLocalStorageKeysOnce();
  const [state, dispatch] = useReducer(appReducer, initialState);

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
      const raw = localStorage.getItem(CONSENT_PARTICIPATION_KEY);
      if (raw === 'true') {
        dispatch({ type: 'SET_CONSENT_PARTICIPATION_TRACKING', payload: true });
      }
      const data = localStorage.getItem(PARTICIPATION_DATA_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed.points === 'number') {
          dispatch({ type: 'HYDRATE_PARTICIPATION', payload: parsed });
        }
      }
    } catch (_) {}
  }, []);

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
      {children}
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
