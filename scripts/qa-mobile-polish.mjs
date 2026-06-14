#!/usr/bin/env node
/**
 * QA Mobile Polish — logged-in app screens at 375 / 390 / 430 px.
 * Requires: dev server on BASE (default localhost:3002) + ADMIN_DEMO_SECRET in .env.local
 *
 * Usage: node scripts/qa-mobile-polish.mjs [BASE_URL]
 */
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3002').replace(/\/$/, '');
const WIDTHS = [375, 390, 430];

function loadAdminSecret() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return null;
  const text = readFileSync(envPath, 'utf8');
  const m = text.match(/^ADMIN_DEMO_SECRET=(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

function checkOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth || 0);
    const clientW = doc.clientWidth;
    const clipped = [];
    const root = document.querySelector('.civic-app-shell') || document.body;
    root.querySelectorAll('button, a[role="button"], input[type="submit"]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') return;
      if (r.width < 44 || r.height < 44) {
        const label = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 40) || el.tagName;
        clipped.push({ issue: 'hit-area', label, w: Math.round(r.width), h: Math.round(r.height) });
      }
      if (r.right > clientW + 2 || r.left < -2) {
        const label = el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 40) || el.tagName;
        clipped.push({ issue: 'clipped', label, right: Math.round(r.right), clientW });
      }
    });
    return {
      scrollWidth: scrollW,
      clientWidth: clientW,
      horizontalOverflow: scrollW > clientW + 1,
      hitOrClip: clipped.slice(0, 8),
    };
  });
}

async function bootstrapLoggedIn(page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('eidconnect_product_intro_done_v4', 'true');
      sessionStorage.setItem('eidconnect_prelogin_v2', 'ok');
      sessionStorage.setItem('eidconnect_wants_walkthrough_v1', '0');
    } catch {
      /* ignore */
    }
  });

  const secret = loadAdminSecret();
  const demoId = 'eidconnect-v1';
  const url = secret
    ? `${BASE}/api/admin/enter-demo?secret=${encodeURIComponent(secret)}&demo_id=${encodeURIComponent(demoId)}`
    : `${BASE}/demo/${demoId}`;

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);

  const duBtn = page.getByRole('button', { name: /^Du$/i });
  if (await duBtn.count()) {
    await duBtn.first().click();
    await page.waitForTimeout(400);
  }

  const direct = page.getByRole('button', { name: /Direkt zur App/i });
  if (await direct.count()) {
    await direct.first().click();
    await page.waitForTimeout(800);
  }

  await page.waitForSelector('#tour-footer, .app-bottom-nav, .civic-app-shell', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);
}

async function clickNav(page, label) {
  const btn = page.locator('.app-bottom-nav__item').filter({ hasText: label });
  if (await btn.count()) {
    await btn.first().click();
    await page.waitForTimeout(600);
    return true;
  }
  return false;
}

const SCREENS = [
  { id: 'wegweiser', setup: async (p) => clickNav(p, 'Wegweiser') },
  {
    id: 'wegweiser-expanded',
    setup: async (p) => {
      await clickNav(p, 'Wegweiser');
      const row = p.locator('.life-event-row, .fuer-mich-category-row, button').filter({ hasText: /Ausweis|Identität|Dokument/i }).first();
      if (await row.count()) await row.click();
      await p.waitForTimeout(500);
    },
  },
  {
    id: 'behoerdenweg-results',
    setup: async (p) => {
      await clickNav(p, 'Wegweiser');
      const cta = p.getByRole('button', { name: /Behördenweg öffnen/i });
      if (await cta.count()) await cta.first().click();
      await p.waitForTimeout(600);
    },
  },
  {
    id: 'detail-personalausweis',
    setup: async (p) => {
      await clickNav(p, 'Wegweiser');
      const card = p.getByText(/Personalausweis.*Online-Ausweis/i).first();
      if (await card.count()) await card.click();
      await p.waitForTimeout(600);
    },
  },
  {
    id: 'clara-pill',
    setup: async (p) => {
      await clickNav(p, 'Wegweiser');
      await p.waitForTimeout(300);
    },
  },
  {
    id: 'clara-half',
    setup: async (p) => {
      await clickNav(p, 'Wegweiser');
      const clara = p.getByRole('button', { name: /Frag Clara|Clara/i }).first();
      if (await clara.count()) await clara.click();
      await p.waitForTimeout(700);
    },
  },
  {
    id: 'clara-full',
    setup: async (p) => {
      await clickNav(p, 'Wegweiser');
      const clara = p.getByRole('button', { name: /Frag Clara|Clara/i }).first();
      if (await clara.count()) await clara.click();
      await p.waitForTimeout(500);
      const expand = p.getByRole('button', { name: /Clara vergrößern/i });
      if (await expand.count()) await expand.click();
      await p.waitForTimeout(500);
    },
  },
  { id: 'meldungen-kategorie', setup: async (p) => clickNav(p, 'Melden') },
  {
    id: 'meldungen-status',
    setup: async (p) => {
      await clickNav(p, 'Melden');
      const tab = p.getByRole('button', { name: /Aktuelle Meldungen|Meine Meldungen|Status/i }).first();
      if (await tab.count()) await tab.click();
      await p.waitForTimeout(500);
    },
  },
  { id: 'abstimmen', setup: async (p) => clickNav(p, 'Beteiligen') },
  {
    id: 'wahlen-ergebnisse',
    setup: async (p) => {
      await clickNav(p, 'Wahlen');
      const ergebnisse = p.getByRole('button', { name: /^Ergebnisse$/i });
      if (await ergebnisse.count()) await ergebnisse.click();
      await p.waitForTimeout(500);
    },
  },
  {
    id: 'stimmzettel-viewer',
    setup: async (p) => {
      await clickNav(p, 'Wahlen');
      const sz = p.getByRole('button', { name: /Stimmzettel/i }).first();
      if (await sz.count()) await sz.click();
      await p.waitForTimeout(700);
    },
  },
  {
    id: 'settings-trust',
    setup: async (p) => {
      const settings = p.getByRole('button', { name: /Trust Center|Einstellungen/i }).first();
      if (await settings.count()) await settings.click();
      await p.waitForTimeout(600);
    },
  },
  {
    id: 'mitwirkung',
    setup: async (p) => {
      const m = p.getByRole('button', { name: /Mitwirkung/i }).first();
      if (await m.count()) await m.click();
      await p.waitForTimeout(600);
    },
  },
];

async function main() {
  console.log('QA Mobile Polish — BASE=%s\n', BASE);
  const browser = await chromium.launch({ headless: true });
  const report = [];

  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 844 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    const page = await ctx.newPage();
    await bootstrapLoggedIn(page);

    for (const screen of SCREENS) {
      try {
        await bootstrapLoggedIn(page);
        await screen.setup(page);
        const result = await checkOverflow(page);
        report.push({ width, screen: screen.id, ...result });
        const status = result.horizontalOverflow ? 'FAIL overflow' : 'OK';
        const hits = result.hitOrClip.length ? ` (${result.hitOrClip.length} hit/clip)` : '';
        console.log(`[${width}px] ${screen.id}: ${status}${hits}`);
      } catch (e) {
        report.push({ width, screen: screen.id, error: String(e?.message || e) });
        console.log(`[${width}px] ${screen.id}: ERROR ${e?.message}`);
      }
    }
    await ctx.close();
  }

  await browser.close();

  const fails = report.filter((r) => r.horizontalOverflow || r.error);
  const outPath = join(process.cwd(), 'docs', 'qa-mobile-polish-report.json');
  try {
    const { mkdirSync, writeFileSync } = await import('fs');
    mkdirSync(join(process.cwd(), 'docs'), { recursive: true });
    writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2));
    console.log('\nReport written:', outPath);
  } catch {
    console.log('\n', JSON.stringify(report, null, 2));
  }

  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
