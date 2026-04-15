/**
 * Leitet aus PLZ und Wohnort Bund, Land, Kreis (falls zutreffend) und Kommune ab.
 * Nutzt data/plzBundesland + data/countyInference (Hessen, BW, Saarland, …).
 */

import { inferCountyIfMissing } from '@/data/countyInference';
import { inferBundeslandFromPlz } from '@/data/plzBundesland';
import type { AdministrativeScope, Location, RegionResolution } from '@/types';

export { inferBundeslandFromPlz } from '@/data/plzBundesland';

function titelOrt(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  return t
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Standard-Ebene nach Login: feinste sinnvolle Stufe (Kommune > Kreis > Land > Bund).
 */
export function defaultAdministrativeScope(r: RegionResolution): AdministrativeScope {
  if (r.kommuneLabel) return 'kommune';
  if (r.kreisLabel) return 'kreis';
  return 'land';
}

/**
 * Mappt Verwaltungsebene auf den internen Demo-Location-Key (VOTING_DATA).
 * Außerhalb Saarland/Demo-Kirkel fällt die Datenansicht auf bundesweit zurück.
 */
/**
 * Bekannte Bundesland-Slugs → Location-Key für Land-Ebene.
 * Nur Länder mit eigenem Datensatz werden gemappt; Rest fällt auf 'bundesweit'.
 */
const LAND_LOCATION: Record<string, Location> = {
  saarland: 'saarland',
  'rheinland-pfalz': 'rheinland-pfalz',
  hessen: 'hessen',
  'baden-wuerttemberg': 'baden-wuerttemberg',
};

/**
 * Bekannte Kommune-Slugs → Location-Key (nur Städte mit eigenem Voting-/Wahlen-Datensatz).
 */
function kommuneLocationKey(kommuneLabel: string | null): Location | null {
  if (!kommuneLabel) return null;
  const k = kommuneLabel.toLowerCase().trim();
  if (/kirkel/.test(k)) return 'kirkel';
  if (/neustadt/.test(k)) return 'neustadt';
  return null;
}

export function locationForAdministrativeScope(r: RegionResolution, scope: AdministrativeScope): Location {
  if (scope === 'bund') return 'bundesweit';

  if (scope === 'land') {
    return LAND_LOCATION[r.bundeslandSlug] ?? 'bundesweit';
  }

  if (scope === 'kreis') {
    if (r.bundeslandSlug === 'saarland' && r.kreisLabel && /saarpfalz/i.test(r.kreisLabel)) {
      return 'saarpfalz';
    }
    // kreisfreie Städte: Kreis = Kommune
    if (r.kreisLabel && /kreisfrei/i.test(r.kreisLabel)) {
      return kommuneLocationKey(r.kommuneLabel) ?? 'bundesweit';
    }
    return 'bundesweit';
  }

  if (scope === 'kommune') {
    const kl = kommuneLocationKey(r.kommuneLabel);
    if (kl) return kl;
    if (r.bundeslandSlug === 'saarland' && r.kreisLabel && /saarpfalz/i.test(r.kreisLabel)) {
      return 'saarpfalz';
    }
    return 'bundesweit';
  }

  return 'bundesweit';
}

export function resolveRegionFromPlzCity(plzRaw: string, cityRaw: string): RegionResolution {
  const plz = plzRaw.replace(/\D/g, '').slice(0, 5);
  const city = cityRaw.trim();
  const land = inferBundeslandFromPlz(plz);

  const kreis =
    inferCountyIfMissing({
      plz,
      city,
      stateKey: land.slug === 'unknown' ? undefined : land.slug,
    }) ?? null;

  const kommune = titelOrt(city) || null;

  return {
    plz,
    city,
    bundLabel: 'Deutschland',
    landLabel: land.name,
    bundeslandSlug: land.slug,
    kreisLabel: kreis,
    kommuneLabel: kommune,
  };
}
