import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { editorialHreflang, editorialLanguages, editorialPath } from './editorial-routes.mjs';
import { travelGuideHreflang, travelGuideHubPath, travelGuideKeys, travelGuideLanguages, travelGuidePath } from './travel-guide-routes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://villavenerecetara.it';
const languages = editorialLanguages;
const lastmod = process.env.SEO_LASTMOD || new Date().toISOString().slice(0, 10);
const hreflang = editorialHreflang;
const imagePaths = ['villa-view.jpg', '1661525798152.jpg', 'villa-gallery/01-villa-esterno.jpg', 'villa-gallery/02-villa-cucina.jpg', 'villa-gallery/03-villa-camera.jpg', 'villa-gallery/04-villa-terrazza.jpg', 'villa-gallery/camera-principale-vista-mare.jpg', 'villa-gallery/camera-principale-smart-tv.jpg', 'photo/terrace-relax.webp', 'photo/living-sea.webp', 'photo/bedroom-sea.webp', 'photo/bathroom-main.webp', 'photo/kitchen.webp', 'photo/villa-cliff.webp'];
const editorialKeys = ['villa', 'sea', 'rooms', 'location', 'experiences'];
const esc = (value) => value.replaceAll('&', '&amp;').replaceAll("'", '&apos;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const alternate = (lang, href) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;

const urls = [];
const rootAlternates = [alternate('x-default', `${origin}/`), ...languages.map((lang) => alternate(hreflang[lang], `${origin}/${lang}/`))].join('\n');
urls.push(`  <url>\n    <loc>${origin}/</loc>\n    <lastmod>${lastmod}</lastmod>\n${rootAlternates}\n${imagePaths.map((path) => `    <image:image><image:loc>${origin}/assets/${esc(path)}</image:loc></image:image>`).join('\n')}\n  </url>`);
for (const lang of languages) {
  urls.push(`  <url>\n    <loc>${origin}/${lang}/</loc>\n    <lastmod>${lastmod}</lastmod>\n${rootAlternates}\n  </url>`);
}
for (const key of editorialKeys) {
  const alternates = [alternate('x-default', `${origin}${editorialPath('en', key)}`), ...languages.map((language) => alternate(hreflang[language], `${origin}${editorialPath(language, key)}`))].join('\n');
  for (const language of languages) {
    const path = editorialPath(language, key);
    urls.push(`  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`);
  }
}
const journalHubAlternates = [alternate('x-default', `${origin}${travelGuideHubPath('en')}`), ...travelGuideLanguages.map((language) => alternate(travelGuideHreflang[language], `${origin}${travelGuideHubPath(language)}`))].join('\n');
for (const language of travelGuideLanguages) {
  urls.push(`  <url>\n    <loc>${origin}${travelGuideHubPath(language)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${journalHubAlternates}\n  </url>`);
}
for (const key of travelGuideKeys) {
  const alternates = [alternate('x-default', `${origin}${travelGuidePath('en', key)}`), ...travelGuideLanguages.map((language) => alternate(travelGuideHreflang[language], `${origin}${travelGuidePath(language, key)}`))].join('\n');
  for (const language of travelGuideLanguages) {
    urls.push(`  <url>\n    <loc>${origin}${travelGuidePath(language, key)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`);
  }
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
await writeFile(join(root, 'sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap with ${urls.length} URLs.`);
