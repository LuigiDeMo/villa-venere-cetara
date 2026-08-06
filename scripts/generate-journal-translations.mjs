import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { travelGuideLanguages } from './travel-guide-routes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(await readFile(join(root, 'locales', 'journal', 'en.json'), 'utf8'));
const requestedTargets = process.env.JOURNAL_TARGETS?.split(',').map((language) => language.trim()).filter(Boolean);
const targets = (requestedTargets?.length ? requestedTargets : travelGuideLanguages)
  .filter((language) => !['en', 'it'].includes(language));
const googleLanguage = { zh: 'zh-CN' };
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const protectedTerms = new Map([
  ['Villa Venere', '__VV_BRAND_VILLA_VENERE__'],
  ['Martina', '__VV_HOST_MARTINA__'],
  ['Cetara', '__VV_PLACE_CETARA__'],
]);
const localeOverrides = {
  fr: { siteName: 'Guides de Villa Venere', coastBySeaDescription: 'Comment visiter Amalfi et Positano depuis Cetara : ferry ou bateau privé, itinéraire équilibré, trajet retour et solution de repli en cas de mauvais temps.' },
  es: { siteName: 'Guías de Villa Venere' },
  de: { siteName: 'Villa Venere Reiseführer' },
  pt: { siteName: 'Guias da Villa Venere' },
  ru: { siteName: 'Путеводители Villa Venere' },
  zh: { siteName: 'Villa Venere 旅行指南' },
  ja: { siteName: 'Villa Venere 旅行ガイド' },
  ko: { siteName: 'Villa Venere 여행 가이드' },
  ar: { siteName: 'أدلة Villa Venere السياحية' },
  nl: { siteName: 'Reisgidsen van Villa Venere' },
  pl: { siteName: 'Przewodniki Villa Venere' },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isTranslatable(path, value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const leaf = path.at(-1);
  if (['key', 'image', 'url', 'source', 'licenseUrl', 'author', 'license'].includes(leaf)) return false;
  if (path.includes('imageCredit')) return false;
  return true;
}

function collect(value, path = [], output = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collect(item, [...path, index], output));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => collect(item, [...path, key], output));
  } else if (isTranslatable(path, value)) {
    output.push({ path, text: value });
  }
  return output;
}

function setAtPath(target, path, value) {
  let current = target;
  for (const part of path.slice(0, -1)) current = current[part];
  current[path.at(-1)] = value;
}

function makeBatches(entries, maximumLength = 2600) {
  const batches = [];
  let batch = [];
  let length = 0;
  for (const entry of entries) {
    const addition = entry.text.length + 20;
    if (batch.length && length + addition > maximumLength) {
      batches.push(batch);
      batch = [];
      length = 0;
    }
    batch.push(entry);
    length += addition;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

async function translateBatch(batch, language) {
  const protect = (text) => [...protectedTerms].reduce((current, [term, token]) => current.replaceAll(term, token), text);
  const restore = (text) => [...protectedTerms].reduce(
    (current, [term, token]) => current.replaceAll(token, term),
    text.replace(/[\u200B-\u200D\uFEFF]/g, ''),
  );
  const input = batch.map((entry, index) => `[[VV${String(index).padStart(4, '0')}]]${protect(entry.text)}`).join('\n');
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.search = new URLSearchParams({ client: 'gtx', sl: 'en', tl: googleLanguage[language] || language, dt: 't', q: input });
  let response;
  for (let attempt = 1; attempt <= 4; attempt++) {
    response = await fetch(url, { headers: { 'User-Agent': 'VillaVenereTranslationBuilder/1.0' } });
    if (response.ok) break;
    if (attempt === 4) throw new Error(`Translation request failed for ${language}: HTTP ${response.status}`);
    await sleep(attempt * 800);
  }
  const data = await response.json();
  const translated = data[0].map((part) => part[0]).join('');
  const matches = [...translated.matchAll(/\[\[VV(\d{4})\]\]([\s\S]*?)(?=\[\[VV\d{4}\]\]|$)/g)];
  if (matches.length !== batch.length) {
    throw new Error(`Marker mismatch for ${language}: expected ${batch.length}, received ${matches.length}`);
  }
  return matches.map((match) => restore(match[2].trim()));
}

const entries = collect(source);
const batches = makeBatches(entries);
await mkdir(join(root, 'locales', 'journal'), { recursive: true });

for (const language of targets) {
  const translatedData = clone(source);
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 3) {
    const group = batches.slice(batchIndex, batchIndex + 3);
    const results = await Promise.all(group.map((batch) => translateBatch(batch, language)));
    results.forEach((translated, groupIndex) => translated.forEach((text, index) => setAtPath(translatedData, group[groupIndex][index].path, text)));
    process.stdout.write(`\r${language}: ${Math.min(batchIndex + group.length, batches.length)}/${batches.length}`);
    await sleep(120);
  }
  translatedData.site.name = localeOverrides[language]?.siteName || translatedData.site.name;
  const coastBySea = translatedData.guides.find((guide) => guide.key === 'coastBySea');
  if (localeOverrides[language]?.coastBySeaDescription) coastBySea.description = localeOverrides[language].coastBySeaDescription;
  await writeFile(join(root, 'locales', 'journal', `${language}.json`), `${JSON.stringify(translatedData, null, 2)}\n`, 'utf8');
  process.stdout.write(`\r${language}: complete${' '.repeat(20)}\n`);
}

console.log(`Generated ${targets.length} complete journal translations from ${entries.length} translatable strings.`);
