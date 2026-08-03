import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const host = 'villavenerecetara.it';
const key = 'b14f0d9a6c7e4b3285d1a9f0c6e2b743';
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/villavenerecetara\.it\/[^<]*)<\/loc>/g)].map((match) => match[1]);

if (!urlList.length) throw new Error('No canonical URLs found in sitemap.xml');

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList,
  }),
});

if (!response.ok && response.status !== 202) {
  throw new Error(`IndexNow returned ${response.status}: ${await response.text()}`);
}
console.log(`IndexNow accepted ${urlList.length} URLs (HTTP ${response.status}).`);
