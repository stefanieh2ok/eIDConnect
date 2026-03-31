#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

/**
 * argv[2]: Basis-URL oder vollständige Demo-URL (z. B. http://localhost:3002)
 * Optional: DEMO_TOKEN oder argv[3] → zuerst GET /api/demo/enter?token=… (Cookie für Demo)
 */
function resolveEntryUrl() {
  const arg = process.argv[2] || 'http://localhost:3002';
  const token = process.env.DEMO_TOKEN || process.argv[3];
  let origin;
  try {
    origin = new URL(arg.startsWith('http') ? arg : `http://${arg}`).origin;
  } catch {
    origin = 'http://localhost:3002';
  }
  if (token?.trim()) {
    return `${origin}/api/demo/enter?token=${encodeURIComponent(token.trim())}`;
  }
  return arg.startsWith('http') ? arg : `http://${arg}`;
}

const ENTRY_URL = resolveEntryUrl();
const OUT_DIR = path.resolve(process.cwd(), 'docs', 'screenshots');
/** Ziele für Intro-Overlay (`data/introScreenshots.ts`) – nach Capture kopieren. */
const PUBLIC_INTRO_DIR = path.resolve(process.cwd(), 'public', 'intro');
const INTRO_PUBLIC_NAMES = {
  '01-wahlen.png': 'intro-wahlen.png',
  '02-beteiligungen.png': 'intro-beteiligung.png',
  '03-meldungen.png': 'intro-meldungen.png',
  '04-kalender.png': 'intro-kalender.png',
};

const SHOTS = [
  {
    id: 'wahlen',
    nav: 'Wahlen',
    file: '01-wahlen.png',
    title: 'Wahlen',
    caption: 'Filter, Status und Trennung zwischen aktuellen Wahlen und Ergebnissen.',
    callouts: [
      { n: 1, x: 190, y: 160, text: 'Bereichstitel und aktive Auswahl' },
      { n: 2, x: 305, y: 232, text: 'Filter für Ebene und Datum' },
      { n: 3, x: 220, y: 380, text: 'Informations- und Ergebnisansicht' },
    ],
  },
  {
    id: 'beteiligungen',
    nav: 'Abstimmen',
    file: '02-beteiligungen.png',
    title: 'Abstimmungen und Beteiligungen',
    caption: 'Position markieren in der Demo, mit neutraler Einordnung und klarem Demo-Hinweis.',
    callouts: [
      { n: 1, x: 215, y: 165, text: 'Kontext und Ebenenfilter' },
      { n: 2, x: 245, y: 350, text: 'Karte mit Thema und Frist' },
      { n: 3, x: 215, y: 575, text: 'Interaktion nur als Demo-Feedback' },
    ],
  },
  {
    id: 'meldungen',
    nav: 'Meldungen',
    file: '03-meldungen.png',
    title: 'Meldungen',
    caption: 'Schrittweise Erfassung von Anliegen mit klarer Erwartung, was in der Demo simuliert wird.',
    callouts: [
      { n: 1, x: 220, y: 210, text: 'Einstieg in den Meldungsbereich' },
      { n: 2, x: 220, y: 370, text: 'Kategorien und strukturierte Erfassung' },
      { n: 3, x: 220, y: 575, text: 'Demo-Hinweis zur Verbindlichkeit' },
    ],
  },
  {
    id: 'kalender',
    nav: 'Kalender',
    file: '04-kalender.png',
    title: 'Kalender und Termine',
    caption: 'Termine nach Ebene filtern; Markierungen unterscheiden Typ und Zuständigkeit.',
    callouts: [
      { n: 1, x: 210, y: 165, text: 'Aktive Auswahl und Zeitbezug' },
      { n: 2, x: 225, y: 315, text: 'Kalender mit Ereignismarkierungen' },
      { n: 3, x: 220, y: 575, text: 'Kompakte Legende und Terminliste' },
    ],
  },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function clickIfVisible(page, selector) {
  const loc = page.locator(selector).first();
  if (await loc.count()) {
    await loc.click({ timeout: 3000 }).catch(() => {});
    return true;
  }
  return false;
}

function overlaySvg(width, height, shot) {
  const extra = 120;
  const items = shot.callouts
    .map(
      (c) => `
  <circle cx="${c.x}" cy="${c.y}" r="14" fill="#003366" stroke="white" stroke-width="2"/>
  <text x="${c.x}" y="${c.y + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="white">${c.n}</text>
  <rect x="${c.x + 18}" y="${c.y - 12}" rx="6" ry="6" width="250" height="24" fill="rgba(255,255,255,0.92)" />
  <text x="${c.x + 26}" y="${c.y + 4}" font-size="11" fill="#0f172a">${escapeXml(c.text)}</text>`,
    )
    .join('\n');

  return `
<svg width="${width}" height="${height + extra}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${height}" width="${width}" height="${extra}" fill="#f8fafc"/>
  <text x="24" y="${height + 32}" font-size="22" font-weight="700" fill="#0f172a">${escapeXml(shot.title)}</text>
  <text x="24" y="${height + 62}" font-size="14" fill="#334155">${escapeXml(shot.caption)}</text>
  ${items}
</svg>`;
}

function escapeXml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function annotate(rawPath, outPath, shot) {
  const meta = await sharp(rawPath).metadata();
  const width = meta.width || 1280;
  const height = meta.height || 720;
  const svg = overlaySvg(width, height, shot);
  const extended = await sharp(rawPath)
    .extend({ top: 0, bottom: 120, left: 0, right: 0, background: '#f8fafc' })
    .toBuffer();
  await sharp(extended).composite([{ input: Buffer.from(svg) }]).png({ quality: 95 }).toFile(outPath);
}

async function dismissProductIntro(page) {
  const intro = page.locator('[role="dialog"]').filter({ hasText: /Schritt \d+ von/ });
  if (!(await intro.count())) return;

  for (let i = 0; i < 8; i += 1) {
    if (!(await intro.count())) return;
    const finish = intro.getByRole('button', { name: 'Einführung abschließen' });
    if (await finish.count()) {
      await finish.click();
      await page.waitForTimeout(700);
      return;
    }
    const weiter = intro.getByRole('button', { name: 'Weiter' });
    if (await weiter.count()) {
      await weiter.click();
      await page.waitForTimeout(450);
      continue;
    }
    break;
  }
}

async function completeLoginWizard(page) {
  const w1 = page.getByRole('button', { name: 'Weiter' });
  if (await w1.count()) {
    const vis = await w1.first().isVisible().catch(() => false);
    if (vis) {
      await w1.first().click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
  }
  const du = page.getByRole('button', { name: 'Du' });
  if (await du.count()) {
    const vis = await du.first().isVisible().catch(() => false);
    if (vis) {
      await du.first().click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
    }
  }
  const zurApp = page.getByRole('button', { name: 'Zur Demo-App' });
  if (await zurApp.count()) {
    await zurApp.click({ timeout: 12000 });
    await page.waitForTimeout(1200);
  }
}

async function gotoAppRoot(page) {
  await page.goto(ENTRY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1800);

  if (page.url().includes('/access/denied')) {
    throw new Error(
      'Demo-Session fehlt (Zugriff verweigert). Setze DEMO_TOKEN oder 3. CLI-Argument mit gültigem ' +
        'demo_tokens-Eintrag, z. B.: node scripts/capture-demo-screens.mjs http://localhost:3002 DEIN_TOKEN',
    );
  }

  if (await page.getByRole('button', { name: 'Wahlen' }).count()) return;

  await dismissProductIntro(page);
  await page.waitForTimeout(400);

  if (await page.getByRole('button', { name: 'Wahlen' }).count()) return;

  await completeLoginWizard(page);
  await page.waitForTimeout(400);

  await clickIfVisible(page, 'button:has-text("Überspringen")');
  await page.waitForTimeout(500);

  if (!(await page.getByRole('button', { name: 'Wahlen' }).count())) {
    throw new Error(
      'App-Navigation nicht gefunden. Ohne Demo-Cookie: Umgebungsvariable DEMO_TOKEN setzen oder ' +
        '3. Argument: node scripts/capture-demo-screens.mjs http://localhost:3002 <demo_token>',
    );
  }
}

async function captureSection(page, shot) {
  await page.getByRole('button', { name: shot.nav }).click({ timeout: 8000 });
  await page.waitForTimeout(900);
  const rawPath = path.join(OUT_DIR, `raw-${shot.file}`);
  const outPath = path.join(OUT_DIR, shot.file);
  await page.screenshot({ path: rawPath, fullPage: true });
  await annotate(rawPath, outPath, shot);
  return { rawPath, outPath };
}

async function main() {
  await ensureDir(OUT_DIR);
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 2200 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    await gotoAppRoot(page);
    const outputs = [];
    for (const shot of SHOTS) {
      const out = await captureSection(page, shot);
      outputs.push(out);
    }

    await ensureDir(PUBLIC_INTRO_DIR);
    for (const [fromFile, toName] of Object.entries(INTRO_PUBLIC_NAMES)) {
      const src = path.join(OUT_DIR, fromFile);
      const dest = path.join(PUBLIC_INTRO_DIR, toName);
      try {
        await fs.copyFile(src, dest);
        console.log('→ public/intro/', toName);
      } catch (e) {
        console.warn('Konnte nicht kopieren:', dest, e?.message || e);
      }
    }

    console.log('Screenshots erstellt:');
    for (const out of outputs) console.log('-', out.outPath);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Fehler beim Screenshot-Export:', err?.message || err);
  process.exit(1);
});

