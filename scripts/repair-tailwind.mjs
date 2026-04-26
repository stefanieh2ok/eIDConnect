/**
 * Repariert fehlende Tailwind-Dateien (z. B. lib/css/preflight.css) nach abgebrochenem
 * npm install / EPERM unter Windows: Paketordner entfernen und neu installieren.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tailwindDir = path.join(root, 'node_modules', 'tailwindcss');
const preflight = path.join(tailwindDir, 'lib', 'css', 'preflight.css');

if (fs.existsSync(preflight)) {
  console.log('OK: tailwindcss/lib/css/preflight.css ist vorhanden — nichts zu tun.');
  process.exit(0);
}

console.log('tailwindcss wirkt unvollständig — entferne Paketordner und installiere neu …');
try {
  fs.rmSync(tailwindDir, { recursive: true, force: true });
} catch (e) {
  console.error('Konnte node_modules/tailwindcss nicht löschen:', e.message);
  process.exit(1);
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const r = spawnSync(npm, ['install', 'tailwindcss@3.4.17', '--save-dev', '--no-audit', '--no-fund'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(r.status === 0 ? 0 : r.status ?? 1);
