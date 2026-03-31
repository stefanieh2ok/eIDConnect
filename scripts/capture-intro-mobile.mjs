#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.argv[2] || 'http://localhost:3002';
const OUT_DIR = path.resolve(process.cwd(), 'public', 'intro');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function dismissIntroIfPresent(page) {
  const dialog = page.locator('[role="dialog"]').filter({ hasText: /Schritt \d+ von/ }).first();
  if (!(await dialog.count())) return;
  for (let i = 0; i < 8; i += 1) {
    const finish = dialog.getByRole('button', { name: 'Einführung abschließen' });
    if (await finish.count()) {
      await finish.click().catch(() => {});
      await page.waitForTimeout(500);
      return;
    }
    const next = dialog.getByRole('button', { name: 'Weiter' });
    if (await next.count()) {
      await next.click().catch(() => {});
      await page.waitForTimeout(300);
      continue;
    }
    break;
  }
}

async function completeLogin(page) {
  const maybeWeiter = page.getByRole('button', { name: 'Weiter' });
  if (await maybeWeiter.count()) {
    await maybeWeiter.first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
  const duBtn = page.getByRole('button', { name: 'Du' });
  if (await duBtn.count()) {
    await duBtn.first().click().catch(() => {});
    await page.waitForTimeout(250);
  }
  const appBtn = page.getByRole('button', { name: 'Zur Demo-App' });
  if (await appBtn.count()) {
    await appBtn.first().click().catch(() => {});
    await page.waitForTimeout(900);
  }
  const skipTour = page.getByRole('button', { name: 'Überspringen' });
  if (await skipTour.count()) {
    await skipTour.first().click().catch(() => {});
    await page.waitForTimeout(350);
  }
}

async function gotoApp(page) {
  await page.goto(`${BASE_URL}/demo/eidconnect-v1?resetIntro=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1400);
  await dismissIntroIfPresent(page);
  await completeLogin(page);
  await page.waitForTimeout(800);
}

async function capture(page, name, action) {
  await action();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT_DIR, name), fullPage: true });
  console.log('saved', name);
}

async function clickNav(page, label) {
  const btn = page.getByRole('button', { name: label }).first();
  await btn.click({ timeout: 10000 });
}

async function main() {
  await ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  try {
    await gotoApp(page);
    await capture(page, 'intro-beteiligung.png', async () => clickNav(page, 'Abstimmen'));
    await capture(page, 'intro-wahlen.png', async () => clickNav(page, 'Wahlen'));
    await capture(page, 'intro-kalender.png', async () => clickNav(page, 'Kalender'));
    await capture(page, 'intro-meldungen.png', async () => clickNav(page, 'Meldungen'));
    await capture(page, 'intro-praemien.png', async () =>
      page.getByRole('button', { name: 'Punkte & Prämien öffnen' }).first().click({ timeout: 10000 }),
    );
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});

