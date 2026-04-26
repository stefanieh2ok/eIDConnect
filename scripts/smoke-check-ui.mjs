#!/usr/bin/env node
/**
 * Smoke-Check: Holt Start- und Demo-Seite und prüft erwartete Inhalte.
 * Voraussetzung: Dev-Server läuft (npm run dev).
 * Aufruf: node scripts/smoke-check-ui.mjs [BASE_URL]
 */
const BASE = process.argv[2] || 'http://localhost:3002';

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  const text = await res.text();
  return { status: res.status, url: res.url, text };
}

async function main() {
  console.log('Smoke-Check UI (BASE=%s)\n', BASE);
  let ok = true;

  const home = await fetchText(`${BASE}/`);
  if (home.status !== 200) {
    console.log('❌ GET / → %s (erwartet 200)', home.status);
    ok = false;
  } else {
    console.log('✅ GET / → 200');
    if (!home.text.includes('HookAI') && !home.text.includes('Civic Demo') && !home.text.includes('eidconnect')) {
      console.log('   ⚠ Kein erwarteter App-/Marken-Hinweis im HTML (HookAI Civic Demo)');
    }
  }

  const demo = await fetchText(`${BASE}/demo`);
  if (demo.status !== 200) {
    console.log('❌ GET /demo → %s (erwartet 200)', demo.status);
    ok = false;
  } else {
    console.log('✅ GET /demo → 200');
    if (!demo.text.includes('Demo') && !demo.text.includes('Zugang')) {
      console.log('   ⚠ Kein Demo-/Zugang-Hinweis im HTML gefunden');
    }
  }

  const chat = await fetch(
    `${BASE}/api/clara/chat`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Hallo', preferences: undefined }) }
  );
  if (chat.status !== 200) {
    console.log('❌ POST /api/clara/chat → %s', chat.status);
    ok = false;
  } else {
    const body = await chat.json();
    if (body.response) console.log('✅ POST /api/clara/chat → 200 (Clara antwortet)');
    else { console.log('❌ POST /api/clara/chat → 200 aber keine response'); ok = false; }
  }

  console.log('');
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error('Fehler:', e.message);
  process.exit(1);
});
