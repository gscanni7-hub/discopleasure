// Controllo veloce di tutte le pagine della mappa del sito (sitemap.xml), su computer e telefono.
// Per ogni pagina: errori JavaScript, file mancanti, scorrimento laterale, un solo titolo principale,
// descrizione, dati strutturati per Google, testo presente prima del JavaScript. Ogni passo ha un tempo massimo.
// Uso: NODE_PATH=<cartella con puppeteer-core> node tools/check.js <indirizzo base> <file risultato.json>
const puppeteer = require('puppeteer-core'); const fs = require('fs'), path = require('path');
const BASE = process.argv[2], OUT = process.argv[3];
const urls = [...fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8').matchAll(/<loc>https:\/\/discopleasure\.com([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
const limit = (p, ms, what) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('tempo scaduto: ' + what)), ms))]);
const launch = () => puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 30000 });
const kill = async (b) => { await Promise.race([b.close().catch(() => {}), new Promise((r) => setTimeout(r, 4000))]); try { b.process() && b.process().kill('SIGKILL'); } catch (e) {} };

(async () => {
  const out = {}; let b = await launch(), count = 0;
  for (const u of urls) {
    const raw = await fetch(BASE + u, { signal: AbortSignal.timeout(15000) }).then((r) => r.text()).catch(() => '');
    const main = (raw.split(/<main[^>]*>/)[1] || '').split('</main>')[0];
    const rawWords = main.replace(/<script[\s\S]*?<\/script>|<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const rec = { rawWords };
    for (const w of [1440, 390]) {
      if (++count % 15 === 0) { await kill(b); b = await launch(); }
      const errs = [];
      try {
        const p = await limit(b.newPage(), 20000, 'nuova scheda');
        await p.setViewport({ width: w, height: 900 });
        p.on('pageerror', (e) => errs.push('JS: ' + e.message));
        p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) errs.push(r.status() + ' ' + r.url().replace(BASE, '')); });
        const r = await limit(p.goto(BASE + u, { waitUntil: 'load', timeout: 20000 }), 25000, 'apertura');
        await new Promise((res) => setTimeout(res, 800));
        const info = await limit(p.evaluate(() => {
          const meta = (n) => (document.querySelector(`meta[name="${n}"]`) || {}).content || '';
          return { status: 0, h1: document.querySelectorAll('h1').length, desc: meta('description'), title: document.title,
            ld: [...document.querySelectorAll('script[type="application/ld+json"]')].length,
            canonical: (document.querySelector('link[rel=canonical]') || {}).href || '',
            overflow: document.documentElement.scrollWidth - innerWidth };
        }), 10000, 'lettura');
        rec[w] = { ...info, status: r ? r.status() : 0, errs };
        await limit(p.close(), 5000, 'chiusura').catch(() => {});
      } catch (e) {
        rec[w] = { errs: [...errs, 'CONTROLLO: ' + e.message] };
        await kill(b); b = await launch();
      }
    }
    out[u] = rec;
  }
  await kill(b);
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log('pagine controllate:', urls.length);
})();
