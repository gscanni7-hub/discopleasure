/* =========================================================
   SOLO HOME
   ========================================================= */

function renderHome() {
  $("#residencyDeck").innerHTML = HOME.residencies.map((r) => `
    <div class="deck-card dark">
      ${art(r.img)}
      <div class="deck-body">
        <span class="res-day">${esc(r.day)}</span>
        <h3 class="res-title">${esc(r.title)}</h3>
        <a class="btn btn-white btn-sm" href="${r.href}">Scopri di più</a>
      </div>
    </div>`).join("");

  // "Been here" come i resident di Hï: ritratto in bianco e nero, nome grande.
  // Senza foto si vede una sagoma scura.
  $("#residentsRail").innerHTML = HOME.residents.map((a) => `
    <div class="tile portrait dark">
      <div class="tile-img">${a.img ? art(a.img) : `<div class="art silhouette" role="img" aria-label="Foto di ${esc(a.name)} in arrivo"></div>`}</div>
      <div class="tile-body">
        <span class="badge">${esc(a.day)}</span>
        <h3 class="tile-title">${esc(a.name)}</h3>
      </div>
    </div>`).join("");

  // Biglietti come le card "Music" di Hï: scure, bottone blu a tutta larghezza.
  // Al posto della foto il sigillo con la palla, nei colori del marchio a rotazione.
  const INK = "#050507", HEAT = "#FF5A1F", SNOW = "#EEECE5", ICE = "#3FC6F5";
  const COMBO = [[HEAT, INK], [INK, HEAT], [SNOW, INK], [ICE, INK], [INK, ICE], [HEAT, SNOW], [INK, SNOW]];
  $("#ticketsRail").innerHTML = HOME.tickets.map((t, i) => ({ ...t, bg: COMBO[i % COMBO.length][0], fg: COMBO[i % COMBO.length][1], speed: (0.8 + (i % 3) * 0.2).toFixed(1) })).map((t) => `
    <div class="tile dark">
      <a class="tile-img" href="${t.href}" aria-label="${esc(t.title)}"><span class="seal-card" style="--sb:${t.bg};--sf:${t.fg}"><svg class="seal" data-ball="seal" data-speed="${t.speed}" aria-hidden="true"></svg></span></a>
      <div class="tile-body">
        <span class="badge">${esc(t.day)}</span>
        <h3 class="tile-title">${esc(t.title)}</h3>
        <a class="btn" href="${t.tickets}" target="_blank" rel="noopener">Biglietti</a>
      </div>
    </div>`).join("");

  $("#newsRail").innerHTML = NEWS.slice(0, 5).map((n) => `
    <a class="poster dark" href="/news/${n.id}">
      ${art(n.img)}
      <div class="poster-body">
        <span class="badge">${esc(n.tag)}</span>
        <h3 class="poster-title">${esc(n.title)}</h3>
        <span class="btn btn-white btn-sm">Leggi</span>
      </div>
    </a>`).join("");
}

/* ============ HERO: la parola sfuma mentre sale ============ */
function initHeroFade() {
  const hero = $("#heroWords"); if (!hero) return;
  scrollHooks.push(() => {
    const top = hero.getBoundingClientRect().top;
    hero.style.opacity = Math.min(1, Math.max(0, (top - 60) / (innerHeight * 0.22))).toFixed(3);
  });
}

/* ============ IL PONTE: mazzo di card da trascinare ============ */
function initDeck() {
  const deck = $("#residencyDeck");
  let order = $$(".deck-card", deck);
  let inView = false;
  const layout = () => {
    order.forEach((c, k) => {
      c.classList.toggle("front", k === 0);
      c.style.zIndex = order.length - k;
      c.style.opacity = k > 2 ? 0 : 1;
      c.style.transform = `translateY(${-20 * Math.min(k, 3)}px) scale(${1 - 0.1 * Math.min(k, 3)})`;
      c.style.pointerEvents = k === 0 ? "auto" : "none";
    });
    if (inView) requestAnimationFrame(() => order[0].classList.add("show"));
  };
  new IntersectionObserver(([en]) => {
    inView = en.isIntersecting;
    order[0].classList.toggle("show", inView);
  }, { threshold: 0.45 }).observe(deck);

  let x0 = null, dx = 0, moved = false, card = null;
  deck.addEventListener("pointerdown", (e) => {
    card = e.target.closest(".deck-card.front"); if (!card) return;
    x0 = e.clientX; dx = 0; moved = false; card.classList.add("dragging");
  });
  addEventListener("pointermove", (e) => {
    if (x0 === null) return;
    dx = e.clientX - x0; if (Math.abs(dx) > 6) moved = true;
    card.style.transform = `translateX(${dx}px) rotateZ(${dx / 20}deg)`;
  });
  addEventListener("pointerup", () => {
    if (x0 === null) return;
    const c = card; x0 = null; c.classList.remove("dragging");
    if (Math.abs(dx) > 100) {
      c.style.transform = `translateX(${Math.sign(dx) * innerWidth}px) rotateZ(${Math.sign(dx) * 30}deg)`;
      c.style.opacity = 0; c.classList.remove("show");
      setTimeout(() => { order = [...order.slice(1), c]; layout(); }, 300);
    } else layout();
  });
  deck.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
  $$("a", deck).forEach((a) => a.setAttribute("draggable", "false"));
  layout();
}

/* ============ HERO: macchina da scrivere ============ */
function initTypewriter() {
  const el = $("#heroWords");
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
    for (;;) {
      await sleep(HOLD);
      await waitVisible();
      const cur = words[w], next = words[(w + 1) % words.length];
      for (let n = cur.length - 1; n >= 0; n--) { el.textContent = cur.slice(0, n) || " "; await sleep(ERASE); }
      for (let n = 1; n <= next.length; n++) { el.textContent = next.slice(0, n); await sleep(TYPE); }
      w = (w + 1) % words.length;
    }
  })();
}

/* ============ AVVIO ============ */
renderHome();
bootSite();
initHeroFade();
initDeck();
initTypewriter();
mountMeteoCard($("#meteoCard"));
