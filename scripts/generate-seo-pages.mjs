import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const languages = ['en', 'it', 'fr', 'es', 'de', 'pt'];
const seo = {
  en: { title: 'Villa Venere Cetara | Private Villa on the Amalfi Coast', description: 'Stay at Villa Venere, a private sea-view villa in Cetara with 3 bedrooms, panoramic terrace and private access to the sea. Check availability and book direct.', locale: 'en_US' },
  it: { title: 'Villa Venere Cetara | Villa privata in Costiera Amalfitana', description: 'Soggiorna a Villa Venere, villa privata vista mare a Cetara con 3 camere, terrazza panoramica e accesso privato al mare. Verifica la disponibilità.', locale: 'it_IT' },
  fr: { title: 'Villa Venere Cetara | Villa privée sur la Côte Amalfitaine', description: 'Séjournez à Villa Venere, une villa privée avec vue sur la mer à Cetara, 3 chambres, terrasse panoramique et accès privé à la mer.', locale: 'fr_FR' },
  es: { title: 'Villa Venere Cetara | Villa privada en la Costa Amalfitana', description: 'Alójate en Villa Venere, una villa privada con vistas al mar en Cetara, 3 dormitorios, terraza panorámica y acceso privado al mar.', locale: 'es_ES' },
  de: { title: 'Villa Venere Cetara | Private Villa an der Amalfiküste', description: 'Villa Venere ist eine private Villa mit Meerblick in Cetara, 3 Schlafzimmern, Panoramaterrasse und privatem Zugang zum Meer.', locale: 'de_DE' },
  pt: { title: 'Villa Venere Cetara | Villa privada na Costa Amalfitana', description: 'Fique na Villa Venere, uma villa privada com vista para o mar em Cetara, 3 quartos, terraço panorâmico e acesso privado ao mar.', locale: 'pt_PT' },
};

function valueAt(dictionary, key) {
  return key.split('.').reduce((value, part) => value?.[part], dictionary);
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function localize(template, language, dictionary) {
  const meta = seo[language];
  const canonical = `https://villavenerecetara.it/${language}/`;
  let html = template
    .replace('<html lang="en"', `<html lang="${language}"`)
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
