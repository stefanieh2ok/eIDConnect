#!/usr/bin/env node
/**
 * 390×844 QA screenshots for the four main app modules (density/navigation v2).
 * Intro is skipped via localStorage bootstrap — no intro source files touched.
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3005').replace(/\/$/, '');
const OUT_DIR = join(process.cwd(), 'docs', 'screenshots', 'app-ui-density-v2-qa');

const MODULES = [
  {
    id: 'wegweiser',
    navLabel: 'Wegweiser',
    h1: 'Anliegen vorbereiten',
    wait: '.clara-wegweiser',
    file: '01-wegweiser-anliegen-vorbereiten.png',
  },
  {
    id: 'melden',
    navLabel: 'Melden',
    h1: 'Neue Meldung',
    wait: '#meldungen-screen-title',
    file: '02-melden-neue-meldung.png',
  },
  {
    id: 'beteiligen',
    navLabel: 'Beteiligen',
    h1: 'Abstimmungen',
    wait: '#beteiligen-screen-title',
    file: '03-beteiligen-abstimmungen.png',
  },
  {
    id: 'wahlen',
    navLabel: 'Wahlen',
    h1: 'Wahlinformationen',
    wait: '#wahlen-screen-title',
    file: '04-wahlen-wahlinformationen.png',
  },
];

async function bootstrapLoggedIn(page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('eidconnect_product_intro_done_v4', 'true');
      sessionStorage.setItem('eidconnect_prelogin_v2', 'ok');
      sessionStorage.setItem('eidconnect_wants_walkthrough_v1', '0');
      localStorage.setItem('eidconnect_rewards_optin_prompt_shown_v1', '1');
    } catch {
      /* ignore */
    }
  });

  const demoId = 'eidconnect-v1';
  const url = `${BASE}/api/dev/enter-demo?demo_id=${encodeURIComponent(demoId)}`;

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

async function clickNav(page, label) {
  const byLabel = page.locator('.app-bottom-nav__label').filter({ hasText: label });
  if (await byLabel.count()) {
    await byLabel.first().click();
    await page.waitForTimeout(700);
    return true;
  }
  const btn = page.locator('.app-bottom-nav__item').filter({ hasText: label });
  if (await btn.count()) {
    await btn.first().click();
    await page.waitForTimeout(700);
    return true;
  }
  const pilot = page.getByRole('button', { name: /Clara Wegweiser/i });
  if (label === 'Wegweiser' && (await pilot.count())) {
    await pilot.first().click();
    await page.waitForTimeout(700);
    return true;
  }
  const fallback = page.getByRole('button', { name: new RegExp(`^${label}$`, 'i') });
  if (await fallback.count()) {
    await fallback.first().click();
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

async function captureModule(page, mod, report) {
  const clicked = await clickNav(page, mod.navLabel);
  if (!clicked) throw new Error(`Nav button not found: ${mod.navLabel}`);

  await page.waitForSelector(mod.wait, { timeout: 20000 });
  await page.waitForTimeout(500);

  const h1 = page.locator('h1.civic-screen-h1');
  const h1Text = (await h1.first().textContent())?.trim() ?? null;

  await page.locator('#main-content').evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.waitForTimeout(200);

  const path = join(OUT_DIR, mod.file);
  await page.screenshot({ path, fullPage: false });
  report.screenshots.push(mod.file);
  report.checks.push({
    module: mod.id,
    h1Expected: mod.h1,
    h1Found: h1Text,
    pass: h1Text === mod.h1,
  });
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
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

try {
  await bootstrapLoggedIn(page);
  for (const mod of MODULES) {
    await captureModule(page, mod, report);
  }
  report.allPass = report.checks.every((c) => c.pass);
} catch (err) {
  report.error = String(err?.message || err);
  report.allPass = false;
  await page.screenshot({ path: join(OUT_DIR, 'error-state.png'), fullPage: true }).catch(() => {});
  if (!report.screenshots.includes('error-state.png')) report.screenshots.push('error-state.png');
} finally {
  await browser.close();
}

writeFileSync(join(OUT_DIR, 'capture-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exit(report.allPass ? 0 : 1);
