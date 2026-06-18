#!/usr/bin/env node
/**
 * Validates official catalogue URLs (BA, family, employer hubs + verified links).
 * Usage: node scripts/check-official-action-links.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BANNED_FRAGMENTS = [
  '/arbeitslos-melden',
  '/familie-und-kinder/elterngeld',
  '/unternehmen/unternehmensfuehrung/personal',
  '/de/BG/index.jsp',
];

const REQUIRED_STABLE_URLS = [
  'https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld',
  'https://web.arbeitsagentur.de/',
  'https://www.arbeitsagentur.de/karriere-und-weiterbildung/bildungsgutschein',
  'https://www.arbeitsagentur.de/karriere-und-weiterbildung',
  'https://familienportal.de/familienportal/rechner-antraege/antragsformulare',
  'https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-beantragen',
  'https://www.arbeitsagentur.de/unternehmen/betriebsnummern-service',
  'https://www.arbeitsagentur.de/unternehmen/betriebsnummern-service/meldeverfahren-sozialversicherung',
];

function readCatalogSources() {
  return [
    readFileSync(join(ROOT, 'lib/civic/baOfficialUrls.ts'), 'utf8'),
    readFileSync(join(ROOT, 'lib/civic/officialUrls.ts'), 'utf8'),
    readFileSync(join(ROOT, 'lib/civic/officialActionCatalog.ts'), 'utf8'),
    readFileSync(join(ROOT, 'lib/govdata/verifiedOfficialSources.ts'), 'utf8'),
  ].join('\n');
}

function extractCatalogUrls(source) {
  const urls = new Set();
  for (const match of source.matchAll(/https:\/\/[^\s'"`,)]+/g)) {
    urls.add(match[0].replace(/[),.;]+$/, ''));
  }
  return [...urls];
}

async function checkUrl(url) {
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if ([405, 403, 404].includes(res.status)) {
      res = await fetch(url, { method: 'GET', redirect: 'follow' });
    }
    const ok =
      res.status < 400 ||
      res.status === 401 ||
      (res.status === 403 && url.includes('bund.de'));
    return {
      url,
      ok,
      status: res.status,
      finalUrl: res.url,
    };
  } catch (err) {
    return {
      url,
      ok: false,
      status: err instanceof Error ? err.message : 'error',
      finalUrl: null,
    };
  }
}

const source = readCatalogSources();
for (const frag of BANNED_FRAGMENTS) {
  if (source.includes(frag)) {
    console.error(`FAIL banned fragment found in catalogue sources: ${frag}`);
    process.exit(1);
  }
}

const catalogUrls = extractCatalogUrls(source);
const urlsToCheck = [...new Set([...REQUIRED_STABLE_URLS, ...catalogUrls])].filter(
  (url) =>
    url.includes('arbeitsagentur.de') ||
    url.includes('familienportal.de') ||
    url.includes('web.arbeitsagentur.de') ||
    url.includes('elster.de'),
);

console.log(`Checking ${urlsToCheck.length} official catalogue URLs…`);
const results = [];
for (const url of urlsToCheck) {
  const result = await checkUrl(url);
  results.push(result);
  const suffix = result.finalUrl && result.finalUrl !== url ? ` -> ${result.finalUrl}` : '';
  console.log(
    result.ok ? `OK  ${result.status} ${url}${suffix}` : `FAIL ${result.status} ${url}${suffix}`,
  );
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\n${failed.length} official URL(s) failed validation.`);
  process.exit(1);
}
console.log('\nOfficial catalogue URLs passed validation.');
