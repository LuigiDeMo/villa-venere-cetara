import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const languages = ['en', 'it', 'fr', 'es', 'de', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'nl', 'pl'];
const seo = {
  en: { title: 'Villa Venere Cetara | Private Villa on the Amalfi Coast', description: 'Stay at Villa Venere, a private sea-view villa in Cetara with 3 bedrooms, panoramic terrace and private access to the sea. Check availability and book direct.', locale: 'en_US' },
  it: { title: 'Villa Venere Cetara | Villa privata in Costiera Amalfitana', description: 'Soggiorna a Villa Venere, villa privata vista mare a Cetara con 3 camere, terrazza panoramica e accesso privato al mare. Verifica la disponibilità.', locale: 'it_IT' },
  fr: { title: 'Villa Venere Cetara | Villa privée sur la Côte Amalfitaine', description: 'Séjournez à Villa Venere, une villa privée avec vue sur la mer à Cetara, 3 chambres, terrasse panoramique et accès privé à la mer.', locale: 'fr_FR' },
  es: { title: 'Villa Venere Cetara | Villa privada en la Costa Amalfitana', description: 'Alójate en Villa Venere, una villa privada con vistas al mar en Cetara, 3 dormitorios, terraza panorámica y acceso privado al mar.', locale: 'es_ES' },
  de: { title: 'Villa Venere Cetara | Private Villa an der Amalfiküste', description: 'Villa Venere ist eine private Villa mit Meerblick in Cetara, 3 Schlafzimmern, Panoramaterrasse und privatem Zugang zum Meer.', locale: 'de_DE' },
  pt: { title: 'Villa Venere Cetara | Villa privada na Costa Amalfitana', description: 'Fique na Villa Venere, uma villa privada com vista para o mar em Cetara, 3 quartos, terraço panorâmico e acesso privado ao mar.', locale: 'pt_PT' },
  ru: { title: 'Villa Venere Cetara | Частная вилла на Амальфитанском побережье', description: 'Villa Venere — частная вилла с видом на море в Четаре: 3 спальни, панорамная терраса и частный выход к морю. Бронируйте напрямую.', locale: 'ru_RU' },
  zh: { title: 'Villa Venere Cetara | 阿马尔菲海岸私人别墅', description: 'Villa Venere 是位于切塔拉的私人海景别墅，设有3间卧室、全景露台和私人入海通道。查看房态并直接预订。', locale: 'zh_CN' },
  ja: { title: 'Villa Venere Cetara | アマルフィ海岸のプライベートヴィラ', description: 'チェターラの海を望むVilla Venere。3ベッドルーム、パノラマテラス、海への専用アクセスを備えたプライベートヴィラです。', locale: 'ja_JP' },
  ko: { title: 'Villa Venere Cetara | 아말피 해안 프라이빗 빌라', description: '체타라의 바다 전망 Villa Venere는 침실 3개, 파노라마 테라스, 바다 전용 통로를 갖춘 프라이빗 빌라입니다.', locale: 'ko_KR' },
  ar: { title: 'Villa Venere Cetara | فيلا خاصة على ساحل أمالفي', description: 'Villa Venere فيلا خاصة بإطلالة بحرية في شيتارا، تضم ثلاث غرف نوم وتراساً بانورامياً ومدخلاً خاصاً إلى البحر. احجز مباشرة.', locale: 'ar_SA' },
  nl: { title: 'Villa Venere Cetara | Privévilla aan de Amalfikust', description: 'Villa Venere is een privévilla met zeezicht in Cetara, 3 slaapkamers, panoramisch terras en privétoegang tot zee. Boek rechtstreeks.', locale: 'nl_NL' },
  pl: { title: 'Villa Venere Cetara | Prywatna willa na Wybrzeżu Amalfitańskim', description: 'Villa Venere to prywatna willa z widokiem na morze w Cetarze: 3 sypialnie, panoramiczny taras i prywatne zejście do morza.', locale: 'pl_PL' },
};

function valueAt(dictionary, key) {
  return key.split('.').reduce((value, part) => value?.[part], dictionary);
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function structuredData(language, canonical, meta) {
  const images = [
    'villa-view.jpg', '1661525798152.jpg', 'villa-gallery/01-villa-esterno.jpg',
    'villa-gallery/02-villa-cucina.jpg', 'villa-gallery/03-villa-camera.jpg',
    'villa-gallery/04-villa-terrazza.jpg', 'villa-gallery/camera-principale-vista-mare.jpg',
    'villa-gallery/camera-principale-smart-tv.jpg',
  ].map((path) => `https://villavenerecetara.it/assets/${path}`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite', '@id': 'https://villavenerecetara.it/#website',
        url: 'https://villavenerecetara.it/', name: 'Villa Venere - Amalfi Coast',
        inLanguage: languages, publisher: { '@id': 'https://villavenerecetara.it/#villa' },
      },
      {
        '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical,
        name: meta.title, description: meta.description,
        isPartOf: { '@id': 'https://villavenerecetara.it/#website' },
        about: { '@id': 'https://villavenerecetara.it/#villa' }, inLanguage: language,
      },
      {
        '@type': 'VacationRental', '@id': 'https://villavenerecetara.it/#villa',
        identifier: 'IT065041B49WWIMPWN', name: 'Villa Venere - Amalfi Coast',
        url: 'https://villavenerecetara.it/', description: meta.description, image: images,
        telephone: ['+39 389 684 0764', '+39 333 102 4780'], email: 'info@villavenerecetara.com',
        address: { '@type': 'PostalAddress', streetAddress: 'Via Lannio, 8', postalCode: '84010', addressLocality: 'Cetara', addressRegion: 'SA', addressCountry: 'IT' },
        geo: { '@type': 'GeoCoordinates', latitude: 40.64717, longitude: 14.70383 },
        containsPlace: {
          '@type': 'Accommodation', name: 'Entire three-bedroom villa',
          occupancy: { '@type': 'QuantitativeValue', value: 12 }, numberOfBedrooms: 3, numberOfBathroomsTotal: 2,
          bed: [{ '@type': 'BedDetails', numberOfBeds: 3, typeOfBed: 'Double bed' }, { '@type': 'BedDetails', numberOfBeds: 3, typeOfBed: 'Sofa bed' }],
        },
        checkinTime: '15:00', checkoutTime: '11:00',
        amenityFeature: ['Private access to the sea', 'Private sea-view terrace', 'Hot tub', 'High-speed Wi-Fi', 'Air conditioning', 'Equipped induction kitchen', 'Smart TV in every bedroom', 'Washing machine'].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
        sameAs: ['https://www.airbnb.com/rooms/50801219', 'https://www.vrbo.com/it-it/affitto-vacanze/p10907080', 'https://www.cetaraturistica.it/soggiornare/case-per-vacanze/villa-venere', 'https://www.instagram.com/villavenerecetara/', 'https://www.facebook.com/villavenerecetara'],
        potentialAction: { '@type': 'ReserveAction', target: `https://book.octorate.com/octobook/site/reservation/index.xhtml?lang=${language}&codice=679766` },
      },
    ],
  };
}

function localize(template, language, dictionary) {
  const meta = seo[language];
  const canonical = `https://villavenerecetara.it/${language}/`;
  let html = template
    .replace('<html lang="en"', `<html lang="${language}"${language === 'ar' ? ' dir="rtl"' : ''}`)
    .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(meta.description)}">`)
    .replace('<link rel="canonical" href="https://villavenerecetara.it/">', `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(meta.title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(meta.description)}">`)
    .replace('<meta property="og:url" content="https://villavenerecetara.it/">', `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${meta.locale}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`)
    .replaceAll('href="assets/', 'href="/assets/')
    .replaceAll('src="assets/', 'src="/assets/')
    .replaceAll('href="styles.css', 'href="/styles.css')
    .replaceAll('src="script.js', 'src="/script.js');

  html = html.replace(/<script id="structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/, `<script id="structured-data" type="application/ld+json">\n  ${JSON.stringify(structuredData(language, canonical, meta))}\n  </script>`);
  const seoPrefix = language === 'it' ? '/it/' : '/en/';
  const seoPaths = language === 'it'
    ? { villa: 'villa-cetara/', sea: 'accesso-privato-mare/', rooms: 'camere-servizi/', location: 'come-arrivare/' }
    : { villa: 'villa-cetara/', sea: 'private-sea-access/', rooms: 'rooms-amenities/', location: 'getting-to-cetara/' };
  html = html.replace(/href="[^"]+" data-seo-page="([^"]+)"/g, (match, page) => `href="${seoPrefix}${seoPaths[page] || ''}" data-seo-page="${page}"`);
  if (language === 'it') {
    html = html
      .replace('>Explore the villa</h3>', '>Scopri Villa Venere</h3>')
      .replace('>Villa, rooms and spaces</small>', '>Villa, camere e ambienti</small>')
      .replace('>Terrace, dock and the sea</small>', '>Terrazza, banchina e mare</small>')
      .replace('>Capacity and amenities</small>', '>Capienza e dotazioni</small>')
      .replace('>Ferries, buses and parking</small>', '>Traghetti, autobus e parcheggio</small>');
  }

  html = html.replace(/(<[^>]+data-i18n="([^"]+)"[^>]*>)([^<]*)(<\/[^>]+>)/g, (match, open, key, content, close) => {
    const translated = valueAt(dictionary, key);
    return typeof translated === 'string' ? `${open}${escapeHtml(translated)}${close}` : match;
  });
  html = html.replace(/(<[^>]+)data-i18n-aria-label="([^"]+)"([^>]*>)/g, (match, before, key, after) => {
    const translated = valueAt(dictionary, key);
    return typeof translated === 'string' ? `${before}data-i18n-aria-label="${key}"${after}`.replace(/aria-label="[^"]*"/, `aria-label="${escapeHtml(translated)}"`) : match;
  });
  html = html.replace(/(<[^>]+)data-i18n-alt="([^"]+)"([^>]*>)/g, (match, before, key, after) => {
    const translated = valueAt(dictionary, key);
    return typeof translated === 'string' ? `${before}data-i18n-alt="${key}"${after}`.replace(/alt="[^"]*"/, `alt="${escapeHtml(translated)}"`) : match;
  });
  return html;
}

const template = await readFile(join(root, 'index.html'), 'utf8');
for (const language of languages) {
  const dictionary = JSON.parse(await readFile(join(root, 'locales', `${language}.json`), 'utf8'));
  const outputDirectory = join(root, language);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(join(outputDirectory, 'index.html'), localize(template, language, dictionary), 'utf8');
}

console.log(`Generated ${languages.length} localized SEO pages.`);
