import { qs, qsAll } from '../../ts/utils.js';
import { setLocale, getLocale } from '../../ts/i18n.js';

const initScrollHeader = (): void => {
  const header = qs<HTMLElement>('.site-header');
  if (!header) return;

  const onScroll = (): void => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

const initMobileNav = (): void => {
  const toggle = qs<HTMLButtonElement>('.nav-toggle');
  const mobileNav = qs<HTMLElement>('.mobile-nav');
  const backdrop = qs<HTMLElement>('.nav-backdrop');
  const closeBtn = qs<HTMLButtonElement>('.mobile-nav__close');

  if (!toggle || !mobileNav || !backdrop) return;

  const open = (): void => {
    mobileNav.classList.add('is-open');
    backdrop.classList.add('is-visible');
    toggle.setAttribute('aria-expanded', 'true');
    closeBtn?.focus();
  };

  const close = (): void => {
    mobileNav.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  };

  toggle.addEventListener('click', open);
  backdrop.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) close();
  });

  // Close when a nav link is clicked
  qsAll<HTMLAnchorElement>('.mobile-nav__list a').forEach((a) => {
    a.addEventListener('click', close);
  });
};

const initLangSwitch = (): void => {
  const page = document.documentElement.dataset['page'] ?? 'home';
  const currentLocale = getLocale();

  qsAll<HTMLButtonElement>('[data-lang-switch]').forEach((btn) => {
    const lang = btn.dataset['langSwitch'];
    btn.setAttribute('aria-pressed', String(lang === currentLocale));

    btn.addEventListener('click', () => {
      if (lang === 'en' || lang === 'es') {
        void setLocale(lang, page);
      }
    });
  });
};

export const initHeader = (): void => {
  initScrollHeader();
  initMobileNav();
  initLangSwitch();
};
