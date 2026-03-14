#!/usr/bin/env node
/**
 * Legt .env.local aus .env.example an oder ergänzt fehlende Keys.
 * Überschreibt keine bestehenden Werte in .env.local.
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const examplePath = path.join(root, '.env.example');
const localPath = path.join(root, '.env.local');

function parseEnv(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    out[key] = { raw: trimmed, value };
  }
  return out;
}

function serializeEnv(entries) {
  return Object.values(entries)
    .map((e) => e.raw)
    .join('\n');
}

try {
  if (!fs.existsSync(examplePath)) {
    console.error('❌ .env.example nicht gefunden.');
    process.exit(1);
  }

  const exampleContent = fs.readFileSync(examplePath, 'utf8');
  const exampleEntries = parseEnv(exampleContent);

  if (!fs.existsSync(localPath)) {
    fs.writeFileSync(localPath, exampleContent);
    console.log('✅ .env.local wurde aus .env.example erstellt.');
  } else {
    const localContent = fs.readFileSync(localPath, 'utf8');
    const localEntries = parseEnv(localContent);
    let added = 0;
    for (const [key, entry] of Object.entries(exampleEntries)) {
      if (!(key in localEntries)) {
        localEntries[key] = entry;
        added++;
      }
    }
    if (added > 0) {
      const newContent = serializeEnv(localEntries);
      fs.writeFileSync(localPath, newContent);
      console.log(`✅ .env.local ergänzt (${added} neue Variable(n)).`);
    } else {
      console.log('✅ .env.local existiert bereits; keine Änderung nötig.');
    }
  }

  console.log('');
  console.log('Nächste Schritte für den Demo-Zugang:');
  console.log('1. Supabase: https://supabase.com/dashboard → Projekt erstellen oder öffnen');
  console.log('2. Project Settings → API: Project URL und service_role Key kopieren');
  console.log('3. In .env.local eintragen: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY');
  console.log('4. Migrationen ausführen (Supabase SQL Editor): siehe docs/SETUP-ZUGANG.md');
  console.log('5. Dev-Server neu starten: npm run dev');
  console.log('');
} catch (err) {
  console.error('❌ Fehler:', err.message);
  process.exit(1);
}
