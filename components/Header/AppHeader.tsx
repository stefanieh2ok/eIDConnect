'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CalendarDays, Gift, Mail, Settings } from 'lucide-react';
import ProductIdentityHeader from '@/components/ui/ProductIdentityHeader';
import { rememberSettingsReturnSection } from '@/components/Settings/SettingsSection';

const AppHeader: React.FC = () => {
  const { state, dispatch } = useApp();

  const openSettings = () => {
    rememberSettingsReturnSection(state.activeSection);
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'settings' });
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const openPostfach = () => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'postfach' });
  };

  return (
    <header id="tour-footer" className="app-shell-header">
      <div className="app-shell-header__bar">
        <div className="app-shell-header__brand">
          <ProductIdentityHeader className="max-w-full" presentation="wordmark" />
        </div>
        <div className="app-shell-header__actions" role="group" aria-label="Schnellzugriff">
          <button
            type="button"
            onClick={openPostfach}
            className={`app-shell-utility-btn app-shell-utility-btn--icon-only ${
              state.activeSection === 'postfach' ? 'app-shell-utility-btn--active' : ''
            }`}
            aria-label="Postfach öffnen"
            aria-current={state.activeSection === 'postfach' ? 'page' : undefined}
            title="Postfach · Verifizierte Behördenkommunikation"
          >
            <Mail className="app-shell-utility-btn__icon" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'kalender' })}
            className={`app-shell-utility-btn app-shell-utility-btn--icon-only ${
              state.activeSection === 'kalender' ? 'app-shell-utility-btn--active' : ''
            }`}
            aria-label="Termine öffnen"
            aria-current={state.activeSection === 'kalender' ? 'page' : undefined}
            title="Termine"
          >
            <CalendarDays className="app-shell-utility-btn__icon" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            id="tour-rewards-btn"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'leaderboard' })}
            className={`app-shell-utility-btn app-shell-utility-btn--icon-only ${
              state.activeSection === 'leaderboard' ? 'app-shell-utility-btn--active' : ''
            }`}
            aria-label="Prämien"
            aria-current={state.activeSection === 'leaderboard' ? 'page' : undefined}
            title="Prämien"
          >
            <Gift className="app-shell-utility-btn__icon" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            onClick={openSettings}
            className={`app-shell-utility-btn app-shell-utility-btn--icon-only ${
              state.activeSection === 'settings' ? 'app-shell-utility-btn--active' : ''
            }`}
            aria-label="Einstellungen öffnen"
            aria-current={state.activeSection === 'settings' ? 'page' : undefined}
            title="Einstellungen"
          >
            <Settings className="app-shell-utility-btn__icon" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
