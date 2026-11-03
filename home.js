/* =========================================================
   SOLO HOME: struttura e animazioni alla UNVRS
   - titolo fisso al centro, parole che salgono una alla volta, poi sfuma scorrendo
   - titoli di sezione che entrano parola per parola, card che scivolano dentro
   - frecce con barretta di avanzamento e percentuale che "si mescola"
   ========================================================= */

const pad = (n) => String(n).padStart(2, "0");

// Card verticale (3:4): immagine, etichetta in mono e titolo in basso a sinistra.
// Il contenitore .u-slide fa l'entrata, la .u-card fa il restringimento al passaggio del mouse.
// Con "foot": card con la scritta sotto e, a parte, il link ai tickets (o "in arrivo" se manca).
const uCard = ({ href, media, label, title, foot, tickets }, i) => `
  <div class="u-slide" style="--i:${i}">
    <a class="u-card${foot ? " u-card-foot" : ""}" href="${href}">
      <div class="u-card-media">${media}</div>
      <div class="u-card-text">
        <span class="u-mono u-card-label">${esc(label)}</span>
        <h3 class="u-card-title">${esc(title)}</h3>
      </div>
    </a>
    ${foot ? (tickets ? `<a class="u-mono u-card-foot-link" href="${tickets}" target="_blank" rel="noopener">Tickets ↗</a>` : `<span class="u-mono u-card-foot-link u-soon">${T("Tickets in arrivo", "Tickets coming soon")}</span>`) : ""}
  </div>`;

function renderHome() {
  // Season 26-27: i quattro momenti della stagione
  $("#seasonRail").innerHTML = HOME.residencies.map((r, i) =>
    uCard({ href: r.href, media: art(r.img), label: r.day, title: r.title }, i)).join("");

  // Played here: i DJ passati da Disco Pleasure (sagoma finché non c'è la foto)
  $("#lineupRail").innerHTML = HOME.residents.map((a, i) =>
    uCard({ href: L(`/artisti/${a.slug}`), media: a.img ? art(a.img) : `<div class="art silhouette" role="img" aria-label="${T("Foto di", "Photo of")} ${esc(a.name)} ${T("in arrivo", "coming soon")}"></div>`, label: a.day, title: a.name }, i)).join("");

  // Prossime date: sigillo nei colori del marchio, scritta sotto, link Eventbrite
  $("#ticketsRail").innerHTML = HOME.tickets.map((t, i) => {
    const [bg, fg] = ["#050507", "#ffffff"]; // tutte le card: fondo nero, mappamondo bianco
    const media = `<span class="seal-card" style="--sb:${bg};--sf:${fg}"><svg class="seal" data-ball="seal" data-speed="${(0.8 + (i % 3) * 0.2).toFixed(1)}" aria-hidden="true"></svg></span>`;
    return uCard({ href: t.href, media, label: t.day, title: t.title, foot: true, tickets: t.tickets }, i);
  }).join("");

  // Numerini in apice, come "Residents 2026 ⁰⁹"
  $("#seasonCount").textContent = pad(HOME.residencies.length);
  $("#lineupCount").textContent = pad(HOME.residents.length);
  $("#ticketsCount").textContent = pad(HOME.tickets.length);

}

/* ============ FRECCE + BARRETTA + PERCENTUALE ============ */
function initRails() {
  const ARROW = (dir) => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${dir < 0 ? "M10 3 5 8l5 5M5 8h9" : "M6 3l5 5-5 5M11 8H2"}"/></svg>`;
  $$(".u-nav").forEach((nav) => {
    const rail = document.getElementById(nav.dataset.for); if (!rail) return;
    nav.innerHTML = `<div class="u-meter"><span class="u-pct">0%</span><span class="u-progress"><span class="u-progress-fill"></span></span></div>
      <button class="u-arrow" type="button" aria-label="Indietro">${ARROW(-1)}</button><button class="u-arrow" type="button" aria-label="Avanti">${ARROW(1)}</button>`;
    const fill = $(".u-progress-fill", nav), pct = $(".u-pct", nav), [prev, next] = $$(".u-arrow", nav);
    const mobPct = rail.parentElement.querySelector(".u-pct-mobile");
    const step = () => { const c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + 20 : rail.clientWidth; };
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const p = max <= 2 ? 1 : Math.min(1, rail.scrollLeft / max);
      const seen = max <= 2 ? 1 : Math.min(1, (rail.clientWidth + rail.scrollLeft) / rail.scrollWidth);
      fill.style.width = (seen * 100).toFixed(1) + "%";
      const txt = Math.round(p * 100) + "%";
      scrambleTo(pct, txt); if (mobPct) scrambleTo(mobPct, txt);
      prev.disabled = rail.scrollLeft <= 2; next.disabled = rail.scrollLeft >= max - 2;
      nav.classList.toggle("u-nav-off", max <= 2);
    };
    prev.addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => rail.scrollBy({ left: step(), behavior: "smooth" }));
    rail.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  });
}

/* ============ APERTURA: macchina da scrivere (come prima) ============ */
function initTypewriter() {
  const el = $("#heroWords"); if (!el) return;
  const words = el.dataset.words.split("|");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = words[words.length - 1]; return; }
  const TYPE = 60, ERASE = 45, HOLD = 650;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(el);
  const waitVisible = async () => { while (!visible) await sleep(200); };
  (async () => {
    let w = 0;
    el.textContent = words[0];
    await sleep(500); // lascia finire l'entrata dal basso
    for (;;) {
      await sleep(HOLD);
      await waitVisible();
      const cur = words[w], next = words[(w + 1) % words.length];
      for (let n = cur.length - 1; n >= 0; n--) { el.textContent = cur.slice(0, n) || " "; await sleep(ERASE); }
      for (let n = 1; n <= next.length; n++) { el.textContent = next.slice(0, n); await sleep(TYPE); }
      w = (w + 1) % words.length;
    }
  })();
}

/* ============ APERTURA: titolo fisso che sfuma e scende scorrendo (come UNVRS) ============ */
function initHeroScroll() {
  const inner = $("#heroInner"), wrap = $("#heroFixed"), subBox = $("#heroSubBox"), ticks = $$(".u-tick"); if (!inner) return;
  scrollHooks.push(() => {
    const y = scrollY, vh = innerHeight;
    // come UNVRS: a 300px di scroll (su 900) il titolo è a opacità 0,41 e scala 0,91
    const p = Math.min(1, Math.max(0, y / (vh * 0.56)));
    inner.style.opacity = (1 - p).toFixed(3);
    inner.style.transform = `translateY(${(y * 0.09).toFixed(1)}px) scale(${(1 - 0.15 * p).toFixed(3)})`;
    wrap.style.visibility = p >= 1 ? "hidden" : "visible";
    // sottotitolo e trattini restano fermi, spariscono quando arriva la prima sezione
    const q = Math.min(1, Math.max(0, (y - vh * 0.45) / (vh * 0.2)));
    const o = (1 - q).toFixed(3);
    if (subBox) { subBox.style.opacity = o; subBox.style.visibility = q >= 1 ? "hidden" : "visible"; }
    ticks.forEach((t) => { t.style.opacity = (0.5 * (1 - q)).toFixed(3); t.style.visibility = q >= 1 ? "hidden" : "visible"; });
  });
}

/* ============ AVVIO ============ */
renderHome();
bootSite();
initRails();
initTypewriter();
initHeroScroll();
