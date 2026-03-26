#!/usr/bin/env node
/**
 * copy-assets.js
 * Copies public/, src/assets/, and src/locales/ into dist/.
 * Also copies each page's HTML and CSS to dist/ mirroring src structure.
 */

import { cpSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const copy = (src, dest) => {
  // Use dirname so that file destinations (e.g. dist/pages/home/index.html)
  // create their parent directory, not a directory named after the file itself.
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`Copied: ${src} → ${dest}`);
};

copy(`${ROOT}/public`, `${ROOT}/dist`);
copy(`${ROOT}/src/assets`, `${ROOT}/dist/assets`);
copy(`${ROOT}/src/locales`, `${ROOT}/dist/locales`);
copy(`${ROOT}/src/css`, `${ROOT}/dist/css`);
copy(`${ROOT}/src/components`, `${ROOT}/dist/components`);

// Copy each page's HTML
const pages = ['home', 'gallery', 'about'];
for (const page of pages) {
  copy(`${ROOT}/src/pages/${page}/index.html`, `${ROOT}/dist/pages/${page}/index.html`);
  copy(`${ROOT}/src/pages/${page}/${page}.css`, `${ROOT}/dist/pages/${page}/${page}.css`);
}

console.log('Assets copied successfully.');
