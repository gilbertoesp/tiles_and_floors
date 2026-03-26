import { qs } from '../../ts/utils.js';
import { initScrollReveal } from '../../ts/scroll-reveal.js';
import { initI18n } from '../../ts/i18n.js';
import { initTheme } from '../../ts/theme.js';
import { initHeader } from '../../components/header/header.js';

const initContactForm = (): void => {
  const form = qs<HTMLFormElement>('.contact__form');
  const statusEl = qs<HTMLElement>('.form-status');
  const submitBtn = qs<HTMLButtonElement>('.contact__form [type="submit"]');

  if (!form || !statusEl || !submitBtn) return;

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Show sending state
    const originalText = submitBtn.textContent ?? '';
    submitBtn.disabled = true;
    submitBtn.setAttribute('data-i18n', 'about.form.sending');

    // Simulate form submission (replace with real endpoint)
    setTimeout(() => {
      statusEl.textContent = statusEl.dataset['successMsg'] ?? 'Thank you! We will be in touch soon.';
      statusEl.className = 'form-status is-success';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1200);
  });

  // Cache success/error messages from i18n after ready
  document.addEventListener('i18n:ready', () => {
    const page = document.documentElement.dataset['page'] ?? 'about';
    void fetch(`/locales/${document.documentElement.lang}/${page}.json`)
      .then((r) => r.json())
      .then((t: { about?: { form?: { success?: string; error?: string } } }) => {
        if (statusEl && t.about?.form?.success) {
          statusEl.dataset['successMsg'] = t.about.form.success;
          statusEl.dataset['errorMsg'] = t.about.form.error ?? '';
        }
      });
  });
};

const setFooterYear = (): void => {
  const el = qs<HTMLSpanElement>('#footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
};

const init = (): void => {
  initTheme();
  void initI18n('about');
  initScrollReveal();
  initHeader();
  initContactForm();
  setFooterYear();
};

document.addEventListener('DOMContentLoaded', init);
