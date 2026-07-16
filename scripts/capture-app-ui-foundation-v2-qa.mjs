#!/usr/bin/env node
/**
 * Paket 1C — 390×844 foundation QA (12 screenshots + visual checks).
 * Intro skipped via localStorage; no intro source files touched.
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3005').replace(/\/$/, '');
const OUT_DIR = join(process.cwd(), 'docs', 'screenshots', 'app-ui-foundation-v2-qa');

const H1_MAP = {
  wegweiser: 'Anliegen vorbereiten',
  melden: 'Neue Meldung',
  beteiligen: 'Abstimmungen',
  wahlen: 'Wahlinformationen',
  kalender: 'Kalender',
  praemien: 'Prämien',
  postfach: 'Postfach',
  einstellungen: 'Einstellungen',
};

async function bootstrapLoggedIn(page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('eidconnect_product_intro_done_v4', 'true');
      sessionStorage.setItem('eidconnect_prelogin_v2', 'ok');
      sessionStorage.setItem('eidconnect_wants_walkthrough_v1', '0');
      localStorage.setItem('eidconnect_rewards_optin_prompt_shown_v1', '1');
      localStorage.setItem('eidconnect_consent_local_benefits', 'true');
    } catch {
      /* ignore */
    }
  });

  const url = `${BASE}/api/dev/enter-demo?demo_id=${encodeURIComponent('eidconnect-v1')}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);

  const skipIntro = page.locator('[data-testid="intro-v2-skip"]');
  if (await skipIntro.count()) {
    await skipIntro.first().click();
    await page.waitForTimeout(1500);
  }

  const duBtn = page.getByRole('button', { name: /^Du$/i });
  if (await duBtn.count()) {
    await duBtn.first().click();
    await page.waitForTimeout(400);
  }

  const weiter = page.getByRole('button', { name: /^Weiter$/i });
  if (await weiter.count()) await weiter.first().click({ timeout: 10000 }).catch(() => {});

  const direct = page.getByRole('button', { name: /Direkt zur App/i });
  if (await direct.count()) {
    await direct.first().click();
    await page.waitForTimeout(1200);
  }

  await page.waitForSelector('.app-bottom-nav, .civic-app-shell', { timeout: 30000 });
  await page.waitForTimeout(500);

  const rewardsDismiss = page.getByRole('button', { name: /Nicht jetzt/i });
  if (await rewardsDismiss.count()) await rewardsDismiss.first().click().catch(() => {});
  await page.waitForTimeout(300);
}

async function scrollMainToTop(page) {
  await page.locator('#main-content').evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.waitForTimeout(200);
}

async function clickBottomNav(page, label) {
  const byLabel = page.locator('.app-bottom-nav__label').filter({ hasText: label });
  if (await byLabel.count()) {
    await byLabel.first().click();
    await page.waitForTimeout(700);
    return;
  }
  await page.getByRole('button', { name: new RegExp(`^${label}$`, 'i') }).first().click();
  await page.waitForTimeout(700);
}

async function clickUtilityIcon(page, ariaLabel) {
  const btn = page.getByRole('button', { name: ariaLabel });
  await btn.first().click();
  await page.waitForTimeout(600);
}

async function readH1(page) {
  return (await page.locator('h1.civic-screen-h1').first().textContent())?.trim() ?? null;
}

async function watermarkOverContent(page) {
  return page.evaluate(() => {
    const wm = document.querySelector('.app-confidential-watermark');
    if (!wm || getComputedStyle(wm).display === 'none') return false;
    const rect = wm.getBoundingClientRect();
    const main = document.getElementById('main-content');
    if (!main) return false;
    const m = main.getBoundingClientRect();
    return rect.bottom > m.top + 40 && rect.top < m.bottom - 40;
  });
}

async function claraOverlapsMain(page) {
  return page.evaluate(() => {
    const main = document.getElementById('main-content');
    const clara = document.querySelector('.clara-dock-pill, .clara-dock-fab');
    if (!main || !clara) return false;
    const m = main.getBoundingClientRect();
    const c = clara.getBoundingClientRect();
    const cards = [...main.querySelectorAll('.election-card, .postfach-message-card, .meldung-category-row')];
    for (const card of cards.slice(0, 6)) {
      const r = card.getBoundingClientRect();
      if (r.bottom < m.top + 80 || r.top > m.bottom) continue;
      const overlap = !(c.right < r.left || c.left > r.right || c.bottom < r.top || c.top > r.bottom);
      if (overlap) return true;
    }
    return false;
  });
}

async function leftAxisAligned(page) {
  return page.evaluate(() => {
    const pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--civic-page-pad-x')) || 16;
    const brand = document.querySelector('.app-shell-brand-wordmark, .product-identity-header--wordmark img');
    const h1 = document.querySelector('h1.civic-screen-h1');
    if (!brand || !h1) return { pass: true, delta: 0 };
    const brandLeft = brand.getBoundingClientRect().left;
    const h1Left = h1.getBoundingClientRect().left;
    const delta = Math.abs(brandLeft - h1Left);
    return { pass: delta <= 2, delta, brandLeft, h1Left, expectedPad: pad };
  });
}

async function metaLabelNotTruncated(page) {
  return page.evaluate(() => {
    const label = document.querySelector('.civic-screen-meta__label--wrap');
    if (!label) return { pass: false, reason: 'no-wrap-label' };
    const cs = getComputedStyle(label);
    return {
      pass: cs.whiteSpace !== 'nowrap' && cs.textOverflow !== 'ellipsis',
      whiteSpace: cs.whiteSpace,
      textOverflow: cs.textOverflow,
    };
  });
}


async function shot(page, file, report, meta = {}) {
  await scrollMainToTop(page);
  const path = join(OUT_DIR, file);
  await page.screenshot({ path, fullPage: false });
  report.screenshots.push({ file, ...meta });
}

mkdirSync(OUT_DIR, { recursive: true });
const report = {
  base: BASE,
  viewport: '390x844',
  capturedAt: new Date().toISOString(),
  checks: [],
  screenshots: [],
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await context.newPage();

try {
  await bootstrapLoggedIn(page);

  // 01 Wegweiser
  await clickBottomNav(page, 'Wegweiser');
  await page.waitForSelector('#wegweiser-screen-title, .clara-wegweiser', { timeout: 20000 });
  const h1w = await readH1(page);
  report.checks.push({ screen: 'wegweiser', h1: h1w, pass: h1w === H1_MAP.wegweiser });
  await shot(page, '01-wegweiser-foundation-v2.png', report, { screen: 'wegweiser' });

  // 02–03 Melden steps
  await clickBottomNav(page, 'Melden');
  await page.waitForSelector('#meldungen-screen-title', { timeout: 20000 });
  report.checks.push({
    screen: 'melden-step1',
    h1: await readH1(page),
    hasPruefen: (await page.locator('.civic-step-progress__label').allTextContents()).includes('Prüfen'),
    noSchritt13: (await page.locator('text=/Schritt\\s+\\d\\/3/i').count()) === 0,
    noAktuelleMeldungen: (await page.locator('text=/Aktuelle Meldungen/i').count()) === 0,
    pass:
      (await readH1(page)) === H1_MAP.melden &&
      (await page.locator('text=/Aktuelle Meldungen/i').count()) === 0,
  });
  await shot(page, '02-melden-step1-foundation-v2.png', report, { screen: 'melden-step1' });

  await page.locator('.meldung-category-row button').first().click();
  await page.waitForTimeout(500);
  await shot(page, '03-melden-step2-foundation-v2.png', report, { screen: 'melden-step2' });

  // 04 Beteiligen
  await clickBottomNav(page, 'Beteiligen');
  await page.waitForSelector('#beteiligen-screen-title', { timeout: 20000 });
  const axisBeteiligen = await leftAxisAligned(page);
  report.checks.push({
    screen: 'beteiligen',
    h1: await readH1(page),
    hasTablist: (await page.locator('[role="tablist"]').count()) > 0,
    hasScopeChip: (await page.locator('.civic-scope-chip').count()) > 0,
    noIsolatedFilter: (await page.getByRole('button', { name: /^Filter$/i }).count()) === 0,
    noAuswahlKommune: (await page.locator('text=/Auswahl:\\s*Kommune/i').count()) === 0,
    axisAligned: axisBeteiligen.pass,
    pass:
      (await readH1(page)) === H1_MAP.beteiligen &&
      (await page.getByRole('button', { name: /^Filter$/i }).count()) === 0 &&
      axisBeteiligen.pass,
  });
  await shot(page, '04-beteiligen-foundation-v2.png', report, { screen: 'beteiligen' });

  // 05 Wahlen
  await clickBottomNav(page, 'Wahlen');
  await page.waitForSelector('#wahlen-screen-title', { timeout: 20000 });
  report.checks.push({
    screen: 'wahlen',
    h1: await readH1(page),
    noFilterForeign: (await page.getByRole('button', { name: /Filter\s*\(/i }).count()) === 0,
    hasAnpassenChip: (await page.locator('.civic-scope-chip__label', { hasText: /Anpassen/i }).count()) > 0,
    pass:
      (await readH1(page)) === H1_MAP.wahlen &&
      (await page.getByRole('button', { name: /Filter\s*\(/i }).count()) === 0,
  });
  await shot(page, '05-wahlen-foundation-v2.png', report, { screen: 'wahlen' });

  // 06 Kalender
  await clickUtilityIcon(page, 'Termine öffnen');
  await page.waitForSelector('#kalender-screen-title', { timeout: 20000 });
  report.checks.push({
    screen: 'kalender',
    h1: await readH1(page),
    noRedundantJahrAuswahlRow: (await page.locator('text=/Jahr:\\s*.*Auswahl:/i').count()) === 0,
    hasScopeInHeader: (await page.locator('#kalender-screen-title').locator('..').locator('.civic-scope-chip, select').count()) >= 0,
    pass:
      (await readH1(page)) === H1_MAP.kalender &&
      (await page.locator('text=/Jahr:\\s*.*Auswahl:/i').count()) === 0,
  });
  await shot(page, '06-kalender-foundation-v2.png', report, { screen: 'kalender' });

  // 07 Prämien
  await clickUtilityIcon(page, 'Prämien');
  await page.waitForSelector('#praemien-screen-title', { timeout: 20000 });
  await scrollMainToTop(page);
  const praemienH1Box = await page.locator('#praemien-screen-title').boundingBox();
  const pointsBadgeBox = await page.locator('.civic-points-badge').first().boundingBox().catch(() => null);
  report.checks.push({
    screen: 'praemien',
    h1: await readH1(page),
    titleBeforePoints:
      praemienH1Box && pointsBadgeBox ? praemienH1Box.y <= pointsBadgeBox.y + 4 : true,
    hasPointsBadge: (await page.locator('.civic-points-badge').count()) > 0,
    pass: (await readH1(page)) === H1_MAP.praemien,
  });
  await shot(page, '07-praemien-foundation-v2.png', report, { screen: 'praemien' });

  // 08 Postfach
  await clickUtilityIcon(page, 'Postfach öffnen');
  await page.waitForSelector('#postfach-screen-title', { timeout: 20000 });
  const postfachMeta = await metaLabelNotTruncated(page);
  report.checks.push({
    screen: 'postfach',
    h1: await readH1(page),
    metaWrap: postfachMeta.pass,
    pass: (await readH1(page)) === H1_MAP.postfach && postfachMeta.pass,
  });
  await shot(page, '08-postfach-foundation-v2.png', report, { screen: 'postfach' });

  // 09 Einstellungen (Hauptansicht, kein Modal)
  await clickUtilityIcon(page, 'Einstellungen öffnen');
  await page.waitForSelector('#settings-screen-title', { timeout: 20000 });
  const settingsIsMain = await page.evaluate(() => {
    const modal = document.querySelector('.settings-overlay');
    const screen = document.getElementById('settings-screen');
    return !modal && Boolean(screen);
  });
  report.checks.push({
    screen: 'einstellungen',
    h1: await readH1(page),
    mainViewNotModal: settingsIsMain,
    hasBackButton: (await page.getByRole('button', { name: /Zurück zur App/i }).count()) > 0,
    pass: (await readH1(page)) === H1_MAP.einstellungen && settingsIsMain,
  });
  await shot(page, '09-einstellungen-foundation-v2.png', report, { screen: 'einstellungen' });
  await page.getByRole('button', { name: /Zurück zur App/i }).first().click().catch(() => {});
  await page.waitForTimeout(400);

  // Clara safe overlays
  await clickBottomNav(page, 'Beteiligen');
  await page.waitForTimeout(500);
  report.checks.push({
    screen: 'beteiligen-clara',
    fabMode: await page.evaluate(() => document.documentElement.dataset.claraDockMode === 'fab'),
    overlap: await claraOverlapsMain(page),
    pass: (await claraOverlapsMain(page)) === false,
  });
  await shot(page, '10-beteiligen-clara-safe.png', report, { screen: 'beteiligen-clara' });

  await clickBottomNav(page, 'Wahlen');
  await page.waitForTimeout(500);
  report.checks.push({
    screen: 'wahlen-clara',
    fabMode: await page.evaluate(() => document.documentElement.dataset.claraDockMode === 'fab'),
    overlap: await claraOverlapsMain(page),
    pass: (await claraOverlapsMain(page)) === false,
  });
  await shot(page, '11-wahlen-clara-safe.png', report, { screen: 'wahlen-clara' });

  await clickUtilityIcon(page, 'Postfach öffnen');
  await page.waitForTimeout(500);
  report.checks.push({
    screen: 'postfach-clara',
    fabMode: await page.evaluate(() => document.documentElement.dataset.claraDockMode === 'fab'),
    overlap: await claraOverlapsMain(page),
    pass: (await claraOverlapsMain(page)) === false,
  });
  await shot(page, '12-postfach-clara-safe.png', report, { screen: 'postfach-clara' });

  report.watermarkOverContent = await watermarkOverContent(page);
  report.allPass =
    report.checks.every((c) => c.pass !== false && c.overlap !== true) &&
    !report.watermarkOverContent;
} catch (err) {
  report.error = String(err?.message || err);
  report.allPass = false;
  await page.screenshot({ path: join(OUT_DIR, 'error-state.png'), fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

// Contact sheet: simple HTML grid referencing all PNGs
const pngs = report.screenshots.map((s) => s.file).filter((f) => f.endsWith('.png'));
const contactHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"/><title>App UI Foundation v2 QA</title>
<style>body{font-family:system-ui,sans-serif;background:#f0f4f8;padding:16px}h1{font-size:18px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.item{background:#fff;border:1px solid #d6e0ee;border-radius:12px;padding:8px}
.item img{width:100%;height:auto;border-radius:8px}.item p{font-size:11px;margin:6px 0 0;color:#334155}</style></head>
<body><h1>App UI Foundation v2 — Kontaktübersicht (390×844)</h1><div class="grid">
${pngs.map((f) => `<div class="item"><img src="./${f}" alt="${f}"/><p>${f}</p></div>`).join('\n')}
</div></body></html>`;
writeFileSync(join(OUT_DIR, 'contact-sheet.html'), contactHtml, 'utf8');
writeFileSync(join(OUT_DIR, 'capture-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exit(report.allPass ? 0 : 1);
