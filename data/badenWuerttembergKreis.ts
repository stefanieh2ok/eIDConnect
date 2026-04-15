/**
 * Baden-Württemberg: Städte/Gemeinden → amtlicher Kreisname (data/kreise.json).
 * Menü-IDs `bw_*` (ASCII).
 */

export type BadenWuerttembergKreisMenuId =
  | 'bw_stuttgart_stadt'
  | 'bw_boeblingen'
  | 'bw_esslingen'
  | 'bw_goeppingen'
  | 'bw_ludwigsburg'
  | 'bw_rems_murr'
  | 'bw_heilbronn_stadt'
  | 'bw_heilbronn_lk'
  | 'bw_hohenlohe'
  | 'bw_schwaebisch_hall'
  | 'bw_main_tauber'
  | 'bw_heidenheim'
  | 'bw_ostalb'
  | 'bw_baden_baden_stadt'
  | 'bw_karlsruhe_stadt'
  | 'bw_karlsruhe_lk'
  | 'bw_rastatt'
  | 'bw_heidelberg_stadt'
  | 'bw_mannheim_stadt'
  | 'bw_neckar_odenwald'
  | 'bw_rhein_neckar'
  | 'bw_pforzheim_stadt'
  | 'bw_calw'
  | 'bw_enzkreis'
  | 'bw_freudenstadt'
  | 'bw_freiburg_stadt'
  | 'bw_breisgau_hochschwarzwald'
  | 'bw_emmendingen'
  | 'bw_ortenaukreis'
  | 'bw_rottweil'
  | 'bw_schwarzwald_baar'
  | 'bw_tuttlingen'
  | 'bw_konstanz'
  | 'bw_loerrach'
  | 'bw_waldshut'
  | 'bw_reutlingen'
  | 'bw_tuebingen'
  | 'bw_zollernalb'
  | 'bw_ulm_stadt'
  | 'bw_alb_donau'
  | 'bw_biberach'
  | 'bw_bodenseekreis'
  | 'bw_ravensburg'
  | 'bw_sigmaringen';

const KREIS_NAME_TO_MENU_ID: Record<string, BadenWuerttembergKreisMenuId> = {
  'Stuttgart, Stadtkreis': 'bw_stuttgart_stadt',
  Böblingen: 'bw_boeblingen',
  Esslingen: 'bw_esslingen',
  Göppingen: 'bw_goeppingen',
  Ludwigsburg: 'bw_ludwigsburg',
  'Rems-Murr-Kreis': 'bw_rems_murr',
  'Heilbronn, Stadtkreis': 'bw_heilbronn_stadt',
  Heilbronn: 'bw_heilbronn_lk',
  Hohenlohekreis: 'bw_hohenlohe',
  'Schwäbisch Hall': 'bw_schwaebisch_hall',
  'Main-Tauber-Kreis': 'bw_main_tauber',
  Heidenheim: 'bw_heidenheim',
  Ostalbkreis: 'bw_ostalb',
  'Baden-Baden, Stadtkreis': 'bw_baden_baden_stadt',
  'Karlsruhe, Stadtkreis': 'bw_karlsruhe_stadt',
  Karlsruhe: 'bw_karlsruhe_lk',
  Rastatt: 'bw_rastatt',
  'Heidelberg, Stadtkreis': 'bw_heidelberg_stadt',
  'Mannheim, Stadtkreis': 'bw_mannheim_stadt',
  'Neckar-Odenwald-Kreis': 'bw_neckar_odenwald',
  'Rhein-Neckar-Kreis': 'bw_rhein_neckar',
  'Pforzheim, Stadtkreis': 'bw_pforzheim_stadt',
  Calw: 'bw_calw',
  Enzkreis: 'bw_enzkreis',
  Freudenstadt: 'bw_freudenstadt',
  'Freiburg im Breisgau, Stadtkreis': 'bw_freiburg_stadt',
  'Breisgau-Hochschwarzwald': 'bw_breisgau_hochschwarzwald',
  Emmendingen: 'bw_emmendingen',
  Ortenaukreis: 'bw_ortenaukreis',
  Rottweil: 'bw_rottweil',
  'Schwarzwald-Baar-Kreis': 'bw_schwarzwald_baar',
  Tuttlingen: 'bw_tuttlingen',
  Konstanz: 'bw_konstanz',
  Lörrach: 'bw_loerrach',
  Waldshut: 'bw_waldshut',
  Reutlingen: 'bw_reutlingen',
  Tübingen: 'bw_tuebingen',
  Zollernalbkreis: 'bw_zollernalb',
  'Ulm, Stadtkreis': 'bw_ulm_stadt',
  'Alb-Donau-Kreis': 'bw_alb_donau',
  Biberach: 'bw_biberach',
  Bodenseekreis: 'bw_bodenseekreis',
  Ravensburg: 'bw_ravensburg',
  Sigmaringen: 'bw_sigmaringen',
};

/** Menü-ID → exakter Eintrag `name` aus `kreise.json` (für Wahlen/Kalender-Fuzzy). */
export const BW_OFFICIAL_NAME_BY_MENU_ID: Record<BadenWuerttembergKreisMenuId, string> = Object.fromEntries(
  Object.entries(KREIS_NAME_TO_MENU_ID).map(([official, menuId]) => [menuId, official])
) as Record<BadenWuerttembergKreisMenuId, string>;

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .trim();
}

export function bwOfficialKreisToMenuId(officialName: string): BadenWuerttembergKreisMenuId {
  const id = KREIS_NAME_TO_MENU_ID[officialName.trim()];
  if (id) return id;
  return bwCountyToMenuId(officialName);
}

export function bwCountyToMenuId(countyRaw: string): BadenWuerttembergKreisMenuId {
  const n = norm(countyRaw);
  if (!n) return 'bw_stuttgart_stadt';

  for (const [official, id] of Object.entries(KREIS_NAME_TO_MENU_ID)) {
    const on = norm(official);
    const base = on.replace(/\s*,.*$/, '');
    if (n === on || n === base || n.includes(base) || base.includes(n)) return id;
  }

  if (n.includes('stuttgart') && n.includes('stadtkreis')) return 'bw_stuttgart_stadt';
  if (n.includes('karlsruhe') && (n.includes('stadtkreis') || /\bstadt\b/.test(n))) return 'bw_karlsruhe_stadt';
  if (n.includes('karlsruhe')) return 'bw_karlsruhe_lk';
  if (n.includes('heidelberg')) return 'bw_heidelberg_stadt';
  if (n.includes('mannheim')) return 'bw_mannheim_stadt';
  if (n.includes('freiburg')) return 'bw_freiburg_stadt';
  if (n.includes('heilbronn') && n.includes('stadt')) return 'bw_heilbronn_stadt';
  if (n.includes('heilbronn')) return 'bw_heilbronn_lk';
  if (n.includes('pforzheim')) return 'bw_pforzheim_stadt';
  if (n.includes('ulm') && (n.includes('stadt') || n.includes('stadtkreis'))) return 'bw_ulm_stadt';
  if (n.includes('baden-baden') || /baden.*baden/.test(n)) return 'bw_baden_baden_stadt';
  if (n.includes('rhein') && n.includes('neckar') && n.includes('kreis')) return 'bw_rhein_neckar';
  if (n.includes('rems') && n.includes('murr')) return 'bw_rems_murr';
  if (n.includes('neckar') && n.includes('odenwald')) return 'bw_neckar_odenwald';
  if (n.includes('breisgau')) return 'bw_breisgau_hochschwarzwald';
  if (n.includes('schwarzwald') && n.includes('baar')) return 'bw_schwarzwald_baar';
  if (n.includes('main') && n.includes('tauber')) return 'bw_main_tauber';
  if (n.includes('alb') && n.includes('donau')) return 'bw_alb_donau';
  if (n.includes('zollernalb')) return 'bw_zollernalb';
  if (n.includes('schwabisch') && n.includes('hall')) return 'bw_schwaebisch_hall';
  if (n.includes('ortenau')) return 'bw_ortenaukreis';
  if (n.includes('hohenlohe')) return 'bw_hohenlohe';
  if (n.includes('ostalb')) return 'bw_ostalb';
  if (n.includes('enzkreis') || n === 'enz') return 'bw_enzkreis';
  if (n.includes('boblingen') || n.includes('böblingen')) return 'bw_boeblingen';
  if (n.includes('goeppingen') || n.includes('goppingen')) return 'bw_goeppingen';
  if (n.includes('ludwigsburg')) return 'bw_ludwigsburg';
  if (n.includes('esslingen')) return 'bw_esslingen';
  if (n.includes('rastatt')) return 'bw_rastatt';
  if (n.includes('calw')) return 'bw_calw';
  if (n.includes('freudenstadt')) return 'bw_freudenstadt';
  if (n.includes('emmendingen')) return 'bw_emmendingen';
  if (n.includes('rottweil')) return 'bw_rottweil';
  if (n.includes('tuttlingen')) return 'bw_tuttlingen';
  if (n.includes('konstanz')) return 'bw_konstanz';
  if (n.includes('lorrach') || n.includes('lörrach')) return 'bw_loerrach';
  if (n.includes('waldshut')) return 'bw_waldshut';
  if (n.includes('reutlingen')) return 'bw_reutlingen';
  if (n.includes('tubingen') || n.includes('tübingen')) return 'bw_tuebingen';
  if (n.includes('heidenheim')) return 'bw_heidenheim';
  if (n.includes('biberach')) return 'bw_biberach';
  if (n.includes('bodensee')) return 'bw_bodenseekreis';
  if (n.includes('ravensburg')) return 'bw_ravensburg';
  if (n.includes('sigmaringen')) return 'bw_sigmaringen';

  return 'bw_stuttgart_stadt';
}

/**
 * Heuristik: Ort + optional PLZ → Kreisname für kreise.json.
 */
export function inferBadenWuerttembergKreisFromCity(cityInput: string, plz?: string): string | null {
  const city = norm(cityInput);
  const p = (plz || '').trim();

  if (p.length >= 3) {
    if (/^681|^682|^683|^684/.test(p)) return 'Mannheim, Stadtkreis';
    if (/^691/.test(p)) return 'Heidelberg, Stadtkreis';
    if (/^694/.test(p)) return 'Rhein-Neckar-Kreis';
    if (/^701|^703|^704|^705|^706/.test(p)) return 'Stuttgart, Stadtkreis';
    if (/^761|^762|^763|^764/.test(p)) return 'Karlsruhe, Stadtkreis';
    if (/^79098|^791/.test(p)) return 'Freiburg im Breisgau, Stadtkreis';
    if (/^89073|^89081/.test(p)) return 'Ulm, Stadtkreis';
    if (/^751/.test(p)) return 'Pforzheim, Stadtkreis';
    if (/^74072|^74076|^74078|^74080|^74081/.test(p)) return 'Heilbronn, Stadtkreis';
    if (/^76530|^76532|^76534/.test(p)) return 'Baden-Baden, Stadtkreis';
  }

  if (!city && !p) return null;

  if (/\bstuttgart\b/.test(city)) return 'Stuttgart, Stadtkreis';
  if (/\bkarlsruhe\b/.test(city)) return 'Karlsruhe, Stadtkreis';
  if (/\bfreiburg\b/.test(city)) return 'Freiburg im Breisgau, Stadtkreis';
  if (/\bheidelberg\b/.test(city)) return 'Heidelberg, Stadtkreis';
  if (/\bmannheim\b/.test(city)) return 'Mannheim, Stadtkreis';
  if (/\bheilbronn\b/.test(city)) return 'Heilbronn, Stadtkreis';
  if (/\bulm\b/.test(city)) return 'Ulm, Stadtkreis';
  if (/\bpforzheim\b/.test(city)) return 'Pforzheim, Stadtkreis';
  if (/\bbaden-?baden\b/.test(city)) return 'Baden-Baden, Stadtkreis';

  if (
    /\bweinheim\b|\bleimen\b|\bwiesloch\b|\bschriesheim\b|\bwalldorf\b|\bsandhausen\b|\bmeckesheim\b|\bneckargemuend\b|\bneckargemünd\b|\bhirschberg\b|\bwilhelmsfeld\b/.test(
      city
    )
  ) {
    return 'Rhein-Neckar-Kreis';
  }
  if (/\btubingen\b|\btübingen\b/.test(city)) return 'Tübingen';
  if (/\breutlingen\b/.test(city)) return 'Reutlingen';
  if (/\besslingen\b/.test(city)) return 'Esslingen';
  if (/\bgoeppingen\b|\bgoppingen\b/.test(city)) return 'Göppingen';
  if (/\bludwigsburg\b/.test(city)) return 'Ludwigsburg';
  if (/\bboblingen\b|\bböblingen\b|\bsindelfingen\b|\bholzgerlingen\b|\bsteinenbronn\b/.test(city)) return 'Böblingen';
  if (/\bwaiblingen\b|\bweinstadt\b|\bbacknang\b|\bkernen\b|\bremshalden\b|\bschorndorf\b/.test(city)) return 'Rems-Murr-Kreis';
  if (/\baalen\b|\bheubach\b|\brosenberg\b|\bwesthausen\b/.test(city)) return 'Ostalbkreis';
  if (/\bschwabisch\s*hall\b|\bschwäbisch\s*hall\b|\bcrailsheim\b|\bgaildorf\b/.test(city)) return 'Schwäbisch Hall';
  if (/\bheidenheim\b|\bgiengen\b/.test(city)) return 'Heidenheim';
  if (/\btauberbischofsheim\b|\bwertheim\b|\bkünzelsau\b|\bkunzelsau\b/.test(city)) return 'Main-Tauber-Kreis';
  if (/\böhringen\b|\boehringen\b|\bforchtenberg\b|\bkünzelsau\b/.test(city)) return 'Hohenlohekreis';
  if (/\brastatt\b|\bgaggenau\b|\bettlingen\b/.test(city)) return 'Rastatt';
  if (/\bbruchsal\b|\bettlingen\b|\bkraichtal\b|\bstutensee\b/.test(city) && !/karlsruhe/.test(city)) return 'Karlsruhe';
  if (/\bewingel\b|\bmosbach\b|\bneckargerach\b/.test(city)) return 'Neckar-Odenwald-Kreis';
  if (/\bnagold\b|\bbad\s*liebenzell\b|\bwildberg\b/.test(city)) return 'Calw';
  if (/\bmuhlacker\b|\bneuenstadt\b|\bwiernsheim\b/.test(city)) return 'Enzkreis';
  if (/\bhorb\b|\baltensteig\b|\bfreudenstadt\b/.test(city)) return 'Freudenstadt';
  if (/\bemmendingen\b|\bkenzingen\b|\bherbolzheim\b/.test(city)) return 'Emmendingen';
  if (/\boffenburg\b|\bkehl\b|\blahr\b|\boberkirch\b|\bhausach\b/.test(city)) return 'Ortenaukreis';
  if (/\bschramberg\b|\bspiegelberg\b/.test(city)) return 'Rottweil';
  if (/\bvillingen\b|\bschwenningen\b|\bdonaueschingen\b|\bfurtwangen\b/.test(city)) return 'Schwarzwald-Baar-Kreis';
  if (/\bsprengen\b|\bmühlheim\b|\btuttlingen\b/.test(city)) return 'Tuttlingen';
  if (/\bkonstanz\b|\bkreuzlingen\b|\bdingelsdorf\b/.test(city)) return 'Konstanz';
  if (/\blorrach\b|\bweil\b.*rhein|\bschopfheim\b/.test(city)) return 'Lörrach';
  if (/\bwaldshut\b|\btiengen\b|\bjestetten\b/.test(city)) return 'Waldshut';
  if (/\bmetzingen\b|\bpfullingen\b|\behingen\b/.test(city)) return 'Reutlingen';
  if (/\bherrenberg\b|\bmessstetten\b|\bbalingen\b/.test(city)) return 'Zollernalbkreis';
  if (/\berbach\b|\blaichingen\b|\bblaustein\b/.test(city)) return 'Alb-Donau-Kreis';
  if (/\bbiberach\b|\briss\b|\briedlingen\b/.test(city)) return 'Biberach';
  if (/\bfriedrichshafen\b|\bravensburg\b|\bweingarten\b|\bmarkdorf\b/.test(city)) return 'Bodenseekreis';
  if (/\bwangen\b|\bisle\b/.test(city) && /im\s*allgau|allgäu/.test(city)) return 'Ravensburg';
  if (/\bsigmaringen\b|\bmengen\b|\bhetzlingen\b/.test(city)) return 'Sigmaringen';
  if (/\bstockach\b|\bradolfzell\b/.test(city)) return 'Konstanz';

  if (p.length >= 5) {
    if (/^710|^711|^712/.test(p)) return 'Böblingen';
    if (/^713|^714|^715/.test(p)) return 'Esslingen';
    if (/^716|^717|^718/.test(p)) return 'Ludwigsburg';
    if (/^730|^731|^732|^733|^734|^735|^736/.test(p)) return 'Göppingen';
    if (/^740|^741|^742|^743|^744/.test(p) && !/^7407/.test(p)) return 'Heilbronn';
    if (/^745|^746|^747|^748|^749/.test(p)) return 'Schwäbisch Hall';
    if (/^750|^752|^753|^754/.test(p)) return 'Karlsruhe';
    if (/^755|^756|^757|^758|^759/.test(p)) return 'Rastatt';
    if (/^760|^761|^762|^763|^764|^765|^766|^767/.test(p)) {
      if (/^761|^762/.test(p)) return 'Karlsruhe, Stadtkreis';
      if (/^763|^764|^765|^766|^767/.test(p)) return 'Karlsruhe';
    }
    if (/^776|^777|^778|^779/.test(p)) return 'Ortenaukreis';
    if (/^780|^781|^782|^783/.test(p)) return 'Schwarzwald-Baar-Kreis';
    if (/^785|^786/.test(p)) return 'Tuttlingen';
    if (/^787|^798/.test(p)) return 'Schwarzwald-Baar-Kreis';
    if (/^880|^886|^887/.test(p)) return 'Bodenseekreis';
    if (/^883|^884/.test(p)) return 'Ravensburg';
  }

  return null;
}

export const BW_KREIS_MENU_LABELS: Record<BadenWuerttembergKreisMenuId, string> = {
  bw_stuttgart_stadt: 'Stuttgart',
  bw_boeblingen: 'Landkreis Böblingen',
  bw_esslingen: 'Landkreis Esslingen',
  bw_goeppingen: 'Landkreis Göppingen',
  bw_ludwigsburg: 'Landkreis Ludwigsburg',
  bw_rems_murr: 'Rems-Murr-Kreis',
  bw_heilbronn_stadt: 'Heilbronn',
  bw_heilbronn_lk: 'Landkreis Heilbronn',
  bw_hohenlohe: 'Hohenlohekreis',
  bw_schwaebisch_hall: 'Schwäbisch Hall',
  bw_main_tauber: 'Main-Tauber-Kreis',
  bw_heidenheim: 'Landkreis Heidenheim',
  bw_ostalb: 'Ostalbkreis',
  bw_baden_baden_stadt: 'Baden-Baden',
  bw_karlsruhe_stadt: 'Karlsruhe',
  bw_karlsruhe_lk: 'Landkreis Karlsruhe',
  bw_rastatt: 'Landkreis Rastatt',
  bw_heidelberg_stadt: 'Heidelberg',
  bw_mannheim_stadt: 'Mannheim',
  bw_neckar_odenwald: 'Neckar-Odenwald-Kreis',
  bw_rhein_neckar: 'Rhein-Neckar-Kreis',
  bw_pforzheim_stadt: 'Pforzheim',
  bw_calw: 'Landkreis Calw',
  bw_enzkreis: 'Enzkreis',
  bw_freudenstadt: 'Landkreis Freudenstadt',
  bw_freiburg_stadt: 'Freiburg',
  bw_breisgau_hochschwarzwald: 'Breisgau-Hochschwarzwald',
  bw_emmendingen: 'Landkreis Emmendingen',
  bw_ortenaukreis: 'Ortenaukreis',
  bw_rottweil: 'Landkreis Rottweil',
  bw_schwarzwald_baar: 'Schwarzwald-Baar-Kreis',
  bw_tuttlingen: 'Landkreis Tuttlingen',
  bw_konstanz: 'Landkreis Konstanz',
  bw_loerrach: 'Landkreis Lörrach',
  bw_waldshut: 'Landkreis Waldshut',
  bw_reutlingen: 'Landkreis Reutlingen',
  bw_tuebingen: 'Landkreis Tübingen',
  bw_zollernalb: 'Zollernalbkreis',
  bw_ulm_stadt: 'Ulm',
  bw_alb_donau: 'Alb-Donau-Kreis',
  bw_biberach: 'Landkreis Biberach',
  bw_bodenseekreis: 'Bodenseekreis',
  bw_ravensburg: 'Landkreis Ravensburg',
  bw_sigmaringen: 'Landkreis Sigmaringen',
};

export const BW_CALENDAR_LOCATION_IDS: readonly string[] = [
  'baden-wuerttemberg',
  ...Object.keys(BW_KREIS_MENU_LABELS),
  'stuttgart',
  'karlsruhe',
  'freiburg',
  'heilbronn',
  'ulm',
  'pforzheim',
  'baden_baden',
  'reutlingen',
  'tubingen',
  'esslingen',
  'ludwigsburg',
  'heidelberg',
  'mannheim',
  'weinheim',
];
