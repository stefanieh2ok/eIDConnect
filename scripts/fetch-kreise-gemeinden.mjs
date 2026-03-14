#!/usr/bin/env node
/**
 * Lädt alle Kreise und alle Kommunen (Gemeinden) aus dem offenen
 * Gemeindeverzeichnis (juliuste/gemeindeverzeichnis, MIT) und schreibt
 * data/kreise.json und public/data/gemeinden.json.
 * Ausführung: node scripts/fetch-kreise-gemeinden.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const AGS_LAND_TO_STATE = {
  '01': 'schleswig-holstein', '02': 'hamburg', '03': 'niedersachsen', '04': 'bremen',
  '05': 'nordrhein-westfalen', '06': 'hessen', '07': 'rheinland-pfalz', '08': 'baden-wuerttemberg',
  '09': 'bayern', '10': 'saarland', '11': 'berlin', '12': 'brandenburg',
  '13': 'mecklenburg-vorpommern', '14': 'sachsen', '15': 'sachsen-anhalt', '16': 'thueringen',
};

const BASE = 'https://raw.githubusercontent.com/juliuste/gemeindeverzeichnis/master';

async function fetchNdjson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${url}: ${res.status}`);
  const text = await res.text();
  return text.split('\n').filter(Boolean).map((line) => JSON.parse(line));
}

async function main() {
  console.log('Lade Kreise...');
  const kreiseRows = await fetchNdjson(`${BASE}/kreise.ndjson`);
  const kreise = kreiseRows.map((r) => {
    const land = (r.schlüssel && r.schlüssel.land) || '';
    return {
      name: r.name || '',
      ags: (r.schlüssel && r.schlüssel.nummer) || '',
      landKey: AGS_LAND_TO_STATE[land] || '',
    };
  }).filter((k) => k.ags && k.landKey);

  const kreisePath = join(ROOT, 'data', 'kreise.json');
  writeFileSync(kreisePath, JSON.stringify(kreise, null, 0), 'utf8');
  console.log(`Kreise: ${kreise.length} → ${kreisePath}`);

  console.log('Lade Gemeinden (alle Kommunen)...');
  const gemeindenRows = await fetchNdjson(`${BASE}/gemeinden.ndjson`);
  const gemeinden = gemeindenRows.map((r) => {
    const s = r.schlüssel || {};
    const land = s.land || '';
    const kreisAgs = [s.land, s.regierungsbezirk, s.kreis].filter(Boolean).join('');
    const fullAgs = s.nummer ? String(s.nummer).replace(/\D/g, '').slice(0, 5) : '';
    return {
      n: (r.name || '').trim(),
      k: kreisAgs,
      a: fullAgs || kreisAgs,
      l: AGS_LAND_TO_STATE[land] || '',
    };
  }).filter((g) => g.n && g.l);

  const publicDataDir = join(ROOT, 'public', 'data');
  mkdirSync(publicDataDir, { recursive: true });
  const gemeindenPath = join(publicDataDir, 'gemeinden.json');
  writeFileSync(gemeindenPath, JSON.stringify(gemeinden), 'utf8');
  console.log(`Gemeinden: ${gemeinden.length} → ${gemeindenPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
