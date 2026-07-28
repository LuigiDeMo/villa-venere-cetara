import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://villavenerecetara.it';
const languages = ['en', 'it', 'fr', 'es', 'de', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'nl', 'pl'];
const hreflang = { en: 'en', it: 'it', fr: 'fr', es: 'es', de: 'de', pt: 'pt', ru: 'ru', zh: 'zh-Hans', ja: 'ja', ko: 'ko', ar: 'ar', nl: 'nl', pl: 'pl' };
const imagePaths = ['villa-view.jpg', '1661525798152.jpg', 'villa-gallery/01-villa-esterno.jpg', 'villa-gallery/02-villa-cucina.jpg', 'villa-gallery/03-villa-camera.jpg', 'villa-gallery/04-villa-terrazza.jpg', 'villa-gallery/camera-principale-vista-mare.jpg', 'villa-gallery/camera-principale-smart-tv.jpg'];
const pairs = [
  ['/it/villa-cetara/', '/en/villa-cetara/'],
  ['/it/accesso-privato-mare/', '/en/private-sea-access/'],
  ['/it/camere-servizi/', '/en/rooms-amenities/'],
  ['/it/come-arrivare/', '/en/getting-to-cetara/'],
];
const esc = (value) => value.replaceAll('&', '&amp;').replaceAll("'", '&apos;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const alternate = (lang, href) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;

const urls = [];
const rootAlternates = [alternate('x-default', `${origin}/`), ...languages.map((lang) => alternate(hreflang[lang], `${origin}/${lang}/`))].join('\n');
urls.push(`  <url>\n    <loc>${origin}/</loc>\n    <lastmod>2026-07-28</lastmod>\n${rootAlternates}\n${imagePaths.map((path) => `    <image:image><image:loc>${origin}/assets/${esc(path)}</image:loc></image:image>`).join('\n')}\n  </url>`);
for (const lang of languages) {
  urls.push(`  <url>\n    <loc>${origin}/${lang}/</loc>\n    <lastmod>2026-07-28</lastmod>\n${rootAlternates}\n  </url>`);
}
for (const [itPath, enPath] of pairs) {
  const alternates = [alternate('x-default', `${origin}${enPath}`), alternate('it', `${origin}${itPath}`), alternate('en', `${origin}${enPath}`)].join('\n');
  for (const path of [itPath, enPath]) urls.push(`  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>2026-07-28</lastmod>\n${alternates}\n  </url>`);
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
await writeFile(join(root, 'sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap with ${urls.length} URLs.`);
