import { qsAll } from './utils.js';

export const initScrollReveal = (): void => {
  // Skip animation entirely when user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Fire once only — avoids toggling on scroll back up
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  qsAll<Element>('[data-reveal]').forEach((el) => observer.observe(el));
};
