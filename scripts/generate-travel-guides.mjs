import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  travelGuideHreflang,
  travelGuideHubPath,
  travelGuideLanguages,
  travelGuidePath,
} from './travel-guide-routes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://villavenerecetara.it';
const booking = 'https://book.octorate.com/octobook/site/reservation/index.xhtml?codice=679766';
const published = '2026-08-06';
const modified = process.env.GUIDES_LASTMOD || published;

const contentByLanguage = {};
for (const language of travelGuideLanguages) {
  contentByLanguage[language] = JSON.parse(
    await readFile(join(root, 'locales', 'journal', `${language}.json`), 'utf8'),
  );
}

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const jsonLd = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

function alternateLinks(key) {
  const links = key
    ? travelGuideLanguages.map((language) => [travelGuideHreflang[language], `${origin}${travelGuidePath(language, key)}`])
    : travelGuideLanguages.map((language) => [travelGuideHreflang[language], `${origin}${travelGuideHubPath(language)}`]);
  const xDefault = key ? `${origin}${travelGuidePath('en', key)}` : `${origin}${travelGuideHubPath('en')}`;
  return [
    `<link rel="alternate" hreflang="x-default" href="${xDefault}">`,
    ...links.map(([language, href]) => `<link rel="alternate" hreflang="${language}" href="${href}">`),
  ].join('');
}

function header(language, ui, activeGuides = true) {
  const home = `/${language}/`;
  const villa = language === 'it' ? '/it/villa-cetara/' : '/en/villa-cetara/';
  const experiences = language === 'it' ? '/it/esperienze-costiera-amalfitana/' : '/en/amalfi-coast-experiences/';
  return `<header class="journal-header">
  <a class="journal-brand" href="${home}"><img src="/assets/villa-logo-256.png" width="256" height="256" alt="Villa Venere"><span><strong>Villa Venere</strong><small>Cetara · Amalfi Coast</small></span></a>
  <nav aria-label="${language === 'it' ? 'Navigazione principale' : 'Main navigation'}">
    <a href="${home}">${esc(ui.home)}</a><a href="${villa}">${esc(ui.villa)}</a><a href="${experiences}">${esc(ui.experiences)}</a><a${activeGuides ? ' class="active" aria-current="page"' : ''} href="${travelGuideHubPath(language)}">${esc(ui.guides)}</a><a class="journal-book" href="${booking}&lang=${language}" rel="nofollow">${esc(ui.book)}</a>
  </nav>
</header>`;
}

function footer(language, ui) {
  return `<footer class="journal-footer"><div><a class="journal-footer-brand" href="/${language}/"><strong>Villa Venere</strong><span>Cetara · Amalfi Coast</span></a><p>${esc(ui.editorialNote)}</p></div><div><a href="tel:+393896840764">+39 389 684 0764</a><a href="mailto:info@villavenerecetara.com">info@villavenerecetara.com</a><span>CIN IT065041B49WWIMPWN</span></div></footer>`;
}

function card(language, guide, ui, featured = false) {
  return `<article class="journal-card${featured ? ' featured' : ''}"><a class="journal-card-image" href="${travelGuidePath(language, guide.key)}"><img src="${guide.image}" width="1600" height="1000" loading="lazy" decoding="async" alt="${esc(guide.alt)}"></a><div><p class="journal-card-meta"><span>${esc(guide.category)}</span><span>${guide.readTime} ${esc(ui.minutes)}</span></p><h2><a href="${travelGuidePath(language, guide.key)}">${esc(guide.title)}</a></h2><p>${esc(guide.description)}</p><a class="journal-read" href="${travelGuidePath(language, guide.key)}">${esc(ui.read)} <span aria-hidden="true">→</span></a></div></article>`;
}

function baseHead({ language, title, description, canonical, alternates, image, type = 'website', schema }) {
  return `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${canonical}">${alternates}
<meta property="og:type" content="${type}"><meta property="og:site_name" content="Villa Venere - Amalfi Coast"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}${image}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="256x256" href="/assets/villa-logo-256.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/travel-guides.css?v=1">
<script type="application/ld+json">${jsonLd(schema)}</script></head>`;
}

function hubHtml(language, data) {
  const { site: ui, guides } = data;
  const canonical = `${origin}${travelGuideHubPath(language)}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonical}#collection`,
        url: canonical,
        name: ui.name,
        description: ui.description,
        inLanguage: language,
        isPartOf: { '@id': `${origin}/#website` },
        mainEntity: { '@id': `${canonical}#list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${canonical}#list`,
        itemListElement: guides.map((guide, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${origin}${travelGuidePath(language, guide.key)}`,
          name: guide.title,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Villa Venere', item: `${origin}/${language}/` },
          { '@type': 'ListItem', position: 2, name: ui.name, item: canonical },
        ],
      },
    ],
  };
  return `<!doctype html><html lang="${language}">${baseHead({ language, title: `${ui.name} | Cetara e Costiera Amalfitana`, description: ui.description, canonical, alternates: alternateLinks(), image: '/assets/photo/hero-terrace.webp', schema })}<body>${header(language, ui)}
<main><section class="journal-hub-hero"><img src="/assets/photo/hero-terrace.webp" width="1800" height="1200" fetchpriority="high" alt="${language === 'it' ? 'Terrazza di Villa Venere sul mare di Cetara' : 'Villa Venere terrace overlooking the sea at Cetara'}"><div><p class="journal-eyebrow">${esc(ui.eyebrow)}</p><h1>${esc(ui.title)}</h1><p>${esc(ui.intro)}</p></div></section>
<section class="journal-manifesto"><blockquote>${esc(ui.manifesto)}</blockquote><nav aria-label="${language === 'it' ? 'Categorie delle guide' : 'Guide categories'}">${ui.categories.map((category) => `<span>${esc(category)}</span>`).join('')}</nav></section>
<section class="journal-index"><header><p class="journal-eyebrow">Villa Venere Journal</p><h2>${esc(ui.latest)}</h2></header><div class="journal-grid">${guides.map((guide, index) => card(language, guide, ui, index === 0)).join('')}</div></section>
<section class="journal-cta"><div><p class="journal-eyebrow">Villa Venere · Cetara</p><h2>${esc(ui.ctaTitle)}</h2><p>${esc(ui.ctaText)}</p></div><a href="${booking}&lang=${language}" rel="nofollow">${esc(ui.ctaButton)}</a></section></main>${footer(language, ui)}</body></html>`;
}

function guideHtml(language, data, guide) {
  const { site: ui, guides } = data;
  const canonical = `${origin}${travelGuidePath(language, guide.key)}`;
  const otherLanguage = language === 'it' ? 'en' : 'it';
  const related = guides.filter((item) => item.key !== guide.key).slice(0, 3);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${canonical}#article`,
        mainEntityOfPage: { '@id': `${canonical}#webpage` },
        headline: guide.title,
        description: guide.description,
        image: [`${origin}${guide.image}`],
        datePublished: published,
        dateModified: modified,
        inLanguage: language,
        author: { '@type': 'Organization', name: 'Villa Venere', url: `${origin}/${language}/` },
        publisher: { '@type': 'Organization', name: 'Villa Venere', url: `${origin}/`, logo: { '@type': 'ImageObject', url: `${origin}/assets/villa-logo-512.png` } },
        about: [
          { '@type': 'Place', name: 'Cetara' },
          { '@type': 'Place', name: 'Amalfi Coast' },
          { '@id': `${origin}/#villa` },
        ],
        isPartOf: { '@id': `${origin}${travelGuideHubPath(language)}#collection` },
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: guide.metaTitle,
        description: guide.description,
        inLanguage: language,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Villa Venere', item: `${origin}/${language}/` },
          { '@type': 'ListItem', position: 2, name: ui.name, item: `${origin}${travelGuideHubPath(language)}` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: canonical },
        ],
      },
    ],
  };
  const toc = guide.sections.map((section, index) => `<a href="#section-${index + 1}">${esc(section.title)}</a>`).join('');
  const sections = guide.sections.map((section, index) => `<section id="section-${index + 1}"><h2>${esc(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}${section.bullets ? `<ul>${section.bullets.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}</section>`).join('');
  const faq = guide.faqs.map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join('');
  return `<!doctype html><html lang="${language}">${baseHead({ language, title: guide.metaTitle, description: guide.description, canonical, alternates: alternateLinks(guide.key), image: guide.image, type: 'article', schema })}<body>${header(language, ui)}
<main><article class="travel-article"><nav class="journal-breadcrumb" aria-label="Breadcrumb"><a href="/${language}/">Villa Venere</a><span>›</span><a href="${travelGuideHubPath(language)}">${esc(ui.guides)}</a><span>›</span><span>${esc(guide.category)}</span></nav>
<header class="travel-hero"><div><p class="journal-eyebrow">${esc(guide.category)}</p><h1>${esc(guide.title)}</h1><p class="travel-dek">${esc(guide.intro)}</p><p class="travel-byline">${esc(ui.author)} · ${guide.readTime} ${esc(ui.minutes)} · ${esc(ui.updated)} <time datetime="${modified}">${language === 'it' ? '6 agosto 2026' : '6 August 2026'}</time></p></div><img src="${guide.image}" width="1600" height="1000" fetchpriority="high" alt="${esc(guide.alt)}"></header>
<div class="travel-layout"><aside class="travel-sidebar"><div><strong>${esc(ui.contents)}</strong>${toc}</div><a class="travel-language" href="${travelGuidePath(otherLanguage, guide.key)}">${esc(ui.languageSwitch)} →</a></aside>
<div class="travel-content"><section class="travel-answer"><p class="journal-eyebrow">${esc(ui.answer)}</p><p>${esc(guide.quickAnswer)}</p><ul>${guide.takeaways.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></section>${sections}
<aside class="from-villa"><p class="journal-eyebrow">${esc(ui.fromVilla)}</p><h2>${esc(ui.ctaTitle)}</h2><p>${esc(guide.villaBox)}</p><div><a href="/${language}/villa-cetara/">${esc(ui.villa)}</a><a class="primary" href="${booking}&lang=${language}" rel="nofollow">${esc(ui.book)}</a></div></aside>
<section class="travel-faq"><h2>${esc(ui.faq)}</h2>${faq}</section>
<section class="travel-sources"><h2>${esc(ui.sources)}</h2><p>${esc(ui.editorialNote)}</p><ul>${guide.sources.map((source) => `<li><a href="${source.url}" target="_blank" rel="noreferrer">${esc(source.label)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></section></div></div>
<section class="travel-related"><p class="journal-eyebrow">Villa Venere Journal</p><h2>${esc(ui.related)}</h2><div>${related.map((item) => card(language, item, ui)).join('')}</div></section></article>
<section class="journal-cta"><div><p class="journal-eyebrow">Villa Venere · Cetara</p><h2>${esc(ui.ctaTitle)}</h2><p>${esc(ui.ctaText)}</p></div><a href="${booking}&lang=${language}" rel="nofollow">${esc(ui.ctaButton)}</a></section></main>${footer(language, ui)}</body></html>`;
}

for (const language of travelGuideLanguages) {
  const data = contentByLanguage[language];
  const hubDirectory = join(root, ...travelGuideHubPath(language).split('/').filter(Boolean));
  await mkdir(hubDirectory, { recursive: true });
  await writeFile(join(hubDirectory, 'index.html'), hubHtml(language, data), 'utf8');

  for (const guide of data.guides) {
    const directory = join(root, ...travelGuidePath(language, guide.key).split('/').filter(Boolean));
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.html'), guideHtml(language, data, guide), 'utf8');
  }
}

console.log(`Generated ${travelGuideLanguages.length} journal hubs and ${travelGuideLanguages.length * contentByLanguage.it.guides.length} travel guides.`);
