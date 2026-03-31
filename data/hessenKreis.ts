/**
 * Hessen: Zuordnung Städte/Gemeinden → amtlicher Kreisname (wie in data/kreise.json).
 * Menü-IDs für votingData / Tabs (ASCII, ohne Umlaute in IDs).
 */

export type HessenKreisMenuId =
  | 'he_darmstadt_stadt'
  | 'he_frankfurt_stadt'
  | 'he_offenbach_stadt'
  | 'he_wiesbaden_stadt'
  | 'he_bergstrasse'
  | 'he_darmstadt_dieburg'
  | 'he_gross_gerau'
  | 'he_hochtaunus'
  | 'he_main_kinzig'
  | 'he_main_taunus'
  | 'he_odenwald'
  | 'he_offenbach_lk'
  | 'he_rheingau_taunus'
  | 'he_wetterau'
  | 'he_giessen_lk'
  | 'he_lahn_dill'
  | 'he_limburg_weilburg'
  | 'he_marburg_biedenkopf'
  | 'he_vogelsberg'
  | 'he_kassel_stadt'
  | 'he_fulda'
  | 'he_hersfeld_rotenburg'
  | 'he_kassel_lk'
  | 'he_schwalm_eder'
  | 'he_waldeck_frankenberg'
  | 'he_werra_meissner';

/** Amtlicher Name in kreise.json → Menü-ID */
const KREIS_NAME_TO_MENU_ID: Record<string, HessenKreisMenuId> = {
  'Darmstadt, Wissenschaftsstadt': 'he_darmstadt_stadt',
  'Frankfurt am Main, Stadt': 'he_frankfurt_stadt',
  'Offenbach am Main, Stadt': 'he_offenbach_stadt',
  'Wiesbaden, Landeshauptstadt': 'he_wiesbaden_stadt',
  Bergstraße: 'he_bergstrasse',
  'Darmstadt-Dieburg': 'he_darmstadt_dieburg',
  'Groß-Gerau': 'he_gross_gerau',
  Hochtaunuskreis: 'he_hochtaunus',
  'Main-Kinzig-Kreis': 'he_main_kinzig',
  'Main-Taunus-Kreis': 'he_main_taunus',
  Odenwaldkreis: 'he_odenwald',
  Offenbach: 'he_offenbach_lk',
  'Rheingau-Taunus-Kreis': 'he_rheingau_taunus',
  Wetteraukreis: 'he_wetterau',
  Gießen: 'he_giessen_lk',
  'Lahn-Dill-Kreis': 'he_lahn_dill',
  'Limburg-Weilburg': 'he_limburg_weilburg',
  'Marburg-Biedenkopf': 'he_marburg_biedenkopf',
  Vogelsbergkreis: 'he_vogelsberg',
  'Kassel, documenta-Stadt': 'he_kassel_stadt',
  Fulda: 'he_fulda',
  'Hersfeld-Rotenburg': 'he_hersfeld_rotenburg',
  Kassel: 'he_kassel_lk',
  'Schwalm-Eder-Kreis': 'he_schwalm_eder',
  'Waldeck-Frankenberg': 'he_waldeck_frankenberg',
  'Werra-Meißner-Kreis': 'he_werra_meissner',
};

/** Menü-ID → exakter Eintrag `name` aus `kreise.json` (für Wahlen/Kalender-Fuzzy). */
export const HESSEN_OFFICIAL_NAME_BY_MENU_ID: Record<HessenKreisMenuId, string> = Object.fromEntries(
  Object.entries(KREIS_NAME_TO_MENU_ID).map(([official, menuId]) => [menuId, official])
) as Record<HessenKreisMenuId, string>;

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Offizieller Kreisname → Menü-ID (exakt wie in kreise.json) */
export function hessenOfficialKreisToMenuId(officialName: string): HessenKreisMenuId {
  const id = KREIS_NAME_TO_MENU_ID[officialName.trim()];
  if (id) return id;
  return hessenCountyToMenuId(officialName);
}

/**
 * Aus einem County-String (Nominatim o. ä.) die Menü-ID für den Kreis-Tab.
 */
export function hessenCountyToMenuId(countyRaw: string): HessenKreisMenuId {
  const n = norm(countyRaw);
  if (!n) return 'he_wetterau';

  for (const [official, id] of Object.entries(KREIS_NAME_TO_MENU_ID)) {
    const on = norm(official);
    const base = on.replace(/\s*,.*$/, '');
    if (n === on || n === base || n.includes(base) || base.includes(n)) return id;
  }

  if (n.includes('frankfurt') && n.includes('main')) return 'he_frankfurt_stadt';
  if (n.includes('wiesbaden')) return 'he_wiesbaden_stadt';
  if (n.includes('darmstadt') && n.includes('wissenschaft')) return 'he_darmstadt_stadt';
  if (n.includes('kassel') && (n.includes('documenta') || n.includes('stadt'))) return 'he_kassel_stadt';
  if (n.includes('offenbach') && n.includes('main')) return 'he_offenbach_stadt';
  if (n.includes('bergstr')) return 'he_bergstrasse';
  if (n.includes('wetterau')) return 'he_wetterau';
  if (n.includes('hochtaunus')) return 'he_hochtaunus';
  if (n.includes('main-taunus')) return 'he_main_taunus';
  if (n.includes('main-kinzig')) return 'he_main_kinzig';
  if (n.includes('rheingau') && n.includes('taunus')) return 'he_rheingau_taunus';
  if (n.includes('odenwald')) return 'he_odenwald';
  if (n.includes('darmstadt') && n.includes('dieburg')) return 'he_darmstadt_dieburg';
  if (n.includes('gross-gerau') || n.includes('groß-gerau')) return 'he_gross_gerau';
  if (n.includes('offenbach') && !n.includes('main')) return 'he_offenbach_lk';
  if (n.includes('giessen') || n.includes('gießen')) return 'he_giessen_lk';
  if (n.includes('lahn-dill')) return 'he_lahn_dill';
  if (n.includes('limburg') && n.includes('weilburg')) return 'he_limburg_weilburg';
  if (n.includes('marburg')) return 'he_marburg_biedenkopf';
  if (n.includes('vogelsberg')) return 'he_vogelsberg';
  if (n.includes('fulda') && !n.includes('rotenburg')) return 'he_fulda';
  if (n.includes('hersfeld') || (n.includes('rotenburg') && n.includes('fulda'))) return 'he_hersfeld_rotenburg';
  if (n.includes('schwalm') && n.includes('eder')) return 'he_schwalm_eder';
  if (n.includes('waldeck') && n.includes('frankenberg')) return 'he_waldeck_frankenberg';
  if (n.includes('werra') && n.includes('meissner')) return 'he_werra_meissner';
  if (n.includes('kassel') && (n.includes('landkreis') || n === 'kassel')) return 'he_kassel_lk';

  return 'he_wetterau';
}

/**
 * Heuristik: Ort + optional PLZ → Kreisname für kreise.json / getKreisDisplayName.
 */
export function inferHessenKreisFromCity(cityInput: string, plz?: string): string | null {
  const city = norm(cityInput);
  const p = (plz || '').trim();

  // PLZ zuerst (wenn kein Widerspruch zu eindeutigen Städten)
  if (p.length >= 3) {
    if (/^685/.test(p)) return 'Bergstraße';
    if (/^603|^604|^605|^65929|^65931|^65933|^65934|^65936/.test(p)) return 'Frankfurt am Main, Stadt';
    if (/^651|^652/.test(p)) return 'Wiesbaden, Landeshauptstadt';
    if (/^63065|^63067|^63069|^63071|^63073|^63075/.test(p)) return 'Offenbach am Main, Stadt';
    if (/^341|^342|^343/.test(p)) return 'Kassel, documenta-Stadt';
    if (/^350/.test(p) && !city) return 'Marburg-Biedenkopf';
    if (/^353/.test(p) && !city) return 'Gießen';
    if (/^360/.test(p) && !city) return 'Fulda';
  }

  if (!city && !p) return null;

  // Kreisfreie Städte
  if (/\bfrankfurt\b/.test(city) && /main/.test(city)) return 'Frankfurt am Main, Stadt';
  if (/\bfrankfurt\b/.test(city) && !/oder\b/.test(city)) return 'Frankfurt am Main, Stadt';
  if (/\bwiesbaden\b/.test(city)) return 'Wiesbaden, Landeshauptstadt';
  if (/\bdarmstadt\b/.test(city)) return 'Darmstadt, Wissenschaftsstadt';
  if (/\bkassel\b/.test(city)) return 'Kassel, documenta-Stadt';
  if (/\boffenbach\b/.test(city) && /main/.test(city)) return 'Offenbach am Main, Stadt';

  if (
    /\bviernheim\b|\blampertheim\b|\bbuerstadt\b|\bbürstadt\b|\blorsch\b|\bbiblis\b|\beinhausen\b|\bheppenheim\b|\bbensheim\b|\bzwingenberg\b|\bhessenheim\b/.test(
      city
    )
  ) {
    return 'Bergstraße';
  }

  if (
    /\bdieburg\b|\bpfungstadt\b|\bweiterstadt\b|\boben-?ramstadt\b|\bbabenhausen\b|\berzhausen\b|\bgriesheim\b|\bseeheim-?jugenheim\b|\bmuehltal\b|\bmodautal\b|\bfischbachtal\b/.test(
      city
    )
  ) {
    return 'Darmstadt-Dieburg';
  }

  if (
    /\brusselsheim\b|\bruesselsheim\b|\bgross-?gerau\b|\bgroß-?gerau\b|\bmoerfelden\b|\bmörfelden\b|\bkelsterbach\b|\btrebur\b|\braunheim\b|\bflorsheim\b|\bstockstadt\b|\bnauheim\b/.test(
      city
    )
  ) {
    return 'Groß-Gerau';
  }

  if (
    /\bbad\s*homburg\b|\boberursel\b|\busingen\b|\bkoenigstein\b|\bkönigstein\b|\bkronberg\b|\bschmitten\b|\bwehrheim\b|\bweilrod\b|\bgruenwald\b|\bgründau\b/.test(
      city
    )
  ) {
    return 'Hochtaunuskreis';
  }

  if (
    /\bhanau\b|\bgelnhausen\b|\bschluechtern\b|\bschlüchtern\b|\bsteinau\b|\bbad\s*orb\b|\blangenselbold\b|\bbruchkoebel\b|\bbruchköbel\b|\bsinntal\b|\bwoelfersheim\b|\bwölfersheim\b|\bneuhof\b/.test(
      city
    )
  ) {
    return 'Main-Kinzig-Kreis';
  }

  if (
    /\bhofheim\b|\bhattersheim\b|\bkriftel\b|\bschwalbach\b|\bliederbach\b|\bkelkheim\b|\berbach\b/.test(city) &&
    !/\bodw\b|\berbach\s*odenwald\b/.test(city)
  ) {
    return 'Main-Taunus-Kreis';
  }

  if (
    /\berbach\b.*odenwald|\bodenwald\b|\bmichelstadt\b|\bbeerfelden\b|\bbreuberg\b|\bbrombach\b|\bbuchen\b|\bfuerth\b|\bfürth\b|\berbach\b\s*\(odenwald\)/.test(
      city
    )
  ) {
    return 'Odenwaldkreis';
  }

  if (
    /\bdietzenbach\b|\bheusenstamm\b|\brodgau\b|\bmuhlheim\b|\bmühlheim\b|\bobertshausen\b|\bseligenstadt\b|\bmainhausen\b|\bneu-?isenburg\b/.test(
      city
    )
  ) {
    // Neu-Isenburg: Kreis Offenbach; „Obertshausen“ auch im Lk Offenbach
    if (/\bneu-?isenburg\b/.test(city)) return 'Offenbach';
    if (/\bobertshausen\b/.test(city) && !/darmstadt/i.test(cityInput)) return 'Offenbach';
    if (/\bdietzenbach\b|\bheusenstamm\b|\brodgau\b|\bmuhlheim\b|\bmühlheim\b|\bseligenstadt\b|\bmainhausen\b/.test(city))
      return 'Offenbach';
  }

  if (
    /\bidstein\b|\bbad\s*schwalbach\b|\beltville\b|\bgeisenheim\b|\boestrich\b|\bruedesheim\b|\brüdesheim\b|\bingelheim\b|\bwalluf\b|\bwiesbaden\b/.test(
      city
    )
  ) {
    if (/\bwiesbaden\b/.test(city)) return 'Wiesbaden, Landeshauptstadt';
    return 'Rheingau-Taunus-Kreis';
  }

  if (
    /\bfriedberg\b|\bbad\s*vilbel\b|\bbuedingen\b|\bbüdingen\b|\bbutzbach\b|\bflorstadt\b|\bnidda\b|\brockenberg\b|\bhirzenhain\b|\blimeshain\b|\bmuenzenberg\b|\bmünzenberg\b|\breichelsheim\b|\bwölfersheim\b|\bwoelfersheim\b/.test(
      city
    )
  ) {
    if (/\bfriedberg\b/.test(city) && /bayern|bavaria/.test(cityInput.toLowerCase())) {
      /* Friedberg in Bayern */
    } else {
      return 'Wetteraukreis';
    }
  }

  if (
    /\blimburg\b|\bweilburg\b|\bbad\s*camberg\b|\brunkel\b|\bduenzburg\b|\bdünzburg\b|\bweilmünster\b|\bweilmuenster\b/.test(city)
  ) {
    return 'Limburg-Weilburg';
  }

  if (/\bgiessen\b|\bgießen\b|\blollar\b|\bleihgestern\b/.test(city)) {
    return 'Gießen';
  }

  if (
    /\bwetzlar\b|\bherborn\b|\bdillenburg\b|\bhaiger\b|\blaubach\b|\brennerod\b|\bsiegbach\b|\bbreitscheid\b|\bhohenahr\b|\bwaldsolms\b/.test(
      city
    )
  ) {
    return 'Lahn-Dill-Kreis';
  }

  if (
    /\bmarburg\b|\bbiedenkopf\b|\bgladenbach\b|\bkirchhain\b|\bstadtallendorf\b|\bamoneburg\b|\bamöneburg\b|\bwetter\b.*hess|\brosenthal\b/.test(
      city
    )
  ) {
    return 'Marburg-Biedenkopf';
  }

  if (/\blauterbach\b|\bschotten\b|\bherbstein\b|\bulrichstein\b|\bantrifttal\b|\bfeldatal\b|\bmuenchsteinbach\b/.test(city)) {
    return 'Vogelsbergkreis';
  }

  if (/\bfulda\b/.test(city)) return 'Fulda';

  if (/\bbad\s*hersfeld\b|\brotenburg\b.*fulda|\bbebra\b|\bcornberg\b|\bhauneck\b|\bnentershausen\b|\bschenklengsfeld\b/.test(city)) {
    return 'Hersfeld-Rotenburg';
  }

  if (
    /\bschwalmstadt\b|\bfritzlar\b|\bhomberg\b.*ef|\bmelsungen\b|\bspangenberg\b|\bfelsberg\b|\bguxhagen\b|\bknuellwald\b|\bneuental\b|\bzierenberg\b/.test(
      city
    )
  ) {
    return 'Schwalm-Eder-Kreis';
  }

  if (
    /\bbaunatal\b|\bfuldatal\b|\bniedenstein\b|\bschoengeising\b|\bsöhrewald\b|\bzierenberg\b|\bgrebenstein\b|\bhabichtswald\b/.test(
      city
    )
  ) {
    return 'Kassel';
  }

  if (
    /\bkorbach\b|\bfrankenberg\b.*eder|\bwaldeck\b|\bedertal\b|\bdiemelsee\b|\bvolkmarsen\b|\bwillingen\b|\bbattenberg\b/.test(
      city
    )
  ) {
    return 'Waldeck-Frankenberg';
  }

  if (/\beschwege\b|\bwitzenhausen\b|\bsontra\b|\bherleshausen\b|\bmeinhard\b|\bwehretal\b|\bgrossalmerode\b|\bgroßalmerode\b/.test(city)) {
    return 'Werra-Meißner-Kreis';
  }

  if (p.length >= 5) {
    if (/^630/.test(p) && !/^63065|^63067|^63069|^63071|^63073|^63075/.test(p)) return 'Offenbach';
    if (/^631|^632|^633|^634|^635|^636|^637/.test(p)) return 'Main-Kinzig-Kreis';
    if (/^657/.test(p)) return 'Main-Taunus-Kreis';
    if (/^654|^653/.test(p)) return 'Rheingau-Taunus-Kreis';
  }

  return null;
}

/** Anzeige-/Merge-Label für `mergeCommunalVotes2026` pro Kreis-Tab */
export const HESSEN_KREIS_MENU_LABELS: Record<HessenKreisMenuId, string> = {
  he_darmstadt_stadt: 'Darmstadt',
  he_frankfurt_stadt: 'Frankfurt am Main',
  he_offenbach_stadt: 'Offenbach am Main',
  he_wiesbaden_stadt: 'Wiesbaden',
  he_bergstrasse: 'Kreis Bergstraße',
  he_darmstadt_dieburg: 'Kreis Darmstadt-Dieburg',
  he_gross_gerau: 'Kreis Groß-Gerau',
  he_hochtaunus: 'Hochtaunuskreis',
  he_main_kinzig: 'Main-Kinzig-Kreis',
  he_main_taunus: 'Main-Taunus-Kreis',
  he_odenwald: 'Odenwaldkreis',
  he_offenbach_lk: 'Landkreis Offenbach',
  he_rheingau_taunus: 'Rheingau-Taunus-Kreis',
  he_wetterau: 'Wetteraukreis',
  he_giessen_lk: 'Landkreis Gießen',
  he_lahn_dill: 'Lahn-Dill-Kreis',
  he_limburg_weilburg: 'Limburg-Weilburg',
  he_marburg_biedenkopf: 'Marburg-Biedenkopf',
  he_vogelsberg: 'Vogelsbergkreis',
  he_kassel_stadt: 'Kassel',
  he_fulda: 'Landkreis Fulda',
  he_hersfeld_rotenburg: 'Hersfeld-Rotenburg',
  he_kassel_lk: 'Landkreis Kassel',
  he_schwalm_eder: 'Schwalm-Eder-Kreis',
  he_waldeck_frankenberg: 'Waldeck-Frankenberg',
  he_werra_meissner: 'Werra-Meißner-Kreis',
};

/** IDs mit Abstimmungsdaten für Kalender-Aggregation */
export const HESSEN_CALENDAR_LOCATION_IDS: readonly string[] = [
  'hessen',
  ...Object.keys(HESSEN_KREIS_MENU_LABELS),
  'wiesbaden',
  'kassel',
  'darmstadt',
  'offenbach',
  'hanau',
  'marburg',
  'fulda',
  'giessen',
  'wetzlar',
  'limburg',
  'ruesselsheim',
  'rodgau',
  'oberursel',
  'bad_homburg',
  'lampertheim',
  'buerstadt',
  'lorsch',
  'heppenheim',
  'bensheim',
];
