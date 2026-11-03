/* =========================================================
   CONTENUTI DI DISCO PLEASURE: modifica qui.
   Per usare una foto vera: img: "/img/nomefile.jpg".
   ========================================================= */

/* ---------- Lingua: italiano (default) o inglese (pagine in /en/ con <html lang="en">) ---------- */
const EN = document.documentElement.lang === "en";
const T = (it, en) => (EN ? en : it);
// Indirizzi delle due lingue: le pagine inglesi hanno indirizzi tradotti (/tavoli → /en/tables)
const SLUG_EN = { "apres-ski": "dates", tavoli: "tables", artisti: "artists", "chi-siamo": "about", "come-arrivare": "getting-here", eventi: "events" };
const SLUG_IT = Object.fromEntries(Object.entries(SLUG_EN).map(([k, v]) => [v, k]));
const NEWS_SLUG_EN = { "apriamo-il-5": "the-return", tavoli: "tables-guide", "meteo-weekend": "weather", "cosa-portare": "what-to-wear", "dal-26": "sixteen-days" };
const NEWS_SLUG_IT = Object.fromEntries(Object.entries(NEWS_SLUG_EN).map(([k, v]) => [v, k]));
const MESE_IT = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const MESE_EN = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
// /en/events/2026/31-december → /eventi/2026/31-dicembre (per riconoscere le pagine allo stesso modo)
const toIT = (path) => {
  const p = decodeURI(path).replace(/\/$/, "");
  if (!/^\/en(\/|$)/.test(p)) return p || "/";
  const parts = p.slice(3).split("/");
  if (parts[1]) parts[1] = SLUG_IT[parts[1]] || parts[1];
  if (parts[1] === "eventi" && parts[3]) parts[3] = parts[3].replace(/[a-z]+$/, (m) => MESE_IT[MESE_EN.indexOf(m)] || m);
  if (parts[1] === "news" && parts[2]) parts[2] = NEWS_SLUG_IT[parts[2]] || parts[2];
  return parts.join("/") || "/";
};
// /eventi/2026/31-dicembre → /en/events/2026/31-december
const toEN = (path) => {
  const parts = path.split("/");
  if (parts[1] === "eventi" && parts[3]) parts[3] = parts[3].replace(/[a-z]+$/, (m) => MESE_EN[MESE_IT.indexOf(m)] || m);
  if (parts[1] === "news" && parts[2]) parts[2] = NEWS_SLUG_EN[parts[2]] || parts[2];
  if (parts[1]) parts[1] = SLUG_EN[parts[1]] || parts[1];
  const out = parts.join("/");
  return "/en" + (out === "/" ? "" : out);
};
// Percorso italiano della pagina corrente (uguale nelle due lingue)
const PATH = toIT(location.pathname);
// Link interno nella lingua corrente: /tavoli → /en/tables sulle pagine inglesi
const L = (p) => {
  if (!EN || typeof p !== "string" || !p.startsWith("/") || /^\/(img|api|en)(\/|$)/.test(p)) return p;
  const m = p.match(/^([^?#]*)(.*)$/);
  return toEN(m[1] || "/") + m[2];
};
// Stessa pagina nell'altra lingua (per il selettore IT / EN del menu)
const LANG_URL = (lang) => (lang === "en" ? toEN(PATH) : PATH) + location.search + location.hash;

/* ---------- Tickets e tavoli ---------- */
const CONTATTI = {
  // Numero WhatsApp per i tavoli: prefisso internazionale senza "+" e senza spazi (es. 393331234567)
  whatsapp: "393403692824",
  // Link Eventbrite generale (se una data non ha il suo link, si usa questo)
  eventbrite: "https://www.eventbrite.it/",
  email: "eugeniocoppola7@gmail.com",
  // Riferimento: le richieste del modulo Tavoli ora partono da api/tavoli.js (Resend); il destinatario si imposta su Vercel con TAVOLI_TO
  richiesteTavoli: "eugeniocoppola7@gmail.com",
  // Profili social (sostituisci con i link veri)
  instagram: "#",
  tiktok: "#",
};
const waLink = (testo) => `https://wa.me/${CONTATTI.whatsapp}?text=${encodeURIComponent(testo)}`;

/* ---------- Stagione 2026/27 ---------- */
// Ogni riga: [anno, mese, giorno]. I giorni della settimana si calcolano da soli.
const SEASON_DATES = [
  // Il ponte dell'Immacolata
  [2026, 12, 5], [2026, 12, 6], [2026, 12, 7], [2026, 12, 8],
  // Le feste: tutti i giorni dal 26 dicembre al 10 gennaio
  ...Array.from({ length: 16 }, (_, i) => { const d = new Date(2026, 11, 26 + i); return [d.getFullYear(), d.getMonth() + 1, d.getDate()]; }),
  // I weekend
  [2027, 1, 16], [2027, 1, 17], [2027, 1, 23], [2027, 1, 24], [2027, 1, 30], [2027, 1, 31],
  [2027, 2, 6], [2027, 2, 7], [2027, 2, 13], [2027, 2, 14], [2027, 2, 20], [2027, 2, 21], [2027, 2, 27], [2027, 2, 28],
  [2027, 3, 6], [2027, 3, 7], [2027, 3, 13], [2027, 3, 14],
];

// Titoli speciali per alcune date (le altre si chiamano "Disco Pleasure")
const SPECIAL_TITLES = {
  "2026-12-05": "Opening",
  "2026-12-08": "Immacolata",
  "2026-12-26": "Santo Stefano",
  "2026-12-31": "San Silvestro",
  "2027-01-01": "Capodanno",
  "2027-01-06": "Epifania",
  "2027-03-14": "Closing",
};

// Foto per le card (a rotazione)
const EVENT_IMGS = ["/img/opening.jpg", "/img/ven-5.jpg", "/img/sab-6.jpg", "/img/dom-7.jpg", "/img/lun-8.jpg", "/img/ponte.jpg", "/img/feste.jpg", "/img/epifania.jpg", "/img/calendario.jpg"];

const GIORNI = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const GIORNI_BREVI = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MESI_BREVI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

const MESI_URL = [...MESI]; // gli indirizzi delle date restano uguali nelle due lingue
const pad2 = (n) => String(n).padStart(2, "0");
// Indirizzo della pagina di una data, es. /eventi/2026/5-dicembre
const evUrl = (id) => { const [y, m, dd] = id.split("-"); return `/eventi/${y}/${+dd}-${MESI_URL[+m - 1]}`; };
const EVENTS = SEASON_DATES.map(([y, m, d], i) => {
  const date = new Date(y, m - 1, d);
  const id = `${y}-${pad2(m)}-${pad2(d)}`;
  const phase = m === 12 && d <= 8 ? "Il ponte" : (y === 2026 || (m === 1 && d <= 10)) ? "Le feste" : "Weekend";
  return {
    id,
    url: evUrl(id),
    date,
    month: m,
    phase,
    phaseKey: phase === "Il ponte" ? "ponte" : phase === "Le feste" ? "feste" : "weekend",
    title: SPECIAL_TITLES[id] || "Disco Pleasure",
    weekday: GIORNI[date.getDay()],
    short: `${GIORNI_BREVI[date.getDay()]} ${d}.${m}`,
    long: `${GIORNI[date.getDay()]} ${d} ${MESI[m - 1]} ${y}`,
    card: `${GIORNI_BREVI[date.getDay()]}, ${d} ${MESI_BREVI[m - 1]} ${y}`,
    tag: SPECIAL_TITLES[id] || null,
    hours: "12:00 - 19:00",
    img: EVENT_IMGS[i % EVENT_IMGS.length],
    // Line-up per area: sostituisci con i nomi. Per un b2b scrivi "Nome A b2b Nome B".
    lineup: [
      { area: "Line-up", names: ["Resident", "Guest da annunciare"] },
    ],
    // Link Eventbrite: si imposta nella lista TICKETS più sotto
    tickets: null,
    // Righe in fondo alla card (prezzi, orari d'ingresso...)
    entry: ["Info ingresso in arrivo", "Tavoli su prenotazione"],
  };
});
// Link Eventbrite per singola data: "2026-12-05": "https://www.eventbrite.it/e/...",
const TICKETS = {
  "2026-12-05": "https://www.eventbrite.com/e/2002311265897?aff=oddtdtcreator",
  "2026-12-06": "https://www.eventbrite.com/e/2002311501602?aff=oddtdtcreator",
  "2026-12-07": "https://www.eventbrite.com/e/2002311677127?aff=oddtdtcreator",
  "2026-12-08": "https://www.eventbrite.com/e/2002311718250?aff=oddtdtcreator",
  "2026-12-26": "https://www.eventbrite.com/e/2002311834598?aff=oddtdtcreator",
  "2026-12-27": "https://www.eventbrite.com/e/2002312021156?aff=oddtdtcreator",
  "2026-12-28": "https://www.eventbrite.com/e/2002312466488?aff=oddtdtcreator",
  "2026-12-29": "https://www.eventbrite.com/e/2002312601893?aff=oddtdtcreator",
  "2026-12-30": "https://www.eventbrite.com/e/2002312963976?aff=oddtdtcreator",
  "2026-12-31": "https://www.eventbrite.com/e/2002313322047?aff=oddtdtcreator",
  "2027-01-01": "https://www.eventbrite.com/e/2002313419338?aff=oddtdtcreator",
  "2027-01-02": "https://www.eventbrite.com/e/2002314429359?aff=oddtdtcreator",
  "2027-01-03": "https://www.eventbrite.com/e/2002314570782?aff=oddtdtcreator",
  "2027-01-04": "https://www.eventbrite.com/e/2002314708193?aff=oddtdtcreator",
  "2027-01-05": "https://www.eventbrite.com/e/2002314802475?aff=oddtdtcreator",
  "2027-01-06": "https://www.eventbrite.com/e/2002315039183?aff=oddtdtcreator",
  "2027-01-07": "https://www.eventbrite.com/e/2002315247807?aff=oddtdtcreator",
  "2027-01-08": "https://www.eventbrite.com/e/2002315182612?aff=oddtdtcreator",
  "2027-01-09": "https://www.eventbrite.com/e/2002315406281?aff=oddtdtcreator",
  "2027-01-10": "https://www.eventbrite.it/e/disco-pleasure-apres-ski-1001-chalet-valentino-tickets-2002316123426?aff=oddtdtcreator",
};
EVENTS.forEach((e) => { e.tickets = TICKETS[e.id] || CONTATTI.eventbrite; });
// Locandine: una per data, in /img/locandine/AAAA-MM-GG.jpg (4:5, 1280x1600).
// Per aggiungerne una basta mettere il file e la data in questa lista.
const POSTERS = ["2026-12-05", "2026-12-06", "2026-12-07", "2026-12-08"];
EVENTS.forEach((e) => { if (POSTERS.includes(e.id)) e.poster = `/img/locandine/${e.id}.jpg`; });
const eventById = (id) => EVENTS.find((e) => e.id === id) || EVENTS[0];
const eventByPath = (path) => EVENTS.find((e) => e.url === toIT(path));
const tableMsg = (e) => T(`Ciao! Vorrei prenotare un tavolo a Disco Pleasure per ${e.long.toLowerCase()}.`, `Hi! I'd like to book a table at Disco Pleasure for ${e.long}.`);

/* ---------- Artisti (segnaposto) ---------- */
// Artisti: i DJ più noti passati da Disco Pleasure (stessa lista di "Played here" in home).
// Aggiungi img: "/img/nomefile.jpg" quando c'è la foto; senza foto si vede una sagoma.
const ARTISTS = [
  { slug: "marco-tropeano", day: "Season 25/26", name: "Marco Tropeano", img: "/img/dj/marco-tropeano.jpg", hero: "/img/dj/marco-tropeano-scheda.jpg", origin: "Napoli", genres: ["House"],
    bio: [
      "Marco Tropeano è un DJ e produttore nato a Napoli, con un'identità profondamente radicata nella house music: groove underground, un'energia contagiosa e il carattere inconfondibile delle sue origini mediterranee.",
      "Cresciuto nella vivace cultura dei club napoletani, ha trasformato una passione precoce per la musica elettronica in una carriera che lo ha portato dalla sua città ad alcuni dei dancefloor più importanti d'Europa e non solo. Oggi il suo progetto si muove tra Ibiza e il circuito internazionale, senza perdere l'approccio crudo e pensato per la pista che ne definisce il suono fin dall'inizio.",
      "Un capitolo decisivo del suo percorso è il legame con Metamorfosi di Joseph Capriati: a Ibiza è diventato una presenza fissa, suonando in locali come Amnesia e Hï Ibiza e condividendo le line-up con alcuni dei nomi più affermati della musica elettronica di oggi.",
      "Come produttore ha costruito un catalogo su etichette internazionali di rilievo: Metamorfosi Records, Cuttin' Headz dei Martinez Brothers, LTF Records di Franky Rizardo e due dei nomi più riconosciuti della scena americana, Nervous Records e Insomniac Records. È anche il fondatore di Ojomarino Records, etichetta nata come estensione della sua visione musicale e della cultura dei club.",
      "Sempre in movimento tra studio e dancefloor, oggi entra in una nuova fase della carriera: spingere avanti il suo suono, crescere all'estero e costruire un'identità artistica definita da un solo elemento, la musica.",
    ] },
  { slug: "ale-de-tuglie", day: "Season 25/26", name: "Ale De Tuglie", img: "/img/dj/ale-de-tuglie.jpg", hero: "/img/dj/ale-de-tuglie-scheda.jpg", origin: "Italia", genres: ["Techno", "House"],
    bio: [
      "Già a 14 anni Ale De Tuglie era appassionato di musica elettronica e di tutto quello che la circonda. Ha deciso presto di trasformare quella passione, e la voglia di vedere la gente divertirsi e ballare sotto la sua guida, in quello che ama di più, facendosi notare rapidamente nella scena fino a suonare tra i grandi.",
      "Che si parli del DJ o del produttore, il suo stile è unico e senza confini: un equilibrio perfetto di ritmi, groove e dettagli riconoscibili.",
      "La visibilità è arrivata presto e lo ha portato nei club più noti d'Italia, come Cromie, Spazio Novecento e Clorophilla. I suoi set sono carichi di musica elettronica di qualità, energia e passione, con un'unica missione: garantire la festa e far esplodere la pista ogni volta.",
      "Nel 2021 questa missione lo ha portato in tour con Marco Carola, ambasciatore mondiale della techno, nei club più prestigiosi del mondo come Ushuaïa a Ibiza e Soho Garden a Dubai, conquistando un posto nelle line-up di Music On, il party storico di Carola nato nel 2012, e ad aprile 2022 al Printworks di Londra.",
    ] },
  { slug: "jesse-calosso", day: "Season 25/26", name: "Jesse Calosso", img: "/img/dj/jesse-calosso.jpg", hero: "/img/dj/jesse-calosso-scheda.jpg", origin: "New York, USA", genres: ["House"],
    bio: [
      "Nato e cresciuto a New York, Jesse Calosso si è formato nell'underground senza compromessi della città prima di allargare il suo raggio al mondo. Oggi divide il suo tempo tra Miami e l'Europa ed è una certezza sui dancefloor internazionali, un DJ a cui si affida il momento clou della serata senza inseguire le mode.",
      "I suoi set si muovono con intenzione: cambi improvvisi di tempo, tensione che cresce e si scioglie, dischi rari che si scontrano con classici senza tempo, sempre guidati dal groove e mai prevedibili. Evita l'ovvio e fa scoprire ai ballerini dischi che non sapevano di amare.",
      "Ha suonato a Sunwaves, Coachella, Sonus, UNUM e Toffler Festival. Ibiza è casa: da Hï Ibiza con i Martinez Brothers a Music On al Pacha, fino a Paradise all'UNVRS e prima ancora a Circoloco al DC-10. Ha suonato back to back con i Martinez Brothers, Jean Pierre, Jamie Jones e Mason Collective, e in apertura a Marco Carola e Seth Troxler.",
      "Ha pubblicato su Cuttin' Headz, Hot Creations, Hottrax, V-House Sound, Tuskegee e altre etichette, da \"Do You Miss Brooklyn?\" a \"This Is 140\", \"Not Valid\" e \"Small Talk\". È il fondatore di Boogeyman, etichetta di culto al quinto anno che sta diventando una piattaforma creativa tra dischi, eventi e stile.",
    ] },
  { slug: "jean-pierre", day: "Season 25/26", name: "Jean Pierre", img: "/img/dj/jean-pierre.jpg", hero: "/img/dj/jean-pierre-scheda.jpg", origin: "New York, USA", genres: ["Deep house", "Techno"],
    bio: [
      "Se c'è una parola che descrive Jean Pierre è passione. Nato e cresciuto nel Queens, a New York, da oltre quindici anni vive e respira musica: che sia una deep house piena di emozione o una techno da grandi sale, cerca sempre dischi unici che trasformano i suoi set in viaggi musicali.",
      "Salito in fretta ai vertici del competitivo circuito dei club di New York, si è distinto soprattutto per le sue produzioni: dal debutto su Younan Music fino alle uscite su Cuttin' Headz, Desolat, Transmit Recordings, Waveform Recordings, Defected, Deeperfect Records e Terminator Records. I suoi dischi sono suonati da Marco Carola, The Martinez Brothers, Loco Dice, Jamie Jones, Victor Calderone, Luciano e Steve Lawler.",
      "Dai club di New York come Electric Zoo (palco Awakenings), Pacha, Cielo, Output, Marquee e Space Ibiza New York, è arrivato in Spagna, Germania, Venezuela, Ecuador, Colombia, Messico (BPM Festival) e Porto Rico (Movement Festival). Il suo sound unisce la New York in cui è cresciuto e le sue radici colombiane.",
      "Oggi lavora anche da Halcyon, il celebre negozio di dischi di Brooklyn, ed è uno dei selezionatori più apprezzati della sua generazione.",
    ] },
  { slug: "italobros", day: "Season 25/26", name: "ItaloBros", img: "/img/dj/italobros.jpg", hero: "/img/dj/italobros-scheda.jpg", origin: "Scalea, Italia", genres: ["Techno", "Deep"],
    bio: [
      "Gli ItaloBros nascono alla fine degli anni '80 in una piccola città del sud Italia, Scalea. DJ, produttori e remixer in continua evoluzione, affrontano il lavoro sempre con nuovi obiettivi e stimoli, sperimentando nuovi percorsi e reinventando nuovi linguaggi.",
      "Non amano mettere limiti né chiudere il loro sound in un solo genere, ma le radici sono chiare: l'old school, influenzata dai suoni techno e deep più contemporanei. Eclettici, creativi e curiosi, portano in pista passione e adrenalina.",
      "La loro forza, la loro carica e la loro determinazione vengono dalla passione, che dà loro il coraggio di essere sperimentali e diversi.",
    ] },
  { slug: "dzeko", day: "Season 25/26", name: "Dzeko", img: "/img/dj/dzeko.jpg", hero: "/img/dj/dzeko-scheda.jpg", origin: "Toronto, Canada", genres: ["Elettronica", "Pop", "Hip-hop"],
    bio: [
      "Dzeko è un DJ e produttore di Toronto, multiplatino, con oltre 5 miliardi di stream nel mondo. Noto per far incontrare la musica elettronica con il pop e l'hip-hop, ha collaborato con artisti come Tiësto, Post Malone, Lil Yachty, Swae Lee, Keith Urban, Loud Luxury, Kool & The Gang, Roy Woods e John Denver.",
      "La sua hit \"Jackie Chan\" con Tiësto, Post Malone e Preme ha superato 1,2 miliardi di stream e visualizzazioni ed è stata certificata più volte platino in tutto il mondo.",
      "Dopo anni di tour, festival e classifiche, Dzeko lancia ora un nuovo progetto da DJ, GATANO: l'inizio di un nuovo capitolo creativo e di una nuova direzione sonora nella musica elettronica.",
    ] },
  { slug: "mario-bianco-gabriele-del-prete", day: "Season 25/26", name: "Mario Bianco & Gabriele Del Prete", img: "/img/dj/mario-bianco-gabriele-del-prete.jpg", hero: "/img/dj/mario-bianco-gabriele-del-prete-scheda.jpg", origin: "Napoli", genres: ["House"],
    bio: [
      "Mario Bianco e Gabriele Del Prete suonano insieme come Putacaso e portano i loro set in tutta Italia, partendo da Napoli.",
      "Mario Bianco ha iniziato nel 2000 come DJ, produttore e remixer, immerso nella house e nella musica elettronica. La passione e l'entusiasmo lo hanno portato a fondare la sua etichetta, Roundans. Noto per unire i classici senza tempo a suoni nuovi, ha collaborato con etichette come Poker Flat Recordings, Do Not Sit On The Furniture e Stereo Productions, e in vent'anni ha diviso il palco con alcuni dei nomi più influenti della house.",
      "Gabriele Del Prete è in consolle da quando aveva 14 anni: set ad alta energia, mixaggi puliti e selezioni sempre in evoluzione. Attratto dalla house per la sua profondità emotiva, è diventato una figura di riferimento della scena. È anche il CEO di Club Tropicana, punto fermo delle feste d'estate nel sud Italia, con uno show ogni weekend.",
    ] },
];

/* ---------- Aggiornamenti ----------
   Ogni articolo: apertura (lead + intro), poi sezioni con titolo gigante,
   foto grande, etichetta, testo e due foto affiancate.
*/
const NEWS = [
  {
    id: "apriamo-il-5", tag: "Aggiornamento", date: "15 novembre 2026", title: "Il ritorno, a 1.500 metri", img: "/img/news/roccaraso-innevato.jpg",
    credits: [
      { by: "Pattiolivieri", lic: "CC BY-SA 4.0", licUrl: "https://creativecommons.org/licenses/by-sa/4.0/", src: "https://commons.wikimedia.org/wiki/File:Roccaraso_innevato.jpg" },
      { by: "Luca Margheriti", lic: "CC BY-SA 3.0", licUrl: "https://creativecommons.org/licenses/by-sa/3.0/", src: "https://commons.wikimedia.org/wiki/File:Pista_di_AREMOGNA_-_panoramio.jpg" },
    ],
    lead: "Sabato 5 dicembre lo Chalet Valentino riapre la stagione. Quattro giorni di ponte, dalle 12 alle 19, con la neve come scenografia e la luce del pomeriggio come unico dress code.",
    intro: [
      "Chi c'era lo sa: alle Gravare l'après-ski non è l'intervallo tra una discesa e l'altra, è la ragione per cui si sale. Giacche tecniche aperte sul maglione, occhiali a specchio alzati sulla fronte, un bicchiere in mano e il sole basso che taglia la valle.",
      "Quest'anno il sipario si alza con il ponte dell'Immacolata. Due appunti, prima di caricare gli sci in macchina.",
    ],
    sections: [
      { h: "Quattro giorni, quattro atmosfere", img: "/img/news/due-sciatori.jpg", label: "5 · 6 · 7 · 8 dicembre",
        text: [
          "Il sabato è il debutto, carico di attesa. La domenica e il lunedì trovano il loro ritmo, più rilassato e più lungo. Martedì 8 chiude il ponte con la giornata dell'Immacolata, l'ultima luce prima della pausa.",
          "Quattro date, quattro line-up diverse. I nomi si svelano uno alla volta nel calendario: chi ha già scelto il suo giorno lo tenga d'occhio, le novità arrivano lì per prime.",
        ] },
      { h: "L'ingresso", img: "/img/news/pista-aremogna.jpg", label: "Tickets",
        text: [
          "Un evento per ogni data su Eventbrite, il link è nella pagina del giorno. Per chi preferisce un punto fermo sulla piattaforma, il tavolo si chiede dal modulo: rispondiamo noi, di persona.",
        ] },
    ],
  },
  {
    id: "tavoli", tag: "Aggiornamento", date: "20 novembre 2026", title: "Il tavolo, istruzioni d'uso", img: "/img/news/seggiovia.jpg",
    lead: "La piattaforma è pensata per ballare: i tavoli sono pochi, disposti ai bordi, e nei giorni più attesi spariscono in fretta. Ecco come assicurarsene uno.",
    intro: [
      "Un tavolo, quassù, è un indirizzo. Il posto dove lasciare caschi e giacche, dove il gruppo si ritrova quando scende dalle piste a orari diversi, dove tornare tra un set e l'altro con le guance rosse di freddo.",
    ],
    sections: [
      { h: "Quando prenotare", img: "/img/news/gran-sasso-salita.jpg", label: "Weekend e feste",
        text: [
          "Sabati, ponte dell'Immacolata, Capodanno ed Epifania: sono le giornate in cui la piattaforma si riempie già nel primo pomeriggio. Per i gruppi numerosi la prenotazione è la differenza tra un pomeriggio comodo e uno passato con lo zaino in spalla.",
          "Nei giorni feriali di gennaio c'è più respiro, ma una richiesta prima di salire resta un gesto elegante.",
        ] },
      { h: "Come si chiede", img: "/img/news/berretto-neve.jpg", label: "Il modulo",
        text: [
          "Dalla pagina Tavoli: nome, contatti, quante persone siete, fino a quindici, e la data scelta dal calendario, dove si accendono solo i giorni in cui si balla.",
          "Rispondiamo noi con la disponibilità. Se la data che sognavi è al completo, ti proponiamo la più vicina.",
        ] },
      { h: "Il giorno stesso", img: "/img/news/terranera-monte-rotondo.jpg", label: "All'arrivo",
        text: [
          "All'ingresso basta il nome della prenotazione: ti accompagniamo al tavolo. Se i piani cambiano, avvisaci, e il posto passa a qualcun altro.",
          "Un consiglio da habitué: il tavolo è la base, ma la festa è in pista. Non restare seduto troppo a lungo.",
        ] },
    ],
  },
  {
    id: "meteo-weekend", tag: "Tips", date: "Ogni venerdì", title: "Il cielo, prima di tutto", img: "/img/news/abruzzo-dall-alto.jpg",
    credits: [
      { by: "Luca Margheriti", lic: "CC BY-SA 3.0", licUrl: "https://creativecommons.org/licenses/by-sa/3.0/", src: "https://commons.wikimedia.org/wiki/File:67037_Roccaraso_AQ,_Italy_-_panoramio_-_Luca_Margheriti_(1).jpg" },
      { by: "corinasdavide", lic: "CC BY 3.0", licUrl: "https://creativecommons.org/licenses/by/3.0/", src: "https://commons.wikimedia.org/wiki/File:Roccaraso_tra_neve_e_nuvole_(DC)_-_panoramio.jpg" },
    ],
    lead: "A 1.500 metri il tempo cambia in un'ora, e con lui il guardaroba. Le previsioni delle Gravare, ora per ora, sono nella pagina Come arrivare: guardale prima di partire.",
    intro: [
      "Il sole di mezzogiorno è un seduttore. Sulla piattaforma si sta in maglione finché la luce batte sulla neve, poi il sole scivola dietro la cresta e la temperatura precipita. Sapere cosa aspettarsi è la prima forma di stile.",
    ],
    sections: [
      { h: "Dove guardarlo", img: "/img/news/roccaraso-panorama.jpg", label: "Come arrivare",
        text: [
          "Nella pagina Come arrivare, alla voce \"Che tempo fa lassù?\", trovi le prossime ventiquattro ore, i sette giorni e i dettagli che contano: alba e tramonto, vento, zero termico.",
          "Nella pagina di ogni data compaiono anche le previsioni di quel giorno, a partire da sedici giorni prima.",
        ] },
      { h: "L'ora da segnare", img: "/img/news/abruzzo-vetta-tramonto.jpg", label: "Tramonto",
        text: [
          "A dicembre il sole lascia la piattaforma intorno alle 16:40. È l'istante in cui si accendono le luci e il pomeriggio cambia pelle.",
          "Nelle giornate limpide conviene esserci un po' prima: l'ora blu sulla neve non si racconta, si guarda.",
        ] },
      { h: "Se il tempo cambia idea", img: "/img/news/roccaraso-neve-nuvole.jpg", label: "Cambi di programma",
        text: [
          "Se vento o neve ci chiedono di spostare gli orari, lo scriviamo qui nelle News e sui social la mattina stessa.",
          "Le previsioni orarie sono le più affidabili: consultale prima di partire, non la sera prima.",
        ] },
    ],
  },
  {
    id: "cosa-portare", tag: "Tips", date: "Stagione 2026/27", title: "Vestirsi a -6°", img: "/img/news/pelliccia-neve.jpg",
    lead: "Si balla all'aperto dalle 12 alle 19. A mezzogiorno il sole è generoso, dopo il tramonto no: la differenza la fa quello che indossi.",
    intro: [
      "Niente guardaroba al caldo, niente pista al coperto: Disco Pleasure è un après-ski vero, sulla neve. Qualche regola di stile da chi qui ci passa l'intera stagione.",
    ],
    sections: [
      { h: "L'arte degli strati", img: "/img/news/giacca-maschera.jpg", label: "La regola base",
        text: [
          "Tre strati leggeri valgono più di un piumino importante: un intimo tecnico, uno strato caldo, una giacca che fermi il vento. Al sole se ne toglie uno, al tramonto si rimette, ed è già una coreografia.",
          "Il cotone a contatto con la pelle è l'unico vero errore: si bagna ballando e gela appena ci si ferma.",
        ] },
      { h: "Mani, testa, occhi", img: "/img/news/guanti-neve.jpg", label: "I dettagli",
        text: [
          "Dopo le 16 guanti e berretto smettono di essere un accessorio. Gli occhiali da sole servono fino all'ultimo raggio: la neve riflette più di quanto si creda, e una lente a specchio fa il resto.",
          "Un paio di guanti sottili in tasca è il segreto per usare il telefono senza sacrificare le dita.",
        ] },
      { h: "Ai piedi", img: "/img/news/scarponi-neve.jpg", label: "Scarponi o scarpe",
        text: [
          "Chi arriva dalla pista resta negli scarponi, ed è in ottima compagnia. Chi sale a piedi scelga una suola che tenga sulla neve battuta: al tramonto il fondo ghiaccia.",
          "Calze di lana o tecniche, sempre. I piedi freddi sono il primo motivo per cui si lascia la festa troppo presto.",
        ] },
    ],
  },
  {
    id: "dal-26", tag: "Aggiornamento", date: "1 dicembre 2026", title: "Sedici giorni, senza pause", img: "/img/news/campo-imperatore-snowboard.jpg",
    credits: [
      { by: "essetefano", lic: "CC BY 3.0", licUrl: "https://creativecommons.org/licenses/by/3.0/", src: "https://commons.wikimedia.org/wiki/File:67037_Roccaraso_AQ,_Italy_-_panoramio_(1).jpg" },
      { by: "Luca Margheriti", lic: "CC BY-SA 3.0", licUrl: "https://creativecommons.org/licenses/by-sa/3.0/", src: "https://commons.wikimedia.org/wiki/File:67037_Aremogna_AQ,_Italy_-_panoramio.jpg" },
    ],
    lead: "Dal 26 dicembre al 10 gennaio non ci fermiamo: Disco Pleasure è aperto ogni giorno, dalle 12 alle 19. Poi tutti i weekend, fino al 14 marzo.",
    intro: [
      "Le vacanze di Natale sono il momento in cui Roccaraso si riempie di luci, di voci e di sci appoggiati alle staccionate. Noi ci siamo ogni giorno, con line-up che cambiano da un pomeriggio all'altro.",
    ],
    sections: [
      { h: "Le feste", img: "/img/news/rivisondoli-neve.jpg", label: "26 dicembre - 10 gennaio",
        text: [
          "Si comincia a Santo Stefano e si prosegue fino a domenica 10 gennaio. Sedici pomeriggi, stessi orari, sempre all'aperto.",
          "Nel calendario ogni data ha il suo evento su Eventbrite e il modulo per il tavolo.",
        ] },
      { h: "Le date da cerchiare", img: "/img/news/roccaraso-neve-paese.jpg", label: "31 dicembre, 1 e 6 gennaio",
        text: [
          "San Silvestro, Capodanno ed Epifania sono le giornate più attese della stagione. Programmi e line-up escono qui e sui social non appena sono definiti.",
          "Sono anche le prime a esaurire i tavoli: chi viene in gruppo si muova con anticipo.",
        ] },
      { h: "Poi i weekend", img: "/img/news/aremogna-sole.jpg", label: "Fino al 14 marzo",
        text: [
          "Dopo il 10 gennaio ci si ritrova il sabato e la domenica, da metà gennaio a tutto febbraio, fino al closing del 13 e 14 marzo.",
          "Ogni weekend ha il suo programma: lo trovi nel calendario, mese per mese.",
        ] },
    ],
  },
];
const newsById = (id) => NEWS.find((n) => n.id === id) || NEWS[0];

/* ---------- Home ---------- */
const HOME = {
  residencies: [
    // Mazzo "Season 26-27": i quattro momenti della stagione
    { day: "5 – 8 dicembre", title: "Opening", img: "/img/season/opening.jpg", href: evUrl("2026-12-05") },
    { day: "26 dicembre – 10 gennaio", title: "Le feste", img: "/img/season/feste.jpg", href: "/apres-ski?dal=2026-12-26&al=2027-01-10" },
    { day: "31 dicembre · 1 gennaio", title: "Capodanno", img: "/img/season/capodanno.jpg", href: evUrl("2026-12-31") },
    { day: "Fino al 14 marzo", title: "Weekend", img: "/img/season/weekend.jpg", href: "/apres-ski?dal=2027-01-16&al=2027-03-14" },
  ],
  residents: ARTISTS,
  // Tickets: le date con un nome, ognuna col suo link Eventbrite (in home la card mostra il sigillo, non la foto)
  tickets: [
    ["2026-12-05", "/img/recap-flash.jpg"],
    ["2026-12-08", "/img/lun-8.jpg"],
    ["2026-12-26", "/img/palla.jpg"],
    ["2026-12-31", "/img/interno.jpg"],
    ["2027-01-01", "/img/recap-orablu.jpg"],
    ["2027-01-06", "/img/stage.jpg"],
    ["2027-03-14", "/img/ven-5.jpg"],
  ].map(([id, img]) => { const e = EVENTS.find((x) => x.id === id); return { day: e.short, title: e.title, img, href: e.url, tickets: TICKETS[id] || null }; }),
};


/* ---------- Meteo (Open-Meteo, gratuito, senza chiave) ---------- */
// Punto delle previsioni: Roccaraso, zona Gravare. Sposta lat/lon sul punto esatto dello chalet se serve.
const METEO = { lat: 41.835, lon: 14.055, alt: 1567, place: "Roccaraso · Gravare" };
