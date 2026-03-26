#!/usr/bin/env node
/**
 * i18n-check.js
 * Walks all HTML files in src/, collects every data-i18n and data-i18n-attr key,
 * then verifies each key exists in all supported locale JSON files.
 * Exits with code 1 if any key is missing.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'src');
const LOCALES_DIR = join(SRC, 'locales');
const SUPPORTED_LOCALES = ['en', 'es'];

// Recursively collect all .html files
const walkHtml = (dir) => {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkHtml(full));
    } else if (entry.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
};

// Extract data-i18n keys from HTML content
const extractKeys = (html) => {
  const keys = new Set();

  // data-i18n="key"
  for (const match of html.matchAll(/data-i18n="([^"]+)"/g)) {
    keys.add(match[1]);
  }

  // data-i18n-attr="attr:key,attr2:key2"
  for (const match of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const pair of match[1].split(',')) {
      const parts = pair.trim().split(':');
      if (parts.length >= 2) {
        keys.add(parts.slice(1).join(':'));
      }
    }
  }

  return keys;
};

// Flatten nested JSON to dot-notation keys
const flattenKeys = (obj, prefix = '') => {
  const keys = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) {
      for (const nested of flattenKeys(v, full)) keys.add(nested);
    } else {
      keys.add(full);
    }
  }
  return keys;
};

// Load all locale JSON files for a given locale, merged by page
const loadLocale = (locale) => {
  const localeDir = join(LOCALES_DIR, locale);
  const merged = {};
  for (const file of readdirSync(localeDir)) {
    if (!file.endsWith('.json')) continue;
    const content = JSON.parse(readFileSync(join(localeDir, file), 'utf8'));
    Object.assign(merged, content);
  }
  return flattenKeys(merged);
};

// Main
const htmlFiles = walkHtml(SRC);
const allHtmlKeys = new Set();
for (const file of htmlFiles) {
  for (const key of extractKeys(readFileSync(file, 'utf8'))) {
    allHtmlKeys.add(key);
  }
}

let hasErrors = false;

for (const locale of SUPPORTED_LOCALES) {
  const localeKeys = loadLocale(locale);
  const missing = [...allHtmlKeys].filter((k) => !localeKeys.has(k));

  if (missing.length > 0) {
    console.error(`\n[i18n-check] MISSING keys in locale "${locale}":`);
    missing.forEach((k) => console.error(`  - ${k}`));
    hasErrors = true;
  } else {
    console.log(`[i18n-check] ✓ locale "${locale}" — all ${allHtmlKeys.size} keys present`);
  }
}

if (hasErrors) {
  console.error('\n[i18n-check] FAILED — add missing keys to locale files.\n');
  process.exit(1);
} else {
  console.log('\n[i18n-check] All locales complete.\n');
}
