import { inferCountyIfMissing } from '@/data/countyInference';
import { normalizePlz, resolveDemoLocation } from '@/data/plzDemoLookup';
import type { AdministrativeScope, Location, RegionResolution } from '@/types';

const CITY_RE = {
  muenchen: /\bmünchen\b|\bmuenchen\b|\bottobrunn\b|\bunterhaching\b|\bgrünwald\b|\bgruenwald\b/i,
  frankfurt: /\bfrankfurt\b/i,
  mannheim: /\bmannheim\b/i,
  heidelberg: /\bheidelberg\b/i,
  weinheim: /\bweinheim\b/i,
  viernheim: /\bviernheim\b/i,
  neustadt: /neustadt.*wein|weinstraße|weinstrasse/i,
  berlin: /\bberlin\b/i,
  bremen: /\bbremen\b/i,
  kirkel: /\bkirkel\b/i,
};

function inferStateKey(plz: string, city: string): string | undefined {
  if (CITY_RE.kirkel.test(city) || /^66/.test(plz)) return 'saarland';
  if (CITY_RE.muenchen.test(city) || /^8/.test(plz) || /^9/.test(plz)) return 'bayern';
  if (CITY_RE.berlin.test(city) || /^10/.test(plz)) return 'berlin';
  if (CITY_RE.bremen.test(city) || /^28/.test(plz)) return 'bremen';
  if (CITY_RE.frankfurt.test(city) || /^60|^61|^62|^63|^64/.test(plz)) return 'hessen';
  if (CITY_RE.mannheim.test(city) || CITY_RE.heidelberg.test(city) || /^68|^69|^70/.test(plz)) {
    return 'baden-wuerttemberg';
  }
  return undefined;
}

export function resolveRegionFromPlzCity(plzRaw: string, cityRaw: string): RegionResolution {
  const plz = normalizePlz(plzRaw || '');
  const city = (cityRaw || '').trim();
  const locationHint = resolveDemoLocation(plz, city);
  const stateKey = inferStateKey(plz, city);
  const county = inferCountyIfMissing({ plz: plz || undefined, city: city || undefined, stateKey }) || undefined;

  return { plz, city, stateKey, county, locationHint };
}

export function defaultAdministrativeScope(r: RegionResolution): AdministrativeScope {
  switch (r.locationHint) {
    case 'kirkel':
    case 'frankfurt':
    case 'mannheim':
    case 'heidelberg':
    case 'weinheim':
    case 'viernheim':
    case 'neustadt':
    case 'berlin':
    case 'bremen':
      return 'kommune';
    case 'saarpfalz':
    case 'muenchen':
      return 'kreis';
    case 'saarland':
    case 'bayern':
      return 'land';
    case 'deutschland':
    case 'bundesweit':
    default:
      return 'bund';
  }
}

export function locationForAdministrativeScope(r: RegionResolution, scope: AdministrativeScope): Location {
  if (scope === 'bund') return 'bundesweit';

  if (scope === 'land') {
    if (r.stateKey === 'bayern' || r.locationHint === 'bayern' || r.locationHint === 'muenchen') return 'bayern';
    return 'saarland';
  }

  if (scope === 'kreis') {
    if (r.locationHint === 'muenchen' || r.stateKey === 'bayern') return 'muenchen';
    return 'saarpfalz';
  }

  // kommune
  if (r.locationHint && r.locationHint !== 'bundesweit' && r.locationHint !== 'deutschland') {
    if (r.locationHint !== 'saarland' && r.locationHint !== 'saarpfalz' && r.locationHint !== 'bayern') {
      return r.locationHint;
    }
  }
  return 'kirkel';
}
