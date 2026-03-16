/**
 * Prüft den RSA-Privatkey aus RSA/RSA.txt mit derselben Logik wie lib/docusign.ts
 * Ausführen: node scripts/check-docusign-key.js
 */
const { createPrivateKey } = require('crypto');
const fs = require('fs');
const path = require('path');

const rsaPath = path.join(__dirname, '..', 'RSA', 'RSA.txt');
const content = fs.readFileSync(rsaPath, 'utf8');

// Nur den Block "-----BEGIN RSA PRIVATE KEY-----" bis "-----END RSA PRIVATE KEY-----" extrahieren
const match = content.match(/-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/);
if (!match) {
  console.error('FEHLER: Kein "BEGIN RSA PRIVATE KEY" Block in RSA/RSA.txt gefunden.');
  process.exit(1);
}

let key = match[0].replace(/\\n/g, '\n').trim();

// Wie in lib/docusign.ts: Zeilenumbrüche wiederherstellen falls eine Zeile
if (!key.includes('\n') && key.includes('-----BEGIN')) {
  key = key
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, '-----BEGIN RSA PRIVATE KEY-----\n')
    .replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
    .replace(/-----END RSA PRIVATE KEY-----/, '\n-----END RSA PRIVATE KEY-----')
    .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
}

try {
  createPrivateKey(key).export({ format: 'pem', type: 'pkcs1' });
  console.log('OK: Der Private Key aus RSA/RSA.txt ist gültig (RSA, PKCS#1).');
  console.log('Für .env.local: Den Block "-----BEGIN RSA PRIVATE KEY-----" bis "-----END RSA PRIVATE KEY-----"');
  console.log('unter DOCUSIGN_PRIVATE_KEY eintragen. Bei einer Zeile: Zeilenumbrüche als \\n (Backslash-n) schreiben.');
  process.exit(0);
} catch (e) {
  console.error('FEHLER beim Einlesen des Keys:', e.message);
  process.exit(1);
}
