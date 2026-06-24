#!/usr/bin/env node
/** Quick 390px QA for Wegweiser UX fixes (birth/kita, nav, regional CTA). */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3002').replace(/\/$/, '');
const OUT_DIR = join(process.cwd(), 'docs', 'screenshots', 'wegweiser-ux-fixes-qa');

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
  const secret = process.env.ADMIN_DEMO_SECRET?.trim();
  const demoId = 'eidconnect-v1';
  const url = secret
    ? `${BASE}/api/admin/enter-demo?secret=${encodeURIComponent(secret)}&demo_id=${encodeURIComponent(demoId)}`
    : `${BASE}/api/dev/enter-demo?demo_id=${encodeURIComponent(demoId)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);
  const du = page.locator('[data-anrede-value="du"]');
  if (await du.count()) await du.first().click();
  await page.waitForTimeout(400);
  const weiter = page.getByRole('button', { name: /^Weiter$/i });
  if (await weiter.count()) await weiter.first().click({ timeout: 15000 });
  await page.waitForTimeout(400);
  const direct = page.getByRole('button', { name: /Direkt zur App/i });
  if (await direct.count()) {
    await direct.first().click();
    await page.waitForTimeout(2000);
  }
  await page.waitForSelector('.civic-app-shell', { timeout: 20000 });
  const rewardsDismiss = page.getByRole('button', { name: /Nicht jetzt/i });
  if (await rewardsDismiss.count()) await rewardsDismiss.first().click().catch(() => {});
  await page.waitForTimeout(300);
  const wegweiserNav = page.getByRole('button', { name: /Wegweiser|Clara Wegweiser/i });
  await wegweiserNav.first().click({ timeout: 15000 });
  await page.waitForSelector('.clara-wegweiser', { timeout: 15000 });
  await page.waitForTimeout(500);
}

async function openWegweiser(page) {
  const wegweiserNav = page.getByRole('button', { name: /Wegweiser|Clara Wegweiser/i });
  if (await page.locator('.clara-wegweiser').count() === 0) {
    await wegweiserNav.first().click({ timeout: 10000 });
    await page.waitForSelector('.clara-wegweiser', { timeout: 15000 });
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const report = { base: BASE, viewport: '390x844', checks: [], screenshots: [] };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await bootstrap(page);

// Test A: Geburt & Kita startpoint
const geburtKita = page.getByRole('button', { name: /Geburt.*Kita/i }).first();
if (await geburtKita.count()) {
  await geburtKita.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT_DIR, 'A-01-geburt-kita-startpoint.png'), fullPage: true });
  report.screenshots.push('A-01-geburt-kita-startpoint.png');
  const chips = await page.locator('.wegweiser-clara-chat__chip').allTextContents();
  report.checks.push({
    id: 'A-chips',
    pass: chips.length > 1 && chips.some((c) => /Kita-Platz/i.test(c)),
    chips,
  });
  const kitaChip = page.getByRole('button', { name: 'Kita-Platz suchen' });
  if (await kitaChip.count()) {
    await kitaChip.click();
    const weiter = page.getByTestId('clarification-advance-btn');
    report.checks.push({
      id: 'A-weiter-enabled',
      pass: !(await weiter.isDisabled()),
    });
    await weiter.click();
    await page.waitForSelector('[data-testid="wegweiser-action-plan-result"]', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(OUT_DIR, 'A-02-kita-plan.png'), fullPage: true });
    report.screenshots.push('A-02-kita-plan.png');
    const firstCard = await page.locator('[data-testid^="action-plan-card-"]').first().textContent();
    report.checks.push({
      id: 'A-kita-first-action',
      pass: /Kita|Betreuung|vormerken/i.test(firstCard ?? ''),
      firstCard: firstCard?.slice(0, 120),
    });
  }
}

// Test B: Kita input text
await openWegweiser(page);
await page.locator('.clara-wegweiser__textarea').fill(
  'Ich suche einen Kita-Platz für mein zweijähriges Kind in Kirkel.',
);
await page.getByRole('button', { name: /Behördenfahrplan erstellen/i }).click();
await page.waitForSelector('[data-testid="clara-wegweiser-chat-flow"]', { timeout: 20000 }).catch(() => {});
const skipBtn = page.getByTestId('clarification-submit-skip-btn');
if (await skipBtn.count()) await skipBtn.click();
await page.waitForSelector('[data-testid="wegweiser-action-plan-result"]', { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(800);
await page.screenshot({ path: join(OUT_DIR, 'B-01-kita-input-plan.png'), fullPage: true });
report.screenshots.push('B-01-kita-input-plan.png');
const regionalCta = page.locator('[data-testid^="regional-action-cta-"]');
report.checks.push({
  id: 'B-regional-cta',
  pass: (await regionalCta.count()) > 0,
  count: await regionalCta.count(),
});
const dockVisible = await page.locator('.clara-dock-pill:visible').count();
report.checks.push({ id: 'B-dock-hidden-on-plan', pass: dockVisible === 0, dockVisible });

// Test C: nav during clarification
await openWegweiser(page);
await page.locator('.clara-wegweiser__textarea').fill('Ich bekomme ein Kind.');
await page.getByRole('button', { name: /Behördenfahrplan erstellen/i }).click();
await page.waitForSelector('[data-testid="clara-wegweiser-chat-flow"]', { timeout: 20000 });
const navPointerEvents = await page.evaluate(() => {
  const nav = document.querySelector('.app-bottom-nav');
  return nav ? getComputedStyle(nav).pointerEvents : null;
});
await page.getByRole('button', { name: 'Melden' }).click();
await page.waitForTimeout(600);
const activeAfterNav = await page.evaluate(() => document.querySelector('[data-testid="meldungen-section"]') !== null || document.body.innerText.includes('Melden'));
report.checks.push({
  id: 'C-nav-during-clarification',
  pass: navPointerEvents === 'auto',
  navPointerEvents,
});
await page.screenshot({ path: join(OUT_DIR, 'C-01-nav-after-clarification.png'), fullPage: true });
report.screenshots.push('C-01-nav-after-clarification.png');

// Test D: nav after plan
await openWegweiser(page);
await page.locator('.clara-wegweiser__textarea').fill('Ich suche Kita-Platz in Kirkel.');
await page.getByRole('button', { name: /Behördenfahrplan erstellen/i }).click();
await page.waitForSelector('[data-testid="clara-wegweiser-chat-flow"]', { timeout: 20000 }).catch(() => {});
if (await skipBtn.count()) await skipBtn.click();
await page.waitForSelector('[data-testid="wegweiser-action-plan-result"]', { timeout: 30000 }).catch(() => {});
await page.getByRole('button', { name: 'Beteiligen' }).click();
await page.waitForTimeout(600);
report.checks.push({
  id: 'D-nav-after-plan',
  pass: !(await page.locator('[data-clara-clarification-open]').count()),
});
await page.screenshot({ path: join(OUT_DIR, 'D-01-nav-after-plan.png'), fullPage: true });
report.screenshots.push('D-01-nav-after-plan.png');

// Test E: benefit copy
await openWegweiser(page);
const behoerdenText = await page.locator('text=Warum das Behörden entlastet').count();
const wasDuText = await page.locator('text=Was du davon hast').count();
report.checks.push({
  id: 'E-benefit-copy',
  pass: behoerdenText === 0 && wasDuText > 0,
  behoerdenText,
  wasDuText,
});

report.pass = report.checks.every((c) => c.pass);
writeFileSync(join(OUT_DIR, 'qa-report.json'), JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
