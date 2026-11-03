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
      const f = (v) => { const [y, m, d] = v.split("-"); return T(`${+d} ${MESI[m - 1]}`, `${MESI[m - 1]} ${+d}`); };
      $("#rangeNote").innerHTML = T(`${events.length ? `${events.length} date` : "Nessuna data"}${dal ? ` dal ${f(dal)}` : ""}${al ? ` al ${f(al)}` : ""}`, `${events.length ? `${events.length} dates` : "No dates"}${dal ? ` from ${f(dal)}` : ""}${al ? ` to ${f(al)}` : ""}`) + ` · <a href="${L("/apres-ski")}">${T("Mostra tutte", "Show all")}</a>`;
      $("#rangeNote").hidden = false;
    }
    mountEventGrid($("#evFilters"), $("#evGrid"), { events: events.length ? events : EVENTS });
  },

  /* ---------- PAGINA EVENTO ---------- */
  evento() {
    const e = eventByPath(location.pathname) || eventById(qs("d"));
    if (location.pathname !== L(e.url)) history.replaceState(null, "", L(e.url) + location.hash); // vecchi link → indirizzo pulito
    document.title = `${e.title} · ${e.short} | Disco Pleasure`;
    $("#evPhase").textContent = e.phase;
    $("#evTitle").textContent = e.title;
    $("#evDate").textContent = `${e.long} · ${e.hours}`;
    Object.assign($("#evTickets"), { href: e.tickets, target: "_blank", rel: "noopener" });
    Object.assign($("#evTables"), { href: `${L("/tavoli")}?d=${e.id}` });
    const img = $("#evImg");
    if (e.poster) {
      // Locandina intera, senza tagli, al posto della foto
      const src = webp(SMALL ? e.poster.replace("/img/", "/img/m/") : e.poster);
      img.outerHTML = `<a class="ev-poster" href="${e.poster}" target="_blank" rel="noopener" title="${T("Apri la locandina", "Open the poster")}"><img src="${src}" alt="${T("Locandina", "Poster")} Disco Pleasure · ${esc(e.long)}" width="1280" height="1600"></a>`;
    } else { img.dataset.img = e.img; paintArt(img); }
    const intro = T({
      ponte: "Il ponte dell'Immacolata apre la stagione: quattro pomeriggi di fila davanti allo Chalet Valentino, con le Gravare alle spalle.",
      feste: "Durante le feste siamo aperti tutti i giorni. Si scia la mattina, si balla dal primo pomeriggio fino a quando fa buio.",
      weekend: "Sabato e domenica, fino a metà marzo. Dall'ultima discesa si arriva dritti in pista.",
    }, {
      ponte: "The Immaculate Conception long weekend opens the season: four afternoons in a row in front of Chalet Valentino, with the Gravare slopes behind.",
      feste: "Over the holidays we are open every day. Ski in the morning, dance from early afternoon until dark.",
      weekend: "Saturdays and Sundays, until mid-March. From the last run you ski straight onto the dancefloor.",
    })[e.phaseKey];
    const tavoliUrl = `${L("/tavoli")}?d=${e.id}`;
    $("#evBody").innerHTML = T(`
      <p><strong>${esc(e.title)} · ${esc(e.long)}</strong></p>
      <p>${esc(intro)}</p>
      <p>Verso le 16:40 il sole passa dietro la cresta, si accendono le luci e comincia la parte migliore della giornata.</p>
      <h3>Line-up</h3>
      <ul>${e.lineup.map((l) => `<li><strong>${esc(l.area)}:</strong> ${l.names.map(esc).join(", ")}</li>`).join("")}</ul>
      <h3>Meteo a Roccaraso</h3>
      <div class="w-day-box" id="evMeteo"><p class="w-status">Carico le previsioni…</p></div>
      <h3 id="tickets">Informazioni</h3>
      <ul>
        <li><strong>Dove:</strong> Chalet Valentino, Viale delle Gravare, Roccaraso · <a href="/come-arrivare">come arrivare</a></li>
        <li><strong>Quando:</strong> ${esc(e.long)}</li>
        <li><strong>Orari:</strong> ${esc(e.hours)}</li>
        ${e.poster ? `<li><strong>Locandina:</strong> <a href="${e.poster}" download>scarica</a></li>` : ""}
        <li><strong>Tickets:</strong> <a href="${esc(e.tickets)}" target="_blank" rel="noopener">su Eventbrite</a></li>
        <li><strong>Tavoli:</strong> <a href="${tavoliUrl}">richiedi un tavolo</a></li>
        <li><strong>Ingresso:</strong> ${e.entry.map(esc).join(" · ")}</li>
        <li><strong>Abbigliamento:</strong> da neve: si balla all'aperto</li>
      </ul>
      <h3>Domande frequenti</h3>
      <details><summary>Come prenoto un tavolo?</summary><p>Dal <a href="${tavoliUrl}">modulo Tavoli</a>: indica la data e quante persone siete. Ti contattiamo noi in privato con la conferma.</p></details>
      <details><summary>A che ora conviene arrivare?</summary><p>Si apre alle 12. Se vuoi un buon posto per il tramonto, sali entro le 15.</p></details>
      <details><summary>Come ci arrivo?</summary><p>Con gli sci dalla pista Valle delle Gravare, oppure in auto fino all'Aremogna. Tutti i dettagli nella pagina <a href="/come-arrivare">Come arrivare</a>.</p></details>
      <details><summary>E se nevica?</summary><p>Il meteo del giorno è qui sopra. Eventuali cambi di orario li scriviamo nelle <a href="/news">News</a> e sui social la mattina stessa.</p></details>`, `
      <p><strong>${esc(e.title)} · ${esc(e.long)}</strong></p>
      <p>${esc(intro)}</p>
      <p>Around 4:40 pm the sun drops behind the ridge, the lights come on and the best part of the day begins.</p>
      <h3>Line-up</h3>
      <ul>${e.lineup.map((l) => `<li><strong>${esc(l.area)}:</strong> ${l.names.map(esc).join(", ")}</li>`).join("")}</ul>
      <h3>Weather in Roccaraso</h3>
      <div class="w-day-box" id="evMeteo"><p class="w-status">Loading the forecast…</p></div>
      <h3 id="tickets">Information</h3>
      <ul>
        <li><strong>Where:</strong> Chalet Valentino, Viale delle Gravare, Roccaraso · <a href="/come-arrivare">getting here</a></li>
        <li><strong>When:</strong> ${esc(e.long)}</li>
        <li><strong>Hours:</strong> ${esc(e.hours)}</li>
        ${e.poster ? `<li><strong>Poster:</strong> <a href="${e.poster}" download>download</a></li>` : ""}
        <li><strong>Tickets:</strong> <a href="${esc(e.tickets)}" target="_blank" rel="noopener">on Eventbrite</a></li>
        <li><strong>Tables:</strong> <a href="${tavoliUrl}">request a table</a></li>
        <li><strong>Entry:</strong> ${e.entry.map(esc).join(" · ")}</li>
        <li><strong>What to wear:</strong> snow gear: we dance outdoors</li>
      </ul>
      <h3>FAQ</h3>
      <details><summary>How do I book a table?</summary><p>Through the <a href="${tavoliUrl}">table request form</a>: tell us the date and how many you are. We will get back to you privately with the confirmation.</p></details>
      <details><summary>When is the best time to arrive?</summary><p>Doors open at noon. For a good spot at sunset, come up by 3 pm.</p></details>
      <details><summary>How do I get there?</summary><p>On skis from the Valle delle Gravare slope, or by car up to Aremogna. All the details on the <a href="/come-arrivare">Getting here</a> page.</p></details>
      <details><summary>What if it snows?</summary><p>The day's forecast is above. Any change of hours is posted in the <a href="/news">News</a> and on social media the same morning.</p></details>`);
    mountEventGrid($("#evFilters"), $("#evGrid"), { events: EVENTS.filter((x) => x.phaseKey === e.phaseKey) });
    mountMeteoDay($("#evMeteo"), e.id);
  },

  /* ---------- AGGIORNAMENTI ---------- */
  aggiornamenti() {
    // Come "Updates" di UNVRS: card quadrate, etichetta, titolo, data; conteggio "Mostrando x / y";
    // la testata resta appiccicata in alto e si abbassa scorrendo
    const grid = $("#newsGrid"), count = $("#newsCount"), head = $("#updHead");
    const card = (n) => `
      <article class="u-news">
        <div class="u-news-img">${art(n.img)}</div>
        <span class="u-news-tag">${esc(n.tag)}</span>
        <h2 class="u-news-title"><a href="${L(`/news/${n.id}`)}">${esc(n.title)}</a></h2>
        <span class="u-news-date">${esc(n.date)}</span>
      </article>`;
    initFilters($("#newsFilters"), (v) => {
      const list = v === "all" ? NEWS : NEWS.filter((n) => n.tag === v);
      grid.innerHTML = list.map(card).join("");
      count.textContent = T(`Mostrando ${list.length} / ${NEWS.length} news`, `Showing ${list.length} / ${NEWS.length} news`);
      paintAll(grid);
    });
    scrollHooks.push(() => head.classList.toggle("scrolled", scrollY > 10));
  },

  /* ---------- ARTICOLO (stile Chi siamo) ---------- */
  articolo() {
    const n = newsById(PATH.startsWith("/news/") ? decodeURI(PATH.slice(6)).replace(/\/$/, "") : qs("id"));
    if (PATH !== `/news/${n.id}`) history.replaceState(null, "", L(`/news/${n.id}`) + location.hash);
    document.title = `${n.title} | Disco Pleasure`;
    $("#arTitle").textContent = n.title;
    $("#arDate").textContent = n.date;
    const img = $("#arImg"); img.dataset.img = n.img; paintArt(img);
    // Blocchi come UNVRS: primo blocco di solo testo a destra (lead + introduzione),
    // poi foto quadrata + testo che si alternano sinistra/destra, in chiusura testo e bottoni
    const text = (ps) => `<div class="u-art-text">${ps.map((t) => `<p>${esc(t)}</p>`).join("")}</div>`;
    const blocks = [`<div class="u-art-block"><div class="u-art-row rev"><div class="u-art-col">${text([n.lead, ...n.intro])}</div></div></div>`];
    n.sections.forEach((s, i) => blocks.push(`
      <div class="u-art-block"><div class="u-art-row${i % 2 ? " rev" : ""}">
        <div class="u-art-img">${art(s.img)}</div>
        <div class="u-art-col">
          <div class="u-art-hgroup"><span class="u-mono u-art-label">${esc(s.label)}</span><h2 class="u-art-h2">${esc(s.h)}</h2></div>
          ${text(s.text)}
        </div>
      </div></div>`));
    blocks.push(`
      <div class="u-art-block"><div class="u-art-end"><div class="u-art-end-col">
        ${text([T("I tickets sono nel calendario, una data alla volta. Per il tavolo c'è il modulo: ti rispondiamo noi, di persona.", "Tickets are in the calendar, one date at a time. For a table there is the request form: we reply personally.")])}
        <div class="u-art-btns"><a class="u-art-btn" href="${L("/apres-ski")}">Tickets</a><a class="u-art-btn" href="${L("/tavoli")}">${T("Tavoli", "Tables")}</a></div>
      </div></div></div>`);
    // crediti delle foto con licenza Creative Commons (Wikimedia Commons)
    if (n.credits && n.credits.length) blocks.push(`<div class="u-art-credits u-mono">${T("Foto", "Photos")}: ${n.credits.map((c) => `<a href="${c.src}" target="_blank" rel="noopener">${esc(c.by)}</a> (<a href="${c.licUrl}" target="_blank" rel="noopener">${esc(c.lic)}</a>, Wikimedia Commons)`).join(" · ")}. ${T("Le altre foto", "Other photos")}: Unsplash.</div>`);
    $("#arBlocks").innerHTML = blocks.join("");
    paintAll($("#arBlocks"));
  },

  /* ---------- ARTISTI ---------- */
  artisti() { artistsPage(); },

  /* ---------- TAVOLI ---------- */
  tavoli() {
    const form = $("#tableForm"), msg = $(".u-form-msg", form), btn = $(".u-submit", form);
    // Calendario: si possono scegliere solo i giorni in cui si balla (gli EVENTS), un mese alla volta
    const cal = $("#tableCal"), pick = $("#tableDatePick"), hidden = $("#tableDate"), pickDefault = pick.textContent;
    const MONTHS = T(["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"], ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
    const ARROW = (d) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${d < 0 ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}"/></svg>`;
    const days = new Set(EVENTS.map((e) => e.id)), ids = [...days].sort(), minYM = ids[0].slice(0, 7), maxYM = ids[ids.length - 1].slice(0, 7);
    let view = { y: +ids[0].slice(0, 4), m: +ids[0].slice(5, 7) - 1 }, picked = "";
    const ym = () => `${view.y}-${String(view.m + 1).padStart(2, "0")}`;
    const draw = () => {
      const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7, n = new Date(view.y, view.m + 1, 0).getDate();
      let cells = T(["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"], ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]).map((d) => `<span class="u-cal-dow">${d}</span>`).join("") + "<span></span>".repeat(offset);
      for (let d = 1; d <= n; d++) { const id = `${ym()}-${String(d).padStart(2, "0")}`, ok = days.has(id); cells += `<button type="button" class="u-cal-d${ok ? " ok" : ""}${id === picked ? " on" : ""}" data-id="${id}"${ok ? "" : " disabled"} aria-pressed="${id === picked}">${d}</button>`; }
      cal.innerHTML = `<div class="u-cal-head"><button type="button" class="u-cal-nav" data-nav="-1" aria-label="${T("Mese precedente", "Previous month")}"${ym() <= minYM ? " disabled" : ""}>${ARROW(-1)}</button><span>${MONTHS[view.m]} ${view.y}</span><button type="button" class="u-cal-nav" data-nav="1" aria-label="${T("Mese successivo", "Next month")}"${ym() >= maxYM ? " disabled" : ""}>${ARROW(1)}</button></div><div class="u-cal-grid">${cells}</div>`;
    };
    const choose = (id) => { picked = id; hidden.value = id; const e = EVENTS.find((x) => x.id === id); pick.textContent = e ? e.long : pickDefault; draw(); };
    cal.addEventListener("click", (ev) => {
      const nav = ev.target.closest("[data-nav]"); if (nav) { view.m += +nav.dataset.nav; if (view.m < 0) { view.m = 11; view.y--; } if (view.m > 11) { view.m = 0; view.y++; } draw(); return; }
      const d = ev.target.closest(".u-cal-d.ok"); if (d) choose(d.dataset.id);
    });
    const pre = qs("d"); if (pre && days.has(pre)) { view = { y: +pre.slice(0, 4), m: +pre.slice(5, 7) - 1 }; choose(pre); } else draw();
    // il campo Note cresce con il testo, come il textarea di UNVRS
    const note = $("#tableNote"); note.addEventListener("input", () => { note.style.height = "auto"; note.style.height = note.scrollHeight + "px"; });
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!hidden.value) { msg.textContent = T("Scegli una data dal calendario.", "Choose a date from the calendar."); cal.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
      const fd = new FormData(form), e = EVENTS.find((x) => x.id === fd.get("data"));
      const payload = {
        nome: fd.get("nome"), cognome: fd.get("cognome"), email: fd.get("email"), prefisso: fd.get("prefisso"), telefono: fd.get("telefono"),
        persone: fd.get("persone"), data: fd.get("data"), note: fd.get("note") || "", novita: !!fd.get("novita"), privacy: !!fd.get("privacy"), _honey: fd.get("_honey") || "",
      };
      btn.disabled = true; msg.textContent = T("Invio in corso…", "Sending…");
      try {
        // 1) la nostra funzione su Vercel (api/tavoli.js, email con Resend);
        // 2) se non è ancora configurata (manca la chiave) o non risponde, si usa FormSubmit come prima
        let sentOk = false;
        try {
          const r = await fetch("/api/tavoli", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          const j = await r.json().catch(() => ({}));
          if (r.ok && j.ok) sentOk = true;
          else if (r.status === 400) throw Object.assign(new Error("dati"), { fatal: true });
        } catch (e) { if (e.fatal) throw e; }
        if (!sentOk) {
          const fs = {
            _subject: `Richiesta tavolo · ${e ? e.long : ""} · ${payload.nome} ${payload.cognome} · ${payload.persone} pers.`,
            _template: "table", _captcha: "false", _honey: payload._honey,
            Nome: payload.nome, Cognome: payload.cognome, Email: payload.email, _replyto: payload.email,
            Telefono: `${payload.prefisso} ${payload.telefono}`, Persone: payload.persone, Data: e ? e.long : payload.data,
            Note: payload.note || "-", Novità: payload.novita ? "sì" : "no", Inviato_da: location.href,
          };
          const r2 = await fetch(`https://formsubmit.co/ajax/${CONTATTI.richiesteTavoli}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(fs) });
          const j2 = await r2.json().catch(() => ({}));
          if (!r2.ok || String(j2.success) !== "true") throw new Error(j2.message || r2.status);
        }
        // Conferma di ricezione: al posto del modulo compare il riepilogo della richiesta
        const name = String(fd.get("nome") || "").trim(), when = e ? e.long : "", n = fd.get("persone"), mail = fd.get("email"), tel = `${fd.get("prefisso")} ${fd.get("telefono")}`;
        const done = $("#tableDone");
        done.innerHTML = `
          <span class="u-mono u-vip-eyebrow">${T("Richiesta ricevuta", "Request received")}</span>
          <h2 class="u-done-title">${T("Grazie", "Thank you")}, ${esc(name)}.</h2>
          <p class="u-done-lead">${T("Abbiamo ricevuto la tua richiesta. Il nostro team la verificherà e ti contatterà in privato, via WhatsApp o email, con la conferma e tutte le istruzioni per il tuo tavolo.", "We have received your request. Our team will review it and contact you privately, via WhatsApp or email, with the confirmation and all the details for your table.")}</p>
          <dl class="u-done-list">
            <div><dt class="u-mono">${T("Data", "Date")}</dt><dd>${esc(when)}</dd></div>
            <div><dt class="u-mono">${T("Persone", "Guests")}</dt><dd>${esc(n)}</dd></div>
            <div><dt class="u-mono">Email</dt><dd>${esc(mail)}</dd></div>
            <div><dt class="u-mono">${T("Telefono", "Phone")}</dt><dd>${esc(tel)}</dd></div>
          </dl>
          <p class="u-done-note">${T("La richiesta non è ancora una prenotazione: il tavolo è confermato solo con il nostro messaggio. Se i tuoi piani cambiano, rispondi direttamente a quel messaggio.", "Your request is not a booking yet: the table is confirmed only by our message. If your plans change, simply reply to that message.")}</p>
          <button class="u-submit" type="button" id="tableAgain">${T("Nuova richiesta", "New request")}</button>`;
        form.hidden = true; $(".u-vip-head").hidden = true; done.hidden = false;
        $(".u-vip-panel").scrollTo({ top: 0, behavior: "smooth" }); if (innerWidth < 1281) done.scrollIntoView({ block: "start", behavior: "smooth" });
        $("#tableAgain").addEventListener("click", () => { done.hidden = true; form.hidden = false; $(".u-vip-head").hidden = false; msg.textContent = ""; });
        form.reset(); note.style.height = ""; choose(""); msg.textContent = "";
      } catch (err) {
        msg.innerHTML = `${T("Non siamo riusciti a inviare la richiesta.", "We couldn't send your request.")} <a href="${waLink(T("Ciao! Vorrei prenotare un tavolo a Disco Pleasure.", "Hi! I'd like to book a table at Disco Pleasure."))}" target="_blank" rel="noopener">${T("Scrivici su WhatsApp", "Message us on WhatsApp")}</a>.`;
      } finally { btn.disabled = false; }
    });
  },

  /* ---------- ARTISTA: stessa pagina Artisti con la scheda aperta sopra ---------- */
  artista() { artistsPage(); },

  /* ---------- LO CHALET ---------- */
  chisiamo() {},

  /* ---------- COME ARRIVARE ---------- */
  comearrivare() {
    $$("[data-wa]").forEach((a) => (a.href = waLink(T("Ciao! Ho una domanda su come arrivare allo Chalet Valentino.", "Hi! I have a question about getting to Chalet Valentino."))));
    // Accordion come le FAQ di UNVRS: le domande principali si aprono una alla volta, le sotto-voci liberamente
    $$(".u-faq-q").forEach((btn) => btn.addEventListener("click", () => {
      const item = btn.parentElement, open = !item.classList.contains("open");
      if (!item.classList.contains("u-faq-sub")) $$("#faq > .u-faq-item.open").forEach((o) => { if (o !== item) { o.classList.remove("open"); $(".u-faq-q", o).setAttribute("aria-expanded", "false"); } });
      item.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open));
    }));
  },
};

/* ============ AVVIO ============ */
PAGES[document.body.dataset.page]?.();
bootSite();

// Meteo (pagina Come arrivare): si monta solo dove c'è il riquadro
mountMeteoCard($("#meteoCard"));


/* =========================================================
   ARTISTI + SCHEDA DELL'ARTISTA (come la residency di UNVRS)
   La griglia è la pagina; la scheda è una finestra scura sovrapposta che scorre da sola,
   con il bottone × fermo, il nome che entra parola per parola e le etichette che si decifrano.
   ========================================================= */
function artistsPage() {
  const grid = $("#artistGrid"), search = $("#artistSearch"), head = $("#updHead");
  const draw = () => {
    const q = search.value.trim().toLowerCase();
    const list = ARTISTS.filter((a) => !q || a.name.toLowerCase().includes(q));
    grid.innerHTML = list.map((a) => `
      <a class="u-artist" href="${L(`/artisti/${a.slug}`)}" data-slug="${a.slug}">
        ${a.img ? art(a.img) : `<div class="art silhouette" role="img" aria-label="${T("Foto di", "Photo of")} ${esc(a.name)} ${T("in arrivo", "coming soon")}"></div>`}
        <div class="u-artist-shade" aria-hidden="true"></div>
        <div class="u-artist-body"><span class="u-artist-tag">${esc(a.day)}</span><span class="u-artist-name">${esc(a.name)}</span></div>
      </a>`).join("") || `<p class="u-arts-empty">${T("Nessun artista trovato.", "No artists found.")}</p>`;
    paintAll(grid);
  };
  search.addEventListener("input", draw);
  draw();
  scrollHooks.push(() => head.classList.toggle("scrolled", scrollY > 10));
  // la card apre la scheda sopra la lista, senza cambiare pagina
  grid.addEventListener("click", (ev) => { const a = ev.target.closest("a[data-slug]"); if (!a) return; ev.preventDefault(); openArtist(a.dataset.slug, "push"); });
  addEventListener("popstate", () => { const m = toIT(location.pathname).match(/^\/artisti\/([^/]+)/); if (m) openArtist(decodeURI(m[1]), "none"); else closeArtist("none"); });
  const m = PATH.match(/^\/artisti\/([^/]+)/);
  if (m) openArtist(decodeURI(m[1]), "replace");
}

function openArtist(slug, nav) {
  const a = ARTISTS.find((x) => x.slug === slug); if (!a) { closeArtist("replace"); return; }
  closeArtist("none");
  if (nav === "push") history.pushState({ artist: slug }, "", L(`/artisti/${a.slug}`));
  if (nav === "replace") history.replaceState({ artist: slug }, "", L(`/artisti/${a.slug}`));
  document.title = `${a.name} | Disco Pleasure`;
  const words = a.name.split(" ").map((w, i) => `<span class="w"><i style="--i:${i}">${esc(w)}</i></span>`).join(" ");
  const meta = (cls) => `<div class="u-ov-meta ${cls}"><span class="u-ov-tag"><span data-scramble>${esc(T("Played here", "Played here"))}</span></span><span data-scramble>${esc(a.day)}</span></div>`;
  const ov = document.createElement("div"); ov.className = "u-ov"; ov.id = "artistOverlay"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", a.name);
  ov.innerHTML = `
    <div class="u-ov-in">
      <div class="u-ov-sticky"><button class="u-ov-close" type="button" aria-label="${T("Chiudi", "Close")}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l10 10M13 3 3 13"/></svg></button></div>
      <div class="u-ov-card">
        <div class="u-ov-hero">
          <div class="u-ov-img">${a.hero ? `<div class="u-ov-desk">${art(a.hero)}</div><div class="u-ov-mob">${art(a.img || a.hero)}</div>` : a.img ? art(a.img) : `<div class="art silhouette" role="img" aria-label="${T("Foto di", "Photo of")} ${esc(a.name)} ${T("in arrivo", "coming soon")}"></div>`}<div class="u-ov-shade" aria-hidden="true"></div></div>
          <div class="u-ov-head"><div class="u-ov-group">${meta("desk")}<h1 class="u-ov-title">${words}</h1>${meta("mob")}</div></div>
        </div>
        <div class="u-ov-body"><div class="u-ov-cols">
          <div class="u-ov-about"><span class="u-ov-label">About</span><div class="u-ov-prose">${a.bio.map((t) => `<p>${esc(t)}</p>`).join("")}</div></div>
          <div class="u-ov-side">
            <div class="u-ov-fact"><span class="u-ov-label">${T("Origine", "Origin")}</span><div class="u-ov-val">${esc(a.origin)}</div></div>
            <div class="u-ov-fact"><span class="u-ov-label">${T("Generi", "Genres")}</span><div class="u-ov-val">${a.genres.map((g) => `<div>${esc(g)}</div>`).join("")}</div></div>
          </div>
        </div></div>
        ${footerHTML("")}
      </div>
    </div>`;
  document.body.appendChild(ov); document.body.classList.add("u-ov-open");
  paintAll(ov);
  requestAnimationFrame(() => { ov.classList.add("on"); $$("[data-scramble]", ov).forEach((el) => { const t = el.textContent; el.textContent = ""; el.dataset.target = ""; scrambleTo(el, t, 900); }); });
  $(".u-ov-close", ov).addEventListener("click", () => closeArtist("push"));
  ov.addEventListener("click", (ev) => { if (ev.target === ov || ev.target.classList.contains("u-ov-in")) closeArtist("push"); });
  ov._esc = (ev) => { if (ev.key === "Escape") closeArtist("push"); }; addEventListener("keydown", ov._esc);
}

function closeArtist(nav) {
  const ov = $("#artistOverlay"); if (!ov) return;
  removeEventListener("keydown", ov._esc); ov.remove(); document.body.classList.remove("u-ov-open");
  document.title = T("Artisti | Disco Pleasure", "Artists | Disco Pleasure");
  if (nav === "push") history.pushState(null, "", L("/artisti"));
  if (nav === "replace") history.replaceState(null, "", L("/artisti"));
}
