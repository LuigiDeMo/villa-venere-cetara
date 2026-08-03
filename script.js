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
  const response = await fetch(`/locales/${language}.json?v=9`, { cache: 'no-cache' });
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
    const notes = document.querySelectorAll('.guide-grid small');
    ['Villa, camere e ambienti', 'Terrazza, banchina e mare', 'Capienza e dotazioni', 'Traghetti, autobus e parcheggio'].forEach((text, index) => {
      if (notes[index]) notes[index].textContent = text;
    });
  }
}

function applyTranslations(language, dictionary, fallback) {
  const translate = (key) => getTranslation(dictionary, key) ?? getTranslation(fallback, key);
  window.villaVenereTranslate = translate;
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
const mascotPoseBuffer = mascotButton?.querySelector('.mascot-pose-buffer');
let mascotVisibleLayer = mascotPose;
let mascotHiddenLayer = mascotPoseBuffer;
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
let mascotAnimationTimer;
let mascotAnimationActive = false;
let mascotIntroPending = true;
const mascotAnimationLoads = new Map();
const mascotAnimationBase = '/assets/mascot/animations-v2';
const seasonalMascotBase = '/assets/mascot/seasonal';
const mascotAnimations = {
  contact: { keyframes: [[1, 540], [4, 500], [7, 560], [10, 950]] },
  'direct-offer': { keyframes: [[1, 560], [4, 520], [7, 600], [10, 1550]] },
  'thank-you': { keyframes: [[1, 500], [4, 480], [7, 540], [10, 900]] },
  'sea-breeze': { keyframes: [[1, 540], [4, 500], [7, 540], [10, 680]], pingPong: true },
  'lantern-evening': { keyframes: [[1, 580], [4, 540], [7, 600], [10, 1450]], pingPong: true },
  directions: { keyframes: [[1, 560], [4, 520], [7, 600], [10, 1350]] },
  'sea-access': { keyframes: [[1, 560], [4, 520], [7, 600], [10, 1350]] },
  'return-to-shell': { keyframes: [[1, 580], [4, 540], [7, 600], [10, 1150]], pingPong: true },
  'season-christmas': { folder: 'christmas', base: seasonalMascotBase, frameCount: 4, version: 'seasonal-1', keyframes: [[1, 620], [2, 560], [3, 680], [4, 1500]] },
  'season-valentines': { folder: 'valentines', base: seasonalMascotBase, frameCount: 4, version: 'seasonal-1', keyframes: [[1, 620], [2, 560], [3, 680], [4, 1450]] },
  'season-easter': { folder: 'easter', base: seasonalMascotBase, frameCount: 4, version: 'seasonal-1', keyframes: [[1, 620], [2, 560], [3, 680], [4, 1450]] },
  'season-san-pietro': { folder: 'san-pietro', base: seasonalMascotBase, frameCount: 4, version: 'seasonal-1', keyframes: [[1, 640], [2, 580], [3, 720], [4, 1550]] },
  'season-summer': { folder: 'summer', base: seasonalMascotBase, frameCount: 4, version: 'seasonal-1', keyframes: [[1, 620], [2, 560], [3, 680], [4, 1450]] },
  'season-halloween': { folder: 'halloween', base: seasonalMascotBase, frameCount: 4, version: 'seasonal-1', keyframes: [[1, 640], [2, 580], [3, 700], [4, 1500]] },
};

function mascotAnimationFrames(name) {
  const config = mascotAnimations[name] || {};
  const slug = config.folder || name;
  const base = config.base || mascotAnimationBase;
  const count = config.frameCount || 10;
  const version = config.version || 'key-clean-1';
  return Array.from({ length: count }, (_, index) => base + '/' + slug + '/venere-' + slug + '-' + String(index + 1).padStart(2, '0') + '.webp?v=' + version);
}

function setMascotFrame(src, duration = 320) {
  if (!mascotVisibleLayer || !mascotHiddenLayer) {
    if (mascotPose) mascotPose.src = src;
    return;
  }
  const incoming = mascotHiddenLayer;
  const outgoing = mascotVisibleLayer;
  incoming.src = src;
  incoming.style.transitionDuration = duration + 'ms';
  outgoing.style.transitionDuration = duration + 'ms';
  incoming.style.opacity = '1';
  outgoing.style.opacity = '0';
  mascotVisibleLayer = incoming;
  mascotHiddenLayer = outgoing;
}

function setMascotSequenceFrame(src) {
  if (!mascotPose) return;
  mascotPose.src = src;
  mascotPose.style.setProperty('transition', 'none', 'important');
  mascotPose.style.opacity = '1';
  if (mascotPoseBuffer) {
    mascotPoseBuffer.src = src;
    mascotPoseBuffer.style.setProperty('transition', 'none', 'important');
    mascotPoseBuffer.style.opacity = '0';
  }
  mascotVisibleLayer = mascotPose;
  mascotHiddenLayer = mascotPoseBuffer;
}

function preloadMascotAnimation(name) {
  if (mascotAnimationLoads.has(name)) return mascotAnimationLoads.get(name);
  const load = Promise.all(mascotAnimationFrames(name).map((src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = image.onerror = resolve;
    image.src = src;
  })));
  mascotAnimationLoads.set(name, load);
  return load;
}

function wasMascotMomentSeen(key) {
  if (!key) return false;
  try {
    if (sessionStorage.getItem(key) === '1') return true;
    sessionStorage.setItem(key, '1');
  } catch {}
  return false;
}

async function playMascotAnimation(name, { onceKey, force = false } = {}) {
  const config = mascotAnimations[name];
  if (!config || !mascotPose || mascotAnimationActive || (!force && (mascotIntroPending || contactPanel?.classList.contains('open'))) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (wasMascotMomentSeen(onceKey)) return false;
  await preloadMascotAnimation(name);
  if (mascotAnimationActive || (!force && (mascotIntroPending || contactPanel?.classList.contains('open')))) return false;

  window.clearTimeout(mascotTimer);
  window.clearTimeout(mascotAnimationTimer);
  mascotTimer = undefined;
  mascotAnimationActive = true;
  mascotButton?.classList.add('is-sequencing');
  const frames = mascotAnimationFrames(name);
  const forward = config.keyframes.map(([number, duration]) => ({ src: frames[number - 1], duration }));
  const sequence = config.pingPong
    ? [...forward, ...forward.slice(0, -1).reverse()]
    : forward;

  return new Promise((resolve) => {
    let frame = 0;
    const advance = () => {
      const moment = sequence[frame];
      setMascotSequenceFrame(moment.src);
      frame += 1;
      if (frame < sequence.length) {
        mascotAnimationTimer = window.setTimeout(advance, moment.duration);
        return;
      }
      mascotAnimationTimer = window.setTimeout(() => {
        setMascotSequenceFrame('/assets/mascot/venere-prototype.webp');
        mascotButton?.classList.remove('is-sequencing');
        mascotPose?.style.removeProperty('transition');
        mascotPoseBuffer?.style.removeProperty('transition');
        mascotAnimationActive = false;
        if (!contactPanel?.classList.contains('open')) showNextMascotPose();
        resolve(true);
      }, moment.duration);
    };
    advance();
  });
}

function showNextMascotPose() {
  if (!mascotPose || mascotAnimationActive || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const delay = mascotPoses[mascotPoseIndex][1];
  mascotTimer = window.setTimeout(() => {
    mascotPoseIndex = (mascotPoseIndex + 1) % mascotPoses.length;
    setMascotFrame(mascotPoses[mascotPoseIndex][0], 420);
    showNextMascotPose();
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

const seasonalMascotMessages = {
  en: {
    christmas: "Season's greetings from Villa Venere.",
    valentines: 'A special stay for two on the Amalfi Coast.',
    easter: 'Happy Easter and welcome, spring.',
    'san-pietro': 'Cetara celebrates San Pietro. Welcome!',
    summer: 'Summer on the Amalfi Coast begins here.',
    halloween: 'A magical evening awaits you in Cetara.',
  },
  it: {
    christmas: 'Buone feste da Villa Venere.',
    valentines: 'Un soggiorno speciale per due, sulla Costiera Amalfitana.',
    easter: 'Buona Pasqua e benvenuta primavera.',
    'san-pietro': 'Cetara festeggia San Pietro. Benvenuti!',
    summer: "L'estate in Costiera Amalfitana comincia qui.",
    halloween: 'Una serata magica vi aspetta a Cetara.',
  },
  fr: {
    christmas: 'Joyeuses fêtes de la part de Villa Venere.',
    valentines: 'Un séjour spécial à deux sur la Côte Amalfitaine.',
    easter: 'Joyeuses Pâques et bienvenue au printemps.',
    'san-pietro': 'Cetara fête San Pietro. Bienvenue !',
    summer: "L'été sur la Côte Amalfitaine commence ici.",
    halloween: 'Une soirée magique vous attend à Cetara.',
  },
  es: {
    christmas: 'Felices fiestas de parte de Villa Venere.',
    valentines: 'Una estancia especial para dos en la Costa Amalfitana.',
    easter: 'Feliz Pascua y bienvenida, primavera.',
    'san-pietro': 'Cetara celebra San Pietro. ¡Bienvenidos!',
    summer: 'El verano en la Costa Amalfitana comienza aquí.',
    halloween: 'Una noche mágica os espera en Cetara.',
  },
  de: {
    christmas: 'Frohe Festtage wünscht Villa Venere.',
    valentines: 'Ein besonderer Aufenthalt zu zweit an der Amalfiküste.',
    easter: 'Frohe Ostern und willkommen, Frühling.',
    'san-pietro': 'Cetara feiert San Pietro. Willkommen!',
    summer: 'Der Sommer an der Amalfiküste beginnt hier.',
    halloween: 'Ein magischer Abend erwartet Sie in Cetara.',
  },
  pt: {
    christmas: 'Boas festas da Villa Venere.',
    valentines: 'Uma estadia especial a dois na Costa Amalfitana.',
    easter: 'Feliz Páscoa e bem-vinda, primavera.',
    'san-pietro': 'Cetara celebra San Pietro. Bem-vindos!',
    summer: 'O verão na Costa Amalfitana começa aqui.',
    halloween: 'Uma noite mágica espera por si em Cetara.',
  },
  ru: {
    christmas: 'С праздниками от Villa Venere.',
    valentines: 'Особенное путешествие для двоих на Амальфитанском побережье.',
    easter: 'С Пасхой и добро пожаловать, весна.',
    'san-pietro': 'Четара празднует день Сан-Пьетро. Добро пожаловать!',
    summer: 'Лето на Амальфитанском побережье начинается здесь.',
    halloween: 'Волшебный вечер ждёт вас в Четаре.',
  },
  zh: {
    christmas: 'Villa Venere 祝您节日快乐。',
    valentines: '在阿马尔菲海岸享受特别的双人假期。',
    easter: '复活节快乐，欢迎春天。',
    'san-pietro': '切塔拉庆祝圣彼得节，欢迎您！',
    summer: '阿马尔菲海岸的夏天从这里开始。',
    halloween: '切塔拉的魔法之夜正等着您。',
  },
  ja: {
    christmas: 'Villa Venereより、素敵なホリデーを。',
    valentines: 'アマルフィ海岸で、ふたりだけの特別な滞在を。',
    easter: 'ハッピーイースター。春へようこそ。',
    'san-pietro': 'チェターラはサン・ピエトロ祭を祝います。ようこそ！',
    summer: 'アマルフィ海岸の夏はここから始まります。',
    halloween: 'チェターラで魔法のような夜を。',
  },
  ko: {
    christmas: 'Villa Venere가 행복한 연말을 기원합니다.',
    valentines: '아말피 해안에서 둘만의 특별한 시간을 보내세요.',
    easter: '행복한 부활절, 봄을 환영합니다.',
    'san-pietro': '체타라의 산 피에트로 축제에 오신 것을 환영합니다!',
    summer: '아말피 해안의 여름이 여기서 시작됩니다.',
    halloween: '체타라에서 마법 같은 저녁이 기다립니다.',
  },
  ar: {
    christmas: 'أطيب التمنيات من فيلا فينيري.',
    valentines: 'إقامة مميزة لشخصين على ساحل أمالفي.',
    easter: 'فصح سعيد، وأهلًا بالربيع.',
    'san-pietro': 'تحتفل شيتارا بعيد سان بيترو. أهلًا بكم!',
    summer: 'يبدأ صيف ساحل أمالفي من هنا.',
    halloween: 'أمسية ساحرة بانتظاركم في شيتارا.',
  },
  nl: {
    christmas: 'Fijne feestdagen van Villa Venere.',
    valentines: 'Een bijzonder verblijf voor twee aan de Amalfikust.',
    easter: 'Vrolijk Pasen en welkom, lente.',
    'san-pietro': 'Cetara viert San Pietro. Welkom!',
    summer: 'De zomer aan de Amalfikust begint hier.',
    halloween: 'Een magische avond wacht op u in Cetara.',
  },
  pl: {
    christmas: 'Wesołych świąt życzy Villa Venere.',
    valentines: 'Wyjątkowy pobyt we dwoje na Wybrzeżu Amalfitańskim.',
    easter: 'Wesołych Świąt Wielkanocnych i witaj, wiosno.',
    'san-pietro': 'Cetara świętuje San Pietro. Witamy!',
    summer: 'Lato na Wybrzeżu Amalfitańskim zaczyna się tutaj.',
    halloween: 'Magiczny wieczór czeka na Ciebie w Cetarze.',
  },
};

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const seasonalMascotEvents = [
  { id: 'christmas', animation: 'season-christmas', matches: (date, md) => md >= 1215 || md <= 106 },
  { id: 'valentines', animation: 'season-valentines', matches: (_date, md) => md >= 207 && md <= 214 },
  {
    id: 'easter',
    animation: 'season-easter',
    matches: (date) => {
      const easter = easterSunday(date.getFullYear());
      const days = Math.round((date - easter) / 86400000);
      return days >= -7 && days <= 7;
    },
  },
  { id: 'san-pietro', animation: 'season-san-pietro', matches: (_date, md) => md >= 624 && md <= 702 },
  { id: 'summer', animation: 'season-summer', matches: (_date, md) => md >= 601 && md <= 615 },
  { id: 'halloween', animation: 'season-halloween', matches: (_date, md) => md >= 1025 && md <= 1101 },
];

function resolveSeasonalMascotEvent(date = new Date()) {
  const requested = new URLSearchParams(window.location.search).get('season');
  if (requested === 'none') return null;
  if (requested) return seasonalMascotEvents.find((event) => event.id === requested) || null;
  const monthDay = (date.getMonth() + 1) * 100 + date.getDate();
  return seasonalMascotEvents.find((event) => event.matches(date, monthDay)) || null;
}

const activeSeasonalMascotEvent = resolveSeasonalMascotEvent();
const seasonalMascotForced = Boolean(new URLSearchParams(window.location.search).get('season'));

function seasonalMascotMessage(event) {
  const language = window.villaVenereLanguage || document.documentElement.lang || DEFAULT_LANGUAGE;
  const dictionary = seasonalMascotMessages[language] || seasonalMascotMessages.en;
  return dictionary[event.id] || seasonalMascotMessages.en[event.id];
}

async function playSeasonalMascot(event, { force = false } = {}) {
  if (!event || !mascotNudge) return false;
  await window.villaI18nReady;
  const defaultText = mascotNudge.textContent;
  const year = new Date().getFullYear();
  const play = playMascotAnimation(event.animation, {
    onceKey: force ? undefined : 'venere-season-' + event.id + '-' + year + '-seen',
    force,
  });
  const messageTimer = window.setTimeout(() => {
    mascotSeasonalSpeaking = true;
    mascotNudge.textContent = seasonalMascotMessage(event);
    mascotNudge.classList.add('visible', 'seasonal');
  }, 350);
  const played = await play;
  if (!played) {
    window.clearTimeout(messageTimer);
    mascotSeasonalSpeaking = false;
    return false;
  }
  window.setTimeout(() => {
    mascotNudge.classList.remove('visible', 'seasonal');
    mascotNudge.textContent = defaultText;
    mascotSeasonalSpeaking = false;
    scheduleMascotContextEvaluation(260);
  }, 6800);
  return true;
}

if (activeSeasonalMascotEvent) preloadMascotAnimation(activeSeasonalMascotEvent.animation);
function finishMascotIntro() {
  mascotIntroPending = false;
  mascotIntro?.classList.add('settling');
  contactWidget?.classList.remove('intro-active');
  window.setTimeout(() => mascotIntro?.classList.remove('visible', 'settling'), 480);
  showNextMascotPose();
}

function runMascotIntro() {
  if (!mascotIntroImage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mascotIntroPending = false;
    showNextMascotPose();
    return;
  }
  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem('villa-venere-intro-seen') === '1';
    sessionStorage.setItem('villa-venere-intro-seen', '1');
  } catch {}
  if (alreadySeen) {
    mascotIntroPending = false;
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

function observeMascotMoment(selector, animation, onceKey, delay = 900) {
  const targets = [...document.querySelectorAll(selector)];
  if (!targets.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    preloadMascotAnimation(animation);
    window.setTimeout(() => playMascotAnimation(animation, { onceKey }), delay);
    observer.disconnect();
  }, { threshold: .28 });
  targets.forEach((target) => observer.observe(target));
}

const mascotContextSeen = new Set();
let mascotContextSections = [];
let mascotContextCandidate = null;
let mascotContextCandidateSince = 0;
let mascotContextCandidateTimer;
let mascotContextRaf;
let mascotContextSpeakingKey = null;
let mascotContextPending = null;
let mascotContextHideTimer;
let mascotContextInstalled = false;
let mascotSeasonalSpeaking = false;
const MASCOT_CONTEXT_STABILITY = window.matchMedia('(max-width: 560px)').matches ? 520 : 680;
const MASCOT_CONTEXT_DISPLAY = 6200;

function mascotContextText(key) {
  return window.villaVenereTranslate?.('mascotGuide.' + key) || {
    hero: 'Found Villa Venere on Booking or Airbnb? Before booking, show the rate to Martina.',
    about: 'Welcome to Villa Venere, a private home by the sea in the heart of Cetara.',
    rooms: 'Travelling with family or friends? Martina will help you arrange the spaces for your group.',
    gallery: 'Take your time exploring the villa. If you want to know what the photos do not show, ask Martina.',
    explore: 'Terrace, rooms and private sea access: discover every corner of Villa Venere.',
    services: 'Questions about the hot tub or private sea access? Martina is here to help.',
    host: 'Martina really answers every message and will assist you until your arrival.',
    reviews: 'Guests often mention Martina\'s warm welcome. Discover what they say about their stay.',
    final: 'Already have your dates and guest count? Write to Martina for the best available direct proposal.',
  }[key] || '';
}

function dominantMascotContext() {
  const viewportHeight = Math.max(window.innerHeight, 1);
  const viewportTop = Math.min(110, viewportHeight * .16);
  const focusY = viewportTop + (viewportHeight - viewportTop) * .43;
  const candidates = mascotContextSections.map((context) => {
    const rect = context.target.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, viewportTop);
    const visibleBottom = Math.min(rect.bottom, viewportHeight);
    const visiblePixels = Math.max(0, visibleBottom - visibleTop);
    if (visiblePixels < 36) return null;
    const crossesFocus = rect.top <= focusY && rect.bottom >= focusY;
    const center = (visibleTop + visibleBottom) / 2;
    const centerDistance = Math.abs(center - focusY) / viewportHeight;
    const viewportShare = visiblePixels / Math.max(viewportHeight - viewportTop, 1);
    const score = (crossesFocus ? 10 : 0) + viewportShare * 2 - centerDistance;
    return { ...context, score, crossesFocus };
  }).filter(Boolean);
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

function hideMascotContextMessage() {
  window.clearTimeout(mascotContextHideTimer);
  mascotNudge?.classList.remove('visible', 'contextual');
  if (mascotNudge) mascotNudge.textContent = window.villaVenereTranslate?.('contact.priceNudge') || 'Found a better price? Martina will reply personally.';
  mascotContextSpeakingKey = null;
  const latest = dominantMascotContext();
  mascotContextPending = latest && !mascotContextSeen.has(latest.key) ? latest : null;
  scheduleMascotContextEvaluation(260);
}

function speakMascotContext(context) {
  if (!context || mascotContextSeen.has(context.key) || mascotContextSpeakingKey || mascotSeasonalSpeaking) return false;
  if (mascotIntroPending || contactPanel?.classList.contains('open')) return false;
  const latest = dominantMascotContext();
  if (!latest || latest.key !== context.key) return false;

  mascotContextSeen.add(context.key);
  mascotContextSpeakingKey = context.key;
  mascotContextPending = null;
  mascotNudge.textContent = mascotContextText(context.key);
  mascotNudge.classList.add('visible', 'contextual');

  if (!mascotAnimationActive) playMascotAnimation(context.animation);
  window.clearTimeout(mascotContextHideTimer);
  mascotContextHideTimer = window.setTimeout(hideMascotContextMessage, MASCOT_CONTEXT_DISPLAY);
  return true;
}

function attemptMascotContext() {
  window.clearTimeout(mascotContextCandidateTimer);
  const latest = dominantMascotContext();
  if (!latest) return;

  if (!mascotContextCandidate || latest.key !== mascotContextCandidate.key) {
    mascotContextCandidate = latest;
    mascotContextCandidateSince = performance.now();
    scheduleMascotContextEvaluation(MASCOT_CONTEXT_STABILITY);
    return;
  }

  if (mascotContextSeen.has(latest.key)) return;
  if (mascotContextSpeakingKey || mascotSeasonalSpeaking) {
    mascotContextPending = latest;
    return;
  }
  if (mascotIntroPending || contactPanel?.classList.contains('open')) {
    scheduleMascotContextEvaluation(500);
    return;
  }

  const stableFor = performance.now() - mascotContextCandidateSince;
  if (stableFor < MASCOT_CONTEXT_STABILITY) {
    scheduleMascotContextEvaluation(MASCOT_CONTEXT_STABILITY - stableFor);
    return;
  }
  speakMascotContext(latest);
}

function evaluateMascotContext() {
  mascotContextRaf = undefined;
  const latest = dominantMascotContext();
  if (!latest) return;

  if (!mascotContextCandidate || latest.key !== mascotContextCandidate.key) {
    mascotContextCandidate = latest;
    mascotContextCandidateSince = performance.now();
    window.clearTimeout(mascotContextCandidateTimer);
    mascotContextCandidateTimer = window.setTimeout(attemptMascotContext, MASCOT_CONTEXT_STABILITY);
  } else if (!mascotContextSeen.has(latest.key) && !mascotContextCandidateTimer && !mascotContextSpeakingKey) {
    mascotContextCandidateTimer = window.setTimeout(attemptMascotContext, Math.max(0, MASCOT_CONTEXT_STABILITY - (performance.now() - mascotContextCandidateSince)));
  }

  if (mascotContextSpeakingKey && latest.key !== mascotContextSpeakingKey && !mascotContextSeen.has(latest.key)) {
    mascotContextPending = latest;
  } else if (mascotContextSpeakingKey === latest.key) {
    mascotContextPending = null;
  }
}

function scheduleMascotContextEvaluation(delay = 0) {
  if (!mascotContextInstalled) return;
  if (delay > 0) {
    window.clearTimeout(mascotContextCandidateTimer);
    mascotContextCandidateTimer = window.setTimeout(attemptMascotContext, delay);
    return;
  }
  if (mascotContextRaf) return;
  mascotContextRaf = window.requestAnimationFrame(evaluateMascotContext);
}

function installMascotContextObservers() {
  if (mascotContextInstalled) return;
  const definitions = [
    ['.booking-section', 'hero', 'direct-offer'],
    ['#about', 'about', 'contact'],
    ['#rooms', 'rooms', 'directions'],
    ['#gallery', 'gallery', 'sea-breeze'],
    ['.villa-guide', 'explore', 'directions'],
    ['#services', 'services', 'sea-access'],
    ['.martina-host', 'host', 'contact'],
    ['#reviews', 'reviews', 'thank-you'],
    ['.concierge-section', 'concierge', 'directions'],
    ['.final-contact-cta', 'final', 'direct-offer'],
  ];
  mascotContextSections = definitions.map(([selector, key, animation]) => ({
    selector,
    key,
    animation,
    target: document.querySelector(selector),
  })).filter((context) => context.target && !(context.key === 'hero' && activeSeasonalMascotEvent));
  if (!mascotContextSections.length) return;

  mascotContextInstalled = true;
  window.addEventListener('scroll', () => scheduleMascotContextEvaluation(), { passive: true });
  window.addEventListener('resize', () => scheduleMascotContextEvaluation(), { passive: true });
  if ('ResizeObserver' in window) {
    const layoutObserver = new ResizeObserver(() => scheduleMascotContextEvaluation());
    layoutObserver.observe(document.body);
  }
  scheduleMascotContextEvaluation();
}

if (activeSeasonalMascotEvent) {
  window.setTimeout(() => playSeasonalMascot(activeSeasonalMascotEvent, { force: seasonalMascotForced }), 9000);
}

function scheduleAmbientMascot() {
  const delay = 42000 + Math.round(Math.random() * 26000);
  window.setTimeout(async () => {
    const hour = new Date().getHours();
    const animation = hour >= 19 || hour < 7
      ? 'lantern-evening'
      : (Math.random() > .48 ? 'sea-breeze' : 'return-to-shell');
    if (!mascotContextSpeakingKey && !mascotSeasonalSpeaking) await playMascotAnimation(animation);
    scheduleAmbientMascot();
  }, delay);
}
scheduleAmbientMascot();

const mascotTestAnimation = new URLSearchParams(window.location.search).get('mascot-test');
if (mascotAnimations[mascotTestAnimation]) window.setTimeout(() => playMascotAnimation(mascotTestAnimation, { force: true }), 1800);

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

async function openContactWithThanks() {
  if (contactPanel?.classList.contains('open')) return;
  await playMascotAnimation('thank-you', { onceKey: 'venere-thank-you-seen', force: true });
  setContactOpen(true);
}

contactLauncher?.addEventListener('click', () => contactPanel?.classList.contains('open') ? setContactOpen(false) : openContactWithThanks());
mascotButton?.addEventListener('click', openContactWithThanks);
document.querySelectorAll('[data-contact-open]').forEach((button) => button.addEventListener('click', openContactWithThanks));
contactClose?.addEventListener('click', () => setContactOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setContactOpen(false);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('#contact-widget') && !event.target.closest('[data-contact-open]')) setContactOpen(false);
});

function installElfsightBrandingFilter() {
  if (window.__villaElfsightBrandingFilter) return;
  window.__villaElfsightBrandingFilter = true;

  const brandingSelector = 'a[href*="elfsight.com/instagram-feed-instashow"]';
  const observedRoots = new WeakSet();

  const hideBranding = (root) => {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll(brandingSelector).forEach((link) => {
      link.style.setProperty('display', 'none', 'important');
      link.style.setProperty('visibility', 'hidden', 'important');
      link.style.setProperty('pointer-events', 'none', 'important');
      link.setAttribute('aria-hidden', 'true');
      link.setAttribute('tabindex', '-1');
    });
  };

  const watchRoot = (root) => {
    if (!root || observedRoots.has(root)) return;
    observedRoots.add(root);
    hideBranding(root);
    new MutationObserver(() => hideBranding(root)).observe(root, { childList: true, subtree: true });
  };

  const nativeAttachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function attachShadow(init) {
    const root = nativeAttachShadow.call(this, init);
    watchRoot(root);
    return root;
  };

  watchRoot(document.documentElement);
}

function loadThirdPartyWidgets() {
  if (document.querySelector('script[data-villa-widget]')) return;
  installElfsightBrandingFilter();
  const scripts = [

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

/* Martina is intentionally retained on top of the published design. */
const martinaPhoto = '/assets/photo/martina-host-2026.jpeg';
const martinaCopy = {
  it: { eyebrow: 'RISPONDE PERSONALMENTE AI MESSAGGI', title: 'Martina ti dà il benvenuto', body: 'Dalla prima domanda fino al tuo arrivo a Cetara, Martina risponde personalmente e ti aiuta a organizzare un soggiorno senza pensieri.', button: 'Contattaci', launcher: 'Contatta Martina' },
  en: { eyebrow: 'PERSONALLY REPLIES TO MESSAGES', title: 'Martina welcomes you', body: 'From your first question to your arrival in Cetara, Martina personally replies and helps you plan a carefree stay.', button: 'Contact us', launcher: 'Contact Martina' },
  fr: { eyebrow: 'RÉPOND PERSONNELLEMENT AUX MESSAGES', title: 'Martina vous souhaite la bienvenue', body: 'De votre première question à votre arrivée à Cetara, Martina vous répond personnellement et vous aide à organiser un séjour serein.', button: 'Nous contacter', launcher: 'Contacter Martina' },
  es: { eyebrow: 'RESPONDE PERSONALMENTE A LOS MENSAJES', title: 'Martina te da la bienvenida', body: 'Desde tu primera pregunta hasta tu llegada a Cetara, Martina responde personalmente y te ayuda a organizar una estancia sin preocupaciones.', button: 'Contáctanos', launcher: 'Contacta con Martina' },
  de: { eyebrow: 'ANTWORTET PERSÖNLICH AUF NACHRICHTEN', title: 'Martina heißt Sie willkommen', body: 'Von der ersten Frage bis zu Ihrer Ankunft in Cetara antwortet Martina persönlich und hilft Ihnen bei der Planung eines unbeschwerten Aufenthalts.', button: 'Kontakt', launcher: 'Martina kontaktieren' },
  pt: { eyebrow: 'RESPONDE PESSOALMENTE ÀS MENSAGENS', title: 'Martina dá-lhe as boas-vindas', body: 'Desde a primeira pergunta até à sua chegada a Cetara, Martina responde pessoalmente e ajuda a organizar uma estadia tranquila.', button: 'Contacte-nos', launcher: 'Contactar Martina' },
  ru: { eyebrow: 'ЛИЧНО ОТВЕЧАЕТ НА СООБЩЕНИЯ', title: 'Мартина приветствует вас', body: 'От первого вопроса до вашего приезда в Четару Мартина отвечает лично и помогает организовать беззаботный отдых.', button: 'Связаться', launcher: 'Написать Мартине' },
  zh: { eyebrow: '亲自回复每一条消息', title: 'Martina 欢迎您', body: '从您的第一个问题到抵达切塔拉，Martina 都会亲自回复，并帮助您安心规划旅程。', button: '联系我们', launcher: '联系 Martina' },
  ja: { eyebrow: 'メッセージに直接お答えします', title: 'Martinaがお迎えします', body: '最初のご質問からチェターラへのご到着まで、Martinaが直接お答えし、安心して滞在を計画できるようお手伝いします。', button: 'お問い合わせ', launcher: 'Martinaに連絡' },
  ko: { eyebrow: '메시지에 직접 답변합니다', title: 'Martina가 환영합니다', body: '첫 문의부터 체타라 도착까지 Martina가 직접 답변하며 편안한 여행 준비를 도와드립니다.', button: '문의하기', launcher: 'Martina에게 문의' },
  ar: { eyebrow: 'ترد شخصياً على الرسائل', title: 'مارتينا ترحب بكم', body: 'من أول سؤال وحتى وصولكم إلى شيتارا، ترد مارتينا شخصياً وتساعدكم على تنظيم إقامة مريحة.', button: 'تواصلوا معنا', launcher: 'تواصل مع مارتينا' },
  nl: { eyebrow: 'BEANTWOORDT BERICHTEN PERSOONLIJK', title: 'Martina heet u welkom', body: 'Vanaf uw eerste vraag tot uw aankomst in Cetara antwoordt Martina persoonlijk en helpt zij u een zorgeloos verblijf te plannen.', button: 'Contact', launcher: 'Contact met Martina' },
  pl: { eyebrow: 'OSOBIŚCIE ODPOWIADA NA WIADOMOŚCI', title: 'Martina wita Państwa', body: 'Od pierwszego pytania aż po przyjazd do Cetary Martina odpowiada osobiście i pomaga zaplanować spokojny pobyt.', button: 'Kontakt', launcher: 'Napisz do Martiny' }
};

function installMartinaExperience() {
  if (document.querySelector('.martina-host')) return;
  const language = window.villaVenereLanguage || document.documentElement.lang || 'en';
  const copy = martinaCopy[language] || martinaCopy.en;
  const anchor = document.querySelector('#reviews') || document.querySelector('.villa-guide');
  if (!anchor) return;

  const section = document.createElement('section');
  section.className = 'martina-host';
  section.setAttribute('aria-labelledby', 'martina-host-title');
  section.innerHTML = `<div class="container martina-host-grid"><div class="martina-host-photo"><img src="${martinaPhoto}" width="1200" height="1600" loading="lazy" decoding="async" alt="Martina, host di Villa Venere"></div><div class="martina-host-copy"><p class="martina-eyebrow">${copy.eyebrow}</p><h3 id="martina-host-title">${copy.title}</h3><p>${copy.body}</p><button class="martina-host-button" type="button" data-contact-open>${copy.button}</button></div></div>`;
  anchor.insertAdjacentElement('beforebegin', section);
  section.querySelector('[data-contact-open]')?.addEventListener('click', () => setContactOpen(true));

  const launcherIcon = contactLauncher?.querySelector('.contact-launcher-icon');
  const launcherLabel = contactLauncher?.querySelector('[data-i18n="contact.launcher"]');
  if (launcherIcon) launcherIcon.innerHTML = `<img class="contact-host-avatar" src="${martinaPhoto}" alt="" aria-hidden="true">`;
  if (launcherLabel) launcherLabel.textContent = copy.launcher;
}

function installStorySections() {
  if (document.querySelector('.photo-story') || document.querySelector('.slow-moments')) return;

  const rooms = document.querySelector('#rooms');
  if (rooms) {
    const gallery = document.createElement('section');
    gallery.className = 'photo-story';
    gallery.id = 'gallery';
    gallery.setAttribute('aria-labelledby', 'photo-story-title');
    gallery.innerHTML = `
      <div class="container">
        <header class="section-intro">
          <p class="section-eyebrow" data-i18n="photoExperience.eyebrow">A private home by the sea</p>
          <h3 id="photo-story-title" data-i18n="photoExperience.title">Discover Villa Venere, one view at a time</h3>
          <p class="photo-story-capacity"><span data-i18n="rooms.capacity">Up to 12 guests</span><span>· 3 <span data-i18n="about.bedrooms">Bedrooms</span></span><span>· 2 <span data-i18n="about.bathrooms">Bathrooms</span></span><span>· <span data-i18n="photoExperience.kitchen">Equipped kitchen</span></span></p>
          <p data-i18n="photoExperience.intro">From the panoramic terrace to sea-view rooms: explore the villa before you arrive.</p>
        </header>
        <div class="photo-mosaic">
          <figure class="photo-tile photo-tile-wide"><img src="/assets/photo/terrace-relax.webp" width="1800" height="1200" loading="lazy" decoding="async" alt="Panoramic private terrace overlooking the Amalfi Coast"><figcaption data-i18n="services.terrace">Private terrace</figcaption></figure>
          <figure class="photo-tile"><img src="/assets/photo/living-sea.webp" width="1800" height="1200" loading="lazy" decoding="async" alt="Sea-view living room at Villa Venere"><figcaption data-i18n="photoExperience.living">Living by the sea</figcaption></figure>
          <figure class="photo-tile"><img src="/assets/photo/villa-cliff.webp" width="1800" height="1013" loading="lazy" decoding="async" alt="Villa Venere beside the Viceregal Tower in Cetara"><figcaption>Villa Venere · Cetara</figcaption></figure>
          <figure class="photo-tile photo-tile-extra"><img src="/assets/photo/terrace-night.webp" width="1600" height="1067" loading="lazy" decoding="async" alt="Villa Venere terrace in the evening"><figcaption data-i18n="photoExperience.evening">Evenings under the lights</figcaption></figure>
          <figure class="photo-tile photo-tile-extra"><img src="/assets/photo/cetara-path.webp" width="1400" height="1050" loading="lazy" decoding="async" alt="Bougainvillea-lined path in Cetara"><figcaption>Cetara · Amalfi Coast</figcaption></figure>
          <figure class="photo-tile photo-tile-extra"><img src="/assets/photo/bedroom-sea.webp" width="1600" height="1067" loading="lazy" decoding="async" alt="Bright double bedroom with a sea view"><figcaption data-i18n="photoExperience.primaryRoom">Sea-view bedroom</figcaption></figure>
          <figure class="photo-tile photo-tile-extra"><img src="/assets/photo/bathroom-main.webp" width="1500" height="1000" loading="lazy" decoding="async" alt="Modern bathroom with a large shower"><figcaption data-i18n="photoExperience.bathrooms">Two modern bathrooms</figcaption></figure>
          <figure class="photo-tile photo-tile-wide photo-tile-extra"><img src="/assets/photo/bedroom-family.webp" width="1600" height="1067" loading="lazy" decoding="async" alt="Double bedroom with sofa bed"><figcaption data-i18n="photoExperience.familyRoom">Bedroom with sofa bed</figcaption></figure>
          <figure class="photo-tile photo-tile-wide photo-tile-extra"><img src="/assets/photo/kitchen.webp" width="1600" height="1067" loading="lazy" decoding="async" alt="Fully equipped induction kitchen"><figcaption data-i18n="photoExperience.kitchen">Equipped kitchen</figcaption></figure>
        </div>
        <div class="photo-gallery-actions"><button class="photo-gallery-toggle" type="button" aria-expanded="false"><span class="gallery-label-show" data-i18n="photoExperience.showAll">Show all photos</span><span class="gallery-label-hide" data-i18n="photoExperience.showLess">Show fewer photos</span></button></div>
      </div>`;
    const galleryMosaic = gallery.querySelector('.photo-mosaic');
    const galleryToggle = gallery.querySelector('.photo-gallery-toggle');
    galleryToggle?.addEventListener('click', () => {
      const expanded = galleryMosaic?.classList.toggle('is-expanded') || false;
      galleryToggle.setAttribute('aria-expanded', String(expanded));
    });
    rooms.insertAdjacentElement('afterend', gallery);
  }

  const storyAnchor = document.querySelector('.photo-story') || document.querySelector('#about');
  if (storyAnchor) {
    const moments = document.createElement('section');
    moments.id = 'moments';
    moments.className = 'slow-moments';
    moments.setAttribute('aria-labelledby', 'slow-moments-title');
    moments.innerHTML = `
      <div class="container">
        <header class="section-intro">
          <p class="section-eyebrow">Villa Venere · Amalfi Coast</p>
          <h3 id="slow-moments-title" data-i18n="photoExperience.momentsTitle">Slow moments on the Amalfi Coast</h3>
          <p><span data-i18n="services.terrace">Private terrace</span><span data-i18n="services.hotTub">Hot tub</span><span data-i18n="services.seaAccess">Private access to the sea</span></p>
        </header>
        <div class="moments-grid">
          <article class="moment-card"><img src="/assets/photo/terrace-relax.webp" width="1800" height="1200" loading="lazy" decoding="async" alt="Private panoramic terrace"><div class="moment-card-copy"><span data-i18n="services.terrace">Private terrace</span><h4 data-i18n="photoExperience.terraceMoment">Your table above the sea</h4></div></article>
          <article class="moment-card moment-card-hot-tub"><img src="/assets/photo/hot-tub-from-video.webp" width="720" height="1280" loading="lazy" decoding="async" alt="Private hot tub"><div class="moment-card-copy"><span data-i18n="services.hotTub">Hot tub</span><h4 data-i18n="photoExperience.hotTubMoment">Relax, surrounded by the Amalfi Coast</h4></div></article>
          <article class="moment-card"><img src="/assets/photo/sea-access-temporary.webp" width="1600" height="900" loading="lazy" decoding="async" alt="Private steps leading directly to the sea"><div class="moment-card-copy"><span data-i18n="services.seaAccess">Private access to the sea</span><h4 data-i18n="photoExperience.seaTitle">Your private path to the sea</h4></div></article>
        </div>
      </div>`;
    storyAnchor.insertAdjacentElement('afterend', moments);
  }

  const guide = document.querySelector('.villa-guide');
  const gallerySection = document.querySelector('.photo-story');
  if (guide && gallerySection) gallerySection.insertAdjacentElement('afterend', guide);
}


const conciergeExperiences = [
  { id: 'boatCoast', icon: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 38h44l-8 12H20z"/><path d="M30 13v25M31 15l16 17H31M27 20 17 32h10M13 55c5-3 9-3 14 0s9 3 14 0 8-3 12 0"/></svg>' },
  { id: 'capri', icon: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 46c9-2 13-8 17-18 3-8 7-13 12-13s7 7 10 15c2 7 5 12 9 16"/><path d="M10 51c5-3 9-3 14 0s9 3 14 0 9-3 16 0M36 15c2 8 1 15-3 22"/></svg>' },
  { id: 'vanCoast', icon: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 24h35l11 12v13H8z"/><path d="M43 25v13h11M15 31h11M31 31h8"/><circle cx="19" cy="50" r="5"/><circle cx="45" cy="50" r="5"/></svg>' },
  { id: 'pompeii', icon: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 51h46M14 47h36M17 23h30M13 19l19-9 19 9zM19 23v24M29 23v24M39 23v24M49 23v24"/></svg>' },
  { id: 'ravello', icon: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 52h40M17 52V25h30v27M22 25V16h20v9M27 16V10h10v6"/><path d="M23 34h5v7h-5zM36 34h5v7h-5zM29 52V40h6v12"/></svg>' },
  { id: 'chef', icon: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 28c-6 0-10-4-10-9s4-9 9-9c3 0 6 2 7 4 2-5 11-6 15-1 7-2 13 3 13 9 0 4-3 7-7 7v22H18V28"/><path d="M24 39h16M24 45h16"/></svg>' }
];

function installConciergeExperience() {
  if (document.querySelector('.concierge-section')) return;
  const finalCta = document.querySelector('.final-contact-cta');
  const reviews = document.querySelector('#reviews');
  if (!finalCta && !reviews) return;
  const t = (key) => window.villaVenereTranslate?.(key) || key;
  const section = document.createElement('section');
  section.className = 'concierge-section concierge-compact';
  section.id = 'concierge';
  section.setAttribute('aria-labelledby', 'concierge-title');
  const categories = [
    { image: '/assets/photo/concierge-sea.webp', title: 'coastCategory', places: 'coastPlaces' },
    { image: '/assets/photo/concierge-history.webp', title: 'historyCategory', places: 'historyPlaces' },
    { image: '/assets/photo/concierge-private.webp', title: 'privateCategory', places: 'privatePlaces' }
  ].map((item) => '<article class="concierge-feature"><img src="' + item.image + '" width="1200" height="800" loading="lazy" decoding="async" alt=""><div><h4>' + t('concierge.' + item.title) + '</h4><p>' + t('concierge.' + item.places) + '</p></div></article>').join('');
  const experiences = conciergeExperiences.map(({ id, icon }) => {
    const title = t('concierge.' + id + 'Title');
    const message = encodeURIComponent(t('concierge.whatsappIntro') + ': ' + title + '.');
    return '<article class="concierge-card"><div class="concierge-icon">' + icon + '</div><div class="concierge-card-copy"><h4>' + title + '</h4><p>' + t('concierge.' + id + 'Body') + '</p></div><a href="https://wa.me/393896840764?text=' + message + '" target="_blank" rel="noreferrer"><span>' + t('concierge.cta') + '</span><span aria-hidden="true">→</span></a></article>';
  }).join('');
  section.innerHTML = '<div class="container"><header class="concierge-intro"><p class="concierge-eyebrow">' + t('concierge.eyebrow') + '</p><h3 id="concierge-title">' + t('concierge.title') + '</h3><p>' + t('concierge.intro') + '</p></header><div class="concierge-overview">' + categories + '</div><div class="concierge-actions"><button class="concierge-contact" type="button" data-contact-open>' + t('concierge.contactNow') + '</button><button class="concierge-toggle" type="button" aria-expanded="false"><span class="concierge-show">' + t('concierge.showAll') + '</span><span class="concierge-hide">' + t('concierge.showLess') + '</span></button></div><div class="concierge-catalog" hidden><div class="concierge-grid">' + experiences + '</div><p class="concierge-note">' + t('concierge.partnerNote') + '</p></div></div>';
  const toggle = section.querySelector('.concierge-toggle');
  const catalog = section.querySelector('.concierge-catalog');
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    catalog.hidden = !expanded;
    if (expanded) window.setTimeout(() => catalog.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  });
  section.querySelector('[data-contact-open]')?.addEventListener('click', () => setContactOpen(true));
  if (finalCta) finalCta.insertAdjacentElement('beforebegin', section);
  else reviews.insertAdjacentElement('afterend', section);
}

function installFinalContactCta() {
  if (document.querySelector('.final-contact-cta')) return;
  const reviews = document.querySelector('#reviews');
  if (!reviews) return;
  const section = document.createElement('section');
  section.className = 'final-contact-cta';
  section.setAttribute('aria-labelledby', 'final-contact-title');
  section.innerHTML = `<div class="container"><div class="final-contact-card"><img class="final-contact-photo" src="${martinaPhoto}" width="480" height="640" loading="lazy" decoding="async" alt="Martina, host di Villa Venere"><div class="final-contact-copy"><p class="final-contact-eyebrow" data-i18n="finalCta.eyebrow">BOOK DIRECT</p><h3 id="final-contact-title" data-i18n="finalCta.title">Already have your dates? Talk to Martina</h3><p data-i18n="finalCta.body">Send your dates, number of guests and any price found online. Martina will reply personally with the best available direct proposal.</p><div class="final-contact-actions"><button type="button" class="final-contact-primary" data-contact-open data-i18n="finalCta.contact">Contact Martina</button><a class="final-contact-secondary" data-booking-link href="https://book.octorate.com/octobook/site/reservation/index.xhtml?lang=en&codice=679766" target="_blank" rel="noreferrer" data-i18n="finalCta.availability">Check availability</a></div><small data-i18n="finalCta.trust">Personal reply · No obligation · Direct rate</small></div></div></div>`;
  reviews.insertAdjacentElement('afterend', section);
  section.querySelector('[data-contact-open]')?.addEventListener('click', () => setContactOpen(true));
  updateBookingLinks(window.villaVenereLanguage || DEFAULT_LANGUAGE);
}

installStorySections();
installFinalContactCta();
Promise.resolve(window.villaI18nReady).finally(() => {
  installMartinaExperience();
  installFinalContactCta();
  installConciergeExperience();
  window.setTimeout(installMascotContextObservers, 0);
});
