#!/usr/bin/env node
/**
 * Visual QA for Intro v3 filmflow — key scenes @ 390px.
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
  'ruhiger-einstieg': { file: '01-ruhiger-einstieg.png', step: 1, waitMs: 3200 },
  'melden-foto': { file: '02-melden-foto.png', step: 2, waitMs: 11000 },
  'wegweiser-clara': { file: '04-wegweiser-clara.png', step: 4, waitMs: 6500 },
  'beteiligen-punkte': { file: '05-beteiligen-punkte.png', step: 5, waitMs: 8000 },
  'praemien-auswahl': { file: '06-praemien-auswahl.png', step: 6, waitMs: 3800 },
  'praemien-wallet-qr': { file: '07-praemien-wallet-qr.png', step: 7, waitMs: 5500 },
  'eid-trust': { file: '08-eid-trust.png', step: 8, waitMs: 3200 },
  abschluss: { file: '09-abschluss.png', step: 9, waitMs: 1200 },
};

async function openIntroStep(page, stepOneBased) {
  const url = `${BASE}/api/dev/enter-demo?demo_id=eidconnect-v1&resetIntro=1&introStep=${stepOneBased}`;
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await page.waitForSelector('[data-testid="intro-v2-walkthrough"]', { timeout: 120000 });
  const stepId = STEP_IDS[stepOneBased - 1];
  await page.waitForSelector(`[data-testid="intro-v2-step-${stepId}"]`, { timeout: 30000 });
}

async function probeScene(page, stepId) {
  const step = page.locator(`[data-testid="intro-v2-step-${stepId}"]`);
  const title = (await step.locator('.intro-v2-title').textContent())?.trim() ?? '';
  const body = (await step.locator('.intro-v2-body').textContent())?.trim() ?? '';
  const panelLocator = step.locator('.intro-v3-film-layer, .intro-v3-film-panel');
  const panelCount = await panelLocator.count();
  const visualPanelText =
    panelCount > 0
      ? ((await panelLocator.first().textContent())?.trim() ?? '')
      : ((await step.locator('.intro-v2-film-still').textContent())?.trim() ?? '');
  const footerLocator = step.locator('.intro-v3-film-footer');
  const footerCount = await footerLocator.count();
  const footerText =
    footerCount > 0 ? ((await footerLocator.first().textContent())?.trim() ?? '') : '';
  const visualText = visualPanelText;
  const fullVisualText = `${visualPanelText} ${footerText}`.trim();
  const hasMontage = (await step.locator('.intro-v2-montage').count()) > 0;
  const hasPostfachOverlay = (await step.locator('.intro-v3-postfach-card').count()) > 0;
  const hasQrInPraemien =
    stepId === 'praemien-auswahl' && /HC-KIRKEL|intro-v3-qr/i.test(visualPanelText);
  const hasOverlayBar = (await step.locator('.intro-v3-in-scene-result, .intro-v3-fahrplan-steps').count()) > 0;
  const hasDuplicateBtn = (await step.locator('.intro-v3-in-scene-btn').count()) > 0;
  const hasNavRings = (await step.locator('.intro-v3-tap-ring--nav-wegweiser').count()) > 0;
  const hasMeldenRings = (await step.locator('.intro-v3-tap-ring--melden-submit').count()) > 0;
  const hasPhotoPreview = (await step.locator('.intro-v3-photo-preview img').count()) > 0;
  const hasQrGrid = (await step.locator('.intro-v3-qr-grid').count()) > 0;
  const hasTrustScreen = (await step.locator('.intro-v3-trust-screen').count()) > 0;
  const hasFinaleDim = (await step.locator('.intro-v3-film-still--dim').count()) > 0;
  const hasTabOverlay = (await step.locator('.intro-v3-beteiligen-tabs').count()) > 0;
  const hasVoteRing = (await step.locator('.intro-v3-tap-ring--vote-yes').count()) > 0;
  const hasEarlyPoints =
    stepId === 'beteiligen-punkte' &&
    (await step.locator('.intro-v3-points-counter:not(.intro-v3-points-counter--late)').count()) > 0;
  return {
    title,
    body,
    visualSnippet: visualText.slice(0, 360),
    footerSnippet: footerText.slice(0, 200),
    fullVisualSnippet: fullVisualText.slice(0, 420),
    hasMontage,
    hasPostfachOverlay,
    hasQrInPraemien,
    hasOverlayBar,
    hasDuplicateBtn,
    hasNavRings,
    hasMeldenRings,
    hasPhotoPreview,
    hasQrGrid,
    hasTrustScreen,
    hasFinaleDim,
    hasTabOverlay,
    hasVoteRing,
    hasEarlyPoints,
  };
}

function checksFor(stepId, probe) {
  const text = `${probe.title} ${probe.body} ${probe.fullVisualSnippet}`;
  const panelText = probe.visualSnippet;
  switch (stepId) {
    case 'ruhiger-einstieg':
      return [
        { id: 'no-collage', pass: !probe.hasMontage },
        { id: 'claim', pass: /Bürgerweg/i.test(probe.title) },
        { id: 'trust-below', pass: /eID|Demo: keine echte/i.test(text) },
        { id: 'nav-rings', pass: probe.hasNavRings },
        { id: 'no-duplicate-btn', pass: !probe.hasDuplicateBtn },
      ];
    case 'melden-foto':
      return [
        { id: 'text-flow', pass: /Ratten|Drachenspielplatz/i.test(text) },
        { id: 'upload-preview', pass: probe.hasPhotoPreview || /Drachenspielplatz\.jpg/i.test(text) },
        { id: 'prepared-badge', pass: /Vorbereitet · nicht versendet/.test(text) },
        { id: 'no-anrede', pass: !/Anrede/i.test(text) },
        { id: 'tap-rings', pass: probe.hasMeldenRings },
        { id: 'no-duplicate-btn', pass: !probe.hasDuplicateBtn },
      ];
    case 'wegweiser-clara':
      return [
        { id: 'clara-flow', pass: /Clara ordnet|Clara bereitet vor/i.test(text) },
        { id: 'no-white-bar', pass: !probe.hasOverlayBar },
        { id: 'no-floating-btn', pass: !/Offiziellen Online-Dienst öffnen/.test(probe.visualSnippet) },
      ];
    case 'beteiligen-punkte':
      return [
        { id: 'vote-flow', pass: /Teilnahme abgeschlossen/i.test(text) || probe.hasVoteRing },
        { id: 'points-after', pass: /\+120|2\.680 → 2\.800/.test(text) },
        { id: 'neutral-hint', pass: /nicht Meinung/i.test(probe.footerSnippet || text) },
        { id: 'no-tab-overlay', pass: !probe.hasTabOverlay },
        { id: 'no-early-points', pass: !probe.hasEarlyPoints },
      ];
    case 'praemien-auswahl':
      return [
        { id: 'kirkel-list', pass: /Kirkel|Naturfreibad|Prämien/i.test(text) },
        { id: 'no-qr-yet', pass: !probe.hasQrInPraemien && !probe.hasQrGrid },
        { id: 'no-duplicate-btn', pass: !probe.hasDuplicateBtn },
      ];
    case 'praemien-wallet-qr':
      return [
        { id: 'qr-wallet', pass: /HC-KIRKEL-2026-1270|Wallet/i.test(text) },
        { id: 'demo-hint', pass: /Demo-Gutschein|keine echte Einlösung/i.test(probe.footerSnippet || text) },
        { id: 'qr-built', pass: probe.hasQrGrid },
        { id: 'no-duplicate-btn', pass: !probe.hasDuplicateBtn },
      ];
    case 'eid-trust':
      return [
        { id: 'tabs', pass: /eID|EU Wallet/i.test(text) },
        { id: 'trust-copy', pass: /Identität|Nachweise|offiziellen Dienste/i.test(text) },
        { id: 'no-wegweiser-bg', pass: !/Arbeitsuchend melden/i.test(text) },
        { id: 'trust-screen', pass: probe.hasTrustScreen },
      ];
    case 'abschluss':
      return [
        { id: 'finale-title', pass: /Bereit für den nächsten Schritt/i.test(probe.title) },
        { id: 'dim-home', pass: probe.hasFinaleDim },
        { id: 'no-qr', pass: !probe.hasQrGrid },
        { id: 'no-duplicate-btn', pass: !probe.hasDuplicateBtn },
      ];
    default:
      return [];
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const report = { base: BASE, scenes: [], ok: true, filmflowPass: 'v3.1' };

  for (const [stepId, cfg] of Object.entries(CAPTURE)) {
    await openIntroStep(page, cfg.step);
    if (stepId === 'melden-foto') {
      await page.waitForSelector('.intro-v3-photo-preview img', { timeout: 20000 }).catch(() => {});
      await page.waitForSelector('.intro-v3-result-chip--melden', { timeout: 20000 }).catch(() => {});
    }
    if (stepId === 'beteiligen-punkte') {
      await page.waitForSelector('.intro-v3-points-counter--late', { timeout: 20000 }).catch(() => {});
    }
    if (stepId === 'wegweiser-clara') {
      await page.waitForSelector('.intro-v3-tap-ring--wegweiser-official', { timeout: 20000 }).catch(() => {});
    }
    if (stepId === 'praemien-wallet-qr') {
      await page.waitForSelector('.intro-v3-qr-stage--built', { timeout: 20000 }).catch(() => {});
      await page.waitForSelector('.intro-v3-result-chip--wallet', { timeout: 20000 }).catch(() => {});
    }
    await page.waitForTimeout(cfg.waitMs);
    const probe = await probeScene(page, stepId);
    const checks = checksFor(stepId, probe);
    const pass = checks.length === 0 || checks.every((c) => c.pass);
    if (!pass) report.ok = false;
    await page.screenshot({ path: join(OUT_DIR, cfg.file), fullPage: false });
    report.scenes.push({ stepId, file: cfg.file, step: cfg.step, probe, checks, pass });
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
