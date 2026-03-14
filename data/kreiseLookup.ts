/**
 * Zuordnung aller Kreise/Landkreise in Deutschland zum jeweiligen Bundesland (landKey).
 * Datenbasis: data/kreise.json (amtliches Gemeindeverzeichnis).
 * Ermöglicht: County-String (z. B. von Nominatim) → offizieller Name + Bundesland.
 */

import kreiseData from './kreise.json';

const KREISE = kreiseData as Array<{ name: string; ags: string; landKey: string }>;

function normalize(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/\u00e4/g, 'ae')
      .replace(/\u00f6/g, 'oe')
      .replace(/\u00fc/g, 'ue')
      .replace(/\u00df/g, 'ss')
      .replace(/\u00c4/g, 'ae')
      .replace(/\u00d6/g, 'oe')
      .replace(/\u00dc/g, 'ue')
      // Präfixe/Suffixe entfernen für Abgleich (Nominatim liefert oft "Kreis X" oder "Landkreis X")
      .replace(/^(kreis|landkreis|stadtkreis|städteregion|regionalverband)\s+/i, '')
      .replace(/\s*,\s*(stadt|landeshauptstadt|kreisfreie stadt|wissenschaftsstadt|documenta-stadt|klingenstadt|hansestadt|freie und hansestadt).*$/i, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// Map: normalisierter Suchbegriff → erstes passendes Kreis-Objekt (name, landKey)
const normalizedToKreis = new Map<string, { name: string; landKey: string }>();

for (const k of KREISE) {
  const n = normalize(k.name);
  if (n && !normalizedToKreis.has(n)) {
    normalizedToKreis.set(n, { name: k.name, landKey: k.landKey });
  }
  const nameBase = k.name.replace(/\s*,\s*.*$/, '').trim();
  const nBase = normalize(nameBase);
  if (nBase && !normalizedToKreis.has(nBase)) {
    normalizedToKreis.set(nBase, { name: k.name, landKey: k.landKey });
  }
  // Variante ohne "-Kreis"/" Kreis"-Suffix (z. B. "Saarpfalz" → Saarpfalz-Kreis)
  const withoutKreisSuffix = nameBase.replace(/\s*-?\s*kreis\s*$/i, '').trim();
  if (withoutKreisSuffix && withoutKreisSuffix !== nameBase) {
    const nShort = normalize(withoutKreisSuffix);
    if (nShort && !normalizedToKreis.has(nShort)) {
      normalizedToKreis.set(nShort, { name: k.name, landKey: k.landKey });
    }
  }
}

/**
 * Sucht anhand eines County-Strings (z. B. von Nominatim: "Bergstraße", "Kreis Bergstraße")
 * den passenden Kreis und gibt offiziellen Namen sowie landKey (Bundesland) zurück.
 */
export function findKreisByCounty(county: string): { name: string; landKey: string } | null {
  if (!county || typeof county !== 'string') return null;
  const n = normalize(county);
  if (!n) return null;
  return normalizedToKreis.get(n) ?? null;
}

/**
 * Gibt den Anzeigenamen für den Kreis zurück (mit "Kreis " falls nicht schon vorhanden).
 */
export function getKreisDisplayName(county: string): string {
  const found = findKreisByCounty(county);
  if (found) {
    const name = found.name;
    const lower = name.toLowerCase();
    if (lower.startsWith('kreis ') || lower.startsWith('landkreis ')) return name;
    return `Kreis ${name}`;
  }
  const trimmed = county.trim();
  if (!trimmed) return 'Kreis';
  return trimmed.toLowerCase().startsWith('kreis ') ? trimmed : `Kreis ${trimmed}`;
}

/**
 * Alle Kreise (für Prüfung/Statistik).
 */
export function getAllKreise(): Array<{ name: string; ags: string; landKey: string }> {
  return KREISE;
}
