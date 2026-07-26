const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav > a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));

const SUPPORTED_LANGUAGES = ['en', 'it', 'fr', 'es', 'de', 'pt'];
const DEFAULT_LANGUAGE = 'en';

function normalizeLanguage(value) {
  const language = String(value || '').toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

function detectLanguage() {
  const queryLanguage = new URLSearchParams(window.location.search).get('lang');
  if (queryLanguage) {
    const normalized = normalizeLanguage(queryLanguage);
    if (SUPPORTED_LANGUAGES.includes(String(queryLanguage).toLowerCase().split(/[-_]/)[0])) {
      try { localStorage.setItem('villaVenereLanguage', normalized); } catch (_) {}
    }
    return normalized;
  }

  try {
    const savedLanguage = localStorage.getItem('villaVenereLanguage');
    if (savedLanguage) return normalizeLanguage(savedLanguage);
  } catch (_) {}

  const deviceLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const supportedDeviceLanguage = deviceLanguages
    .map((language) => String(language || '').toLowerCase().split(/[-_]/)[0])
    .find((language) => SUPPORTED_LANGUAGES.includes(language));
  return supportedDeviceLanguage || DEFAULT_LANGUAGE;
}

function getTranslation(dictionary, key) {
  return key.split('.').reduce((value, part) => value?.[part], dictionary);
}

async function loadDictionary(language) {
  const response = await fetch(`locales/${language}.json?v=1`, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Unable to load language: ${language}`);
  return response.json();
}

function updateBookingLinks(language) {
  document.querySelectorAll('[data-booking-link]').forEach((link) => {
    const url = new URL(link.href);
    url.searchParams.set('lang', language);
    link.href = url.toString();
  });
}

function applyTranslations(language, dictionary, fallback) {
  const translate = (key) => getTranslation(dictionary, key) ?? getTranslation(fallback, key);
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = translate(element.dataset.i18n);
    if (typeof value === 'string') element.textContent = value;
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const value = translate(element.dataset.i18nAriaLabel);
    if (typeof value === 'string') element.setAttribute('aria-label', value);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const value = translate(element.dataset.i18nAlt);
    if (typeof value === 'string') element.setAttribute('alt', value);
  });

  document.documentElement.lang = language;
  document.documentElement.dataset.i18nReady = 'true';
  document.title = translate('meta.title') || fallback.meta.title;
  document.querySelectorAll('a[href*="?lang="]').forEach((link) => {
    const linkLanguage = new URL(link.href).searchParams.get('lang');
    if (linkLanguage === language) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  updateBookingLinks(language);
  window.villaVenereLanguage = language;
}

async function initializeI18n() {
  const language = detectLanguage();
  try {
    const fallback = await loadDictionary(DEFAULT_LANGUAGE);
    const dictionary = language === DEFAULT_LANGUAGE ? fallback : await loadDictionary(language);
    applyTranslations(language, dictionary, fallback);
  } catch (error) {
    console.warn('Villa Venere translations unavailable; using embedded English content.', error);
    document.documentElement.lang = DEFAULT_LANGUAGE;
    document.documentElement.dataset.i18nReady = 'true';
    updateBookingLinks(DEFAULT_LANGUAGE);
    window.villaVenereLanguage = DEFAULT_LANGUAGE;
  }
}

window.villaI18nReady = initializeI18n();

const bookingForm = document.querySelector('#booking-form');
bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(bookingForm);
  const params = new URLSearchParams({
    lang: window.villaVenereLanguage || DEFAULT_LANGUAGE,
    codice: '679766',
    checkin: data.get('checkin'),
    checkout: data.get('checkout'),
    pax: data.get('pax'),
  });
  window.open(`https://book.octorate.com/octobook/site/reservation/index.xhtml?${params}`, '_blank', 'noopener');
});

const contactPanel = document.querySelector('#contact-panel');
const contactLauncher = document.querySelector('.contact-launcher');
const contactClose = document.querySelector('.contact-close');

function setContactOpen(open) {
  contactPanel?.classList.toggle('open', open);
  contactPanel?.setAttribute('aria-hidden', String(!open));
  contactLauncher?.setAttribute('aria-expanded', String(open));
}

contactLauncher?.addEventListener('click', () => setContactOpen(!contactPanel.classList.contains('open')));
contactClose?.addEventListener('click', () => setContactOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setContactOpen(false);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('#contact-widget')) setContactOpen(false);
});
