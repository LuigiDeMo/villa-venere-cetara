import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { editorialLanguages, editorialPath, editorialRoutes } from './editorial-routes.mjs';
import { travelGuideHreflang, travelGuideHubPath, travelGuideKeys, travelGuideLanguages, travelGuidePath } from './travel-guide-routes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const paths = [
  'index.html',
  ...editorialLanguages.map((language) => `${language}/index.html`),
  ...editorialLanguages.flatMap((language) => Object.values(editorialRoutes[language]).map((slug) => `${language}/${slug}/index.html`)),
  ...travelGuideLanguages.map((language) => `${travelGuideHubPath(language).replace(/^\//, '')}index.html`),
  ...travelGuideLanguages.flatMap((language) => travelGuideKeys.map((key) => `${travelGuidePath(language, key).replace(/^\//, '')}index.html`)),
];
const errors = [];
const titles = new Map();
const googleAmenityNames = new Set(['privateBeachAccess', 'patio', 'hotTub', 'wifi', 'ac', 'kitchen', 'tv', 'washerDryer', 'licenseNum']);
const editorialFiles = new Map(editorialLanguages.flatMap((language) => Object.entries(editorialRoutes[language]).map(([key, slug]) => [`${language}/${slug}/index.html`, { language, key, slug }])));
const journalFiles = new Map([
  ...travelGuideLanguages.map((language) => [`${travelGuideHubPath(language).replace(/^\//, '')}index.html`, { language, hub: true }]),
  ...travelGuideLanguages.flatMap((language) => travelGuideKeys.map((key) => [`${travelGuidePath(language, key).replace(/^\//, '')}index.html`, { language, key, hub: false }])),
]);
const englishJournal = JSON.parse(await readFile(join(root, 'locales', 'journal', 'en.json'), 'utf8'));
for (const language of travelGuideLanguages) {
  const journalLocale = JSON.parse(await readFile(join(root, 'locales', 'journal', `${language}.json`), 'utf8'));
  if (journalLocale.guides?.length !== travelGuideKeys.length) errors.push(`locales/journal/${language}.json: expected ${travelGuideKeys.length} guides`);
  if (/\[\[VV|__VV_|undefined|null/.test(JSON.stringify(journalLocale))) errors.push(`locales/journal/${language}.json: contains a broken translation marker`);
  if (!['en', 'it'].includes(language)) {
    journalLocale.guides?.forEach((guide, index) => {
      for (const field of ['title', 'description', 'quickAnswer']) {
        if (!guide[field] || guide[field] === englishJournal.guides[index][field]) errors.push(`locales/journal/${language}.json: untranslated ${guide.key}.${field}`);
      }
    });
  }
}
for (const path of paths) {
  const html = await readFile(join(root, path), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
  if (!title || !canonical || !description) errors.push(`${path}: missing title, canonical or description`);
  const homeLanguage = path === 'index.html' ? 'en' : editorialLanguages.find((language) => path === `${language}/index.html`);
  if (homeLanguage) {
    const journalPath = travelGuideHubPath(homeLanguage);
    if (!html.includes(`href="${journalPath}" data-journal-nav`)) errors.push(`${path}: missing localized journal navigation link`);
    if (!html.includes(`href="${journalPath}" data-journal-link`)) errors.push(`${path}: missing localized visible journal card or footer link`);
  }
  const editorial = editorialFiles.get(path);
  if (editorial) {
    const expectedCanonical = `https://villavenerecetara.it/${editorial.language}/${editorial.slug}/`;
    if (canonical !== expectedCanonical) errors.push(`${path}: canonical does not match its localized URL`);
    if (!html.includes(`<html lang="${editorial.language}"`)) errors.push(`${path}: incorrect document language`);
    if (editorial.language === 'ar' && !html.includes('dir="rtl"')) errors.push(`${path}: Arabic guide must use RTL direction`);
    const alternateCount = [...html.matchAll(/<link rel="alternate" hreflang=/g)].length;
    if (alternateCount !== 14) errors.push(`${path}: contains ${alternateCount} hreflang links instead of 14`);
    for (const slug of Object.values(editorialRoutes[editorial.language])) {
      if (!html.includes(`href="/${editorial.language}/${slug}/"`)) errors.push(`${path}: missing localized guide link to ${slug}`);
    }
    if (editorial.key === 'experiences') {
      if (!html.includes('data-vv-context="experiences"')) errors.push(`${path}: experience concierge widget is required`);
      if (!html.includes('/concierge-widget.js?v=3')) errors.push(`${path}: experience concierge script is required`);
      if (!html.includes('/language-suggestion.js?v=1')) errors.push(`${path}: direct-entry language detection is required`);
      if (!html.includes(`href="${travelGuideHubPath(editorial.language)}"`)) errors.push(`${path}: missing same-language journal link`);
      const experienceMenu = html.match(/class="article-language-menu"[\s\S]*?<\/details>/)?.[0] || '';
      if ([...experienceMenu.matchAll(/data-language-choice=/g)].length !== 13) errors.push(`${path}: experience language selector must contain 13 choices`);
      for (const contactMethod of ['WhatsApp', 'Facebook', 'Telegram', 'Instagram', 'mailto:', 'tel:']) {
        if (!html.includes(contactMethod)) errors.push(`${path}: missing contact method ${contactMethod}`);
      }
      const experienceWidget = html.match(/data-vv-context="experiences"[\s\S]*?<\/section>/)?.[0] || '';
      if ([...experienceWidget.matchAll(/<svg /g)].length !== 6) errors.push(`${path}: experience concierge must use the six branded SVG icons`);
    } else if (html.includes('data-vv-assistant')) {
      errors.push(`${path}: concierge widget must only appear on experience editorial pages`);
    }
  }
  const journal = journalFiles.get(path);
  if (journal) {
    const expectedPath = journal.hub ? travelGuideHubPath(journal.language) : travelGuidePath(journal.language, journal.key);
    const expectedCanonical = `https://villavenerecetara.it${expectedPath}`;
    if (canonical !== expectedCanonical) errors.push(`${path}: journal canonical does not match its localized URL`);
    if (!html.includes(`<html lang="${travelGuideHreflang[journal.language]}"`)) errors.push(`${path}: incorrect journal document language`);
    if (journal.language === 'ar' && !html.includes('dir="rtl"')) errors.push(`${path}: Arabic journal must use RTL direction`);
    const alternateCount = [...html.matchAll(/<link rel="alternate" hreflang=/g)].length;
    if (alternateCount !== 14) errors.push(`${path}: contains ${alternateCount} journal hreflang links instead of 14`);
    const languageLinkCount = [...html.matchAll(/class="journal-language-menu"[\s\S]*?<\/details>/g)][0]?.[0].match(/<a/g)?.length || 0;
    if (languageLinkCount !== 13) errors.push(`${path}: contains ${languageLinkCount} visible journal language links instead of 13`);
    if (!html.includes('class="photo-credit"')) errors.push(`${path}: visible photo attribution is required`);
    if (!html.includes('data-vv-context="guides"')) errors.push(`${path}: guide concierge widget is required`);
    if (!html.includes('/concierge-widget.js?v=3')) errors.push(`${path}: guide concierge script is required`);
    if (!html.includes('/language-suggestion.js?v=1')) errors.push(`${path}: direct-entry language detection is required`);
    if (!html.includes(`href="${editorialPath(journal.language, 'experiences')}"`)) errors.push(`${path}: missing same-language experience link`);
    const guideWidget = html.match(/data-vv-context="guides"[\s\S]*?<\/section>/)?.[0] || '';
    if ([...guideWidget.matchAll(/<svg /g)].length !== 6) errors.push(`${path}: guide concierge must use the six branded SVG icons`);
    if (!journal.hub && !html.includes('class="travel-faq"')) errors.push(`${path}: visible FAQ section is required`);
    if (!journal.hub && !html.includes('class="travel-sources"')) errors.push(`${path}: source section is required`);
  }
  for (const brokenText of ['pu?', 'dall?acqua', 'Disponibilit?', ', ? possibile', 'disponibilit?']) {
    if (html.includes(brokenText)) errors.push(`${path}: broken text encoding (${brokenText})`);
  }
  if (title) {
    if (titles.has(title)) errors.push(`${path}: duplicate title with ${titles.get(title)}`);
    titles.set(title, path);
  }
  for (const match of html.matchAll(/<script(?: id="structured-data")? type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(match[1]);
      const nodes = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
      const rental = nodes.find((node) => node?.['@type'] === 'VacationRental');
      const blogPosting = nodes.find((node) => node?.['@type'] === 'BlogPosting');
      if (rental && rental.additionalType !== 'Villa') errors.push(`${path}: VacationRental.additionalType must be Villa`);
      if (rental && rental.containsPlace?.additionalType !== 'EntirePlace') errors.push(`${path}: containsPlace.additionalType must be EntirePlace`);
      if (rental?.amenityFeature) errors.push(`${path}: amenityFeature must be nested in containsPlace`);
      if (rental) {
        const amenities = rental.containsPlace?.amenityFeature;
        if (!Array.isArray(amenities) || amenities.length === 0) errors.push(`${path}: containsPlace.amenityFeature is required`);
        else for (const amenity of amenities) {
          if (!googleAmenityNames.has(amenity?.name)) errors.push(`${path}: unsupported Google amenity name (${amenity?.name})`);
        }
        if (rental.aggregateRating?.reviewCount !== 180 || rental.aggregateRating?.ratingCount !== 180) {
          errors.push(`${path}: aggregate rating counts must match the visible verified total`);
        }
        if (!Array.isArray(rental.review) || rental.review.length === 0) errors.push(`${path}: VacationRental.review is required`);
        else for (const review of rental.review) {
          if (!review.author?.name || !/^\d{4}-\d{2}-\d{2}$/.test(review.datePublished || '') || !review.reviewRating?.ratingValue || !review.reviewRating?.bestRating) {
            errors.push(`${path}: review requires a real author, publication date and rating`);
          }
        }
      }
      if (blogPosting) {
        for (const field of ['headline', 'image', 'datePublished', 'dateModified', 'author', 'publisher']) {
          if (!blogPosting[field]) errors.push(`${path}: BlogPosting.${field} is required`);
        }
      }
    } catch (error) {
      errors.push(`${path}: invalid JSON-LD (${error.message})`);
    }
  }
}
for (const image of ['villa-logo-256.png','villa-view.jpg','1661525798152.jpg','villa-gallery/01-villa-esterno.jpg','villa-gallery/02-villa-cucina.jpg','villa-gallery/03-villa-camera.jpg','villa-gallery/04-villa-terrazza.jpg','villa-gallery/camera-principale-vista-mare.jpg','villa-gallery/camera-principale-smart-tv.jpg','photo/hero-terrace.webp','photo/concierge-sea.webp','photo/cetara-path.webp','photo/concierge-history.webp','photo/concierge-private.webp','photo/terrace-relax.webp','photo/villa-cliff.webp','journal/cetara-slow-base.webp','journal/amalfi-positano-by-sea.webp','journal/villa-rufolo-ravello.webp','journal/pompeii-forum-vesuvius.webp','journal/cetara-colatura.webp','journal/cetara-three-days.webp','journal/herculaneum-vesuvius.webp']) {
  try { await access(join(root, 'assets', image)); } catch { errors.push(`Missing image: assets/${image}`); }
}
for (const file of ['concierge-widget.css', 'concierge-widget.js', 'language-suggestion.js']) {
  try { await access(join(root, file)); } catch { errors.push(`Missing assistant asset: ${file}`); }
}
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const locCount = [...sitemap.matchAll(/<loc>/g)].length;
if (locCount !== paths.length) errors.push(`Sitemap contains ${locCount} URLs instead of ${paths.length}`);
for (const block of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const alternateCount = [...block[1].matchAll(/<xhtml:link rel="alternate"/g)].length;
  if (alternateCount !== 14) errors.push(`Sitemap URL block contains ${alternateCount} alternates instead of 14`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`SEO validation passed: ${paths.length} HTML pages, ${locCount} sitemap URLs, valid JSON-LD.`);
}
