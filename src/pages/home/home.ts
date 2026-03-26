import { throttle, qs } from '../../ts/utils.js';
import { initScrollReveal } from '../../ts/scroll-reveal.js';
import { initI18n } from '../../ts/i18n.js';
import { initTheme } from '../../ts/theme.js';
import { initHeader } from '../../components/header/header.js';

// JS parallax fallback for mobile where background-attachment:fixed is broken
const initParallaxFallback = (): void => {
  if (!window.matchMedia('(hover: none)').matches) return;

  const hero = qs<HTMLElement>('.hero');
  if (!hero) return;

  const onScroll = throttle(() => {
    const offset = window.scrollY * 0.4;
    hero.style.setProperty('--parallax-offset', `${offset}px`);
  }, 16);

  window.addEventListener('scroll', onScroll, { passive: true });
};

const setFooterYear = (): void => {
  const el = qs<HTMLSpanElement>('#footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
};

const init = (): void => {
  initTheme();
  void initI18n('home');
  initScrollReveal();
  initParallaxFallback();
  initHeader();
  setFooterYear();
};

document.addEventListener('DOMContentLoaded', init);
