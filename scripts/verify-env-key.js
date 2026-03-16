const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DOCUSIGN_PRIVATE_KEY="([^"]*)"/);
const key = match ? match[1] : (process.env.DOCUSIGN_PRIVATE_KEY || '');
const normalized = key.replace(/\\n/g, '\n').trim();
const hasNewlines = normalized.includes('\n');
const begins = normalized.startsWith('-----BEGIN RSA PRIVATE KEY-----');
const ends = normalized.includes('-----END RSA PRIVATE KEY-----');
console.log('DOCUSIGN_PRIVATE_KEY geladen:', !!key);
console.log('Länge:', key.length);
console.log('Nach \\n-Ersetzung Zeilenumbrüche:', hasNewlines);
console.log('Beginnt mit BEGIN RSA PRIVATE KEY:', begins);
console.log('Enthält END RSA PRIVATE KEY:', ends);
try {
  const crypto = require('crypto');
  crypto.createPrivateKey(normalized).export({ format: 'pem', type: 'pkcs1' });
  console.log('Key gültig (createPrivateKey): ja');
} catch (e) {
  console.log('Key gültig: nein -', e.message);
  process.exit(1);
}
