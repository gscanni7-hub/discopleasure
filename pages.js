/* =========================================================
   PAGINE INTERNE — una funzione per ogni <body data-page="...">
   ========================================================= */

const PAGES = {
  /* ---------- CALENDARIO ---------- */
  calendario() {
    const dal = qs("dal"), al = qs("al");
    let events = EVENTS;
    if (dal || al) {
      events = EVENTS.filter((e) => (!dal || e.id >= dal) && (!al || e.id <= al));
      const f = (v) => { const [y, m, d] = v.split("-"); return `${+d} ${MESI[m - 1]}`; };
      $("#rangeNote").innerHTML = `${events.length ? `${events.length} date` : "Nessuna data"}${dal ? ` dal ${f(dal)}` : ""}${al ? ` al ${f(al)}` : ""} · <a href="calendario.html">Mostra tutte</a>`;
      $("#rangeNote").hidden = false;
    }
    mountEventGrid($("#evFilters"), $("#evGrid"), { events: events.length ? events : EVENTS });
  },

  /* ---------- PAGINA EVENTO ---------- */
  evento() {
    const e = eventById(qs("d"));
    document.title = `${e.title} · ${e.short} | Disco Pleasure`;
    $("#evPhase").textContent = e.phase;
    $("#evTitle").textContent = e.title;
    $("#evDate").textContent = `${e.long} · ${e.hours}`;
    $("#evTickets").href = "#biglietti";
    $("#evTables").href = `tavoli.html#t-${e.id}`;
    const img = $("#evImg"); img.dataset.img = e.img; paintArt(img);
    const intro = {
      "Il ponte": "Il ponte dell'Immacolata apre la stagione: quattro date di fila sulla piattaforma davanti allo Chalet Valentino, con il nuovo arco di luce e le montagne dietro.",
      "Le feste": "Durante le feste Disco Pleasure è aperto tutti i giorni. Neve di giorno, pista al tramonto: dalle 12 alle 19, all'aperto.",
      "Weekend": "Ogni sabato e domenica fino al 14 marzo. Si scende dalle piste, si sale sulla piattaforma e si resta finché fa buio.",
    }[e.phase];
    $("#evBody").innerHTML = `
      <p><strong>${esc(e.title)} · ${esc(e.long)}</strong></p>
      <p>${esc(intro)}</p>
      <p>Alle 16:40 il sole passa dietro la cresta e il piazzale cambia faccia: da lì in poi è Disco Pleasure.</p>
      <h3>Line-up</h3>
      <ul>${e.lineup.map((l) => `<li><strong>${esc(l.area)}:</strong> ${l.names.map(esc).join(", ").replace(/ b2b /gi, " b2b ")}</li>`).join("")}</ul>
      <h3>Meteo a Roccaraso</h3>
      <div class="w-day-box" id="evMeteo"><p class="w-status">Carico le previsioni…</p></div>
      <h3 id="biglietti">Informazioni</h3>
      <ul>
        <li><strong>Dove:</strong> Chalet Valentino, a valle delle Gravare · Roccaraso · piattaforma esterna</li>
        <li><strong>Quando:</strong> ${esc(e.long)}</li>
        <li><strong>Orari:</strong> ${esc(e.hours)}</li>
        <li><strong>Ingresso:</strong> ${e.entry.map(esc).join(" · ")}</li>
        <li><strong>Abbigliamento:</strong> da neve: si balla all'aperto</li>
      </ul>
      <h3>Domande frequenti</h3>
      <details><summary>Come prenoto un tavolo?</summary><p>Dalla pagina <a href="tavoli.html">Tavoli</a>: scrivici o chiamaci e ti confermiamo la disponibilità per la data che scegli.</p></details>
      <details><summary>A che ora conviene arrivare?</summary><p>Si apre alle 12. Il momento più bello è il tramonto, verso le 16:40: arriva prima per trovare posto sulla piattaforma.</p></details>
      <details><summary>E se nevica?</summary><p>Ogni venerdì pubblichiamo il meteo del weekend negli <a href="aggiornamenti.html">Aggiornamenti</a>. Eventuali cambi di programma li trovi lì e sui nostri social.</p></details>`;
    mountEventGrid($("#evFilters"), $("#evGrid"), { events: EVENTS.filter((x) => x.phase === e.phase) });
    mountMeteoDay($("#evMeteo"), e.id);
  },

  /* ---------- AGGIORNAMENTI ---------- */
  aggiornamenti() {
    const grid = $("#newsGrid"), more = $("#loadMore");
    let shown = 9, filter = "all";
    const draw = () => {
      const list = filter === "all" ? NEWS : NEWS.filter((n) => n.tag === filter);
      grid.innerHTML = list.slice(0, shown).map((n) => `
        <a class="news-card dark" href="articolo.html?id=${n.id}">
          <div class="news-img">${art(n.img)}</div>
          <div class="news-body">
            <span class="badge">${esc(n.tag)}</span>
            <h3 class="news-title">${esc(n.title)}</h3>
            <span class="btn">Leggi</span>
          </div>
        </a>`).join("");
      more.hidden = list.length <= shown;
      paintAll(grid);
    };
    more.addEventListener("click", () => { shown += 9; draw(); });
    initFilters($("#newsFilters"), (v) => { filter = v; shown = 9; draw(); });
  },

  /* ---------- ARTICOLO ---------- */
  articolo() {
    const n = newsById(qs("id"));
    document.title = `${n.title} | Disco Pleasure`;
    $("#arTag").textContent = n.tag;
    $("#arTitle").textContent = n.title;
    $("#arDate").textContent = n.date;
    const img = $("#arImg"); img.dataset.img = n.img; paintArt(img);
    $("#arBody").innerHTML = n.body.map((p) => `<p>${esc(p)}</p>`).join("");
    $("#moreRail").innerHTML = NEWS.filter((x) => x.id !== n.id).map((x) => `
      <a class="poster dark" href="articolo.html?id=${x.id}">
        ${art(x.img)}
        <div class="poster-body">
          <span class="badge">${esc(x.tag)}</span>
          <h3 class="poster-title">${esc(x.title)}</h3>
          <span class="btn btn-white btn-sm">Leggi</span>
        </div>
      </a>`).join("");
    paintAll($("#moreRail"));
  },

  /* ---------- ARTISTI ---------- */
  artisti() {
    const grid = $("#artistGrid"), more = $("#loadMore"), search = $("#artistSearch");
    let shown = 9;
    const draw = () => {
      const q = search.value.trim().toLowerCase();
      const list = ARTISTS.filter((a) => !q || a.name.toLowerCase().includes(q));
      grid.innerHTML = list.slice(0, q ? list.length : shown).map((a) => `
        <a class="tile dark" href="#">
          <div class="tile-img">${art(a.img)}</div>
          <div class="tile-body">
            <span class="badge">${esc(a.day)}</span>
            <h3 class="tile-title">${esc(a.name)}</h3>
          </div>
        </a>`).join("") || `<p class="empty">Nessun artista trovato.</p>`;
      more.hidden = !!q || list.length <= shown;
      paintAll(grid);
    };
    search.addEventListener("input", draw);
    more.addEventListener("click", () => { shown += 9; draw(); });
    draw();
  },

  /* ---------- TAVOLI ---------- */
  tavoli() {
    $("#tableRow").innerHTML = MENU_RAIL.concat({ day: "Weekend", title: "Fino al 14.03", img: "img/epifania.jpg", href: "calendario.html?m=1" })
      .map((m) => `<a class="mini mini-lg" href="${m.href}">${art(m.img)}<span class="mini-top"><span class="mini-tape">${esc(m.title)}&nbsp;&nbsp;·&nbsp;&nbsp;${esc(m.title)}&nbsp;&nbsp;·&nbsp;&nbsp;</span></span><span class="mini-day">${esc(m.day)}</span></a>`).join("");
    paintAll($("#tableRow"));
    mountEventGrid($("#evFilters"), $("#evGrid"), { tickets: false });
    // "Tavoli" su questa pagina apre la prenotazione
    const hook = () => $$("#evGrid .ev-actions a").forEach((a) => { a.textContent = "Prenota tavolo"; a.href = "mailto:tavoli@discopleasure.it?subject=" + encodeURIComponent("Tavolo · " + a.closest(".ev-card").querySelector(".ev-date").textContent); });
    new MutationObserver(hook).observe($("#evGrid"), { childList: true }); hook();
    const target = location.hash.startsWith("#t-") && location.hash.slice(3);
    if (target) { const m = +target.split("-")[1]; $(`#evFilters [data-f="${m}"]`)?.click(); }
  },

  /* ---------- LO CHALET ---------- */
  chalet() {},
};

/* ============ AVVIO ============ */
PAGES[document.body.dataset.page]?.();
bootSite();
