/* =========================================================
   CONTENUTI DI DISCO PLEASURE — modifica qui.
   Per usare una foto vera: img: "img/nomefile.jpg".
   ========================================================= */

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
    // Righe in fondo alla card (prezzi, orari d'ingresso...)
    entry: ["Info ingresso in arrivo", "Tavoli su prenotazione"],
  };
});
const eventById = (id) => EVENTS.find((e) => e.id === id) || EVENTS[0];

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

/* ---------- Aggiornamenti ---------- */
const NEWS = [
  {
    id: "apriamo-il-5", tag: "Aggiornamento", date: "15 novembre 2026", title: "Apriamo il 5 dicembre", img: "img/manifesto.jpg",
    body: [
      "Sabato 5 dicembre si riaccende la piattaforma davanti allo Chalet Valentino. Quattro date di fila per il ponte dell'Immacolata: 5, 6, 7 e 8 dicembre, dalle 12 alle 19, all'aperto.",
      "Quest'anno al posto del gazebo c'è un arco di truss di sei metri: il DJ sotto, la gente davanti, le montagne dietro.",
      "Dal 26 dicembre al 10 gennaio siamo aperti tutti i giorni, poi ogni weekend fino al 14 marzo.",
    ],
  },
  {
    id: "tavoli", tag: "Aggiornamento", date: "20 novembre 2026", title: "Tavoli: prenota prima di salire", img: "img/bancone.jpg",
    body: [
      "Nel weekend i tavoli finiscono presto. Se vuoi essere sicuro di avere il tuo posto, prenota prima di salire in quota.",
      "Scrivici o chiamaci dalla pagina Tavoli: ti confermiamo disponibilità e dettagli per la data che scegli.",
    ],
  },
  {
    id: "meteo-weekend", tag: "Tips", date: "Ogni venerdì", title: "Meteo weekend: sole, poi neve", img: "img/montagne-giorno.jpg",
    body: [
      "Ogni venerdì pubblichiamo il meteo del weekend su Roccaraso: temperatura, vento e neve prevista, così sai cosa aspettarti sulla piattaforma.",
      "Alle 16:40 il sole passa dietro la cresta: da lì in poi la temperatura scende in fretta.",
    ],
  },
  {
    id: "cosa-portare", tag: "Tips", date: "Stagione 2026/27", title: "Cosa portare a −6°", img: "img/guanti.jpg",
    body: [
      "Si balla all'aperto, sulla neve. Guanti, cappello e occhiali da sole sono la base; dopo il tramonto serve uno strato in più.",
      "Scarpe con suola che tiene sulla neve battuta: la piattaforma è all'aperto per tutta la giornata.",
    ],
  },
  {
    id: "dal-26", tag: "Aggiornamento", date: "1 dicembre 2026", title: "Dal 26: tutti i giorni", img: "img/pista-notte.jpg",
    body: [
      "Per le feste non ci fermiamo: dal 26 dicembre al 10 gennaio Disco Pleasure è aperto tutti i giorni, dalle 12 alle 19.",
      "Dopo il 10 gennaio ci vediamo ogni sabato e domenica, fino al 14 marzo.",
    ],
  },
  {
    id: "come-arrivare", tag: "Tips", date: "Stagione 2026/27", title: "Come arrivare allo chalet", img: "img/chalet-piazzale.jpg",
    body: [
      "Lo Chalet Valentino si trova a valle delle Gravare, a Roccaraso: si arriva direttamente con gli sci. Informazioni su accesso e parcheggio in arrivo.",
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
