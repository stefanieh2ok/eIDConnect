import type { EbeneLevel, Location, Section } from '@/types';

export type MainNavIconKey = 'wegweiser' | 'meldungen' | 'abstimmen' | 'wahlen';

export type MainNavItem = {
  section: Section;
  label: string;
  kommuneOnly?: boolean;
  iconKey: MainNavIconKey;
  tourId?: string;
};

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  { section: 'fuermich', label: 'Wegweiser', iconKey: 'wegweiser' },
  { section: 'meldungen', label: 'Melden', kommuneOnly: true, iconKey: 'meldungen', tourId: 'tour-melden-btn' },
  { section: 'live', label: 'Beteiligen', iconKey: 'abstimmen', tourId: 'tour-voting-btn' },
  { section: 'wahlen', label: 'Wahlen', iconKey: 'wahlen' },
];

const LOCATION_TO_LEVEL: Record<Location, EbeneLevel> = {
  bundesweit: 'bund',
  deutschland: 'bund',
  saarland: 'land',
  saarpfalz: 'kreis',
  kirkel: 'kommune',
  frankfurt: 'kommune',
  mannheim: 'kommune',
  heidelberg: 'kommune',
  weinheim: 'kommune',
  viernheim: 'kommune',
  neustadt: 'kommune',
  bremen: 'kommune',
  berlin: 'kommune',
  bayern: 'land',
  muenchen: 'kreis',
};

export function residencePathForLocation(loc: Location): EbeneLevel[] {
  const level = LOCATION_TO_LEVEL[loc] ?? 'bund';
  switch (level) {
    case 'kommune':
      return ['bund', 'land', 'kreis', 'kommune'];
    case 'kreis':
      return ['bund', 'land', 'kreis'];
    case 'land':
      return ['bund', 'land'];
    default:
      return ['bund'];
  }
}

export function visibleMainNavItems(residenceLocation: Location): MainNavItem[] {
  const path = residencePathForLocation(residenceLocation);
  return MAIN_NAV_ITEMS.filter((item) => {
    if (item.section === 'fuermich') return false;
    return !item.kommuneOnly || path.includes('kommune');
  });
}
