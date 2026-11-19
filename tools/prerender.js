// Pagine "già scritte" per Google.
// Per ogni data, articolo e artista (italiano e inglese) crea un file HTML con dentro il testo,
// titolo e descrizione giusti, indirizzo ufficiale e le schede per Google (dati strutturati).
// Riempie anche gli elenchi di Date, Artisti, News e della home. Il JavaScript del sito, all'avvio,
// riscrive gli stessi contenuti: chi visita non vede differenze, Google trova il testo subito.
//
// Uso, dalla cartella del sito, con il server di prova acceso (python3 -I tools/server.py .):
//   NODE_PATH=<cartella con puppeteer-core> node tools/prerender.js
// Va rilanciato dopo ogni modifica a data.js / data-en.js / pagine, e dopo tools/make_en.py.

const puppeteer = require('puppeteer-core');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), BASE = 'http://127.0.0.1:8765', SITE = 'https://discopleasure.com';
const VENUE = {
  '@type': 'Place', name: 'Chalet Valentino',
  address: { '@type': 'PostalAddress', streetAddress: 'Viale delle Gravare snc', addressLocality: 'Roccaraso', postalCode: '67037', addressRegion: 'AQ', addressCountry: 'IT' },
  geo: { '@type': 'GeoCoordinates', latitude: 41.8195, longitude: 14.0368 },
};
const ORG = { '@type': 'Organization', name: 'Disco Pleasure', url: SITE + '/' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cut = (s, n = 155) => { s = String(s).replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const t = s.slice(0, n - 1); return t.slice(0, t.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…'; };
const abs = (u) => (u && u.startsWith('/') ? SITE + u : u);

// testa della pagina: titolo, descrizione, anteprima, indirizzo ufficiale, lingue, dati strutturati
function setHead(html, { title, desc, url, image, alt, itUrl, enUrl, jsonld }) {
  const rep = (re, val) => { html = html.replace(re, val); };
  rep(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  rep(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
  rep(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`);
  rep(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`);
  rep(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(desc)}">`);
  rep(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  rep(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(SITE + url)}">`);
  if (image) {
    rep(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(abs(image))}">`);
    rep(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${esc(abs(image))}">`);
    // le misure 1200x630 valgono solo per l'immagine standard
    if (!/og-home/.test(image)) html = html.replace(/<meta property="og:image:width"[^>]*>\n?/, '').replace(/<meta property="og:image:height"[^>]*>\n?/, '');
  }
  if (alt) rep(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${esc(alt)}">`);
  html = html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?/g, '').replace(/<link rel="canonical"[^>]*>\n?/g, '').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');
  const links = [
    itUrl && `<link rel="alternate" hreflang="it" href="${esc(SITE + itUrl)}">`,
    enUrl && `<link rel="alternate" hreflang="en" href="${esc(SITE + enUrl)}">`,
    itUrl && `<link rel="alternate" hreflang="x-default" href="${esc(SITE + itUrl)}">`,
    `<link rel="canonical" href="${esc(SITE + url)}">`,
    jsonld && `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>`,
  ].filter(Boolean).join('\n');
  return html.replace('<link rel="icon"', links + '\n<link rel="icon"');
}
// riempie un contenitore <tag id="..."> con l'HTML dato (sostituisce tutto il contenuto, anche quello annidato)
function fill(html, id, inner) {
  const open = new RegExp(`<([a-z0-9]+)[^>]*\\bid="${id}"[^>]*>`).exec(html);
  if (!open) throw new Error('contenitore non trovato: ' + id);
  const tag = open[1], start = open.index + open[0].length;
  const re = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'g'); re.lastIndex = start;
  let depth = 1, m;
  while ((m = re.exec(html))) { if (m[0][1] === '/') { if (--depth === 0) break; } else if (!m[0].endsWith('/>')) depth++; }
  if (!m) throw new Error('chiusura non trovata: ' + id);
  return html.slice(0, start) + inner + html.slice(m.index);
}
const outFile = (url) => path.join(ROOT, url.replace(/^\//, '') + '.html');
const write = (file, html) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html); };

// Pagine fisse: l'indirizzo ufficiale scritto nell'HTML (Bing legge poco il JavaScript)
const STATIC_PAGES = [['/tavoli', 'tavoli.html', '/en/tables', 'en/tables.html'], ['/chi-siamo', 'chi-siamo.html', '/en/about', 'en/about.html'],
  ['/come-arrivare', 'come-arrivare.html', '/en/getting-here', 'en/getting-here.html'], ['/privacy', 'privacy.html', '/en/privacy', 'en/privacy.html'],
  ['/cookie', 'cookie.html', '/en/cookie', 'en/cookie.html']];
function staticCanonicals() {
  for (const [itU, itF, enU, enF] of STATIC_PAGES) for (const [u, f] of [[itU, itF], [enU, enF]]) {
    const file = path.join(ROOT, f);
    let html = fs.readFileSync(file, 'utf8').replace(/<link rel="canonical"[^>]*>\n?/g, '');
    html = html.replace('<link rel="icon"', `<link rel="canonical" href="${SITE + u}">\n<link rel="icon"`);
    fs.writeFileSync(file, html);
  }
}

(async () => {
  staticCanonicals();
  if (process.env.ONLY_CANONICAL) return;
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  let page;
  const newTab = async () => {
    if (page) await page.close().catch(() => {});
    page = await b.newPage(); await page.setViewport({ width: 1440, height: 900 }); await page.setCacheEnabled(false);
    await page.evaluateOnNewDocument(() => { try { localStorage.setItem('dp_lang_hint', 'dismissed'); } catch (e) {} });
  };
  await newTab();
  // apre la pagina; se Chrome ha un intoppo riprova con una scheda nuova (fino a 3 volte)
  const open = async (u) => {
    for (let t = 1; ; t++) {
      try {
        const r = await page.goto(BASE + u, { waitUntil: 'networkidle0' });
        if (!r || ![200, 304].includes(r.status())) throw new Error(`${u}: ${r && r.status()}`);
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 900) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } scrollTo(0, 0); });
        await new Promise((r) => setTimeout(r, 400));
        return;
      } catch (e) {
        if (t >= 3 || /: \d+$/.test(e.message)) throw e;
        await newTab();
      }
    }
  };
  // ripulisce l'HTML catturato dagli stati di animazione, così la pagina parte "a riposo"
  const grab = (sel, outer) => page.evaluate((sel, outer) => {
    const el = document.querySelector(sel); if (!el) return null;
    const c = el.cloneNode(true);
    c.querySelectorAll('[data-scramble]').forEach((n) => n.removeAttribute('data-scramble'));
    // le foto non restano "già caricate" nell'HTML: le sceglie il JavaScript (leggere sul telefono, grandi sul computer)
    [c, ...c.querySelectorAll('.art')].forEach((n) => { if (!n.classList || !n.classList.contains('art')) return; n.removeAttribute('data-painted'); n.classList.remove('photo'); n.style.removeProperty('--img'); if (!n.getAttribute('style')) n.removeAttribute('style'); });
    c.querySelectorAll('img.u-card-poster, .ev-poster img').forEach((i) => { const s = i.getAttribute('src') || ''; if (/^\/img\/(?!m\/)/.test(s)) i.setAttribute('src', s.replace('/img/', '/img/m/')); });
    return outer ? c.outerHTML : c.innerHTML;
  }, sel, outer);

  let n = 0;
  for (const lang of ['it', 'en']) {
    const EN = lang === 'en';
    const T = (it, en) => (EN ? en : it);
    const tpl = (it, en) => fs.readFileSync(path.join(ROOT, EN ? en : it), 'utf8');

    // --- elenchi: date, artisti, news, home (si riscrive il file della pagina stessa) ---
    for (const [u, file, ids] of [
      [T('/apres-ski', '/en/dates'), T('apres-ski.html', 'en/dates.html'), ['evGrid']],
      [T('/artisti', '/en/artists'), T('artisti.html', 'en/artists.html'), ['artistGrid']],
      [T('/news', '/en/news'), T('news.html', 'en/news.html'), ['newsGrid']],
    ]) {
      await open(u);
      let html = fs.readFileSync(path.join(ROOT, file), 'utf8');
      for (const id of ids) html = fill(html, id, await grab('#' + id));
      if (!/<link rel="canonical"/.test(html)) html = html.replace('<link rel="icon"', `<link rel="canonical" href="${SITE + u}">\n<link rel="icon"`);
      write(path.join(ROOT, file), html); n++;
    }

    // --- home: caroselli già scritti + scheda di Disco Pleasure per Google ---
    {
      const u = T('/', '/en'), file = T('index.html', 'en/index.html');
      await open(u);
      let html = fs.readFileSync(path.join(ROOT, file), 'utf8');
      for (const id of ['seasonRail', 'lineupRail', 'ticketsRail']) html = fill(html, id, await grab('#' + id));
      const desc = T("Après-ski all'aperto allo Chalet Valentino, Roccaraso. Dal 5 dicembre al 14 marzo, dalle 12 alle 19: date, tickets e tavoli.",
        'Outdoor après-ski at Chalet Valentino, Roccaraso. December 5 to March 14, noon to 7 pm: dates, tickets and tables.');
      html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
        .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`)
        .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(desc)}">`)
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '').replace(/<link rel="canonical"[^>]*>\n?/g, '');
      const ld = { '@context': 'https://schema.org', '@graph': [
        { ...ORG, '@id': SITE + '/#org', logo: SITE + '/icon-512.png', image: SITE + '/og-home.jpg', description: desc, location: VENUE,
          contactPoint: { '@type': 'ContactPoint', telephone: '+39 340 369 2824', contactType: 'customer service', availableLanguage: ['Italian', 'English'] } },
        { '@type': 'WebSite', '@id': SITE + '/#web', name: 'Disco Pleasure', url: SITE + '/', inLanguage: T('it', 'en'), publisher: { '@id': SITE + '/#org' } },
      ] };
      html = html.replace('<link rel="icon"', `<link rel="canonical" href="${SITE + (EN ? '/en' : '/')}">\n<script type="application/ld+json">${JSON.stringify(ld)}</script>\n<link rel="icon"`);
      write(path.join(ROOT, file), html); n++;
    }

    // --- date ---
    await open(T('/apres-ski', '/en/dates'));
    const events = await page.evaluate(() => EVENTS.map((e) => ({ name: evName(e), id: e.id, url: L(e.url), it: e.url, en: toEN(e.url), title: e.title, short: e.short, long: e.long, hours: e.hours, phase: e.phase, poster: e.poster || null, tickets: e.tickets, lineup: e.lineup })));
    for (const e of events) {
      await open(e.url);
      let html = tpl('evento.html', 'en/event.html');
      html = fill(html, 'evPhase', await page.$eval('#evPhase', (x) => x.innerHTML));
      html = fill(html, 'evTitle', await page.$eval('#evTitle', (x) => x.innerHTML));
      html = fill(html, 'evDate', await page.$eval('#evDate', (x) => x.innerHTML));
      html = fill(html, 'evBody', await grab('#evBody'));
      const names = e.lineup.flatMap((l) => l.names).filter((x) => !/^(Resident|Guest)/.test(x));
      const night = e.lineup[0] && e.lineup[0].area !== 'Line-up' ? e.lineup[0].area : '';
      const desc = cut([`${e.name}, ${e.long}, ${e.hours.replace(' - ', '-')}.`,
        names.length ? `${T('Line-up', 'Line-up')}: ${names.join(', ')}.` : '',
        T("Après-ski all'aperto allo Chalet Valentino, Roccaraso.", 'Outdoor après-ski at Chalet Valentino, Roccaraso.')].filter(Boolean).join(' '));
      const [h1, h2] = e.hours.split(' - ');
      const ld = { '@context': 'https://schema.org', '@type': 'Event',
        name: `Disco Pleasure · ${e.name}`, description: desc,
        startDate: `${e.id}T${h1}:00+01:00`, endDate: `${e.id}T${h2}:00+01:00`,
        eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: VENUE, organizer: ORG, image: [abs(e.poster || '/og-home.jpg')], url: SITE + e.url, inLanguage: T('it', 'en'),
        offers: { '@type': 'Offer', url: e.tickets, priceCurrency: 'EUR', availability: 'https://schema.org/InStock' } };
      if (names.length) ld.performer = names.map((x) => ({ '@type': 'PerformingGroup', name: x }));
      html = setHead(html, { title: `${e.name} · ${e.short} | Disco Pleasure`, desc, url: e.url, image: e.poster || null,
        alt: `${T('Locandina', 'Poster')} Disco Pleasure · ${e.name} · ${e.short}`, itUrl: e.it, enUrl: e.en, jsonld: ld });
      write(outFile(e.url), html); n++;
    }

    // --- articoli ---
    await open(T('/news', '/en/news'));
    const news = await page.evaluate(() => NEWS.map((x) => ({ id: x.id, url: L(`/news/${x.id}`), it: `/news/${x.id}`, en: toEN(`/news/${x.id}`), title: x.title, lead: x.lead, img: x.img, date: x.date })));
    for (const a of news) {
      await open(a.url);
      let html = tpl('articolo.html', 'en/article.html');
      html = fill(html, 'arTitle', esc(a.title));
      html = fill(html, 'arDate', esc(a.date));
      html = fill(html, 'arBlocks', await grab('#arBlocks'));
      html = html.replace('<div class="art" id="arImg"></div>', `<div class="art" id="arImg" data-img="${a.img}"></div>`);
      const desc = cut(a.lead);
      const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: desc, image: [abs(a.img)],
        url: SITE + a.url, inLanguage: T('it', 'en'), author: ORG, publisher: { ...ORG, logo: { '@type': 'ImageObject', url: SITE + '/icon-512.png' } },
        mainEntityOfPage: SITE + a.url };
      html = setHead(html, { title: `${a.title} | Disco Pleasure`, desc, url: a.url, image: a.img, alt: a.title, itUrl: a.it, enUrl: a.en, jsonld: ld });
      write(outFile(a.url), html); n++;
    }

    // --- artisti ---
    await open(T('/artisti', '/en/artists'));
    const artists = await page.evaluate(() => ARTISTS.map((x) => ({ slug: x.slug, url: L(`/artisti/${x.slug}`), it: `/artisti/${x.slug}`, en: toEN(`/artisti/${x.slug}`), name: x.name, img: x.hero || x.img, bio: (x.bio || []).join(' ') })));
    for (const a of artists) {
      await open(a.url);
      let html = tpl('artista.html', 'en/artist.html');
      html = fill(html, 'artistGrid', await grab('#artistGrid'));
      const ov = await grab('#artistOverlay', true);
      if (ov) html = html.replace('</main>', '</main>\n' + ov);
      const desc = cut(a.bio || `${a.name}, Disco Pleasure.`);
      const ld = { '@context': 'https://schema.org', '@type': 'ProfilePage', url: SITE + a.url, inLanguage: T('it', 'en'),
        mainEntity: { '@type': 'Person', name: a.name, description: desc, image: a.img ? abs(a.img) : undefined } };
      html = setHead(html, { title: `${a.name} | Disco Pleasure`, desc, url: a.url, image: a.img || null, alt: a.name, itUrl: a.it, enUrl: a.en, jsonld: ld });
      write(outFile(a.url), html); n++;
    }
  }
  console.log('pagine scritte:', n);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
