'use client';

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { UserPreferences, Location, Section, Anrede, VoteResult, VoteType } from '@/types';

const VOTED_ELECTIONS_KEY = 'eidconnect_voted_elections';

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
  | { type: 'HYDRATE_VOTED_ELECTIONS'; payload: string[] };

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
    sicherheit: 50
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
  votedElectionIds: []
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOGGED_IN':
      return { ...state, isLoggedIn: action.payload };
    case 'SET_LOGIN_STEP':
      return { ...state, loginStep: action.payload };
    case 'SET_ANREDE':
      return { ...state, anrede: action.payload };
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'SET_ACTIVE_LOCATION':
      return { ...state, activeLocation: action.payload, currentCardIndex: 0 };
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
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
      const voteLabels: Record<VoteType, VoteResult['vote']> = {
        for: 'DAFÜR',
        against: 'DAGEGEN',
        abstain: 'ENTHALTEN'
      };
      return {
        ...state,
        voteResult: {
          card: action.payload.card,
          vote: voteLabels[action.payload.voteType],
          points: action.payload.points
        }
      };
    }
    case 'RESET_DRAG':
      return { ...state, dragOffset: 0, isDragging: false };
    case 'RECORD_ELECTION_VOTE': {
      const id = action.payload;
      if (!id || state.votedElectionIds.includes(id)) return state;
      const next = [...state.votedElectionIds, id];
      saveVotedElectionIds(next);
      return { ...state, votedElectionIds: next };
    }
    case 'HYDRATE_VOTED_ELECTIONS':
      return { ...state, votedElectionIds: action.payload };
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

  useEffect(() => {
    const ids = loadVotedElectionIds();
    if (ids.length > 0) dispatch({ type: 'HYDRATE_VOTED_ELECTIONS', payload: ids });
  }, []);

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
