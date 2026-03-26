#!/usr/bin/env node
/**
 * build-css.js
 * Copies all CSS files to dist preserving the src structure.
 * In production you can swap this for lightningcss minification.
 */

import { cpSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const dirs = [
  ['src/css', 'dist/css'],
  ['src/components/header', 'dist/components/header'],
  ['src/components/footer', 'dist/components/footer'],
  ['src/components/nav', 'dist/components/nav'],
  ['src/pages/home', 'dist/pages/home'],
  ['src/pages/gallery', 'dist/pages/gallery'],
  ['src/pages/about', 'dist/pages/about'],
];

for (const [src, dest] of dirs) {
  const srcPath = resolve(ROOT, src);
  const destPath = resolve(ROOT, dest);
  mkdirSync(destPath, { recursive: true });
  cpSync(srcPath, destPath, { recursive: true, filter: (f) => f.endsWith('.css') || !f.includes('.') });
  console.log(`CSS: ${src} → ${dest}`);
}

console.log('CSS build complete.');
