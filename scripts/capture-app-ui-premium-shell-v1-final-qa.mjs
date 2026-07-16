#!/usr/bin/env node
/**
 * Premium Shell v1 — visuelle QA mit Bounding-Box-Messungen.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.argv[2] || 'http://localhost:3005').replace(/\/$/, '');
const OUT_DIR = join(process.cwd(), 'docs', 'screenshots', 'app-ui-premium-shell-v1-final-qa');

const SHOTS_390 = [
  { file: '01-wegweiser-390.png', nav: 'Wegweiser', type: 'nav' },
  { file: '02-melden-390.png', nav: 'Melden', type: 'nav' },
  { file: '03-beteiligen-390.png', nav: 'Beteiligen', type: 'nav' },
  { file: '04-wahlen-390.png', nav: 'Wahlen', type: 'nav' },
  { file: '05-kalender-390.png', utility: 'Termine öffnen', type: 'utility' },
  { file: '06-praemien-aktiv-390.png', utility: 'Prämien', type: 'utility', rewardsOn: true },
  { file: '07-praemien-inaktiv-390.png', utility: 'Prämien', type: 'utility', rewardsOn: false },
  { file: '08-postfach-390.png', utility: 'Postfach öffnen', type: 'utility' },
  { file: '09-einstellungen-390.png', utility: 'Einstellungen öffnen', type: 'utility' },
];

const SHOTS_430 = [
  { file: '10-beteiligen-430.png', nav: 'Beteiligen', type: 'nav' },
  { file: '11-wahlen-430.png', nav: 'Wahlen', type: 'nav' },
  { file: '12-einstellungen-430.png', utility: 'Einstellungen öffnen', type: 'utility' },
];

async function bootstrapLoggedIn(page) {
  await page.goto(`${BASE}/api/dev/enter-demo?demo_id=${encodeURIComponent('eidconnect-v1')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await page.waitForTimeout(3500);

  const skipIntro = page.locator('[data-testid="intro-v2-skip"]');
  if (await skipIntro.count()) {
    await skipIntro.first().click();
    await page.waitForTimeout(1500);
  }

  const duBtn = page.getByRole('button', { name: /^Du$/i });
  if (await duBtn.count()) await duBtn.first().click({ timeout: 5000 }).catch(() => {});

  const weiter = page.getByRole('button', { name: /^Weiter$/i });
  if (await weiter.count()) await weiter.first().click({ timeout: 10000 }).catch(() => {});

  const direct = page.getByRole('button', { name: /Direkt zur App/i });
  if (await direct.count()) {
    await direct.first().click({ timeout: 10000 });
    await page.waitForTimeout(1500);
  }

  await page.waitForSelector('.app-bottom-nav, .civic-app-shell', { timeout: 90000 });
  const dismiss = page.getByRole('button', { name: /Nicht jetzt/i });
  if (await dismiss.count()) await dismiss.first().click().catch(() => {});
  await page.waitForTimeout(500);
}

async function scrollMainToTop(page) {
  await page.locator('#main-content').evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.waitForTimeout(200);
}

async function clickBottomNav(page, label) {
  await page.locator('.app-bottom-nav__label').filter({ hasText: label }).first().click();
  await page.waitForTimeout(700);
}

async function clickUtility(page, label) {
  await page.getByRole('button', { name: label }).first().click();
  await page.waitForTimeout(700);
}

async function navigate(page, shot) {
  if (shot.type === 'nav') await clickBottomNav(page, shot.nav);
  else await clickUtility(page, shot.utility);
  if (shot.nav === 'Melden' || shot.utility === 'Melden') {
    await page.waitForSelector('#meldungen-screen-title', { timeout: 15000 }).catch(() => {});
  }
  if (shot.nav === 'Beteiligen') await page.waitForSelector('#beteiligen-screen-title', { timeout: 15000 });
  if (shot.nav === 'Wahlen') await page.waitForSelector('#wahlen-screen-title', { timeout: 15000 });
  if (shot.utility === 'Termine öffnen') await page.waitForSelector('#kalender-screen-title', { timeout: 15000 });
  if (shot.utility === 'Prämien') await page.waitForSelector('#praemien-screen-title', { timeout: 15000 });
  if (shot.utility === 'Postfach öffnen') await page.waitForSelector('#postfach-screen-title', { timeout: 15000 });
  if (shot.utility === 'Einstellungen öffnen') await page.waitForSelector('#settings-screen-title', { timeout: 15000 });
}

async function measureScreen(page) {
  return page.evaluate(() => {
    const brand = document.querySelector('.app-shell-brand-wordmark');
    const h1 = document.querySelector('h1.civic-screen-h1');
    const main = document.getElementById('main-content');
    const card = main?.querySelector(
      '.election-card, .civic-surface-card, .postfach-message-card, .meldung-category-row, .settings-shell-section',
    );
    const bodyText = document.body.innerText || '';
    const filterButtons = [...document.querySelectorAll('button')].filter((b) => {
      const rect = b.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const genericFilters =
      filterButtons.some((b) => /^Filter$/i.test((b.textContent || '').trim())) ||
      filterButtons.some((b) => /Anpassen\s*·/i.test(b.textContent || '')) ||
      /Auswahl:\s*/i.test(bodyText);
    const hasPagination = /\b\d+\s*\/\s*\d+\b/.test(
      (document.querySelector('.civic-screen-meta__action')?.textContent || '') +
        (document.querySelector('.civic-screen-meta')?.textContent || ''),
    );
    const praemienState = document.querySelector('.civic-points-badge, .civic-points-activate');
    const praemienStateLabel = praemienState?.textContent?.trim() ?? null;
    const settingsModal = !!document.querySelector('.settings-overlay');
    const settingsScreen = !!document.getElementById('settings-screen');
    const scrollers = [
      document.getElementById('main-content'),
      document.querySelector('.civic-settings-scroll'),
      document.querySelector('.settings-overlay'),
    ].filter(Boolean);
    const scrollableCount = scrollers.filter((el) => {
      const cs = getComputedStyle(el);
      return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 2;
    }).length;

    const brandRect = brand?.getBoundingClientRect();
    const h1Rect = h1?.getBoundingClientRect();
    const cardRect = card?.getBoundingClientRect();
    const brandStyle = brand ? getComputedStyle(brand) : null;
    const h1Style = h1 ? getComputedStyle(h1) : null;

    const brandSize = brandRect ? brandRect.height : 0;
    const h1Size = h1Style ? parseFloat(h1Style.fontSize) : 0;
    const axisDelta =
      brandRect && h1Rect ? Math.abs(Math.round(brandRect.left) - Math.round(h1Rect.left)) : 999;

    const clara = document.querySelector('.clara-dock-pill, .clara-dock-fab');
    let claraOverlap = false;
    if (clara && main && card) {
      const c = clara.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      claraOverlap = !(c.right < r.left || c.left > r.right || c.bottom < r.top || c.top > r.bottom);
    }

    const wm = document.querySelector('.app-confidential-watermark');
    let watermarkOverContent = false;
    if (wm && main && getComputedStyle(wm).display !== 'none') {
      const wr = wm.getBoundingClientRect();
      const mr = main.getBoundingClientRect();
      watermarkOverContent = wr.bottom > mr.top + 40 && wr.top < mr.bottom - 40;
    }

    const overflowX =
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
      (main ? main.scrollWidth > main.clientWidth + 1 : false);

    return {
      brandFontSizePx: brandSize,
      brandCssHeight: brandStyle?.height ?? null,
      h1FontSizePx: h1Size,
      h1LineHeight: h1Style?.lineHeight ?? null,
      brandX: brandRect ? Math.round(brandRect.left) : null,
      h1X: h1Rect ? Math.round(h1Rect.left) : null,
      cardX: cardRect ? Math.round(cardRect.left) : null,
      axisDeltaBrandH1: axisDelta,
      h1FullText: h1?.textContent?.trim() ?? null,
      genericFilterVisible: genericFilters,
      paginationVisible: hasPagination,
      horizontalOverflow: overflowX,
      claraOverlap,
      doubleScrollbar: scrollableCount > 1,
      watermarkOverContent,
      settingsIsMainPage: settingsScreen && !settingsModal,
      praemienStateLabel,
      scrollTop: main?.scrollTop ?? -1,
      brandLargerThanH1: brandSize > h1Size + 0.5,
    };
  });
}

async function captureSet(browser, shots, viewport, label) {
  const results = [];

  for (const shot of shots) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
    });
    await context.addInitScript((on) => {
      try {
        localStorage.setItem('eidconnect_product_intro_done_v4', 'true');
        sessionStorage.setItem('eidconnect_prelogin_v2', 'ok');
        sessionStorage.setItem('eidconnect_wants_walkthrough_v1', '0');
        localStorage.setItem('eidconnect_rewards_optin_prompt_shown_v1', '1');
        if (on === true) {
          localStorage.setItem('eidconnect_consent_local_benefits', 'true');
          localStorage.setItem('eidconnect_consent_praemien', 'true');
          localStorage.setItem('eidconnect_demo_points_total', '2800');
          localStorage.setItem(
            'eidconnect_participation_data',
            JSON.stringify({
              points: 2800,
              votes: 0,
              elections: 0,
              byLevel: { bund: 0, land: 0, kreis: 0, kommune: 0 },
            }),
          );
        }
        if (on === false) {
          localStorage.setItem('eidconnect_consent_local_benefits', 'false');
          localStorage.setItem('eidconnect_consent_praemien', 'false');
        }
      } catch {
        /* ignore */
      }
    }, shot.rewardsOn ?? null);
    const page = await context.newPage();
    await bootstrapLoggedIn(page);
    await navigate(page, shot);
    if (shot.utility === 'Prämien') {
      if (shot.rewardsOn === true) {
        await page
          .waitForFunction(
            () => {
              const badge = document.querySelector('.civic-points-badge');
              return badge && /2[.,\s]?800/.test(badge.textContent || '');
            },
            { timeout: 8000 },
          )
          .catch(async () => {
            const activate = page.locator('.civic-points-activate');
            if (await activate.count()) await activate.first().click();
            await page.waitForTimeout(600);
          });
      } else if (shot.rewardsOn === false) {
        const toggle = page.getByRole('checkbox', { name: /Mitwirkungspunkte anzeigen/i });
        if ((await toggle.count()) && (await toggle.isChecked())) await toggle.uncheck();
        await page
          .waitForSelector('.civic-points-activate', { timeout: 5000 })
          .catch(() => {});
      }
      await page.waitForTimeout(400);
    }
    await scrollMainToTop(page);
    const metrics = await measureScreen(page);
    const path = join(OUT_DIR, shot.file);
    await page.screenshot({ path, fullPage: false });
    results.push({ file: shot.file, viewport: label, ...metrics });
    await context.close();
  }

  return results;
}

async function buildContactSheet(browser, files, outName, cols = 3) {
  const page = await browser.newPage();
  const html = `<!DOCTYPE html><html><head><style>
    body{margin:0;padding:8px;background:#eef2f7;font-family:system-ui,sans-serif}
    .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px}
    .item img{width:100%;height:auto;display:block;border-radius:8px;border:1px solid #d6e0ee}
    p{font-size:10px;margin:4px 0 0;color:#334155}
  </style></head><body><div class="grid">
  ${files.map((f) => `<div class="item"><img src="./${f}" alt="${f}"/><p>${f}</p></div>`).join('')}
  </div></body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: join(OUT_DIR, outName), fullPage: true });
  await page.close();
}

mkdirSync(OUT_DIR, { recursive: true });

const report = {
  base: BASE,
  capturedAt: new Date().toISOString(),
  brandWordmarkNote:
    'Historisch: clamp(5.25rem…7.5rem) galt width auf .app-shell-brand-wordmark (SVG-<img>), nicht font-size. Jetzt: --civic-brand-wordmark-height: 28px.',
  measurements: [],
  screenshots: [],
};

const browser = await chromium.launch();

try {
  const m390 = await captureSet(browser, SHOTS_390, { width: 390, height: 844 }, '390x844');
  const m430 = await captureSet(browser, SHOTS_430, { width: 430, height: 932 }, '430x932');
  report.measurements = [...m390, ...m430];
  report.screenshots = report.measurements.map((m) => m.file);

  await buildContactSheet(
    browser,
    SHOTS_390.map((s) => s.file),
    'contact-sheet-390.png',
    3,
  );
  await buildContactSheet(
    browser,
    SHOTS_430.map((s) => s.file),
    'contact-sheet-430.png',
    3,
  );

  const bet = report.measurements.find((m) => m.file.includes('beteiligen'));
  const wah = report.measurements.find((m) => m.file.includes('wahlen') && m.file.includes('390'));
  const set = report.measurements.find((m) => m.file.includes('einstellungen') && m.file.includes('390'));
  const praOn = report.measurements.find((m) => m.file.includes('praemien-aktiv'));
  const praOff = report.measurements.find((m) => m.file.includes('praemien-inaktiv'));

  report.summary = {
    beteiligen: { axisDelta: bet?.axisDeltaBrandH1, genericFilter: bet?.genericFilterVisible, pagination: bet?.paginationVisible },
    wahlen: { axisDelta: wah?.axisDeltaBrandH1, genericFilter: wah?.genericFilterVisible },
    praemienAktiv: {
      h1: praOn?.h1FullText,
      stateLabel: praOn?.praemienStateLabel,
      points2800: /2[.,\s]?800/.test(praOn?.praemienStateLabel || ''),
      brandLarger: praOn?.brandLargerThanH1,
    },
    praemienInaktiv: { h1: praOff?.h1FullText },
    einstellungen: { mainPage: set?.settingsIsMainPage, doubleScrollbar: set?.doubleScrollbar },
  };

  report.allPass =
    report.measurements.every(
      (m) =>
        m.brandLargerThanH1 &&
        m.axisDeltaBrandH1 <= 1 &&
        !m.genericFilterVisible &&
        !m.paginationVisible &&
        !m.horizontalOverflow &&
        !m.claraOverlap &&
        !m.doubleScrollbar &&
        !m.watermarkOverContent &&
        m.scrollTop === 0,
    ) &&
    bet &&
    !bet.genericFilterVisible &&
    !bet.paginationVisible &&
    wah &&
    !wah.genericFilterVisible &&
    set &&
    set.settingsIsMainPage === true &&
    praOn &&
    /2[.,\s]?800/.test(praOn.praemienStateLabel || '');
} catch (err) {
  report.error = String(err?.message || err);
  report.allPass = false;
} finally {
  await browser.close();
}

writeFileSync(join(OUT_DIR, 'capture-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exit(report.allPass ? 0 : 1);
