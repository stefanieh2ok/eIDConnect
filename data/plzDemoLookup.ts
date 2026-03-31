/**
 * Demo: PLZ → vorgeschlagener Ort und App-Standort.
 * Kein vollständiges Postleitzahlenverzeichnis – Abdeckung der Demo-Regionen und häufiger Test-PLZ.
 *
 * Ohne API: Grob-Region über PLZ-Anfang (DE-Systematik) + Ortsnamen-Heuristik + `deutschland`
 * statt `bundesweit`, sobald eine gültige fünfstellige PLZ erkennbar ist.
 */

import type { Location } from '@/types';
import { inferCountyIfMissing } from '@/data/countyInference';
import { inferSaarlandKreisFromCity } from '@/data/saarlandKreis';

export function normalizePlz(input: string): string {
  return input.replace(/\D/g, '').slice(0, 5);
}

/** Exakte PLZ → amtlicher Ortsname (Auswahl für die Demo) */
const PLZ_EXACT_CITY: Record<string, string> = {
  '66459': 'Kirkel',
  '66424': 'Homburg',
  '66440': 'Blieskastel',
  '66386': 'St. Ingbert',
  '66409': 'Bexbach',
  '66280': 'Sulzbach/Saar',
  '66111': 'Saarbrücken',
  '66113': 'Saarbrücken',
  '66115': 'Saarbrücken',
  '66117': 'Saarbrücken',
  '68159': 'Mannheim',
  '68161': 'Mannheim',
  '68163': 'Mannheim',
  '68165': 'Mannheim',
  '68167': 'Mannheim',
  '68169': 'Mannheim',
  '68219': 'Mannheim',
  '68229': 'Mannheim',
  '68239': 'Mannheim',
  '60311': 'Frankfurt am Main',
  '60313': 'Frankfurt am Main',
  '60314': 'Frankfurt am Main',
  '60316': 'Frankfurt am Main',
  '60318': 'Frankfurt am Main',
  '60431': 'Frankfurt am Main',
  '60435': 'Frankfurt am Main',
  '60437': 'Frankfurt am Main',
  '60438': 'Frankfurt am Main',
  '60439': 'Frankfurt am Main',
  '60486': 'Frankfurt am Main',
  '60488': 'Frankfurt am Main',
  '60489': 'Frankfurt am Main',
  '69469': 'Weinheim',
  '69115': 'Heidelberg',
  '69117': 'Heidelberg',
  '69121': 'Heidelberg',
  '69123': 'Heidelberg',
  '69124': 'Heidelberg',
  '68519': 'Viernheim',
  '67433': 'Neustadt an der Weinstraße',
  '67434': 'Neustadt an der Weinstraße',
  '67435': 'Neustadt an der Weinstraße',
  '10115': 'Berlin',
  '10117': 'Berlin',
  '28195': 'Bremen',
  '80331': 'München',
  '80333': 'München',
  '80335': 'München',
  '80336': 'München',
  '80337': 'München',
  '80339': 'München',
  '85521': 'Ottobrunn',
  '70173': 'Stuttgart',
  '20095': 'Hamburg',
  '50667': 'Köln',
  '40213': 'Düsseldorf',
  '44135': 'Dortmund',
  '04109': 'Leipzig',
  '01067': 'Dresden',
  '30159': 'Hannover',
  '90402': 'Nürnberg',
  '93047': 'Regensburg',
  '86150': 'Augsburg',
  '23552': 'Lübeck',
  '18055': 'Rostock',
  '20099': 'Hamburg',
  '50668': 'Köln',
  '45127': 'Essen',
  '53111': 'Bonn',
  '76131': 'Karlsruhe',
  '79098': 'Freiburg im Breisgau',
  '89073': 'Ulm',
  '99084': 'Erfurt',
};

/** Längster passender Präfix (3–4 Stellen) → Vorschlagsort, wenn keine exakte PLZ */
const PLZ_PREFIX_CITY: { prefix: string; city: string }[] = [
  { prefix: '66459', city: 'Kirkel' },
  { prefix: '681', city: 'Mannheim' },
  { prefix: '682', city: 'Mannheim' },
  { prefix: '683', city: 'Mannheim' },
  { prefix: '604', city: 'Frankfurt am Main' },
  { prefix: '603', city: 'Frankfurt am Main' },
  { prefix: '605', city: 'Frankfurt am Main' },
  { prefix: '659', city: 'Frankfurt am Main' },
  { prefix: '694', city: 'Weinheim' },
  { prefix: '685', city: 'Viernheim' },
  { prefix: '674', city: 'Neustadt an der Weinstraße' },
  { prefix: '101', city: 'Berlin' },
  { prefix: '102', city: 'Berlin' },
  { prefix: '103', city: 'Berlin' },
  { prefix: '104', city: 'Berlin' },
  { prefix: '105', city: 'Berlin' },
  { prefix: '106', city: 'Berlin' },
  { prefix: '107', city: 'Berlin' },
  { prefix: '108', city: 'Berlin' },
  { prefix: '109', city: 'Berlin' },
  { prefix: '281', city: 'Bremen' },
  { prefix: '282', city: 'Bremen' },
  { prefix: '283', city: 'Bremen' },
  { prefix: '803', city: 'München' },
  { prefix: '804', city: 'München' },
  { prefix: '805', city: 'München' },
  { prefix: '806', city: 'München' },
  { prefix: '807', city: 'München' },
  { prefix: '808', city: 'München' },
  { prefix: '809', city: 'München' },
  { prefix: '855', city: 'München' },
  { prefix: '661', city: 'Saarbrücken' },
  { prefix: '662', city: 'Saarbrücken' },
  { prefix: '663', city: 'St. Ingbert' },
  { prefix: '664', city: 'Homburg' },
  { prefix: '665', city: 'Saarlouis' },
  { prefix: '666', city: 'Merzig' },
  { prefix: '667', city: 'Neunkirchen' },
  { prefix: '668', city: 'Neunkirchen' },
  { prefix: '701', city: 'Stuttgart' },
  { prefix: '703', city: 'Stuttgart' },
  { prefix: '704', city: 'Stuttgart' },
  { prefix: '705', city: 'Stuttgart' },
  { prefix: '706', city: 'Stuttgart' },
  { prefix: '200', city: 'Hamburg' },
  { prefix: '201', city: 'Hamburg' },
  { prefix: '202', city: 'Hamburg' },
  { prefix: '203', city: 'Hamburg' },
  { prefix: '204', city: 'Hamburg' },
  { prefix: '205', city: 'Hamburg' },
  { prefix: '220', city: 'Hamburg' },
  { prefix: '221', city: 'Hamburg' },
  { prefix: '222', city: 'Hamburg' },
  { prefix: '223', city: 'Hamburg' },
  { prefix: '224', city: 'Hamburg' },
  { prefix: '225', city: 'Hamburg' },
  { prefix: '226', city: 'Hamburg' },
  { prefix: '227', city: 'Hamburg' },
  { prefix: '506', city: 'Köln' },
  { prefix: '507', city: 'Köln' },
  { prefix: '508', city: 'Köln' },
  { prefix: '509', city: 'Köln' },
  { prefix: '402', city: 'Düsseldorf' },
  { prefix: '404', city: 'Düsseldorf' },
  { prefix: '405', city: 'Düsseldorf' },
  { prefix: '441', city: 'Dortmund' },
  { prefix: '443', city: 'Dortmund' },
  { prefix: '041', city: 'Leipzig' },
  { prefix: '042', city: 'Leipzig' },
  { prefix: '043', city: 'Leipzig' },
  { prefix: '010', city: 'Dresden' },
  { prefix: '011', city: 'Dresden' },
  { prefix: '012', city: 'Dresden' },
  { prefix: '013', city: 'Dresden' },
  { prefix: '301', city: 'Hannover' },
  { prefix: '304', city: 'Hannover' },
  { prefix: '305', city: 'Hannover' },
  { prefix: '904', city: 'Nürnberg' },
  { prefix: '930', city: 'Regensburg' },
  { prefix: '861', city: 'Augsburg' },
  { prefix: '761', city: 'Karlsruhe' },
  { prefix: '790', city: 'Freiburg im Breisgau' },
  { prefix: '890', city: 'Ulm' },
  { prefix: '990', city: 'Erfurt' },
  { prefix: '451', city: 'Essen' },
  { prefix: '531', city: 'Bonn' },
  { prefix: '180', city: 'Rostock' },
  { prefix: '235', city: 'Lübeck' },
];

/**
 * Bei gültiger 5-stelliger PLZ einen Ortsvorschlag liefern (oder null).
 */
export function suggestCityFromPlz(plz: string): string | null {
  const p = normalizePlz(plz);
  if (p.length !== 5) return null;
  if (PLZ_EXACT_CITY[p]) return PLZ_EXACT_CITY[p];
  const sorted = [...PLZ_PREFIX_CITY].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const { prefix, city } of sorted) {
    if (p.startsWith(prefix)) return city;
  }
  return null;
}

function locationFromCityToken(city: string): Location | null {
  const c = city.toLowerCase().trim();
  if (!c) return null;
  if (/\bkirkel\b/.test(c)) return 'kirkel';
  if (/\bfrankfurt\b/.test(c)) return 'frankfurt';
  if (/\bmannheim\b/.test(c)) return 'mannheim';
  if (/\bheidelberg\b/.test(c)) return 'heidelberg';
  if (/\bweinheim\b/.test(c)) return 'weinheim';
  if (/\bviernheim\b/.test(c)) return 'viernheim';
  if (/neustadt.*wein|weinstraße|weinstrasse/.test(c)) return 'neustadt';
  if (/\bberlin\b/.test(c)) return 'berlin';
  if (/\bbremen\b/.test(c)) return 'bremen';
  if (/\bmünchen\b|\bmuenchen\b/.test(c)) return 'muenchen';
  if (/\bottobrunn\b|\bunterhaching\b|\bgrünwald\b|\bgruenwald\b/.test(c)) return 'muenchen';
  if (
    /\b(nürnberg|nuernberg|augsburg|regensburg|ingolstadt|würzburg|wuerzburg|erlangen|bayreuth|freising|passau|rosenheim|landsberg|kempten|schweinfurt|hof)\b/.test(
      c,
    )
  ) {
    return 'bayern';
  }
  if (
    /\b(stuttgart|karlsruhe|freiburg|heilbronn|pforzheim|reutlingen|tübingen|tuebingen|esslingen|ludwigsburg|heidenheim|aalen|schwäbisch|goeppingen|goeppingen)\b/.test(
      c,
    )
  ) {
    return 'deutschland';
  }
  if (/\bbaden-württemberg\b|\bbaden-wuerttemberg\b/.test(c)) return 'deutschland';
  if (/\bhessen\b|\bnordrhein-westfalen\b|\brheinland-pfalz\b|\bsachsen\b|\bthüringen\b|\bthueringen\b/.test(c)) {
    return 'deutschland';
  }
  if (
    /\b(hamburg|köln|koln|düsseldorf|duesseldorf|dortmund|essen|bonn|leipzig|dresden|hannover|bielefeld|münster|muenster|chemnitz|magdeburg|wiesbaden|gelsenkirchen|mönchengladbach|moenchengladbach|kiel|braunschweig|halle|oldenburg|oberhausen|lübeck|luebeck|rostock|potsdam|freiburg)\b/.test(
      c,
    )
  ) {
    return 'deutschland';
  }
  if (/\bbayern\b/.test(c) && !/\bmuenchen\b|\bmünchen\b/.test(c)) return 'bayern';
  if (/\bhomburg\b|\bst\.?\s*ingbert\b|\bsankt\s*ingbert\b|\bblieskastel\b|\bbexbach\b|\bmandelbachtal\b|\bgersheim\b/.test(c)) {
    return 'saarpfalz';
  }
  if (
    /\bsaarbrücken\b|\bsaarbrucken\b|\bsulzbach\b|\bvolklingen\b|\bvoelklingen\b|\bmerzig\b|\bsaarlouis\b|\bneunkirchen\b|\bst\.?\s*wendel\b/.test(
      c,
    )
  ) {
    return 'saarland';
  }
  return null;
}

/**
 * PLZ-Grobregion (DE-Systematik), wenn keine Demo-Sonderregel greift.
 * 88/89 = Bodensee BW; 8 sonst überwiegend Bayern; 9 überwiegend Bayern/Thüringen → Demo „Bayern“-Karten.
 */
function plzRoughLocation(p: string): Location {
  const d1 = p[0];
  const d2 = p.slice(0, 2);

  if (d1 === '0') return 'deutschland';
  if (d1 === '1') return d2 === '10' ? 'berlin' : 'deutschland';
  if (d1 === '2') return d2 === '28' ? 'bremen' : 'deutschland';
  if (d1 === '3' || d1 === '4' || d1 === '5') return 'deutschland';
  if (d1 === '6') {
    if (d2 === '66') return 'saarland';
    return 'deutschland';
  }
  if (d1 === '7') return 'deutschland';
  if (d1 === '8') {
    if (d2 === '88' || d2 === '89') return 'deutschland';
    return 'bayern';
  }
  if (d1 === '9') return 'bayern';
  return 'deutschland';
}

/**
 * Leitet den Demo-App-Standort aus PLZ und Wohnort ab (Wahlen/Abstimmungen).
 */
export function resolveDemoLocation(plz: string, city: string): Location {
  const p = normalizePlz(plz);
  const fromName = locationFromCityToken(city);
  // Manuelle Ortsangabe soll Vorrang haben (z. B. City geändert, PLZ noch von vorher).
  if (fromName && fromName !== 'saarland') return fromName;
  if (fromName === 'saarland') return 'saarland';
  if (p === '66459') return 'kirkel';

  const county = inferCountyIfMissing({ plz: p, city: city.trim() || undefined });
  const slKreis = inferSaarlandKreisFromCity(city);

  if (/\bkirkel\b/i.test(city)) return 'kirkel';
  if (slKreis === 'Saarpfalz-Kreis' || county === 'Saarpfalz-Kreis') {
    return /\bkirkel\b/i.test(city) ? 'kirkel' : 'saarpfalz';
  }
  if (
    county &&
    /Regionalverband Saarbrücken|Neunkirchen|Saarlouis|Merzig-Wadern|St\. Wendel/.test(county)
  ) {
    return 'saarland';
  }

  if (p.length === 5) {
    if (/^66/.test(p)) return 'saarland';
    if (/^60|^61|^62|^63|^64|^659/.test(p)) return 'frankfurt';
    if (/^68[0-3]/.test(p)) return 'mannheim';
    if (/^691/.test(p)) return 'heidelberg';
    if (/^694/.test(p)) return 'weinheim';
    if (/^685/.test(p)) return 'viernheim';
    if (/^674/.test(p)) return 'neustadt';
    if (/^10/.test(p)) return 'berlin';
    if (/^28/.test(p)) return 'bremen';
    if (/^80|^85/.test(p)) return 'muenchen';
  }

  if (p.length === 5) {
    return plzRoughLocation(p);
  }

  return 'bundesweit';
}

export function formatDemoAddressLine(street: string, plz: string, city: string): string {
  const s = street.trim();
  const z = normalizePlz(plz);
  const o = city.trim();
  if (!s && !z && !o) return '';
  const parts = [s, z && o ? `${z} ${o}` : z || o].filter(Boolean);
  return parts.join(', ');
}

/** Migriert alte einzeilige Adresse "Str, PLZ Ort" */
export function parseLegacyDemoAddress(raw: string): { street: string; plz: string; city: string } {
  const t = raw.trim();
  if (!t) return { street: '', plz: '', city: '' };
  const m = t.match(/^(.+?),\s*(\d{5})\s+(.+)$/);
  if (m) return { street: m[1].trim(), plz: m[2], city: m[3].trim() };
  const m2 = t.match(/\b(\d{5})\b/);
  if (m2) {
    const plz = m2[1];
    const rest = t.replace(plz, ' ').replace(/\s+/g, ' ').trim();
    return { street: '', plz, city: rest };
  }
  return { street: t, plz: '', city: '' };
}
