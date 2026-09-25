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

/* Foto: su schermi fino a 800px usa le versioni leggere in img/m/,
   e ogni foto si scarica solo quando sta per entrare nello schermo. */
const SMALL = matchMedia("(max-width: 800px)").matches;
const srcFor = (src) => (SMALL && /^img\/[^/]+\.jpg$/.test(src) ? src.replace("img/", "img/m/") : src);
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
const MENU_LINKS = [
  ["calendario.html", "Eventi"],
  ["artisti.html", "Artisti"],
  ["evento.html?d=2026-12-05", "Opening 5.12"],
  ["aggiornamenti.html", "News"],
  ["index.html#meteo", "Meteo"],
  ["tavoli.html", "Tavoli"],
  ["chi-siamo.html#arco", "Lo stage"],
  ["chi-siamo.html", "Chi siamo"],
  ["whatsapp", "WhatsApp"],
];
function mountHeader() {
  const slot = $("#siteHeader"); if (!slot) return;
  slot.outerHTML = `
<div class="page-bg" id="pageBg" aria-hidden="true"></div>
<div class="load-bar" id="loadBar" aria-hidden="true"></div>
<header class="topbar">
  <div class="pill" id="pill">
    <div class="pill-bar">
      <a href="index.html" class="logo" aria-label="Disco Pleasure home">${WM}</a>
      <button class="pill-btn" id="menuBtn" aria-expanded="false" aria-controls="pillMenu">Menu</button>
    </div>
    <nav class="pill-menu" id="pillMenu" aria-label="Menu principale">
      <ul class="menu-links">${MENU_LINKS.map(([h, t]) => h === "whatsapp"
        ? `<li><a href="${waLink("Ciao! Vorrei informazioni su Disco Pleasure.")}" target="_blank" rel="noopener">${t}</a></li>`
        : `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      <div class="menu-rail">${MENU_RAIL.map((m) => `
        <a class="mini" href="${m.href}">${art(m.img)}<span class="mini-top"><span class="mini-tape">${esc(m.title)}&nbsp;&nbsp;·&nbsp;&nbsp;${esc(m.title)}&nbsp;&nbsp;·&nbsp;&nbsp;</span></span><span class="mini-day">${esc(m.day)}</span></a>`).join("")}
      </div>
    </nav>
  </div>
</header>`;
}

function mountFooter() {
  const slot = $("#siteFooter"); if (!slot) return;
  slot.outerHTML = `
<footer class="footer" id="footer">
  <div class="footer-inner">
    <a href="index.html" class="logo footer-logo" aria-label="Disco Pleasure, home">${WM}</a>
    <nav class="footer-nav" aria-label="Link">
      <a href="#">Instagram</a><a href="#">TikTok</a><a href="tavoli.html">Tavoli</a><a href="${waLink("Ciao! Vorrei informazioni su Disco Pleasure.")}" target="_blank" rel="noopener">WhatsApp</a><a href="#">Privacy</a>
    </nav>
    <p class="footer-meta">Chalet Valentino · a valle delle Gravare · Roccaraso · © 2026 Disco Pleasure</p>
  </div>
</footer>`;
}

function initMenu() {
  const pill = $("#pill"), btn = $("#menuBtn"); if (!pill) return;
  let t;
  const set = (open) => {
    if (open === pill.classList.contains("open")) return;
    pill.classList.add("animating");
    pill.classList.toggle("open", open);
    if (open) pill.classList.remove("is-dark");
    btn.setAttribute("aria-expanded", open);
    btn.textContent = open ? "Chiudi" : "Menu";
    if (open) menuRail?.reset();
    clearTimeout(t);
    t = setTimeout(() => pill.classList.remove("animating"), 1000);
  };
  pill.addEventListener("transitionend", (e) => {
    if (e.target === pill && e.propertyName === "height") { clearTimeout(t); pill.classList.remove("animating"); }
  });
  btn.addEventListener("click", () => set(!pill.classList.contains("open")));
  $$("#pillMenu a").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  // chiude con un clic fuori, ma solo se anche la pressione è iniziata fuori (non dopo un trascinamento)
  let downInside = false;
  document.addEventListener("pointerdown", (e) => { downInside = pill.contains(e.target); }, true);
  document.addEventListener("click", (e) => { if (!pill.contains(e.target) && !downInside) set(false); });
}

/* Fila di card del menu: carosello centrato, infinito, da trascinare, che scatta di una card */
let menuRail = null;
function initMenuRail() {
  const rail = $(".menu-rail"); if (!rail) return;
  const slides = [...rail.children]; const n = slides.length; if (!n) return;
  let active = 0, drag = null, w = 0;
  const wrap = (k) => ((k % n) + n) % n;
  const place = (dx = 0, animate = true) => {
    w = rail.clientWidth;
    const sw = 0.4 * (w + 8);                 // larghezza di una card + spazio (come Hï)
    const cx = (w - sw) / 2;                   // card attiva centrata
    slides.forEach((el, k) => {
      let off = wrap(k - active); if (off > n / 2) off -= n; // giro infinito: metà a destra, metà a sinistra
      const x = cx + off * sw + dx;
      const jump = el._off !== undefined && Math.abs(el._off - off) > 1; // passa dall'altra parte: niente animazione
      el.style.transition = animate && !jump && !drag ? "transform .45s cubic-bezier(.22, 1, .36, 1)" : "none";
      el.style.width = `${sw - 8}px`;
      el.style.transform = `translateX(${x}px)`;
      el._off = off;
    });
  };
  const go = (k) => { active = wrap(k); place(); };
  rail.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, dx: 0, moved: false, id: e.pointerId }; });
  addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x; if (Math.abs(drag.dx) > 6) drag.moved = true;
    if (drag.moved) place(drag.dx, false);
  });
  const end = () => {
    if (!drag) return;
    const steps = Math.abs(drag.dx) > 40 ? -Math.sign(drag.dx) : 0; // una card per gesto, come Hï
    const moved = drag.moved; drag = null;
    go(active + steps);
    if (moved) rail.dataset.justDragged = "1", setTimeout(() => delete rail.dataset.justDragged, 50);
  };
  addEventListener("pointerup", end); addEventListener("pointercancel", end);
  rail.addEventListener("click", (e) => { if (rail.dataset.justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);
  slides.forEach((el) => { el.setAttribute("draggable", "false"); });
  addEventListener("resize", () => place(0, false));
  menuRail = { reset: () => { active = 0; slides.forEach((el) => delete el._off); place(0, false); } };
  place(0, false);
}

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
  const pairs = $$(".chapter").map((ch) => [$(".giant", ch), $(".sentinel", ch)]).filter(([h, d]) => h && d);
  if (!pairs.length) return;
  const lerp = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
  const update = () => {
    const vh = innerHeight;
    pairs.forEach(([h, dot]) => {
      const y = dot.getBoundingClientRect().top / vh;
      const o = y > 0.45 ? 1 - lerp(y, 0.45, 0.70) : y > 0.33 ? 1 : lerp(y, 0.13, 0.33);
      h.style.opacity = o.toFixed(3);
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

/* ============ CAROSELLI CON PALLINI ============ */
function initCarousels(root = document) {
  $$("[data-carousel]", root).forEach((c) => {
    const rail = $(".rail", c), dotsEl = $(".dots", c);
    const cards = [...rail.children]; if (!cards.length) return;
    dotsEl.innerHTML = cards.map((_, i) => `<button aria-label="Vai alla slide ${i + 1}"></button>`).join("");
    const dots = [...dotsEl.children];
    const pad = () => parseFloat(getComputedStyle(rail).paddingLeft);
    const update = () => {
      const x = rail.scrollLeft;
      let idx = 0, best = Infinity;
      cards.forEach((card, i) => { const d = Math.abs(card.offsetLeft - pad() - x); if (d < best) { best = d; idx = i; } });
      if (x >= rail.scrollWidth - rail.clientWidth - 4) idx = cards.length - 1 - Math.max(0, Math.floor((rail.clientWidth - pad()) / (cards[0].offsetWidth + 8)) - 1);
      if (x <= 4) idx = 0;
      dots.forEach((d, i) => d.classList.toggle("on", i === idx));
    };
    dots.forEach((d, i) => d.addEventListener("click", () => rail.scrollTo({ left: cards[i].offsetLeft - pad(), behavior: "smooth" })));
    rail.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  });
}

/* ============ FILTRI A PILLOLA ============ */
// <div class="filters" data-filters> con <button data-f="..."> ; callback(valore)
function initFilters(el, onChange, initial) {
  const btns = $$("button", el);
  const set = (v) => { btns.forEach((b) => b.classList.toggle("on", b.dataset.f === v)); onChange(v); };
  btns.forEach((b) => b.addEventListener("click", () => set(b.dataset.f)));
  set(initial ?? btns[0].dataset.f);
}

/* ============ FORM ISCRIZIONE ============ */
function initNewsletter() {
  $$("[data-nl]").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    $(".nl-msg", f).textContent = "Grazie! Ti scriveremo con date, meteo e tavoli.";
    $$("input", f).forEach((i) => (i.type === "checkbox" ? (i.checked = false) : (i.value = "")));
  }));
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
  $$("svg[data-ball]").forEach((svg) => balls.push(build(svg, svg.dataset.ball)));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0;
  const frame = () => {
    if (!reduce) t += 0.006;
    balls.forEach((b) => b.els.forEach((e, k) => e.setAttribute("rx", Math.max(0.5, Math.abs(R * Math.cos((k * Math.PI) / b.n + t))).toFixed(1))));
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
    <a class="ev-head" href="evento.html?d=${e.id}">
      <span class="ev-name">${esc(e.title === "Disco Pleasure" ? "Disco Pleasure · Après-ski" : e.title)}</span>
      <span class="ev-time">${esc(e.hours.replace("–", "–"))}</span>
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
        ${tickets ? `<a class="btn btn-black" href="${esc(e.tickets)}" target="_blank" rel="noopener">Biglietti</a>` : ""}
        <a class="btn btn-black" href="${waLink(tableMsg(e))}" target="_blank" rel="noopener">${tickets ? "Tavoli" : "Prenota tavolo"}</a>
      </div>
    </div>
  </article>`;
}

// Filtri per mese + griglia di card della stagione
function mountEventGrid(filtersEl, gridEl, { tickets = true, events = EVENTS } = {}) {
  const months = [...new Set(events.map((e) => e.month))];
  filtersEl.innerHTML = `<button data-f="all">Tutte</button>` + months.map((m) => `<button data-f="${m}">${MESI[m - 1][0].toUpperCase() + MESI[m - 1].slice(1)}</button>`).join("");
  const initial = qs("m") && months.includes(+qs("m")) ? qs("m") : "all";
  initFilters(filtersEl, (v) => {
    const list = v === "all" ? events : events.filter((e) => String(e.month) === v);
    gridEl.innerHTML = list.map((e) => eventCard(e, { tickets })).join("");
  }, initial);
}

/* ============ AVVIO COMUNE ============ */
function bootSite() {
  mountHeader();
  mountFooter();
  initSpotlights();
  initLoadBar();
  paintAll();
  initBalls();
  initMenu();
  initMenuRail();
  initScroll();
  initGiants();
  initCarousels();
  initNewsletter();
  requestAnimationFrame(() => $("#pageBg")?.classList.add("on"));
}

/* ============ METEO ROCCARASO ============ */
const WMO = (c) =>
  c === 0 ? ["Sereno", "sun"] : c === 1 ? ["Poco nuvoloso", "sunc"] : c === 2 ? ["Parz. nuvoloso", "sunc"] : c === 3 ? ["Coperto", "cloud"] :
  c <= 48 ? ["Nebbia", "fog"] : c <= 57 ? ["Pioviggine", "rain"] : c <= 67 ? ["Pioggia", "rain"] : c <= 77 ? ["Neve", "snow"] :
  c <= 82 ? ["Rovesci", "rain"] : c <= 86 ? ["Rovesci di neve", "snow"] : ["Temporale", "storm"];
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
let meteoCache = null;
function getMeteo() {
  if (meteoCache) return meteoCache;
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${METEO.lat}&longitude=${METEO.lon}` +
    "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,snow_depth,relative_humidity_2m,freezing_level_height,is_day" +
    "&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m,snowfall,is_day" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_gusts_10m_max" +
    "&timezone=Europe%2FRome&forecast_days=16";
  meteoCache = fetch(u).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
  return meteoCache;
}

// Card grande (home): adesso + schede "Ora per ora" / "7 giorni" / "Dettagli"
function mountMeteoCard(el) {
  if (!el) return;
  el.innerHTML = `<p class="w-status">Carico il meteo di Roccaraso…</p>`;
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
        <span class="w-hh">${k === 0 ? "Ora" : t.slice(11, 13)}</span>${wIcon(hi)}<span class="sr-only">${htxt}</span>
        <b>${Math.round(h.temperature_2m[i])}°</b>
        <span class="w-pp">${h.snowfall[i] > 0 ? num(h.snowfall[i]) + " cm" : h.precipitation_probability[i] + "%"}</span>
        <span class="w-wind">${Math.round(h.wind_speed_10m[i])} km/h</span>
      </li>`;
    }).join("");
    const days = dl.time.slice(0, 7).map((t, i) => {
      const dt = new Date(t + "T12:00"), [dtxt, dico] = WMO(dl.weather_code[i]), snow = dl.snowfall_sum[i];
      return `<li class="w-day" style="--i:${i}">
        <span class="w-dname">${i === 0 ? "Oggi" : GIORNI_BREVI[dt.getDay()] + " " + dt.getDate()}</span>
        ${wIcon(dico)}<span class="sr-only">${dtxt}</span>
        <span class="w-mm"><b>${Math.round(dl.temperature_2m_max[i])}°</b> ${Math.round(dl.temperature_2m_min[i])}°</span>
        <span class="w-snow">${snow > 0 ? `${num(snow)} cm neve` : `${dl.precipitation_probability_max[i]}%`}</span>
      </li>`;
    }).join("");
    const facts = [
      ["Alba", hhmm(dl.sunrise[0])], ["Tramonto", hhmm(dl.sunset[0])], ["Indice UV", num(dl.uv_index_max[0])],
      ["Raffiche", `${Math.round(dl.wind_gusts_10m_max[0])} km/h`], ["Umidità", `${c.relative_humidity_2m}%`], ["Zero termico", `${Math.round(c.freezing_level_height)} m`],
    ].map(([k, v], i) => `<div class="w-tile" style="--i:${i}"><dt>${k}</dt><dd>${v}</dd></div>`).join("");

    el.innerHTML = `
      <div class="w-now">
        <span class="badge badge-gray">${esc(METEO.place)} · ${Math.round(d.elevation)} m</span>
        <div class="w-temp">${wIcon(nowIco)}<span class="w-count" data-to="${Math.round(c.temperature_2m)}">0</span><span>°</span></div>
        <p class="w-cond">${txt}</p>
        <dl class="w-facts">
          <div><dt>Percepita</dt><dd>${Math.round(c.apparent_temperature)}°</dd></div>
          <div><dt>Vento</dt><dd>${Math.round(c.wind_speed_10m)} km/h</dd></div>
          <div><dt>Neve al suolo</dt><dd>${Math.round((c.snow_depth || 0) * 100)} cm</dd></div>
          <div><dt>Tramonto</dt><dd>${hhmm(dl.sunset[0])}</dd></div>
        </dl>
      </div>
      <div class="w-side">
        <div class="filters w-tabs" role="tablist">
          <button data-f="ore" role="tab">Ora per ora</button><button data-f="giorni" role="tab">7 giorni</button><button data-f="dettagli" role="tab">Dettagli</button>
        </div>
        <ul class="w-panel w-hours" data-p="ore">${hours}</ul>
        <ul class="w-panel w-days" data-p="giorni">${days}</ul>
        <dl class="w-panel w-tiles" data-p="dettagli">${facts}</dl>
      </div>
      <p class="w-src">Previsioni Open-Meteo · aggiornate alle ${hhmm(c.time)}</p>`;

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
  }).catch(() => { el.innerHTML = `<p class="w-status">Meteo non disponibile in questo momento.</p>`; });
}

// Previsione di una data (pagina evento)
function mountMeteoDay(el, id) {
  if (!el) return;
  getMeteo().then((d) => {
    const i = d.daily.time.indexOf(id);
    if (i < 0) { el.innerHTML = `<p class="w-status">Le previsioni per questa data compaiono 16 giorni prima. Intanto guarda il <a href="index.html#meteo">meteo di oggi</a>.</p>`; return; }
    const dl = d.daily, [txt, ico] = WMO(dl.weather_code[i]), snow = dl.snowfall_sum[i];
    el.innerHTML = `<div class="w-inline">${wIcon(ico)}<div><strong>${txt} · ${Math.round(dl.temperature_2m_max[i])}° / ${Math.round(dl.temperature_2m_min[i])}°</strong>
      <span>${snow > 0 ? `Neve prevista ${num(snow)} cm · ` : ""}Precipitazioni ${dl.precipitation_probability_max[i]}% · Alba ${hhmm(dl.sunrise[i])} · Tramonto ${hhmm(dl.sunset[i])}</span></div></div>`;
  }).catch(() => { el.innerHTML = `<p class="w-status">Meteo non disponibile in questo momento.</p>`; });
}
