/**
 * Erstellt einen 10-Minuten-Zugangslink (Checkbox-NDA, ohne DocuSign).
 * Nutzung: node scripts/create-10min-link.mjs "Vorname Nachname" email@example.com
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
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
  } catch {
    /* .env.local optional */
  }
}

loadEnvLocal();

const fullName = (process.argv[2] ?? 'Demo Gast').trim();
const email = (process.argv[3] ?? 'demo-gast@hookai.local').trim();
const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002').replace(/\/$/, '');
// Hinweis: Die API liefert die finale URL; bei lokalem Dev-Fallback immer localhost.
const user = process.env.ADMIN_BASIC_USER ?? '';
const pass = process.env.ADMIN_BASIC_PASS ?? '';

if (!user || !pass) {
  console.error('ADMIN_BASIC_USER / ADMIN_BASIC_PASS fehlen in .env.local');
  process.exit(1);
}

const auth = Buffer.from(`${user}:${pass}`).toString('base64');
const res = await fetch(`${baseUrl}/api/admin/create-access-link`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${auth}`,
  },
  body: JSON.stringify({
    fullName,
    email,
    demoId: 'eidconnect-v1',
    expiresInMinutes: 10,
    requireDocusign: false,
  }),
});

const data = await res.json().catch(() => ({}));
if (!res.ok) {
  if (res.status === 401) {
    console.error('Nicht autorisiert (401).');
    console.error('Prüfen Sie ADMIN_BASIC_USER und ADMIN_BASIC_PASS in .env.local.');
    console.error('Dev-Server nach Änderungen neu starten: npm run dev');
  } else if (res.status === 503) {
    console.error('Admin nicht konfiguriert:', data.error ?? res.statusText);
  } else {
    console.error('Fehler:', data.error ?? res.statusText);
    if (String(data.error ?? '').includes('nicht erstellt')) {
      console.error('Hinweis: Oft Supabase nicht erreichbar – NEXT_PUBLIC_SUPABASE_URL prüfen.');
    }
  }
  process.exit(1);
}

console.log('Zugangslink (10 Min., danach automatisch ungültig):');
console.log(data.accessUrl);
console.log('Gültig bis:', data.expiresAt);
