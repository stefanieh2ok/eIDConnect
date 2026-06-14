'use client';

import React from 'react';
import { CheckCircle, ListChecks, MessageCircle, ThumbsUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { visibleMainNavItems, type MainNavIconKey } from '@/lib/appNavConfig';

const NAV_ICONS: Record<MainNavIconKey, React.ComponentType<{ className?: string }>> = {
  wegweiser: ListChecks,
  meldungen: MessageCircle,
  abstimmen: ThumbsUp,
  wahlen: CheckCircle,
};

type AppBottomNavProps = {
  hidden?: boolean;
};

export default function AppBottomNav({ hidden = false }: AppBottomNavProps) {
  const { state, dispatch } = useApp();
  const items = visibleMainNavItems(state.residenceLocation);

  if (hidden) return null;

  return (
    <nav className="app-bottom-nav" aria-label="Hauptnavigation">
      <div className="app-bottom-nav__grid">
        {items.map((item) => {
          const isActive = state.activeSection === item.section;
          const Icon = NAV_ICONS[item.iconKey];
          return (
            <button
              key={item.section}
              type="button"
              id={item.tourId}
              onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: item.section })}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
              className={`app-bottom-nav__item${isActive ? ' app-bottom-nav__item--active' : ''}`}
            >
              <Icon className="app-bottom-nav__icon" aria-hidden />
              <span className="app-bottom-nav__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
