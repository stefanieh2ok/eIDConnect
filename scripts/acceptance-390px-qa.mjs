#!/usr/bin/env node
/**
 * Hard manual acceptance criteria @ 390px — programmatic probes.
 * Usage: node scripts/acceptance-390px-qa.mjs [BASE_URL]
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3002').replace(/\/$/, '');
const OUT_DIR = join(process.cwd(), 'docs', 'screenshots', 'acceptance-390px-qa');
const VIEWPORT = { width: 390, height: 844 };

function loadEnvLocal() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
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

async function bootstrap(page) {
  loadEnvLocal();
  const demoId = 'eidconnect-v1';
  // Prefer dev enter — no secret required, stable for local QA
  const url = `${BASE}/api/dev/enter-demo?demo_id=${encodeURIComponent(demoId)}`;
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(2000);
  const du = page.locator('[data-anrede-value="du"]');
  if (await du.count()) await du.first().click();
  await page.waitForTimeout(400);
  const weiter = page.getByRole('button', { name: /^Weiter$/i });
  if (await weiter.count()) {
    try {
      await page.waitForFunction(
        () => {
          const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Weiter');
          return btn && !btn.disabled;
        },
        { timeout: 8000 },
      );
      await weiter.first().click({ timeout: 15000 });
    } catch {
      await page.waitForTimeout(3000);
    }
    await page.waitForTimeout(600);
  }
  const direct = page.getByRole('button', { name: /Direkt zur App/i });
  if (await direct.count()) {
    await direct.first().click();
    await page.waitForTimeout(2000);
  }
  await page.waitForSelector('.civic-app-shell', { timeout: 90000 });
  const rewardsDismiss = page.getByRole('button', { name: /Nicht jetzt/i });
  if (await rewardsDismiss.count()) await rewardsDismiss.first().click().catch(() => {});
  await page.waitForTimeout(400);
}

async function openWegweiser(page) {
  const nav = page.getByRole('button', { name: /Wegweiser|Clara Wegweiser/i });
  await nav.first().click({ timeout: 15000 });
  await page.waitForSelector('.clara-wegweiser', { timeout: 20000 });
  await page.waitForTimeout(500);
}

async function startClarification(page, text) {
  await page.locator('.clara-wegweiser__textarea').fill(text);
  await page.getByRole('button', { name: /Behördenfahrplan erstellen/i }).click();
  await page.waitForSelector('[data-testid="clara-wegweiser-chat-flow"]', { timeout: 30000 });
}

async function probeUiLocks(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const shell = document.querySelector('.civic-app-shell');
    const main = document.getElementById('main-content');
    const modalRoot = document.getElementById('civic-app-modal-root');
    const nav = document.querySelector('.app-bottom-nav');
    return {
      clarificationOpen: doc.hasAttribute('data-clara-clarification-open'),
      mainOverflow: main?.style.overflow ?? '',
      modalPointerEvents: modalRoot ? getComputedStyle(modalRoot).pointerEvents : null,
      navPointerEvents: nav ? getComputedStyle(nav).pointerEvents : null,
      modalChildren: modalRoot?.children.length ?? 0,
    };
  });
}

async function probeDockOverlap(page) {
  return page.evaluate(() => {
    const dock = document.querySelector('.clara-dock-pill');
    if (!dock) return { dockVisible: false, overlaps: [] };
    const dockRect = dock.getBoundingClientRect();
    if (dockRect.width === 0 || dockRect.height === 0 || getComputedStyle(dock).visibility === 'hidden') {
      return { dockVisible: false, overlaps: [] };
    }
    const selectors = [
      '.wegweiser-action-plan-card__cta',
      '.wegweiser-action-plan-card__title',
      '.wegweiser-action-plan-card__docs',
      '.app-bottom-nav',
      '[data-testid^="regional-action-cta-"]',
    ];
    const overlaps = [];
    for (const sel of selectors) {
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const hit =
          dockRect.left < r.right &&
          dockRect.right > r.left &&
          dockRect.top < r.bottom &&
          dockRect.bottom > r.top;
        if (hit) overlaps.push(sel);
      }
    }
    return { dockVisible: true, overlaps: [...new Set(overlaps)] };
  });
}

async function probeRegionalCtas(page) {
  return page.evaluate(() => {
    const issues = [];
    const cards = document.querySelectorAll('.wegweiser-action-plan-card');
    cards.forEach((card) => {
      const ctas = card.querySelectorAll('.wegweiser-action-plan-card__cta');
      ctas.forEach((cta) => {
        const text = cta.textContent?.trim() ?? '';
        const isButton = cta.tagName === 'BUTTON';
        const isLink = cta.tagName === 'A' && cta.getAttribute('href');
        const isDisabled = cta.classList.contains('wegweiser-action-plan-card__cta--disabled');
        const looksActive =
          !isDisabled &&
          !cta.classList.contains('wegweiser-action-plan-card__cta--muted') &&
          text.length > 0;
        if (looksActive && !isButton && !isLink) {
          issues.push({ text, problem: 'active-looking but not clickable' });
        }
        if (text.includes('Zuständige Stelle hängt') && !isButton && !isLink && !isDisabled) {
          issues.push({ text, problem: 'dead regional text without action' });
        }
      });
    });
    return issues;
  });
}

mkdirSync(OUT_DIR, { recursive: true });
const report = { base: BASE, viewport: VIEWPORT, criteria: [], pass: false };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
await bootstrap(page);
await openWegweiser(page);

// 1. No freeze during clarification
await startClarification(page, 'Ich bekomme ein Kind.');
const locksDuringClarification = await probeUiLocks(page);
report.criteria.push({
  id: '1-nav-pointer-events-during-clarification',
  pass: locksDuringClarification.navPointerEvents === 'auto',
  detail: locksDuringClarification,
});

for (const [label, sectionProbe] of [
  ['Melden', () => page.getByRole('button', { name: 'Melden' })],
  ['Beteiligen', () => page.getByRole('button', { name: 'Beteiligen' })],
  ['Wahlen', () => page.getByRole('button', { name: 'Wahlen' })],
]) {
  await openWegweiser(page);
  await startClarification(page, 'Ich bekomme ein Kind.');
  const beforeUrl = page.url();
  await sectionProbe().click({ timeout: 5000 });
  await page.waitForTimeout(700);
  const locks = await probeUiLocks(page);
  const navigated = !(await page.locator('[data-testid="clara-wegweiser-chat-flow"]').isVisible().catch(() => false));
  report.criteria.push({
    id: `1-nav-${label.toLowerCase()}-works`,
    pass:
      locks.navPointerEvents === 'auto' &&
      locks.clarificationOpen === false &&
      navigated,
    detail: { label, locks, navigated, url: page.url() },
  });
  await page.screenshot({
    path: join(OUT_DIR, `1-after-${label.toLowerCase()}-nav.png`),
    fullPage: true,
  });
}

// 2. Birth/Kita startpoint
await openWegweiser(page);
const geburtKita = page.getByRole('button', { name: /Geburt.*Kita/i }).first();
await geburtKita.click();
await page.waitForTimeout(400);
await page.getByRole('button', { name: /Behördenfahrplan erstellen/i }).click();
await page.waitForSelector('[data-testid="clara-wegweiser-chat-flow"]', { timeout: 45000 });
const chips = await page.locator('.wegweiser-clara-chat__chip').allTextContents();
const nonNotSure = chips.filter((c) => !/Weiß ich nicht/i.test(c));
report.criteria.push({
  id: '2-birth-kita-multiple-options',
  pass: chips.length > 1 && nonNotSure.length > 0,
  detail: { chips },
});
await page.screenshot({ path: join(OUT_DIR, '2-birth-kita-chips.png'), fullPage: true });

await page.getByRole('button', { name: 'Kita-Platz suchen' }).click();
const weiterBtn = page.getByTestId('clarification-advance-btn');
report.criteria.push({
  id: '2-weiter-enabled-after-kita-chip',
  pass: !(await weiterBtn.isDisabled()),
});
await weiterBtn.click();
await page.waitForSelector('[data-testid="wegweiser-action-plan-result"]', { timeout: 45000 });
const firstCardText = await page.locator('[data-testid^="action-plan-card-"]').first().textContent();
report.criteria.push({
  id: '2-kita-first-plan',
  pass: /Kita|Betreuung|vormerken/i.test(firstCardText ?? '') && !/Geburt beurkunden/i.test(firstCardText ?? ''),
  detail: { firstCardText: firstCardText?.slice(0, 160) },
});
await page.screenshot({ path: join(OUT_DIR, '2-kita-plan-result.png'), fullPage: true });

// 3. Regional CTAs on kita plan
const regionalIssues = await probeRegionalCtas(page);
const regionalCtaCount = await page.locator('[data-testid^="regional-action-cta-"]').count();
report.criteria.push({
  id: '3-regional-ctas-clickable-or-disabled',
  pass: regionalIssues.length === 0,
  detail: { regionalIssues, regionalCtaCount },
});
if (regionalCtaCount > 0) {
  await page.locator('[data-testid^="regional-action-cta-"]').first().click();
  const guideVisible = await page.locator('[data-testid^="regional-action-guide-"]').first().isVisible();
  report.criteria.push({
    id: '3-regional-cta-opens-guide',
    pass: guideVisible,
  });
}

// 4. Clara dock overlap on result
const dockProbe = await probeDockOverlap(page);
report.criteria.push({
  id: '4-dock-no-overlap',
  pass: !dockProbe.dockVisible || dockProbe.overlaps.length === 0,
  detail: dockProbe,
});
const angabenBearbeiten = await page.getByRole('button', { name: /Angaben bearbeiten/i }).count();
report.criteria.push({
  id: '4-angaben-bearbeiten-available',
  pass: angabenBearbeiten > 0,
  detail: { angabenBearbeiten },
});

// 5. Navigation after Fahrplan trotzdem erstellen
await openWegweiser(page);
await page.locator('.clara-wegweiser__textarea').fill('Ich suche Kita-Platz in Kirkel.');
await page.getByRole('button', { name: /Behördenfahrplan erstellen/i }).click();
await page.waitForSelector('[data-testid="clara-wegweiser-chat-flow"]', { timeout: 30000 }).catch(() => {});
await page.getByTestId('clarification-submit-skip-btn').click();
await page.waitForSelector('[data-testid="wegweiser-action-plan-result"]', { timeout: 45000 });
const locksAfterPlan = await probeUiLocks(page);
report.criteria.push({
  id: '5-no-locks-after-plan',
  pass:
    !locksAfterPlan.clarificationOpen &&
    locksAfterPlan.mainOverflow !== 'hidden' &&
    locksAfterPlan.navPointerEvents === 'auto',
  detail: locksAfterPlan,
});
await page.getByRole('button', { name: 'Beteiligen' }).click();
await page.waitForTimeout(700);
const locksAfterNav = await probeUiLocks(page);
report.criteria.push({
  id: '5-nav-after-plan',
  pass: locksAfterNav.navPointerEvents === 'auto' && !locksAfterNav.clarificationOpen,
  detail: locksAfterNav,
});
await page.screenshot({ path: join(OUT_DIR, '5-nav-after-plan.png'), fullPage: true });

report.pass = report.criteria.every((c) => c.pass);
writeFileSync(join(OUT_DIR, 'acceptance-report.json'), JSON.stringify(report, null, 2));
await browser.close();

console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
