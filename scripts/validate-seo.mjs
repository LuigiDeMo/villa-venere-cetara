import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { editorialLanguages, editorialRoutes } from './editorial-routes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const paths = [
  'index.html',
  ...editorialLanguages.map((language) => `${language}/index.html`),
  ...editorialLanguages.flatMap((language) => Object.values(editorialRoutes[language]).map((slug) => `${language}/${slug}/index.html`)),
];
const errors = [];
const titles = new Map();
const googleAmenityNames = new Set(['privateBeachAccess', 'patio', 'hotTub', 'wifi', 'ac', 'kitchen', 'tv', 'washerDryer', 'licenseNum']);
const editorialFiles = new Map(editorialLanguages.flatMap((language) => Object.entries(editorialRoutes[language]).map(([key, slug]) => [`${language}/${slug}/index.html`, { language, key, slug }])));
for (const path of paths) {
  const html = await readFile(join(root, path), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
  if (!title || !canonical || !description) errors.push(`${path}: missing title, canonical or description`);
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
    } catch (error) {
      errors.push(`${path}: invalid JSON-LD (${error.message})`);
    }
  }
}
for (const image of ['villa-logo-256.png','villa-view.jpg','1661525798152.jpg','villa-gallery/01-villa-esterno.jpg','villa-gallery/02-villa-cucina.jpg','villa-gallery/03-villa-camera.jpg','villa-gallery/04-villa-terrazza.jpg','villa-gallery/camera-principale-vista-mare.jpg','villa-gallery/camera-principale-smart-tv.jpg']) {
  try { await access(join(root, 'assets', image)); } catch { errors.push(`Missing image: assets/${image}`); }
}
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const locCount = [...sitemap.matchAll(/<loc>/g)].length;
if (locCount !== 79) errors.push(`Sitemap contains ${locCount} URLs instead of 79`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`SEO validation passed: ${paths.length} HTML pages, ${locCount} sitemap URLs, valid JSON-LD.`);
}
