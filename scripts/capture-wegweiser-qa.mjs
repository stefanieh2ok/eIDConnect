#!/usr/bin/env node
/**
 * Clara Wegweiser browser QA — screenshots + layout probes.
 * Requires: dev server + ADMIN_DEMO_SECRET in .env.local
 *
 * Usage: node scripts/capture-wegweiser-qa.mjs [BASE_URL]
 */
import { chromium } from 'playwright';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3002').replace(/\/$/, '');
const OUT_DIR = join(process.cwd(), 'docs', 'screenshots', 'wegweiser-qa');

const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'mobile', width: 390, height: 844 },
];

const PRIVATE_TEXT = 'Ich ziehe mit zwei Kindern um und brauche Unterstützung.';

function loadEnvLocal() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function loadAdminSecret() {
  loadEnvLocal();
  return process.env.ADMIN_DEMO_SECRET?.trim() || null;
}

function adminHttpCredentials() {
  loadEnvLocal();
  const user = process.env.ADMIN_BASIC_USER?.trim();
  const pass = process.env.ADMIN_BASIC_PASS?.trim();
  if (!user || !pass) return undefined;
  return { username: user, password: pass };
}

async function clickIfVisible(page, locator, timeoutMs = 8000) {
  try {
    const el = locator.first();
    await el.waitFor({ state: 'visible', timeout: timeoutMs });
    await el.click();
    return true;
  } catch {
    return false;
  }
}

async function bootstrapLoggedIn(page) {
  const secret = loadAdminSecret();
  const demoId = 'eidconnect-v1';
  const url = secret
    ? `${BASE}/api/admin/enter-demo?secret=${encodeURIComponent(secret)}&demo_id=${encodeURIComponent(demoId)}`
    : `${BASE}/api/dev/enter-demo?demo_id=${encodeURIComponent(demoId)}`;

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  const duPick = page.locator('[data-anrede-value="du"]');
  if (await duPick.count()) {
    await duPick.first().click();
    await page.waitForTimeout(600);
  }

  const weiter = page.getByRole('button', { name: /^Weiter$/i });
  if (await weiter.count()) {
    await weiter.first().click({ timeout: 15000 });
    await page.waitForTimeout(600);
  }

  const direct = page.getByRole('button', { name: /Direkt zur App/i });
  if (await direct.count()) {
    await direct.first().click();
    await page.waitForTimeout(2500);
  }

  await page.waitForSelector('.civic-app-shell', { timeout: 20000 });

  const rewardsDismiss = page.getByRole('button', { name: /Nicht jetzt/i });
  if (await rewardsDismiss.count()) {
    await rewardsDismiss.first().click().catch(() => {});
    await page.waitForTimeout(400);
  }

  const wegweiserNav =
    page.getByRole('button', { name: 'Wegweiser' }).or(page.locator('.app-bottom-nav__item').filter({ hasText: 'Wegweiser' }));
  await clickIfVisible(page, wegweiserNav, 15000);
  await page.waitForSelector('.clara-wegweiser', { timeout: 15000 });
  await page.waitForTimeout(700);
}

function layoutProbe(page) {
  return page.evaluate(() => {
    const shell = document.querySelector('.civic-app-shell') || document.documentElement;
    const main = document.querySelector('#main-content') || shell;
    const doc = document.documentElement;
    const clientW = main.clientWidth || doc.clientWidth;
    const scrollW = Math.max(main.scrollWidth, shell.scrollWidth, doc.scrollWidth, document.body?.scrollWidth || 0);
    const header = document.querySelector('.app-shell-header, header');
    const headerRect = header?.getBoundingClientRect();
    const bottomNav = document.querySelector('.app-bottom-nav');
    const navRect = bottomNav?.getBoundingClientRect();
    const cta = document.querySelector('.clara-wegweiser__cta-primary');
    const ctaRect = cta?.getBoundingClientRect();
    const demoBanner = document.querySelector('.demo-data-banner');
    const disclaimer = document.querySelector('.civic-case-plan__disclaimer-box');
    const authorities = document.querySelector('#civic-authorities-heading');
    const viewportH = window.innerHeight;

    const ctaCoveredByNav =
      ctaRect && navRect ? ctaRect.bottom > navRect.top - 4 && ctaRect.top < navRect.bottom : false;

    const headerClipped =
      headerRect && (headerRect.top < -2 || headerRect.left < -2 || headerRect.right > clientW + 2);

    return {
      horizontalOverflow: scrollW > clientW + 1,
      scrollWidth: scrollW,
      clientWidth: clientW,
      headerVisible: !!header && headerRect && headerRect.height > 0,
      headerClipped,
      bottomNavTop: navRect ? Math.round(navRect.top) : null,
      ctaBottom: ctaRect ? Math.round(ctaRect.bottom) : null,
      ctaCoveredByNav,
      demoBannerVisible: !!demoBanner && demoBanner.offsetParent !== null,
      demoBannerText: demoBanner?.textContent?.trim() || null,
      disclaimerVisible: !!disclaimer,
      authoritiesVisible: !!authorities,
      scrollY: Math.round(window.scrollY),
    };
  });
}

async function capture(page, vpId, name) {
  const file = join(OUT_DIR, `${vpId}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function runViewport(browser, vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    httpCredentials: adminHttpCredentials(),
  });
  const page = await ctx.newPage();
  const shots = [];
  const probes = [];

  await bootstrapLoggedIn(page);

  // 1–3 initial state
  shots.push(await capture(page, vp.id, '01-initial'));
  probes.push({ step: '01-initial', ...(await layoutProbe(page)) });

  // 4 filled textarea (before analysis)
  const textarea = page.locator('.clara-wegweiser__textarea');
  await textarea.fill(PRIVATE_TEXT);
  await page.waitForTimeout(300);
  shots.push(await capture(page, vp.id, '04-textarea-filled'));
  probes.push({ step: '04-textarea-filled', ...(await layoutProbe(page)) });

  const scrollBefore = await page.evaluate(() => window.scrollY);

  // 5 generate plan
  await page.getByRole('button', { name: /Behördenfahrplan erstellen/i }).click();
  await page.waitForTimeout(900);

  const scrollAfter = await page.evaluate(() => window.scrollY);
  probes.push({
    step: 'scroll-jump',
    scrollBefore: Math.round(scrollBefore),
    scrollAfter: Math.round(scrollAfter),
    jumpPx: Math.abs(scrollAfter - scrollBefore),
  });

  shots.push(await capture(page, vp.id, '05-behördenfahrplan'));
  probes.push({ step: '05-plan', ...(await layoutProbe(page)) });

  // Scroll to authorities if present
  const auth = page.locator('#civic-authorities-heading');
  if (await auth.count()) {
    await auth.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    shots.push(await capture(page, vp.id, '06-authorities'));
  }

  const handover = page.locator('#plan-handover');
  if (await handover.count()) {
    await handover.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    shots.push(await capture(page, vp.id, '08-handover'));
  }

  const disclaimer = page.locator('#plan-disclaimer');
  if (await disclaimer.count()) {
    await disclaimer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    shots.push(await capture(page, vp.id, '09-disclaimer'));
  }

  // Mobile CTA overlap — scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  shots.push(await capture(page, vp.id, '10-bottom-nav-check'));
  probes.push({ step: '10-bottom', ...(await layoutProbe(page)) });

  // Compliance text checks on page
  const copyCheck = await page.evaluate(() => ({
    hasDemoBanner: !!document.querySelector('.demo-data-banner'),
    hasDisclaimer: document.body.innerText.includes('Clara unterstützt bei Orientierung und Vorbereitung'),
    hasExternalOnly: document.body.innerText.includes('Externer offizieller Weg'),
    hasDemoLinkLabel: document.body.innerText.includes('Demo-Link — noch nicht live verifiziert'),
    forbidden: ['du hast Anspruch auf', 'Antrag einreichen', 'Jetzt beantragen', 'wir reichen'].filter((p) =>
      document.body.innerText.toLowerCase().includes(p),
    ),
  }));
  probes.push({ step: 'copy-check', ...copyCheck });

  await ctx.close();
  return { viewport: vp, shots, probes };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${vp.id} (${vp.width}px) ===`);
    const r = await runViewport(browser, vp);
    results.push(r);
    for (const s of r.shots) console.log('  screenshot:', s);
    for (const p of r.probes) {
      if (p.horizontalOverflow) console.log('  WARN overflow at', p.step);
      if (p.ctaCoveredByNav) console.log('  WARN CTA covered by nav at', p.step);
      if (p.headerClipped) console.log('  WARN header clipped at', p.step);
      if (p.step === 'scroll-jump' && p.jumpPx > 80) console.log('  WARN scroll jump', p.jumpPx, 'px');
      if (p.forbidden?.length) console.log('  FAIL forbidden copy:', p.forbidden);
    }
  }

  await browser.close();

  const report = {
    generatedAt: new Date().toISOString(),
    head: '9a82682',
    outDir: OUT_DIR,
    results: results.map((r) => ({
      viewport: r.viewport,
      shots: r.shots.map((s) => s.replace(process.cwd() + '\\', '').replace(process.cwd() + '/', '')),
      probes: r.probes,
    })),
  };

  const reportPath = join(OUT_DIR, 'qa-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('\nReport:', reportPath);

  const critical = [];
  for (const r of results) {
    for (const p of r.probes) {
      if (p.horizontalOverflow) critical.push(`${r.viewport.id}: horizontal overflow @ ${p.step}`);
      if (p.ctaCoveredByNav) critical.push(`${r.viewport.id}: CTA covered by bottom nav @ ${p.step}`);
      if (p.headerClipped) critical.push(`${r.viewport.id}: header clipped @ ${p.step}`);
      if (p.forbidden?.length) critical.push(`${r.viewport.id}: forbidden copy ${p.forbidden.join(',')}`);
      if (p.step === 'copy-check') {
        if (!p.hasDemoBanner) critical.push(`${r.viewport.id}: demo banner missing`);
        if (!p.hasDisclaimer) critical.push(`${r.viewport.id}: disclaimer missing`);
        if (!p.hasExternalOnly) critical.push(`${r.viewport.id}: external-only copy missing`);
      }
      if (p.step === '05-plan' && !p.authoritiesVisible) critical.push(`${r.viewport.id}: authorities section missing`);
    }
    const jump = r.probes.find((p) => p.step === 'scroll-jump');
    if (jump && jump.jumpPx > 120) critical.push(`${r.viewport.id}: large scroll jump ${jump.jumpPx}px`);
  }

  if (critical.length) {
    console.error('\nCRITICAL ISSUES:');
    critical.forEach((c) => console.error(' -', c));
    process.exit(2);
  }

  console.log('\nNo critical visual blockers detected.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
