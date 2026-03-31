import type { EbeneLevel, Location } from '@/types';

/** Welche Ebene der gewählte Wohnort in der Demo abbildet */
export const RESIDENCE_TO_LEVEL: Record<Location, EbeneLevel> = {
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

export function levelForResidenceLocation(loc: Location): EbeneLevel {
  return RESIDENCE_TO_LEVEL[loc] ?? 'bund';
}

const FALLBACK: Record<EbeneLevel, Location> = {
  bund: 'bundesweit',
  land: 'saarland',
  kreis: 'saarpfalz',
  kommune: 'kirkel',
};

/**
 * Explizite Ebenen-Zuordnung für Orte, die nicht in den Saarland-Fallback fallen dürfen.
 * Hintergrund: Stadtstaaten wie Berlin/Bremen sollen bei Land/Kreis nicht auf Saarland/Saarpfalz springen.
 */
const RESIDENCE_LEVEL_MAP: Partial<Record<Location, Record<EbeneLevel, Location>>> = {
  berlin: {
    bund: 'bundesweit',
    land: 'berlin',
    kreis: 'berlin',
    kommune: 'berlin',
  },
  bremen: {
    bund: 'bundesweit',
    land: 'bremen',
    kreis: 'bremen',
    kommune: 'bremen',
  },
};

/**
 * Aktive Location für eine gewählte Ebene: wenn der Wohnort auf dieser Ebene liegt,
 * bleibt er erhalten; sonst Demo-Fallback (z. B. Kommune → Kirkel).
 */
export function activeLocationForLevel(residence: Location, level: EbeneLevel): Location {
  const mapped = RESIDENCE_LEVEL_MAP[residence]?.[level];
  if (mapped) return mapped;

  const rl = levelForResidenceLocation(residence);
  if (level === 'bund') return 'bundesweit';
  if (level === rl) return residence;
  return FALLBACK[level];
}
