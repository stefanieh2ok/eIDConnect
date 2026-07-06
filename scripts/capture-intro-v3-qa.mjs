#!/usr/bin/env node
/**
 * Visual QA for Intro v3 — key scenes @ 390px.
 * Usage: node scripts/capture-intro-v3-qa.mjs [BASE_URL]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3002').replace(/\/$/, '');
const OUT_DIR = join(process.cwd(), 'docs', 'screenshots', 'intro-v3-qa');
const VIEWPORT = { width: 390, height: 844 };

const STEP_IDS = [
  'ruhiger-einstieg',
  'melden-foto',
  'postfach-status',
  'wegweiser-clara',
  'beteiligen-punkte',
  'praemien-auswahl',
  'praemien-wallet-qr',
  'eid-trust',
  'abschluss',
];

const CAPTURE = {
  'ruhiger-einstieg': { file: '01-ruhiger-einstieg.png', waitMs: 2500 },
  'melden-foto': { file: '02-melden-foto.png', waitMs: 7000 },
  'beteiligen-punkte': { file: '05-beteiligen-punkte.png', waitMs: 5500 },
  'praemien-auswahl': { file: '06-praemien-auswahl.png', waitMs: 3500 },
  'praemien-wallet-qr': { file: '07-praemien-wallet-qr.png', waitMs: 4500 },
  'eid-trust': { file: '08-eid-trust.png', waitMs: 3500 },
};

async function waitForIntro(page) {
  await page.waitForSelector('[data-testid="intro-v2-walkthrough"]', { timeout: 120000 });
}

async function probeScene(page, stepId) {
  const step = page.locator(`[data-testid="intro-v2-step-${stepId}"]`);
  await step.waitFor({ state: 'visible', timeout: 30000 });
  const title = (await step.locator('.intro-v2-title').textContent())?.trim() ?? '';
  const body = (await step.locator('.intro-v2-body').textContent())?.trim() ?? '';
  const visualText = (await step.locator('.intro-v2-visual').textContent())?.trim() ?? '';
  const hasMontage = (await step.locator('.intro-v2-montage').count()) > 0;
  return { title, body, visualSnippet: visualText.slice(0, 320), hasMontage };
}

function checksFor(stepId, probe) {
  const text = `${probe.title} ${probe.body} ${probe.visualSnippet}`;
  switch (stepId) {
    case 'ruhiger-einstieg':
      return [
        { id: 'no-collage', pass: !probe.hasMontage },
        { id: 'claim', pass: /Bürgerweg/i.test(probe.title) },
      ];
    case 'melden-foto':
      return [
        { id: 'drachenspielplatz', pass: /Drachenspielplatz|Ratten/i.test(text) },
        { id: 'prepared-badge', pass: /Vorbereitet|nicht versendet/i.test(text) },
      ];
    case 'beteiligen-punkte':
      return [
        { id: 'points-flow', pass: /Punkte|Zustimmen|Teilnahme/i.test(text) },
        { id: 'neutral-hint', pass: /nicht Meinung/i.test(text) },
      ];
    case 'praemien-auswahl':
      return [{ id: 'kirkel-list', pass: /Kirkel|Naturfreibad|Prämien/i.test(text) }];
    case 'praemien-wallet-qr':
      return [{ id: 'qr-wallet', pass: /Wallet|HC-KIRKEL|Demo-Gutschein/i.test(text) }];
    case 'eid-trust':
      return [
        { id: 'identity-seal', pass: /Identity Seal|eID|EU Digital Identity/i.test(text) },
        { id: 'official', pass: /Offizielle Stellen|offiziellen Dienste/i.test(text) },
      ];
    default:
      return [];
  }
}

async function captureStep(page, stepId, report) {
  const cfg = CAPTURE[stepId];
  if (!cfg) return;
  await page.waitForTimeout(cfg.waitMs);
  const probe = await probeScene(page, stepId);
  const checks = checksFor(stepId, probe);
  const pass = checks.length === 0 || checks.every((c) => c.pass);
  await page.screenshot({ path: join(OUT_DIR, cfg.file), fullPage: false });
  if (!pass) report.ok = false;
  report.scenes.push({ stepId, file: cfg.file, probe, checks, pass });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });
  const report = { base: BASE, scenes: [], ok: true };

  const url = `${BASE}/api/dev/enter-demo?demo_id=eidconnect-v1&resetIntro=1`;
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(2000);
  await waitForIntro(page);

  for (let i = 0; i < STEP_IDS.length; i += 1) {
    const stepId = STEP_IDS[i];
    await page.waitForSelector(`[data-testid="intro-v2-step-${stepId}"]`, { timeout: 30000 });
    await captureStep(page, stepId, report);
    if (i < STEP_IDS.length - 1) {
      await page.getByTestId('intro-v2-primary-cta').click({ timeout: 15000 });
      await page.waitForTimeout(450);
    }
  }

  writeFileSync(join(OUT_DIR, 'qa-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  process.exit(report.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
