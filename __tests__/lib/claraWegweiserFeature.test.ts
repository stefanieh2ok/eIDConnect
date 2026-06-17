import {
  isClaraWegweiserEnabled,
  shouldShowClaraWegweiserPilotCard,
} from '@/lib/claraWegweiserFeature';
import { visibleMainNavItems } from '@/lib/appNavConfig';

describe('claraWegweiserFeature', () => {
  const prev = process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    else process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = prev;
  });

  it('defaults to enabled when env is unset', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    expect(isClaraWegweiserEnabled()).toBe(true);
  });

  it('can be disabled explicitly', () => {
    process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = 'false';
    expect(isClaraWegweiserEnabled()).toBe(false);
  });

  it('shows pilot card on core sections when enabled', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    expect(shouldShowClaraWegweiserPilotCard('live')).toBe(true);
    expect(shouldShowClaraWegweiserPilotCard('fuermich')).toBe(false);
  });

  it('hides pilot card when flag is false', () => {
    process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = 'false';
    expect(shouldShowClaraWegweiserPilotCard('live')).toBe(false);
  });
});

describe('visibleMainNavItems', () => {
  it('excludes Wegweiser from core bottom navigation', () => {
    const items = visibleMainNavItems('kirkel');
    expect(items.map((i) => i.label)).toEqual(['Melden', 'Beteiligen', 'Wahlen']);
    expect(items.some((i) => i.section === 'fuermich')).toBe(false);
  });
});
