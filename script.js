const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav > a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

const SUPPORTED_LANGUAGES = ['en', 'it', 'fr', 'es', 'de', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'nl', 'pl'];
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
  const response = await fetch(`/locales/${language}.json?v=3`, { cache: 'no-cache' });
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

const SEO_PAGE_PATHS = {
  en: { villa: '/en/villa-cetara/', sea: '/en/private-sea-access/', rooms: '/en/rooms-amenities/', location: '/en/getting-to-cetara/' },
  it: { villa: '/it/villa-cetara/', sea: '/it/accesso-privato-mare/', rooms: '/it/camere-servizi/', location: '/it/come-arrivare/' },
};

function updateSeoLinks(language) {
  const paths = SEO_PAGE_PATHS[language] || SEO_PAGE_PATHS.en;
  document.querySelectorAll('[data-seo-page]').forEach((link) => {
    const path = paths[link.dataset.seoPage];
    if (path) link.href = path;
  });
  if (language === 'it') {
    const title = document.querySelector('#villa-guide-title');
    if (title) title.textContent = 'Scopri Villa Venere';
    const notes = document.querySelectorAll('.guide-grid small');
    ['Villa, camere e ambienti', 'Terrazza, banchina e mare', 'Capienza e dotazioni', 'Traghetti, autobus e parcheggio'].forEach((text, index) => {
      if (notes[index]) notes[index].textContent = text;
    });
  }
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
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dataset.i18nReady = 'true';
  document.title = translate('meta.title') || fallback.meta.title;
  document.querySelectorAll('a[data-lang], .language-flags a').forEach((link) => {
    const linkLanguage = link.dataset.lang || new URL(link.href).pathname.split('/').filter(Boolean)[0];
    if (linkLanguage === language) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  updateBookingLinks(language);
  updateSeoLinks(language);
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
    updateSeoLinks(DEFAULT_LANGUAGE);
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
const contactWidget = document.querySelector('#contact-widget');
const mascotIntro = document.querySelector('.mascot-intro');
const mascotIntroImage = mascotIntro?.querySelector('img');
const mascotNudge = document.querySelector('.mascot-nudge');
const mascotPoses = [
  ['/assets/mascot/venere-prototype.webp', 6500],
  ['/assets/mascot/venere-wave.webp', 1800],
  ['/assets/mascot/venere-prototype.webp', 5200],
  ['/assets/mascot/venere-offer.webp', 2400],
  ['/assets/mascot/venere-waiting.webp', 3000],
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
    }, 380);
  }, delay);
}

mascotPoses.forEach(([src]) => { const image = new Image(); image.src = src; });
const introFrames = [
  ['/assets/mascot/intro/venere-intro-01.webp?v=clear-8', 520],
  ['/assets/mascot/intro/venere-intro-04.webp?v=clear-8', 430],
  ['/assets/mascot/intro/venere-intro-07.webp?v=clear-8', 480],
  ['/assets/mascot/intro/venere-intro-10.webp?v=clear-8', 500],
  ['/assets/mascot/intro/venere-intro-13.webp?v=clear-8', 520],
  ['/assets/mascot/intro/venere-intro-16.webp?v=clear-8', 480],
  ['/assets/mascot/intro/venere-intro-19.webp?v=clear-8', 480],
  ['/assets/mascot/intro/venere-intro-22.webp?v=clear-8', 850],
];
introFrames.forEach(([src]) => { const image = new Image(); image.src = src; });

function finishMascotIntro() {
  mascotIntro?.classList.add('settling');
  contactWidget?.classList.remove('intro-active');
  window.setTimeout(() => mascotIntro?.classList.remove('visible', 'settling'), 480);
  window.setTimeout(() => mascotNudge?.classList.add('visible'), 350);
  window.setTimeout(() => mascotNudge?.classList.remove('visible'), 7350);
  showNextMascotPose();
}

function runMascotIntro() {
  if (!mascotIntroImage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showNextMascotPose();
    return;
  }
  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem('villa-venere-intro-seen') === '1';
    sessionStorage.setItem('villa-venere-intro-seen', '1');
  } catch {}
  if (alreadySeen) {
    showNextMascotPose();
    return;
  }
  window.setTimeout(() => {
    contactWidget?.classList.add('intro-active');
    mascotIntro?.classList.add('appearing');
    mascotIntro?.classList.add('visible');
    window.setTimeout(() => mascotIntro?.classList.remove('appearing'), 760);
    let frame = 0;
    const advance = () => {
      frame += 1;
      if (frame >= introFrames.length) {
        window.setTimeout(finishMascotIntro, 700);
        return;
      }
      mascotIntroImage.src = introFrames[frame][0];
      window.setTimeout(advance, introFrames[frame][1]);
    };
    window.setTimeout(advance, 680);
  }, 1300);
}

runMascotIntro();

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

function loadThirdPartyWidgets() {
  if (document.querySelector('script[data-villa-widget]')) return;
  const scripts = [
    ['https://widgetreview.villavenerecetara.it/widget.js', 'reviews'],
    ['https://apps.elfsight.com/p/platform.js', 'social'],
  ];
  scripts.forEach(([src, name]) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset.villaWidget = name;
    document.body.appendChild(script);
  });
}

const reviewsSection = document.querySelector('#reviews');
if ('IntersectionObserver' in window && reviewsSection) {
  const widgetObserver = new IntersectionObserver((entries, observer) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      loadThirdPartyWidgets();
      observer.disconnect();
    }
  }, { rootMargin: '600px 0px' });
  widgetObserver.observe(reviewsSection);
  window.setTimeout(loadThirdPartyWidgets, 12000);
} else {
  window.setTimeout(loadThirdPartyWidgets, 3000);
}
