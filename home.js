/* =========================================================
   SOLO HOME
   ========================================================= */

function renderHome() {
  $("#specialRail").innerHTML = HOME.special.map((e) => `
    <a class="poster dark" href="${e.href}">
      ${art(e.img)}
      <div class="poster-body">
        <span class="poster-date">${esc(e.date)}</span>
        <h3 class="poster-title">${esc(e.title)}</h3>
        <span class="btn btn-white btn-sm">Scopri le date</span>
      </div>
    </a>`).join("");

  $("#residencyDeck").innerHTML = HOME.residencies.map((r) => `
    <div class="deck-card dark">
      ${art(r.img)}
      <div class="deck-body">
        <span class="res-day">${esc(r.day)}</span>
        <h3 class="res-title">${esc(r.title)}</h3>
        <a class="btn btn-white btn-sm" href="${r.href}">Scopri di più</a>
      </div>
    </div>`).join("");

  $("#residentsRail").innerHTML = HOME.residents.map((a) => `
    <a class="tile dark" href="/artisti">
      <div class="tile-img">${art(a.img)}</div>
      <div class="tile-body">
        <span class="badge">${esc(a.day)}</span>
        <h3 class="tile-title">${esc(a.name)}</h3>
      </div>
    </a>`).join("");

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

/* ============ BARRA "TROVA LE DATE" ============ */
function fmt(v) {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}
function initFinder() {
  const finder = $("#finder"), slot = $("#finderSlot");
  const from = $("#fromDate"), to = $("#toDate");
  const first = EVENTS[0].id, last = EVENTS[EVENTS.length - 1].id;
  from.min = to.min = first; from.max = to.max = last;
  [from, to].forEach((inp) => {
    const label = inp.previousElementSibling;
    inp.addEventListener("click", () => { try { inp.showPicker(); } catch (_) {} });
    inp.addEventListener("change", () => {
      label.textContent = fmt(inp.value) || label.dataset.ph;
      if (inp === from) { to.min = from.value || first; if (to.value && to.value < from.value) { to.value = from.value; to.dispatchEvent(new Event("change")); } }
    });
  });
  $("#finderGo").addEventListener("click", () => {
    const p = new URLSearchParams();
    if (from.value) p.set("dal", from.value);
    if (to.value) p.set("al", to.value);
    location.href = "/apres-ski" + (p.toString() ? "?" + p : "");
  });
  // si aggancia in basso dopo l'hero, sparisce sul footer, diventa scura sopra le card
  scrollHooks.push(() => {
    const vh = innerHeight;
    const docked = slot.getBoundingClientRect().top < 80;
    if (docked !== finder.classList.contains("docked")) finder.classList.toggle("docked", docked);
    finder.classList.toggle("away", docked && $("#footer").getBoundingClientRect().top < vh - 40);
    const r = finder.getBoundingClientRect();
    finder.classList.toggle("is-dark", darkAt(r.left + r.width / 2, r.bottom - 24, finder));
  });
}

/* ============ EVENTI SPECIALI: un poster alla volta ============ */
function initSlider() {
  const slider = $("[data-slider]"), track = $(".slider-track", slider), dotsEl = $("#specialDots");
  const n = track.children.length;
  let i = 0;
  dotsEl.innerHTML = Array.from({ length: n }, (_, k) => `<button aria-label="Vai alla slide ${k + 1}"></button>`).join("");
  const dots = [...dotsEl.children];
  const go = (k) => {
    i = Math.max(0, Math.min(n - 1, k));
    track.style.transform = `translateX(${-i * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle("on", j === i));
  };
  dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
  let x0 = null, dx = 0, moved = false;
  slider.addEventListener("pointerdown", (e) => { x0 = e.clientX; dx = 0; moved = false; slider.classList.add("dragging"); });
  addEventListener("pointermove", (e) => {
    if (x0 === null) return;
    dx = e.clientX - x0; if (Math.abs(dx) > 6) moved = true;
    track.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`;
  });
  addEventListener("pointerup", () => {
    if (x0 === null) return;
    slider.classList.remove("dragging"); x0 = null;
    go(dx < -60 ? i + 1 : dx > 60 ? i - 1 : i);
  });
  slider.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
  $$("a", slider).forEach((el) => el.setAttribute("draggable", "false"));
  go(0);
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
initFinder();
initSlider();
initDeck();
initTypewriter();
mountMeteoCard($("#meteoCard"));
