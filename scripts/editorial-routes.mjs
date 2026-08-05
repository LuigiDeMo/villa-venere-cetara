export const editorialLanguages = ['en', 'it', 'fr', 'es', 'de', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'nl', 'pl'];

export const editorialHreflang = {
  en: 'en', it: 'it', fr: 'fr', es: 'es', de: 'de', pt: 'pt', ru: 'ru',
  zh: 'zh-Hans', ja: 'ja', ko: 'ko', ar: 'ar', nl: 'nl', pl: 'pl',
};

export const editorialRoutes = {
  en: { villa: 'villa-cetara', sea: 'private-sea-access', rooms: 'rooms-amenities', location: 'getting-to-cetara', experiences: 'amalfi-coast-experiences' },
  it: { villa: 'villa-cetara', sea: 'accesso-privato-mare', rooms: 'camere-servizi', location: 'come-arrivare', experiences: 'esperienze-costiera-amalfitana' },
  fr: { villa: 'villa-cetara', sea: 'acces-prive-mer', rooms: 'chambres-equipements', location: 'venir-cetara', experiences: 'experiences-cote-amalfitaine' },
  es: { villa: 'villa-cetara', sea: 'acceso-privado-mar', rooms: 'habitaciones-servicios', location: 'como-llegar-cetara', experiences: 'experiencias-costa-amalfitana' },
  de: { villa: 'villa-cetara', sea: 'privater-meerzugang', rooms: 'zimmer-ausstattung', location: 'anreise-cetara', experiences: 'erlebnisse-amalfikueste' },
  pt: { villa: 'villa-cetara', sea: 'acesso-privado-mar', rooms: 'quartos-comodidades', location: 'como-chegar-cetara', experiences: 'experiencias-costa-amalfitana' },
  ru: { villa: 'villa-cetara', sea: 'chastnyy-vyhod-k-moryu', rooms: 'komnaty-udobstva', location: 'kak-dobratsya-cetara', experiences: 'vpechatleniya-amalfi' },
  zh: { villa: 'villa-cetara', sea: 'private-sea-access', rooms: 'rooms-amenities', location: 'getting-to-cetara', experiences: 'amalfi-coast-experiences' },
  ja: { villa: 'villa-cetara', sea: 'private-sea-access', rooms: 'rooms-amenities', location: 'getting-to-cetara', experiences: 'amalfi-coast-experiences' },
  ko: { villa: 'villa-cetara', sea: 'private-sea-access', rooms: 'rooms-amenities', location: 'getting-to-cetara', experiences: 'amalfi-coast-experiences' },
  ar: { villa: 'villa-cetara', sea: 'private-sea-access', rooms: 'rooms-amenities', location: 'getting-to-cetara', experiences: 'amalfi-coast-experiences' },
  nl: { villa: 'villa-cetara', sea: 'prive-toegang-zee', rooms: 'kamers-voorzieningen', location: 'route-cetara', experiences: 'ervaringen-amalfikust' },
  pl: { villa: 'villa-cetara', sea: 'prywatny-dostep-do-morza', rooms: 'pokoje-udogodnienia', location: 'dojazd-cetara', experiences: 'atrakcje-wybrzeze-amalfitanskie' },
};

export function editorialPath(language, key) {
  return `/${language}/${editorialRoutes[language][key]}/`;
}
