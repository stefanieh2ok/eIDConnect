/**
 * Löscht Next-Build-Cache und optionales webpack-Cache unter node_modules.
 * Hilft bei "Cannot find module './XXXX.js'" / inkonsistentem .next nach Dev-Abstürzen.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const rel of ['.next', path.join('node_modules', '.cache')]) {
  const abs = path.join(root, rel);
  try {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log('removed:', rel);
  } catch (e) {
    if (e && e.code !== 'ENOENT') console.warn('skip', rel, e.message);
  }
}
