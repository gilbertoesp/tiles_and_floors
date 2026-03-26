import { qs, qsAll } from '../../ts/utils.js';
import { initScrollReveal } from '../../ts/scroll-reveal.js';
import { initI18n } from '../../ts/i18n.js';
import { initTheme } from '../../ts/theme.js';
import { initHeader } from '../../components/header/header.js';

const initGalleryFilter = (): void => {
  const filterBtns = qsAll<HTMLButtonElement>('[data-filter]');
  const items = qsAll<HTMLElement>('.gallery__item');

  const applyFilter = (category: string): void => {
    items.forEach((item) => {
      const match = category === 'all' || item.dataset['category'] === category;
      item.setAttribute('aria-hidden', String(!match));
    });

    filterBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset['filter'] === category));
    });
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset['filter'] ?? 'all');
    });
  });

  applyFilter('all');
};

const setFooterYear = (): void => {
  const el = qs<HTMLSpanElement>('#footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
};

const init = (): void => {
  initTheme();
  void initI18n('gallery');
  initScrollReveal();
  initHeader();
  initGalleryFilter();
  setFooterYear();
};

document.addEventListener('DOMContentLoaded', init);
