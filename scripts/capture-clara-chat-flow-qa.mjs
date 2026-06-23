#!/usr/bin/env node
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3002').replace(/\/$/, '');
const OUT_DIR = join(process.cwd(), 'docs', 'screenshots', 'wegweiser-clara-chat-qa');

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
  await page.waitForTimeout(2000);
  const du = page.locator('[data-anrede-value="du"]');
  if (await du.count()) await du.first().click();
  await page.waitForTimeout(600);
  const weiter = page.getByRole('button', { name: /^Weiter$/i });
  if (await weiter.count()) await weiter.first().click({ timeout: 15000 });
  await page.waitForTimeout(600);
  const direct = page.getByRole('button', { name: /Direkt zur App/i });
  if (await direct.count()) {
    await direct.first().click();
    await page.waitForTimeout(2500);
  }
  await page.waitForSelector('.civic-app-shell', { timeout: 20000 });
  const rewardsDismiss = page.getByRole('button', { name: /Nicht jetzt/i });
  if (await rewardsDismiss.count()) await rewardsDismiss.first().click().catch(() => {});
  await page.waitForTimeout(400);
  const wegweiserNav = page
    .getByRole('button', { name: 'Wegweiser' })
    .or(page.locator('.app-bottom-nav__item').filter({ hasText: 'Wegweiser' }));
  await wegweiserNav.first().click({ timeout: 15000 });
  await page.waitForSelector('.clara-wegweiser', { timeout: 15000 });
  await page.waitForTimeout(700);
}

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await bootstrap(page);

const textarea = page.locator('.clara-wegweiser__textarea');
await textarea.fill('Ich wurde gekündigt. Was muss ich tun?');
await page.getByRole('button', { name: /Behördenfahrplan erstellen/i }).click();
await page.waitForSelector('[data-testid="clara-wegweiser-chat-flow"]', { timeout: 30000 });
await page.screenshot({ path: join(OUT_DIR, 'mobile-01-chat-intro.png'), fullPage: true });

await page.getByRole('button', { name: 'Bereits beendet' }).click();
await page.screenshot({ path: join(OUT_DIR, 'mobile-02-chip-selected.png'), fullPage: true });
await page.getByTestId('clarification-advance-btn').click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT_DIR, 'mobile-03-question-2.png'), fullPage: true });

await page.getByTestId('clarification-submit-skip-btn').click();
await page.waitForSelector('[data-testid="wegweiser-compact-summary"]', { timeout: 30000 });
await page.screenshot({ path: join(OUT_DIR, 'mobile-04-compact-result.png'), fullPage: true });

await browser.close();
console.log(`Screenshots saved to ${OUT_DIR}`);
