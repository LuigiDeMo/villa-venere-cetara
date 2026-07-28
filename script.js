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

  const pathLanguage = window.location.pathname.split('/').filter(Boolean)[0];
  if (SUPPORTED_LANGUAGES.includes(pathLanguage)) return pathLanguage;

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
  const response = await fetch(`/locales/${language}.json?v=2`, { cache: 'no-cache' });
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
  document.querySelectorAll('a[data-lang], .language-flags a').forEach((link) => {
    const linkLanguage = link.dataset.lang || new URL(link.href).pathname.split('/').filter(Boolean)[0];
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
const checkinInput = bookingForm?.querySelector('input[name="checkin"]');
const checkoutInput = bookingForm?.querySelector('input[name="checkout"]');

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nextDate(value) {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  date.setDate(date.getDate() + 1);
  return formatLocalDate(date);
}

if (checkinInput && checkoutInput) {
  checkinInput.min = formatLocalDate(new Date());
  checkoutInput.min = nextDate(checkinInput.value);
  checkinInput.addEventListener('change', () => {
    checkoutInput.min = nextDate(checkinInput.value);
    if (checkoutInput.value && checkoutInput.value < checkoutInput.min) checkoutInput.value = '';
  });
}

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
const mascotButton = document.querySelector('.mascot-button');
const mascotPose = mascotButton?.querySelector('.mascot-pose');
const mascotPoses = [
  ['assets/mascot/venere-prototype.webp', 6500],
  ['assets/mascot/venere-wave.webp', 1800],
  ['assets/mascot/venere-prototype.webp', 5200],
  ['assets/mascot/venere-offer.webp', 2400],
  ['assets/mascot/venere-waiting.webp', 3000],
];
let mascotPoseIndex = 0;
let mascotTimer;

function showNextMascotPose() {
  if (!mascotPose || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const delay = mascotPoses[mascotPoseIndex][1];
  mascotTimer = window.setTimeout(() => {
    mascotPoseIndex = (mascotPoseIndex + 1) % mascotPoses.length;
    mascotPose.classList.add('is-changing');
    window.setTimeout(() => {
      mascotPose.src = mascotPoses[mascotPoseIndex][0];
      mascotPose.classList.remove('is-changing');
      showNextMascotPose();
    }, 240);
  }, delay);
}

mascotPoses.forEach(([src]) => { const image = new Image(); image.src = src; });
showNextMascotPose();

function setContactOpen(open) {
  contactPanel?.classList.toggle('open', open);
  contactPanel?.setAttribute('aria-hidden', String(!open));
  contactLauncher?.setAttribute('aria-expanded', String(open));
  mascotButton?.setAttribute('aria-expanded', String(open));
  if (open) {
    window.clearTimeout(mascotTimer);
    mascotTimer = undefined;
  }
  else if (!mascotTimer) showNextMascotPose();
}

contactLauncher?.addEventListener('click', () => setContactOpen(!contactPanel.classList.contains('open')));
mascotButton?.addEventListener('click', () => setContactOpen(!contactPanel.classList.contains('open')));
document.querySelectorAll('[data-contact-open]').forEach((button) => button.addEventListener('click', () => setContactOpen(true)));
contactClose?.addEventListener('click', () => setContactOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setContactOpen(false);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('#contact-widget') && !event.target.closest('[data-contact-open]')) setContactOpen(false);
});
