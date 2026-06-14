/**
 * Regression: zwei direkte OpenAI /v1/audio/speech Calls (gleicher Key aus .env.local).
 * Kein Key-Output. Nur Status, content-type, bytes, error JSON fields.
 * node scripts/tts-openai-legacy-vs-current.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadOpenAiKey() {
  const p = path.join(root, '.env.local');
  if (!fs.existsSync(p)) throw new Error('.env.local fehlt');
  const text = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*#/.test(line)) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const k = line.slice(0, eq).trim();
    if (k !== 'OPENAI_API_KEY') continue;
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    const out = v.trim();
    if (out) return out;
  }
  throw new Error('OPENAI_API_KEY nicht in .env.local');
}

const INSTRUCTIONS_DE =
  'Sprich als moderne, lebendige, freundliche Frau Mitte 20. Die Stimme soll warm, frisch, klar und intelligent wirken – nicht behördlich, nicht altmodisch, nicht mütterlich, nicht steif. Klangbild: sympathisch, wortgewandt, motivierend, mit natürlicher Energie und leichter Dynamik. Sprechtempo: leicht zügig, aber gut verständlich. Tonfall: souverän, positiv, menschlich, zugänglich. Betonung: natürlich und dialogisch, als würde Clara die Nutzerin oder den Nutzer persönlich und mit Freude durch die App führen. Vermeide jeden Klang von Callcenter, Nachrichtensprecherin oder Verwaltungsansage.';

async function callOpenAI(label, body) {
  const key = loadOpenAiKey();
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const ct = res.headers.get('content-type') ?? '';
  const buf = await res.arrayBuffer();
  let errType;
  let errCode;
  let msgPrev;
  if (!res.ok && ct.includes('json')) {
    try {
      const j = JSON.parse(Buffer.from(buf).toString('utf8'));
      errType = j?.error?.type;
      errCode = j?.error?.code;
      msgPrev = typeof j?.error?.message === 'string' ? j.error.message.slice(0, 200) : undefined;
    } catch {
      /* ignore */
    }
  }
  console.log(JSON.stringify({ label, openaiHttpStatus: res.status, contentType: ct, bytes: buf.byteLength, errorType: errType ?? null, errorCode: errCode ?? null, messagePreview: msgPrev ?? null }));
}

const input = 'Hallo.';

await callOpenAI('legacy_alloy_no_instructions', {
  model: 'gpt-4o-mini-tts',
  voice: 'alloy',
  input,
});

await callOpenAI('current_nova_instructions_speed', {
  model: 'gpt-4o-mini-tts',
  voice: 'nova',
  input,
  speed: 1.05,
  instructions: INSTRUCTIONS_DE,
});
