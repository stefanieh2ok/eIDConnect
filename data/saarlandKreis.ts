/**
 * Saarland: Zuordnung Städte/Gemeinden → amtlicher Kreisname (wie in data/kreise.json).
 * Menü-IDs für votingData / Tabs (ohne Umlaute in IDs).
 */

export type SaarlandKreisMenuId =
  | 'rv_saarbruecken'
  | 'merzig_wadern'
  | 'neunkirchen'
  | 'saarlouis'
  | 'saarpfalz'
  | 'st_wendel';

/** Amtlicher Name in kreise.json → interne Menü-ID */
const KREIS_NAME_TO_MENU_ID: Record<string, SaarlandKreisMenuId> = {
  'Regionalverband Saarbrücken': 'rv_saarbruecken',
  'Merzig-Wadern': 'merzig_wadern',
  Neunkirchen: 'neunkirchen',
  Saarlouis: 'saarlouis',
  'Saarpfalz-Kreis': 'saarpfalz',
  'St. Wendel': 'st_wendel',
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Aus einem County-String (Nominatim o. ä.) die Menü-ID für den Kreis-Tab.
 */
export function saarlandCountyToMenuId(countyRaw: string): SaarlandKreisMenuId {
  const n = norm(countyRaw);
  if (n.includes('saarpfalz') || n.includes('saar-pfalz')) return 'saarpfalz';
  if (n.includes('neunkirchen') && !n.includes('stadt')) return 'neunkirchen';
  if (n.includes('neunkirchen') && n.includes('landkreis')) return 'neunkirchen';
  if (n.includes('saarlouis')) return 'saarlouis';
  if (n.includes('merzig') || n.includes('wadern')) return 'merzig_wadern';
  if (n.includes('wendel')) return 'st_wendel';
  if (n.includes('saarbrücken') || n.includes('saarbruecken') || n.includes('regionalverband')) return 'rv_saarbruecken';
  for (const [official, id] of Object.entries(KREIS_NAME_TO_MENU_ID)) {
    if (norm(official) === n || n.includes(norm(official.replace(/-/g, ' ')))) return id;
  }
  return 'saarpfalz';
}

/**
 * Heuristik: Ortsname (klein) → Kreisname für kreise.json / getKreisDisplayName.
 */
export function inferSaarlandKreisFromCity(cityInput: string): string | null {
  /** Nach norm(): Umlaute → Basisbuchstaben (z. B. Saarbrücken → saarbrucken) */
  const city = norm(cityInput);
  if (!city) return null;

  // Regionalverband Saarbrücken
  if (
    /\bsaarbrucken\b|\bvolklingen\b|\bfriedrichsthal\b|\bkleinblittersdorf\b|\bputtlingen\b|\bquierschied\b|\briegelsberg\b|\bsulzbach\b/.test(
      city
    )
  ) {
    return 'Regionalverband Saarbrücken';
  }

  // Saarpfalz-Kreis
  if (
    /\bhomburg\b|\bblieskastel\b|\bgersheim\b|\bkirkel\b|\bmandelbachtal\b|\bst\.?\s*ingbert\b|\bsankt\s*ingbert\b|\bbexbach\b/.test(
      city
    )
  ) {
    return 'Saarpfalz-Kreis';
  }

  // Landkreis Neunkirchen (Stadt Neunkirchen liegt hier)
  if (
    /\bneunkirchen\b|\beppelborn\b|\billingen\b|\bmerchweiler\b|\bottweiler\b|\bschiffweiler\b|\bspiesen-elversberg\b|\bspiesen\b/.test(
      city
    )
  ) {
    return 'Neunkirchen';
  }

  // Landkreis Saarlouis
  if (
    /\bsaarlouis\b|\bbous\b|\bdillingen\b|\bensdorf\b|\blebach\b|\bnalbach\b|\brehlingen\b|\bschmelz\b|\bschwalbach\b|\buberherrn\b|\bwadgassen\b|\bwallerfangen\b/.test(
      city
    )
  ) {
    return 'Saarlouis';
  }

  // Landkreis Merzig-Wadern
  if (
    /\bmerzig\b|\bbeckingen\b|\blosheim\b|\bmettlach\b|\bperl\b|\bweiskirchen\b|\bwadern\b/.test(city)
  ) {
    return 'Merzig-Wadern';
  }

  // Landkreis St. Wendel
  if (
    /\bst\.?\s*wendel\b|\bsankt\s*wendel\b|\bfreisen\b|\bmarpingen\b|\bnohfelden\b|\boberthal\b|\btholey\b/.test(
      city
    )
  ) {
    return 'St. Wendel';
  }

  return null;
}
