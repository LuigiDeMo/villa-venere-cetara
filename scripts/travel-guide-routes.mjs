export const travelGuideLanguages = ['it', 'en'];

export const travelGuideHreflang = {
  it: 'it',
  en: 'en',
};

export const travelGuideSlugs = {
  slowBase: {
    it: 'soggiornare-cetara-slow-luxury',
    en: 'where-to-stay-cetara-slow-luxury',
  },
  coastBySea: {
    it: 'cetara-amalfi-positano-traghetto-barca',
    en: 'cetara-amalfi-positano-ferry-private-boat',
  },
  ravello: {
    it: 'cetara-ravello-autobus-autista-privato',
    en: 'cetara-ravello-bus-private-driver',
  },
  pompeii: {
    it: 'pompei-da-cetara-in-giornata',
    en: 'pompeii-from-cetara-day-trip',
  },
  cetaraFood: {
    it: 'cetara-colatura-alici-cucina-locale',
    en: 'cetara-anchovy-colatura-local-food',
  },
  threeDays: {
    it: 'tre-giorni-costiera-amalfitana-base-cetara',
    en: 'three-days-amalfi-coast-based-in-cetara',
  },
  herculaneumVesuvius: {
    it: 'ercolano-vesuvio-da-cetara',
    en: 'herculaneum-vesuvius-from-cetara',
  },
};

export const travelGuideKeys = Object.keys(travelGuideSlugs);

export function travelGuideHubPath(language) {
  return language === 'it' ? '/it/guide/' : '/en/guides/';
}

export function travelGuidePath(language, key) {
  return `${travelGuideHubPath(language)}${travelGuideSlugs[key][language]}/`;
}
