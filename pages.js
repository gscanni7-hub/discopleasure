/* =========================================================
   PAGINE INTERNE: una funzione per ogni <body data-page="...">
   ========================================================= */

const PAGES = {
  /* ---------- CALENDARIO ---------- */
  calendario() {
    const dal = qs("dal"), al = qs("al");
    let events = EVENTS;
    if (dal || al) {
      events = EVENTS.filter((e) => (!dal || e.id >= dal) && (!al || e.id <= al));
      const f = (v) => { const [y, m, d] = v.split("-"); return `${+d} ${MESI[m - 1]}`; };
      $("#rangeNote").innerHTML = `${events.length ? `${events.length} date` : "Nessuna data"}${dal ? ` dal ${f(dal)}` : ""}${al ? ` al ${f(al)}` : ""} · <a href="/apres-ski">Mostra tutte</a>`;
      $("#rangeNote").hidden = false;
    }
    mountEventGrid($("#evFilters"), $("#evGrid"), { events: events.length ? events : EVENTS });
  },

  /* ---------- PAGINA EVENTO ---------- */
  evento() {
    const e = eventByPath(location.pathname) || eventById(qs("d"));
    if (location.pathname !== e.url) history.replaceState(null, "", e.url + location.hash); // vecchi link → indirizzo pulito
    document.title = `${e.title} · ${e.short} | Disco Pleasure`;
    $("#evPhase").textContent = e.phase;
    $("#evTitle").textContent = e.title;
    $("#evDate").textContent = `${e.long} · ${e.hours}`;
    Object.assign($("#evTickets"), { href: e.tickets, target: "_blank", rel: "noopener" });
    Object.assign($("#evTables"), { href: waLink(tableMsg(e)), target: "_blank", rel: "noopener" });
    const img = $("#evImg");
    if (e.poster) {
      // Locandina intera, senza tagli, al posto della foto
      const src = SMALL ? e.poster.replace("/img/", "/img/m/") : e.poster;
      img.outerHTML = `<a class="ev-poster" href="${e.poster}" target="_blank" rel="noopener" title="Apri la locandina"><img src="${src}" alt="Locandina Disco Pleasure · ${esc(e.long)}" width="1280" height="1600"></a>`;
    } else { img.dataset.img = e.img; paintArt(img); }
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
        ${e.poster ? `<li><strong>Locandina:</strong> <a href="${e.poster}" download>scarica</a></li>` : ""}
        <li><strong>Biglietti:</strong> <a href="${esc(e.tickets)}" target="_blank" rel="noopener">su Eventbrite</a></li>
        <li><strong>Tavoli:</strong> <a href="${waLink(tableMsg(e))}" target="_blank" rel="noopener">prenota su WhatsApp</a></li>
        <li><strong>Ingresso:</strong> ${e.entry.map(esc).join(" · ")}</li>
        <li><strong>Abbigliamento:</strong> da neve: si balla all'aperto</li>
      </ul>
      <h3>Domande frequenti</h3>
      <details><summary>Come prenoto un tavolo?</summary><p>Scrivici su <a href="${waLink(tableMsg(e))}" target="_blank" rel="noopener">WhatsApp</a> indicando la data e quante persone siete: ti confermiamo la disponibilità.</p></details>
      <details><summary>A che ora conviene arrivare?</summary><p>Si apre alle 12. Il momento più bello è il tramonto, verso le 16:40: arriva prima per trovare posto sulla piattaforma.</p></details>
      <details><summary>E se nevica?</summary><p>Ogni venerdì pubblichiamo il meteo del weekend negli <a href="/news">News</a>. Eventuali cambi di programma li trovi lì e sui nostri social.</p></details>`;
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
        <a class="news-card dark" href="/news/${n.id}">
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

  /* ---------- ARTICOLO (stile Chi siamo) ---------- */
  articolo() {
    const n = newsById(location.pathname.startsWith("/news/") ? decodeURI(location.pathname.slice(6)).replace(/\/$/, "") : qs("id"));
    if (location.pathname !== `/news/${n.id}`) history.replaceState(null, "", `/news/${n.id}` + location.hash);
    document.title = `${n.title} | Disco Pleasure`;
    $("#arTag").textContent = n.tag;
    $("#arTitle").textContent = n.title;
    $("#arDate").textContent = n.date;
    const img = $("#arImg"); img.dataset.img = n.img; paintArt(img);
    $("#arBody").innerHTML = `<p><strong>${esc(n.lead)}</strong></p>` + n.intro.map((t) => `<p>${esc(t)}</p>`).join("");
    $("#arSections").innerHTML = n.sections.map((s) => `
      <section class="ar-sec">
        <span class="room-label">${esc(s.label)}</span>
        <h2 class="ar-h">${esc(s.h)}</h2>
        ${s.text.map((t) => `<p>${esc(t)}</p>`).join("")}
        <figure class="ar-img dark">${art(s.img)}</figure>
      </section>`).join("");
    $("#moreRail").innerHTML = NEWS.filter((x) => x.id !== n.id).map((x) => `
      <a class="poster dark" href="/news/${x.id}">
        ${art(x.img)}
        <div class="poster-body">
          <span class="badge">${esc(x.tag)}</span>
          <h3 class="poster-title">${esc(x.title)}</h3>
          <span class="btn btn-white btn-sm">Leggi</span>
        </div>
      </a>`).join("");
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
    $("#tableRow").innerHTML = MENU_RAIL.concat({ day: "Weekend", title: "Fino al 14.03", img: "/img/epifania.jpg", href: "/apres-ski?m=1" })
      .map((m) => `<a class="mini mini-lg" href="${m.href}">${art(m.img)}<span class="mini-top"><span class="mini-tape">${esc(m.title)}&nbsp;&nbsp;·&nbsp;&nbsp;${esc(m.title)}&nbsp;&nbsp;·&nbsp;&nbsp;</span></span><span class="mini-day">${esc(m.day)}</span></a>`).join("");
    paintAll($("#tableRow"));
    mountEventGrid($("#evFilters"), $("#evGrid"), { tickets: false });
    $("#fabWa").href = waLink("Ciao! Vorrei prenotare un tavolo a Disco Pleasure.");
    $("#fabMail").href = `mailto:${CONTATTI.email}`;
    $("#fabTel").href = `tel:+${CONTATTI.whatsapp}`;
    const target = location.hash.startsWith("#t-") && location.hash.slice(3);
    if (target) { const m = +target.split("-")[1]; $(`#evFilters [data-f="${m}"]`)?.click(); }
  },

  /* ---------- LO CHALET ---------- */
  chisiamo() {},
};

/* ============ AVVIO ============ */
PAGES[document.body.dataset.page]?.();
bootSite();
