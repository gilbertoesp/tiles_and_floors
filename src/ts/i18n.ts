import { qsAll, qs } from './utils.js';

type Locale = 'en' | 'es';
type TranslationMap = { [key: string]: string | TranslationMap };

const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'es'];
const STORAGE_KEY = 'locale';
const DEFAULT_LOCALE: Locale = 'en';

// Traverse nested TranslationMap with dot-notation key
const resolveKey = (map: TranslationMap, key: string): string => {
  const parts = key.split('.');
  let node: string | TranslationMap = map;
  for (const part of parts) {
    if (typeof node !== 'object' || !(part in node)) return key;
    const next = node[part];
    if (next === undefined) return key;
    node = next;
  }
  return typeof node === 'string' ? node : key;
};

const isLocale = (value: unknown): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);

export const getLocale = (): Locale => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (isLocale(stored)) return stored;
  const browserLang = navigator.language.split('-')[0];
  return isLocale(browserLang) ? browserLang : DEFAULT_LOCALE;
};

const fetchTranslations = async (locale: Locale, page: string): Promise<TranslationMap> => {
  const [common, pageJson] = await Promise.all([
    fetch(`/locales/${locale}/common.json`).then((r) => r.json() as Promise<TranslationMap>),
    fetch(`/locales/${locale}/${page}.json`).then((r) => r.json() as Promise<TranslationMap>),
  ]);
  return { ...common, ...pageJson };
};

// Apply translations to all [data-i18n] and [data-i18n-attr] elements
const applyTranslations = (translations: TranslationMap): void => {
  qsAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset['i18n'];
    if (!key) return;
    el.textContent = resolveKey(translations, key);
  });

  // Handle attribute translations: data-i18n-attr="attr:key,attr2:key2"
  qsAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    const pairs = el.dataset['i18nAttr'];
    if (!pairs) return;
    pairs.split(',').forEach((pair) => {
      const [attr, key] = pair.trim().split(':');
      if (attr && key) {
        el.setAttribute(attr, resolveKey(translations, key));
      }
    });
  });
};

export const initI18n = async (page: string): Promise<void> => {
  const locale = getLocale();
  const translations = await fetchTranslations(locale, page);

  document.documentElement.lang = locale;
  document.documentElement.dir = 'ltr';

  applyTranslations(translations);

  document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { locale } }));
};

export const setLocale = async (locale: Locale, page: string): Promise<void> => {
  localStorage.setItem(STORAGE_KEY, locale);
  await initI18n(page);

  // Announce to screen readers
  const announcer = qs<HTMLElement>('#a11y-announcer');
  if (announcer) {
    const translations = await fetchTranslations(locale, page);
    announcer.textContent = resolveKey(translations, 'a11y.langChanged');
  }

  // Update lang-switch button pressed state
  qsAll<HTMLButtonElement>('[data-lang-switch]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset['langSwitch'] === locale));
  });
};
