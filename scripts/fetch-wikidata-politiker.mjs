#!/usr/bin/env node
/**
 * Zieht Bürgermeister + Landräte aus Wikidata (SPARQL) und generiert
 * data/kommunalpolitiker-auto.ts.
 *
 * Ausführung: node scripts/fetch-wikidata-politiker.mjs
 */

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ENDPOINT = 'https://query.wikidata.org/sparql';
const UA = 'eIDConnect-DataFetcher/1.0 (https://github.com/stefanieh2ok/eIDConnect)';

async function sparql(query) {
  const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
  const res = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SPARQL ${res.status}: ${text.slice(0, 500)}`);
  }
  return (await res.json()).results.bindings;
}

function val(binding, key) {
  return binding[key]?.value ?? null;
}

function normalize(name) {
  if (!name) return '';
  return name
    .replace(/,\s*(Stadt|Landeshauptstadt|Hansestadt|Wissenschaftsstadt|Universitätsstadt|kreisfreie Stadt|Stadtkreis|Freie und Hansestadt|Große Kreisstadt|documenta-Stadt|Stadt der FernUniversität|Klingenstadt)$/i, '')
    .replace(/\s*\(.*?\)\s*$/, '')
    .trim();
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function wikiUrlToName(url) {
  if (!url) return null;
  const match = url.match(/\/wiki\/(.+)$/);
  if (!match) return null;
  return decodeURIComponent(match[1].replace(/_/g, ' '));
}

// ─── SPARQL queries ──────────────────────────────────────────────────────────

const QUERY_LANDKREISE = `
SELECT ?kreis ?kreisLabel ?ags ?landrat ?landratLabel ?partyLabel ?image ?sitelink ?birthDate WHERE {
  VALUES ?type { wd:Q106658 wd:Q61741534 }
  ?kreis wdt:P31 ?type .
  ?kreis wdt:P17 wd:Q183 .
  ?kreis wdt:P6 ?landrat .
  OPTIONAL { ?kreis wdt:P440 ?ags . }
  OPTIONAL { ?kreis wdt:P439 ?ags . }
  OPTIONAL { ?landrat wdt:P102 ?party . }
  OPTIONAL { ?landrat wdt:P18 ?image . }
  OPTIONAL { ?landrat wdt:P569 ?birthDate . }
  OPTIONAL {
    ?sitelink schema:about ?landrat ;
             schema:isPartOf <https://de.wikipedia.org/> .
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
}
`;

const QUERY_KREISFREIE = `
SELECT ?city ?cityLabel ?ags ?mayor ?mayorLabel ?partyLabel ?image ?sitelink ?birthDate WHERE {
  VALUES ?type { wd:Q22865 wd:Q1048835 wd:Q42744322 wd:Q253019 }
  ?city wdt:P31 ?type .
  ?city wdt:P17 wd:Q183 .
  ?city wdt:P6 ?mayor .
  OPTIONAL { ?city wdt:P440 ?ags . }
  OPTIONAL { ?city wdt:P439 ?ags . }
  OPTIONAL { ?mayor wdt:P102 ?party . }
  OPTIONAL { ?mayor wdt:P18 ?image . }
  OPTIONAL { ?mayor wdt:P569 ?birthDate . }
  OPTIONAL {
    ?sitelink schema:about ?mayor ;
             schema:isPartOf <https://de.wikipedia.org/> .
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
}
`;

const QUERY_LARGE_CITIES = `
SELECT ?city ?cityLabel ?ags ?mayor ?mayorLabel ?partyLabel ?image ?sitelink ?birthDate WHERE {
  ?city wdt:P31/wdt:P279* wd:Q515 .
  ?city wdt:P17 wd:Q183 .
  ?city wdt:P6 ?mayor .
  ?city wdt:P1082 ?pop .
  FILTER(?pop > 50000)
  OPTIONAL { ?city wdt:P440 ?ags . }
  OPTIONAL { ?city wdt:P439 ?ags . }
  OPTIONAL { ?mayor wdt:P102 ?party . }
  OPTIONAL { ?mayor wdt:P18 ?image . }
  OPTIONAL { ?mayor wdt:P569 ?birthDate . }
  OPTIONAL {
    ?sitelink schema:about ?mayor ;
             schema:isPartOf <https://de.wikipedia.org/> .
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
}
`;

const QUERY_GEMEINDEN = `
SELECT ?gem ?gemLabel ?ags ?bm ?bmLabel ?partyLabel ?image ?sitelink ?birthDate WHERE {
  ?gem wdt:P31/wdt:P279* wd:Q262166 .
  ?gem wdt:P6 ?bm .
  OPTIONAL { ?gem wdt:P440 ?ags . }
  OPTIONAL { ?gem wdt:P439 ?ags . }
  OPTIONAL { ?bm wdt:P102 ?party . }
  OPTIONAL { ?bm wdt:P18 ?image . }
  OPTIONAL { ?bm wdt:P569 ?birthDate . }
  OPTIONAL {
    ?sitelink schema:about ?bm ;
             schema:isPartOf <https://de.wikipedia.org/> .
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
}
`;

function calcAge(birthDate) {
  if (!birthDate) return null;
  const bd = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - bd.getFullYear();
  if (now.getMonth() < bd.getMonth() || (now.getMonth() === bd.getMonth() && now.getDate() < bd.getDate())) age--;
  return age > 0 && age < 120 ? age : null;
}

function processRows(rows, entityKey, personKey) {
  const map = new Map();
  for (const row of rows) {
    const entityName = normalize(val(row, `${entityKey}Label`));
    const ags = val(row, 'ags');
    const personName = val(row, `${personKey}Label`);
    const party = val(row, 'partyLabel');
    const image = val(row, 'image');
    const wikiUrl = val(row, 'sitelink');
    const birthDate = val(row, 'birthDate');
    if (!entityName || !personName) continue;
    const key = ags || slugify(entityName);
    if (map.has(key)) continue;
    map.set(key, {
      ort: entityName,
      ags: ags || '',
      name: personName,
      partei: party || 'parteilos',
      alter: calcAge(birthDate),
      image: image ? image.replace(/^http:/, 'https:') : null,
      wikipediaUrl: wikiUrl || null,
    });
  }
  return [...map.values()];
}

const AGS_LAND = {
  '01': 'schleswig-holstein', '02': 'hamburg', '03': 'niedersachsen', '04': 'bremen',
  '05': 'nordrhein-westfalen', '06': 'hessen', '07': 'rheinland-pfalz', '08': 'baden-wuerttemberg',
  '09': 'bayern', '10': 'saarland', '11': 'berlin', '12': 'brandenburg',
  '13': 'mecklenburg-vorpommern', '14': 'sachsen', '15': 'sachsen-anhalt', '16': 'thueringen',
};

function agsToLand(ags) {
  if (!ags || ags.length < 2) return '';
  return AGS_LAND[ags.slice(0, 2)] || '';
}

async function main() {
  console.log('--- Wikidata Politiker-Fetch ---');

  console.log('1/3 Landkreise + Landräte...');
  let landkreisRows;
  try {
    landkreisRows = await sparql(QUERY_LANDKREISE);
    console.log(`  → ${landkreisRows.length} Zeilen`);
  } catch (e) {
    console.error('  Fehler bei Landkreise-Query:', e.message);
    landkreisRows = [];
  }
  const landraete = processRows(landkreisRows, 'kreis', 'landrat');
  console.log(`  → ${landraete.length} eindeutige Landräte`);

  console.log('2/4 Kreisfreie Städte + OBs...');
  let kreisfreiRows;
  try {
    kreisfreiRows = await sparql(QUERY_KREISFREIE);
    console.log(`  → ${kreisfreiRows.length} Zeilen`);
  } catch (e) {
    console.error('  Fehler bei Kreisfreie-Query:', e.message);
    kreisfreiRows = [];
  }
  const obs = processRows(kreisfreiRows, 'city', 'mayor');
  console.log(`  → ${obs.length} eindeutige OBs`);

  console.log('3/4 Große Städte (>50k) + OBs...');
  let largeCityRows;
  try {
    largeCityRows = await sparql(QUERY_LARGE_CITIES);
    console.log(`  → ${largeCityRows.length} Zeilen`);
  } catch (e) {
    console.warn('  Große-Städte-Query fehlgeschlagen:', e.message);
    largeCityRows = [];
  }
  const largeCityOBs = processRows(largeCityRows, 'city', 'mayor');
  console.log(`  → ${largeCityOBs.length} eindeutige OBs (>50k)`);

  console.log('4/4 Gemeinden + Bürgermeister...');
  let gemeindenRows;
  try {
    gemeindenRows = await sparql(QUERY_GEMEINDEN);
    console.log(`  → ${gemeindenRows.length} Zeilen`);
  } catch (e) {
    console.warn('  Gemeinden-Query fehlgeschlagen (evtl. Timeout):', e.message);
    console.log('  → Fallback: nur Landkreise + kreisfreie Städte verwenden');
    gemeindenRows = [];
  }
  const buergermeister = processRows(gemeindenRows, 'gem', 'bm');
  console.log(`  → ${buergermeister.length} eindeutige Bürgermeister`);

  const allBMs = new Map();
  for (const bm of [...obs, ...largeCityOBs, ...buergermeister]) {
    const key = bm.ags || slugify(bm.ort);
    if (!allBMs.has(key)) allBMs.set(key, bm);
  }
  const mergedBMs = [...allBMs.values()];
  console.log(`Gesamt: ${landraete.length} Landräte, ${mergedBMs.length} Bürgermeister/OBs`);

  const today = new Date().toISOString().slice(0, 10);

  const lines = [];
  lines.push(`/**`);
  lines.push(` * Auto-generiert aus Wikidata am ${today}`);
  lines.push(` * Script: scripts/fetch-wikidata-politiker.mjs`);
  lines.push(` * Quellen: Wikidata (CC0), Wikipedia-Links, Wikimedia Commons Bilder`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`export interface KommunalPolitiker {`);
  lines.push(`  ort: string;`);
  lines.push(`  ags: string;`);
  lines.push(`  land?: string;`);
  lines.push(`  name: string;`);
  lines.push(`  partei: string;`);
  lines.push(`  alter: number | null;`);
  lines.push(`  image: string | null;`);
  lines.push(`  wikipediaUrl: string | null;`);
  lines.push(`}`);
  lines.push(``);

  function serializeList(varName, items) {
    lines.push(`// eslint-disable-next-line @typescript-eslint/no-explicit-any`);
    lines.push(`export const ${varName}: KommunalPolitiker[] = JSON.parse(${JSON.stringify(JSON.stringify(items.map(item => ({
      ort: item.ort,
      ags: item.ags,
      land: agsToLand(item.ags),
      name: item.name,
      partei: item.partei,
      alter: item.alter,
      image: item.image,
      wikipediaUrl: item.wikipediaUrl,
    }))))});`);
    lines.push(``);
  }

  serializeList('LANDRAETE_AUTO', landraete);
  serializeList('BUERGERMEISTER_AUTO', mergedBMs);

  lines.push(`/** Lookup: normalisierter Ortsname → Bürgermeister */`);
  lines.push(`const _bmIndex = new Map<string, KommunalPolitiker>();`);
  lines.push(`for (const bm of BUERGERMEISTER_AUTO) {`);
  lines.push(`  const key = bm.ort.toLowerCase().replace(/\\s*\\(.*?\\)\\s*/g, '').trim();`);
  lines.push(`  if (!_bmIndex.has(key)) _bmIndex.set(key, bm);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function findBuergermeister(cityName: string): KommunalPolitiker | undefined {`);
  lines.push(`  const key = cityName.toLowerCase().replace(/\\s*\\(.*?\\)\\s*/g, '').trim();`);
  lines.push(`  return _bmIndex.get(key);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`/** Lookup: AGS (5-stellig, ggf. 3 für Kreise) → Landrat */`);
  lines.push(`const _lrIndex = new Map<string, KommunalPolitiker>();`);
  lines.push(`for (const lr of LANDRAETE_AUTO) {`);
  lines.push(`  if (lr.ags) _lrIndex.set(lr.ags, lr);`);
  lines.push(`  const key = lr.ort.toLowerCase().replace(/\\s*\\(.*?\\)\\s*/g, '').trim();`);
  lines.push(`  if (!_lrIndex.has(key)) _lrIndex.set(key, lr);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function findLandrat(kreisName: string): KommunalPolitiker | undefined {`);
  lines.push(`  const key = kreisName.toLowerCase().replace(/\\s*\\(.*?\\)\\s*/g, '').trim();`);
  lines.push(`  return _lrIndex.get(key);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function findLandratByAgs(ags: string): KommunalPolitiker | undefined {`);
  lines.push(`  return _lrIndex.get(ags);`);
  lines.push(`}`);

  const outPath = join(ROOT, 'data', 'kommunalpolitiker-auto.ts');
  writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  console.log(`\n✓ ${outPath}`);
  console.log(`  ${landraete.length} Landräte + ${mergedBMs.length} Bürgermeister/OBs`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
