import { qsAll } from './utils.js';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

const getSystemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const getTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : getSystemTheme();
};

const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset['theme'] = theme;
  qsAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
    // Update icon labels
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    btn.setAttribute('aria-label', label);
  });
};

export const initTheme = (): void => {
  const theme = getTheme();
  applyTheme(theme);

  qsAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = getTheme();
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });
};
