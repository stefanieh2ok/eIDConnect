#!/usr/bin/env node
/**
 * Smoke-test gov-data source resolution via local Next.js API.
 *
 * Usage:
 *   node scripts/check-govdata-source.mjs [baseUrl]
 *
 * Requires dev server (npm run dev:clean) with desired GOVDATA_SOURCE_MODE on the server process.
 */
const BASE = (process.argv[2] || process.env.GOVDATA_CHECK_BASE || 'http://localhost:3002').replace(
  /\/$/,
  '',
);

const CASES = [
  {
    label: 'Private',
    mode: 'private',
    text: 'Ich bekomme ein Kind und brauche Elterngeld, Kindergeld, Kita und Krankenversicherung.',
  },
  {
    label: 'Business',
    mode: 'business',
    text: 'Ich möchte ein Gewerbe anmelden und wissen, welche Stellen zuständig sind.',
  },
  {
    label: 'Moving',
    mode: 'unsure',
    text: 'Ich ziehe mit zwei Kindern um und brauche Unterstützung.',
  },
];

function inferLinkStatus(service, resolution) {
  const hasUrl = Boolean(service.officialSourceUrl || service.onlineServiceUrl || service.formUrl);
  if (!hasUrl) return 'missing';
  if (service.sourceSystem === 'VerifiedCatalog' && service.sourceVerifiedAt) {
    return 'verified_official_manual';
  }
  if (service.sourceSystem === 'ManualDemo' || service.sourceSystem === 'Unknown') {
    return 'demo_unverified';
  }
  if (resolution.status === 'live' && !resolution.isDemoData && service.sourceSystem === 'PVOG') {
    return 'verified_official';
  }
  if (service.sourceSystem === 'PVOG' || service.sourceSystem === 'Bundesportal') {
    return 'demo_unverified';
  }
  return 'unknown';
}

function collectViolations(resolution, label) {
  const violations = [];
  const linkStatuses = resolution.services.map((service) => inferLinkStatus(service, resolution));
  const verifiedPvogCount = linkStatuses.filter((status) => status === 'verified_official').length;
  const verifiedManualCount = linkStatuses.filter((status) => status === 'verified_official_manual').length;
  const fallbackUsed = Boolean(resolution.fallbackUsed ?? (resolution.isDemoData && resolution.sourceNotice != null));

  if (resolution.status === 'live' && resolution.isDemoData) {
    violations.push(`${label}: status=live but isDemoData=true`);
  }

  if (resolution.status === 'live' && !resolution.isDemoData && verifiedPvogCount === 0) {
    violations.push(`${label}: claims live but no verified PVOG services`);
  }

  if (resolution.status === 'demo' && (verifiedPvogCount > 0 || verifiedManualCount > 0)) {
    violations.push(`${label}: demo mode produced verified links`);
  }

  if (resolution.status === 'credentials_required' && resolution.isDemoData === false) {
    violations.push(`${label}: credentials_required but isDemoData=false`);
  }

  if (
    resolution.status === 'credentials_required' &&
    resolution.sourceNotice &&
    !/Zugangsdaten fehlen|Demonstrationslogik/i.test(resolution.sourceNotice)
  ) {
    violations.push(`${label}: credentials_required without clear source notice`);
  }

  if (fallbackUsed && resolution.mode === 'demo' && verifiedManualCount > 0) {
    violations.push(`${label}: demo fallback used but manual verified links present`);
  }

  if (
    resolution.sourceNotice &&
    /PVOG live|XZuFi live|amtlich angebunden/i.test(resolution.sourceNotice) &&
    resolution.status !== 'live'
  ) {
    violations.push(`${label}: source notice falsely claims live integration`);
  }

  for (const service of resolution.services) {
    const status = inferLinkStatus(service, resolution);
    const url = service.officialSourceUrl || service.onlineServiceUrl || service.formUrl;
    if (url && status === 'verified_official' && resolution.status !== 'live') {
      violations.push(`${label}: PVOG URL shown as verified without live resolution`);
    }
  }

  return { violations, linkStatuses, verifiedPvogCount, verifiedManualCount, fallbackUsed };
}

async function fetchJson(path, init) {
  const res = await fetch(`${BASE}${path}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${path} HTTP ${res.status}: ${body.error || JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  console.log(`Gov-data source smoke test @ ${BASE}\n`);

  let diagnostics = null;
  try {
    diagnostics = await fetchJson('/api/govdata/diagnostics');
    console.log('Diagnostics:');
    console.log(JSON.stringify(diagnostics, null, 2));
    console.log('');
  } catch (error) {
    console.warn(`Diagnostics unavailable: ${error.message}`);
    console.warn('Ensure dev server runs with NODE_ENV=development or GOVDATA_DIAGNOSTICS_ENABLED=true\n');
  }

  const allViolations = [];

  for (const testCase of CASES) {
    const resolution = await fetchJson('/api/govdata/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testCase.text, mode: testCase.mode }),
    });

    const { violations, linkStatuses, verifiedPvogCount, verifiedManualCount, fallbackUsed } =
      collectViolations(resolution, testCase.label);
    allViolations.push(...violations);

    console.log(`=== ${testCase.label} ===`);
    console.log(`source mode: ${resolution.mode}`);
    console.log(`resolver status: ${resolution.status}`);
    console.log(`service count: ${resolution.services.length}`);
    console.log(`service titles: ${resolution.services.map((s) => s.title).join(' | ') || '(none)'}`);
    console.log(
      `source systems: ${[...new Set(resolution.services.map((s) => s.sourceSystem))].join(', ') || '(none)'}`,
    );
    console.log(`link statuses: ${linkStatuses.join(', ') || '(none)'}`);
    console.log(`verified PVOG link count: ${verifiedPvogCount}`);
    console.log(`verified manual link count: ${verifiedManualCount}`);
    console.log(`source notice: ${resolution.sourceNotice ?? '(none — live official data)'}`);
    console.log(`fallback used: ${fallbackUsed ? 'yes' : 'no'}`);
    if (violations.length) {
      console.log(`violations: ${violations.join('; ')}`);
    }
    console.log('');
  }

  if (allViolations.length) {
    console.error('FAILED');
    for (const violation of allViolations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('PASSED — source invariants hold for all sample cases.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
