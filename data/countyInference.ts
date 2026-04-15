/**
 * Ergänzt fehlende Kreis-/Landkreis-Zuordnung, wenn Geocoding (z. B. Nominatim) kein county liefert.
 * Verhindert, dass Menü & Wahlen ohne Kreis-Ebene bleiben, obwohl ein Kreis existiert.
 */

import { inferBadenWuerttembergKreisFromCity } from './badenWuerttembergKreis';
import { inferHessenKreisFromCity } from './hessenKreis';
import { inferSaarlandKreisFromCity } from './saarlandKreis';

export type CountyInferenceInput = {
  county?: string | null;
  plz?: string;
  city?: string;
  stateKey?: string;
};

/**
 * Liefert einen Kreis-Namen, der mit data/kreise.json / findKreisByCounty zusammenpasst,
 * oder null wenn keine sichere Zuordnung möglich ist.
 */
export function inferCountyIfMissing(input: CountyInferenceInput): string | null {
  const existing = (input.county || '').trim();
  if (existing) return null;

  const plz = (input.plz || '').trim();
  const city = (input.city || '').toLowerCase().trim();
  const st = (input.stateKey || '').toLowerCase();

  // ── Stadt/Landkreis aus Ortsnamen (häufige Demo-Orte + Nachbargemeinden) ──
  if (/viernheim|lampertheim|bürstadt|buerstadt|lorsch|biblis|einhausen|hessenheim/.test(city)) {
    return 'Bergstraße';
  }
  if (/weinheim|leimen|wiesloch|schriesheim|walldorf|sandhausen|meckesheim|neckargemünd|neckargemuend|hirschberg|wilhelmsfeld/.test(city)) {
    return 'Rhein-Neckar-Kreis';
  }
  if (/\bmannheim\b/.test(city)) {
    return 'Mannheim, Stadtkreis';
  }
  if (/\bheidelberg\b/.test(city)) {
    return 'Heidelberg, Stadtkreis';
  }
  if (/frankfurt\s*am\s*main|^frankfurt$/i.test(input.city || '') || /\bfrankfurt\s*am\s*main\b/.test(city)) {
    return 'Frankfurt am Main, Stadt';
  }
  if (/neustadt\s*(an\s*der\s*)?wein/.test(city)) {
    return 'Neustadt an der Weinstraße, kreisfreie Stadt';
  }
  if (/^neustadt$/.test(city) && (st === 'rheinland-pfalz' || /^674/.test(plz) || /^673/.test(plz) || /^672/.test(plz))) {
    return 'Neustadt an der Weinstraße, kreisfreie Stadt';
  }

  // Hessen: Kreise / kreisfreie Städte (wenn noch kein county)
  if (
    st === 'hessen' ||
    (!st &&
      plz.length >= 2 &&
      (/^60|^61|^62|^63|^64|^685|^69/.test(plz) || /^34[0-3]/.test(plz) || /^35|^36/.test(plz) || /^37[23]/.test(plz)))
  ) {
    const hk = inferHessenKreisFromCity(input.city || '', plz);
    if (hk) return hk;
  }

  // Baden-Württemberg
  if (
    st === 'baden-wuerttemberg' ||
    (!st &&
      plz.length >= 2 &&
      (/^7/.test(plz) ||
        /^680|^681|^682|^683|^684|^686|^687|^688|^689/.test(plz) ||
        /^691/.test(plz) ||
        /^880|^881|^882|^883|^884|^886|^887/.test(plz)))
  ) {
    const bw = inferBadenWuerttembergKreisFromCity(input.city || '', plz);
    if (bw) return bw;
  }

  // Saarland: alle Landkreise / Regionalverband (nicht alles unter Saarpfalz!)
  if (st === 'saarland' || (!st && plz.length >= 2 && plz.startsWith('66'))) {
    const sl = inferSaarlandKreisFromCity(input.city || '');
    if (sl) return sl;
  }

  // ── PLZ-Heuristiken (nur wenn Bundesland passt oder leer) ──
  if (plz.length >= 3) {
    if ((st === 'hessen' || !st) && /^685/.test(plz)) return 'Bergstraße';
    if ((st === 'baden-wuerttemberg' || st === 'hessen' || !st) && /^694/.test(plz)) return 'Rhein-Neckar-Kreis';
    if ((st === 'baden-wuerttemberg' || !st) && /^681|^682|^683|^684/.test(plz)) return 'Mannheim, Stadtkreis';
    if ((st === 'baden-wuerttemberg' || !st) && /^691/.test(plz)) return 'Heidelberg, Stadtkreis';
    // Saarland PLZ 66xxx (ohne Ortsangabe)
    if ((st === 'saarland' || !st) && /^66\d{3}$/.test(plz)) {
      const p3 = plz.slice(0, 3);
      const bucket: Record<string, string> = {
        '661': 'Regionalverband Saarbrücken',
        '662': 'Regionalverband Saarbrücken',
        '663': 'Saarpfalz-Kreis',
        '664': 'Saarpfalz-Kreis',
        '665': 'Saarlouis',
        '667': 'Neunkirchen',
        '668': 'Neunkirchen',
      };
      if (bucket[p3]) return bucket[p3];
      if (p3 === '666') return 'Merzig-Wadern';
    }
  }

  return null;
}
