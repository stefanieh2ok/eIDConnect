'use client';

import React from 'react';
import { CheckCircle, ListChecks, MessageCircle, ThumbsUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { visibleMainNavItems, type MainNavIconKey, type MainNavItem } from '@/lib/appNavConfig';

const NAV_ICONS: Record<MainNavIconKey, React.ComponentType<{ className?: string }>> = {
  wegweiser: ListChecks,
  meldungen: MessageCircle,
  abstimmen: ThumbsUp,
  wahlen: CheckCircle,
};

const WEGWEISER_ARIA_LABEL = 'Clara Wegweiser Pilotmodul';

type AppBottomNavProps = {
  hidden?: boolean;
};

function NavButton({
  item,
  isActive,
  onSelect,
}: {
  item: MainNavItem;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = NAV_ICONS[item.iconKey];
  const isPilot = item.pilot === true;
  const activeClass = isPilot
    ? ' app-bottom-nav__item--pilot-active'
    : ' app-bottom-nav__item--active';
  const ariaLabel = isPilot ? WEGWEISER_ARIA_LABEL : item.label;

  return (
    <button
      type="button"
      id={item.tourId}
      onClick={onSelect}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel}
      title={item.label}
      className={`app-bottom-nav__item${isPilot ? ' app-bottom-nav__item--pilot' : ''}${
        isActive ? activeClass : ''
      }`}
    >
      <Icon className="app-bottom-nav__icon" aria-hidden />
      <span className="app-bottom-nav__label-wrap">
        <span className="app-bottom-nav__label">{item.label}</span>
        {isPilot ? (
          <span className="app-bottom-nav__pilot-badge" aria-hidden>
            Pilot
          </span>
        ) : null}
      </span>
    </button>
  );
}

export default function AppBottomNav({ hidden = false }: AppBottomNavProps) {
  const { state, dispatch } = useApp();
  const items = visibleMainNavItems(state.residenceLocation);
  const pilotItems = items.filter((item) => item.pilot);
  const coreItems = items.filter((item) => !item.pilot);
  const showPilotZone = pilotItems.length > 0;

  if (hidden) return null;

  const selectSection = (section: MainNavItem['section']) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  };

  return (
    <nav className="app-bottom-nav" aria-label="Hauptnavigation">
      <div
        className={`app-bottom-nav__layout${showPilotZone ? ' app-bottom-nav__layout--two-zone' : ''}`}
      >
        {showPilotZone ? (
          <>
            <div className="app-bottom-nav__pilot-zone" data-testid="bottom-nav-pilot-zone">
              {pilotItems.map((item) => (
                <NavButton
                  key={item.section}
                  item={item}
                  isActive={state.activeSection === item.section}
                  onSelect={() => selectSection(item.section)}
                />
              ))}
            </div>
            <div
              className="app-bottom-nav__zone-separator"
              role="separator"
              aria-orientation="vertical"
              aria-hidden
              data-testid="bottom-nav-zone-separator"
            />
          </>
        ) : null}
        <div
          className="app-bottom-nav__core-zone"
          style={{ gridTemplateColumns: `repeat(${coreItems.length}, minmax(0, 1fr))` }}
        >
          {coreItems.map((item) => (
            <NavButton
              key={item.section}
              item={item}
              isActive={state.activeSection === item.section}
              onSelect={() => selectSection(item.section)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
