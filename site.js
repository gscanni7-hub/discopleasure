/* =========================================================
   PARTI COMUNI A TUTTE LE PAGINE
   header + menu, footer, logo, sfondo, titoli giganti, caroselli, form
   ========================================================= */

/* ============ UTILITY ============ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const art = (img, extra = "") => `<div class="art"${img ? ` data-img="${esc(img)}"` : ""} ${extra}></div>`;
const WM = '<span class="wm"><span class="row">DISC<span class="o"></span></span><span class="row">&nbsp;PLEASURE</span></span>';
const qs = (k) => new URLSearchParams(location.search).get(k);
if (qs("bn") === "1") document.documentElement.classList.add("bn");

/* Foto: su schermi fino a 800px usa le versioni leggere in img/m/, sempre in WebP,
   e ogni foto si scarica solo quando sta per entrare nello schermo. */
const SMALL = matchMedia("(max-width: 800px)").matches;
const webp = (src) => (/^\/img\/.+\.jpg$/.test(src) ? src.replace(/\.jpg$/, ".webp") : src);
const srcFor = (src) => webp(SMALL && /^\/img\/[^/]+\.jpg$/.test(src) ? src.replace("/img/", "/img/m/") : src);
function paintArt(el) {
  if (!el.dataset.img || el.dataset.painted) return;
  el.dataset.painted = "1";
  el.classList.add("photo");
  el.style.setProperty("--img", `url("${srcFor(el.dataset.img)}")`);
}
const lazyIO = "IntersectionObserver" in window
  ? new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { paintArt(en.target); lazyIO.unobserve(en.target); } }), { rootMargin: "900px 600px" })
  : null;
const paintAll = (root = document) => $$(".art[data-img]:not([data-painted])", root).forEach((el) => (lazyIO ? lazyIO.observe(el) : paintArt(el)));

/* ============ HEADER + MENU ============ */
function mountHeader() {
  const slot = $("#siteHeader"); if (!slot) return;
  slot.outerHTML = `
<div class="page-bg" id="pageBg" aria-hidden="true"></div>
<div class="load-bar" id="loadBar" aria-hidden="true"></div>
<header class="topbar">
  <div class="pill" id="pill">
    <!-- barra a tutta larghezza come UNVRS: link a sinistra, logo al centro, Tickets e Menu a destra -->
    <div class="pill-bar">
      <nav class="bar-side bar-left" aria-label="${T("Scorciatoie", "Shortcuts")}">
        ${[["/apres-ski", T("Date", "Dates"), "desk-only"], ["/tavoli", T("Tavoli", "Tables"), "desk-only"], ["/news", "News", "desk-only"], ["/apres-ski", "Tickets", "mob-only"]].map(([h, t, c]) => { const cur = PATH === h || PATH.startsWith(h + "/"); return `<a class="${c}${cur ? " cur" : ""}" href="${L(h)}" ${cur ? 'aria-current="page" ' : ""}><span class="at" data-text="${t}"><span>${t}</span></span></a>`; }).join("")}
      </nav>
      <a href="${L("/")}" class="logo" aria-label="Disco Pleasure home">${WM}</a>
      <div class="bar-side bar-right">
        <a class="desk-only" href="${L("/apres-ski")}"><span class="at" data-text="Tickets"><span>Tickets</span></span></a>
        <button class="pill-btn" id="menuBtn" aria-expanded="false" aria-controls="pillMenu"><span class="at" data-text="Menu"><span>Menu</span></span><i class="burger" aria-hidden="true"></i></button>
      </div>
    </div>
  </div>
  <!-- Pannello del menu come UNVRS: scheda fissa in alto a destra (desktop), che sale dal basso (telefono) -->
  <div class="u-menu" id="pillMenu" role="dialog" aria-label="${T("Menu principale", "Main menu")}" aria-hidden="true">
    <div class="u-menu-lang" aria-label="${T("Lingua", "Language")}"><a class="u-menu-tab${EN ? "" : " on"}" href="${LANG_URL("it")}" hreflang="it" lang="it"${EN ? "" : ' aria-current="true"'}>IT</a><a class="u-menu-tab${EN ? " on" : ""}" href="${LANG_URL("en")}" hreflang="en" lang="en"${EN ? ' aria-current="true"' : ""}>EN</a></div>
    <ol class="u-menu-list">
      ${[["/", "Home"], ["/apres-ski", T("Date", "Dates")], ["/artisti", T("Artisti", "Artists")], ["/tavoli", T("Tavoli", "Tables")], ["/news", "News"], ["/chi-siamo", T("Chi siamo", "About")], ["/come-arrivare", T("Come arrivare", "Getting here")]]
        .map(([h, t, ext], i) => `<li><a href="${L(h)}"${ext ? ' target="_blank" rel="noopener"' : ""}><span class="u-menu-n">${String(i + 1).padStart(2, "0")}</span><span class="u-menu-t">${t}</span></a></li>`).join("")}
      <li><span class="u-menu-head"><span class="u-menu-n">08</span><span class="u-menu-t">${T("Lo chalet", "The chalet")}</span></span>
        <ul class="u-menu-sub">
          <li><a href="https://www.google.com/maps/search/?api=1&amp;query=Chalet+Valentino+Viale+delle+Gravare+Roccaraso" target="_blank" rel="noopener"><span class="u-menu-n">–</span><span class="u-menu-t">Google Maps</span></a></li>
        </ul>
      </li>
    </ol>
    <div class="u-menu-foot" aria-hidden="true">
      <div><span>${T("Posizione", "Position")}</span><span id="menuPos">X0 Y0</span></div>
      <div class="u-menu-foot-mid"><span>${T("Quota", "Altitude")}</span><span>1567 m</span></div>
      <div><span>${T("Ora locale", "Local time")}</span><span><span id="menuClock">--:--:--</span></span></div>
    </div>
  </div>
</header>`;
}

// Orologio del pannello (ora di Roccaraso), come la "frequency" che cambia nel menu di UNVRS
function initMenuPos() {
  // Come UNVRS: con il menu aperto, "Posizione" segue il puntatore (coordinate X e Y nello schermo)
  const el = $("#menuPos"), panel = $("#pillMenu"); if (!el || !panel) return;
  addEventListener("pointermove", (e) => { if (!panel.classList.contains("open")) return; el.textContent = `X${Math.round(e.clientX)} Y${Math.round(e.clientY)}`; }, { passive: true });
}
function initMenuClock() {
  const el = $("#menuClock"); if (!el) return;
  const f = new Intl.DateTimeFormat(T("it-IT", "en-GB"), { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const tick = () => { el.textContent = f.format(new Date()); };
  tick(); setInterval(tick, 1000);
}

function footerHTML(id = "footer") {
    const col = (title, links) => `<div class="fcol"><p class="fcol-title">${title}</p><ul>${links}</ul></div>`;
  const li = (h, t) => `<li><a href="${L(h)}">${t}</a></li>`;
  // Composizione del footer di Hï: WhatsApp a sinistra, colonne di link a destra, firma in basso
  return `
<footer class="footer"${id ? ` id="${id}"` : ""}>
  <div class="footer-inner">
    <div class="footer-sub">
      <p>${T("Tavoli, info e domande: scrivici su WhatsApp, ti rispondiamo noi.", "Tables, info and questions: message us on WhatsApp, we\'ll get back to you personally.")}</p>
      <a class="btn btn-sm" href="${waLink(T("Ciao! Vorrei informazioni su Disco Pleasure.", "Hi! I\'d like some information about Disco Pleasure."))}" target="_blank" rel="noopener">${T("Scrivici", "Message us")}</a>
    </div>
    <div class="footer-cols">
      ${col("Disco Pleasure", li("/", "Home") + li("/apres-ski", T("Date", "Dates")) + li("/artisti", T("Artisti", "Artists")) + li("/tavoli", T("Tavoli", "Tables")) + li("/news", "News"))}
      ${col("Info", li("/chi-siamo", T("Chi siamo", "About")) + li("/come-arrivare", T("Come arrivare", "Getting here")) + `<li><a href="https://www.google.com/maps/search/?api=1&amp;query=Chalet+Valentino+Viale+delle+Gravare+Roccaraso" target="_blank" rel="noopener">${T("Lo chalet su Google Maps", "The chalet on Google Maps")}</a></li>`)}
      ${col(T("Legale", "Legal"), li("/privacy", "Privacy policy") + li("/cookie", "Cookie policy"))}
    </div>
    <div class="footer-sign">
      <a href="${L("/")}" class="logo footer-logo" aria-label="Disco Pleasure, home">${WM}</a>
      <p class="footer-meta">© 2023 - 2027 Disco Pleasure · Chalet Valentino, ${T("a valle delle Gravare", "Valle delle Gravare")}, Roccaraso</p>
    </div>
  </div>
</footer>`;
}
function mountFooter() {
  const slot = $("#siteFooter"); if (!slot) return;
  slot.outerHTML = footerHTML();
}

function initMenu() {
  const pill = $("#pill"), btn = $("#menuBtn"), panel = $("#pillMenu"); if (!pill || !panel) return;
  const set = (open) => {
    if (open === pill.classList.contains("open")) return;
    pill.classList.toggle("open", open);
    panel.classList.toggle("open", open);
    panel.setAttribute("aria-hidden", !open);
    btn.setAttribute("aria-expanded", open);
  };
  btn.addEventListener("click", () => set(!pill.classList.contains("open")));
  $$("#pillMenu a").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  // chiude con un clic fuori dalla barra e dal pannello
  let downInside = false;
  document.addEventListener("pointerdown", (e) => { downInside = pill.contains(e.target) || panel.contains(e.target); }, true);
  document.addEventListener("click", (e) => { if (!pill.contains(e.target) && !panel.contains(e.target) && !downInside) set(false); });
}

/* Fila di card del menu: carosello centrato, infinito, da trascinare, che scatta di una card */
/* Header (e barra date in home) scuri sopra le card scure */
const darkAt = (x, y, self) => document.elementsFromPoint(x, y).some((el) => !self.contains(el) && el.closest(".dark"));
const scrollHooks = [];
function initScroll() {
  const pill = $("#pill");
  let ticking = false;
  const frame = () => {
    ticking = false;
    if (pill && !pill.classList.contains("open")) {
      const r = pill.getBoundingClientRect();
      pill.classList.toggle("is-dark", darkAt(r.left + r.width / 2, r.top + r.height / 2, pill));
    }
    scrollHooks.forEach((f) => f());
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  frame();
}

/* ============ TITOLI GIGANTI: opacità che segue lo scroll ============ */
// In base a dove si trova il segnaposto nello schermo:
// entra dal 70% (0) al 45% (1), resta pieno fino al 33%, sparisce al 13%.
function initGiants() {
  const sets = $$(".chapter").map((ch) => [$(".giant", ch), $(".sentinel", ch), $(".chapter-body", ch)]).filter(([h, d]) => h && d);
  if (!sets.length) return;
  const lerp = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
  const update = () => {
    const vh = innerHeight;
    sets.forEach(([h, dot, body]) => {
      const y = dot.getBoundingClientRect().top / vh;
      const fadeIn = y > 0.45 ? 1 - lerp(y, 0.45, 0.70) : 1;
      // sparisce del tutto prima che i contenuti arrivino sotto il titolo
      let out = y > 0.33 ? 1 : lerp(y, 0.13, 0.33);
      if (body && body.firstElementChild) {
        const rg = document.createRange(); rg.selectNodeContents(h);
        const gap = body.firstElementChild.getBoundingClientRect().top - rg.getBoundingClientRect().bottom - 16;
        out = Math.min(out, Math.max(0, Math.min(1, gap / (vh * 0.07))));
      }
      h.style.opacity = Math.min(fadeIn, out).toFixed(3);
    });
  };
  scrollHooks.push(update);
  update();
}

/* ============ SFONDO: luci che fluttuano ============ */
function initSpotlights() {
  const bg = $("#pageBg"); if (!bg) return;
  const colors = ["#b9e2ff", "#ffd0dc", "#dcd2ff", "#cff5d4", "#c6ecff", "#ffe0c9", "#e4d6ff", "#d3f7da"];
  const r = Math.random;
  bg.innerHTML = colors.map((c) => `<i style="--c:${c};--s:${(40 + r() * 26).toFixed(1)}vmax;--x:${(r() * 100).toFixed(1)}%;--y:${(r() * 100).toFixed(1)}%;--o:${(0.45 + r() * 0.15).toFixed(2)};--d:${(30 + r() * 13).toFixed(1)}s;--delay:${(-r() * 40).toFixed(1)}s"></i>`).join("");
}

/* ============ BARRA DI CARICAMENTO AL CAMBIO PAGINA ============ */
function initLoadBar() {
  const bar = $("#loadBar"); if (!bar) return;
  const set = (x) => { bar.style.transform = `scaleX(${x})`; };
  // arrivo sulla pagina: la barra si completa e sparisce
  bar.classList.add("on"); set(0.7);
  addEventListener("load", () => { set(1); setTimeout(() => bar.classList.remove("on"), 250); });
  // clic su un link interno: la barra parte prima di cambiare pagina
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto:|tel:|https?:)/.test(href)) return;
    e.preventDefault();
    bar.classList.add("on"); set(0.15);
    requestAnimationFrame(() => { set(0.6); setTimeout(() => (location.href = a.href), 180); });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { set(0); bar.classList.remove("on"); } });
}

/* ============ FILTRI A PILLOLA ============ */
// <div class="filters" data-filters> con <button data-f="..."> ; callback(valore)
function initFilters(el, onChange, initial) {
  const btns = $$("button", el);
  const set = (v) => { btns.forEach((b) => b.classList.toggle("on", b.dataset.f === v)); onChange(v); };
  btns.forEach((b) => b.addEventListener("click", () => set(b.dataset.f)));
  set(initial ?? btns[0].dataset.f);
}

/* ============ MARCHIO: la palla dentro la O ============ */
function initBalls() {
  const NS = "http://www.w3.org/2000/svg", R = 100;
  const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const CFG = {
    o: { vb: "-136 -136 272 272", sw: 6, mer: 4, par: [[-50, 86.6, 13.9], [0, 100, 16], [50, 86.6, 13.9]], ring: [117, 34] },
    seal: { vb: "-114 -114 228 228", sw: 4, mer: 6, par: [[-66.7, 74.5, 11.9], [-33.3, 94.3, 15.1], [0, 100, 16], [33.3, 94.3, 15.1], [66.7, 74.5, 11.9]], ring: [106, 12] },
  };
  const build = (svg, kind) => {
    const c = CFG[kind];
    svg.setAttribute("viewBox", c.vb);
    const mer = [];
    for (let k = 0; k < c.mer; k++) { const e = el("ellipse", { cx: 0, cy: 0, rx: 100, ry: 100, fill: "none", stroke: "currentColor", "stroke-width": c.sw }); svg.appendChild(e); mer.push(e); }
    c.par.forEach((p) => svg.appendChild(el("ellipse", { cx: 0, cy: p[0], rx: p[1], ry: p[2], fill: "none", stroke: "currentColor", "stroke-width": c.sw })));
    svg.appendChild(el("circle", { cx: 0, cy: 0, r: c.ring[0], fill: "none", stroke: "currentColor", "stroke-width": c.ring[1] }));
    return { els: mer, n: c.mer };
  };
  const balls = [];
  $$("span.o").forEach((span) => { const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "o"); svg.setAttribute("aria-hidden", "true"); span.replaceWith(svg); balls.push(build(svg, "o")); });
  $$("svg[data-ball]").forEach((svg) => balls.push(Object.assign(build(svg, svg.dataset.ball), { speed: +svg.dataset.speed || 1 })));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0;
  const frame = () => {
    if (!reduce) t += 0.006;
    balls.forEach((b) => b.els.forEach((e, k) => e.setAttribute("rx", Math.max(0.5, Math.abs(R * Math.cos((k * Math.PI) / b.n + t * (b.speed || 1)))).toFixed(1))));
    requestAnimationFrame(frame);
  };
  frame();
}

/* ============ COMPONENTI RIUSATI ============ */
// Card della data (calendario, pagina evento, tavoli)
const b2b = (name) => esc(name).split(/\s+b2b\s+/i).join(' <span class="badge badge-line">B2B</span> ');
function eventCard(e, { tickets = true } = {}) {
  return `
  <article class="ev-card">
    <a class="ev-head" href="${L(e.url)}">
      <span class="ev-name">${esc(e.title === "Disco Pleasure" ? "Disco Pleasure · Après-ski" : e.title)}</span>
      <span class="ev-time">${esc(e.hours)}</span>
      <span class="ev-badges"><span class="badge badge-blue">Chalet Valentino</span><span class="badge badge-outline">${esc(e.phase)}</span></span>
    </a>
    <div class="ev-box">
      <h3 class="ev-date">${esc(e.card)}</h3>
      ${e.lineup.map((l) => `
      <div class="ev-area">
        <span class="badge badge-dark">${esc(l.area)}</span>
        ${l.names.map((n) => `<span class="ev-artist">${b2b(n)}</span>`).join("")}
      </div>`).join("")}
      <div class="ev-entry">${e.entry.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="ev-actions${tickets ? "" : " one"}">
        ${tickets ? `<a class="btn btn-black" href="${esc(e.tickets)}" target="_blank" rel="noopener">Tickets</a>` : ""}
        <a class="btn btn-black" href="${waLink(tableMsg(e))}" target="_blank" rel="noopener">${tickets ? T("Tavoli", "Tables") : T("Prenota tavolo", "Book a table")}</a>
      </div>
    </div>
  </article>`;
}

// Scheda della data nello stile della home (pagina Date): panna, numero in mono, titolo grande, line-up, due bottoni
function eventCardU(e, i, { tickets = true } = {}) {
  const n = EVENTS.indexOf(e) + 1;
  return `
  <article class="u-slide u-ev" style="--i:${i % 12}">
    <a class="u-ev-top" href="${L(e.url)}">
      <span class="u-mono u-ev-n">${String(n).padStart(2, "0")}</span>
      <span class="u-mono u-ev-day">${esc(e.card)}</span>
      <h3 class="u-ev-title">${esc(e.title === "Disco Pleasure" ? "Après-ski" : e.title)}</h3>
      <span class="u-mono u-ev-meta">${esc(e.hours)} · ${esc(e.phase)}</span>
    </a>
    <div class="u-ev-body">
      ${e.lineup.map((l) => `<div class="u-ev-area"><span class="u-mono u-ev-label">${esc(l.area)}</span>${l.names.map((nm) => `<span class="u-ev-artist">${b2b(nm)}</span>`).join("")}</div>`).join("")}
      <div class="u-mono u-ev-entry">${e.entry.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    </div>
    <div class="u-ev-actions${tickets ? "" : " one"}">
      ${tickets ? (TICKETS[e.id] ? `<a class="u-btn u-btn-ink" href="${esc(TICKETS[e.id])}" target="_blank" rel="noopener">Tickets</a>` : `<span class="u-btn u-btn-ink u-soon">${T("Tickets in arrivo", "Tickets coming soon")}</span>`) : ""}
      <a class="u-btn u-btn-ink" href="${L("/tavoli")}?d=${e.id}">${tickets ? T("Tavoli", "Tables") : T("Prenota tavolo", "Book a table")}</a>
    </div>
  </article>`;
}

// Filtri per mese + griglia di card della stagione (griglia .u-grid = stile della home)
function mountEventGrid(filtersEl, gridEl, { tickets = true, events = EVENTS } = {}) {
  const months = [...new Set(events.map((e) => e.month))];
  filtersEl.innerHTML = `<button data-f="all">${T("Tutte", "All")}</button>` + months.map((m) => `<button data-f="${m}">${MESI[m - 1][0].toUpperCase() + MESI[m - 1].slice(1)}</button>`).join("");
  const initial = qs("m") && months.includes(+qs("m")) ? qs("m") : "all";
  const nuovo = gridEl.classList.contains("u-grid");
  const count = $("#evCount");
  initFilters(filtersEl, (v) => {
    const list = v === "all" ? events : events.filter((e) => String(e.month) === v);
    if (nuovo) {
      gridEl.classList.remove("in");
      gridEl.innerHTML = list.map((e, i) => eventCardU(e, i, { tickets })).join("");
      if (count) count.textContent = String(list.length).padStart(2, "0");
      requestAnimationFrame(() => requestAnimationFrame(() => gridEl.classList.add("in")));
    } else gridEl.innerHTML = list.map((e) => eventCard(e, { tickets })).join("");
  }, initial);
}

/* ============ TESTO CHE SI MESCOLA (percentuali e numerini) ============ */
const GLYPHS = "[]#*<>%0123456789";
function scrambleTo(el, text, ms = 320) {
  if (el.dataset.target === text) return;
  el.dataset.target = text;
  const t0 = performance.now();
  const step = (t) => {
    if (el.dataset.target !== text) return;
    const k = Math.min(1, (t - t0) / ms), fixed = Math.round(k * text.length);
    el.textContent = text.slice(0, fixed) + [...text.slice(fixed)].map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("");
    if (k < 1) requestAnimationFrame(step); else el.textContent = text;
  };
  requestAnimationFrame(step);
}

/* ============ ENTRATE ALLA UNVRS (condivise): titoli parola per parola, card che scivolano ============ */
function splitWords(el) {
  let i = 0;
  [...el.childNodes].forEach((n) => {
    if (n.nodeType !== 3 || !n.textContent.trim()) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
      const sp = document.createElement("span"); sp.className = "w"; sp.style.setProperty("--i", i++); sp.textContent = part; frag.appendChild(sp);
    });
    n.replaceWith(frag);
  });
}
function initReveals() {
  const targets = $$(".u-sec, .u-band, .u-page-head"); if (!targets.length) return;
  $$(".u-title, .u-band-a, .u-band-b").forEach(splitWords);
  const io = new IntersectionObserver((ens) => ens.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    const c = $(".u-count", en.target); if (c && typeof scrambleTo === "function") { const v = c.textContent; c.textContent = ""; setTimeout(() => scrambleTo(c, v, 500), 300); }
    io.unobserve(en.target);
  }), { threshold: 0.18 });
  targets.forEach((t) => io.observe(t));
}

/* ============ AVVIO COMUNE ============ */

// Pagine inglesi: ogni link interno rimasto senza /en viene portato nella versione inglese
function localizeLinks(root = document) {
  if (!EN) return;
  $$('a[href^="/"]', root).forEach((a) => { const h = a.getAttribute("href"); const n = L(h); if (n !== h && !a.closest(".u-menu-lang")) a.setAttribute("href", n); });
}
// Il sito si apre sempre in italiano. Se il browser non è in italiano, in basso compare un invito
// (in inglese) a passare alla versione inglese; sulle pagine inglesi, se il browser è in italiano, il contrario.
// La scelta (passare o chiudere) viene ricordata e l'invito non ricompare.
function initLangHint() {
  let seen = null; try { seen = localStorage.getItem("dp_lang_hint"); } catch (e) {}
  if (seen) return;
  const first = String((navigator.languages && navigator.languages[0]) || navigator.language || "it").toLowerCase();
  const browserIt = first.startsWith("it");
  if (EN ? !browserIt : browserIt) return;
  const box = document.createElement("div");
  box.className = "u-lang-hint"; box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", EN ? "Lingua" : "Language");
  box.innerHTML = EN
    ? `<p>Questo sito è disponibile anche in italiano.</p><div><a class="u-lang-go" href="${LANG_URL("it")}" hreflang="it" lang="it">Italiano</a><button type="button" class="u-lang-x" aria-label="Chiudi">Resta in inglese</button></div>`
    : `<p lang="en">This website is also available in English.</p><div><a class="u-lang-go" href="${LANG_URL("en")}" hreflang="en" lang="en">English</a><button type="button" class="u-lang-x" lang="en" aria-label="Close">Stay in Italian</button></div>`;
  const remember = (v) => { try { localStorage.setItem("dp_lang_hint", v); } catch (e) {} };
  box.querySelector(".u-lang-go").addEventListener("click", () => remember("switched"));
  box.querySelector(".u-lang-x").addEventListener("click", () => { remember("dismissed"); box.classList.remove("on"); setTimeout(() => box.remove(), 400); });
  document.body.appendChild(box);
  setTimeout(() => box.classList.add("on"), 1200);
}
function bootSite() {
  initLangHint();
  if (EN) { localizeLinks(); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && localizeLinks(n.parentElement || n)))).observe(document.body, { childList: true, subtree: true }); }
  mountHeader();
  mountFooter();
  initMenuClock();
  initMenuPos();
  initSpotlights();
  initLoadBar();
  paintAll();
  initBalls();
  initMenu();
  initScroll();
  initGiants();
  initReveals();
  requestAnimationFrame(() => $("#pageBg")?.classList.add("on"));
}

/* ============ METEO ROCCARASO ============ */
const WMO = (c) =>
  c === 0 ? [T("Sereno", "Clear"), "sun"] : c === 1 ? [T("Poco nuvoloso", "Mostly clear"), "sunc"] : c === 2 ? [T("Parz. nuvoloso", "Partly cloudy"), "sunc"] : c === 3 ? [T("Coperto", "Overcast"), "cloud"] :
  c <= 48 ? [T("Nebbia", "Fog"), "fog"] : c <= 57 ? [T("Pioviggine", "Drizzle"), "rain"] : c <= 67 ? [T("Pioggia", "Rain"), "rain"] : c <= 77 ? [T("Neve", "Snow"), "snow"] :
  c <= 82 ? [T("Rovesci", "Showers"), "rain"] : c <= 86 ? [T("Rovesci di neve", "Snow showers"), "snow"] : [T("Temporale", "Thunderstorm"), "storm"];
const CLOUD = (y) => `<path class="w-cloud" d="M7 ${y}h10.5a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.7 1.6A3.2 3.2 0 0 0 7 ${y}Z"/>`;
const ICONS = {
  sun: '<g class="w-rays"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g><circle cx="12" cy="12" r="4.5"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  sunc: '<g class="w-rays" style="transform-origin:8px 8px"><path d="M8 1.8v1.4M1.8 8h1.4M3.6 3.6l1 1M12.4 3.6l-1 1"/></g><circle cx="8" cy="8" r="3.2"/><path class="w-cloud" d="M9 20h8.5a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.4A2.8 2.8 0 0 0 9 20Z"/>',
  cloud: CLOUD(19),
  fog: '<path class="w-fog" d="M4 9h16M2 13h20M5 17h14"/>',
  rain: CLOUD(15) + '<path class="w-drop" d="M8 18l-1 3"/><path class="w-drop d2" d="M12 18l-1 3"/><path class="w-drop d3" d="M16 18l-1 3"/>',
  snow: CLOUD(14) + '<path class="w-flake" d="M8 17.5v.01"/><path class="w-flake d2" d="M12 19v.01"/><path class="w-flake d3" d="M16 17.5v.01"/><path class="w-flake d2" d="M10 21v.01"/><path class="w-flake d3" d="M14 21v.01"/>',
  storm: CLOUD(14) + '<path class="w-bolt" d="M12.5 15l-2 3.5h3l-2 3.5"/>',
};
const wIcon = (k) => `<svg class="w-ico w-${k}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
const hhmm = (iso) => iso.slice(11, 16);
const num = (v, d = 1) => v.toFixed(d).replace(".", ",");
/* ---- MET Norway come riserva: converte i dati nella forma di Open-Meteo ---- */
// Ora locale di Roccaraso in formato "AAAA-MM-GGTHH:MM"
const romeISO = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(d).replace(" ", "T");
// Alba e tramonto calcolati (algoritmo NOAA semplificato), restituiti come Date
function sunTimes(day, lat, lon) {
  const rad = Math.PI / 180, n = Math.floor((Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()) - Date.UTC(2000, 0, 1, 12)) / 864e5) + 1;
  const J = n - lon / 360, M = (357.5291 + 0.98560028 * J) % 360;
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
  const L = (M + C + 180 + 102.9372) % 360, T = 2451545 + J + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * L * rad);
  const dec = Math.asin(Math.sin(L * rad) * Math.sin(23.44 * rad));
  const w = Math.acos((Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(dec)) / (Math.cos(lat * rad) * Math.cos(dec))) / rad;
  const toDate = (jd) => new Date((jd - 2440587.5) * 864e5);
  return [toDate(T - w / 360), toDate(T + w / 360)];
}
const METNO_WMO = (sym = "") => {
  const s = sym.replace(/_(day|night|polartwilight)$/, "");
  if (/thunder/.test(s)) return 95;
  if (s === "clearsky") return 0; if (s === "fair") return 1; if (s === "partlycloudy") return 2; if (s === "cloudy") return 3; if (s === "fog") return 45;
  if (/snowshowers/.test(s)) return /heavy/.test(s) ? 86 : 85;
  if (/snow/.test(s)) return /heavy/.test(s) ? 75 : /light/.test(s) ? 71 : 73;
  if (/sleet/.test(s)) return 66;
  if (/rainshowers/.test(s)) return /heavy/.test(s) ? 82 : /light/.test(s) ? 80 : 81;
  if (/rain/.test(s)) return /heavy/.test(s) ? 65 : /light/.test(s) ? 61 : 63;
  return 3;
};
function fromMetno(j) {
  const ts = j.properties.timeseries, kmh = (v) => (v == null ? null : v * 3.6);
  const isDay = (date) => { const [up, down] = sunTimes(date, METEO.lat, METEO.lon); return date >= up && date < down ? 1 : 0; };
  // neve stimata: con temperatura sotto 1° ogni mm di pioggia è circa 1 cm di neve
  const snowOf = (mm, t) => (mm > 0 && t <= 1 ? mm : 0);
  const hourly = { time: [], temperature_2m: [], weather_code: [], precipitation_probability: [], precipitation: [], wind_speed_10m: [], snowfall: [], is_day: [] };
  ts.filter((e) => e.data.next_1_hours).forEach((e) => {
    const d = new Date(e.time), x = e.data.instant.details, n1 = e.data.next_1_hours;
    hourly.time.push(romeISO(d)); hourly.temperature_2m.push(x.air_temperature); hourly.weather_code.push(METNO_WMO(n1.summary.symbol_code));
    hourly.precipitation_probability.push(n1.details.probability_of_precipitation ?? null); hourly.precipitation.push(n1.details.precipitation_amount ?? 0);
    hourly.wind_speed_10m.push(kmh(x.wind_speed)); hourly.snowfall.push(snowOf(n1.details.precipitation_amount, x.air_temperature)); hourly.is_day.push(isDay(d));
  });
  // giorni: raggruppa per data locale
  const byDay = new Map();
  ts.forEach((e) => {
    const d = new Date(e.time), key = romeISO(d).slice(0, 10), x = e.data.instant.details;
    const next = e.data.next_1_hours || e.data.next_6_hours, mm = next?.details?.precipitation_amount ?? 0;
    const g = byDay.get(key) || { temps: [], codes: [], mm: 0, snow: 0, uv: 0, gust: null };
    g.temps.push(x.air_temperature);
    if (next?.summary) g.codes.push([+romeISO(d).slice(11, 13), METNO_WMO(next.summary.symbol_code)]);
    // conta i millimetri una sola volta: ora per ora finché ci sono, poi a blocchi di 6 ore
    if (e.data.next_1_hours || !ts.some((o) => o.data.next_1_hours && new Date(o.time) > d)) { g.mm += mm; g.snow += snowOf(mm, x.air_temperature); }
    g.uv = Math.max(g.uv, x.ultraviolet_index_clear_sky || 0);
    byDay.set(key, g);
  });
  const days = [...byDay.entries()].slice(0, 9);
  const daily = { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], snowfall_sum: [], precipitation_probability_max: [], precipitation_sum: [], sunrise: [], sunset: [], uv_index_max: [], wind_gusts_10m_max: [] };
  days.forEach(([key, g]) => {
    const [up, down] = sunTimes(new Date(key + "T12:00:00Z"), METEO.lat, METEO.lon);
    // icona del giorno: decidono le ore di luce (9-17); se piove o nevica vince la precipitazione,
    // altrimenti il tempo più frequente
    const day = g.codes.filter(([h]) => h >= 9 && h <= 17).map(([, c]) => c), all = g.codes.map(([, c]) => c);
    const pool = day.length ? day : all, wet = pool.filter((c) => c >= 51);
    const freq = pool.reduce((m, c) => m.set(c, (m.get(c) || 0) + 1), new Map());
    daily.time.push(key); daily.weather_code.push(wet.length ? Math.max(...wet) : pool.length ? [...freq].sort((a, b) => b[1] - a[1])[0][0] : 3);
    daily.temperature_2m_max.push(Math.max(...g.temps)); daily.temperature_2m_min.push(Math.min(...g.temps));
    daily.snowfall_sum.push(g.snow); daily.precipitation_probability_max.push(null); daily.precipitation_sum.push(g.mm);
    daily.sunrise.push(romeISO(up)); daily.sunset.push(romeISO(down)); daily.uv_index_max.push(g.uv); daily.wind_gusts_10m_max.push(null);
  });
  const e0 = ts[0], x0 = e0.data.instant.details, d0 = new Date(e0.time);
  const current = {
    time: romeISO(d0), temperature_2m: x0.air_temperature, apparent_temperature: x0.apparent_air_temperature ?? x0.air_temperature,
    weather_code: METNO_WMO((e0.data.next_1_hours || e0.data.next_6_hours).summary.symbol_code), wind_speed_10m: kmh(x0.wind_speed),
    wind_gusts_10m: kmh(x0.wind_speed_of_gust), snow_depth: null, relative_humidity_2m: Math.round(x0.relative_humidity), freezing_level_height: null, is_day: isDay(d0),
  };
  return { _src: "metno", elevation: METEO.alt, current, hourly, daily };
}

let meteoCache = null;
function getMeteo() {
  if (meteoCache) return meteoCache;
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${METEO.lat}&longitude=${METEO.lon}` +
    "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,snow_depth,relative_humidity_2m,freezing_level_height,is_day" +
    "&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m,snowfall,is_day" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_gusts_10m_max" +
    "&timezone=Europe%2FRome&forecast_days=16";
  // Open-Meteo a volte è sovraccarico (risponde 503). Ordine dei tentativi:
  // Open-Meteo (max 8 s) -> MET Norway, servizio meteo norvegese (max 10 s) -> ultime previsioni
  // salvate in questo browser (al massimo di 2 giorni prima).
  const KEY = "dp_meteo";
  const get = (url, ms) => {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
    return fetch(url, { signal: ctl.signal }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))).finally(() => clearTimeout(t));
  };
  const metno = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${METEO.lat}&lon=${METEO.lon}&altitude=${METEO.alt}`;
  meteoCache = get(u, 8000)
    .catch(() => get(metno, 10000).then(fromMetno))
    .then((d) => { try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), d })); } catch (_) {} return d; })
    .catch((err) => {
      meteoCache = null; // la prossima richiesta riprova davvero
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) || "null");
        if (saved && Date.now() - saved.at < 2 * 864e5) return Object.assign(saved.d, { _stale: true });
      } catch (_) {}
      return Promise.reject(err);
    });
  return meteoCache;
}

// Card grande (home): adesso + schede "Ora per ora" / "7 giorni" / "Dettagli"
function mountMeteoCard(el) {
  if (!el) return;
  el.innerHTML = `<p class="w-status">${T("Carico il meteo di Roccaraso…", "Loading the Roccaraso forecast…")}</p>`;
  getMeteo().then((d) => {
    const c = d.current, dl = d.daily, h = d.hourly;
    const [txt, ico] = WMO(c.weather_code);
    const nowIco = !c.is_day && ico === "sun" ? "moon" : ico;
    // prossime 24 ore
    const start = Math.max(0, h.time.findIndex((t) => t >= c.time.slice(0, 13)));
    const hours = h.time.slice(start, start + 24).map((t, k) => {
      const i = start + k, [htxt, hico] = WMO(h.weather_code[i]);
      const hi = !h.is_day[i] && hico === "sun" ? "moon" : hico;
      return `<li class="w-hour" style="--i:${k}">
        <span class="w-hh">${k === 0 ? T("Ora", "Now") : t.slice(11, 13)}</span>${wIcon(hi)}<span class="sr-only">${htxt}</span>
        <b>${Math.round(h.temperature_2m[i])}°</b>
        <span class="w-pp">${h.snowfall[i] > 0 ? num(h.snowfall[i]) + " cm" : h.precipitation_probability[i] != null ? h.precipitation_probability[i] + "%" : num(h.precipitation[i] || 0) + " mm"}</span>
        <span class="w-wind">${Math.round(h.wind_speed_10m[i])} km/h</span>
      </li>`;
    }).join("");
    const days = dl.time.slice(0, 7).map((t, i) => {
      const dt = new Date(t + "T12:00"), [dtxt, dico] = WMO(dl.weather_code[i]), snow = dl.snowfall_sum[i];
      return `<li class="w-day" style="--i:${i}">
        <span class="w-dname">${i === 0 ? T("Oggi", "Today") : GIORNI_BREVI[dt.getDay()] + " " + dt.getDate()}</span>
        ${wIcon(dico)}<span class="sr-only">${dtxt}</span>
        <span class="w-mm"><b>${Math.round(dl.temperature_2m_max[i])}°</b> ${Math.round(dl.temperature_2m_min[i])}°</span>
        <span class="w-snow">${snow > 0 ? `${num(snow)} cm ${T("neve", "snow")}` : dl.precipitation_probability_max[i] != null ? `${dl.precipitation_probability_max[i]}%` : `${num(dl.precipitation_sum[i] || 0)} mm`}</span>
      </li>`;
    }).join("");
    const facts = [
      [T("Alba", "Sunrise"), hhmm(dl.sunrise[0])], [T("Tramonto", "Sunset"), hhmm(dl.sunset[0])], [T("Indice UV", "UV index"), num(dl.uv_index_max[0])],
      [T("Raffiche", "Gusts"), dl.wind_gusts_10m_max[0] != null && `${Math.round(dl.wind_gusts_10m_max[0])} km/h`], [T("Umidità", "Humidity"), `${c.relative_humidity_2m}%`], [T("Zero termico", "Freezing level"), c.freezing_level_height != null && `${Math.round(c.freezing_level_height)} m`],
    ].filter(([, v]) => v).map(([k, v], i) => `<div class="w-tile" style="--i:${i}"><dt>${k}</dt><dd>${v}</dd></div>`).join("");

    el.innerHTML = `
      <div class="w-now">
        <span class="badge badge-gray">${esc(METEO.place)} · ${Math.round(d.elevation)} m</span>
        <div class="w-temp">${wIcon(nowIco)}<span class="w-count" data-to="${Math.round(c.temperature_2m)}">0</span><span>°</span></div>
        <p class="w-cond">${txt}</p>
        <dl class="w-facts">
          <div><dt>${T("Percepita", "Feels like")}</dt><dd>${Math.round(c.apparent_temperature)}°</dd></div>
          <div><dt>${T("Vento", "Wind")}</dt><dd>${Math.round(c.wind_speed_10m)} km/h</dd></div>
          ${c.snow_depth != null ? `<div><dt>${T("Neve al suolo", "Snow depth")}</dt><dd>${Math.round(c.snow_depth * 100)} cm</dd></div>` : `<div><dt>${T("Umidità", "Humidity")}</dt><dd>${c.relative_humidity_2m}%</dd></div>`}
          <div><dt>${T("Tramonto", "Sunset")}</dt><dd>${hhmm(dl.sunset[0])}</dd></div>
        </dl>
      </div>
      <div class="w-side">
        <div class="filters w-tabs" role="tablist">
          <button data-f="ore" role="tab">${T("Ora per ora", "Hourly")}</button><button data-f="giorni" role="tab">${T("7 giorni", "7 days")}</button><button data-f="dettagli" role="tab">${T("Dettagli", "Details")}</button>
        </div>
        <ul class="w-panel w-hours" data-p="ore">${hours}</ul>
        <ul class="w-panel w-days" data-p="giorni">${days}</ul>
        <dl class="w-panel w-tiles" data-p="dettagli">${facts}</dl>
      </div>
      <p class="w-src">${T("Previsioni", "Forecast")} ${d._src === "metno" ? "MET Norway" : "Open-Meteo"} · ${d._stale ? T(`ultime disponibili, del ${+c.time.slice(8, 10)}/${+c.time.slice(5, 7)} alle ${hhmm(c.time)}`, `latest available, from ${+c.time.slice(8, 10)}/${+c.time.slice(5, 7)} at ${hhmm(c.time)}`) : T(`aggiornate alle ${hhmm(c.time)}`, `updated at ${hhmm(c.time)}`)}</p>`;

    const panels = $$(".w-panel", el);
    initFilters($(".w-tabs", el), (v) => panels.forEach((p) => {
      const on = p.dataset.p === v;
      p.hidden = !on;
      if (on) { p.classList.remove("w-in"); void p.offsetWidth; p.classList.add("w-in"); }
    }), "ore");
    // la temperatura conta fino al valore quando la card entra nello schermo
    const cnt = $(".w-count", el), to = +cnt.dataset.to;
    new IntersectionObserver(([en], obs) => {
      if (!en.isIntersecting) return; obs.disconnect();
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { cnt.textContent = to; return; }
      const t0 = performance.now(), dur = 900;
      const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); cnt.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      el.classList.add("w-live");
    }, { threshold: 0.3 }).observe(el);
  }).catch(() => {
    // Servizio meteo giù e nessuna previsione salvata: messaggio chiaro, bottone per riprovare
    // e un nuovo tentativo automatico dopo un minuto
    el.innerHTML = `<div class="w-down">
      <p><strong>${T("Il servizio meteo non risponde.", "The weather service is not responding.")}</strong> ${T("Capita quando è sovraccarico: di solito torna in pochi minuti.", "It happens when it is overloaded: it is usually back within a few minutes.")}</p>
      <button class="btn btn-sm" type="button">${T("Riprova", "Try again")}</button>
    </div>`;
    const retry = () => { clearTimeout(auto); mountMeteoCard(el); };
    const auto = setTimeout(retry, 60000);
    $("button", el).addEventListener("click", retry);
  });
}

// Previsione di una data (pagina evento)
function mountMeteoDay(el, id) {
  if (!el) return;
  getMeteo().then((d) => {
    const i = d.daily.time.indexOf(id);
    if (i < 0) { el.innerHTML = `<p class="w-status">${T("Le previsioni per questa data compaiono 16 giorni prima. Intanto guarda il", "The forecast for this date appears 16 days ahead. Meanwhile, check")} <a href="${L("/come-arrivare")}#meteo">${T("meteo di oggi", "today\'s weather")}</a>.</p>`; return; }
    const dl = d.daily, [txt, ico] = WMO(dl.weather_code[i]), snow = dl.snowfall_sum[i];
    el.innerHTML = `<div class="w-inline">${wIcon(ico)}<div><strong>${txt} · ${Math.round(dl.temperature_2m_max[i])}° / ${Math.round(dl.temperature_2m_min[i])}°</strong>
      <span>${snow > 0 ? `${T("Neve prevista", "Snow expected")} ${num(snow)} cm · ` : ""}${dl.precipitation_probability_max[i] != null ? `${T("Precipitazioni", "Precipitation")} ${dl.precipitation_probability_max[i]}%` : `${T("Precipitazioni", "Precipitation")} ${num(dl.precipitation_sum[i] || 0)} mm`} · ${T("Alba", "Sunrise")} ${hhmm(dl.sunrise[i])} · ${T("Tramonto", "Sunset")} ${hhmm(dl.sunset[i])}</span></div></div>`;
  }).catch(() => { el.innerHTML = `<p class="w-status">${T("Il servizio meteo in questo momento non risponde. Riprova tra qualche minuto.", "The weather service is not responding right now. Please try again in a few minutes.")}</p>`; });
}
