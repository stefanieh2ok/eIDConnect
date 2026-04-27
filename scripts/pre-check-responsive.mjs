#!/usr/bin/env node
/**
 * Vorab-Check Desktop + Mobile gegen eine laufende URL (Standard: Produktion).
 * Playwright: Viewports, Konsolenfehler, sichtbare Kern-UI.
 *
 * Aufruf: node scripts/pre-check-responsive.mjs [BASE_URL]
 * Beispiel: node scripts/pre-check-responsive.mjs https://hookai-two.vercel.app
 */
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://hookai-two.vercel.app').replace(/\/$/, '');

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
];

function shouldIgnoreConsole(msg) {
  const t = msg.type();
  const text = msg.text();
  if (t !== 'error' && t !== 'warning') return true;
  if (/favicon|Failed to load resource.*404/i.test(text)) return true;
  return false;
}

async function runViewport(browser, { name, width, height }) {
  const issues = [];
  const consoleMsgs = [];

  const context = await browser.newContext({
    viewport: { width, height },
    userAgent:
      name === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
  });

  const page = await context.newPage();
  page.on('console', (msg) => {
    if (shouldIgnoreConsole(msg)) return;
    consoleMsgs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    consoleMsgs.push({ type: 'pageerror', text: String(err?.message || err) });
  });

  async function visit(path, checks) {
    const url = `${BASE}${path}`;
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!res || res.status() >= 400) {
      issues.push(`${path}: HTTP ${res?.status() ?? '?'}`);
      return;
    }
    await page.waitForTimeout(800);
    for (const { label, fn } of checks) {
      try {
        const ok = await fn(page);
        if (!ok) issues.push(`${path}: ${label}`);
      } catch (e) {
        issues.push(`${path}: ${label} (${e?.message || e})`);
      }
    }
  }

  await visit('/', [
    {
      label: 'HookAI / Civic im Dokument',
      fn: async (p) => {
        const html = await p.content();
        return /HookAI|Civic Demo|eidconnect/i.test(html);
      },
    },
  ]);

  await visit('/legal/demo-nda', [
    {
      label: 'ProductIdentityHeader / Tagline',
      fn: async (p) => {
        const tagline = p.locator('.t-app-subtitle').first();
        if (!(await tagline.count())) return false;
        const nowrap = await tagline.evaluate((el) => {
          const s = window.getComputedStyle(el);
          return s.whiteSpace === 'nowrap' || s.whiteSpace === 'pre';
        });
        const box = await tagline.boundingBox();
        return nowrap && box && box.height > 0 && box.width > 0;
      },
    },
    {
      label: 'NDA / PDF-Aktionen',
      fn: async (p) => !!(await p.getByRole('link', { name: /PDF|Drucken|herunterladen/i }).count()),
    },
  ]);

  await visit('/demo', [
    {
      label: 'Demo-Hinweis',
      fn: async (p) => {
        const t = await p.textContent('body');
        return t && /personalisierten|Demo|Zugang/i.test(t);
      },
    },
  ]);

  await visit('/demo/access', [
    {
      label: 'Ohne Token: Hinweis',
      fn: async (p) => {
        const t = await p.textContent('body');
        return t && /Kein Zugangslink|Zum Demo-Einstieg/i.test(t);
      },
    },
  ]);

  await context.close();

  return { name, width, height, issues, consoleMsgs };
}

async function fetchSmoke() {
  const out = [];
  const home = await fetch(`${BASE}/`);
  out.push({ path: '/', ok: home.ok, status: home.status });

  const demo = await fetch(`${BASE}/demo`);
  out.push({ path: '/demo', ok: demo.ok, status: demo.status });

  const nda = await fetch(`${BASE}/legal/demo-nda`);
  out.push({ path: '/legal/demo-nda', ok: nda.ok, status: nda.status });

  const chat = await fetch(`${BASE}/api/clara/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Ping', preferences: undefined }),
  });
  let chatOk = chat.ok;
  try {
    const j = await chat.json();
    chatOk = chatOk && !!j?.response;
  } catch {
    chatOk = false;
  }
  out.push({ path: 'POST /api/clara/chat', ok: chatOk, status: chat.status });

  return out;
}

async function main() {
  console.log('Pre-Check responsive — BASE=%s\n', BASE);

  const smoke = await fetchSmoke();
  for (const row of smoke) {
    console.log(row.ok ? '✅' : '❌', `${row.path} → ${row.status}`);
  }

  console.log('\nPlaywright (Chromium) …');
  const browser = await chromium.launch({ headless: true });

  let exit = 0;
  for (const vp of VIEWPORTS) {
    const r = await runViewport(browser, vp);
    console.log(`\n── ${r.name} (${r.width}×${r.height}) ──`);
    if (r.issues.length === 0) {
      console.log('✅ Alle Seiten-Checks bestanden');
    } else {
      exit = 1;
      for (const i of r.issues) console.log('❌', i);
    }
    if (r.consoleMsgs.length) {
      exit = 1;
      console.log('⚠️ Konsolen-Meldungen:');
      for (const m of r.consoleMsgs.slice(0, 12)) {
        console.log(`   [${m.type}]`, m.text.slice(0, 200));
      }
      if (r.consoleMsgs.length > 12) console.log(`   … +${r.consoleMsgs.length - 12} weitere`);
    } else {
      console.log('✅ Keine relevanten Konsolenfehler');
    }
  }

  await browser.close();

  console.log(
    '\nHinweis: Clara-Pille und Walkthrough im Gerätemodus brauchen einen gültigen Demo-Link (/demo/[id]); dafür bitte einmal manuell mit deinem Token prüfen.',
  );
  process.exit(exit);
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
