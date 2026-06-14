#!/usr/bin/env node
/** Quick a11y probes on logged-in Wegweiser + Clara (390px). */
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function loadAdminSecret() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return null;
  const text = readFileSync(envPath, 'utf8');
  const m = text.match(/^ADMIN_DEMO_SECRET=(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

async function bootstrap(page, base) {
  await page.addInitScript(() => {
    localStorage.setItem('eidconnect_product_intro_done_v4', 'true');
    sessionStorage.setItem('eidconnect_prelogin_v2', 'ok');
    sessionStorage.setItem('eidconnect_wants_walkthrough_v1', '0');
  });
  const secret = loadAdminSecret();
  const url = secret
    ? `${base}/api/admin/enter-demo?secret=${encodeURIComponent(secret)}&demo_id=eidconnect-v1`
    : `${base}/demo/eidconnect-v1`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1000);
  const du = page.getByRole('button', { name: /^Du$/i });
  if (await du.count()) await du.first().click();
  const direct = page.getByRole('button', { name: /Direkt zur App/i });
  if (await direct.count()) await direct.first().click();
  await page.waitForTimeout(800);
}

async function main() {
  const base = (process.argv[2] || 'http://localhost:3002').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await bootstrap(page, base);
  await page.locator('.app-bottom-nav__item').filter({ hasText: 'Wegweiser' }).first().click();
  await page.waitForTimeout(500);

  const wegweiser = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button, a')].filter((el) => {
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden';
    });
    const unnamedIconOnly = buttons.filter((b) => {
      const hasName = b.getAttribute('aria-label') || b.textContent?.trim();
      const isIconOnly = b.querySelector('svg') && !(b.textContent?.trim());
      return isIconOnly && !hasName;
    });
    const small = buttons.filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
    });
    return { unnamedIconOnly: unnamedIconOnly.length, smallHitAreas: small.length };
  });

  const claraBtn = page.getByRole('button', { name: /Frag Clara|Clara/i }).first();
  if (await claraBtn.count()) await claraBtn.click();
  await page.waitForTimeout(700);

  const clara = await page.evaluate(() => {
    const inputRow = document.querySelector('.clara-chat-dock__input-row');
    const send = document.querySelector('.clara-chat-dock__send');
    const sheetScroll = document.querySelector('.clara-sheet__scroll');
    const msgScroll = document.querySelector('.clara-chat-dock__messages');
    const inputRect = inputRow?.getBoundingClientRect();
    const sendRect = send?.getBoundingClientRect();
    const viewportH = window.innerHeight;
    return {
      inputVisible: !!inputRow && inputRect.bottom <= viewportH + 2,
      sendVisible: !!send && sendRect.bottom <= viewportH + 2,
      sendSize: send ? { w: sendRect.width, h: sendRect.height } : null,
      scrollContainers: {
        sheet: sheetScroll ? getComputedStyle(sheetScroll).overflowY : null,
        messages: msgScroll ? getComputedStyle(msgScroll).overflowY : null,
      },
      disclaimer: document.querySelector('.clara-sheet__disclaimer')?.textContent?.trim() || null,
    };
  });

  const snapshot = await page.accessibility.snapshot();
  const interactiveCount = JSON.stringify(snapshot).split('"role":"button"').length - 1;

  console.log(
    JSON.stringify(
      {
        viewport: 390,
        wegweiser,
        clara,
        accessibilitySnapshotButtons: interactiveCount,
        lighthouseNote:
          'Full Lighthouse on authenticated SPA requires manual run after /api/admin/enter-demo. Playwright probes used instead.',
      },
      null,
      2,
    ),
  );

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
