# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for Mario Acosta, a tile and stone contractor. Three pages: landing (parallax hero + services), gallery (filterable project grid), about + contact. Bilingual EN/ES. Vanilla HTML5 + CSS + TypeScript — no frameworks, no Tailwind.

## Commands

```bash
npm run dev          # browser-sync dev server at localhost:3000 (serves src/)
npm run build        # typecheck → build:ts → build:css → copy:assets → outputs dist/
npm run typecheck    # tsc --noEmit (run before every commit)
npm run lint         # htmlhint + stylelint + eslint
npm run format       # prettier --write on all src files
npm run i18n:check   # verify 100% key coverage in both en/ and es/ locales
```

No test runner is configured. Verification is: `npm run typecheck && npm run lint && npm run i18n:check`.

## Architecture

### Build pipeline
- **TypeScript**: esbuild bundles three entry points (`home.ts`, `gallery.ts`, `about.ts`) → `dist/`. Each page imports only what it needs.
- **CSS**: `scripts/build-css.js` copies CSS files from `src/` to `dist/` preserving structure. No bundling — stylesheets are loaded individually via `<link>` tags.
- **Assets/locales**: `scripts/copy-assets.js` copies `public/`, `src/assets/`, `src/locales/`, and page HTML to `dist/`.

### CSS loading order (all pages)
`tokens.css` → `reset.css` → `base.css` → `utilities.css` → `header.css` → `footer.css` → `<page>.css`

`tokens.css` is the single source of truth for all design values. Never hardcode color, spacing, or font values in component files.

### TypeScript module graph
```
utils.ts          ← imported by everything (throttle, debounce, qs, qsAll)
theme.ts          ← standalone, reads/writes localStorage('locale')
i18n.ts           ← depends on utils; fetches locales, applies data-i18n attrs
scroll-reveal.ts  ← depends on utils; IntersectionObserver, fires once per element
header.ts         ← depends on utils + i18n (setLocale)
home.ts           ← entry point: theme → i18n → scroll-reveal → parallax → header
gallery.ts        ← entry point: theme → i18n → scroll-reveal → gallery filter → header
about.ts          ← entry point: theme → i18n → scroll-reveal → contact form → header
```

### i18n system
- Locale JSON files live in `src/locales/{en,es}/{common,home,gallery,about}.json`.
- Each page loads `common.json` + its own namespace in parallel.
- HTML elements use `data-i18n="dot.notation.key"` for `textContent` and `data-i18n-attr="attr:key,attr2:key2"` for attributes (alt, placeholder, aria-label).
- `<html data-page="home|gallery|about">` tells `i18n.ts` which namespace to load.
- When adding or renaming any key, update **both** `en/` and `es/` files and re-run `npm run i18n:check`.

### Parallax + scroll-reveal
- Desktop parallax: CSS `background-attachment: fixed` on `.hero`.
- Mobile parallax fallback: `@media (hover: none)` disables fixed attachment; `home.ts` writes `--parallax-offset` CSS custom property via throttled scroll listener.
- Scroll-reveal: `[data-reveal]` elements start at `opacity: 0 / translateY(2rem)`; IntersectionObserver adds `.is-visible`; stagger variant uses `[data-reveal="stagger"]` with nth-child delays.
- Both features are skipped entirely when `prefers-reduced-motion: reduce` is active.

### Gallery filtering
Pure DOM — no JS state object. Filter buttons carry `data-filter="all|floors|walls|outdoor|stone"` and `aria-pressed`. Items carry `data-category` and `aria-hidden`. `gallery.ts` toggles `aria-hidden` and CSS hides `[aria-hidden="true"]` via `display: none`.

### Adding a new page
1. Create `src/pages/<name>/index.html`, `<name>.css`, `<name>.ts`.
2. Add `<name>.ts` as an esbuild entry point in `package.json` → `build:ts`.
3. Add the CSS directory to `scripts/build-css.js` → `dirs` array.
4. Add locale files `src/locales/{en,es}/<name>.json`.
5. Update `scripts/copy-assets.js` to copy the new page's HTML and CSS.

## Assets (still needed)
- `src/assets/fonts/` — WOFF2 files for Playfair Display (400, 700) and Inter (400, 500, 600).
- `src/assets/images/` — `hero.webp`, `cta-texture.webp`, `mario.webp`, `mario@2x.webp`.
- `src/assets/images/gallery/` — 12 project images: `floors-01` through `stone-02`, each with `@2x` variant.

---

# Universal Rules — Design · Code · Security

These rules apply to EVERY file in EVERY project. They are non-negotiable.

## Design
- Mobile-first: start at 320px, scale up with `min-width` only. NEVER `max-width`.
- One focal point per section. Whitespace is structure, not emptiness.
- Touch targets ≥ 44×44px. Visible `:focus-visible` outlines on all interactive elements.
- Color is never the sole indicator of state. Contrast ratio ≥ 4.5:1 (WCAG AA).
- All colors via tokens/variables. No hardcoded hex in component files.
- Semantic HTML first: `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`. No `<div>` soup.
- Every `<img>`: `alt`, `width`, `height`, `loading="lazy"`. Decorative → `alt="" role="presentation"`.
- No user-visible hardcoded strings. All text uses i18n keys or is parameterized.

## Code
- `strict: true` in TypeScript. No `any` — use `unknown` + narrowing.
- `const` by default. `let` only when reassignment is required. Never `var`.
- Functions ≤ 25 lines. Files ≤ 200 lines. One responsibility per file.
- Named exports only. No `export default`.
- Explicit return types on all exported functions.
- Comments explain WHY, never WHAT. Delete commented-out code.
- Error handling: early returns or Result pattern. No empty `catch {}`.
- Lowercase kebab-case for files and folders. BEM for CSS selectors.
- CSS logical properties: `margin-inline`, `padding-block` — not `-left`/`-right`.

## Security
- No `innerHTML` with dynamic content. Use `textContent` or DOM APIs.
- No `eval()`, `new Function()`, `document.write()`, `setTimeout(string)`.
- External links: `rel="noopener noreferrer"`.
- Validate all user input against allowlists before DOM insertion or storage.
- Self-host fonts, icons, scripts. CDN resources require `integrity` + `crossorigin`.
- No `http://` references. All assets via relative paths or HTTPS.
- CSP: `default-src 'self'`. No `unsafe-inline` for scripts. No `unsafe-eval`.
- `localStorage` keys prefixed with app namespace. No sensitive data in storage.
- Pin exact dependency versions. Run `npm audit` in CI.

## Git
- Branches: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- One branch per concern. Never mix a feature and a bug fix in the same branch.
- Commits: conventional format — `feat:`, `fix:`, `perf:`, `refactor:`, `test:`, `docs:`, `sec:`.
- Rebase feature branches onto `main` before merging. No merge commits from stale branches.
- Every PR requires passing typecheck + lint + tests before merge.
- Delete branches after merge. Tag releases with semver.