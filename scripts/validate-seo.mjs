import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const paths = ['index.html', ...['en','it','fr','es','de','pt','ru','zh','ja','ko','ar','nl','pl'].map((lang) => `${lang}/index.html`),
  'it/villa-cetara/index.html','en/villa-cetara/index.html','it/accesso-privato-mare/index.html','en/private-sea-access/index.html',
  'it/camere-servizi/index.html','en/rooms-amenities/index.html','it/come-arrivare/index.html','en/getting-to-cetara/index.html',
  'it/esperienze-costiera-amalfitana/index.html','en/amalfi-coast-experiences/index.html'];
const errors = [];
const titles = new Map();
const googleAmenityNames = new Set(['privateBeachAccess', 'patio', 'hotTub', 'wifi', 'ac', 'kitchen', 'tv', 'washerDryer', 'licenseNum']);
for (const path of paths) {
  const html = await readFile(join(root, path), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
  if (!title || !canonical || !description) errors.push(`${path}: missing title, canonical or description`);
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
if (locCount !== 24) errors.push(`Sitemap contains ${locCount} URLs instead of 24`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`SEO validation passed: ${paths.length} HTML pages, ${locCount} sitemap URLs, valid JSON-LD.`);
}
