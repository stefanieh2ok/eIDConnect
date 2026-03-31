import { inferCountyIfMissing } from '@/data/countyInference';
import {
  formatDemoAddressLine,
  normalizePlz,
  resolveDemoLocation,
} from '@/data/plzDemoLookup';
import { inferSaarlandKreisFromCity } from '@/data/saarlandKreis';
import type { Location } from '@/types';

type LocDispatch = (a:
  | { type: 'SET_RESIDENCE_LOCATION'; payload: Location }
  | { type: 'SET_ACTIVE_LOCATION'; payload: Location }
  | { type: 'APPLY_REGION_FROM_ADDRESS'; payload: { plz: string; city: string } }
) => void;

export function writeDemoAddressLocal(street: string, plz: string, city: string) {
  const line = formatDemoAddressLine(street, plz, city);
  try {
    localStorage.setItem('eidconnect_demo_street', street);
    localStorage.setItem('eidconnect_demo_plz', plz);
    localStorage.setItem('eidconnect_demo_city', city);
    if (line) localStorage.setItem('eidconnect_demo_address', line);
    else localStorage.removeItem('eidconnect_demo_address');
  } catch {}
}

export function countyFromDemoParts(plz: string, city: string): string {
  const plzN = normalizePlz(plz);
  const c = city.trim();
  let county = inferCountyIfMissing({ plz: plzN || undefined, city: c || undefined });
  if (!county && c) county = inferSaarlandKreisFromCity(c);
  return county || '';
}

/** Speichert Demo-Adresse und setzt Wohnort/aktive Location in der App. */
export function persistAndSyncDemoAddress(
  dispatch: LocDispatch,
  street: string,
  plz: string,
  city: string,
): { line: string; county: string } {
  writeDemoAddressLocal(street, plz, city);
  const loc = resolveDemoLocation(plz, city);
  // Wichtig: RegionResolution/Scope hydrieren, damit Filter/Zuordnung (Land/Kreis/Kommune) korrekt ist.
  dispatch({ type: 'APPLY_REGION_FROM_ADDRESS', payload: { plz, city } });
  dispatch({ type: 'SET_RESIDENCE_LOCATION', payload: loc });
  dispatch({ type: 'SET_ACTIVE_LOCATION', payload: loc });
  return { line: formatDemoAddressLine(street, plz, city), county: countyFromDemoParts(plz, city) };
}
