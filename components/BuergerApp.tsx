'use client';

import React, { useState, useLayoutEffect } from 'react';
import { useApp, type RegistrationResidence } from '@/context/AppContext';
import { TopHighlightsSlide } from '@/components/TopHighlightsSlide';
import LoginScreen from '@/components/Login/LoginScreen';
import AppHeader from '@/components/Header/AppHeader';
import LiveSection from '@/components/Live/LiveSection';
import LeaderboardSection from '@/components/Leaderboard/LeaderboardSection';
import ElectionsSection from '@/components/Elections/ElectionsSection';
import NewsSection from '@/components/News/NewsSection';
import CalendarSection from '@/components/Calendar/CalendarSection';
import MeldenSection from '@/components/Melden/MeldenSection';
import StimmzettelModal from '@/components/Modals/StimmzettelModal';
import { INTRO_REQUIRED_FOR_BOTH_DEMO_TYPES } from '@/config/demo';

const INTRO_DONE_KEY = 'eidconnect_intro_done';
const HIGHLIGHTS_SEEN_KEY = 'eidconnect_highlights_seen';

type BuergerAppProps = {
  /** Aus Zugangsanfrage / Demo-Session: Region vorbefüllen */
  registrationResidence?: RegistrationResidence | null;
};

function appShell(children: React.ReactNode) {
  return (
    <div className="app-body relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      {children}
    </div>
  );
}

export default function BuergerApp({ registrationResidence = null }: BuergerAppProps) {
  const { state, dispatch } = useApp();

  useLayoutEffect(() => {
    if (!registrationResidence?.plz || registrationResidence.plz.replace(/\D/g, '').length !== 5) return;
    const city = registrationResidence.city?.trim() ?? '';
    if (city.length < 2) return;
    const plz = registrationResidence.plz.replace(/\D/g, '').slice(0, 5);
    dispatch({ type: 'SET_REGISTRATION_RESIDENCE', payload: { plz, city } });
    dispatch({ type: 'APPLY_REGION_FROM_ADDRESS', payload: { plz, city } });
  }, [dispatch, registrationResidence?.plz, registrationResidence?.city]);
  const [showIntro, setShowIntro] = useState(true);
  const [showHighlights, setShowHighlights] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname || '';
    const isTest = process.env.NODE_ENV === 'test';
    if (!isTest && path.includes('/demo') && INTRO_REQUIRED_FOR_BOTH_DEMO_TYPES) {
      localStorage.removeItem(INTRO_DONE_KEY);
      localStorage.removeItem(HIGHLIGHTS_SEEN_KEY);
    }
    const introDone = localStorage.getItem(INTRO_DONE_KEY);
    const highlightsSeen = localStorage.getItem(HIGHLIGHTS_SEEN_KEY);
    setShowIntro(!introDone);
    setShowHighlights(!highlightsSeen && !!introDone);
  }, []);

  useLayoutEffect(() => {
    if (process.env.NODE_ENV === 'test' && localStorage.getItem(INTRO_DONE_KEY) && !state.isLoggedIn) {
      dispatch({ type: 'SET_LOGGED_IN', payload: true });
    }
  }, [dispatch, state.isLoggedIn]);

  const handleIntroClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(INTRO_DONE_KEY, 'true');
    }
    setShowIntro(false);
    setShowHighlights(true);
  };

  const handleHighlightsClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HIGHLIGHTS_SEEN_KEY, 'true');
    }
    setShowHighlights(false);
  };

  const handleLoginFromIntro = () => {
    handleIntroClose();
  };

  if (!state.isLoggedIn) {
    if (showIntro) {
      return appShell(
        <TopHighlightsSlide embedded onClose={handleLoginFromIntro} />
      );
    }
    return appShell(<LoginScreen />);
  }

  if (showIntro) {
    return appShell(<TopHighlightsSlide embedded onClose={handleIntroClose} />);
  }

  if (showHighlights) {
    return appShell(<TopHighlightsSlide embedded onClose={handleHighlightsClose} />);
  }

  const renderSection = () => {
    switch (state.activeSection) {
      case 'live':
        return <LiveSection />;
      case 'leaderboard':
        return <LeaderboardSection />;
      case 'wahlen':
        return <ElectionsSection />;
      case 'news':
        return <NewsSection />;
      case 'kalender':
        return <CalendarSection />;
      case 'melden':
        return <MeldenSection />;
      default:
        return <LiveSection />;
    }
  };

  return appShell(
    <>
      <AppHeader />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
        {renderSection()}
      </main>
      <StimmzettelModal />
    </>
  );
}
