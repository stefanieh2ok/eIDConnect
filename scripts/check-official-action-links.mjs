#!/usr/bin/env node
/**
 * Validates BA official entry points and blocks fragile deep links in the catalogue.
 * Usage: node scripts/check-official-action-links.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BANNED_FRAGMENTS = ['/arbeitslos-melden'];

const REQUIRED_BA_URLS = [
  'https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld',
  'https://web.arbeitsagentur.de/',
  'https://www.arbeitsagentur.de/karriere-und-weiterbildung/bildungsgutschein',
  'https://www.arbeitsagentur.de/karriere-und-weiterbildung',
];

function readCatalogSources() {
  return [
    readFileSync(join(ROOT, 'lib/civic/baOfficialUrls.ts'), 'utf8'),
    readFileSync(join(ROOT, 'lib/civic/officialActionCatalog.ts'), 'utf8'),
    readFileSync(join(ROOT, 'lib/govdata/verifiedOfficialSources.ts'), 'utf8'),
  ].join('\n');
}

async function checkUrl(url) {
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.status === 405 || res.status === 403 || res.status === 404) {
      res = await fetch(url, { method: 'GET', redirect: 'follow' });
    }
    return { url, ok: res.status < 400, status: res.status };
  } catch (err) {
    return { url, ok: false, status: err instanceof Error ? err.message : 'error' };
  }
}

const source = readCatalogSources();
for (const frag of BANNED_FRAGMENTS) {
  if (source.includes(frag)) {
    console.error(`FAIL banned fragment found in catalogue sources: ${frag}`);
    process.exit(1);
  }
}

console.log(`Checking ${REQUIRED_BA_URLS.length} required BA URLs…`);
const results = [];
for (const url of REQUIRED_BA_URLS) {
  const result = await checkUrl(url);
  results.push(result);
  console.log(result.ok ? `OK  ${result.status} ${url}` : `FAIL ${result.status} ${url}`);
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\n${failed.length} required BA URL(s) failed validation.`);
  process.exit(1);
}
console.log('\nBA official URLs passed validation. No fragile arbeitslos-melden deep links found.');
