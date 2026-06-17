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

  it('does not show pilot card on core sections (entry is bottom nav)', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    expect(shouldShowClaraWegweiserPilotCard('live')).toBe(false);
    expect(shouldShowClaraWegweiserPilotCard('fuermich')).toBe(false);
  });
});

describe('visibleMainNavItems', () => {
  const prev = process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    else process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = prev;
  });

  it('includes Wegweiser as pilot item when flag is enabled', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
    const items = visibleMainNavItems('kirkel');
    expect(items.map((i) => i.label)).toEqual(['Wegweiser', 'Melden', 'Beteiligen', 'Wahlen']);
    expect(items[0]).toMatchObject({ section: 'fuermich', pilot: true });
  });

  it('excludes Wegweiser when flag is false', () => {
    process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER = 'false';
    const items = visibleMainNavItems('kirkel');
    expect(items.map((i) => i.label)).toEqual(['Melden', 'Beteiligen', 'Wahlen']);
    expect(items.some((i) => i.section === 'fuermich')).toBe(false);
  });
});
