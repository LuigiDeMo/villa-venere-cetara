import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const booking = 'https://book.octorate.com/octobook/site/reservation/index.xhtml?codice=679766';

const pages = [
  {
    key: 'villa', lang: 'it', slug: 'villa-cetara', alternate: '/en/villa-cetara/',
    title: 'Villa privata a Cetara | Villa Venere, Costiera Amalfitana',
    description: 'Scopri Villa Venere a Cetara: villa privata fronte mare con 3 camere, 2 bagni, terrazza panoramica e spazio per un massimo di 12 ospiti.',
    eyebrow: 'La villa', h1: 'Una villa privata sul mare a Cetara',
    intro: 'Villa Venere è una dimora a uso esclusivo affacciata sul mare di Cetara, nel cuore autentico della Costiera Amalfitana. È pensata per famiglie e gruppi che cercano privacy, spazi condivisi e un contatto diretto con il paesaggio costiero.',
    image: '/assets/villa-view.jpg', alt: 'Villa Venere affacciata sul mare di Cetara',
    sections: [
      ['Spazi per stare insieme', 'La villa dispone di tre camere da letto, due bagni moderni, un soggiorno con vista mare e una cucina attrezzata con piano a induzione. La terrazza panoramica è il centro della casa: uno spazio per colazioni, aperitivi e cene all’aperto guardando la Torre e il porto di Cetara.'],
      ['Capienza e disposizione dei letti', 'Può ospitare fino a 12 persone. Le tre camere comprendono letti matrimoniali; una camera dispone anche di divano letto e nel soggiorno sono presenti altri due divani letto. Ogni camera è dotata di Smart TV e aria condizionata.'],
      ['Una posizione rara in Costiera', 'La villa si trova vicino alle spiagge e al centro di Cetara, con ristoranti, bar, botteghe e collegamenti via traghetto raggiungibili a piedi. L’accesso privato al mare completa un soggiorno in cui casa, borgo e acqua sono parte della stessa esperienza.'],
    ],
    bullets: ['3 camere da letto', '2 bagni', 'Fino a 12 ospiti', 'Cucina a induzione attrezzata', 'Terrazza panoramica', 'Accesso privato al mare'],
  },
  {
    key: 'villa', lang: 'en', slug: 'villa-cetara', alternate: '/it/villa-cetara/',
    title: 'Private Villa in Cetara | Villa Venere, Amalfi Coast',
    description: 'Discover Villa Venere in Cetara: a private seafront villa with 3 bedrooms, 2 bathrooms, panoramic terrace and space for up to 12 guests.',
    eyebrow: 'The villa', h1: 'A private seafront villa in Cetara',
    intro: 'Villa Venere is an entire home overlooking the sea in Cetara, in the authentic heart of the Amalfi Coast. It is designed for families and groups looking for privacy, generous shared spaces and a close connection with the coast.',
    image: '/assets/villa-view.jpg', alt: 'Villa Venere overlooking the sea in Cetara',
    sections: [
      ['Space to be together', 'The villa has three bedrooms, two modern bathrooms, a sea-view living room and a fully equipped induction kitchen. Its panoramic terrace is the heart of the house: a private setting for breakfast, sunset drinks and outdoor dinners overlooking Cetara’s tower and harbour.'],
      ['Capacity and sleeping arrangements', 'Villa Venere accommodates up to 12 guests. The three bedrooms include double beds; one bedroom also has a sofa bed and the living room has two further sofa beds. Every bedroom offers a Smart TV and air conditioning.'],
      ['A rare Amalfi Coast location', 'The villa is close to Cetara’s beaches and village centre, where restaurants, cafés, food shops and ferry connections are within walking distance. Private access to the sea completes a stay where the home, village and water belong to one experience.'],
    ],
    bullets: ['3 bedrooms', '2 bathrooms', 'Up to 12 guests', 'Equipped induction kitchen', 'Panoramic terrace', 'Private sea access'],
  },
  {
    key: 'sea', lang: 'it', slug: 'accesso-privato-mare', alternate: '/en/private-sea-access/',
    title: 'Villa con accesso privato al mare a Cetara | Villa Venere',
    description: 'Villa Venere offre accesso privato al mare a Cetara, banchina con doccia e lettini, terrazza panoramica, SUP, pedalò e due kayak.',
    eyebrow: 'Il mare', h1: 'Accesso privato al mare in Costiera Amalfitana',
    intro: 'Poter raggiungere il mare direttamente dalla propria villa è uno dei tratti più rari di Villa Venere. Una scala conduce alla banchina privata sul tratto di costa davanti alla casa, senza dover organizzare ogni giornata intorno a uno stabilimento balneare.',
    image: '/assets/villa-gallery/04-villa-terrazza.jpg', alt: 'Terrazza panoramica di Villa Venere sul mare',
    sections: [
      ['La banchina privata', 'Lo spazio sul mare dispone di doccia e lettini ed è riservato agli ospiti della villa. È il punto da cui entrare in acqua, prendere il sole o semplicemente osservare la costa dal basso. L’accesso presenta scale e il naturale contesto roccioso della Costiera.'],
      ['Kayak, SUP e pedalò', 'Sono disponibili gratuitamente due kayak, SUP e un pedalò per esplorare le acque vicine quando le condizioni del mare lo consentono. Per sicurezza è sempre importante valutare meteo, mare e capacità personali prima di uscire.'],
      ['Terrazza sospesa sul blu', 'La terrazza privata completa l’esperienza: vista aperta sul mare, sulla Torre Vicereale e sul porto di Cetara. È uno spazio adatto a rilassarsi, cenare all’aperto e vivere la costa anche quando non si è in acqua.'],
    ],
    bullets: ['Banchina privata', 'Doccia e lettini', '2 kayak gratuiti', 'SUP gratuiti', 'Pedalò gratuito', 'Terrazza vista mare', 'Spiagge a circa 50 metri'],
  },
  {
    key: 'sea', lang: 'en', slug: 'private-sea-access', alternate: '/it/accesso-privato-mare/',
    title: 'Villa with Private Sea Access in Cetara | Villa Venere',
    description: 'Villa Venere offers private sea access in Cetara, a dock with shower and loungers, panoramic terrace, SUP boards, pedal boat and two kayaks.',
    eyebrow: 'The sea', h1: 'Private access to the sea on the Amalfi Coast',
    intro: 'Walking directly from your villa to the water is one of Villa Venere’s rarest features. Steps lead to a private dock on the coast below the house, giving guests the freedom to enjoy the sea without planning every day around a beach club.',
    image: '/assets/villa-gallery/04-villa-terrazza.jpg', alt: 'Villa Venere panoramic terrace above the sea',
    sections: [
      ['Your private dock', 'The seafront area has a shower and loungers and is reserved for guests of the villa. It is a place for swimming, sunbathing or simply seeing the coast from the waterline. Access includes stairs and the naturally rocky terrain typical of the Amalfi Coast.'],
      ['Kayaks, SUP boards and pedal boat', 'Two kayaks, SUP boards and a pedal boat are available free of charge for exploring nearby waters whenever sea conditions allow. Guests should always consider the weather, the sea and their personal ability before going out.'],
      ['A terrace suspended above the blue', 'The private terrace completes the experience with open views of the sea, Cetara’s historic tower and harbour. It is made for slow breakfasts, outdoor dinners and evenings spent watching the coastline.'],
    ],
    bullets: ['Private dock', 'Shower and loungers', '2 complimentary kayaks', 'Complimentary SUP boards', 'Complimentary pedal boat', 'Sea-view terrace', 'Beaches about 50 metres away'],
  },
  {
    key: 'rooms', lang: 'it', slug: 'camere-servizi', alternate: '/en/rooms-amenities/',
    title: 'Villa per 12 persone in Costiera Amalfitana | Camere e servizi',
    description: 'Tre camere vista mare, sei posti letto configurabili, due bagni, cucina, Wi-Fi, aria condizionata, Smart TV, jacuzzi e terrazza.',
    eyebrow: 'Camere e servizi', h1: 'Villa in Costiera Amalfitana per famiglie e gruppi fino a 12 ospiti',
    intro: 'Villa Venere viene affittata come intera casa, non per singola camera. Gli ospiti condividono gli ambienti con il proprio gruppo e possono organizzare il soggiorno con la libertà di una casa privata.',
    image: '/assets/villa-gallery/camera-principale-vista-mare.jpg', alt: 'Camera matrimoniale vista mare di Villa Venere',
    sections: [
      ['Le tre camere', 'La prima camera dispone di letto matrimoniale. La seconda offre un letto matrimoniale e un divano letto; la terza ha un letto matrimoniale. Nel soggiorno si trovano due ulteriori divani letto. Tutte le camere sono dotate di Smart TV, aria condizionata e vista mare.'],
      ['Cucina, soggiorno e bagni', 'La cucina con piano a induzione è attrezzata per preparare i pasti. Il soggiorno permette di mangiare e rilassarsi guardando il mare. I bagni sono due e una lavatrice è disponibile in casa.'],
      ['Dotazioni per il soggiorno', 'Wi-Fi gratuito ad alta velocità, biancheria, asciugamani, asciugacapelli, terrazza privata e vasca idromassaggio completano le dotazioni principali. Per esigenze specifiche è consigliabile contattare Martina prima della prenotazione.'],
    ],
    bullets: ['6 letti complessivi', 'Smart TV nelle camere', 'Wi-Fi ad alta velocità', 'Aria condizionata', 'Lavatrice', 'Vasca idromassaggio'],
  },
  {
    key: 'rooms', lang: 'en', slug: 'rooms-amenities', alternate: '/it/camere-servizi/',
    title: 'Rooms and Amenities at Villa Venere Cetara | Up to 12 Guests',
    description: 'Three sea-view bedrooms, six beds, two bathrooms, kitchen, Wi-Fi, air conditioning, Smart TVs, hot tub and panoramic terrace.',
    eyebrow: 'Rooms and amenities', h1: 'Comfortable spaces for families and groups',
    intro: 'Villa Venere is rented as an entire home rather than room by room. Guests share the property only with their own group and can enjoy the flexibility and privacy of a fully independent stay.',
    image: '/assets/villa-gallery/camera-principale-vista-mare.jpg', alt: 'Sea-view double bedroom at Villa Venere',
    sections: [
      ['The three bedrooms', 'Bedroom one has a double bed. Bedroom two has a double bed and one sofa bed, while bedroom three has a double bed. Two additional sofa beds are in the living room. Every bedroom offers a Smart TV, air conditioning and a sea view.'],
      ['Kitchen, living room and bathrooms', 'The equipped kitchen includes an induction hob for preparing meals. The living room is a comfortable place to eat and relax while looking out to sea. There are two bathrooms and a washing machine is available in the villa.'],
      ['Amenities for your stay', 'Complimentary high-speed Wi-Fi, linen, towels, hair dryers, a private terrace and a hot tub complete the main amenities. If your group has a specific requirement, contact Martina before booking so it can be checked personally.'],
    ],
    bullets: ['6 beds in total', 'Smart TVs in bedrooms', 'High-speed Wi-Fi', 'Air conditioning', 'Washing machine', 'Hot tub'],
  },
  {
    key: 'location', lang: 'it', slug: 'come-arrivare', alternate: '/en/getting-to-cetara/',
    title: 'Come arrivare a Villa Venere Cetara | Traghetti, bus e parcheggio',
    description: 'Come arrivare a Villa Venere: bus e traghetti vicini, posti gratuiti lungo la strada, parcheggio convenzionato e servizio gratuito di ritiro auto.',
    eyebrow: 'Come arrivare', h1: 'Raggiungere Villa Venere e muoversi da Cetara',
    intro: 'Villa Venere si trova in Via Lannio 8, vicino al centro di Cetara. La posizione consente di muoversi a piedi nel borgo e di usare traghetti e autobus per visitare la Costiera Amalfitana senza dipendere ogni giorno dall’auto.',
    image: '/assets/1661525798152.jpg', alt: 'Via Lannio a Cetara vicino a Villa Venere',
    sections: [
      ['Traghetto e autobus', 'Il terminal traghetti dista circa 230 metri e la fermata dell’autobus circa 84 metri. In stagione i collegamenti marittimi sono spesso il modo più panoramico per raggiungere altre località della costa; orari e corse vanno sempre verificati con gli operatori.'],
      ['Arrivare in auto e parcheggiare', 'La villa non dispone di parcheggio privato. È possibile cercare posto gratuitamente lungo la strada, compatibilmente con la disponibilità, oppure utilizzare il parcheggio convenzionato a pagamento nel centro di Cetara. Per gli ospiti che non intendono usare l’auto durante il soggiorno è disponibile anche un servizio gratuito: l’auto viene ritirata al check-in e riconsegnata al check-out. In estate traffico e disponibilità dei posti possono cambiare rapidamente.'],
      ['Transfer e check-in', 'Martina può aiutare a valutare taxi, navetta o transfer da Napoli, Salerno, aeroporti e stazioni. Il check-in è normalmente dalle 15:00, dopo le pulizie; chi arriva prima può chiedere di lasciare i bagagli mentre visita il paese.'],
    ],
    bullets: ['Via Lannio 8, Cetara', 'Bus a circa 84 m', 'Traghetti a circa 230 m', 'Posti gratuiti lungo la strada', 'Parcheggio convenzionato a pagamento', 'Ritiro auto gratuito su richiesta'],
  },
  {
    key: 'location', lang: 'en', slug: 'getting-to-cetara', alternate: '/it/come-arrivare/',
    title: 'Getting to Villa Venere Cetara | Ferries, Buses and Parking',
    description: 'Directions to Villa Venere: nearby buses and ferries, free roadside spaces, partner paid parking and complimentary car collection.',
    eyebrow: 'Getting here', h1: 'How to reach Villa Venere and explore from Cetara',
    intro: 'Villa Venere is at Via Lannio 8, close to Cetara’s village centre. Its position makes it possible to walk around the village and use ferries or buses to explore the Amalfi Coast without relying on a car every day.',
    image: '/assets/1661525798152.jpg', alt: 'Via Lannio in Cetara near Villa Venere',
    sections: [
      ['Ferries and buses', 'The ferry terminal is about 230 metres away and the bus stop about 84 metres away. In season, travelling by sea is often the most scenic way to reach other towns on the coast; schedules and services should always be checked with the operators.'],
      ['Arriving by car and parking', 'The villa does not have private parking. Guests may look for free spaces along the public road, subject to availability, or use the partner paid car park in Cetara village centre. Guests who do not plan to use their car during the stay can also request a complimentary service: the car is collected at check-in and returned at check-out. Summer traffic and parking availability can change quickly.'],
      ['Transfers and check-in', 'Martina can help guests compare taxis, shuttles and transfers from Naples, Salerno, airports or railway stations. Check-in is normally from 3:00 pm after cleaning; early arrivals can ask to leave their luggage while they begin exploring Cetara.'],
    ],
    bullets: ['Via Lannio 8, Cetara', 'Bus stop about 84 m', 'Ferry terminal about 230 m', 'Free roadside spaces', 'Partner paid parking', 'Complimentary car collection'],
  },
  {
    key: 'experiences', lang: 'it', slug: 'esperienze-costiera-amalfitana', alternate: '/en/amalfi-coast-experiences/',
    title: 'Esperienze in Costiera Amalfitana da Cetara | Villa Venere',
    description: 'Martina aiuta gli ospiti di Villa Venere a organizzare tour in barca, escursioni private, Pompei, Ravello e chef a domicilio con partner locali.',
    eyebrow: 'Concierge ed esperienze', h1: 'Scoprire la Costiera, dal mare e dalla terra',
    intro: 'Soggiornare a Villa Venere significa avere Cetara come punto di partenza e Martina come riferimento personale. Su richiesta, può aiutare gli ospiti a valutare esperienze e itinerari con partner locali selezionati, in base al periodo, alle condizioni e alle esigenze del gruppo.',
    image: '/assets/photo/concierge-sea.webp', alt: 'Barca in navigazione lungo la Costiera Amalfitana',
    sections: [
      ['Amalfi, Positano e Capri dal mare', 'Tour in barca condivisi o privati permettono di osservare la costa dall’acqua, raggiungere Amalfi e Positano e, quando itinerario e condizioni lo consentono, navigare verso Capri. Disponibilità, partenza, durata e servizi inclusi vengono verificati al momento della richiesta.'],
      ['Pompei, Ercolano, Vesuvio e Ravello', 'Martina può aiutare a organizzare trasferimenti e giornate private verso Pompei, Ercolano e il Vesuvio, oppure itinerari panoramici tra Amalfi, Positano, Ravello, Villa Rufolo e Villa Cimbrone. Le soluzioni vengono adattate al numero di ospiti e al tempo disponibile.'],
      ['Esperienze private a Villa Venere', 'Per chi preferisce vivere la casa, è possibile chiedere informazioni su chef privati e proposte gastronomiche personalizzate. Tutte le esperienze sono organizzate su richiesta con operatori indipendenti selezionati e restano soggette a disponibilità e condizioni del fornitore.'],
    ],
    bullets: ['Tour in barca in Costiera', 'Capri su richiesta', 'Van e transfer privati', 'Pompei ed Ercolano', 'Ravello e le sue ville', 'Chef privato in villa'],
  },
  {
    key: 'experiences', lang: 'en', slug: 'amalfi-coast-experiences', alternate: '/it/esperienze-costiera-amalfitana/',
    title: 'Amalfi Coast Experiences from Cetara | Villa Venere',
    description: 'Martina helps Villa Venere guests arrange boat tours, private day trips, Pompeii, Ravello and in-villa chefs with selected local partners.',
    eyebrow: 'Concierge and experiences', h1: 'Explore the Amalfi Coast by sea and by land',
    intro: 'A stay at Villa Venere gives guests Cetara as a starting point and Martina as a personal local contact. On request, she can help compare experiences and itineraries with selected local partners according to the season, conditions and needs of each group.',
    image: '/assets/photo/concierge-sea.webp', alt: 'Boat cruising along the Amalfi Coast',
    sections: [
      ['Amalfi, Positano and Capri by sea', 'Shared and private boat tours offer a different view of the coastline, with options for Amalfi and Positano and, when the itinerary and conditions allow, Capri. Availability, departure point, duration and included services are confirmed when guests enquire.'],
      ['Pompeii, Herculaneum, Vesuvius and Ravello', 'Martina can help arrange transfers and private days to Pompeii, Herculaneum and Mount Vesuvius, or panoramic itineraries through Amalfi, Positano, Ravello, Villa Rufolo and Villa Cimbrone. Options are tailored to group size and available time.'],
      ['Private experiences at Villa Venere', 'Guests who prefer to enjoy the villa can ask about private chefs and personalised Mediterranean dining. Experiences are organised on request with independent selected providers and remain subject to their availability and terms.'],
    ],
    bullets: ['Amalfi Coast boat tours', 'Capri on request', 'Private vans and transfers', 'Pompeii and Herculaneum', 'Ravello and its villas', 'Private chef at the villa'],
  },
];

const esc = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function pageHtml(page) {
  const url = `https://villavenerecetara.it/${page.lang}/${page.slug}/`;
  const home = `/${page.lang}/`;
  const isIt = page.lang === 'it';
  const guides = isIt
    ? [['Villa privata a Cetara', '/it/villa-cetara/'], ['Accesso privato al mare', '/it/accesso-privato-mare/'], ['Camere e servizi', '/it/camere-servizi/'], ['Come arrivare', '/it/come-arrivare/'], ['Esperienze in Costiera', '/it/esperienze-costiera-amalfitana/']]
    : [['Private villa in Cetara', '/en/villa-cetara/'], ['Private sea access', '/en/private-sea-access/'], ['Rooms and amenities', '/en/rooms-amenities/'], ['Getting to Cetara', '/en/getting-to-cetara/'], ['Amalfi Coast experiences', '/en/amalfi-coast-experiences/']];
  const faqs = isIt
    ? [
      ['Villa Venere viene affittata interamente?', 'Sì. Gli ospiti hanno l’intera villa a uso esclusivo; le camere non vengono affittate separatamente.'],
      ['Quante persone può ospitare?', 'La villa può ospitare fino a 12 persone, con tre camere matrimoniali e tre divani letto distribuiti tra una camera e il soggiorno.'],
      ['La villa ha accesso privato al mare?', 'Sì. Una scala conduce alla banchina privata con doccia e lettini. L’accesso comprende scale e il naturale contesto roccioso della Costiera.'],
      ['È adatta a famiglie e gruppi?', 'Sì. Tre camere, due bagni, cucina attrezzata, soggiorno e terrazza permettono a famiglie e gruppi di condividere il soggiorno mantenendo spazi comodi.'],
      ['Dove si parcheggia?', 'La villa non ha parcheggio privato. Si può cercare posto gratuitamente lungo la strada oppure utilizzare il parcheggio convenzionato a pagamento in paese. Se non si usa l’auto durante il soggiorno, su richiesta viene ritirata gratuitamente al check-in e riconsegnata al check-out.'],
      ['Quanto distano spiagge, autobus e traghetti?', 'Le spiagge sono a circa 50 metri, la fermata dell’autobus a circa 84 metri e il terminal traghetti a circa 230 metri.'],
      ['Sono disponibili kayak, SUP e pedalò?', 'Due kayak, SUP e un pedalò sono disponibili gratuitamente quando le condizioni del mare e della sicurezza lo consentono.'],
      ['Come posso verificare disponibilità e prezzo?', 'Puoi usare il sistema di prenotazione ufficiale oppure scrivere direttamente a Martina indicando date e numero di ospiti.'],
    ]
    : [
      ['Is Villa Venere rented as an entire property?', 'Yes. Guests have exclusive use of the entire villa; individual rooms are not rented separately.'],
      ['How many guests can the villa accommodate?', 'The villa accommodates up to 12 guests, with three double bedrooms and three sofa beds split between one bedroom and the living room.'],
      ['Does the villa have private access to the sea?', 'Yes. Steps lead to a private dock with a shower and loungers. Access includes stairs and the naturally rocky Amalfi Coast setting.'],
      ['Is it suitable for families and groups?', 'Yes. Three bedrooms, two bathrooms, an equipped kitchen, living room and terrace provide comfortable shared spaces for families and groups.'],
      ['Where can guests park?', 'The villa has no private parking. Guests can look for free roadside spaces or use the partner paid car park in the village. Those who will not use their car during the stay can request complimentary collection at check-in and return at check-out.'],
      ['How far are the beaches, bus stop and ferry terminal?', 'The beaches are about 50 metres away, the bus stop about 84 metres and the ferry terminal about 230 metres.'],
      ['Are kayaks, SUP boards and a pedal boat available?', 'Two kayaks, SUP boards and one pedal boat are complimentary whenever sea and safety conditions allow.'],
      ['How can I check availability and price?', 'Use the official booking system or contact Martina directly with your dates and number of guests.'],
    ];
  const faqHtml = page.key === 'villa' ? `<section class="article-faq"><h2>${isIt ? 'Domande frequenti sulla villa' : 'Frequently asked questions about the villa'}</h2>${faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</section>` : '';
  const schema = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: page.lang, about: { '@id': 'https://villavenerecetara.it/#villa' } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Villa Venere', item: `https://villavenerecetara.it${home}` },
        { '@type': 'ListItem', position: 2, name: page.h1, item: url },
      ] },
    ],
  };
  return `<!doctype html>
<html lang="${page.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(page.title)}</title><meta name="description" content="${esc(page.description)}"><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${url}"><link rel="alternate" hreflang="${page.lang}" href="${url}"><link rel="alternate" hreflang="${page.lang === 'it' ? 'en' : 'it'}" href="https://villavenerecetara.it${page.alternate}"><link rel="alternate" hreflang="x-default" href="https://villavenerecetara.it/en/">
<meta property="og:type" content="article"><meta property="og:site_name" content="Villa Venere - Amalfi Coast"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://villavenerecetara.it${page.image}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="256x256" href="/assets/villa-logo-256.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/seo-pages.css?v=2">
<script type="application/ld+json">${JSON.stringify(schema)}</script></head><body>
<header class="article-header"><a class="article-brand" href="${home}"><img src="/assets/villa-logo-256.png" width="256" height="256" alt="Villa Venere"><span><strong>Villa Venere</strong><small>Cetara · Amalfi Coast</small></span></a><nav><a href="${home}">${isIt ? 'Pagina iniziale' : 'Home'}</a><a href="${home}#rooms">${isIt ? 'Camere' : 'Rooms'}</a><a href="${home}#services">${isIt ? 'Servizi' : 'Amenities'}</a><a class="book" href="${booking}&lang=${page.lang}" rel="nofollow">${isIt ? 'Prenota ora' : 'Book now'}</a></nav></header>
<main><article><div class="article-hero"><div><p class="eyebrow">${esc(page.eyebrow)}</p><h1>${esc(page.h1)}</h1><p class="lead">${esc(page.intro)}</p></div><img src="${page.image}" width="1600" height="900" fetchpriority="high" alt="${esc(page.alt)}"></div>
<div class="article-body"><aside><h2>${isIt ? 'In breve' : 'At a glance'}</h2><ul>${page.bullets.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><a href="${booking}&lang=${page.lang}" rel="nofollow">${isIt ? 'Verifica disponibilità' : 'Check availability'}</a></aside><div class="article-copy">${page.sections.map(([title, text]) => `<section><h2>${esc(title)}</h2><p>${esc(text)}</p></section>`).join('')}${faqHtml}</div></div>
<nav class="article-related" aria-label="${isIt ? 'Approfondimenti' : 'Related guides'}"><div><strong>${isIt ? 'Guide ufficiali' : 'Official guides'}</strong>${guides.map(([label, href]) => `<a href="${href}">${esc(label)}</a>`).join('')}</div><div><a href="${home}">← ${isIt ? 'Torna alla villa' : 'Back to the villa'}</a><a href="${page.alternate}">${isIt ? 'Read in English' : 'Leggi in italiano'} →</a></div></nav></article></main>
<footer><div><strong>Villa Venere</strong><span>Via Lannio 8 · 84010 Cetara (SA) · Italia</span><span>CIN IT065041B49WWIMPWN</span><a href="https://www.cetaraturistica.it/soggiornare/case-per-vacanze/villa-venere" target="_blank" rel="noreferrer">${isIt ? 'Portale turistico ufficiale di Cetara' : 'Official Cetara tourism portal'}</a></div><div><a href="tel:+393896840764">+39 389 684 0764</a><a href="mailto:info@villavenerecetara.com">info@villavenerecetara.com</a></div></footer></body></html>`;
}

for (const page of pages) {
  const directory = join(root, page.lang, page.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), pageHtml(page), 'utf8');
}

console.log(`Generated ${pages.length} editorial SEO pages.`);
