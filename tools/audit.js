// Controllo completo del sito: link, errori, telefono, e voci SEO.
// Uso: NODE_PATH=<cartella con puppeteer-core> node tools/audit.js <indirizzo base> <file risultato.json>
const puppeteer = require('puppeteer-core'); const fs = require('fs');
const BASE = process.argv[2];
(async () => {
  // Chrome si riavvia ogni 20 pagine: dopo molte pagine di fila tende a bloccarsi
  const launch = () => puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 60000 });
  let b = await launch(), opened = 0;
  const fresh = async () => { if (++opened % 20 === 0) { await Promise.race([b.close(), new Promise((r) => setTimeout(r, 5000))]); try { b.process() && b.process().kill('SIGKILL'); } catch (e) {} b = await launch(); } };
  const seen = new Set(), queue = ['/', '/en'], report = { pages: {}, links: {}, external: new Set() };
  while (queue.length) {
    const path = queue.shift(); if (seen.has(path)) continue; seen.add(path);
    if (process.env.DEBUG) console.log('pagina', seen.size, path);
    // testo presente nell'HTML grezzo, prima del JavaScript (quello che Google legge subito)
    const raw = await fetch(BASE + path, { signal: AbortSignal.timeout(20000) }).then((r) => r.text()).catch(() => '');
    const rawMain = (raw.split(/<main[^>]*>/)[1] || '').split('</main>')[0].replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    for (const w of [1440, 390]) {
      await fresh();
      const p = await b.newPage(); await p.setViewport({ width: w, height: 900 });
      if (process.env.DEBUG) console.log('  larghezza', w);
      await p.evaluateOnNewDocument(() => { try { localStorage.setItem('dp_lang_hint', 'dismissed'); } catch (e) {} });
      const errs = [];
      p.on('pageerror', e => errs.push('JS: ' + e.message));
      p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text().slice(0, 160)));
      p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
      const resp = await p.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 60000 }).catch(() => null);
      p.setDefaultTimeout(30000);
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); }).catch(() => {});
      await new Promise(r => setTimeout(r, 500));
      const info = await p.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0; };
        const items = [...document.querySelectorAll('a, button')].map((el) => {
          let blocked = null;
          if (vis(el)) { el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            if (top && top !== el && !el.contains(top) && !top.contains(el)) blocked = top.className; }
          return { href: el.getAttribute('href'), name: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), visible: vis(el), blocked };
        });
        const meta = (n) => (document.querySelector(`meta[name="${n}"], meta[property="${n}"]`) || {}).content || '';
        const main = document.querySelector('main');
        return { items, title: document.title, desc: meta('description'), ogImage: meta('og:image'), robots: meta('robots'),
          canonical: (document.querySelector('link[rel=canonical]') || {}).href || '', hreflang: document.querySelectorAll('link[hreflang]').length,
          h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()).join(' | ').slice(0, 80), h1n: document.querySelectorAll('h1').length,
          jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { return JSON.parse(s.textContent)['@type']; } catch (e) { return 'ERR'; } }),
          words: main ? main.innerText.split(/\s+/).filter(Boolean).length : 0, imgsNoAlt: [...document.images].filter(i => !i.alt).length,
          overflow: document.documentElement.scrollWidth - innerWidth, lang: document.documentElement.lang };
      });
      report.pages[path + '@' + w] = { status: resp ? resp.status() : 'ERR', errs: [...new Set(errs)], ...info, items: undefined, rawWords: rawMain.split(' ').filter(Boolean).length,
        blocked: info.items.filter(i => i.visible && i.blocked && !/u-ov-/.test(i.blocked)).map(i => `"${i.name}" -> ${i.blocked}`) };
      for (const it of info.items) {
        const h = it.href; if (!h) continue;
        if (/^https?:/.test(h) && !h.startsWith(BASE) && !h.includes('discopleasure.com')) report.external.add(h);
        else if (h.startsWith('/') || h.includes('discopleasure.com')) {
          const u = h.replace(/^https?:\/\/(www\.)?discopleasure\.com/, '').split('#')[0] || '/';
          (report.links[u] = report.links[u] || new Set()).add(path);
          const clean = u.split('?')[0];
          if (!/\.(jpg|png|webp|svg|pdf|webmanifest|ico|xml|txt)$/.test(clean) && !seen.has(clean) && !queue.includes(clean)) queue.push(clean);
        }
      }
      await p.close();
    }
  }
  const linkStatus = {};
  for (const u of Object.keys(report.links)) { const r = await fetch(BASE + u, { redirect: 'manual', signal: AbortSignal.timeout(20000) }).catch(() => null); linkStatus[u] = r ? r.status : 'ERR'; }
  fs.writeFileSync(process.argv[3], JSON.stringify({ pages: report.pages, linkStatus, external: [...report.external] }, null, 1));
  console.log('pagine', seen.size, 'link interni', Object.keys(report.links).length, 'esterni', report.external.size);
  await b.close();
})();
