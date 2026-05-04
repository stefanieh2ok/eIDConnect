/**
 * Diagnose: OPENAI_API_KEY je Datei — nur Präsenz, Prefix, Länge, SHA256-Fingerprints (kein Klartext-Key).
 * node scripts/check-openai-env-redacted.mjs
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function parseEnvFile(absPath) {
  if (!fs.existsSync(absPath)) return null;
  const out = {};
  for (const line of fs.readFileSync(absPath, 'utf8').split(/\r?\n/)) {
    if (/^\s*#/.test(line)) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function fp12(secret) {
  return crypto.createHash('sha256').update(secret, 'utf8').digest('hex').slice(0, 12);
}

for (const f of ['.env.local', '.env']) {
  const abs = path.join(root, f);
  const o = parseEnvFile(abs);
  if (!o) {
    console.log(`${f}: (file missing)`);
    continue;
  }
  const k = String(o.OPENAI_API_KEY ?? '');
  const set = k.trim().length > 0;
  const last4hash = set && k.length >= 4 ? fp12(k.slice(-4)) : '(n/a)';
  console.log(
    `${f}: OPENAI_API_KEY set=${set}` +
      (set
        ? ` prefix=${JSON.stringify(k.slice(0, 7))} len=${k.length} key_sha256_12=${fp12(k)} last4_sha256_12=${last4hash}`
        : ''),
  );
}

const win = process.env.OPENAI_API_KEY;
console.log(
  `process.env.OPENAI_API_KEY (shell inherit): set=${!!(win && String(win).trim())}` +
    (win && String(win).trim()
      ? ` prefix=${JSON.stringify(String(win).slice(0, 7))} key_sha256_12=${fp12(String(win))}`
      : ''),
);
