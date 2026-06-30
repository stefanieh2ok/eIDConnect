#!/usr/bin/env node
/**
 * Capture real app crops for Intro v2 Phase 3 film stills.
 * Output: public/intro/trailer/*.webp (token-free, no secrets)
 *
 * Usage: node scripts/capture-intro-trailer-assets.mjs [BASE_URL]
 * Requires: dev server running (default http://localhost:3002)
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3002').replace(/\/$/, '');
const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'public', 'intro', 'trailer');
const VIEWPORT = { width: 390, height: 844 };
const DEMO_IMAGE = join(ROOT, 'public', 'demo-rat-playground.jpg');
const MELDEN_TEXT = 'Ratten auf dem Drachenspielplatz in Kirkel-Neuhäusel';
const WEGWEISER_TEXT =
  'Ich wurde gekündigt und weiß nicht, was ich jetzt tun muss.';

const TARGETS = [
  'citizen-access-context',
  'melden-drachenspielplatz-input',
  'postfach-status-drachenspielplatz',
  'beteiligen-kirkel-action',
  'praemien-naturfreibad-wallet',
  'wahlen-bundestagswahl-stimmzettel',
  'wegweiser-kuendigung-fahrplan',
  'final-app-overview-trust',
];

async function saveWebp(pngBuffer, name) {
  const out = join(OUT_DIR, `${name}.webp`);
  await sharp(pngBuffer)
    .resize({ width: 780, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(out);
  console.log('→', out.replace(ROOT, '').replace(/\\/g, '/'));
}

async function cropLocator(locator, name) {
  await locator.waitFor({ state: 'visible', timeout: 45000 });
  const buf = await locator.screenshot({ type: 'png' });
  await saveWebp(buf, name);
}

async function dismissRewards(page) {
  const dismiss = page.getByRole('button', { name: /Nicht jetzt/i });
  if (await dismiss.count()) await dismiss.first().click().catch(() => {});
  await page.waitForTimeout(300);
}

async function skipIntroV2(page) {
  const intro = page.locator('[data-testid="intro-v2-walkthrough"]');
  if (!(await intro.count())) return;
  const primary = page.getByTestId('intro-v2-primary-cta');
  const label = (await primary.textContent())?.trim() ?? '';
  if (/Zeig mir/i.test(label)) {
    await primary.click({ timeout: 15000 });
    await page.waitForTimeout(350);
  }
  const skip = page.getByTestId('intro-v2-skip');
  if (await skip.count()) {
    await skip.first().click({ timeout: 15000 });
  } else {
    for (let i = 0; i < 7; i += 1) {
      const btn = page.getByTestId('intro-v2-primary-cta');
      if (!(await btn.count())) break;
      await btn.click({ timeout: 15000 });
      await page.waitForTimeout(300);
    }
  }
  await page.waitForTimeout(800);
}

async function bootstrapApp(page) {
  const url = `${BASE}/api/dev/enter-demo?demo_id=eidconnect-v1`;
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(1500);
  await skipIntroV2(page);
  await page.waitForSelector('.civic-app-shell', { timeout: 90000 });
  await dismissRewards(page);
}

async function mainContent(page) {
  return page.locator('#main-content');
}

async function navTo(page, section) {
  const map = {
    melden: '#tour-melden-btn',
    beteiligen: '#tour-voting-btn',
    wahlen: page.locator('.app-bottom-nav').getByRole('button', { name: 'Wahlen', exact: true }),
    wegweiser: page.getByRole('button', { name: /Wegweiser|Clara Wegweiser/i }).first(),
    praemien: '#tour-rewards-btn',
    postfach: page.getByRole('button', { name: 'Postfach öffnen', exact: true }),
  };
  const target = map[section];
  if (typeof target === 'string') {
    await page.locator(target).click({ timeout: 15000 });
  } else {
    await target.click({ timeout: 15000 });
  }
}

async function captureCitizenAccess(page) {
  await navTo(page, 'wegweiser');
  await page.waitForSelector('.clara-wegweiser', { timeout: 20000 });
  await page.waitForTimeout(600);
  await cropLocator(page.locator('.civic-app-shell'), 'citizen-access-context');
}

async function captureMelden(page) {
  await navTo(page, 'melden');
  await page.waitForTimeout(500);
  await page.locator('.meldung-category-pill', { hasText: 'Spielplatz' }).first().click({ timeout: 15000 });
  await page.waitForTimeout(400);
  const textarea = page.locator('#main-content textarea').first();
  await textarea.fill(MELDEN_TEXT);
  const fileInput = page.locator('#main-content input[type="file"]').first();
  if (await fileInput.count()) {
    await fileInput.setInputFiles(DEMO_IMAGE);
    await page.waitForTimeout(700);
  }
  await cropLocator(await mainContent(page), 'melden-drachenspielplatz-input');
}

async function capturePostfach(page) {
  await navTo(page, 'postfach');
  await page.waitForSelector('.postfach-section__title', { timeout: 20000 });
  await page.waitForTimeout(500);
  await cropLocator(await mainContent(page), 'postfach-status-drachenspielplatz');
}

async function ensureKommuneFilter(page) {
  const filter = page.locator('#main-content').getByRole('button', { name: 'Filter', exact: true });
  if (!(await filter.count())) return;
  await filter.first().click({ timeout: 10000 });
  const kommune = page.getByRole('menuitem', { name: /Kommune/i });
  if (await kommune.count()) {
    await kommune.first().click({ timeout: 10000 });
    await page.waitForTimeout(500);
  }
}

async function advanceToRadwegCard(page) {
  for (let i = 0; i < 10; i += 1) {
    const body = await page.locator('#main-content').innerText();
    if (/Radweg Kirkel/i.test(body)) return;
    const vote = page.locator('#main-content').getByRole('button', { name: /Enthalten/i });
    if (!(await vote.count())) break;
    await vote.first().click({ timeout: 10000 });
    await page.waitForTimeout(2400);
  }
}

async function captureBeteiligen(page) {
  await navTo(page, 'beteiligen');
  await ensureKommuneFilter(page);
  await advanceToRadwegCard(page);
  await dismissBlockingModals(page);
  await page.getByText(/Radweg Kirkel/i).first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(400);
  await cropLocator(await mainContent(page), 'beteiligen-kirkel-action');
}

async function dismissBlockingModals(page) {
  const stimmzettel = page.locator('.document-viewer[aria-label="Stimmzettel"]');
  if (await stimmzettel.count()) {
    const closeBtn = stimmzettel.getByRole('button', { name: 'Schließen', exact: true });
    if (await closeBtn.count()) await closeBtn.first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
  }
  const voteClose = page.locator('.civic-vote-feedback-overlay').getByRole('button', { name: /^Schließen$/i });
  if (await voteClose.count()) {
    await voteClose.first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(400);
  }
  const bulkClose = page.locator('.civic-bulk-vote-sheet').getByLabel(/Bulk-Abstimmung schließen/i);
  if (await bulkClose.count()) {
    await bulkClose.first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
  const rewardsDismiss = page.getByRole('button', { name: /Nicht jetzt/i });
  if (await rewardsDismiss.count()) {
    await rewardsDismiss.first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(250);
}

async function capturePraemien(page) {
  await dismissBlockingModals(page);
  await navTo(page, 'praemien');
  await ensureKommuneFilter(page);
  await page.waitForSelector('h2.app-shell-page-heading', { timeout: 20000 });
  const consent = page.getByLabel('Mitwirkungspunkte anzeigen');
  if (await consent.count()) await consent.check();
  await page.waitForTimeout(400);
  const card = page.getByRole('button', { name: /Naturfreibad Kirkel/i }).first();
  await card.click({ timeout: 15000 });
  await page.waitForTimeout(600);
  const walletBtn = page.getByRole('button', { name: /In Wallet speichern/i });
  if (await walletBtn.count()) {
    await walletBtn.first().click({ timeout: 10000 });
    await page.waitForTimeout(500);
  }
  await cropLocator(await mainContent(page), 'praemien-naturfreibad-wallet');
  const close = page.getByRole('button', { name: /^Schließen$/i });
  if (await close.count()) await close.first().click().catch(() => {});
  await page.waitForTimeout(400);
}

async function ensureWahlenBundFilter(page) {
  const open = page.getByRole('button', { name: /Filter öffnen/i });
  await open.first().click({ timeout: 15000 });
  await page.locator('[role="dialog"]').getByRole('button').filter({ hasText: 'Ebene' }).first().click({ timeout: 10000 });
  await page.getByRole('button', { name: /^Bund$/ }).click({ timeout: 10000 });
  await page.getByRole('button', { name: 'Anwenden' }).click({ timeout: 10000 });
  await page.waitForTimeout(500);
}

async function captureWahlen(page) {
  await dismissBlockingModals(page);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
  await navTo(page, 'wahlen');
  await ensureWahlenBundFilter(page);
  await page.locator('#main-content').getByRole('button', { name: 'Ergebnisse', exact: true }).click({ timeout: 15000 });
  await page.waitForTimeout(500);
  const card = page.locator('.election-card').filter({ hasText: /Bundestagswahl 2025/i }).first();
  await card.scrollIntoViewIfNeeded();
  await card.waitFor({ state: 'visible', timeout: 20000 });
  await card.getByRole('button', { name: /Stimmzettel anzeigen/i }).click({ timeout: 15000 });
  await page.waitForTimeout(900);
  await cropLocator(await mainContent(page), 'wahlen-bundestagswahl-stimmzettel');
  await dismissBlockingModals(page);
  await page.waitForTimeout(400);
}

async function captureWegweiser(page) {
  await dismissBlockingModals(page);
  await navTo(page, 'wegweiser');
  await page.waitForSelector('.clara-wegweiser', { timeout: 20000 });
  await page.locator('.clara-wegweiser__textarea').fill(WEGWEISER_TEXT);
  await page.getByRole('button', { name: /Behördenfahrplan erstellen/i }).click({ timeout: 15000 });
  await page.waitForSelector('[data-testid="clara-wegweiser-chat-flow"]', { timeout: 45000 });
  const skipBtn = page.getByTestId('clarification-submit-skip-btn');
  if (await skipBtn.count()) await skipBtn.click({ timeout: 15000 });
  await page.waitForSelector('[data-testid="wegweiser-action-plan-result"]', { timeout: 60000 });
  await page.waitForTimeout(800);
  await cropLocator(await mainContent(page), 'wegweiser-kuendigung-fahrplan');
}

async function captureFinalOverview(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await cropLocator(page.locator('.civic-app-shell'), 'final-app-overview-trust');
}

async function main() {
  if (!existsSync(DEMO_IMAGE)) {
    throw new Error(`Demo image missing: ${DEMO_IMAGE}`);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await context.newPage();

  try {
    await bootstrapApp(page);
    await captureCitizenAccess(page);
    await captureMelden(page);
    await capturePostfach(page);
    await captureBeteiligen(page);
    await capturePraemien(page);
    await captureWahlen(page);
    await captureWegweiser(page);
    await captureFinalOverview(page);

    console.log('\nCaptured', TARGETS.length, 'intro trailer assets.');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('capture-intro-trailer-assets failed:', err?.message || err);
  process.exit(1);
});
