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
for (const path of paths) {
  const html = await readFile(join(root, path), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
  if (!title || !canonical || !description) errors.push(`${path}: missing title, canonical or description`);
  if (title) {
    if (titles.has(title)) errors.push(`${path}: duplicate title with ${titles.get(title)}`);
    titles.set(title, path);
  }
  for (const match of html.matchAll(/<script(?: id="structured-data")? type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${path}: invalid JSON-LD (${error.message})`); }
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
