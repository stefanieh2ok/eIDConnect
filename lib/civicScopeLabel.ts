import { activeLocationForLevel, levelForResidenceLocation } from '@/lib/activeLocationForLevel';
import { DEMO_LOCATION_LABEL } from '@/lib/locationLabels';
import type { Location, Section } from '@/types';

const LEVEL_LABEL: Record<string, string> = {
  bund: 'Bund',
  land: 'Land',
  kreis: 'Kreis',
  kommune: 'Kommune',
};

/** Ortsname für Scope-Chip (z. B. „Kirkel“, ohne Ebene-Präfix). */
export function civicPlaceScopeLabel(activeLocation: Location, residenceLocation?: Location): string {
  const res = residenceLocation ?? activeLocation;
  const lvl = levelForResidenceLocation(activeLocation);
  if (lvl === 'bund') return 'Bund';
  const loc = activeLocationForLevel(res, lvl);
  const region = DEMO_LOCATION_LABEL[loc] ?? String(loc);
  if (region === 'Deutschland') return 'Bund';
  return region;
}

/** Kompakte Ebene·Ort-Anzeige (eine Zeile, keine „Auswahl:“-Präfixe). */
export function civicScopeDisplayLabel(activeLocation: Location, residenceLocation?: Location): string {
  const res = residenceLocation ?? activeLocation;
  const lvl = levelForResidenceLocation(activeLocation);
  const levelLabel = LEVEL_LABEL[lvl] ?? 'Bund';
  const loc = activeLocationForLevel(res, lvl);
  const region = DEMO_LOCATION_LABEL[loc] ?? String(loc);
  if (lvl === 'bund' || region === 'Deutschland') return levelLabel;
  return `${levelLabel} · ${region}`;
}

export function civicScopeLabelForSection(
  section: Section,
  activeLocation: Location,
  residenceLocation?: Location,
): string {
  if (section === 'meldungen') {
    const loc = activeLocationForLevel(residenceLocation ?? activeLocation, 'kommune');
    const label = DEMO_LOCATION_LABEL[loc] ?? String(loc);
    return `Kommune · ${label}`;
  }
  return civicScopeDisplayLabel(activeLocation, residenceLocation);
}
