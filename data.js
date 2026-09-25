/* =========================================================
   CONTENUTI DI DISCO PLEASURE — modifica qui.
   Per usare una foto vera: img: "img/nomefile.jpg".
   ========================================================= */

/* ---------- Biglietti e tavoli ---------- */
const CONTATTI = {
  // Numero WhatsApp per i tavoli: prefisso internazionale senza "+" e senza spazi (es. 393331234567)
  whatsapp: "390000000000",
  // Link Eventbrite generale (se una data non ha il suo link, si usa questo)
  eventbrite: "https://www.eventbrite.it/",
  email: "tavoli@discopleasure.it",
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
  "2026-12-05": "Apriamo il 5",
  "2026-12-08": "Immacolata",
  "2026-12-26": "Santo Stefano",
  "2026-12-31": "San Silvestro",
  "2027-01-01": "Capodanno",
  "2027-01-06": "Epifania",
  "2027-03-14": "Ultima data",
};

// Foto per le card (a rotazione)
const EVENT_IMGS = ["img/opening.jpg", "img/ven-5.jpg", "img/sab-6.jpg", "img/dom-7.jpg", "img/lun-8.jpg", "img/ponte.jpg", "img/feste.jpg", "img/epifania.jpg", "img/calendario.jpg"];

const GIORNI = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const GIORNI_BREVI = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MESI_BREVI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

const pad2 = (n) => String(n).padStart(2, "0");
const EVENTS = SEASON_DATES.map(([y, m, d], i) => {
  const date = new Date(y, m - 1, d);
  const id = `${y}-${pad2(m)}-${pad2(d)}`;
  const phase = m === 12 && d <= 8 ? "Il ponte" : (y === 2026 || (m === 1 && d <= 10)) ? "Le feste" : "Weekend";
  return {
    id,
    date,
    month: m,
    phase,
    title: SPECIAL_TITLES[id] || "Disco Pleasure",
    weekday: GIORNI[date.getDay()],
    short: `${GIORNI_BREVI[date.getDay()]} ${d}.${m}`,
    long: `${GIORNI[date.getDay()]} ${d} ${MESI[m - 1]} ${y}`,
    card: `${GIORNI_BREVI[date.getDay()]}, ${d} ${MESI_BREVI[m - 1]} ${y}`,
    tag: SPECIAL_TITLES[id] || null,
    hours: "12:00 – 19:00",
    img: EVENT_IMGS[i % EVENT_IMGS.length],
    // Line-up per area: sostituisci con i nomi. Per un b2b scrivi "Nome A b2b Nome B".
    lineup: [
      { area: "Sotto l'arco", names: ["Resident", "Guest da annunciare"] },
      { area: "Dal tramonto", names: ["Resident b2b Resident"] },
    ],
    // Link Eventbrite: si imposta nella lista TICKETS più sotto
    tickets: null,
    // Righe in fondo alla card (prezzi, orari d'ingresso...)
    entry: ["Info ingresso in arrivo", "Tavoli su prenotazione"],
  };
});
// Link Eventbrite per singola data: "2026-12-05": "https://www.eventbrite.it/e/...",
const TICKETS = {
};
EVENTS.forEach((e) => { e.tickets = TICKETS[e.id] || CONTATTI.eventbrite; });
const eventById = (id) => EVENTS.find((e) => e.id === id) || EVENTS[0];
const tableMsg = (e) => `Ciao! Vorrei prenotare un tavolo a Disco Pleasure per ${e.long.toLowerCase()}.`;

/* ---------- Artisti (segnaposto) ---------- */
const ARTISTS = [
  { name: "Resident 01", day: "Sabato", img: "img/recap-piazzale.jpg" },
  { name: "Resident 02", day: "Domenica", img: "img/recap-flash.jpg" },
  { name: "Resident 03", day: "Il ponte", img: "img/stage-led.jpg" },
  { name: "Resident 04", day: "Le feste", img: "img/feste.jpg" },
  { name: "Guest 01", day: "Sabato", img: "img/opening.jpg" },
  { name: "Guest 02", day: "Domenica", img: "img/recap-orablu.jpg" },
  { name: "Guest 03", day: "Capodanno", img: "img/recap-brindisi.jpg" },
  { name: "Guest 04", day: "Epifania", img: "img/recap-terrazza.jpg" },
  { name: "Guest 05", day: "Sabato", img: "img/recap-alto.jpg" },
  { name: "Guest 06", day: "Domenica", img: "img/palla.jpg" },
  { name: "Guest 07", day: "Le feste", img: "img/interno.jpg" },
  { name: "Guest 08", day: "Weekend", img: "img/palla-travi.jpg" },
];

/* ---------- Aggiornamenti ----------
   Ogni articolo: apertura (lead + intro), poi sezioni con titolo gigante,
   foto grande, etichetta, testo e due foto affiancate.
*/
const NEWS = [
  {
    id: "apriamo-il-5", tag: "Aggiornamento", date: "15 novembre 2026", title: "Apriamo il 5 dicembre", img: "img/manifesto.jpg",
    lead: "Sabato 5 dicembre si riaccende la piattaforma dello Chalet Valentino. Nuovo stage, nuovo segno, stessa voglia di restare fino al buio.",
    intro: [
      "Ci siamo. Dopo un'estate passata a ripensare tutto, dal marchio al palco, Disco Pleasure riapre con il ponte dell'Immacolata: quattro giorni di fila, da sabato 5 a martedì 8 dicembre, dalle 12 alle 19, all'aperto.",
      "È il nostro modo di aprire la stagione: prima la neve, poi il sole che scende dietro la cresta, poi la musica che sale. Qui sotto trovi cosa cambia quest'anno e come organizzarti.",
    ],
    sections: [
      { h: "Il ponte", img: "img/ven-5.jpg", label: "5 · 6 · 7 · 8 dicembre",
        text: ["Quattro date consecutive per partire a pieno ritmo. Si comincia sabato 5 con l'apertura, si prosegue domenica 6 e lunedì 7, e si chiude martedì 8, giorno dell'Immacolata.",
               "Ogni giornata ha la sua line-up, che pubblichiamo nel calendario appena è confermata. Tieni d'occhio la pagina della data che ti interessa."],
        pair: ["img/opening.jpg", "img/sab-6.jpg"] },
      { h: "Sotto l'arco", img: "img/stage.jpg", label: "Il nuovo stage",
        text: ["La novità più grande si vede da lontano: al posto del gazebo c'è un arco di truss di sei metri, con due torri audio e una fila di luci calde che si accendono al tramonto.",
               "Il DJ è sotto l'arco, la gente davanti, le montagne dietro. La piattaforma resta libera: niente tavoli in mezzo, solo spazio per ballare."],
        pair: ["img/stage-led.jpg", "img/dom-7.jpg"] },
      { h: "Come funziona", img: "img/timbro.jpg", label: "Biglietti, tavoli, ingresso",
        text: ["I biglietti si prendono online su Eventbrite, dalla pagina di ogni data. Per i tavoli basta scriverci su WhatsApp: ti rispondiamo con la disponibilità.",
               "All'ingresso ti timbriamo la mano con il sigillo di Disco Pleasure. Serve per rientrare, e il giorno dopo è ancora lì a ricordarti com'è andata."],
        pair: ["img/tshirt.jpg", "img/manifesto-27.jpg"] },
    ],
  },
  {
    id: "tavoli", tag: "Aggiornamento", date: "20 novembre 2026", title: "Tavoli: prenota prima di salire", img: "img/bancone.jpg",
    lead: "Nei weekend e durante le feste i tavoli finiscono presto. Prenotare prima di salire in quota è il modo più semplice per non restare senza.",
    intro: [
      "La piattaforma di Disco Pleasure è fatta per ballare, e per questo i tavoli sono pochi e ai margini. Chi vuole un punto fisso per il gruppo, dove appoggiare giacche e bicchieri, fa bene a organizzarsi per tempo.",
      "Ecco perché conviene prenotare e come farlo in un minuto.",
    ],
    sections: [
      { h: "Perché prenotare", img: "img/recap-terrazza.jpg", label: "Pochi posti, tanta gente",
        text: ["Nelle giornate di punta, i sabati, il ponte dell'Immacolata e le feste, la piattaforma si riempie già nel primo pomeriggio. Un tavolo prenotato ti evita di girare con lo zaino in spalla cercando un angolo libero.",
               "È anche il modo più comodo per i gruppi numerosi: un posto dove ritrovarsi quando ognuno scende dalle piste a orari diversi."],
        pair: ["img/recap-brindisi.jpg", "img/recap-piazzale.jpg"] },
      { h: "Come si prenota", img: "img/interno.jpg", label: "Su WhatsApp",
        text: ["Scrivici su WhatsApp indicando la data, il numero di persone e un nome di riferimento. Dalla pagina Tavoli, o dal bottone in ogni card del calendario, il messaggio parte già compilato con la data giusta.",
               "Ti rispondiamo con la disponibilità e i dettagli. Se la data è piena, ti proponiamo le alternative più vicine."],
        pair: ["img/bancone.jpg", "img/palla-travi.jpg"] },
      { h: "Il giorno stesso", img: "img/calendario.jpg", label: "Quando arrivi",
        text: ["Presentati all'ingresso con il nome della prenotazione: ti accompagniamo al tavolo. Se cambiano i piani, avvisaci su WhatsApp così possiamo liberare il posto per qualcun altro.",
               "Il tavolo è tuo per la giornata, ma la festa è sulla piattaforma: non restare seduto troppo a lungo."],
        pair: ["img/opening.jpg", "img/lun-8.jpg"] },
    ],
  },
  {
    id: "meteo-weekend", tag: "Tips", date: "Ogni venerdì", title: "Il meteo del weekend, in tempo reale", img: "img/montagne-giorno.jpg",
    lead: "Sulla home trovi il meteo di Roccaraso aggiornato in tempo reale: ora per ora, i prossimi sette giorni e tutti i dettagli per decidere quando salire.",
    intro: [
      "A 1500 metri il tempo cambia in fretta, e sapere cosa aspettarsi fa la differenza tra una giornata perfetta e una passata a battere i denti. Per questo abbiamo messo il meteo direttamente sul sito, con i dati della zona delle Gravare.",
    ],
    sections: [
      { h: "Sul sito", img: "img/montagne-tramonto.jpg", label: "Ora per ora, 7 giorni, dettagli",
        text: ["Nella sezione Meteo della home trovi la temperatura attuale e quella percepita, il vento, la neve al suolo e l'orario del tramonto. Sotto, tre schede: le prossime 24 ore, i prossimi sette giorni e i dettagli come alba, indice UV, raffiche e zero termico.",
               "Nella pagina di ogni data compaiono anche le previsioni per quel giorno, a partire da 16 giorni prima."],
        pair: ["img/recap-alto.jpg", "img/pista-notte.jpg"] },
      { h: "Il tramonto", img: "img/lun-8.jpg", label: "Il momento da non perdere",
        text: ["In pieno inverno il sole passa dietro la cresta intorno alle 16:40. Da lì la temperatura scende di colpo, le luci dell'arco si accendono e comincia la parte più bella del pomeriggio.",
               "Se il cielo è sereno, arriva un po' prima: l'ora blu dopo il tramonto vale il viaggio."],
        pair: ["img/recap-orablu.jpg", "img/chalet-piazzale.jpg"] },
      { h: "Se cambia qualcosa", img: "img/pista-notte.jpg", label: "Aggiornamenti",
        text: ["Se il meteo dovesse costringerci a cambiare programma, lo scriviamo qui negli Aggiornamenti e sui nostri social il prima possibile.",
               "Nel dubbio, controlla la mattina stessa: le previsioni orarie sono le più affidabili."],
        pair: ["img/montagne-giorno.jpg", "img/recap-piazzale.jpg"] },
    ],
  },
  {
    id: "cosa-portare", tag: "Tips", date: "Stagione 2026/27", title: "Cosa portare a −6°", img: "img/guanti.jpg",
    lead: "Si balla all'aperto, sulla neve, fino a quando fa buio. Con il giusto equipaggiamento il freddo diventa parte del divertimento.",
    intro: [
      "Disco Pleasure è un après-ski all'aperto: niente guardaroba al caldo, niente pista al coperto. Si sta fuori dalle 12 alle 19, e dopo il tramonto le temperature scendono facilmente sotto lo zero. Ecco cosa non dimenticare.",
    ],
    sections: [
      { h: "A strati", img: "img/recap-flash.jpg", label: "La regola base",
        text: ["Meglio tre strati leggeri che uno pesante: un intimo tecnico, uno strato caldo e una giacca che ripari dal vento. Così puoi toglierne uno quando si balla al sole e rimetterlo quando il sole scende.",
               "Evita il cotone a contatto con la pelle: trattiene il sudore e ti raffredda appena ti fermi."],
        pair: ["img/recap-piazzale.jpg", "img/recap-terrazza.jpg"] },
      { h: "Mani, testa, occhi", img: "img/guanti.jpg", label: "I dettagli che contano",
        text: ["Guanti e cappello sono indispensabili dopo le 16. Gli occhiali da sole servono fino al tramonto: la neve riflette la luce più di quanto sembri.",
               "Un paio di guanti sottili in tasca è il trucco per usare il telefono senza congelarsi le dita."],
        pair: ["img/recap-brindisi.jpg", "img/recap-orablu.jpg"] },
      { h: "Ai piedi", img: "img/dom-7.jpg", label: "Scarpe e scarponi",
        text: ["Se arrivi dalle piste, puoi restare con gli scarponi. Se sali a piedi, scegli scarpe con una suola che tenga sulla neve battuta: la piattaforma è all'aperto e al tramonto il fondo può ghiacciare.",
               "Calze di lana o tecniche: i piedi freddi sono il primo motivo per cui si va via prima."],
        pair: ["img/recap-alto.jpg", "img/ven-5.jpg"] },
    ],
  },
  {
    id: "dal-26", tag: "Aggiornamento", date: "1 dicembre 2026", title: "Dal 26 dicembre, tutti i giorni", img: "img/pista-notte.jpg",
    lead: "Per le feste non ci fermiamo: dal 26 dicembre al 10 gennaio Disco Pleasure è aperto ogni giorno, dalle 12 alle 19.",
    intro: [
      "Le vacanze di Natale sono il periodo in cui Roccaraso si riempie di più, e noi ci saremo tutti i giorni. Sedici giornate di fila, da Santo Stefano fino a domenica 10 gennaio, poi i weekend fino a metà marzo.",
    ],
    sections: [
      { h: "Le feste", img: "img/feste.jpg", label: "26 dicembre – 10 gennaio",
        text: ["Si parte sabato 26 dicembre, Santo Stefano, e si va avanti ogni giorno fino a domenica 10 gennaio. Stessi orari, dalle 12 alle 19, e line-up diverse di giorno in giorno.",
               "Nel calendario trovi tutte le date, con i bottoni per i biglietti e per prenotare un tavolo."],
        pair: ["img/recap-piazzale.jpg", "img/opening.jpg"] },
      { h: "Le date speciali", img: "img/recap-brindisi.jpg", label: "San Silvestro, Capodanno, Epifania",
        text: ["Giovedì 31 dicembre, venerdì 1 gennaio e mercoledì 6 gennaio sono le giornate più attese delle feste. Programma e line-up li annunciamo qui e sui social appena confermati.",
               "Sono anche le date in cui i tavoli finiscono per primi: se vuoi esserci con il tuo gruppo, prenota con anticipo."],
        pair: ["img/recap-orablu.jpg", "img/palla.jpg"] },
      { h: "Poi i weekend", img: "img/epifania.jpg", label: "Fino al 14 marzo",
        text: ["Dopo il 10 gennaio ci vediamo ogni sabato e domenica: 16 e 17 gennaio, 23 e 24, 30 e 31, poi tutti i weekend di febbraio e i primi due di marzo, fino a domenica 14.",
               "Ogni weekend ha il suo programma: lo trovi nel calendario, filtrato per mese."],
        pair: ["img/sab-6.jpg", "img/calendario.jpg"] },
    ],
  },
  {
    id: "come-arrivare", tag: "Tips", date: "Stagione 2026/27", title: "Come arrivare allo chalet", img: "img/chalet-piazzale.jpg",
    lead: "Lo Chalet Valentino si trova a valle delle Gravare, a Roccaraso. Il modo più bello per arrivarci è con gli sci ai piedi.",
    intro: [
      "Disco Pleasure si tiene sulla piattaforma davanti allo Chalet Valentino, proprio dove finiscono le piste delle Gravare. Ecco come arrivare e come organizzare il rientro.",
    ],
    sections: [
      { h: "Con gli sci", img: "img/dom-7.jpg", label: "Dalle piste",
        text: ["Se sei già in pista, basta scendere lungo le Gravare: lo chalet è lì in fondo, e la musica ti guida nell'ultimo tratto. Sganci gli attacchi e sei già sulla piattaforma.",
               "È il modo in cui arriva la maggior parte delle persone, ed è il motivo per cui apriamo a mezzogiorno."],
        pair: ["img/recap-alto.jpg", "img/ven-5.jpg"] },
      { h: "Senza sci", img: "img/chalet-piazzale.jpg", label: "A piedi o in auto",
        text: ["Stiamo raccogliendo tutte le indicazioni pratiche per chi arriva senza sci: accessi, parcheggi e percorsi a piedi. Le pubblichiamo qui appena sono confermate per la stagione.",
               "Nel frattempo, se hai dubbi, scrivici su WhatsApp: ti rispondiamo noi."],
        pair: ["img/lun-8.jpg", "img/recap-orablu.jpg"] },
      { h: "Il rientro", img: "img/pista-notte.jpg", label: "Dopo le 19",
        text: ["La festa finisce alle 19, quando è già buio. Organizza il rientro prima di salire, soprattutto se sei in gruppo, e tieni a portata di mano una luce e uno strato caldo in più.",
               "Se hai bevuto, lascia guidare qualcun altro: vogliamo rivederti il weekend dopo."],
        pair: ["img/palla.jpg", "img/chalet-piazzale.jpg"] },
    ],
  },
];
const newsById = (id) => NEWS.find((n) => n.id === id) || NEWS[0];

/* ---------- Home ---------- */
const HOME = {
  special: [
    { date: "Sab 5.12 · dalle 12", title: "Apriamo il 5", img: "img/opening.jpg", href: "evento.html?d=2026-12-05" },
    { date: "5 · 6 · 7 · 8 dicembre", title: "Il ponte dell'Immacolata", img: "img/ponte.jpg", href: "evento.html?d=2026-12-06" },
    { date: "Dal 26.12 al 10.01", title: "Tutti i giorni", img: "img/feste.jpg", href: "calendario.html?m=12" },
    { date: "Fino al 14.03", title: "Ogni weekend", img: "img/epifania.jpg", href: "calendario.html?m=1" },
  ],
  residencies: [
    { day: "Sabato 5.12", title: "Apriamo sotto l'arco", img: "img/ven-5.jpg", href: "evento.html?d=2026-12-05" },
    { day: "Domenica 6.12", title: "Heat, dal tramonto", img: "img/sab-6.jpg", href: "evento.html?d=2026-12-06" },
    { day: "Lunedì 7.12", title: "Neve di giorno, pista al tramonto", img: "img/dom-7.jpg", href: "evento.html?d=2026-12-07" },
    { day: "Martedì 8.12", title: "L'ora blu, alle 19", img: "img/lun-8.jpg", href: "evento.html?d=2026-12-08" },
  ],
  residents: [
    // Sostituisci "Resident" con il nome del DJ di ogni giornata
    { day: "Sabato 5.12", name: "Resident", img: "img/recap-piazzale.jpg" },
    { day: "Domenica 6.12", name: "Resident", img: "img/recap-flash.jpg" },
    { day: "Lunedì 7.12", name: "Resident", img: "img/recap-orablu.jpg" },
    { day: "Martedì 8.12", name: "Resident", img: "img/recap-alto.jpg" },
    { day: "Sabato 26.12", name: "Resident", img: "img/recap-terrazza.jpg" },
    { day: "Giovedì 31.12", name: "Resident", img: "img/recap-brindisi.jpg" },
  ],
};

/* ---------- Menu: prossime date ---------- */
const MENU_RAIL = [
  { day: "Sab 5.12", title: "Apriamo il 5", img: "img/opening.jpg", href: "evento.html?d=2026-12-05" },
  { day: "Dom 6.12", title: "Il ponte", img: "img/sab-6.jpg", href: "evento.html?d=2026-12-06" },
  { day: "Lun 7.12", title: "Il ponte", img: "img/dom-7.jpg", href: "evento.html?d=2026-12-07" },
  { day: "Mar 8.12", title: "Immacolata", img: "img/lun-8.jpg", href: "evento.html?d=2026-12-08" },
  { day: "Sab 26.12", title: "Santo Stefano", img: "img/feste.jpg", href: "evento.html?d=2026-12-26" },
  { day: "Gio 31.12", title: "San Silvestro", img: "img/recap-brindisi.jpg", href: "evento.html?d=2026-12-31" },
  { day: "Ven 1.1", title: "Capodanno", img: "img/recap-orablu.jpg", href: "evento.html?d=2027-01-01" },
];

/* ---------- Meteo (Open-Meteo, gratuito, senza chiave) ---------- */
// Punto delle previsioni: Roccaraso, zona Gravare. Sposta lat/lon sul punto esatto dello chalet se serve.
const METEO = { lat: 41.835, lon: 14.055, place: "Roccaraso · Gravare" };
