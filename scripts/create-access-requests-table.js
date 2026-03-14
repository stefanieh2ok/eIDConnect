#!/usr/bin/env node
/**
 * Legt die Tabelle access_requests in Supabase an.
 *
 * Option A – Mit Datenbank-URL (automatisch):
 *   In .env.local eintragen: DATABASE_URL=postgresql://postgres.[ref]:[DEIN-DB-PASSWORT]@aws-0-[region].pooler.supabase.com:6543/postgres
 *   (aus Supabase Dashboard → Project Settings → Database → Connection string (URI))
 *   Dann: node scripts/create-access-requests-table.js
 *
 * Option B – Ohne DATABASE_URL:
 *   SQL manuell ausführen: Supabase Dashboard → SQL Editor → New query
 *   Inhalt von scripts/sql/access_requests.sql einfügen → Run
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const sqlPath = path.join(root, 'scripts', 'sql', 'access_requests.sql');

function loadEnv() {
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    out[key] = value;
  }
  return out;
}

async function main() {
  const env = loadEnv();
  const databaseUrl = env.DATABASE_URL;

  const sql = fs.readFileSync(sqlPath, 'utf8');

  if (!databaseUrl) {
    console.log('DATABASE_URL ist nicht gesetzt.');
    console.log('');
    console.log('Bitte die Tabelle manuell anlegen:');
    console.log('1. Supabase Dashboard öffnen → SQL Editor → New query');
    console.log('2. Den folgenden SQL-Block einfügen und ausführen (Run):');
    console.log('');
    console.log('---');
    console.log(sql);
    console.log('---');
    console.log('');
    console.log('Oder die Datei scripts/sql/access_requests.sql im SQL Editor einfügen.');
    process.exit(1);
  }

  try {
    const { Client } = require('pg');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    await client.query(sql);
    await client.end();
    console.log('Tabelle access_requests wurde angelegt.');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('pg')) {
      console.log('Das Modul "pg" fehlt. Bitte ausführen: npm install --save-dev pg');
      console.log('');
      console.log('Alternativ SQL manuell ausführen – siehe scripts/sql/access_requests.sql');
      process.exit(1);
    }
    console.error('Fehler beim Anlegen der Tabelle:', err.message);
    process.exit(1);
  }
}

main();
